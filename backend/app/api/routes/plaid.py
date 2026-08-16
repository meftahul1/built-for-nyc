from fastapi import APIRouter, Depends, Request

from app.core.deps import get_current_user
from app.core.supabase_client import get_supabase_admin_client
from app.schemas.plaid import (
    ExchangeTokenRequest,
    ExchangeTokenResponse,
    LinkTokenResponse,
    PlaidItemOut,
    VerifyStatusResponse,
    VerifyTriggerResponse,
    WebhookAck,
)
from app.services import plaid_service

router = APIRouter(prefix="/plaid", tags=["plaid"])


@router.post("/link-token", response_model=LinkTokenResponse)
def create_link_token(user: dict = Depends(get_current_user)) -> LinkTokenResponse:
    """Creates a Plaid Link token configured for the Bank Income product,
    scoped to the caller."""
    db = get_supabase_admin_client()
    result = plaid_service.create_link_token(db, user_id=user["sub"], user_email=user.get("email"))
    return LinkTokenResponse(**result)


@router.post("/exchange-token", response_model=ExchangeTokenResponse)
def exchange_token(
    body: ExchangeTokenRequest, user: dict = Depends(get_current_user)
) -> ExchangeTokenResponse:
    """Exchanges the public_token returned by Plaid Link for an access token
    and persists the connection. The access token is never returned here."""
    db = get_supabase_admin_client()
    item = plaid_service.exchange_public_token(
        db,
        user_id=user["sub"],
        public_token=body.public_token,
        institution_id=body.institution_id,
        institution_name=body.institution_name,
    )
    return ExchangeTokenResponse(item=PlaidItemOut(**item))


@router.post("/verify", response_model=VerifyTriggerResponse)
def verify(user: dict = Depends(get_current_user)) -> VerifyTriggerResponse:
    """Fetches current balance and requests a Bank Income verification for
    the caller's most recently linked account."""
    db = get_supabase_admin_client()
    result = plaid_service.run_verification(db, user_id=user["sub"])
    return VerifyTriggerResponse(**result)


@router.get("/verify/status", response_model=VerifyStatusResponse)
def verify_status(user: dict = Depends(get_current_user)) -> VerifyStatusResponse:
    """Returns the caller's latest linked item, balance snapshots, and
    income verification result — for polling after /verify or a webhook."""
    db = get_supabase_admin_client()
    result = plaid_service.get_verification_status(db, user_id=user["sub"])
    return VerifyStatusResponse(**result)


@router.delete("/item")
def delete_item(user: dict = Depends(get_current_user)) -> dict:
    """Unlinks the caller's bank account via Plaid's /item/remove."""
    db = get_supabase_admin_client()
    plaid_service.remove_item(db, user_id=user["sub"])
    return {"status": "removed"}


@router.post("/webhook", response_model=WebhookAck)
async def webhook(request: Request) -> WebhookAck:
    """Receives Plaid's async Bank Income status updates. Verifies the
    Plaid-Verification signature before trusting the payload."""
    raw_body = await request.body()
    payload = plaid_service.verify_webhook(raw_body, request.headers.get("Plaid-Verification"))
    db = get_supabase_admin_client()
    plaid_service.handle_webhook(db, payload)
    return WebhookAck(received=True)
