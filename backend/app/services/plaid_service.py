"""Business logic for the Plaid-backed income & balance verification flow.

See supabase/migrations/0001_plaid_income.sql for the tables this reads and
writes. Every write goes through the service-role Supabase client passed in
by the route layer — the Plaid access_token never leaves this module.
"""

import hashlib
import hmac
import json
import time
from datetime import date, datetime, timezone

import jwt
from fastapi import HTTPException
from plaid.exceptions import ApiException
from plaid.model.accounts_balance_get_request import AccountsBalanceGetRequest
from plaid.model.country_code import CountryCode
from plaid.model.credit_bank_income_get_request import CreditBankIncomeGetRequest
from plaid.model.income_verification_source_type import IncomeVerificationSourceType
from plaid.model.item_public_token_exchange_request import ItemPublicTokenExchangeRequest
from plaid.model.item_remove_request import ItemRemoveRequest
from plaid.model.link_token_create_request import LinkTokenCreateRequest
from plaid.model.link_token_create_request_income_verification import (
    LinkTokenCreateRequestIncomeVerification,
)
from plaid.model.link_token_create_request_income_verification_bank_income import (
    LinkTokenCreateRequestIncomeVerificationBankIncome,
)
from plaid.model.link_token_create_request_user import LinkTokenCreateRequestUser
from plaid.model.products import Products
from plaid.model.user_create_request import UserCreateRequest
from plaid.model.webhook_verification_key_get_request import WebhookVerificationKeyGetRequest
from supabase import Client

from app.core.plaid_client import get_plaid_client

_BANK_INCOME_DAYS_REQUESTED = 90
_WEBHOOK_MAX_AGE_SECONDS = 5 * 60
_FAILED_WEBHOOK_CODES = {"BANK_INCOME_GENERATION_FAILED"}
_REFETCH_WEBHOOK_CODES = {"BANK_INCOME_COMPLETE", "BANK_INCOME_REFRESH_COMPLETE"}


def _plaid_error_detail(exc: ApiException) -> str:
    try:
        return json.loads(exc.body).get("error_message", str(exc))
    except Exception:
        return str(exc)


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _months_between(start: date, end: date) -> float:
    days = max((end - start).days, 1)
    return max(days / 30.44, 1 / 30.44)


# --- Plaid user (required for Bank Income, which is scoped by Plaid user_id) -


def ensure_plaid_user(db: Client, user_id: str) -> dict:
    """Returns this app user's plaid_users row, creating it via
    /user/create on first use. Plaid's user_id (not a secret — a stable
    identifier) is what scopes the later Bank Income request."""
    existing = db.table("plaid_users").select("*").eq("user_id", user_id).limit(1).execute()
    if existing.data:
        return existing.data[0]

    client = get_plaid_client()
    try:
        response = client.user_create(UserCreateRequest(client_user_id=user_id))
    except ApiException as exc:
        raise HTTPException(
            status_code=502, detail=f"Plaid user_create failed: {_plaid_error_detail(exc)}"
        ) from exc

    row = {"user_id": user_id, "plaid_user_id": response.user_id}
    result = db.table("plaid_users").insert(row).execute()
    return result.data[0]


# --- Link token ------------------------------------------------------------


def create_link_token(db: Client, user_id: str, user_email: str | None) -> dict:
    plaid_user = ensure_plaid_user(db, user_id)
    client = get_plaid_client()
    request = LinkTokenCreateRequest(
        client_name="Tenant Income Verification",
        language="en",
        country_codes=[CountryCode("US")],
        user=LinkTokenCreateRequestUser(client_user_id=user_id, email_address=user_email),
        user_id=plaid_user["plaid_user_id"],
        products=[Products("income_verification")],
        income_verification=LinkTokenCreateRequestIncomeVerification(
            income_source_types=[IncomeVerificationSourceType("bank")],
            bank_income=LinkTokenCreateRequestIncomeVerificationBankIncome(
                days_requested=_BANK_INCOME_DAYS_REQUESTED
            ),
        ),
    )
    try:
        response = client.link_token_create(request)
    except ApiException as exc:
        raise HTTPException(
            status_code=502, detail=f"Plaid link_token_create failed: {_plaid_error_detail(exc)}"
        ) from exc

    return {"link_token": response.link_token, "expiration": response.expiration}


# --- Token exchange ----------------------------------------------------------


