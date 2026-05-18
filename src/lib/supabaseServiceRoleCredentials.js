import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { getSupabaseServiceRoleKey, getSupabaseUrl } from '@/lib/supabaseEnv';

const SECRETS_DIR = path.join(process.cwd(), 'secrets');
const KEY_FILE = path.join(SECRETS_DIR, 'supabase-service-role.txt');
const ENV_FILE = path.join(process.cwd(), '.env.local');

export function isSupabaseServiceRoleReady() {
  return Boolean(getSupabaseServiceRoleKey());
}

function decodeJwtPayload(token) {
  const part = String(token || '').split('.')[1];
  if (!part) return null;
  const b64 = part.replace(/-/g, '+').replace(/_/g, '/');
  const padded = b64 + '='.repeat((4 - (b64.length % 4)) % 4);
  return JSON.parse(Buffer.from(padded, 'base64').toString('utf8'));
}

export function looksLikeServiceRoleKey(key) {
  const trimmed = String(key || '').trim();
  if (!trimmed.startsWith('eyJ') || trimmed.split('.').length !== 3) return false;
  try {
    const payload = decodeJwtPayload(trimmed);
    return payload?.role === 'service_role';
  } catch {
    return false;
  }
}

export async function verifyServiceRoleKey(key, supabaseUrl = getSupabaseUrl()) {
  if (!looksLikeServiceRoleKey(key)) {
    return { ok: false, error: 'La clave no parece una service_role de Supabase (JWT con role=service_role).' };
  }

  const admin = createClient(supabaseUrl, key.trim(), {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { error } = await admin.auth.admin.listUsers({ page: 1, perPage: 1 });
  if (error) {
    return { ok: false, error: error.message || 'Supabase rechazó la clave.' };
  }
  return { ok: true };
}

function upsertEnvLocal(key) {
  const line = `SUPABASE_SERVICE_ROLE_KEY=${key.trim()}`;
  let content = '';
  if (fs.existsSync(ENV_FILE)) {
    content = fs.readFileSync(ENV_FILE, 'utf8');
    const re = /^\s*SUPABASE_SERVICE_ROLE_KEY\s*=.*$/m;
    if (re.test(content)) {
      content = content.replace(re, line);
    } else {
      content = `${content.trimEnd()}\n${line}\n`;
    }
  } else {
    content = `${line}\n`;
  }
  fs.writeFileSync(ENV_FILE, content, { encoding: 'utf8', mode: 0o600 });
}

export function saveSupabaseServiceRoleKey(key) {
  const trimmed = String(key || '').trim();
  fs.mkdirSync(SECRETS_DIR, { recursive: true });
  fs.writeFileSync(KEY_FILE, trimmed, { encoding: 'utf8', mode: 0o600 });
  try {
    upsertEnvLocal(trimmed);
  } catch {
    /* .env.local opcional */
  }
  process.env.SUPABASE_SERVICE_ROLE_KEY = trimmed;
}
