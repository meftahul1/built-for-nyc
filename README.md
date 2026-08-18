# Tenant Income Verification

A web app that lets landlords verify a prospective tenant's income and bank
balance without manually collecting pay stubs or bank statements. Tenants
securely connect their bank account via [Plaid](https://plaid.com), and the
app pulls a Bank Income report and account balance on their behalf; landlords
see a verified result instead of self-reported documents.

- **Landlords** create an account, list properties, and set tenant screening
  criteria (e.g. minimum income, minimum balance).
- **Tenants** create an account, link their bank via Plaid Link, and run
  verification — the backend requests a Plaid Bank Income report and balance
  snapshot and stores the result.
- **Auth & data** are handled by Supabase Auth; the FastAPI
  backend verifies Supabase-issued JWTs and talks to Plaid server-side.

## Demo

<video src="./demo/middleMan.mov" controls width="100%"></video>

*If the video player does not render in your browser, you can view the video file directly at [demo/middleMan.mov](./demo/middleMan.mov).*

## Stack

| Layer    | Tech                                                        |
| -------- | ------------------------------------------------------------ |
| Frontend | Next.js 16 (App Router), React 19, Tailwind CSS, `@supabase/supabase-js`, `react-plaid-link` |
| Backend  | FastAPI, `pydantic-settings`, `supabase-py`, `plaid-python`  |
| Database | Supabase (Postgres, Auth, RLS)                                |
| Bank data | Plaid (Link, Bank Income, Balance)                            |

## Project structure

```
backend/
  app/
    main.py               # FastAPI app, CORS, router registration
    core/
      config.py           # env-driven settings (pydantic-settings)
      supabase_client.py  # anon / service-role / user-scoped Supabase clients
      plaid_client.py     # server-side Plaid API client
      deps.py             # get_current_user — verifies Supabase JWTs
    api/routes/           # health, auth, plaid route modules
    services/             # business logic (plaid_service.py)
    schemas/              # pydantic request/response models
  supabase/migrations/    # SQL applied directly to the Supabase project
frontend/
  src/
    app/                  # Next.js routes (landlord, tenant, dashboard, verify, auth)
    components/           # shared UI components
    context/               # Auth / Property / Verification React contexts
    lib/                  # Supabase client, API client, checklist helpers
```

## Prerequisites

- Python 3.12 or 3.13 (3.14 currently lacks prebuilt wheels for some backend
  dependencies)
- Node.js 20+
- A [Supabase](https://supabase.com) project
- A [Plaid](https://dashboard.plaid.com) account (sandbox is fine for local dev)

## Setup

### 1. Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. From **Project Settings → API**, grab:
   - Project URL
   - `anon` public key
   - `service_role` secret key (server-only — never expose this to the client)
3. Apply the schema migration to your project — either paste
   `backend/supabase/migrations/0001_plaid_income.sql` into the Supabase SQL
   editor, or run `supabase db push` if you're using the Supabase CLI. This
   creates the `plaid_users`, `plaid_items`, `balance_snapshots`, and
   `income_verifications` tables.

### 2. Plaid

1. Create an account at [dashboard.plaid.com](https://dashboard.plaid.com).
2. From **Team Settings → Keys**, grab your `client_id` and `secret` for the
   environment you want to use (`sandbox` for local development).

### 3. Environment variables

**`backend/.env`** (copy `backend/.env.example` if present, otherwise create it):

```bash
SUPABASE_URL=https://<your-project>.supabase.co
SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>

PLAID_CLIENT_ID=<plaid-client-id>
PLAID_SECRET=<plaid-sandbox-secret>
PLAID_ENV=sandbox

CORS_ORIGINS=http://localhost:3000
```

Supabase access tokens are verified against the project's JWKS endpoint
(`{SUPABASE_URL}/auth/v1/.well-known/jwks.json`), so no separate JWT secret
is needed.

**`frontend/.env.local`** (copy `frontend/.env.local.example`):

```bash
NEXT_PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000/api/v1
```

Use the **same** Supabase project/URL for both files — the frontend signs
users in with Supabase Auth, and the backend verifies those same tokens.

## Running the app

Run the backend and frontend in two separate terminals.

### Backend

```bash
cd backend
python3.13 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

The API runs at `http://127.0.0.1:8000`. Sanity-check it with:

- `GET /api/v1/health` — liveness check
- `GET /api/v1/health/supabase` — confirms the service-role key can reach Supabase

Key endpoints under `/api/v1/plaid` (bearer token required, except the
webhook): `link-token`, `exchange-token`, `verify`, `verify/status`,
`webhook`, `item` (DELETE to unlink).

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The app runs at `http://localhost:3000`.

## Notes

- Never commit `.env` or `.env.local` files, or the Supabase service-role key.
- For local dev, use Plaid's `sandbox` environment and its test bank
  credentials — no real bank account is needed.
