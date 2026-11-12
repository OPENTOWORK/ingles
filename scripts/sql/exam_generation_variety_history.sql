-- Apply in a development database before enabling B1 variety-aware generation.
-- No changes to existing B2 exams or content.
create table if not exists public.exam_generation_variety_history (
  id bigint generated always as identity primary key,
  level_slug text not null check (level_slug in ('b1','b2','c1','c2')),
  exam_slot integer not null check (exam_slot > 0),
  part_number integer not null check (part_number > 0),
  topic_id text not null,
  context_id text,
  genre_id text,
  title_pattern_family text,
  created_at timestamptz not null default now(),
  unique (level_slug, exam_slot, part_number)
);
create index if not exists exam_generation_variety_recent_idx
  on public.exam_generation_variety_history (level_slug, part_number, created_at desc);
alter table public.exam_generation_variety_history enable row level security;
-- No client-facing policies: access through the existing authenticated admin/service client only.
