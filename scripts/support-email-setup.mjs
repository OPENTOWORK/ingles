/**
 * Configura el envío de tickets a draloenglish@gmail.com vía Gmail SMTP.
 * Uso: npm run support:email-setup
 */
import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';
import nodemailer from 'nodemailer';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const SECRETS_DIR = path.join(ROOT, 'secrets');
const PASS_FILE = path.join(SECRETS_DIR, 'support-smtp-pass.txt');
const ENV_FILE = path.join(ROOT, '.env.local');
const INBOX = 'draloenglish@gmail.com';

function loadEnvLocal() {
  if (!fs.existsSync(ENV_FILE)) return {};
  const out = {};
  for (const line of fs.readFileSync(ENV_FILE, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (!m) continue;
    out[m[1]] = m[2].trim().replace(/^["']|["']$/g, '');
  }
  return out;
}

function ask(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

const env = { ...loadEnvLocal(), ...process.env };
const host = env.SUPPORT_SMTP_HOST || 'smtp.gmail.com';
const port = Number(env.SUPPORT_SMTP_PORT || 587);
const user = env.SUPPORT_SMTP_USER || 'carlos.garcia.cano87@gmail.com';

console.log('\nConfiguración de correo de soporte →', INBOX);
console.log('Cuenta Gmail:', user);
console.log(
  '\n1) Abre: https://myaccount.google.com/apppasswords',
);
console.log('2) Crea una contraseña de aplicación (Correo / Windows).');
console.log('3) Pégala aquí (16 caracteres, sin espacios).\n');

let pass = (await ask('Contraseña de aplicación Gmail: ')).replace(/\s+/g, '');
if (!pass) {
  console.error('No se introdujo contraseña.');
  process.exit(1);
}

fs.mkdirSync(SECRETS_DIR, { recursive: true });
fs.writeFileSync(PASS_FILE, pass, { utf8 });
console.log('\nGuardada en secrets/support-smtp-pass.txt');

const transporter = nodemailer.createTransport({
  host,
  port,
  secure: false,
  auth: { user, pass },
});

console.log('Enviando correo de prueba a', INBOX, '...');

try {
  await transporter.sendMail({
    from: env.SUPPORT_SMTP_FROM || `Dralo Soporte <${user}>`,
    to: INBOX,
    subject: '[Soporte] Prueba de configuración',
    text: 'Si recibes esto, los tickets de contacto llegarán a esta bandeja.',
  });
  console.log('OK — Revisa', INBOX, '(y spam).');
  console.log('Reinicia npm run dev y crea un ticket en /contacto.\n');
} catch (err) {
  console.error('Error al enviar:', err.message);
  console.error('Comprueba que la verificación en 2 pasos esté activa en Google.\n');
  process.exit(1);
}
