/**
 * Ensambla scripts/generated/* desde policies MCP + snapshots del repo.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parseMcpToolExport } from './mcp-parse.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const GEN = path.join(ROOT, 'scripts', 'generated');
const SNAPSHOTS = path.join(ROOT, 'scripts', 'mcp-snapshots');
const AGENT = path.join(
  process.env.USERPROFILE || '',
  '.cursor/projects/c-Users-Usuario-Webs-english-practice/agent-tools',
);

function extractFirstFunction(sql, name) {
  const re = new RegExp(
    `create\\s+or\\s+replace\\s+function\\s+public\\.${name}[\\s\\S]*?\\$\\$;`,
    'i',
  );
  const match = sql.match(re);
  if (!match) throw new Error(`No function ${name} in SQL`);
  return match[0];
}

function assembleFunctions() {
  const parts = [
    fs.readFileSync(path.join(SNAPSHOTS, 'prod-core-functions.sql'), 'utf8'),
    extractFirstFunction(
      fs.readFileSync(path.join(ROOT, 'scripts', 'staff_buzon_mensajes.sql'), 'utf8'),
      'is_staff_buzon_user',
    ),
    extractFirstFunction(
      fs.readFileSync(path.join(ROOT, 'scripts', 'levels_estadisticas.sql'), 'utf8'),
      'levels_estadisticas_set_actualizado_en',
    ),
    extractFirstFunction(
      fs.readFileSync(path.join(ROOT, 'scripts', 'levels_notas.sql'), 'utf8'),
      'levels_notas_set_actualizado_en',
    ),
    extractFirstFunction(
      fs.readFileSync(path.join(ROOT, 'scripts', 'perfil_estadisticas_generales.sql'), 'utf8'),
      'perfil_estadisticas_generales',
    ),
  ];
  return parts.join('\n\n').trim();
}

function findPoliciesExport() {
  if (process.argv[2]) return path.resolve(process.argv[2]);
  const preferred = path.join(AGENT, 'bb85a188-93d5-4761-a0fd-eb53e4607414.txt');
  if (fs.existsSync(preferred)) return preferred;
  throw new Error('No policies export in agent-tools');
}

fs.mkdirSync(GEN, { recursive: true });

const policiesFile = findPoliciesExport();
const policies = parseMcpToolExport(fs.readFileSync(policiesFile, 'utf8'));
const functions = assembleFunctions();
const rls = fs.readFileSync(path.join(SNAPSHOTS, 'prod-logic-rls.sql'), 'utf8');
const triggers = fs.readFileSync(path.join(SNAPSHOTS, 'prod-logic-triggers.sql'), 'utf8');

fs.writeFileSync(path.join(GEN, 'prod-logic-functions.sql'), functions);
fs.writeFileSync(path.join(GEN, 'prod-logic-rls.sql'), rls);
fs.writeFileSync(path.join(GEN, 'prod-logic-triggers.sql'), triggers);
fs.writeFileSync(path.join(GEN, 'prod-logic-policies.sql'), policies);

console.log('Assembled logic parts → scripts/generated');
console.log('  policies ←', policiesFile);
console.log('  functions ← repo snapshots + SQL scripts');
console.log('  rls/triggers ← scripts/mcp-snapshots');
