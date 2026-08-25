-- ---------------------------------------------------------------------------
-- 2. writing_task_analyses — caché de análisis de tarea, sensible a versión
-- ---------------------------------------------------------------------------
-- Sin datos del alumno. La huella (task_fingerprint) ya es sensible a: contenido de
-- la tarea, tipo, versión del Documento 01, versión del prompt, versión de esquema y
-- configuración del modelo. Cambiar cualquiera de esos crea una ENTRADA NUEVA.

create table if not exists public.writing_task_analyses (
  id uuid primary key default gen_random_uuid(),
  task_fingerprint text not null unique,
  task_type text not null check (
    task_type in ('essay', 'informal_email', 'formal_email', 'article', 'report', 'review')
  ),
  source_task_hash text not null,
  task_analysis jsonb not null,
  task_requirements_version text not null,
  task_analysis_schema_version text not null,
  task_analysis_prompt_version text not null,
  engine_version text not null,
  model_config jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists writing_task_analyses_source_task_hash_idx
  on public.writing_task_analyses (source_task_hash);
