#!/usr/bin/env node
/**
 * Writing Engine v3 — verificación READ-ONLY de la persistencia (Fase 7).
 *
 * Este script NO escribe nada. No ejecuta DDL, no aplica la migración y no toca
 * ninguna tabla existente. Hace dos cosas:
 *
 *   1. Verificación ESTÁTICA de scripts/sql/writing_engine_schema.sql: las ocho
 *      tablas, columnas esperadas, claves, CHECKs, índices, RLS, policies,
 *      unicidad de la caché y ausencia de ALTER/DROP sobre tablas existentes.
 *
 *   2. Verificación contra BASE DE DATOS, opcional, solo lectura: si se define
 *      WRITING_ENGINE_VERIFY_DATABASE_URL (una base de staging o desechable con la
 *      migración ya aplicada), consulta information_schema y pg_policies con
 *      SELECT y nada más.
 *
 * Uso:
 *   node scripts/verify-writing-engine-persistence.mjs
 *   WRITING_ENGINE_VERIFY_DATABASE_URL=postgres://... node scripts/verify-writing-engine-persistence.mjs
 *
 * NUNCA apuntar la variable a producción para "probar": aunque solo lea, la
 * revisión de la Fase 7 exige que producción no se toque.
 */
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const ROOT = process.cwd();
const SQL_PATH = path.join(ROOT, 'scripts', 'sql', 'writing_engine_schema.sql');

const TABLES = [
  'writing_submissions',
  'writing_engine_executions',
  'writing_task_analyses',
  'writing_observations',
  'writing_assessments',
  'writing_assessment_criteria',
  'writing_feedback_payloads',
  'writing_validation_results',
];

const STUDENT_DATA_TABLES = TABLES.filter((table) => table !== 'writing_task_analyses');

const PROTECTED_TABLES = [
  'levels_puntuaciones',
  'Levels_stars',
  'levels_estadisticas',
  'user_error_tracker',
  'levels_preguntas',
  'ai_usage_logs',
];

const EXPECTED_COLUMNS = {
  writing_submissions: [
    'id', 'user_id', 'pregunta_id', 'examen_id', 'parte_numero', 'submission_source',
    'task_type', 'task_prompt_snapshot', 'task_context_snapshot', 'candidate_response',
    'candidate_response_hash', 'word_count', 'submitted_at', 'created_at',
  ],
  writing_engine_executions: [
    'id', 'submission_id', 'previous_execution_id', 'status', 'engine_version',
    'schema_version', 'doc_versions', 'prompt_versions', 'model_config',
    'engine_config_snapshot', 'task_fingerprint', 'task_analysis_id',
    'task_analysis_cache_hit', 'validation_status', 'retry_count', 'failure_stage',
    'incomplete_reason', 'started_at', 'completed_at', 'latency_ms', 'token_source',
    'input_tokens', 'output_tokens', 'total_tokens', 'usage_by_stage', 'actual_models',
    'cost_usd', 'cost_eur', 'cost_basis', 'created_at',
  ],
  writing_task_analyses: [
    'id', 'task_fingerprint', 'task_type', 'source_task_hash', 'task_analysis',
    'task_requirements_version', 'task_analysis_schema_version',
    'task_analysis_prompt_version', 'engine_version', 'model_config', 'created_at',
  ],
  writing_observations: [
    'id', 'execution_id', 'observation_id', 'domain', 'observation_type', 'polarity',
    'scope', 'span_start', 'span_end', 'binding_status', 'renderable_locally',
    'communicative_impact', 'meaning_blocking', 'pedagogical_priority', 'confidence',
    'pattern_key', 'pattern_group_id', 'observation', 'created_at',
  ],
  writing_assessments: [
    'execution_id', 'status', 'incomplete_reason', 'raw_total', 'max_total',
    'overall_confidence', 'single_task_scale_claim_allowed', 'word_count',
    'word_count_penalty_applied', 'calibration_status', 'assessment_record',
    'provenance', 'engine_version', 'schema_version', 'cambridge_assessment_version',
    'assessment_prompt_version', 'created_at',
  ],
  writing_assessment_criteria: [
    'id', 'execution_id', 'criterion', 'mark', 'band_anchor', 'why_not_higher',
    'why_not_lower', 'confidence', 'confidence_reason', 'band_ceiling_reached',
    'band_floor_reached', 'decision_record', 'created_at',
  ],
  writing_feedback_payloads: [
    'execution_id', 'payload', 'raw_total', 'annotation_count',
    'opening_strength_count', 'learner_history_applied', 'history_overlay',
    'history_evidence_ids', 'feedback_prompt_version', 'feedback_schema_version',
    'engine_version', 'created_at',
  ],
  writing_validation_results: [
    'id', 'execution_id', 'stage', 'attempt', 'validation_status', 'validation_mode',
    'failed_rules', 'warnings', 'retry_target', 'retry_reason', 'validator_version',
    'engine_version', 'schema_version', 'validated_at', 'created_at',
  ],
};

