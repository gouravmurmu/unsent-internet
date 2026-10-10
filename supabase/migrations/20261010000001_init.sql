-- The Unsent Internet: initial schema.
--
-- Access model: the browser never talks to the database. The Next.js server
-- calls the functions below with the project's secret key. Every table has
-- row-level security turned on with no policies, and anon/authenticated have
-- no grants, so the public API key can read or write nothing.

create extension if not exists pgcrypto with schema extensions;

-- ---------------------------------------------------------------------------
-- Types
-- ---------------------------------------------------------------------------

create type public.note_mood as enum ('love', 'regret', 'hope', 'funny', 'life', 'apology');

-- published: visible. pending_review: hidden until a moderator looks.
-- hidden: hidden by a moderator. removed: taken down by its author or a moderator.
create type public.content_status as enum ('published', 'pending_review', 'hidden', 'removed');

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table public.notes (
  id uuid primary key default gen_random_uuid(),
  body text not null check (char_length(btrim(body)) between 3 and 1000),
  mood public.note_mood,
  status public.content_status not null default 'published',
  -- HMAC of the writer's anonymous session id; never shown to anyone.
  author_session text not null,
  -- SHA-256 of the private recovery code given to the writer at publish time.
  recovery_hash text,
  kindness_count integer not null default 0,
  reply_count integer not null default 0,
  report_count integer not null default 0,
  created_at timestamptz not null default now()
);

create index notes_feed_idx on public.notes (created_at desc) where status = 'published';
create index notes_recovery_idx on public.notes (recovery_hash) where recovery_hash is not null;

create table public.reactions (
  id uuid primary key default gen_random_uuid(),
  note_id uuid not null references public.notes (id) on delete cascade,
  kind text not null check (kind in ('glad', 'not-alone', 'warmth', 'lighter')),
  session_hash text not null,
  created_at timestamptz not null default now(),
  unique (note_id, session_hash)
);

create table public.replies (
  id uuid primary key default gen_random_uuid(),
  note_id uuid not null references public.notes (id) on delete cascade,
  body text not null check (char_length(btrim(body)) between 2 and 280),
  status public.content_status not null default 'published',
  session_hash text not null,
  report_count integer not null default 0,
  created_at timestamptz not null default now()
);

create index replies_note_idx on public.replies (note_id, created_at);

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  target_type text not null check (target_type in ('note', 'reply')),
  target_id uuid not null,
  reason text not null check (reason in ('personal-info', 'harassment', 'explicit', 'spam', 'risk', 'other')),
  session_hash text not null,
  created_at timestamptz not null default now(),
  resolved_at timestamptz,
  unique (target_type, target_id, session_hash)
);

create index reports_open_idx on public.reports (created_at) where resolved_at is null;

create table public.moderation_events (
  id uuid primary key default gen_random_uuid(),
  target_type text not null check (target_type in ('note', 'reply')),
  target_id uuid not null,
  action text not null,
  detail text,
  actor text not null default 'system',
  created_at timestamptz not null default now()
);

-- Short-lived log used only for rate limiting. Rows older than a day are pruned.
create table public.rate_events (
  id bigint generated always as identity primary key,
  action text not null,
  session_hash text not null,
  ip_hash text,
  created_at timestamptz not null default now()
);

create index rate_events_session_idx on public.rate_events (action, session_hash, created_at);
create index rate_events_ip_idx on public.rate_events (action, ip_hash, created_at);

-- ---------------------------------------------------------------------------
-- Lock everything down
-- ---------------------------------------------------------------------------

alter table public.notes enable row level security;
alter table public.reactions enable row level security;
alter table public.replies enable row level security;
alter table public.reports enable row level security;
alter table public.moderation_events enable row level security;
alter table public.rate_events enable row level security;

revoke all on public.notes, public.reactions, public.replies, public.reports,
  public.moderation_events, public.rate_events from anon, authenticated;

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------

-- Raises 'rate_limited' if this session or IP has done `p_action` too often.
create or replace function public.enforce_rate_limit(
  p_action text,
  p_session text,
  p_ip text,
  p_session_limit integer,
  p_ip_limit integer,
  p_window interval
) returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  session_hits integer;
  ip_hits integer;
