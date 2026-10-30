-- Keep administrator authorization stable when Supabase Auth recreates a
-- phone user with a new UUID. The allowlist is server-only and is never
-- exposed through the Data API.
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create table if not exists private.admin_phone_allowlist (
  phone text primary key check (phone ~ '^[0-9]{8,15}$'),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table private.admin_phone_allowlist enable row level security;
revoke all on table private.admin_phone_allowlist from public, anon, authenticated;

insert into private.admin_phone_allowlist (phone, active)
values ('966580229777', true)
on conflict (phone) do update set active = excluded.active;

create or replace function private.sync_admin_role_from_phone()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  normalized_phone text;
begin
  normalized_phone := regexp_replace(coalesce(new.phone, ''), '[^0-9]', '', 'g');

  if exists (
    select 1
    from private.admin_phone_allowlist allowlist
    where allowlist.phone = normalized_phone
      and allowlist.active
  ) then
    insert into public.user_roles (user_id, role)
    values (new.id, 'admin'::public.app_role)
    on conflict (user_id, role) do nothing;
  elsif tg_op = 'UPDATE' then
    delete from public.user_roles
    where user_id = new.id
      and role = 'admin'::public.app_role;
  end if;

  return new;
end;
$$;

revoke all on function private.sync_admin_role_from_phone() from public, anon, authenticated;

drop trigger if exists sync_admin_role_from_phone on auth.users;
create trigger sync_admin_role_from_phone
after insert or update of phone on auth.users
for each row execute function private.sync_admin_role_from_phone();

-- Repair the currently authenticated account and make the migration
-- idempotent for environments where the user already exists.
insert into public.user_roles (user_id, role)
select users.id, 'admin'::public.app_role
from auth.users as users
join private.admin_phone_allowlist as allowlist
  on allowlist.phone = regexp_replace(coalesce(users.phone, ''), '[^0-9]', '', 'g')
 and allowlist.active
on conflict (user_id, role) do nothing;
