"""Business logic for Stripe Identity-backed ID verification.

See supabase/migrations/0002_identity_verification.sql for the table this
reads and writes. Every write goes through the service-role Supabase client
passed in by the route layer.
"""

from datetime import datetime, timezone

from fastapi import HTTPException
from supabase import Client

from app.core.config import get_settings
from app.core.stripe_client import get_stripe

_TERMINAL_STATUSES = {"verified", "canceled"}


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _validate_return_url(return_url: str) -> None:
    settings = get_settings()
    if not any(return_url.startswith(origin) for origin in settings.cors_origin_list):
        raise HTTPException(status_code=400, detail="Invalid return_url")


# --- Session creation --------------------------------------------------------


def create_verification_session(db: Client, user_id: str, user_email: str | None, return_url: str) -> dict:
    _validate_return_url(return_url)
    stripe = get_stripe()

    params: dict = {
        "type": "document",
        "metadata": {"user_id": user_id},
        "return_url": return_url,
    }
    if user_email:
        params["provided_details"] = {"email": user_email}

    try:
        session = stripe.identity.VerificationSession.create(**params)
    except stripe.error.StripeError as exc:
        raise HTTPException(
            status_code=502,
            detail=f"Stripe VerificationSession create failed: {exc.user_message or str(exc)}",
        ) from exc

    row = {"user_id": user_id, "session_id": session.id, "status": session.status}
    db.table("identity_verifications").insert(row).execute()
    return {"url": session.url, "session_id": session.id, "status": session.status}


# --- Status ------------------------------------------------------------------


def _sync_session(db: Client, row: dict) -> dict:
    """Refreshes a stored session's status live from Stripe. Used for polling
    since local sandbox dev usually has no reachable webhook endpoint."""
    stripe = get_stripe()
    try:
        session = stripe.identity.VerificationSession.retrieve(row["session_id"])
    except stripe.error.StripeError as exc:
        raise HTTPException(
            status_code=502,
            detail=f"Stripe VerificationSession retrieve failed: {exc.user_message or str(exc)}",
        ) from exc

    update = {"status": session.status, "updated_at": _now_iso()}
    if session.last_error:
        update["last_error_code"] = session.last_error.code
        update["last_error_reason"] = session.last_error.reason
    if session.status == "verified" and not row.get("verified_at"):
        update["verified_at"] = _now_iso()

    result = db.table("identity_verifications").update(update).eq("id", row["id"]).execute()
    return result.data[0] if result.data else {**row, **update}


def get_verification_status(db: Client, user_id: str) -> dict:
    res = (
        db.table("identity_verifications")
        .select("*")
        .eq("user_id", user_id)
        .order("created_at", desc=True)
        .limit(1)
        .execute()
    )
    if not res.data:
        return {
            "status": "not_started",
            "session_id": None,
            "last_error_reason": None,
            "verified_at": None,
            "created_at": None,
        }

    row = res.data[0]
    if row["status"] not in _TERMINAL_STATUSES:
        row = _sync_session(db, row)
    return row


# --- Webhook -------------------------------------------------------------


def handle_webhook(db: Client, raw_body: bytes, sig_header: str | None) -> None:
    settings = get_settings()
    if not settings.stripe_webhook_secret:
        # Webhook not configured (e.g. local dev without `stripe listen`) —
        # clients fall back to polling GET /identity/status instead.
        return

    stripe = get_stripe()
    try:
        event = stripe.Webhook.construct_event(raw_body, sig_header, settings.stripe_webhook_secret)
    except (ValueError, stripe.error.SignatureVerificationError) as exc:
        raise HTTPException(status_code=401, detail="Invalid webhook signature") from exc

    if not event["type"].startswith("identity.verification_session."):
        return

    session = event["data"]["object"]
    update = {"status": session["status"], "updated_at": _now_iso()}
    last_error = session.get("last_error")
    if last_error:
        update["last_error_code"] = last_error.get("code")
        update["last_error_reason"] = last_error.get("reason")
    if session["status"] == "verified":
        update["verified_at"] = _now_iso()

    db.table("identity_verifications").update(update).eq("session_id", session["id"]).execute()
