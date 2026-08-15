# Backend

FastAPI + Supabase backend for tenant income verification. Plaid Bank Income
integration to follow.

## Setup

Requires Python 3.12 or 3.13 (3.14 currently lacks prebuilt wheels for some
dependencies).

```bash
python3.13 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env  # then fill in your Supabase values
```

`.env` needs, from Supabase dashboard → Project Settings → API:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server-only, bypasses RLS — never expose to a client)
- `SUPABASE_JWT_SECRET` (Project Settings → API → JWT Settings)

## Run

```bash
uvicorn app.main:app --reload
```

- `GET /api/v1/health` — liveness check
- `GET /api/v1/health/supabase` — confirms the service-role key can reach Supabase

## Structure

```
app/
  main.py               # FastAPI app, CORS, router registration
  core/
    config.py           # env-driven settings (pydantic-settings)
    supabase_client.py  # anon / service-role / user-scoped Supabase clients
    deps.py             # get_current_user — verifies Supabase JWTs
  api/routes/            # route modules
  schemas/                # pydantic request/response models
```

- `get_supabase_client()` — anon key, respects RLS
- `get_supabase_admin_client()` — service role, bypasses RLS, backend-only
- `get_supabase_client_as_user(token)` — anon key scoped to a specific user's JWT
- `get_current_user` (FastAPI dependency) — verifies a bearer token issued by
  Supabase Auth and returns its claims
