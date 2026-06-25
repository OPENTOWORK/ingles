/**
 * Ensambla tmp/prod-db-logic.sql desde exports MCP (agent-tools) y aplica en Supabase B.
 * Uso: node scripts/assemble-prod-logic-from-agent-tools.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const OUT_FILE = path.join(ROOT, 'tmp', 'prod-db-logic.sql');
const AGENT_TOOLS = path.join(
  process.env.USERPROFILE || '',
  '.cursor/projects/c-Users-Usuario-Webs-english-practice/agent-tools',
);

function readJsonField(filePath, field = 'sql') {
  const raw = fs.readFileSync(filePath, 'utf8');
  const parsed = JSON.parse(raw);
  const row = parsed?.result?.[0] || parsed?.[0];
  const value = row?.[field];
  if (!value) throw new Error(`Campo ${field} vacío en ${filePath}`);
  return String(value).replace(/\\n/g, '\n').replace(/\\r/g, '\r').replace(/\\t/g, '\t');
}

function findLatestAgentFile(prefixHint) {
  if (!fs.existsSync(AGENT_TOOLS)) return null;
  return fs
    .readdirSync(AGENT_TOOLS)
    .map((name) => path.join(AGENT_TOOLS, name))
    .filter((p) => fs.statSync(p).isFile())
    .sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs)
    .find((p) => {
      const head = fs.readFileSync(p, 'utf8', { encoding: 'utf8' }).slice(0, 5000);
      return head.includes(prefixHint);
    });
}

function main() {
  const policiesFile =
    process.argv[2] ||
    findLatestAgentFile('DROP POLICY IF EXISTS') ||
    path.join(AGENT_TOOLS, 'bb85a188-93d5-4761-a0fd-eb53e4607414.txt');

  if (!fs.existsSync(policiesFile)) {
    throw new Error(`No se encontró export de policies: ${policiesFile}`);
  }

  const policies = readJsonField(policiesFile, 'sql');

  const functions = `CREATE OR REPLACE FUNCTION public.enforce_levels_preguntas_parte_examen_match()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  IF NEW.parte_id IS NOT NULL THEN
    IF NEW.examen_id IS NULL THEN
      RAISE EXCEPTION 'examen_id no puede ser NULL cuando parte_id está definido';
    END IF;
    IF NOT EXISTS (
      SELECT 1 FROM public.levels_partes p
      WHERE p.id = NEW.parte_id AND p.examen_id = NEW.examen_id
    ) THEN
      RAISE EXCEPTION 'Inconsistencia: parte_id % pertenece a examen_id % pero niveles_preguntas tiene examen_id %',
        NEW.parte_id,
        (SELECT p.examen_id FROM public.levels_partes p WHERE p.id = NEW.parte_id),
        NEW.examen_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$function$;`;

  // Functions/triggers/RLS pulled from ENGLISH_PROD export (MCP execute_sql).
  const extraFunctionsFile = path.join(ROOT, 'scripts', 'generated', 'prod-functions.sql');
  const functionsSql = fs.existsSync(extraFunctionsFile)
    ? fs.readFileSync(extraFunctionsFile, 'utf8')
    : null;

  const rls = fs.readFileSync(path.join(ROOT, 'scripts', 'generated', 'prod-rls.sql'), 'utf8');
  const functionsBlock = functionsSql || fs.readFileSync(extraFunctionsFile.replace('functions', 'logic-functions'), 'utf8');
  const triggers = fs.readFileSync(path.join(ROOT, 'scripts', 'generated', 'prod-triggers.sql'), 'utf8');

  const sql = [
    '-- Synced from ENGLISH_PROD to draloenglish-glitch',
    'CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA public;',
    'CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;',
    'CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;',
    '',
    '-- Functions',
    functionsBlock,
    '',
    '-- RLS',
    rls,
    '',
    '-- Policies',
    policies,
    '',
    '-- Triggers',
    triggers,
    '',
  ].join('\n');

  fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
  fs.writeFileSync(OUT_FILE, sql);
  console.log('Escrito', OUT_FILE, `(${sql.length} chars)`);
}

main();
