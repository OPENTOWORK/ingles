-- B1 motor development-only history table.
-- SAFETY BOUNDARY:
--   * Creates only a new isolated table + index.
--   * Does NOT alter, update, delete, truncate or reference any existing DRALO table.
--   * No foreign keys, triggers, functions or client policies.
--   * Intended only for the B1 Reading pilot on the draft branch.
create table if not exists public.b1_motor_dev_variety_history (
  id bigint generated always as identity primary key,
  level_slug text not null check (level_slug = 'b1'),
  exam_slot integer not null check (exam_slot between 1 and 20),
  part_number integer not null check (part_number between 1 and 6),
  topic_id text not null,
  context_id text,
  genre_id text,
  title_pattern_family text,
  created_at timestamptz not null default now(),
  unique (level_slug, exam_slot, part_number)
);

create index if not exists b1_motor_dev_variety_recent_idx
  on public.b1_motor_dev_variety_history (part_number, created_at desc);

alter table public.b1_motor_dev_variety_history enable row level security;

comment on table public.b1_motor_dev_variety_history is
  'DEVELOPMENT ONLY: isolated B1 Preliminary Reading motor variety history. No live exam content.';
