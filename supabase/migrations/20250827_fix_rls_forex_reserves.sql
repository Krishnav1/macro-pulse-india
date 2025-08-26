-- Fix RLS recursion for forex_reserves_weekly by introducing a SECURITY DEFINER helper
-- and updating policies to use it instead of querying user_roles directly in the policy

-- 1) Create helper function that bypasses RLS and checks admin role safely
create schema if not exists auth;

create or replace function auth.is_admin(uid uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles ur
    where ur.user_id = uid and ur.role = 'admin'
  );
$$;

-- Ensure only minimal privileges are exposed
revoke all on function auth.is_admin(uuid) from public;
grant execute on function auth.is_admin(uuid) to authenticated;

-- 2) Replace forex_reserves_weekly RLS policies to use auth.is_admin(auth.uid())
-- Drop existing policies if they exist
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'forex_reserves_weekly'
      AND policyname = 'Allow admin insert access to forex reserves data'
  ) THEN
    EXECUTE 'DROP POLICY "Allow admin insert access to forex reserves data" ON public.forex_reserves_weekly';
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'forex_reserves_weekly'
      AND policyname = 'Allow admin update access to forex reserves data'
  ) THEN
    EXECUTE 'DROP POLICY "Allow admin update access to forex reserves data" ON public.forex_reserves_weekly';
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'forex_reserves_weekly'
      AND policyname = 'Allow admin delete access to forex reserves data'
  ) THEN
    EXECUTE 'DROP POLICY "Allow admin delete access to forex reserves data" ON public.forex_reserves_weekly';
  END IF;
END $$;

-- Recreate policies using the helper
create policy "Allow admin insert access to forex reserves data" on public.forex_reserves_weekly
  for insert
  with check (auth.is_admin(auth.uid()));

create policy "Allow admin update access to forex reserves data" on public.forex_reserves_weekly
  for update
  using (auth.is_admin(auth.uid()));

create policy "Allow admin delete access to forex reserves data" on public.forex_reserves_weekly
  for delete
  using (auth.is_admin(auth.uid()));
