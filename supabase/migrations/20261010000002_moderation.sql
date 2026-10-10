-- Step 4: screening flags, held-for-review publishing and a moderation queue.

alter table public.notes add column if not exists flags text[] not null default '{}';
alter table public.replies add column if not exists flags text[] not null default '{}';

-- Publishing now takes the server's screening result. Held notes start in
-- pending_review and only appear after a moderator approves them.
-- submit_note / submit_reply supersede publish_note / post_reply, which stay in
-- place (unused) so a deploy of the previous app version keeps working.
create or replace function public.submit_note(
  p_body text,
  p_mood public.note_mood,
  p_session text,
  p_ip text,
  p_recovery_hash text,
  p_hold boolean default false,
  p_flags text[] default '{}'
) returns jsonb
language plpgsql security definer set search_path = public
as $$
declare
  n notes;
begin
  perform enforce_rate_limit('publish', p_session, p_ip, 5, 20, interval '1 hour');
  if exists (
    select 1 from notes
    where author_session = p_session and body = btrim(p_body) and created_at > now() - interval '1 day'
  ) then
    raise exception 'duplicate' using errcode = 'P0001';
  end if;
  insert into notes (body, mood, author_session, recovery_hash, status, flags)
    values (btrim(p_body), p_mood, p_session, p_recovery_hash,
            case when p_hold then 'pending_review'::content_status else 'published'::content_status end,
            coalesce(p_flags, '{}'))
    returning * into n;
  if p_hold then
    insert into moderation_events (target_type, target_id, action, detail)
      values ('note', n.id, 'held_on_publish', array_to_string(p_flags, ','));
  end if;
  return note_json(n) || jsonb_build_object('status', n.status);
end;
$$;

create or replace function public.submit_reply(
  p_note uuid,
  p_body text,
  p_session text,
  p_ip text,
  p_hold boolean default false,
  p_flags text[] default '{}'
) returns jsonb
language plpgsql security definer set search_path = public
as $$
declare
  r replies;
begin
  perform enforce_rate_limit('reply', p_session, p_ip, 20, 60, interval '1 hour');
  if not exists (select 1 from notes where id = p_note and status = 'published') then
    raise exception 'not_found' using errcode = 'P0001';
  end if;
  insert into replies (note_id, body, session_hash, status, flags)
    values (p_note, btrim(p_body), p_session,
            case when p_hold then 'pending_review'::content_status else 'published'::content_status end,
            coalesce(p_flags, '{}'))
    returning * into r;
  if p_hold then
    insert into moderation_events (target_type, target_id, action, detail)
      values ('reply', r.id, 'held_on_publish', array_to_string(p_flags, ','));
  else
    update notes set reply_count = reply_count + 1 where id = p_note;
  end if;
  return jsonb_build_object('id', r.id, 'noteId', r.note_id, 'body', r.body, 'createdAt', r.created_at, 'status', r.status);
end;
$$;

-- Everything a moderator should look at: held or auto-hidden content, plus
-- anything still public that has open reports.
create or replace function public.moderation_queue() returns jsonb
language sql stable security definer set search_path = public
as $$
  with open_reports as (
    select target_type, target_id, count(*) as n, array_agg(distinct reason) as reasons
    from reports where resolved_at is null
    group by target_type, target_id
  ),
  items as (
    select 'note' as kind, n.id, n.body, n.mood::text as mood, n.status::text as status, n.flags,
           n.created_at, null::uuid as note_id, null::text as note_body,
           coalesce(o.n, 0) as open_reports, coalesce(o.reasons, '{}') as reasons
    from notes n
    left join open_reports o on o.target_type = 'note' and o.target_id = n.id
    where n.status = 'pending_review' or (n.status = 'published' and o.n > 0)
    union all
    select 'reply', r.id, r.body, null, r.status::text, r.flags,
           r.created_at, r.note_id, p.body,
           coalesce(o.n, 0), coalesce(o.reasons, '{}')
    from replies r
    join notes p on p.id = r.note_id
    left join open_reports o on o.target_type = 'reply' and o.target_id = r.id
    where r.status = 'pending_review' or (r.status = 'published' and o.n > 0)
  )
  select coalesce(jsonb_agg(jsonb_build_object(
      'kind', kind, 'id', id, 'body', body, 'mood', mood, 'status', status, 'flags', flags,
      'createdAt', created_at, 'noteId', note_id, 'noteBody', note_body,
      'openReports', open_reports, 'reasons', reasons
    ) order by (status = 'pending_review') desc, open_reports desc, created_at), '[]'::jsonb)
  from items;
$$;

-- approve: make it public and clear its reports. hide: keep it out of view.
-- remove: take it down for good.
create or replace function public.moderate(p_type text, p_target uuid, p_action text, p_actor text) returns boolean
language plpgsql security definer set search_path = public
as $$
declare
  new_status content_status;
  old_status content_status;
  parent uuid;
begin
  if p_action not in ('approve', 'hide', 'remove') or p_type not in ('note', 'reply') then
    raise exception 'invalid' using errcode = 'P0001';
  end if;
  new_status := case p_action when 'approve' then 'published' when 'hide' then 'hidden' else 'removed' end;

  if p_type = 'note' then
    select status into old_status from notes where id = p_target for update;
    if not found then return false; end if;
    update notes set status = new_status,
      report_count = case when p_action = 'approve' then 0 else report_count end
      where id = p_target;
  else
    select status, note_id into old_status, parent from replies where id = p_target for update;
    if not found then return false; end if;
    update replies set status = new_status,
      report_count = case when p_action = 'approve' then 0 else report_count end
      where id = p_target;
    -- Recount rather than adjust: replies hidden by reports never decremented it.
    update notes set reply_count = (
      select count(*) from replies where note_id = parent and status = 'published'
    ) where id = parent;
  end if;

  update reports set resolved_at = now()
    where target_type = p_type and target_id = p_target and resolved_at is null;
  insert into moderation_events (target_type, target_id, action, actor)
    values (p_type, p_target, p_action, coalesce(p_actor, 'moderator'));
  return true;
end;
$$;

do $$
declare
  f text;
begin
  foreach f in array array[
    'submit_note(text,public.note_mood,text,text,text,boolean,text[])',
    'submit_reply(uuid,text,text,text,boolean,text[])',
    'moderation_queue()',
    'moderate(text,uuid,text,text)'
  ] loop
    execute format('revoke all on function public.%s from public, anon, authenticated', f);
    execute format('grant execute on function public.%s to service_role', f);
  end loop;
end;
$$;
