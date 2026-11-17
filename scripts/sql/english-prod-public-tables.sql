CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

DO $$ BEGIN CREATE TYPE public.fin_fiscal_year_status AS ENUM ('open', 'closed'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN CREATE TYPE public.fin_invoice_direction AS ENUM ('sale', 'purchase'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN CREATE TYPE public.fin_invoice_status AS ENUM ('draft', 'issued', 'cancelled'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN CREATE TYPE public.fin_journal_status AS ENUM ('draft', 'posted', 'cancelled'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN CREATE TYPE public.fin_movement_kind AS ENUM ('collection', 'payment', 'transfer', 'adjustment'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN CREATE TYPE public.fin_party_kind AS ENUM ('customer', 'supplier', 'both'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN CREATE TYPE public.fin_payment_status AS ENUM ('pending', 'partial', 'paid'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN CREATE TYPE public.fin_reconciliation_status AS ENUM ('pending', 'reconciled', 'unidentified'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN CREATE TYPE public.fin_treasury_account_kind AS ENUM ('bank', 'cash', 'other'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public."Dictionary_words" (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  word text NOT NULL,
  translation text,
  phonetic text,
  definition text,
  target_language text NOT NULL DEFAULT 'es'::text,
  cefr_level text,
  entry_data jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public."Levels_stars" (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  puntuaciones_id uuid DEFAULT gen_random_uuid(),
  stars int8,
  descripcion text,
  created_at timestamptz NOT NULL DEFAULT now(),
  exam_or_skill int2
);

CREATE TABLE IF NOT EXISTS public."Usuarios_y_Perfil_centros" (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  nombre text,
  direccion text,
  telefono text,
  email text
);

CREATE TABLE IF NOT EXISTS public."Usuarios_y_Perfil_clases" (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  centro_id uuid DEFAULT gen_random_uuid(),
  nombre text,
  descripcion text,
  profesor_id uuid DEFAULT gen_random_uuid()
);

CREATE TABLE IF NOT EXISTS public."Usuarios_y_Perfil_profiles" (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid DEFAULT gen_random_uuid(),
  fecha_nacimiento date,
  foto_url text,
  idioma_preferido text,
  biografia text,
  rol_id uuid,
  mascot_variant int2
);

CREATE TABLE IF NOT EXISTS public."Usuarios_y_Perfil_roles" (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  nombre text,
  descripcion text
);

CREATE TABLE IF NOT EXISTS public."Usuarios_y_Perfil_users" (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  nombre text,
  email text,
  password text,
  rol_id uuid DEFAULT gen_random_uuid(),
  activo bool,
  creado_en timestamp,
  id_plan_monetizacion uuid,
  destacado_equipo bool NOT NULL DEFAULT false,
  consentimiento_comercial bool NOT NULL DEFAULT false,
  plan_id text NOT NULL DEFAULT 'free'::text
);

CREATE TABLE IF NOT EXISTS public.admin_accesos_web (
  id uuid NOT NULL DEFAULT extensions.gen_random_uuid(),
  nombre text NOT NULL,
  url text,
  para_que text,
  conectado_con text,
  correo text,
  contrasena text,
  creado_en timestamptz NOT NULL DEFAULT now(),
  actualizado_en timestamptz NOT NULL DEFAULT now(),
  creado_por uuid NOT NULL,
  usuario text
);

CREATE TABLE IF NOT EXISTS public.ai_budget_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  month_key text NOT NULL,
  monthly_budget_eur numeric(10,2) DEFAULT 150,
  hard_stop_enabled bool DEFAULT true,
  warning_threshold_eur numeric(10,2) DEFAULT 100,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.ai_usage_daily_limits (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  action text NOT NULL,
  usage_date date NOT NULL DEFAULT CURRENT_DATE,
  count int4 NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.ai_usage_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  action text NOT NULL,
  product_area text,
  model text,
  input_tokens int4 DEFAULT 0,
  output_tokens int4 DEFAULT 0,
  total_tokens int4 DEFAULT 0,
  estimated_cost_usd numeric(12,6) DEFAULT 0,
  estimated_cost_eur numeric(12,6) DEFAULT 0,
  success bool DEFAULT true,
  error_code text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.auth_sesiones (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  ip text,
  dispositivo text,
  exitoso bool,
  creado_en timestamp,
  cerrado_en timestamp,
  tipo_evento text,
  navegador text,
  email text,
  motivo text
);

CREATE TABLE IF NOT EXISTS public.b1_motor_dev_generated_exams (
  id int8 NOT NULL,
  exam_slot int4 NOT NULL,
  motor_version text NOT NULL,
  status text NOT NULL,
  payload jsonb NOT NULL,
  validation_summary jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.b1_motor_dev_generated_parts (
  id int8 NOT NULL,
  exam_slot int4 NOT NULL,
  motor_version text NOT NULL,
  part_number int4 NOT NULL,
  payload jsonb NOT NULL,
  validation jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.b1_motor_dev_run_logs (
  id int8 NOT NULL,
  stage text NOT NULL,
  ok bool NOT NULL,
  output text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.b1_motor_dev_variety_history (
  id int8 NOT NULL,
  level_slug text NOT NULL,
  exam_slot int4 NOT NULL,
  part_number int4 NOT NULL,
  topic_id text NOT NULL,
  context_id text,
  genre_id text,
  title_pattern_family text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.blog_article_comments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  article_id uuid NOT NULL,
  user_id uuid NOT NULL,
  author_name text NOT NULL DEFAULT ''::text,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.blog_articles (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  slug text NOT NULL,
  title text NOT NULL,
  excerpt text NOT NULL DEFAULT ''::text,
  content text NOT NULL DEFAULT ''::text,
  published bool NOT NULL DEFAULT false,
  author_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  cover_image_url text NOT NULL DEFAULT ''::text,
  og_image_url text NOT NULL DEFAULT ''::text,
  seo_title text NOT NULL DEFAULT ''::text,
  seo_description text NOT NULL DEFAULT ''::text,
  published_at timestamptz,
  content_type text NOT NULL DEFAULT 'article'::text,
  scheduled_publish_at timestamptz,
  faq_items jsonb NOT NULL DEFAULT '[]'::jsonb,
  category_slug text,
  etiqueta text
);

CREATE TABLE IF NOT EXISTS public.calidad_comentarios (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid DEFAULT gen_random_uuid(),
  tipo_objetivo text,
  objetivo_id uuid DEFAULT gen_random_uuid(),
  comentario text,
  creado_en timestamp
);

CREATE TABLE IF NOT EXISTS public.calidad_errores_reportados (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid DEFAULT gen_random_uuid(),
  tipo_objetivo text,
  objetivo_id uuid DEFAULT gen_random_uuid(),
  descripcion text,
  estado text,
  resuelto_por uuid DEFAULT gen_random_uuid(),
  resuelto_en timestamp,
  creado_en timestamp
);

CREATE TABLE IF NOT EXISTS public.calidad_valoraciones (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid DEFAULT gen_random_uuid(),
  tipo_objetivo text,
  objetivo_id uuid DEFAULT gen_random_uuid(),
  valor int4,
  creado_en timestamp
);

CREATE TABLE IF NOT EXISTS public.config_idiomas (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  codigo text,
  nombre text,
  activo bool,
  por_defecto bool
);

CREATE TABLE IF NOT EXISTS public.config_log_cambios (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tabla_afectada text,
  campo text,
  clave text,
  valor_anterior text,
  valor_nuevo text,
  cambiado_por uuid NOT NULL,
  cambiado_en timestamp DEFAULT (now() AT TIME ZONE 'utc'::text)
);

CREATE TABLE IF NOT EXISTS public.config_parametros (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  clave text,
  valor text,
  tipo text,
  descripcion text,
  creado_en timestamp
);

CREATE TABLE IF NOT EXISTS public.config_textos (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  clave text,
  idioma_codigo text,
  contenido text,
  creado_en timestamp
);

CREATE TABLE IF NOT EXISTS public.config_usuario_idioma (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid DEFAULT gen_random_uuid(),
  idioma_codigo text,
  creado_en timestamp
);

CREATE TABLE IF NOT EXISTS public.config_visual (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  clave text,
  valor text,
  tipo text,
  descripcion text,
  creado_en timestamp
);

CREATE TABLE IF NOT EXISTS public.contacto_mensajes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  emisor_id uuid NOT NULL DEFAULT gen_random_uuid(),
  receptor_id uuid DEFAULT gen_random_uuid(),
  mensaje text,
  enviado_en timestamp,
  leido bool,
  tipo_conversacion text,
  adjunto_url text,
  soporte_ticket_id uuid,
  "eliminado_por_emisor / eliminado_por_receptor" bool,
  tipo_mensaje text
);

CREATE TABLE IF NOT EXISTS public.contacto_soporte (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid DEFAULT gen_random_uuid(),
  asunto text,
  descripcion text,
  estado text,
  creado_en timestamp DEFAULT now(),
  cerrado_en timestamp,
  tipo_problema text,
  prioridad text,
  asignado_a uuid,
  resuelto bool,
  ultimo_mensaje_en timestamp,
  solicitante_email text,
  solicitante_nombre text
);

CREATE TABLE IF NOT EXISTS public.estudio_sesiones (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid DEFAULT gen_random_uuid(),
  fecha_inicio timestamp,
  fecha_fin timestamp,
  duracion_seg int8,
  notas text,
  creado_en timestamp,
  ejercicios_hechos int4,
  tareas_hechas int4,
  examenes_hechos int4
);

CREATE TABLE IF NOT EXISTS public.fin_accounts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  code text NOT NULL,
  name text NOT NULL,
  account_type text NOT NULL,
  level int4 NOT NULL DEFAULT 1,
  parent_code text,
  is_active bool NOT NULL DEFAULT true,
  is_seed bool NOT NULL DEFAULT false,
  party_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.fin_audit_log (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  entity_type text NOT NULL,
  entity_id uuid,
  action text NOT NULL,
  detail jsonb NOT NULL DEFAULT '{}'::jsonb,
  actor_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.fin_fiscal_years (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  year int4 NOT NULL,
  starts_on date NOT NULL,
  ends_on date NOT NULL,
  status fin_fiscal_year_status NOT NULL DEFAULT 'open'::fin_fiscal_year_status,
  closed_at timestamptz,
  closed_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.fin_invoice_lines (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  invoice_id uuid NOT NULL,
  line_number int4 NOT NULL DEFAULT 1,
  description text NOT NULL,
  quantity numeric(14,4) NOT NULL DEFAULT 1,
  unit_price numeric(14,4) NOT NULL DEFAULT 0,
  discount_percent numeric(5,2) NOT NULL DEFAULT 0,
  tax_rate numeric(5,2) NOT NULL DEFAULT 21,
  income_account_code text,
  subtotal numeric(14,2) NOT NULL DEFAULT 0,
  tax_amount numeric(14,2) NOT NULL DEFAULT 0,
  total numeric(14,2) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.fin_invoice_series (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  code text NOT NULL,
  name text NOT NULL,
  direction fin_invoice_direction NOT NULL DEFAULT 'sale'::fin_invoice_direction,
  prefix text NOT NULL DEFAULT ''::text,
  next_number int4 NOT NULL DEFAULT 1,
  padding int4 NOT NULL DEFAULT 4,
  include_year bool NOT NULL DEFAULT true,
  is_rectificative bool NOT NULL DEFAULT false,
  is_active bool NOT NULL DEFAULT true,
  default_income_account_code text,
  default_tax_rate numeric(5,2) NOT NULL DEFAULT 21.00,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.fin_invoices (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  direction fin_invoice_direction NOT NULL DEFAULT 'sale'::fin_invoice_direction,
  series_id uuid,
  fiscal_year_id uuid,
  invoice_number text,
  sequence_number int4,
  party_id uuid NOT NULL,
  issue_date date NOT NULL DEFAULT CURRENT_DATE,
  due_date date,
  status fin_invoice_status NOT NULL DEFAULT 'draft'::fin_invoice_status,
  payment_status fin_payment_status NOT NULL DEFAULT 'pending'::fin_payment_status,
  currency text NOT NULL DEFAULT 'EUR'::text,
  subtotal numeric(14,2) NOT NULL DEFAULT 0,
  discount_total numeric(14,2) NOT NULL DEFAULT 0,
  tax_total numeric(14,2) NOT NULL DEFAULT 0,
  total numeric(14,2) NOT NULL DEFAULT 0,
  paid_amount numeric(14,2) NOT NULL DEFAULT 0,
  payment_method text,
  notes text,
  internal_notes text,
  party_snapshot jsonb NOT NULL DEFAULT '{}'::jsonb,
  rectifies_invoice_id uuid,
  rectified_by_invoice_id uuid,
  cancelled_at timestamptz,
  cancelled_reason text,
  issued_at timestamptz,
  issued_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid
);

CREATE TABLE IF NOT EXISTS public.fin_journal_entries (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  fiscal_year_id uuid NOT NULL,
  entry_number int4,
  entry_date date NOT NULL,
  concept text NOT NULL,
  origin text NOT NULL DEFAULT 'manual'::text,
  document_type text,
  document_id uuid,
  document_ref text,
  status fin_journal_status NOT NULL DEFAULT 'posted'::fin_journal_status,
  total_debit numeric(14,2) NOT NULL DEFAULT 0,
  total_credit numeric(14,2) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid
);

CREATE TABLE IF NOT EXISTS public.fin_journal_lines (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  entry_id uuid NOT NULL,
  line_number int4 NOT NULL DEFAULT 1,
  account_code text NOT NULL,
  concept text,
  debit numeric(14,2) NOT NULL DEFAULT 0,
  credit numeric(14,2) NOT NULL DEFAULT 0,
  party_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.fin_parties (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  kind fin_party_kind NOT NULL DEFAULT 'customer'::fin_party_kind,
  legal_name text NOT NULL,
  trade_name text,
  tax_id text,
  email text,
  phone text,
  address_line text,
  postal_code text,
  city text,
  province text,
  country text NOT NULL DEFAULT 'ES'::text,
  payment_terms_days int4 NOT NULL DEFAULT 30,
  payment_method text,
  accounting_account_code text,
  user_id uuid,
  notes text,
  is_active bool NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid
);

CREATE TABLE IF NOT EXISTS public.fin_payments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  direction fin_invoice_direction NOT NULL,
  invoice_id uuid,
  party_id uuid,
  treasury_account_id uuid NOT NULL,
  movement_id uuid,
  journal_entry_id uuid,
  payment_date date NOT NULL DEFAULT CURRENT_DATE,
  amount numeric(14,2) NOT NULL,
  currency text NOT NULL DEFAULT 'EUR'::text,
  reference text,
  notes text,
  idempotency_key text,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid
);

CREATE TABLE IF NOT EXISTS public.fin_treasury_accounts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  kind fin_treasury_account_kind NOT NULL DEFAULT 'bank'::fin_treasury_account_kind,
  bank_name text,
  iban text,
  currency text NOT NULL DEFAULT 'EUR'::text,
  accounting_account_code text,
  opening_balance numeric(14,2) NOT NULL DEFAULT 0,
  current_balance numeric(14,2) NOT NULL DEFAULT 0,
  is_active bool NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid
);

CREATE TABLE IF NOT EXISTS public.fin_treasury_movements (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  treasury_account_id uuid NOT NULL,
  movement_date date NOT NULL DEFAULT CURRENT_DATE,
  kind fin_movement_kind NOT NULL,
  concept text NOT NULL,
  amount_in numeric(14,2) NOT NULL DEFAULT 0,
  amount_out numeric(14,2) NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'EUR'::text,
  reference text,
  document_type text,
  document_id uuid,
  payment_id uuid,
  journal_entry_id uuid,
  reconciliation_status fin_reconciliation_status NOT NULL DEFAULT 'pending'::fin_reconciliation_status,
  reconciled_at timestamptz,
  reconciled_by uuid,
  external_id text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid
);

CREATE TABLE IF NOT EXISTS public.formulario_preguntas (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  formulario_id uuid NOT NULL,
  titulo text NOT NULL,
  ayuda text NOT NULL DEFAULT ''::text,
  tipo text NOT NULL DEFAULT 'varias'::text,
  obligatoria bool NOT NULL DEFAULT false,
  opciones jsonb NOT NULL DEFAULT '[]'::jsonb,
  orden int4 NOT NULL DEFAULT 0,
  creado_en timestamptz NOT NULL DEFAULT now(),
  actualizado_en timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.formulario_respuestas (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  formulario_id uuid,
  formulario_titulo text NOT NULL,
  user_id uuid NOT NULL,
  respuestas jsonb NOT NULL DEFAULT '[]'::jsonb,
  completado_en timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.formularios (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  titulo text NOT NULL,
  descripcion text NOT NULL DEFAULT ''::text,
  orden int4 NOT NULL DEFAULT 0,
  creado_en timestamptz NOT NULL DEFAULT now(),
  actualizado_en timestamptz NOT NULL DEFAULT now(),
  momento text
);

CREATE TABLE IF NOT EXISTS public.founding_member_encuestas (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  slot_number int4 NOT NULL,
  email text NOT NULL,
  token text NOT NULL,
  enviada_en timestamptz,
  vence_en timestamptz,
  recordatorio_enviado_en timestamptz,
  respondida_en timestamptz,
  respuestas jsonb,
  plan_confirmado_en timestamptz,
  plan_revocado_en timestamptz,
  creado_en timestamptz NOT NULL DEFAULT now(),
  actualizado_en timestamptz NOT NULL DEFAULT now(),
  revocacion_omitida_motivo text
);

CREATE TABLE IF NOT EXISTS public.founding_member_grants (
  user_id uuid NOT NULL,
  slot_number int4 NOT NULL,
  email text NOT NULL,
  granted_at timestamptz NOT NULL DEFAULT now(),
  email_sent_at timestamptz
);

CREATE TABLE IF NOT EXISTS public.guia_b2_solicitudes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  email text NOT NULL,
  accepted_marketing bool NOT NULL DEFAULT false,
  request_count int4 NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  last_requested_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.levels (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  nombre text,
  descripcion text,
  creado_en timestamp
);

CREATE TABLE IF NOT EXISTS public.levels_estadisticas (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  usuario_id uuid NOT NULL,
  pregunta_id uuid NOT NULL,
  parte_id uuid,
  accesos int4 NOT NULL DEFAULT 0,
  intentos_completados int4 NOT NULL DEFAULT 0,
  respuestas_evaluadas int4 NOT NULL DEFAULT 0,
  respuestas_correctas int4 NOT NULL DEFAULT 0,
  respuestas_incorrectas int4 NOT NULL DEFAULT 0,
  mejor_porcentaje numeric(5,2),
  ultimo_porcentaje numeric(5,2),
  tiempo_segundos_total int4 NOT NULL DEFAULT 0,
  primera_interaccion timestamptz,
  ultima_interaccion timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  creado_en timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
  actualizado_en timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
  exam_or_skill int2
);

CREATE TABLE IF NOT EXISTS public.levels_exam_part_prompt_overrides (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  level_slug text NOT NULL,
  part_number int4 NOT NULL,
  system_prompt text NOT NULL DEFAULT ''::text,
  user_prompt text NOT NULL,
  updated_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.levels_examenes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  level_id uuid DEFAULT gen_random_uuid(),
  nombre text,
  tipo text,
  modelo text,
  duracion_min int2,
  creado_en timestamp,
  "Nivel" text
);

CREATE TABLE IF NOT EXISTS public.levels_favoritos (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  pregunta_id uuid DEFAULT gen_random_uuid(),
  descripcion text,
  created_at timestamptz NOT NULL DEFAULT now(),
  usuario_id uuid
);

CREATE TABLE IF NOT EXISTS public.levels_justificaciones (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  id_respuesta uuid,
  id_respuesta_abierta uuid,
  justificacion text,
  pregunta_id uuid,
  item_num int4
);

CREATE TABLE IF NOT EXISTS public.levels_notas (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  usuario_id uuid NOT NULL,
  titulo text NOT NULL DEFAULT 'New note'::text,
  contenido text NOT NULL DEFAULT ''::text,
  etiquetas _text NOT NULL DEFAULT '{}'::text[],
  contexto jsonb NOT NULL DEFAULT '{}'::jsonb,
  context_key text,
  creado_en timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
  actualizado_en timestamptz NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.levels_partes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  nombre_parte text,
  created_at timestamp DEFAULT now(),
  "Descripción" text,
  id_skills uuid
);

CREATE TABLE IF NOT EXISTS public.levels_preguntas (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  examen_id uuid NOT NULL,
  level_id uuid NOT NULL,
  parte_id uuid NOT NULL,
  enunciado text,
  creado_en timestamp DEFAULT now(),
  audio_url text
);

CREATE TABLE IF NOT EXISTS public.levels_preguntas_audios (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  pregunta_id uuid DEFAULT gen_random_uuid(),
  audio_url text,
  orden int8,
  titulo text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.levels_puntuaciones (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  id_pregunta uuid NOT NULL,
  uuid_usuario uuid NOT NULL,
  puntuacion float8 NOT NULL,
  descripcion text,
  created_at timestamptz NOT NULL DEFAULT now(),
  examen_id uuid,
  parte_numero int2,
  correctas int4,
  total_preguntas int4,
  aprobado bool,
  puntos_obtenidos int4,
  puntos_maximos int4,
  scoring_version int2 NOT NULL DEFAULT 1,
  score_source text NOT NULL DEFAULT 'skill_practice'::text,
  exam_or_skill int2
);

CREATE TABLE IF NOT EXISTS public.levels_respuestas (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  pregunta_id uuid DEFAULT gen_random_uuid(),
  respuesta text,
  correcta bool,
  creado_en timestamptz
);

CREATE TABLE IF NOT EXISTS public.levels_respuestas_abiertas (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  pregunta_id_abierta uuid DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  respuesta_texto text,
  grading_metadata jsonb
);

CREATE TABLE IF NOT EXISTS public.levels_skills (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  nombre text,
  descripcion text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.levels_teoria_estadisticas (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  usuario_id uuid NOT NULL,
  pregunta_id uuid NOT NULL,
  skills_id uuid,
  accesos int4 NOT NULL DEFAULT 0,
  intentos_completados int4 NOT NULL DEFAULT 0,
  respuestas_evaluadas int4 NOT NULL DEFAULT 0,
  respuestas_correctas int4 NOT NULL DEFAULT 0,
  respuestas_incorrectas int4 NOT NULL DEFAULT 0,
  mejor_porcentaje numeric(5,2),
  ultimo_porcentaje numeric(5,2),
  tiempo_segundos_total int4 NOT NULL DEFAULT 0,
  primera_interaccion timestamptz,
  ultima_interaccion timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  creado_en timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
  actualizado_en timestamptz NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.levels_teoria_preguntas (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  id_nivel uuid DEFAULT gen_random_uuid(),
  id_skills uuid DEFAULT gen_random_uuid(),
  pregunta text,
  descripcion text,
  created_at timestamptz NOT NULL DEFAULT now(),
  id_tipo_preguntas uuid
);

CREATE TABLE IF NOT EXISTS public.levels_teoria_preguntas_audios (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  pregunta_id uuid DEFAULT gen_random_uuid(),
  audio_url text,
  orden int8,
  titulo text,
  created_at timestamptz NOT NULL DEFAULT now(),
  id_tipos_preguntas uuid
);

CREATE TABLE IF NOT EXISTS public.levels_teoria_progreso (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  uuid_usuario uuid NOT NULL,
  unidad text NOT NULL,
  topic_href text NOT NULL,
  progreso_pct int2 NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.levels_teoria_puntuaciones (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  id_pregunta uuid NOT NULL,
  uuid_usuario uuid NOT NULL,
  puntuacion float8 NOT NULL,
  descripcion text,
  created_at timestamptz NOT NULL DEFAULT now(),
  examen_id uuid,
  parte_numero int2,
  correctas int4,
  total_preguntas int4,
  aprobado bool,
  aciertos int8,
  fallos int8
);

CREATE TABLE IF NOT EXISTS public.levels_teoria_respuestas (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  id_preguntas_teoria uuid DEFAULT gen_random_uuid(),
  respuesta text,
  created_at timestamptz NOT NULL DEFAULT now(),
  "Correcta" bool
);

CREATE TABLE IF NOT EXISTS public.levels_teoria_respuestas_abiertas (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  id_preguntas uuid DEFAULT gen_random_uuid(),
  respuesta text,
  descripcion text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.levels_teoria_tipos_preguntas (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  "Nombre" text,
  "Descripcion" text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.leves_correcciones (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  id_preguntas uuid DEFAULT gen_random_uuid(),
  id_preguntas_audio uuid DEFAULT gen_random_uuid(),
  "Explicación y corrección" text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.library_contenido (
  id int8 NOT NULL,
  tipo text,
  titulo text,
  descripcion text,
  url text,
  etiqueta_id uuid DEFAULT gen_random_uuid(),
  creado_en timestamp
);

CREATE TABLE IF NOT EXISTS public.library_estados_contenido (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  nombre text,
  descripcion text,
  creado_en timestamp
);

CREATE TABLE IF NOT EXISTS public.library_etiquetas (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  nombre text,
  color text,
  creado_en timestamp
);

CREATE TABLE IF NOT EXISTS public.library_medios (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  nombre text,
  tipo text,
  url text,
  formato text,
  creado_en timestamp
);

CREATE TABLE IF NOT EXISTS public.library_preguntas (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  enunciado text,
  tipo text,
  nivel text,
  etiqueta_id uuid DEFAULT gen_random_uuid(),
  contenido_id uuid DEFAULT gen_random_uuid(),
  creado_en timestamp
);

CREATE TABLE IF NOT EXISTS public.marketing_acquisition_profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  visitor_id text NOT NULL,
  user_id uuid,
  first_source text,
  first_medium text,
  first_campaign text,
  first_content text,
  first_term text,
  first_landing_page text,
  first_timestamp timestamptz,
  first_utm_source text,
  first_utm_medium text,
  first_utm_campaign text,
  first_utm_content text,
  first_utm_term text,
  first_gclid text,
  first_gbraid text,
  first_wbraid text,
  last_source text,
  last_medium text,
  last_campaign text,
  last_content text,
  last_term text,
  last_landing_page text,
  last_timestamp timestamptz,
  last_utm_source text,
  last_utm_medium text,
  last_utm_campaign text,
  last_utm_content text,
  last_utm_term text,
  last_gclid text,
  last_gbraid text,
  last_wbraid text,
  lead_created_at timestamptz,
  lead_qualified_at timestamptz,
  converted_at timestamptz,
  customer_created_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.marketing_campaign_costs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL,
  date date NOT NULL,
  spend numeric(12,2) NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'EUR'::text,
  platform text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.marketing_campaigns (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  platform text,
  source text,
  medium text,
  campaign_identifier text,
  external_campaign_id text,
  status text NOT NULL DEFAULT 'active'::text,
  start_date date,
  end_date date,
  budget numeric(12,2),
  spend numeric(12,2) DEFAULT 0,
  currency text DEFAULT 'EUR'::text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.marketing_consent (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  visitor_id text,
  user_id uuid,
  analytics_consent bool,
  ads_consent bool,
  marketing_consent bool,
  consent_timestamp timestamptz,
  consent_source text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.marketing_events (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  event_public_id text NOT NULL,
  visitor_id text NOT NULL,
  contact_id uuid,
  lead_id uuid,
  customer_id uuid,
  session_id text,
  event_name text NOT NULL,
  event_timestamp timestamptz NOT NULL DEFAULT now(),
  page_url text,
  source text,
  medium text,
  campaign text,
  content text,
  term text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  utm_term text,
  gclid text,
  gbraid text,
  wbraid text,
  idempotency_key text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.marketing_mediums (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  slug text NOT NULL,
  label text NOT NULL,
  is_active bool NOT NULL DEFAULT true,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.marketing_opportunities (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  lead_id uuid,
  contact_id uuid,
  customer_id uuid,
  visitor_id text,
  stage text NOT NULL DEFAULT 'new'::text,
  estimated_value numeric(12,2),
  probability numeric(5,2),
  expected_close_date date,
  actual_close_date date,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.marketing_revenue (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  customer_id uuid,
  contact_id uuid,
  opportunity_id uuid,
  visitor_id text,
  monetizacion_pago_id int8,
  amount numeric(12,2) NOT NULL,
  currency text NOT NULL DEFAULT 'EUR'::text,
  product text,
  service text,
  transaction_date timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'completed'::text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.marketing_sources (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  slug text NOT NULL,
  label text NOT NULL,
  is_active bool NOT NULL DEFAULT true,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.marketing_touchpoints (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  visitor_id text NOT NULL,
  contact_id uuid,
  lead_id uuid,
  customer_id uuid,
  session_id text,
  "timestamp" timestamptz NOT NULL DEFAULT now(),
  event_name text NOT NULL,
  source text,
  medium text,
  campaign text,
  content text,
  term text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  utm_term text,
  gclid text,
  gbraid text,
  wbraid text,
  page_url text,
  landing_page text,
  referrer text,
  user_agent text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.marketing_visitor_hits (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  visitor_id text NOT NULL,
  ip_address text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.marketing_visitor_pages (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  visitor_id text NOT NULL,
  user_id uuid,
  path text NOT NULL,
  page_title text,
  visited_at timestamptz NOT NULL DEFAULT now(),
  duration_seconds int4 NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.marketing_visitors (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  visitor_id text NOT NULL,
  user_id uuid,
  contact_id uuid,
  lead_id uuid,
  customer_id uuid,
  referral_invitation_id uuid,
  identified_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  last_ip text,
  last_seen_at timestamptz,
  first_source text,
  first_landing_page text,
  first_referrer text
);

CREATE TABLE IF NOT EXISTS public.monetizacion_pagos (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid DEFAULT gen_random_uuid(),
  id_plan_monetizacion uuid DEFAULT gen_random_uuid(),
  importe numeric,
  fecha_pago timestamp,
  metodo_pago text,
  transancion_id text,
  exito bool
);

CREATE TABLE IF NOT EXISTS public.monetizacion_planes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  nombre text,
  descripcion text,
  precio numeric,
  duracion_dias int8,
  activo bool,
  creado_en timestamp
);

CREATE TABLE IF NOT EXISTS public.newsletter_suscriptores (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  email text NOT NULL,
  zona text,
  status text NOT NULL DEFAULT 'pending'::text,
  confirm_token text NOT NULL,
  unsubscribe_token text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  confirmed_at timestamptz,
  unsubscribed_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.perfil_actividad (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  activity_date date NOT NULL,
  study_minutes int4 NOT NULL DEFAULT 0,
  sessions_count int4 NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.perfil_favoritos (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid DEFAULT gen_random_uuid(),
  contenido_id uuid DEFAULT gen_random_uuid(),
  creado_en timestamp
);

CREATE TABLE IF NOT EXISTS public.perfil_notificaciones (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid DEFAULT gen_random_uuid(),
  tipo text,
  mensaje text,
  leido bool,
  creado_en timestamp
);

CREATE TABLE IF NOT EXISTS public.perfil_objetivos (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid DEFAULT gen_random_uuid(),
  tipo text,
  descripcion text,
  conseguido bool,
  fecha_conseguido timestamp,
  creado_en timestamp
);

CREATE TABLE IF NOT EXISTS public.perfil_preferencias_estudio (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid DEFAULT gen_random_uuid(),
  estilo_aprendizaje text,
  notificaciones bool,
  recordatorios bool,
  creado_en timestamp
);

CREATE TABLE IF NOT EXISTS public.perfil_progreso (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid DEFAULT gen_random_uuid(),
  tipo text,
  fecha date,
  porcentaje int2,
  creado_en timestamp
);

CREATE TABLE IF NOT EXISTS public.perfil_recomendaciones (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid DEFAULT gen_random_uuid(),
  recomendacion text,
  origen text,
  creado_en timestamp
);

CREATE TABLE IF NOT EXISTS public.perfil_rendimiento (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid DEFAULT gen_random_uuid(),
  seccion text,
  tiempo_dedicado int2,
  fortaleza bool,
  creado_en timestamp
);

CREATE TABLE IF NOT EXISTS public.perfil_timeline_actividad (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid DEFAULT gen_random_uuid(),
  evento text,
  tipo text,
  creado_en timestamp
);

CREATE TABLE IF NOT EXISTS public.placement_feedback (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  result_id uuid DEFAULT gen_random_uuid(),
  mensaje text,
  tipo text
);

CREATE TABLE IF NOT EXISTS public.placement_partes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  nombre_parte text,
  descripcion text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.placement_preguntas (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  test_id uuid DEFAULT gen_random_uuid(),
  pregunta text,
  explicacion text,
  partes_id uuid
);

CREATE TABLE IF NOT EXISTS public.placement_respuestas (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  pregunta_id uuid DEFAULT gen_random_uuid(),
  respuesta text,
  correcta bool,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.placement_results (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid DEFAULT gen_random_uuid(),
  test_id uuid DEFAULT gen_random_uuid(),
  nivel_asignado text,
  score int2,
  fecha timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.placement_rules (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  test_id uuid DEFAULT gen_random_uuid(),
  nota_minima int2,
  nota_maxima int2,
  tiempo_maximo int2,
  intentos_permitidos int2,
  ajuste_dificultad bool
);

CREATE TABLE IF NOT EXISTS public.placement_sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid DEFAULT gen_random_uuid(),
  test_id uuid DEFAULT gen_random_uuid(),
  estado text,
  inicio timestamptz,
  fin timestamptz,
  score_obtenido int2,
  nivel_asignado text
);

CREATE TABLE IF NOT EXISTS public.placement_tests (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  nombre text,
  descripcion text,
  dificultad text,
  creada_en timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.plan_objetivos (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  placement_level text,
  exam_goal_date date,
  hours_per_week numeric(4,1),
  study_goals jsonb NOT NULL DEFAULT '[]'::jsonb,
  strengths jsonb NOT NULL DEFAULT '[]'::jsonb,
  weaknesses jsonb NOT NULL DEFAULT '[]'::jsonb,
  other_notes text,
  survey_data jsonb,
  plan_document jsonb,
  plan_summary text,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.plan_usage_counters (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  usage_key text NOT NULL,
  period_type text NOT NULL,
  period_key text NOT NULL,
  count int4 NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.pro_launch_grants (
  user_id uuid NOT NULL,
  slot_number int4 NOT NULL,
  email text NOT NULL,
  offer_cohort text NOT NULL DEFAULT 'pro_launch_25'::text,
  granted_at timestamptz NOT NULL DEFAULT now(),
  pro_trial_ends_at timestamptz NOT NULL,
  email_sent_at timestamptz
);

CREATE TABLE IF NOT EXISTS public.profesor_alumnos (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  profesor_id uuid NOT NULL,
  alumno_id uuid NOT NULL,
  creado_en timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.profesor_calendly (
  profesor_id uuid NOT NULL,
  calendly_url text,
  presentacion text,
  activo bool NOT NULL DEFAULT true,
  ofrece_online bool NOT NULL DEFAULT true,
  ofrece_presencial bool NOT NULL DEFAULT false,
  calendly_url_presencial text,
  info_presencial text,
  creado_en timestamptz NOT NULL DEFAULT now(),
  actualizado_en timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.profesor_calificaciones (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  profesor_id uuid NOT NULL,
  alumno_id uuid NOT NULL,
  titulo text NOT NULL,
  nota float8 NOT NULL,
  comentario text,
  creado_en timestamptz NOT NULL DEFAULT now(),
  actualizado_en timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.profesor_tareas (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  profesor_id uuid NOT NULL,
  alumno_id uuid,
  titulo text NOT NULL,
  descripcion text,
  enlace text,
  fecha_limite timestamptz,
  estado text NOT NULL DEFAULT 'pendiente'::text,
  creado_en timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.question_explanations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  question_id uuid,
  level text,
  skill text,
  part text,
  question_text text,
  correct_answer text,
  wrong_answer text,
  explanation text NOT NULL,
  short_explanation text,
  example text,
  created_by text DEFAULT 'admin'::text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.quiz_lives (
  user_id uuid NOT NULL,
  lives int4 NOT NULL,
  next_life_at timestamptz,
  version int4 NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.referral_invitations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  inviter_user_id uuid NOT NULL,
  invitee_email text NOT NULL,
  invite_token text NOT NULL,
  custom_message text,
  status text NOT NULL DEFAULT 'sent'::text,
  invited_user_id uuid,
  paid_plan_slug text,
  email_sent_at timestamptz NOT NULL DEFAULT now(),
  registered_at timestamptz,
  paid_at timestamptz,
  reward_granted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.resenas_web (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  display_name text NOT NULL,
  body text NOT NULL,
  stars int2 NOT NULL,
  published bool NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  ip_hash text,
  user_id uuid
);

CREATE TABLE IF NOT EXISTS public.seguimiento_consentimientos (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  version text NOT NULL,
  accion text NOT NULL,
  registrado_en timestamptz NOT NULL DEFAULT now(),
  user_agent text
);

CREATE TABLE IF NOT EXISTS public.seguimiento_sesiones (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  started_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz,
  status text NOT NULL DEFAULT 'activa'::text,
  focus_seconds int4 NOT NULL DEFAULT 0,
  away_seconds int4 NOT NULL DEFAULT 0,
  idle_seconds int4 NOT NULL DEFAULT 0,
  away_count int4 NOT NULL DEFAULT 0,
  longest_away_seconds int4 NOT NULL DEFAULT 0,
  areas jsonb NOT NULL DEFAULT '{}'::jsonb,
  resumen text,
  resumen_bullets jsonb,
  resumen_generado_en timestamptz,
  consent_version text NOT NULL,
  consent_at timestamptz NOT NULL DEFAULT now(),
  idle_detection_granted bool NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.seguridad_accesos (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid DEFAULT gen_random_uuid(),
  ip text,
  user_agent text,
  exitoso bool,
  tipo text,
  fecha timestamp
);

CREATE TABLE IF NOT EXISTS public.seguridad_cookies (
  "Identificador único" uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid DEFAULT gen_random_uuid(),
  aceptado bool,
  fecha timestamp,
  ip text
);

CREATE TABLE IF NOT EXISTS public.seguridad_textos_aceptados (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid DEFAULT gen_random_uuid(),
  texto_id uuid DEFAULT gen_random_uuid(),
  fecha timestamp,
  ip text
);

CREATE TABLE IF NOT EXISTS public.seguridad_textos_legales (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  clave text,
  titulo text,
  contenido text,
  version text,
  activo bool,
  creado_en timestamp
);

CREATE TABLE IF NOT EXISTS public.seguridad_tutores (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid DEFAULT gen_random_uuid(),
  nombre text,
  email text,
  telefono text,
  dni text,
  relacion text,
  fecha_asignacion timestamp
);

CREATE TABLE IF NOT EXISTS public.soporte_correos_automaticos (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  slug text NOT NULL,
  nombre text NOT NULL,
  trigger_event text NOT NULL,
  trigger_reason text NOT NULL DEFAULT ''::text,
  asunto text NOT NULL,
  cuerpo text NOT NULL,
  activo bool NOT NULL DEFAULT true,
  delay_minutos int4 NOT NULL DEFAULT 0,
  es_sistema bool NOT NULL DEFAULT false,
  creado_en timestamptz NOT NULL DEFAULT now(),
  actualizado_en timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.soporte_correos_cola (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  plantilla_id uuid,
  slug text,
  destinatario text NOT NULL,
  variables jsonb NOT NULL DEFAULT '{}'::jsonb,
  enviar_en timestamptz NOT NULL,
  estado text NOT NULL DEFAULT 'pendiente'::text,
  intentos int4 NOT NULL DEFAULT 0,
  error_msg text,
  creado_en timestamptz NOT NULL DEFAULT now(),
  enviado_en timestamptz
);

CREATE TABLE IF NOT EXISTS public.soporte_correos_log (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  plantilla_id uuid,
  slug text,
  destinatario text NOT NULL,
  trigger_event text,
  canal text,
  ok bool NOT NULL DEFAULT true,
  error_msg text,
  enviado_en timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.speaking_b2_assessments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL,
  user_id uuid,
  grammar_vocabulary float4,
  discourse_management float4,
  pronunciation float4,
  interactive_communication float4,
  global_achievement float4,
  evidence jsonb NOT NULL DEFAULT '{}'::jsonb,
  official_cambridge bool NOT NULL DEFAULT false,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.speaking_b2_exams (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  code text NOT NULL,
  title text NOT NULL,
  part int4 NOT NULL,
  cefr text NOT NULL DEFAULT 'B2'::text,
  version int4 NOT NULL DEFAULT 1,
  review_status text NOT NULL DEFAULT 'approved'::text,
  duration_target_sec int4 NOT NULL DEFAULT 120,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.speaking_b2_issues (
  id text NOT NULL,
  session_id uuid NOT NULL,
  assessment_id uuid,
  question_id text,
  code text NOT NULL,
  original_text text NOT NULL DEFAULT ''::text,
  excerpt text NOT NULL DEFAULT ''::text,
  suggestion text NOT NULL DEFAULT ''::text,
  explanation text NOT NULL DEFAULT ''::text,
  severity text NOT NULL DEFAULT 'medium'::text,
  confidence float4,
  evidence text,
  audio_start_ms int4,
  skill_to_reinforce text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.speaking_b2_questions (
  id text NOT NULL,
  exam_id uuid NOT NULL,
  exam_code text NOT NULL,
  part int4 NOT NULL DEFAULT 1,
  theme text NOT NULL,
  level text NOT NULL DEFAULT 'B2'::text,
  question text NOT NULL,
  communicative_aims jsonb NOT NULL DEFAULT '[]'::jsonb,
  allowed_follow_ups jsonb NOT NULL DEFAULT '[]'::jsonb,
  review_status text NOT NULL DEFAULT 'approved'::text,
  version int4 NOT NULL DEFAULT 1,
  sort_order int4 NOT NULL DEFAULT 0,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.speaking_b2_quota_charges (
  session_id uuid NOT NULL,
  user_id uuid NOT NULL,
  usage_key text NOT NULL DEFAULT 'speaking_correction'::text,
  status text NOT NULL DEFAULT 'claimed'::text,
  created_at timestamptz NOT NULL DEFAULT now(),
  consumed_at timestamptz
);

CREATE TABLE IF NOT EXISTS public.speaking_b2_recommendations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL,
  sort_order int4 NOT NULL DEFAULT 0,
  title text NOT NULL,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.speaking_b2_sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  exam_id uuid,
  exam_code text NOT NULL DEFAULT 'SP-EX001'::text,
  state text NOT NULL DEFAULT 'READY'::text,
  idempotency_key text,
  started_at timestamptz,
  ended_at timestamptz,
  candidate_speaking_ms int4 NOT NULL DEFAULT 0,
  access_token_hash text,
  expires_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  row_version int4 NOT NULL DEFAULT 1,
  evaluation_charged bool NOT NULL DEFAULT false,
  evaluation_in_flight bool NOT NULL DEFAULT false,
  evaluation_lock_at timestamptz,
  pending_report jsonb,
  report jsonb
);

CREATE TABLE IF NOT EXISTS public.speaking_b2_turns (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL,
  role text NOT NULL,
  question_id text,
  spoken_text text NOT NULL DEFAULT ''::text,
  transcript text NOT NULL DEFAULT ''::text,
  stt_confidence float4,
  transcript_source text NOT NULL DEFAULT 'STT'::text,
  audio_path text,
  mime_type text,
  started_ms int4,
  ended_ms int4,
  validation text,
  created_at timestamptz NOT NULL DEFAULT now(),
  turn_index int4 NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.speaking_respuestas (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  session_id text NOT NULL,
  turn_id text,
  mode text NOT NULL,
  cefr text NOT NULL,
  b2_part_number int4,
  exam_part_index int4 NOT NULL DEFAULT 0,
  transcript text NOT NULL DEFAULT ''::text,
  transcript_source text NOT NULL DEFAULT 'STT'::text,
  storage_path text NOT NULL,
  audio_url text NOT NULL,
  mime_type text NOT NULL,
  file_size_bytes int8 NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.staff_buzon_digest_envios (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  digest_date date NOT NULL,
  message_count int4 NOT NULL DEFAULT 0,
  sent_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.staff_buzon_grupo_miembros (
  group_id uuid NOT NULL,
  user_id uuid NOT NULL,
  joined_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.staff_buzon_grupos (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  description text
);

CREATE TABLE IF NOT EXISTS public.staff_buzon_mensaje_reacciones (
  message_id uuid NOT NULL,
  user_id uuid NOT NULL,
  emoji text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.staff_buzon_mensajes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL,
  recipient_id uuid,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  read_at timestamptz,
  group_id uuid,
  attachment_url text,
  attachment_name text,
  attachment_mime text,
  attachment_kind text
);

CREATE TABLE IF NOT EXISTS public.staff_buzon_mensajes_destacados (
  user_id uuid NOT NULL,
  message_id uuid NOT NULL,
  starred_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.staff_buzon_presencia (
  user_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'disponible'::text,
  activity text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.staff_buzon_push_subscriptions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  endpoint text NOT NULL,
  p256dh text NOT NULL,
  auth_key text NOT NULL,
  expiration_time int8,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.staff_fases (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  descripcion text,
  estado text NOT NULL DEFAULT 'no_iniciada'::text,
  orden int4 NOT NULL DEFAULT 0,
  fecha_inicio date,
  fecha_limite date,
  responsable_id uuid,
  responsable_rol text,
  visible_para_todos bool NOT NULL DEFAULT true,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  responsables_ids _uuid NOT NULL DEFAULT '{}'::uuid[],
  responsables_todos bool NOT NULL DEFAULT false
);

CREATE TABLE IF NOT EXISTS public.staff_reuniones (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  titulo text,
  fecha date NOT NULL,
  hora time,
  departamentos jsonb NOT NULL DEFAULT '[]'::jsonb,
  puntos_dia jsonb NOT NULL DEFAULT '[]'::jsonb,
  notas text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  notion_page_id text
);

CREATE TABLE IF NOT EXISTS public.staff_reuniones_encuesta_opciones (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  encuesta_id uuid NOT NULL,
  fecha date NOT NULL,
  hora time,
  orden int4 NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.staff_reuniones_encuesta_votos (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  opcion_id uuid NOT NULL,
  user_id uuid NOT NULL,
  voto text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.staff_reuniones_encuestas (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  titulo text NOT NULL,
  notas text,
  departamentos jsonb NOT NULL DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'open'::text,
  meeting_id uuid,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.staff_role_permissions (
  role_key text NOT NULL,
  permission_keys _text NOT NULL DEFAULT '{}'::text[],
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.staff_subfases (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  fase_id uuid NOT NULL,
  nombre text NOT NULL,
  descripcion text,
  estado text NOT NULL DEFAULT 'no_iniciada'::text,
  orden int4 NOT NULL DEFAULT 0,
  fecha_inicio date,
  fecha_limite date,
  visible_para_todos bool NOT NULL DEFAULT true,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.staff_tarea_archivos (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tarea_id uuid NOT NULL,
  nombre text NOT NULL,
  mime text,
  kind text,
  storage_path text NOT NULL,
  size_bytes int4,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.staff_tarea_lecturas (
  tarea_id uuid NOT NULL,
  user_id uuid NOT NULL,
  last_read_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.staff_tarea_mensajes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tarea_id uuid NOT NULL,
  sender_id uuid NOT NULL,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.staff_tarea_plantillas (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  titulo text NOT NULL,
  descripcion text,
  enlace text,
  creado_por uuid,
  creado_en timestamptz NOT NULL DEFAULT now(),
  actualizado_en timestamptz NOT NULL DEFAULT now(),
  prioridad_default text DEFAULT 'media'::text,
  asignado_rol_default text,
  fase_id uuid,
  checklist_default jsonb DEFAULT '[]'::jsonb,
  activa bool NOT NULL DEFAULT true,
  notas_default text
);

CREATE TABLE IF NOT EXISTS public.staff_tareas (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  titulo text NOT NULL,
  descripcion text,
  estado text NOT NULL DEFAULT 'pendiente'::text,
  prioridad text NOT NULL DEFAULT 'media'::text,
  fase_id uuid,
  asignado_id uuid,
  asignado_rol text,
  alumno_id uuid,
  fecha_limite timestamptz,
  completada_at timestamptz,
  cancelada_at timestamptz,
  bloqueada_motivo text,
  enlace text,
  notas text,
  checklist jsonb DEFAULT '[]'::jsonb,
  plantilla_id uuid,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  subfase_id uuid,
  asignados_ids _uuid NOT NULL DEFAULT '{}'::uuid[]
);

CREATE TABLE IF NOT EXISTS public.suscripciones (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  stripe_customer_id text NOT NULL,
  stripe_subscription_id text,
  stripe_price_id text,
  plan_id text NOT NULL,
  "interval" text NOT NULL,
  status text NOT NULL,
  current_period_end timestamptz,
  cancel_at_period_end bool NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.teoria_contenidos (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tema_id uuid DEFAULT gen_random_uuid(),
  tipo text,
  contenido text,
  orden int2,
  creado_en timestamp
);

CREATE TABLE IF NOT EXISTS public.teoria_ejercicios (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  contenido_id uuid DEFAULT gen_random_uuid(),
  pregunta text,
  opciones jsonb,
  respuesta_correcta text,
  explicacion text
);

CREATE TABLE IF NOT EXISTS public.teoria_favoritos (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid DEFAULT gen_random_uuid(),
  contenido_id uuid DEFAULT gen_random_uuid(),
  creado_en timestamp
);

CREATE TABLE IF NOT EXISTS public.teoria_progreso (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  uuid_usuario uuid NOT NULL,
  apartado text NOT NULL,
  topic_href text NOT NULL,
  progreso_pct int2 NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.teoria_temas (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  titulo text,
  descripcion text,
  creado_en timestamp
);

CREATE TABLE IF NOT EXISTS public.training_cursos (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  nombre text,
  descripcion text
);

CREATE TABLE IF NOT EXISTS public.training_ejercicios (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  unidad_id uuid DEFAULT gen_random_uuid(),
  dificultad text,
  tiempo_estimado int2,
  enunciado text,
  tipo text,
  activo bool
);

CREATE TABLE IF NOT EXISTS public.training_estadisticas_usuario (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid DEFAULT gen_random_uuid(),
  unidad_id uuid DEFAULT gen_random_uuid(),
  total_hechos int2,
  total_correctos int2,
  tiempo_total int2,
  actualizado_en timestamp
);

CREATE TABLE IF NOT EXISTS public.training_experiencia_niveles (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  nivel text,
  rango int8,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.training_experiencia_usuario (
  user_id uuid NOT NULL,
  nivel_cefr text NOT NULL,
  skill text NOT NULL,
  dificultad text NOT NULL,
  nivel int2 NOT NULL,
  estrellas int2 NOT NULL,
  actualizado_en timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.training_explicaciones (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  ejercicio_id uuid DEFAULT gen_random_uuid(),
  contenido text,
  multimedia_url text
);

CREATE TABLE IF NOT EXISTS public.training_favoritos (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid DEFAULT gen_random_uuid(),
  ejercicio_id uuid DEFAULT gen_random_uuid(),
  creado_en timestamp
);

CREATE TABLE IF NOT EXISTS public.training_intentos (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid DEFAULT gen_random_uuid(),
  ejercicio_id uuid DEFAULT gen_random_uuid(),
  intento_num int2,
  respuesta text,
  correcta bool,
  creado timestamp
);

CREATE TABLE IF NOT EXISTS public.training_lives (
  user_id uuid NOT NULL,
  lives int4 NOT NULL,
  next_life_at timestamptz,
  version int4 NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.training_niveles (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  clave text,
  nombre text,
  orden int2
);

CREATE TABLE IF NOT EXISTS public.training_respuestas (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid DEFAULT gen_random_uuid(),
  ejercicio_id uuid DEFAULT gen_random_uuid(),
  respuesta text,
  correcta bool,
  tiempo int2,
  creado_en timestamp
);

CREATE TABLE IF NOT EXISTS public.training_tiempos (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid DEFAULT gen_random_uuid(),
  ejercicio_id uuid DEFAULT gen_random_uuid(),
  segundos int2,
  creado_en timestamp
);

CREATE TABLE IF NOT EXISTS public.training_unidades (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  curso_id uuid DEFAULT gen_random_uuid(),
  nombre text,
  descripcion text,
  orden int2
);

CREATE TABLE IF NOT EXISTS public.user_error_tracker (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  source text NOT NULL,
  level text,
  skill text,
  error_type text,
  original_text text NOT NULL,
  corrected_text text NOT NULL,
  explanation text,
  suggestion text,
  frequency int4 DEFAULT 1,
  mastered bool DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  id_pregunta uuid DEFAULT gen_random_uuid()
);

CREATE TABLE IF NOT EXISTS public.user_practice_error_reviews (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  error_key text NOT NULL,
  reviewed_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.usuario_navegacion (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  path text NOT NULL,
  page_title text,
  visited_at timestamptz NOT NULL DEFAULT now(),
  duration_seconds int4 NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.usuario_presencia (
  user_id uuid NOT NULL,
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  total_session_seconds int8 NOT NULL DEFAULT 0,
  current_session_id uuid
);

CREATE TABLE IF NOT EXISTS public.usuario_sesiones_app (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  started_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz,
  duration_seconds int8 NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  device_type text
);

CREATE TABLE IF NOT EXISTS public.writing_assessment_criteria (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  execution_id uuid NOT NULL,
  criterion text NOT NULL,
  mark int2 NOT NULL,
  band_anchor text NOT NULL,
  why_not_higher text NOT NULL,
  why_not_lower text,
  confidence text NOT NULL,
  confidence_reason text,
  band_ceiling_reached bool NOT NULL,
  band_floor_reached bool NOT NULL,
  decision_record jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.writing_assessments (
  execution_id uuid NOT NULL,
  status text NOT NULL,
  incomplete_reason text,
  raw_total int2,
  max_total int2 NOT NULL DEFAULT 20,
  overall_confidence text,
  single_task_scale_claim_allowed bool NOT NULL DEFAULT false,
  word_count int4,
  word_count_penalty_applied bool NOT NULL DEFAULT false,
  calibration_status text NOT NULL DEFAULT 'not_calibrated'::text,
  assessment_record jsonb NOT NULL,
  provenance jsonb NOT NULL,
  engine_version text NOT NULL,
  schema_version text NOT NULL,
  cambridge_assessment_version text NOT NULL,
  assessment_prompt_version text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.writing_engine_executions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  submission_id uuid NOT NULL,
  previous_execution_id uuid,
  execution_label text,
  status text NOT NULL DEFAULT 'running'::text,
  engine_version text NOT NULL,
  schema_version text NOT NULL,
  doc_versions jsonb NOT NULL,
  prompt_versions jsonb NOT NULL,
  model_config jsonb NOT NULL,
  engine_config_snapshot jsonb NOT NULL DEFAULT '{}'::jsonb,
  task_fingerprint text,
  task_analysis_id uuid,
  task_analysis_cache_hit bool NOT NULL DEFAULT false,
  validation_status text,
  retry_count int2 NOT NULL DEFAULT 0,
  failure_stage text,
  incomplete_reason text,
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  latency_ms int4,
  latency_by_stage jsonb NOT NULL DEFAULT '{}'::jsonb,
  token_source text,
  input_tokens int4,
  output_tokens int4,
  total_tokens int4,
  usage_by_stage jsonb NOT NULL DEFAULT '{}'::jsonb,
  actual_models jsonb NOT NULL DEFAULT '{}'::jsonb,
  cost_usd numeric(12,6),
  cost_eur numeric(12,6),
  cost_basis jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.writing_feedback_payloads (
  execution_id uuid NOT NULL,
  payload jsonb NOT NULL,
  raw_total int2,
  annotation_count int2 NOT NULL DEFAULT 0,
  opening_strength_count int2 NOT NULL DEFAULT 0,
  learner_history_applied bool NOT NULL DEFAULT false,
  history_overlay jsonb,
  history_evidence_ids jsonb NOT NULL DEFAULT '[]'::jsonb,
  feedback_prompt_version text NOT NULL,
  feedback_schema_version text NOT NULL,
  engine_version text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.writing_observations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  execution_id uuid NOT NULL,
  observation_id text NOT NULL,
  domain text NOT NULL,
  observation_type text NOT NULL,
  polarity text NOT NULL,
  scope text NOT NULL,
  span_start int4,
  span_end int4,
  binding_status text NOT NULL,
  renderable_locally bool NOT NULL,
  communicative_impact text NOT NULL,
  meaning_blocking bool NOT NULL,
  pedagogical_priority text NOT NULL,
  confidence text NOT NULL,
  pattern_key text,
  pattern_group_id text,
  observation jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.writing_submissions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  pregunta_id uuid,
  examen_id uuid,
  parte_numero int2,
  submission_source text NOT NULL,
  cefr_level text NOT NULL DEFAULT 'b2'::text,
  task_type text NOT NULL,
  task_prompt_snapshot text NOT NULL,
  task_context_snapshot jsonb NOT NULL DEFAULT '{}'::jsonb,
  candidate_response text NOT NULL,
  candidate_response_hash text NOT NULL,
  word_count int4 NOT NULL,
  submitted_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.writing_task_analyses (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  task_fingerprint text NOT NULL,
  task_type text NOT NULL,
  source_task_hash text NOT NULL,
  task_analysis jsonb NOT NULL,
  task_requirements_version text NOT NULL,
  task_analysis_schema_version text NOT NULL,
  task_analysis_prompt_version text NOT NULL,
  engine_version text NOT NULL,
  model_config jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.writing_validation_results (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  execution_id uuid NOT NULL,
  stage text NOT NULL,
  attempt int2 NOT NULL,
  validation_status text NOT NULL,
  validation_mode text NOT NULL DEFAULT 'current_generation'::text,
  failed_rules jsonb NOT NULL DEFAULT '[]'::jsonb,
  warnings jsonb NOT NULL DEFAULT '[]'::jsonb,
  retry_target text,
  retry_reason text,
  validator_version text NOT NULL,
  engine_version text NOT NULL,
  schema_version text NOT NULL,
  validated_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);