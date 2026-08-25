-- Keep each support conversation independent and make its open/closed lifecycle
-- authoritative in Postgres. Clients never choose sender identity.

create or replace function public.send_support_message(
  p_conversation_id uuid,
  p_message text
) returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := auth.uid();
  mid uuid;
  conversation_owner uuid;
  conversation_status text;
begin
  if uid is null then raise exception 'authentication required'; end if;
  if char_length(trim(coalesce(p_message, ''))) not between 1 and 4000 then
    raise exception 'invalid message';
  end if;

  select user_id, status into conversation_owner, conversation_status
  from public.support_conversations
  where id = p_conversation_id
  for update;

  if conversation_owner is null or conversation_owner <> uid then
    raise exception 'support access denied';
  end if;
  if conversation_status <> 'open' then
    raise exception 'support conversation is closed';
  end if;

  insert into public.support_messages(conversation_id, sender_user_id, sender_type, message)
  values (p_conversation_id, uid, 'customer', trim(p_message))
  returning id into mid;

  update public.support_conversations set updated_at = now() where id = p_conversation_id;
  return mid;
end;
$$;

create or replace function public.staff_send_support_message(
  p_conversation_id uuid,
  p_message text
) returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := auth.uid();
  mid uuid;
  conversation_owner uuid;
  conversation_status text;
  kind text;
begin
  if uid is null or not public.is_support_or_admin() then
    raise exception 'support access denied';
  end if;
  if char_length(trim(coalesce(p_message, ''))) not between 1 and 4000 then
    raise exception 'invalid message';
  end if;

  select user_id, status into conversation_owner, conversation_status
  from public.support_conversations
  where id = p_conversation_id
  for update;

  if conversation_owner is null then raise exception 'conversation not found'; end if;
  if conversation_status <> 'open' then raise exception 'support conversation is closed'; end if;
  kind := case when public.is_admin() then 'admin' else 'support' end;

  insert into public.support_messages(conversation_id, sender_user_id, sender_type, message)
  values (p_conversation_id, uid, kind, trim(p_message))
  returning id into mid;

  update public.support_conversations set updated_at = now() where id = p_conversation_id;
  insert into public.user_notifications(user_id, type, title, body)
  values(conversation_owner, 'support_reply', 'رد جديد من دعم مر', 'فريق الدعم رد على محادثتك.');
  return mid;
end;
$$;

create or replace function public.set_support_conversation_status(
  p_conversation_id uuid,
  p_status text
) returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null or not public.is_support_or_admin() then
    raise exception 'support access denied';
  end if;
  if p_status not in ('open', 'closed') then raise exception 'invalid support status'; end if;

  update public.support_conversations
  set status = p_status, updated_at = now()
  where id = p_conversation_id;
  if not found then raise exception 'conversation not found'; end if;
end;
$$;

revoke all on function public.send_support_message(uuid, text) from public, anon;
revoke all on function public.staff_send_support_message(uuid, text) from public, anon;
revoke all on function public.set_support_conversation_status(uuid, text) from public, anon;
revoke all on function public.mark_support_read(uuid) from public, anon;
revoke all on function public.admin_support_inbox() from public, anon;

grant execute on function public.send_support_message(uuid, text) to authenticated;
grant execute on function public.staff_send_support_message(uuid, text) to authenticated;
grant execute on function public.set_support_conversation_status(uuid, text) to authenticated;
grant execute on function public.mark_support_read(uuid) to authenticated;
grant execute on function public.admin_support_inbox() to authenticated;
