from fastapi import APIRouter, Depends, Request

from app.core.deps import get_current_user
from app.core.supabase_client import get_supabase_admin_client
from app.schemas.identity import (
    IdentitySessionRequest,
    IdentitySessionResponse,
    IdentityStatusResponse,
    WebhookAck,
)
from app.services import identity_service

router = APIRouter(prefix="/identity", tags=["identity"])


@router.post("/session", response_model=IdentitySessionResponse)
def create_session(
    body: IdentitySessionRequest, user: dict = Depends(get_current_user)
) -> IdentitySessionResponse:
    """Creates a Stripe Identity hosted VerificationSession for the caller and
    returns its URL — redirect the browser there to start the document scan."""
    db = get_supabase_admin_client()
    result = identity_service.create_verification_session(
        db, user_id=user["sub"], user_email=user.get("email"), return_url=body.return_url
    )
    return IdentitySessionResponse(**result)


@router.get("/status", response_model=IdentityStatusResponse)
def verify_status(user: dict = Depends(get_current_user)) -> IdentityStatusResponse:
    """Returns the caller's latest identity verification attempt, refreshing
    live from Stripe if it hasn't reached a terminal state yet."""
    db = get_supabase_admin_client()
    result = identity_service.get_verification_status(db, user_id=user["sub"])
    return IdentityStatusResponse(**result)


@router.post("/webhook", response_model=WebhookAck)
async def webhook(request: Request) -> WebhookAck:
    """Receives Stripe's async Identity verification status updates. Verifies
    the Stripe-Signature header before trusting the payload."""
    raw_body = await request.body()
    db = get_supabase_admin_client()
    identity_service.handle_webhook(db, raw_body, request.headers.get("Stripe-Signature"))
    return WebhookAck(received=True)