begin
  select count(*) into session_hits from rate_events
    where action = p_action and session_hash = p_session and created_at > now() - p_window;
  if session_hits >= p_session_limit then
    raise exception 'rate_limited' using errcode = 'P0001';
  end if;

  if p_ip is not null then
    select count(*) into ip_hits from rate_events
      where action = p_action and ip_hash = p_ip and created_at > now() - p_window;
    if ip_hits >= p_ip_limit then
      raise exception 'rate_limited' using errcode = 'P0001';
    end if;
  end if;

  insert into rate_events (action, session_hash, ip_hash) values (p_action, p_session, p_ip);

  -- Opportunistic cleanup so the table never grows large.
  if random() < 0.02 then
    delete from rate_events where created_at < now() - interval '1 day';
  end if;
end;
$$;

-- The public shape of a note. Never includes session or recovery hashes.
create or replace function public.note_json(n public.notes) returns jsonb
language sql
immutable
set search_path = public
as $$
  select jsonb_build_object(
    'id', n.id,
    'body', n.body,
    'mood', n.mood,
    'publishedAt', n.created_at,
    'kindnessCount', n.kindness_count,
    'replyCount', n.reply_count
  );
$$;

-- ---------------------------------------------------------------------------
-- Reading
-- ---------------------------------------------------------------------------

create or replace function public.list_notes(
  p_feed text,
  p_mood public.note_mood default null,
  p_limit integer default 30
) returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(jsonb_agg(note_json(n) order by
      case when p_feed = 'kindness' then n.created_at end asc,
      case when p_feed <> 'kindness' then n.created_at end desc), '[]'::jsonb)
  from (
    select * from notes
    where status = 'published'
      and (p_mood is null or mood = p_mood)
      and (p_feed <> 'kindness' or (kindness_count < 3 and reply_count = 0))
    order by
      case when p_feed = 'kindness' then created_at end asc,
      case when p_feed <> 'kindness' then created_at end desc
    limit least(greatest(p_limit, 1), 60)
  ) n;
$$;

create or replace function public.random_note(p_exclude uuid default null) returns jsonb
language sql
volatile
security definer
set search_path = public
as $$
  select note_json(n) from notes n
  where n.status = 'published' and (p_exclude is null or n.id <> p_exclude)
  order by random()
  limit 1;
$$;

create or replace function public.list_replies(p_note uuid) returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(jsonb_agg(jsonb_build_object(
      'id', r.id, 'noteId', r.note_id, 'body', r.body, 'createdAt', r.created_at
    ) order by r.created_at), '[]'::jsonb)
  from replies r
  join notes n on n.id = r.note_id and n.status = 'published'
  where r.note_id = p_note and r.status = 'published';
$$;

-- ---------------------------------------------------------------------------
-- Writing
-- ---------------------------------------------------------------------------

