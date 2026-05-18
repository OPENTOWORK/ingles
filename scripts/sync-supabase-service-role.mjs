/**
 * Descarga la service_role del proyecto y la guarda en secrets/ + .env.local.
 * Requiere SUPABASE_ACCESS_TOKEN (misma cuenta que el plugin Supabase de Cursor).
 *
 * Token: https://supabase.com/dashboard/account/tokens
 * Uso: npm run supabase:sync-service-role
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const ENV_FILE = path.join(ROOT, '.env.local');
const KEY_FILE = path.join(ROOT, 'secrets', 'supabase-service-role.txt');
const PROJECT_REF = process.env.SUPABASE_PROJECT_REF || 'qnazrzvwvkwhkfbqsbmr';

function loadAccessToken() {
  if (process.env.SUPABASE_ACCESS_TOKEN?.trim()) {
    return process.env.SUPABASE_ACCESS_TOKEN.trim();
  }
  if (!fs.existsSync(ENV_FILE)) return '';
  const raw = fs.readFileSync(ENV_FILE, 'utf8');
  const m = raw.match(/^\s*SUPABASE_ACCESS_TOKEN\s*=\s*(.+)\s*$/m);
  if (!m) return '';
  return m[1].trim().replace(/^["']|["']$/g, '');
}

function upsertEnvLocal(key) {
  const line = `SUPABASE_SERVICE_ROLE_KEY=${key}`;
  let content = '';
  if (fs.existsSync(ENV_FILE)) {
    content = fs.readFileSync(ENV_FILE, 'utf8');
    const re = /^\s*SUPABASE_SERVICE_ROLE_KEY\s*=.*$/m;
    content = re.test(content) ? content.replace(re, line) : `${content.trimEnd()}\n${line}\n`;
  } else {
    content = `${line}\n`;
  }
  fs.writeFileSync(ENV_FILE, content, 'utf8');
}

const token = loadAccessToken();
if (!token) {
  console.error(
    'Falta SUPABASE_ACCESS_TOKEN en .env.local\n' +
      'Crea un token en: https://supabase.com/dashboard/account/tokens\n' +
      '(la misma cuenta con la que conectaste Supabase en Cursor)',
  );
  process.exit(1);
}

const res = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/api-keys`, {
  headers: { Authorization: `Bearer ${token}` },
});

if (!res.ok) {
  const text = await res.text();
  console.error('API Supabase', res.status, text.slice(0, 300));
  process.exit(1);
}

const keys = await res.json();
const service = Array.isArray(keys)
  ? keys.find((k) => k.name === 'service_role' || k.type === 'service_role')
  : null;

const apiKey = service?.api_key || service?.key;
if (!apiKey) {
  console.error('No se encontró service_role en la respuesta de la API.');
  process.exit(1);
}

fs.mkdirSync(path.dirname(KEY_FILE), { recursive: true });
fs.writeFileSync(KEY_FILE, apiKey, 'utf8');
upsertEnvLocal(apiKey);

console.log('OK — service_role guardada en secrets/supabase-service-role.txt y .env.local');
console.log('Reinicia npm run dev si el servidor ya estaba en marcha.\n');
