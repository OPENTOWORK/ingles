-- Vincula reuniones de Dralo con páginas de Notion.
begin;

alter table public.staff_reuniones
  add column if not exists notion_page_id text;

create index if not exists idx_staff_reuniones_notion_page
  on public.staff_reuniones (notion_page_id)
  where notion_page_id is not null;

notify pgrst, 'reload schema';

commit;
