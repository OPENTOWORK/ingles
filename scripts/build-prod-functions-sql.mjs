/**
 * Construye tmp/prod-functions.sql con TODAS las funciones custom de PROD
 * (public sin extensión + private), exportadas vía MCP o ensambladas del repo.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parseMcpToolExport } from './mcp-parse.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'tmp', 'prod-functions.sql');
const SNAPSHOTS = path.join(ROOT, 'scripts', 'mcp-snapshots');
const GENERATED = path.join(ROOT, 'scripts', 'generated');
const AGENT = path.join(
  process.env.USERPROFILE || '',
  '.cursor/projects/c-Users-Usuario-Webs-english-practice/agent-tools',
);

function findMcpFunctionsExport() {
  if (process.argv[2]) return path.resolve(process.argv[2]);
  if (!fs.existsSync(AGENT)) return null;
  const files = fs
    .readdirSync(AGENT)
    .map((name) => path.join(AGENT, name))
    .filter((p) => fs.statSync(p).isFile())
    .sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs);
  for (const file of files) {
    const head = fs.readFileSync(file, 'utf8').slice(0, 8000);
    if (head.includes('private.handle_new_auth_user') || head.includes('FUNCTION private.handle_new_auth_user')) {
      return file;
    }
  }
  return null;
}

function extractPrivateFunctionOnly(sql) {
  const start = sql.search(/CREATE OR REPLACE FUNCTION private\.handle_new_auth_user/i);
  if (start < 0) throw new Error('No private.handle_new_auth_user in snapshot');
  const rest = sql.slice(start);
  const open = rest.indexOf('$function$');
  const close = rest.indexOf('$function$', open + '$function$'.length);
  if (open < 0 || close < 0) throw new Error('Malformed private.handle_new_auth_user snapshot');
  return `${rest.slice(0, close + '$function$'.length).trim()};`;
}

function normalizeFunctionSql(sql) {
  const chunks = [];
  const re = /CREATE OR REPLACE FUNCTION [\s\S]*?(?=\nCREATE OR REPLACE FUNCTION |$)/gi;
  let match;
  while ((match = re.exec(sql)) !== null) {
    const chunk = match[0].trim();
    if (!chunk) continue;
    chunks.push(chunk.endsWith(';') ? chunk : `${chunk};`);
  }
  if (!chunks.length) throw new Error('No CREATE OR REPLACE FUNCTION blocks found');
  return chunks.join('\n\n');
}

function assembleFromRepo() {
  const publicFns = fs.readFileSync(path.join(GENERATED, 'prod-logic-functions.sql'), 'utf8');
  const privateFn = extractPrivateFunctionOnly(
    fs.readFileSync(path.join(SNAPSHOTS, 'private-auth-user-sync.sql'), 'utf8'),
  );
  return normalizeFunctionSql(`${privateFn}\n\n${publicFns}`);
}

function main() {
  fs.mkdirSync(path.dirname(OUT), { recursive: true });

  const mcpFile = findMcpFunctionsExport();
  let functionsSql;
  if (mcpFile) {
    functionsSql = normalizeFunctionSql(parseMcpToolExport(fs.readFileSync(mcpFile, 'utf8')));
    console.log('Functions SQL from MCP export:', mcpFile);
  } else {
    if (!fs.existsSync(path.join(GENERATED, 'prod-logic-functions.sql'))) {
      throw new Error('Ejecuta antes: node scripts/assemble-prod-logic-parts.mjs');
    }
    functionsSql = assembleFromRepo();
    console.log('Functions SQL from repo snapshots (sin export MCP completo)');
  }

  const sql = [
    '-- Custom application functions from ENGLISH_PROD',
    '-- Extensions (pg_trgm en public como PROD)',
    'CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA public;',
    'CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;',
    'CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;',
    '',
    'CREATE SCHEMA IF NOT EXISTS private;',
    '',
    functionsSql.trim(),
    '',
  ].join('\n');

  fs.writeFileSync(OUT, sql);
  const fnCount = functionsSql.split(/CREATE OR REPLACE FUNCTION /i).length - 1;
  console.log('OK', OUT, `(${fnCount} functions, ${sql.length} chars)`);
}

main();
