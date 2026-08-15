from functools import lru_cache

from supabase import Client, create_client

from app.core.config import get_settings


@lru_cache
def get_supabase_client() -> Client:
    """Anon-key client. Respects Row Level Security — use for requests
    that should be scoped by the caller's own permissions."""
    settings = get_settings()
    return create_client(settings.supabase_url, settings.supabase_anon_key)


@lru_cache
def get_supabase_admin_client() -> Client:
    """Service-role client. Bypasses Row Level Security — server-side only,
    never expose this client or its key to a frontend/browser context."""
    settings = get_settings()
    return create_client(settings.supabase_url, settings.supabase_service_role_key)


def get_supabase_client_as_user(access_token: str) -> Client:
    """Anon-key client scoped to a specific end user's Supabase auth JWT,
    so RLS policies keyed on auth.uid() apply as that user."""
    client = get_supabase_client()
    client.postgrest.auth(access_token)
    return client
