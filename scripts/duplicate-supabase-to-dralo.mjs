/**
 * Duplica datos de ENGLISH_PROD (Supabase A) hacia Supabase B (DRALO).
 *
 * Requisitos:
 * - .env.local con SUPABASE_SERVICE_ROLE_KEY (origen) y SUPABASE_B_* (destino)
 * - El esquema debe existir ya en el destino (pg_dump o migraciones MCP)
 * - La secret key del destino debe ser válida (401 = clave incorrecta o revocada)
 *
 * Uso:
 *   node scripts/duplicate-supabase-to-dralo.mjs --dry-run
 *   node scripts/duplicate-supabase-to-dralo.mjs --data-only
 *   node scripts/duplicate-supabase-to-dralo.mjs --table levels
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const ENV_FILE = path.join(ROOT, '.env.local');
const BATCH_SIZE = 500;

const TABLE_ORDER = [
  'Usuarios_y_Perfil_roles',
  'monetizacion_planes',
  'Usuarios_y_Perfil_users',
  'Usuarios_y_Perfil_profiles',
  'Usuarios_y_Perfil_centros',
  'Usuarios_y_Perfil_clases',
  'levels',
  'levels_skills',
  'levels_examenes',
  'levels_partes',
  'placement_tests',
  'placement_partes',
  'placement_preguntas',
  'placement_respuestas',
  'levels_preguntas',
  'levels_respuestas',
  'levels_respuestas_abiertas',
  'levels_preguntas_audios',
  'levels_puntuaciones',
  'Levels_stars',
  'levels_estadisticas',
  'levels_teoria_tipos_preguntas',
  'levels_teoria_preguntas',
  'levels_teoria_respuestas',
  'levels_teoria_respuestas_abiertas',
  'levels_teoria_preguntas_audios',
  'levels_teoria_puntuaciones',
  'levels_teoria_estadisticas',
  'levels_teoria_progreso',
  'placement_results',
  'placement_rules',
  'placement_feedback',
  'placement_sessions',
  'perfil_preferencias_estudio',
  'perfil_objetivos',
  'perfil_actividad',
  'teoria_progreso',
  'levels_notas',
  'levels_favoritos',
  'levels_justificaciones',
  'DraloIA_Experience',
  'DraloIA_nivel_usuario',
  'Dictionary_words',
  'ai_budget_settings',
  'ai_usage_daily_limits',
  'ai_usage_logs',
  'auth_sesiones',
  'contacto_soporte',
  'contacto_mensajes',
  'usuario_sesiones_app',
  'usuario_presencia',
  'usuario_navegacion',
  'profesor_calendly',
  'soporte_correos_automaticos',
  'soporte_correos_cola',
  'soporte_correos_log',
  'question_explanations',
  'user_error_tracker',
  'user_practice_error_reviews',
  'plan_objetivos',
  'profesor_alumnos',
  'profesor_tareas',
  'profesor_calificaciones',
  'teoria_temas',
  'teoria_contenidos',
  'teoria_ejercicios',
  'teoria_favoritos',
  'library_medios',
  'library_etiquetas',
  'library_contenido',
  'library_estados_contenido',
  'library_preguntas',
  'perfil_progreso',
  'perfil_rendimiento',
  'perfil_recomendaciones',
  'perfil_notificaciones',
  'perfil_timeline_actividad',
  'perfil_favoritos',
  'monetizacion_pagos',
  'estudio_sesiones',
  'config_parametros',
  'config_visual',
  'config_idiomas',
  'config_textos',
  'config_usuario_idioma',
  'config_log_cambios',
  'seguridad_accesos',
  'seguridad_cookies',
  'seguridad_tutores',
  'seguridad_textos_legales',
  'seguridad_textos_aceptados',
  'calidad_comentarios',
  'calidad_valoraciones',
  'calidad_errores_reportados',
  'training_niveles',
  'training_cursos',
  'training_unidades',
  'training_ejercicios',
  'training_respuestas',
  'training_estadisticas_usuario',
  'training_intentos',
  'training_explicaciones',
  'training_favoritos',
  'training_tiempos',
  'leves_correcciones',
];

function loadEnvLocal() {
  if (!fs.existsSync(ENV_FILE)) {
    throw new Error('Falta .env.local');
  }
  const raw = fs.readFileSync(ENV_FILE, 'utf8').replace(/^\uFEFF/, '');
  const env = {};
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx <= 0) continue;
    env[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim();
  }
  return env;
}

function makeClient(url, key, label) {
  if (!url || !key) {
    throw new Error(`Faltan credenciales para ${label}`);
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function quoteIdent(name) {
  return `"${name.replace(/"/g, '""')}"`;
}

async function countRows(client, table) {
  const { count, error, status } = await client
    .from(table)
    .select('*', { count: 'exact', head: true });
  if (error) {
    const msg = error.message || `HTTP ${status}`;
    throw new Error(`${table}: ${msg}`);
  }
  return count ?? 0;
}

async function fetchBatch(client, table, from, to) {
  const { data, error } = await client.from(table).select('*').range(from, to);
  if (error) throw new Error(`${table} lectura: ${error.message}`);
  return data ?? [];
}

async function upsertBatch(client, table, rows) {
  if (!rows.length) return;
  const { error } = await client.from(table).upsert(rows, { onConflict: 'id' });
  if (error) {
    // Algunas tablas usan PK compuesta o sin columna id
    const { error: insertError } = await client.from(table).insert(rows);
    if (insertError) {
      throw new Error(`${table} escritura: ${insertError.message}`);
    }
  }
}

async function copyTable(source, target, table, { dryRun }) {
  const total = await countRows(source, table);
  if (dryRun) {
    console.log(`  ${quoteIdent(table)}: ${total} filas`);
    return { table, total, copied: 0 };
  }

  if (total === 0) {
    console.log(`  ${quoteIdent(table)}: vacía, omitida`);
    return { table, total: 0, copied: 0 };
  }

  let copied = 0;
  for (let offset = 0; offset < total; offset += BATCH_SIZE) {
    const rows = await fetchBatch(source, table, offset, offset + BATCH_SIZE - 1);
    await upsertBatch(target, table, rows);
    copied += rows.length;
    process.stdout.write(`\r  ${quoteIdent(table)}: ${copied}/${total}`);
  }
  process.stdout.write('\n');
  return { table, total, copied };
}

async function verifyTarget(target) {
  const { error, status } = await target.from('levels').select('id', { head: true, count: 'exact' });
  if (error && status === 401) {
    throw new Error(
      'SUPABASE_B_SECRET_KEY inválida (401). Copia la secret key actual en Dashboard → Settings → API Keys del proyecto B.',
    );
  }
  if (error && (status === 404 || /schema cache|does not exist/i.test(error.message))) {
    throw new Error(
      'El esquema no existe en Supabase B. Ejecuta antes: npm run supabase:materialize-dralo-schema && npm run supabase:apply-dralo-schema (requiere SUPABASE_B_DB_PASSWORD).',
    );
  }
  if (error) {
    throw new Error(`Destino no accesible: ${error.message}`);
  }
}

async function main() {
  const args = new Set(process.argv.slice(2));
  const dryRun = args.has('--dry-run');
  const dataOnly = args.has('--data-only') || dryRun;
  const tableArg = process.argv.find((a, i) => process.argv[i - 1] === '--table');

  if (!dataOnly && !dryRun) {
    console.error('Usa --data-only (el schema debe aplicarse aparte con pg_dump o MCP).');
    process.exit(1);
  }

  const env = loadEnvLocal();
  const sourceUrl = env.NEXT_PUBLIC_SUPABASE_URL;
  const sourceKey = env.SUPABASE_SERVICE_ROLE_KEY;
  const targetUrl = env.SUPABASE_B_URL;
  const targetKey = env.SUPABASE_B_SECRET_KEY || env.SUPABASE_B_SERVICE_ROLE_KEY;

  const source = makeClient(sourceUrl, sourceKey, 'origen (ENGLISH_PROD)');
  const target = makeClient(targetUrl, targetKey, 'destino (DRALO B)');

  console.log('Origen :', sourceUrl);
  console.log('Destino:', targetUrl);
  console.log(dryRun ? '\n[DRY RUN]\n' : '\n[COPIA DE DATOS]\n');

  if (!dryRun) {
    await verifyTarget(target);
  }

  const tables = tableArg ? [tableArg] : TABLE_ORDER;
  const results = [];

  for (const table of tables) {
    try {
      results.push(await copyTable(source, target, table, { dryRun }));
    } catch (err) {
      console.error(`  ERROR ${table}: ${err.message}`);
      if (!tableArg) continue;
      throw err;
    }
  }

  const totalRows = results.reduce((n, r) => n + (r.total ?? 0), 0);
  const copiedRows = results.reduce((n, r) => n + (r.copied ?? 0), 0);
  console.log(`\nTablas: ${results.length} | Filas origen: ${totalRows}${dryRun ? '' : ` | Copiadas: ${copiedRows}`}`);
}

main().catch((err) => {
  console.error('\nFallo:', err.message);
  process.exit(1);
});
