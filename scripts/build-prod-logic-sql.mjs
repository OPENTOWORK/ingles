/**
 * Construye tmp/prod-db-logic.sql desde exports MCP guardados en agent-tools.
 * Uso: node scripts/build-prod-logic-sql.mjs [policies-export.json.txt]
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parseMcpToolExport } from './mcp-parse.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'tmp', 'prod-db-logic.sql');
const GENERATED = path.join(ROOT, 'scripts', 'generated');
const AGENT_TOOLS = path.join(
  process.env.USERPROFILE || '',
  '.cursor/projects/c-Users-Usuario-Webs-english-practice/agent-tools',
);

function readMcpSqlExport(filePath) {
  return parseMcpToolExport(fs.readFileSync(filePath, 'utf8'));
}

function findPoliciesExport() {
  if (process.argv[2]) return path.resolve(process.argv[2]);
  const preferred = path.join(AGENT_TOOLS, 'bb85a188-93d5-4761-a0fd-eb53e4607414.txt');
  if (fs.existsSync(preferred)) return preferred;
  const files = fs
    .readdirSync(AGENT_TOOLS)
    .map((name) => path.join(AGENT_TOOLS, name))
    .filter((p) => fs.statSync(p).isFile())
    .sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs);
  for (const file of files) {
    const head = fs.readFileSync(file, 'utf8').slice(0, 4000);
    if (head.includes('DROP POLICY IF EXISTS')) return file;
  }
  throw new Error('No se encontró export de policies en agent-tools');
}

function main() {
  fs.mkdirSync(GENERATED, { recursive: true });
  fs.mkdirSync(path.dirname(OUT), { recursive: true });

  const policiesPath = path.join(GENERATED, 'prod-logic-policies.sql');
  const policies = fs.existsSync(policiesPath)
    ? fs.readFileSync(policiesPath, 'utf8')
    : readMcpSqlExport(findPoliciesExport());
  const functions = fs.readFileSync(path.join(GENERATED, 'prod-logic-functions.sql'), 'utf8');
  const rls = fs.readFileSync(path.join(GENERATED, 'prod-logic-rls.sql'), 'utf8');
  const triggers = fs.readFileSync(path.join(GENERATED, 'prod-logic-triggers.sql'), 'utf8');

  const sql = [
    '-- Generated from ENGLISH_PROD (qnazrzvwvkwhkfbqsbmr)',
    'CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA public;',
    'CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;',
    'CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;',
    '',
    '-- Functions',
    functions.trim(),
    '',
    '-- Enable RLS',
    rls.trim(),
    '',
    '-- Policies',
    policies.trim(),
    '',
    '-- Triggers',
    triggers.trim(),
    '',
  ].join('\n');

  fs.writeFileSync(OUT, sql);
  console.log('OK', OUT, `(${sql.length} chars)`);
}

main();
