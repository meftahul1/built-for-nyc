-- Extends the pre-existing `properties` table (already provisioned on this
-- Supabase project outside this repo's tracked migrations — see `profiles`,
-- `rental_applications`, `tenant_details`, `landlord_details`, `documents`,
-- `verifications`, `access_grants`, `audit_log`) with the listing detail
-- fields the frontend needs, and wires up profiles auto-provisioning so the
-- properties.landlord_id -> profiles.id FK always resolves.
--
-- `rent_amount` is the existing price column; the backend maps its `price`
-- field to/from it directly rather than adding a duplicate column.

alter table properties
  add column if not exists title text not null default '',
  add column if not exists city text not null default '',
  add column if not exists state text not null default '',
  add column if not exists bedrooms int not null default 0,
  add column if not exists bathrooms numeric not null default 0,
  add column if not exists sqft int not null default 0,
  add column if not exists description text not null default '',
  add column if not exists image_url text not null default '',
  add column if not exists landlord_name text not null default '',
  add column if not exists landlord_avatar text not null default '',
  add column if not exists landlord_rating numeric not null default 5.0,
  add column if not exists landlord_response_time text not null default 'Instant',
  add column if not exists verified_status text not null default 'verified',
  add column if not exists verified_features text[] not null default '{}',
  add column if not exists criteria jsonb not null default '{}'::jsonb;

-- Auto-provision a `profiles` row whenever a new Supabase auth user is
-- created, so FKs from properties/rental_applications/etc. to profiles.id
-- always resolve. Role comes from the same user_metadata.role the app
-- already sets at signup (see app/api/routes/auth.py).
create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, role, full_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'role', 'tenant')::public.user_role,
    new.raw_user_meta_data->>'full_name',
    new.email
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_auth_user();

-- Backfill profiles for auth users created before this trigger existed.
insert into public.profiles (id, role, full_name, email)
select
  u.id,
  coalesce(u.raw_user_meta_data->>'role', 'tenant')::public.user_role,
  u.raw_user_meta_data->>'full_name',
  u.email
from auth.users u
on conflict (id) do nothing;
