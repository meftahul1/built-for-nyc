-- Plaid-backed income & balance verification: connected items, balance
-- snapshots, and Bank Income verification results.

create extension if not exists pgcrypto;

-- One row per app user who has completed Plaid's income-verification Link
-- flow at least once. Bank Income is fetched by Plaid's user_id (from
-- /user/create), not by item access_token, so that's what's stored here.
create table plaid_users (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id),
  plaid_user_id text not null,
  created_at timestamptz not null default now()
);

-- One row per linked bank connection (a Plaid "Item"). Needed for
-- /accounts/balance/get, which is scoped by item access_token.
create table plaid_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id),
  item_id text not null unique,
  access_token text not null,
  institution_id text,
  institution_name text,
  status text not null default 'active', -- active | error | revoked
  created_at timestamptz not null default now()
);

-- Point-in-time balance reads, one row per account per /plaid/verify call.
create table balance_snapshots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id),
  plaid_item_id uuid not null references plaid_items(id) on delete cascade,
  account_id text not null,
  account_name text,
  account_subtype text,
  available_balance numeric,
  current_balance numeric,
  iso_currency_code text,
  checked_at timestamptz not null default now()
);

-- One row per Bank Income request/result for a user.
create table income_verifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id),
  plaid_users_id uuid not null references plaid_users(id) on delete cascade,
  status text not null default 'pending', -- pending | processing | success | failed
  bank_income_id text,
  predicted_monthly_income numeric,
  total_amount numeric,
  income_streams jsonb not null default '[]'::jsonb,
  error_message text,
  requested_at timestamptz not null default now(),
  completed_at timestamptz
);

create index income_verifications_user_id_requested_at_idx
  on income_verifications (user_id, requested_at desc);
create index balance_snapshots_user_id_checked_at_idx
  on balance_snapshots (user_id, checked_at desc);

alter table plaid_users enable row level security;
alter table plaid_items enable row level security;
alter table balance_snapshots enable row level security;
alter table income_verifications enable row level security;

-- Reads are scoped to the caller; all writes go through the backend's
-- service-role client (service_role bypasses RLS, so no write policies
-- are defined here on purpose).
create policy "read own plaid_users" on plaid_users
  for select using (auth.uid() = user_id);
create policy "read own plaid_items" on plaid_items
  for select using (auth.uid() = user_id);
create policy "read own balance_snapshots" on balance_snapshots
  for select using (auth.uid() = user_id);
create policy "read own income_verifications" on income_verifications
  for select using (auth.uid() = user_id);

-- Extra hardening: even under RLS, never let anon/authenticated select the
-- access token itself — only the backend's service-role client should.
revoke select (access_token) on plaid_items from anon, authenticated;
