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

Access tokens are verified against Supabase's JWKS endpoint (`{SUPABASE_URL}/auth/v1/.well-known/jwks.json`), so no separate JWT secret is needed.

And from the Plaid dashboard → Team Settings → Keys:

- `PLAID_CLIENT_ID`
- `PLAID_SECRET`
- `PLAID_ENV` — `sandbox` or `production`

Apply `supabase/migrations/0001_plaid_income.sql` to your Supabase project
before using the `/plaid` routes (SQL editor, or `supabase db push` if you're
using the Supabase CLI) — it creates `plaid_users`, `plaid_items`,
`balance_snapshots`, and `income_verifications`.

## Run

```bash
uvicorn app.main:app --reload
```

- `GET /api/v1/health` — liveness check
- `GET /api/v1/health/supabase` — confirms the service-role key can reach Supabase

Plaid income & balance verification (all require a Supabase bearer token
except the webhook, which is Plaid-signature verified):

- `POST /api/v1/plaid/link-token` — create a Link token for the Bank Income product
- `POST /api/v1/plaid/exchange-token` — exchange Link's `public_token`, store the connection
- `POST /api/v1/plaid/verify` — fetch balance + request a Bank Income report
- `GET /api/v1/plaid/verify/status` — poll the latest balance and income result
- `POST /api/v1/plaid/webhook` — Plaid's async Bank Income completion callback
- `DELETE /api/v1/plaid/item` — unlink the bank account

## Structure

```
app/
  main.py               # FastAPI app, CORS, router registration
  core/
    config.py           # env-driven settings (pydantic-settings)
    supabase_client.py  # anon / service-role / user-scoped Supabase clients
    plaid_client.py      # server-side Plaid API client
    deps.py             # get_current_user — verifies Supabase JWTs
  api/routes/            # route modules
  services/               # business logic (plaid_service.py)
  schemas/                # pydantic request/response models
supabase/migrations/       # SQL applied directly to the Supabase project
```

- `get_supabase_client()` — anon key, respects RLS
- `get_supabase_admin_client()` — service role, bypasses RLS, backend-only
- `get_supabase_client_as_user(token)` — anon key scoped to a specific user's JWT
- `get_current_user` (FastAPI dependency) — verifies a bearer token issued by
  Supabase Auth and returns its claims
