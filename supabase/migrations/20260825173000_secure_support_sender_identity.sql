-- Separate customer and staff send paths so sender identity is decided by the
-- database, never by a browser-provided sender_type.

create or replace function public.send_support_message(
  p_conversation_id uuid,
  p_message text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := auth.uid();
  mid uuid;
  owner_id uuid;
begin
  if uid is null then raise exception 'authentication required'; end if;
  if char_length(trim(coalesce(p_message, ''))) not between 1 and 4000 then
    raise exception 'invalid message';
  end if;

  select user_id into owner_id
  from public.support_conversations
  where id = p_conversation_id
  for update;

  if owner_id is null or owner_id <> uid then
    raise exception 'support access denied';
  end if;

  insert into public.support_messages(
    conversation_id, sender_user_id, sender_type, message
  ) values (
    p_conversation_id, uid, 'customer', trim(p_message)
  ) returning id into mid;

  update public.support_conversations
  set status = 'open', updated_at = now()
  where id = p_conversation_id;

  return mid;
end;
$$;

create or replace function public.staff_send_support_message(
  p_conversation_id uuid,
  p_message text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := auth.uid();
  mid uuid;
  owner_id uuid;
  kind text;
begin
  if uid is null or not public.is_support_or_admin() then
    raise exception 'support access denied';
  end if;
  if char_length(trim(coalesce(p_message, ''))) not between 1 and 4000 then
    raise exception 'invalid message';
  end if;

  select user_id into owner_id
  from public.support_conversations
  where id = p_conversation_id
  for update;

  if owner_id is null then raise exception 'conversation not found'; end if;
  kind := case when public.is_admin() then 'admin' else 'support' end;

  insert into public.support_messages(
    conversation_id, sender_user_id, sender_type, message
  ) values (
    p_conversation_id, uid, kind, trim(p_message)
  ) returning id into mid;

  update public.support_conversations
  set status = 'open', updated_at = now()
  where id = p_conversation_id;

  insert into public.user_notifications(user_id, type, title, body)
  values(owner_id, 'support_reply', 'رد جديد من دعم مر', 'فريق الدعم رد على محادثتك.');

  return mid;
end;
$$;

create or replace function public.mark_support_read(p_conversation_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  owner_id uuid;
begin
  select user_id into owner_id
  from public.support_conversations
  where id = p_conversation_id;

  if owner_id = auth.uid() then
    update public.support_conversations
    set customer_last_read_at = now()
    where id = p_conversation_id;

    update public.support_messages
    set read_at = coalesce(read_at, now())
    where conversation_id = p_conversation_id
      and sender_type in ('admin', 'support', 'system')
      and read_at is null;
  elsif public.is_support_or_admin() then
    update public.support_conversations
    set support_last_read_at = now()
    where id = p_conversation_id;

    update public.support_messages
    set read_at = coalesce(read_at, now())
    where conversation_id = p_conversation_id
      and sender_type = 'customer'
      and read_at is null;
  else
    raise exception 'support access denied';
  end if;
end;
$$;

create or replace function public.admin_support_inbox()
returns table (
  id uuid,
  user_id uuid,
  status text,
  subject text,
  assigned_to uuid,
  created_at timestamptz,
  updated_at timestamptz,
  customer_name text,
  masked_phone text,
  unread_customer_count bigint,
  last_message text,
  last_sender_type text
)
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_support_or_admin() then
    raise exception 'support access denied';
  end if;

  return query
  select
    c.id,
    c.user_id,
    c.status,
    c.subject,
    c.assigned_to,
    c.created_at,
    c.updated_at,
    nullif(trim(p.full_name), '') as customer_name,
    case
      when p.phone is null or length(p.phone) < 7 then null
      else left(p.phone, 4) || '••••' || right(p.phone, 3)
    end as masked_phone,
    count(m.id) filter (
      where m.sender_type = 'customer'
        and (c.support_last_read_at is null or m.created_at > c.support_last_read_at)
    ) as unread_customer_count,
    latest.message as last_message,
    latest.sender_type as last_sender_type
  from public.support_conversations c
  left join public.profiles p on p.id = c.user_id
  left join public.support_messages m on m.conversation_id = c.id
  left join lateral (
    select sm.message, sm.sender_type
    from public.support_messages sm
    where sm.conversation_id = c.id
    order by sm.created_at desc
    limit 1
  ) latest on true
  group by c.id, p.full_name, p.phone, latest.message, latest.sender_type
  order by c.updated_at desc;
end;
$$;

revoke all on function public.send_support_message(uuid, text) from public;
revoke all on function public.staff_send_support_message(uuid, text) from public;
revoke all on function public.admin_support_inbox() from public;
revoke all on function public.mark_support_read(uuid) from public;

grant execute on function public.send_support_message(uuid, text) to authenticated;
grant execute on function public.staff_send_support_message(uuid, text) to authenticated;
grant execute on function public.admin_support_inbox() to authenticated;
grant execute on function public.mark_support_read(uuid) to authenticated;

notify pgrst, 'reload schema';
