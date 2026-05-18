/**
 * Muestra los registros DNS de dralo.es en Resend (para enviar a cualquier correo).
 * Uso: node scripts/print-resend-dralo-dns.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, '..', '.env.local');

function loadResendKey() {
  if (process.env.RESEND_API_KEY?.trim()) return process.env.RESEND_API_KEY.trim();
  if (!fs.existsSync(envPath)) return '';
  const raw = fs.readFileSync(envPath, 'utf8');
  const m = raw.match(/^\s*RESEND_API_KEY\s*=\s*(.+)\s*$/m);
  return m ? m[1].trim() : '';
}

const key = loadResendKey();
if (!key) {
  console.error('Falta RESEND_API_KEY en .env.local');
  process.exit(1);
}

const res = await fetch('https://api.resend.com/domains', {
  headers: { Authorization: `Bearer ${key}` },
});
const json = await res.json();
const domain = (json.data || []).find((d) => d.name === 'dralo.es');

if (!domain) {
  console.log('No hay dominio dralo.es en Resend. Créalo en https://resend.com/domains');
  process.exit(1);
}

const detail = await fetch(`https://api.resend.com/domains/${domain.id}`, {
  headers: { Authorization: `Bearer ${key}` },
});
const info = await detail.json();

console.log(`Dominio: ${info.name} — estado: ${info.status}\n`);
for (const r of info.records || []) {
  console.log(`[${r.record}] ${r.type} ${r.name}`);
  console.log(`  → ${r.value}${r.priority != null ? ` (prioridad ${r.priority})` : ''}`);
  console.log(`  estado: ${r.status}\n`);
}

console.log(
  'Cuando todos estén "verified", en .env.local usa RESEND_FROM_EMAIL=soporte@dralo.es y quita RESEND_FORCE_SANDBOX_FROM.',
);
