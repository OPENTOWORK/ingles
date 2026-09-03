/**
 * Sincroniza SUPABASE_SERVICE_ROLE_KEY de .env.local / secrets → Vercel production.
 */
import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const ENV_FILE = path.join(ROOT, '.env.local');
const SERVICE_ROLE_FILE = path.join(ROOT, 'secrets', 'supabase-service-role.txt');

function loadServiceRoleKey() {
  if (fs.existsSync(ENV_FILE)) {
    const match = fs.readFileSync(ENV_FILE, 'utf8').match(/^\s*SUPABASE_SERVICE_ROLE_KEY\s*=\s*(.+)\s*$/m);
    if (match?.[1]?.trim()) {
      return match[1].trim().replace(/^["']|["']$/g, '');
    }
  }
  if (fs.existsSync(SERVICE_ROLE_FILE)) {
    return fs.readFileSync(SERVICE_ROLE_FILE, 'utf8').trim();
  }
  return '';
}

const key = loadServiceRoleKey();
if (!key) {
  console.error('No se encontró SUPABASE_SERVICE_ROLE_KEY en .env.local ni secrets/.');
  process.exit(1);
}

const child = spawnSync(
  'npx',
  ['vercel@latest', 'env', 'add', 'SUPABASE_SERVICE_ROLE_KEY', 'production', '--force', '--yes'],
  {
    cwd: ROOT,
    input: key,
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'pipe'],
    shell: true,
  },
);

if (child.stdout) process.stdout.write(child.stdout);
if (child.stderr) process.stderr.write(child.stderr);
process.exit(child.status ?? 1);