def exchange_public_token(
    db: Client,
    user_id: str,
    public_token: str,
    institution_id: str | None,
    institution_name: str | None,
) -> dict:
    client = get_plaid_client()
    try:
        response = client.item_public_token_exchange(
            ItemPublicTokenExchangeRequest(public_token=public_token)
        )
    except ApiException as exc:
        raise HTTPException(
            status_code=502,
            detail=f"Plaid item_public_token_exchange failed: {_plaid_error_detail(exc)}",
        ) from exc

    row = {
        "user_id": user_id,
        "item_id": response.item_id,
        "access_token": response.access_token,
        "institution_id": institution_id,
        "institution_name": institution_name,
        "status": "active",
    }
    result = db.table("plaid_items").upsert(row, on_conflict="item_id").execute()
    return result.data[0]


# --- Balance -----------------------------------------------------------------


def _fetch_balances(db: Client, user_id: str, item_row: dict) -> list[dict]:
    client = get_plaid_client()
    try:
        response = client.accounts_balance_get(
            AccountsBalanceGetRequest(access_token=item_row["access_token"])
        )
    except ApiException as exc:
        raise HTTPException(
            status_code=502, detail=f"Plaid accounts_balance_get failed: {_plaid_error_detail(exc)}"
        ) from exc

    checked_at = _now_iso()
    rows = [
        {
            "user_id": user_id,
            "plaid_item_id": item_row["id"],
            "account_id": account.account_id,
            "account_name": account.name,
            "account_subtype": str(account.subtype) if account.subtype else None,
            "available_balance": account.balances.available,
            "current_balance": account.balances.current,
            "iso_currency_code": account.balances.iso_currency_code,
            "checked_at": checked_at,
        }
        for account in response.accounts
    ]
    if rows:
        db.table("balance_snapshots").insert(rows).execute()
    return rows


# --- Income --------------------------------------------------------------


def _parse_bank_income(response) -> tuple[dict, list[dict]]:
    # response.bank_income is a list — one report per Link session; a single
    # Link session covers all institutions linked in it, so [0] is the report.
    bank_income = response.bank_income[0]
    summary = bank_income.bank_income_summary
    months = _months_between(summary.start_date, summary.end_date)
    total = float(summary.total_amount)

    streams: list[dict] = []
    for item in bank_income.items:
        for source in item.bank_income_sources:
            source_months = _months_between(source.start_date, source.end_date)
            streams.append(
                {
                    "income_source_id": source.income_source_id,
                    "description": source.income_description,
                    "category": str(source.income_category) if source.income_category else None,
                    "pay_frequency": str(source.pay_frequency) if source.pay_frequency else None,
                    "total_amount": float(source.total_amount),
                    "monthly_amount": round(float(source.total_amount) / source_months, 2),
                }
            )

    return {
        "bank_income_id": bank_income.bank_income_id,
        "predicted_monthly_income": round(total / months, 2),
        "total_amount": total,
    }, streams


def _fetch_income(db: Client, user_id: str, plaid_user_row: dict) -> dict:
    client = get_plaid_client()
    verification_row = (
        db.table("income_verifications")
        .insert({"user_id": user_id, "plaid_users_id": plaid_user_row["id"], "status": "processing"})
        .execute()
        .data[0]
    )

    try:
        response = client.credit_bank_income_get(
            CreditBankIncomeGetRequest(user_id=plaid_user_row["plaid_user_id"])
        )
    except ApiException as exc:
        detail = _plaid_error_detail(exc)
        update = {"status": "failed", "error_message": detail, "completed_at": _now_iso()}
        db.table("income_verifications").update(update).eq("id", verification_row["id"]).execute()
        raise HTTPException(
            status_code=502, detail=f"Plaid credit_bank_income_get failed: {detail}"
        ) from exc

    summary, streams = _parse_bank_income(response)
    update = {
        "status": "success",
        "bank_income_id": summary["bank_income_id"],
        "predicted_monthly_income": summary["predicted_monthly_income"],
        "total_amount": summary["total_amount"],
        "income_streams": streams,
        "completed_at": _now_iso(),
    }
    db.table("income_verifications").update(update).eq("id", verification_row["id"]).execute()
    return {**verification_row, **update}


def run_verification(db: Client, user_id: str) -> dict:
    item_res = (
        db.table("plaid_items")
        .select("*")
        .eq("user_id", user_id)
        .eq("status", "active")
        .order("created_at", desc=True)
        .limit(1)
        .execute()
    )
    if not item_res.data:
        raise HTTPException(
            status_code=404, detail="No linked bank account found. Complete Plaid Link first."
        )
    item_row = item_res.data[0]

    plaid_user_res = db.table("plaid_users").select("*").eq("user_id", user_id).limit(1).execute()
    if not plaid_user_res.data:
        raise HTTPException(
            status_code=404, detail="No Plaid user profile found. Complete Plaid Link first."
        )
    plaid_user_row = plaid_user_res.data[0]

    balances = _fetch_balances(db, user_id, item_row)
    income = _fetch_income(db, user_id, plaid_user_row)
    return {"balances": balances, "income": income}