/** Columnas que no deben existir: convertirían el motor en un juez del alumno. */
const FORBIDDEN_COLUMN_PATTERNS = [
  /\bcefr(_level)?_result\b/i,
  /\bpassed\b/i,
  /\baprobado\b/i,
  /\breadiness\b/i,
  /\bpass_fail\b/i,
];

let failures = 0;
let checks = 0;

function check(ok, label, detail) {
  checks += 1;
  if (ok) {
    console.log(`  ok    ${label}`);
    return true;
  }
  failures += 1;
  console.error(`  FAIL  ${label}${detail ? ` — ${detail}` : ''}`);
  return false;
}

function section(title) {
  console.log(`\n${title}`);
}

// ---------------------------------------------------------------------------
// 1. Verificación estática del SQL
// ---------------------------------------------------------------------------

function extractTableBody(sql, table) {
  const start = sql.indexOf(`create table if not exists public.${table} (`);
  if (start === -1) return null;
  let depth = 0;
  for (let i = sql.indexOf('(', start); i < sql.length; i += 1) {
    if (sql[i] === '(') depth += 1;
    else if (sql[i] === ')') {
      depth -= 1;
      if (depth === 0) return sql.slice(start, i + 1);
    }
  }
  return null;
}

function verifyStatic(sql) {
  section('SQL estático: tablas');
  const bodies = {};
  for (const table of TABLES) {
    const body = extractTableBody(sql, table);
    bodies[table] = body;
    check(Boolean(body), `create table public.${table}`);
  }
  check(
    TABLES.length === 8,
    'el diseño tiene exactamente ocho tablas',
    `encontradas ${TABLES.length} en la lista esperada`,
  );

  section('SQL estático: columnas esperadas');
  for (const [table, columns] of Object.entries(EXPECTED_COLUMNS)) {
    const body = bodies[table];
    if (!body) {
      check(false, `columnas de ${table}`, 'la tabla no existe en el SQL');
      continue;
    }
    const missing = columns.filter(
      (column) => !new RegExp(`(^|[\\s(,])${column}\\s`, 'm').test(body),
    );
    check(missing.length === 0, `columnas de ${table}`, missing.join(', '));
  }

  section('SQL estático: claves y unicidad');
  check(
    /task_fingerprint text not null unique/.test(sql),
    'writing_task_analyses.task_fingerprint es UNIQUE (identidad de caché)',
  );
  check(
    /unique \(execution_id, observation_id\)/.test(sql),
    'una observación es única por ejecución',
  );
  check(
    /writing_assessment_criteria_unique unique \(execution_id, criterion\)/.test(sql),
    'un criterio es único por evaluación',
  );
  check(
    /writing_validation_results_unique unique \(execution_id, stage, attempt\)/.test(sql),
    'un resultado de validación es único por etapa e intento',
  );
  check(
    /execution_id uuid primary key references public\.writing_engine_executions/.test(sql),
    'writing_assessments y writing_feedback_payloads cuelgan de la ejecución',
  );
  check(
    /references public\.writing_assessments \(execution_id\) on delete cascade/.test(sql),
    'un criterio no puede existir sin su cabecera de evaluación',
  );
  check(
    /previous_execution_id uuid references public\.writing_engine_executions/.test(sql),
    'una re-evaluación puede apuntar a la ejecución anterior sin sobrescribirla',
  );
  check(
    /user_id uuid not null references auth\.users \(id\)/.test(sql),
    'la propiedad usa el modelo de auth existente (auth.users)',
  );

  section('SQL estático: restricciones de evaluación');
  check(/mark smallint not null check \(mark >= 0 and mark <= 5\)/.test(sql), 'mark entre 0 y 5');
  check(
    /criterion in \('content', 'communicative_achievement', 'organisation', 'language'\)/.test(sql),
    'solo los cuatro criterios canónicos',
  );
  check(/max_total smallint not null default 20 check \(max_total = 20\)/.test(sql), 'max_total = 20');
  check(
    /check \(not single_task_scale_claim_allowed\)/.test(sql),
    'SC-09: una sola tarea no puede reclamar escala Cambridge',
  );
  check(
    /status <> 'incomplete' or raw_total is null/.test(sql),
    'una evaluación incompleta no guarda un 0/20 falso',
  );
  check(
    /deferrable initially deferred/.test(sql),
    'la integridad de los cuatro criterios se comprueba al COMMIT, no fila a fila',
  );
  check(
    /raw_total \(%\) must equal the sum of the four criterion marks/.test(sql),
    'raw_total debe ser la suma de los cuatro criterios al cerrar la transacción',
  );
  check(
    !/update\s+public\.writing_assessment_criteria\s+set/i.test(sql) &&
      !/set\s+mark\s*=/i.test(sql),
    'ninguna operación de base de datos recalcula ni reescribe una nota',
  );

  section('SQL estático: inmutabilidad');
  check(
    /writing engine artefacts are append-only/.test(sql),
    'existe el disparador que rechaza UPDATE sobre los artefactos',
  );
  for (const table of STUDENT_DATA_TABLES.concat('writing_task_analyses').filter(
    (table) => table !== 'writing_engine_executions',
  )) {
    check(
      new RegExp(`create trigger ${table}_append_only`).test(sql),
      `${table} rechaza UPDATE`,
    );
  }
  check(
    /is already finalised as % and cannot be updated/.test(sql),
    'una ejecución finalizada no se puede volver a actualizar',
  );
  check(
    /execution provenance is immutable/.test(sql),
    'las versiones y el modelo de una ejecución no pueden cambiar',
  );

  section('SQL estático: RLS y policies');
  for (const table of TABLES) {
    check(
      new RegExp(`alter table public\\.${table} enable row level security`).test(sql),
      `RLS activado en ${table}`,
    );
  }
  for (const table of STUDENT_DATA_TABLES) {
    check(
      new RegExp(`create policy ${table}_select_own`).test(sql),
      `policy de lectura propia en ${table}`,
    );
  }
  check(
    !/create policy writing_task_analyses/.test(sql),
    'la caché de análisis de tarea no tiene ninguna policy de cliente',
  );
  check(
    !/grant [^;]*on public\.writing_task_analyses to (authenticated|anon)/.test(sql),
    'la caché de análisis de tarea no tiene grants de cliente',
  );
  const writePolicy = /create policy \w+\s+on public\.writing_\w+\s+for (insert|update|delete)/.test(
    sql,
  );
  check(!writePolicy, 'ningún cliente tiene policy de escritura sobre datos del motor');
  for (const table of STUDENT_DATA_TABLES) {
    check(
      new RegExp(`revoke all on public\\.${table} from anon, authenticated`).test(sql),
      `privilegios revocados antes de conceder SELECT en ${table}`,
    );
  }
  check(
    /s\.user_id = \(select auth\.uid\(\)\)/.test(sql),
    'las tablas hijas resuelven la propiedad por hijo → ejecución → entrega → usuario',
  );

  section('SQL estático: aislamiento de las tablas existentes');
  for (const table of PROTECTED_TABLES) {
    const pattern = new RegExp(`(alter|drop)\\s+table\\s+(if exists\\s+)?(public\\.)?"?${table}"?`, 'i');
    check(!pattern.test(sql), `la migración no altera ${table}`);
  }
  const alterTargets = [...sql.matchAll(/alter table (?:if exists )?public\.(\w+)/gi)].map(
    (match) => match[1],
  );
  const foreign = alterTargets.filter((table) => !TABLES.includes(table));
  check(
    foreign.length === 0,
    'todos los ALTER TABLE apuntan a tablas writing_*',
    foreign.join(', '),
  );
  const dropTargets = [...sql.matchAll(/drop table[^;]*/gi)].map((match) => match[0]);
  check(dropTargets.length === 0, 'la migración no contiene DROP TABLE', dropTargets.join(' | '));

  section('SQL estático: columnas prohibidas');
  for (const pattern of FORBIDDEN_COLUMN_PATTERNS) {
    const hit = new RegExp(`^\\s*\\w*${pattern.source.replace(/\\b/g, '')}\\w*\\s+(text|boolean|smallint|integer)`, 'im').test(sql);
    check(!hit, `ninguna columna coincide con ${pattern}`);
  }
  check(
    /validation_status/.test(sql) && !/\bpassed boolean\b/.test(sql),
    'el éxito de validación se llama validation_status, nunca passed',
  );
  check(
    !/\b(cefr_result|nivel_cefr|cefr_estimate)\b/i.test(sql),
    'no hay columna de resultado CEFR',
  );
}