create or replace function public.publish_note(
  p_body text,
  p_mood public.note_mood,
  p_session text,
  p_ip text,
  p_recovery_hash text
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  n notes;
begin
  perform enforce_rate_limit('publish', p_session, p_ip, 5, 20, interval '1 hour');

  -- Block exact repeats from the same session (simple anti-spam).
  if exists (
    select 1 from notes
    where author_session = p_session and body = btrim(p_body) and created_at > now() - interval '1 day'
  ) then
    raise exception 'duplicate' using errcode = 'P0001';
  end if;

  insert into notes (body, mood, author_session, recovery_hash)
    values (btrim(p_body), p_mood, p_session, p_recovery_hash)
    returning * into n;
  return note_json(n);
end;
$$;

create or replace function public.send_kindness(
  p_note uuid,
  p_kind text,
  p_session text,
  p_ip text
) returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  inserted integer;
begin
  perform enforce_rate_limit('kindness', p_session, p_ip, 60, 300, interval '1 hour');

  if not exists (select 1 from notes where id = p_note and status = 'published') then
    raise exception 'not_found' using errcode = 'P0001';
  end if;

  insert into reactions (note_id, kind, session_hash)
    values (p_note, p_kind, p_session)
    on conflict (note_id, session_hash) do nothing;
  get diagnostics inserted = row_count;

  if inserted > 0 then
    update notes set kindness_count = kindness_count + 1 where id = p_note;
  end if;
end;
$$;

create or replace function public.post_reply(
  p_note uuid,
  p_body text,
  p_session text,
  p_ip text
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  r replies;
begin
  perform enforce_rate_limit('reply', p_session, p_ip, 20, 60, interval '1 hour');

  if not exists (select 1 from notes where id = p_note and status = 'published') then
    raise exception 'not_found' using errcode = 'P0001';
  end if;

  insert into replies (note_id, body, session_hash)
    values (p_note, btrim(p_body), p_session)
    returning * into r;
  update notes set reply_count = reply_count + 1 where id = p_note;

  return jsonb_build_object('id', r.id, 'noteId', r.note_id, 'body', r.body, 'createdAt', r.created_at);
end;
$$;

-- Anyone can report. Three independent reports move content into review.
create or replace function public.report_content(
  p_type text,
  p_target uuid,
  p_reason text,
  p_session text,
  p_ip text
) returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  inserted integer;
  total integer;
begin
  perform enforce_rate_limit('report', p_session, p_ip, 30, 100, interval '1 hour');

  if p_type = 'note' then
    perform 1 from notes where id = p_target;
  elsif p_type = 'reply' then
    perform 1 from replies where id = p_target;
  else
    raise exception 'invalid' using errcode = 'P0001';
  end if;
  if not found then
    raise exception 'not_found' using errcode = 'P0001';
  end if;

  insert into reports (target_type, target_id, reason, session_hash)
    values (p_type, p_target, p_reason, p_session)
    on conflict (target_type, target_id, session_hash) do nothing;
  get diagnostics inserted = row_count;
  if inserted = 0 then
    return;
  end if;

  if p_type = 'note' then
    update notes set report_count = report_count + 1 where id = p_target returning report_count into total;
    if total >= 3 then
      update notes set status = 'pending_review' where id = p_target and status = 'published';
      if found then
        insert into moderation_events (target_type, target_id, action, detail)
          values ('note', p_target, 'auto_hidden', format('%s reports', total));
      end if;
    end if;
  else
    update replies set report_count = report_count + 1 where id = p_target returning report_count into total;
    if total >= 3 then
      update replies set status = 'pending_review' where id = p_target and status = 'published';
      if found then
        insert into moderation_events (target_type, target_id, action, detail)
          values ('reply', p_target, 'auto_hidden', format('%s reports', total));
      end if;
    end if;
  end if;
end;
$$;

-- ---------------------------------------------------------------------------
-- Recovery codes
-- ---------------------------------------------------------------------------

create or replace function public.notes_for_recovery(p_recovery_hash text, p_ip text) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  result jsonb;
begin
  -- Slow down guessing.
  perform enforce_rate_limit('recover', coalesce(p_ip, 'none'), p_ip, 30, 30, interval '1 hour');

  select coalesce(jsonb_agg(note_json(n) || jsonb_build_object('status', n.status) order by n.created_at desc), '[]'::jsonb)
    into result
  from notes n
  where n.recovery_hash = p_recovery_hash and n.status <> 'removed';
  return result;
end;
$$;

create or replace function public.remove_own_note(p_note uuid, p_recovery_hash text) returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  update notes set status = 'removed'
    where id = p_note and recovery_hash = p_recovery_hash and status <> 'removed';
  if not found then
    return false;
  end if;
  insert into moderation_events (target_type, target_id, action, actor)
    values ('note', p_note, 'removed_by_author', 'author');
  return true;
end;
$$;

-- ---------------------------------------------------------------------------
-- Only the server (service_role) may call these.
-- ---------------------------------------------------------------------------

do $$
declare
  f text;
begin
  foreach f in array array[
    'enforce_rate_limit(text,text,text,integer,integer,interval)',
    'note_json(public.notes)',
    'list_notes(text,public.note_mood,integer)',
    'random_note(uuid)',
    'list_replies(uuid)',
    'publish_note(text,public.note_mood,text,text,text)',
    'send_kindness(uuid,text,text,text)',
    'post_reply(uuid,text,text,text)',
    'report_content(text,uuid,text,text,text)',
    'notes_for_recovery(text,text)',
    'remove_own_note(uuid,text)'
  ] loop
    execute format('revoke all on function public.%s from public, anon, authenticated', f);
    execute format('grant execute on function public.%s to service_role', f);
  end loop;
end;
$$;