def get_verification_status(db: Client, user_id: str) -> dict:
    item_res = (
        db.table("plaid_items")
        .select("id, institution_name, status, created_at")
        .eq("user_id", user_id)
        .order("created_at", desc=True)
        .limit(1)
        .execute()
    )
    item_row = item_res.data[0] if item_res.data else None

    balances: list[dict] = []
    if item_row:
        balances_res = (
            db.table("balance_snapshots")
            .select("*")
            .eq("plaid_item_id", item_row["id"])
            .order("checked_at", desc=True)
            .limit(20)
            .execute()
        )
        balances = balances_res.data

    income_res = (
        db.table("income_verifications")
        .select("*")
        .eq("user_id", user_id)
        .order("requested_at", desc=True)
        .limit(1)
        .execute()
    )
    income_row = income_res.data[0] if income_res.data else None

    return {"item": item_row, "balances": balances, "income": income_row}


def remove_item(db: Client, user_id: str) -> None:
    item_res = db.table("plaid_items").select("*").eq("user_id", user_id).eq("status", "active").execute()
    client = get_plaid_client()
    for item_row in item_res.data:
        try:
            client.item_remove(ItemRemoveRequest(access_token=item_row["access_token"]))
        except ApiException:
            pass  # already revoked on Plaid's side — still clean up our record
        db.table("plaid_items").update({"status": "revoked"}).eq("id", item_row["id"]).execute()


# --- Webhook -----------------------------------------------------------------


def verify_webhook(raw_body: bytes, verification_header: str | None) -> dict:
    """Validates a Plaid webhook's Plaid-Verification JWT (ES256, JWK fetched
    from Plaid) and its body hash, per Plaid's webhook verification spec."""
    if not verification_header:
        raise HTTPException(status_code=401, detail="Missing Plaid-Verification header")

    try:
        unverified_header = jwt.get_unverified_header(verification_header)
    except jwt.PyJWTError as exc:
        raise HTTPException(status_code=401, detail="Malformed webhook signature") from exc

    key_id = unverified_header.get("kid")
    if not key_id:
        raise HTTPException(status_code=401, detail="Webhook signature missing key id")

    client = get_plaid_client()
    try:
        key_response = client.webhook_verification_key_get(
            WebhookVerificationKeyGetRequest(key_id=key_id)
        )
    except ApiException as exc:
        raise HTTPException(
            status_code=502,
            detail=f"Could not fetch webhook verification key: {_plaid_error_detail(exc)}",
        ) from exc

    public_key = jwt.algorithms.ECAlgorithm.from_jwk(json.dumps(key_response.key.to_dict()))

    try:
        payload = jwt.decode(verification_header, key=public_key, algorithms=["ES256"])
    except jwt.PyJWTError as exc:
        raise HTTPException(status_code=401, detail="Invalid webhook signature") from exc

    if time.time() - payload["iat"] > _WEBHOOK_MAX_AGE_SECONDS:
        raise HTTPException(status_code=401, detail="Webhook signature too old")

    expected_hash = hashlib.sha256(raw_body).hexdigest()
    if not hmac.compare_digest(expected_hash, payload.get("request_body_sha256", "")):
        raise HTTPException(status_code=401, detail="Webhook body does not match signature")

    return json.loads(raw_body)


def handle_webhook(db: Client, payload: dict) -> None:
    if payload.get("webhook_type") != "BANK_INCOME":
        return

    webhook_code = payload.get("webhook_code")
    plaid_user_id = payload.get("user_id")
    if not plaid_user_id:
        return

    plaid_user_res = (
        db.table("plaid_users").select("*").eq("plaid_user_id", plaid_user_id).limit(1).execute()
    )
    if not plaid_user_res.data:
        return
    plaid_user_row = plaid_user_res.data[0]

    if webhook_code in _FAILED_WEBHOOK_CODES:
        update = {
            "status": "failed",
            "error_message": "Plaid reported an income generation failure",
            "completed_at": _now_iso(),
        }
        db.table("income_verifications").update(update).eq(
            "plaid_users_id", plaid_user_row["id"]
        ).eq("status", "processing").execute()
        return

    if webhook_code in _REFETCH_WEBHOOK_CODES:
        _fetch_income(db, plaid_user_row["user_id"], plaid_user_row)
