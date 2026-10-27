-- Speaking Motor V1 (B2 First Part 1).
-- LOCAL REVIEW ONLY. Do not apply to production without explicit authorisation.

begin;

create table if not exists public.speaking_b2_exams (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  title text not null,
  part integer not null check (part = 1),
  cefr text not null default 'B2' check (cefr = 'B2'),
  version integer not null default 1,
  review_status text not null default 'approved'
    check (review_status in ('draft', 'review', 'approved', 'retired')),
  duration_target_sec integer not null default 120,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.speaking_b2_questions (
  id text primary key,
  exam_id uuid not null references public.speaking_b2_exams (id) on delete cascade,
  exam_code text not null,
  part integer not null default 1 check (part = 1),
  theme text not null,
  level text not null default 'B2',
  question text not null,
  communicative_aims jsonb not null default '[]'::jsonb,
  allowed_follow_ups jsonb not null default '[]'::jsonb,
  review_status text not null default 'approved'
    check (review_status in ('draft', 'review', 'approved', 'retired')),
  version integer not null default 1,
  sort_order integer not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_speaking_b2_questions_exam
  on public.speaking_b2_questions (exam_code, part, sort_order);

create table if not exists public.speaking_b2_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public."Usuarios_y_Perfil_users" (id) on delete cascade,
  exam_id uuid references public.speaking_b2_exams (id) on delete restrict,
  exam_code text not null default 'SP-EX001',
  state text not null default 'READY',
  idempotency_key text unique,
  started_at timestamptz,
  ended_at timestamptz,
  candidate_speaking_ms integer not null default 0,
  access_token_hash text,
  expires_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_speaking_b2_sessions_user
  on public.speaking_b2_sessions (user_id, created_at desc);

create table if not exists public.speaking_b2_turns (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.speaking_b2_sessions (id) on delete cascade,
  role text not null check (role in ('examiner', 'candidate')),
  question_id text,
  spoken_text text not null default '',
  transcript text not null default '',
  stt_confidence real,
  transcript_source text not null default 'STT'
    check (transcript_source in ('STT', 'TYPED', 'MOCK', 'SCRIPT')),
  audio_path text,
  mime_type text,
  started_ms integer,
  ended_ms integer,
  validation text,
  created_at timestamptz not null default now()
);

create index if not exists idx_speaking_b2_turns_session
  on public.speaking_b2_turns (session_id, created_at asc);

create table if not exists public.speaking_b2_assessments (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null unique references public.speaking_b2_sessions (id) on delete cascade,
  user_id uuid references public."Usuarios_y_Perfil_users" (id) on delete cascade,
  grammar_vocabulary real,
  discourse_management real,
  pronunciation real,
  interactive_communication real,
  global_achievement real,
  evidence jsonb not null default '{}'::jsonb,
  official_cambridge boolean not null default false,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.speaking_b2_issues (
  id text primary key,
  session_id uuid not null references public.speaking_b2_sessions (id) on delete cascade,
  assessment_id uuid references public.speaking_b2_assessments (id) on delete cascade,
  question_id text,
  code text not null,
  original_text text not null default '',
  excerpt text not null default '',
  suggestion text not null default '',
  explanation text not null default '',
  severity text not null default 'medium'
    check (severity in ('low', 'medium', 'high')),
  confidence real,
  evidence text,
  audio_start_ms integer,
  skill_to_reinforce text,
  created_at timestamptz not null default now()
);

create index if not exists idx_speaking_b2_issues_session
  on public.speaking_b2_issues (session_id);

create table if not exists public.speaking_b2_recommendations (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.speaking_b2_sessions (id) on delete cascade,
  sort_order integer not null default 0,
  title text not null,
  body text not null,
  created_at timestamptz not null default now()
);

alter table public.speaking_b2_exams enable row level security;
alter table public.speaking_b2_questions enable row level security;
alter table public.speaking_b2_sessions enable row level security;
alter table public.speaking_b2_turns enable row level security;
alter table public.speaking_b2_assessments enable row level security;
alter table public.speaking_b2_issues enable row level security;
alter table public.speaking_b2_recommendations enable row level security;

drop policy if exists "speaking_b2_exams_read_approved" on public.speaking_b2_exams;
create policy "speaking_b2_exams_read_approved"
  on public.speaking_b2_exams for select to authenticated, anon
  using (review_status = 'approved');

drop policy if exists "speaking_b2_questions_read_approved" on public.speaking_b2_questions;
create policy "speaking_b2_questions_read_approved"
  on public.speaking_b2_questions for select to authenticated, anon
  using (review_status = 'approved');

drop policy if exists "speaking_b2_sessions_select_own" on public.speaking_b2_sessions;
create policy "speaking_b2_sessions_select_own"
  on public.speaking_b2_sessions for select to authenticated
  using (user_id = auth.uid());

drop policy if exists "speaking_b2_turns_select_own" on public.speaking_b2_turns;
create policy "speaking_b2_turns_select_own"
  on public.speaking_b2_turns for select to authenticated
  using (
    exists (
      select 1 from public.speaking_b2_sessions s
      where s.id = session_id and s.user_id = auth.uid()
    )
  );

drop policy if exists "speaking_b2_assessments_select_own" on public.speaking_b2_assessments;
create policy "speaking_b2_assessments_select_own"
  on public.speaking_b2_assessments for select to authenticated
  using (user_id = auth.uid());

drop policy if exists "speaking_b2_issues_select_own" on public.speaking_b2_issues;
create policy "speaking_b2_issues_select_own"
  on public.speaking_b2_issues for select to authenticated
  using (
    exists (
      select 1 from public.speaking_b2_sessions s
      where s.id = session_id and s.user_id = auth.uid()
    )
  );

drop policy if exists "speaking_b2_recommendations_select_own" on public.speaking_b2_recommendations;
create policy "speaking_b2_recommendations_select_own"
  on public.speaking_b2_recommendations for select to authenticated
  using (
    exists (
      select 1 from public.speaking_b2_sessions s
      where s.id = session_id and s.user_id = auth.uid()
    )
  );

grant select on public.speaking_b2_exams to anon, authenticated;
grant select on public.speaking_b2_questions to anon, authenticated;
grant select on public.speaking_b2_sessions to authenticated;
grant select on public.speaking_b2_turns to authenticated;
grant select on public.speaking_b2_assessments to authenticated;
grant select on public.speaking_b2_issues to authenticated;
grant select on public.speaking_b2_recommendations to authenticated;

-- Staff reads/writes go through service-role APIs, not extra client policies.
-- access_token_hash is stored server-side; APIs never return it.

revoke insert, update, delete on public.speaking_b2_sessions from authenticated, anon;
revoke insert, update, delete on public.speaking_b2_turns from authenticated, anon;
revoke insert, update, delete on public.speaking_b2_assessments from authenticated, anon;
revoke insert, update, delete on public.speaking_b2_issues from authenticated, anon;
revoke insert, update, delete on public.speaking_b2_recommendations from authenticated, anon;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'speaking-b2-audio',
  'speaking-b2-audio',
  false,
  15728640,
  array[
    'audio/webm',
    'audio/ogg',
    'audio/mpeg',
    'audio/mp4',
    'audio/x-m4a',
    'audio/aac',
    'audio/wav'
  ]
)
on conflict (id) do update set
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "speaking_b2_audio_public_read" on storage.objects;
drop policy if exists "speaking_b2_audio_public_write" on storage.objects;
-- No public/authenticated storage policies: only the service role uploads and
-- the API returns signed URLs. Keep recordings off the public internet.

commit;
