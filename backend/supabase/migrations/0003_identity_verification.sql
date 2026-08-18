-- Stripe Identity verification sessions, one row per attempt.
create table identity_verifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id),
  session_id text not null unique,
  status text not null default 'requires_input', -- requires_input | processing | verified | canceled
  last_error_code text,
  last_error_reason text,
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index identity_verifications_user_id_created_at_idx
  on identity_verifications (user_id, created_at desc);

alter table identity_verifications enable row level security;

-- Reads are scoped to the caller; all writes go through the backend's
-- service-role client (service_role bypasses RLS, so no write policies
-- are defined here on purpose).
create policy "read own identity_verifications" on identity_verifications
  for select using (auth.uid() = user_id);