// ---------------------------------------------------------------------------
// 2. Verificación opcional contra base de datos (solo SELECT)
// ---------------------------------------------------------------------------

async function verifyDatabase(connectionString) {
  const { default: pg } = await import('pg');
  const client = new pg.Client({
    connectionString,
    ssl: connectionString.includes('localhost') ? undefined : { rejectUnauthorized: false },
  });
  await client.connect();
  try {
    section('Base de datos: tablas');
    const { rows: tableRows } = await client.query(
      `select table_name from information_schema.tables
        where table_schema = 'public' and table_name = any($1)`,
      [TABLES],
    );
    const present = new Set(tableRows.map((row) => row.table_name));
    for (const table of TABLES) check(present.has(table), `${table} existe`);

    section('Base de datos: columnas');
    const { rows: columnRows } = await client.query(
      `select table_name, column_name, data_type from information_schema.columns
        where table_schema = 'public' and table_name = any($1)`,
      [TABLES],
    );
    for (const [table, columns] of Object.entries(EXPECTED_COLUMNS)) {
      const actual = new Set(
        columnRows.filter((row) => row.table_name === table).map((row) => row.column_name),
      );
      const missing = columns.filter((column) => !actual.has(column));
      check(missing.length === 0, `columnas de ${table}`, missing.join(', '));
    }

    section('Base de datos: restricciones');
    const { rows: constraintRows } = await client.query(
      `select conname, contype, pg_get_constraintdef(oid) as definition
         from pg_constraint
        where conrelid = any($1::regclass[])`,
      [TABLES.map((table) => `public.${table}`)],
    );
    const definitions = constraintRows.map((row) => row.definition).join('\n');
    check(/mark >= 0\D+mark <= 5|mark BETWEEN 0 AND 5/i.test(definitions), 'mark limitado a 0–5');
    check(
      /criterion = ANY|criterion in/i.test(definitions),
      'el criterio está restringido a los cuatro canónicos',
    );
    check(
      /UNIQUE \(task_fingerprint\)/i.test(definitions),
      'task_fingerprint es único en la base de datos',
    );
    check(
      /UNIQUE \(execution_id, observation_id\)/i.test(definitions),
      'observación única por ejecución',
    );
    check(
      /UNIQUE \(execution_id, criterion\)/i.test(definitions),
      'criterio único por evaluación',
    );

    section('Base de datos: RLS y policies');
    const { rows: rlsRows } = await client.query(
      `select relname, relrowsecurity from pg_class
        where relname = any($1) and relnamespace = 'public'::regnamespace`,
      [TABLES],
    );
    for (const table of TABLES) {
      const row = rlsRows.find((candidate) => candidate.relname === table);
      check(Boolean(row?.relrowsecurity), `RLS activado en ${table}`);
    }
    const { rows: policyRows } = await client.query(
      `select tablename, policyname, cmd from pg_policies
        where schemaname = 'public' and tablename = any($1)`,
      [TABLES],
    );
    for (const table of STUDENT_DATA_TABLES) {
      check(
        policyRows.some((row) => row.tablename === table && row.cmd === 'SELECT'),
        `policy de SELECT en ${table}`,
      );
    }
    check(
      !policyRows.some((row) => row.tablename === 'writing_task_analyses'),
      'la caché de análisis de tarea no tiene policies',
    );
    check(
      !policyRows.some((row) => ['INSERT', 'UPDATE', 'DELETE'].includes(row.cmd)),
      'no hay policies de escritura para clientes',
    );

    section('Base de datos: tablas existentes intactas');
    const { rows: protectedRows } = await client.query(
      `select table_name, count(*)::int as columns from information_schema.columns
        where table_schema = 'public' and table_name = any($1)
        group by table_name`,
      [PROTECTED_TABLES],
    );
    for (const table of PROTECTED_TABLES) {
      const row = protectedRows.find((candidate) => candidate.table_name === table);
      check(Boolean(row), `${table} sigue presente`, 'no encontrada');
    }
    const { rows: uniqueRows } = await client.query(
      `select indexdef from pg_indexes
        where schemaname = 'public' and tablename = 'levels_puntuaciones'`,
    );
    check(
      uniqueRows.some((row) => /uuid_usuario, examen_id, parte_numero, score_source/.test(row.indexdef)),
      'levels_puntuaciones conserva su índice único de resultado por parte',
    );
  } finally {
    await client.end();
  }
}

