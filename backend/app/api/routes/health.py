from fastapi import APIRouter, HTTPException

from app.core.supabase_client import get_supabase_admin_client

router = APIRouter(tags=["health"])


@router.get("/health")
def health() -> dict:
    return {"status": "ok"}


@router.get("/health/supabase")
def health_supabase() -> dict:
    """Confirms the backend can reach Supabase with the configured service role key."""
    try:
        client = get_supabase_admin_client()
        client.auth.admin.list_users(page=1, per_page=1)
    except Exception as exc:
        raise HTTPException(status_code=503, detail=f"Supabase unreachable: {exc}") from exc
    return {"status": "ok"}
