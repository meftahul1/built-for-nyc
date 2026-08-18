from functools import lru_cache

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.core.config import get_settings

bearer_scheme = HTTPBearer(auto_error=False)


@lru_cache
def get_jwk_client() -> jwt.PyJWKClient:
    """Supabase signs access tokens with a project-specific asymmetric key
    (ES256) exposed via its JWKS endpoint — not the legacy shared secret."""
    settings = get_settings()
    return jwt.PyJWKClient(f"{settings.supabase_url}/auth/v1/.well-known/jwks.json")


async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
) -> dict:
    """Verifies a Supabase-issued access token and returns its claims.

    Raises 401 if the token is missing, expired, or invalid.
    """
    if credentials is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing bearer token")

    try:
        signing_key = get_jwk_client().get_signing_key_from_jwt(credentials.credentials)
        payload = jwt.decode(
            credentials.credentials,
            signing_key.key,
            algorithms=["ES256"],
            audience="authenticated",
        )
    except jwt.PyJWTError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token") from exc

    return payload


def get_user_role(user: dict) -> str:
    """Returns the user's role, defaulting to "tenant" when unset.

    Mirrors the frontend's fallback (AuthContext.tsx: `user_metadata?.role ?? "tenant"`).
    Accounts are only guaranteed to have `user_metadata.role` set if they went
    through this app's own /auth/signup flow; accounts created directly in
    Supabase (e.g. manually seeded test users) can have no role in the JWT at
    all, even if their `profiles.role` row says otherwise. Without this
    fallback the backend would 403 users the frontend already treats — and
    displays UI for — as tenants.
    """
    return user.get("user_metadata", {}).get("role") or "tenant"