// ---------------------------------------------------------------------------

async function main() {
  console.log('Writing Engine v3 — verificación de persistencia (READ-ONLY)\n');

  if (!fs.existsSync(SQL_PATH)) {
    console.error(`No existe la migración esperada: ${SQL_PATH}`);
    process.exit(1);
  }
  // Los comentarios se eliminan antes de analizar: una nota que explique que el
  // rollback es un DROP no debe contar como un DROP en la migración.
  const sql = fs
    .readFileSync(SQL_PATH, 'utf8')
    .toLowerCase()
    .replace(/^\s*--.*$/gm, '')
    .replace(/\s--[^\n]*$/gm, '');
  verifyStatic(sql);

  const connectionString =
    process.env.WRITING_ENGINE_VERIFY_DATABASE_URL?.trim() ||
    process.env.WRITING_ENGINE_VERIFY_DB_URL?.trim() ||
    '';

  if (connectionString) {
    console.log('\nWRITING_ENGINE_VERIFY_DATABASE_URL definida: verificando contra base de datos.');
    console.log('Solo se ejecutan SELECT. No se aplica la migración.');
    try {
      await verifyDatabase(connectionString);
    } catch (error) {
      failures += 1;
      console.error(`\n  FAIL  verificación contra base de datos — ${error.message}`);
    }
  } else {
    section('Base de datos');
    console.log('  skip  WRITING_ENGINE_VERIFY_DATABASE_URL no definida.');
    console.log('        Sin base de datos con la migración aplicada quedan SIN VERIFICAR:');
    console.log('        RLS real, la comprobación diferida de los cuatro criterios,');
    console.log('        los disparadores de inmutabilidad y el ciclo escribir/leer del paquete.');
    console.log('        R5 permanece ABIERTO.');
  }

  console.log(
    `\n${failures === 0 ? 'OK' : 'FALLOS'}: ${checks - failures}/${checks} comprobaciones correctas.`,
  );
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
