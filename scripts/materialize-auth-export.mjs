/**
 * Materializa tmp/auth-export.json desde exports MCP (agent-tools) o Admin API.
 * Uso: node scripts/materialize-auth-export.mjs [users-mcp.txt] [identities-mcp.txt]
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const agentTools = path.join(
  process.env.USERPROFILE || '',
  '.cursor/projects/c-Users-Usuario-Webs-english-practice/agent-tools',
);

function loadEnv() {
  const env = {};
  for (const line of fs.readFileSync(path.join(root, '.env.local'), 'utf8').split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const i = t.indexOf('=');
    if (i > 0) {
      let v = t.slice(i + 1).trim();
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
        v = v.slice(1, -1);
      }
      env[t.slice(0, i)] = v;
    }
  }
  return env;
}

function parseMcpToolFile(filePath) {
  let raw = fs.readFileSync(filePath, 'utf8');
  if (raw.trimStart().startsWith('{"result"')) {
    raw = JSON.parse(raw).result;
  }
  const start = raw.indexOf('[{');
  const end = raw.lastIndexOf('}]');
  if (start < 0 || end < start) throw new Error(`No JSON en ${filePath}`);
  let jsonSlice = raw.slice(start, end + 2);
  if (jsonSlice.includes('\\"')) {
    jsonSlice = jsonSlice.replace(/\\"/g, '"').replace(/\\n/g, '\n');
  }
  return JSON.parse(jsonSlice);
}

function extractRows(parsed) {
  const first = parsed[0];
  if (first?.rows) return first.rows;
  if (Array.isArray(first)) return first;
  return parsed;
}

function findLatestAgentFile(mustInclude, mustExclude = '') {
  if (!fs.existsSync(agentTools)) return null;
  return fs
    .readdirSync(agentTools)
    .map((f) => path.join(agentTools, f))
    .filter((p) => fs.statSync(p).isFile())
    .sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs)
    .find((p) => {
      const head = fs.readFileSync(p, 'utf8').slice(0, 4000);
      return head.includes(mustInclude) && (!mustExclude || !head.includes(mustExclude));
    });
}

function isUuid(value) {
  return typeof value === 'string'
    && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

async function fetchIdentitiesFromAdmin(env) {
  const source = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const identities = [];
  let page = 1;
  while (true) {
    const { data, error } = await source.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) throw new Error(`listUsers: ${error.message}`);
    for (const user of data.users) {
      const { data: full, error: userErr } = await source.auth.admin.getUserById(user.id);
      if (userErr) throw new Error(`getUserById ${user.id}: ${userErr.message}`);
      for (const id of full.user.identities || []) {
        const identityId = [id.id, id.identity_id].find(isUuid);
        if (!identityId) continue;
        identities.push({
          provider_id: id.provider_id || id.identity_id || user.id,
          user_id: user.id,
          identity_data: id.identity_data || {},
          provider: id.provider,
          last_sign_in_at: id.last_sign_in_at || user.last_sign_in_at,
          created_at: id.created_at || user.created_at,
          updated_at: id.updated_at || user.updated_at,
          id: identityId,
        });
      }
    }
    if (data.users.length < 1000) break;
    page += 1;
  }
  return identities;
}

const usersFile =
  process.argv[2] ||
  findLatestAgentFile('"instance_id"') ||
  findLatestAgentFile('encrypted_password');

if (!usersFile || !fs.existsSync(usersFile)) {
  console.error('No se encontró export MCP de auth.users en agent-tools.');
  process.exit(1);
}

const users = extractRows(parseMcpToolFile(usersFile));
let identities;

const identitiesFile =
  process.argv[3] || findLatestAgentFile('"provider_id"', '"instance_id"');

if (identitiesFile && fs.existsSync(identitiesFile)) {
  identities = extractRows(parseMcpToolFile(identitiesFile));
  console.log(`Identities desde MCP: ${identitiesFile}`);
} else {
  console.log('Identities vía Admin API (prod)…');
  identities = await fetchIdentitiesFromAdmin(loadEnv());
}

const outDir = path.join(root, 'tmp');
fs.mkdirSync(outDir, { recursive: true });
const outFile = path.join(outDir, 'auth-export.json');
fs.writeFileSync(outFile, JSON.stringify({ users, identities }, null, 0));
console.log(`Escrito ${outFile}: ${users.length} users, ${identities.length} identities`);
