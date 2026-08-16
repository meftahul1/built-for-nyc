from fastapi import APIRouter, HTTPException
from supabase_auth.errors import AuthApiError

from app.core.supabase_client import get_supabase_admin_client
from app.schemas.auth import SignupRequest, SignupResponse

router = APIRouter(prefix="/auth", tags=["auth"])

_DUPLICATE_EMAIL_CODES = {"email_exists", "user_already_exists", "identity_already_exists"}


@router.post("/signup", response_model=SignupResponse)
def signup(body: SignupRequest) -> SignupResponse:
    """Creates a Supabase auth user via the admin API, pre-confirmed.

    This project's default email sender is rate-limited to a handful of
    sends per hour, which makes the standard client-side
    supabase.auth.signUp() (which emails a confirmation link) unreliable
    for demo/dev use. Creating the user server-side with email_confirm=True
    stores it directly in auth.users and skips the email round-trip
    entirely; the client then signs in immediately with the same password.
    """
    admin = get_supabase_admin_client()
    try:
        result = admin.auth.admin.create_user(
            {
                "email": body.email,
                "password": body.password,
                "email_confirm": True,
                "user_metadata": {"role": body.role},
            }
        )
    except AuthApiError as exc:
        if exc.code in _DUPLICATE_EMAIL_CODES:
            raise HTTPException(
                status_code=409, detail="An account with this email already exists."
            ) from exc
        raise HTTPException(status_code=400, detail=exc.message) from exc

    user = result.user
    return SignupResponse(id=user.id, email=user.email, role=body.role)
