-- Ensure auth.is_admin() bypasses RLS even if FORCE RLS is enabled on user_roles
create schema if not exists auth;

create or replace function auth.is_admin(uid uuid)
returns boolean
language sql
security definer
set search_path = public
set row_security = off
as $$
  select exists (
    select 1 from public.user_roles ur
    where ur.user_id = uid and ur.role = 'admin'
  );
$$;

revoke all on function auth.is_admin(uuid) from public;
grant execute on function auth.is_admin(uuid) to authenticated;
