/**
 * Activa mailer_autoconfirm en Auth (Supabase Management API).
 * Así los nuevos usuarios quedan confirmados sin depender del cupo de correo
 * integrado de Supabase para el email de confirmación.
 *
 * Requisitos:
 *   1) Crea un token: https://supabase.com/dashboard/account/tokens
 *   2) Añade a .env.local: SUPABASE_ACCESS_TOKEN=tu_token
 *   3) Ejecuta: node scripts/supabase-patch-auth-mailer-autoconfirm.mjs
 *
 * Opcional: node scripts/supabase-patch-auth-mailer-autoconfirm.mjs --dry-run
 *   (solo lee la config actual)
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_REF = process.env.SUPABASE_PROJECT_REF || 'qnazrzvwvkwhkfbqsbmr';
const envLocal = path.join(__dirname, '..', '.env.local');

function loadAccessToken() {
  if (process.env.SUPABASE_ACCESS_TOKEN?.trim()) {
    return process.env.SUPABASE_ACCESS_TOKEN.trim();
  }
  if (!fs.existsSync(envLocal)) return '';
  const raw = fs.readFileSync(envLocal, 'utf8');
  const m = raw.match(/^\s*SUPABASE_ACCESS_TOKEN\s*=\s*(.+)\s*$/m);
  if (!m) return '';
  return m[1].trim().replace(/^["']|["']$/g, '');
}

async function managementFetch(token, method, body) {
  const url = `https://api.supabase.com/v1/projects/${PROJECT_REF}/config/auth`;
  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = text;
  }
  return { ok: res.ok, status: res.status, body: json };
}

const dryRun = process.argv.includes('--dry-run');

const token = loadAccessToken();
if (!token) {
  console.error(
    'Falta SUPABASE_ACCESS_TOKEN (variable de entorno o línea en .env.local).\n' +
      'Crea un token en: https://supabase.com/dashboard/account/tokens'
  );
  process.exit(1);
}

if (dryRun) {
  const r = await managementFetch(token, 'GET');
  console.log(JSON.stringify(r, null, 2));
  process.exit(r.ok ? 0 : 1);
}

const patch = await managementFetch(token, 'PATCH', { mailer_autoconfirm: true });
if (!patch.ok) {
  console.error('Error Management API', patch.status, patch.body);
  process.exit(1);
}

console.log('Listo: mailer_autoconfirm = true en el proyecto', PROJECT_REF);
console.log('Comprueba en el panel: Authentication → Providers → Email (confirmación).');
