import fs from 'fs';
import path from 'path';

const SECRETS_DIR = path.join(process.cwd(), 'secrets');
const PASS_FILE = path.join(SECRETS_DIR, 'support-smtp-pass.txt');
const USER_FILE = path.join(SECRETS_DIR, 'support-smtp-user.txt');

export function getSupportSmtpPass() {
  const fromEnv = process.env.SUPPORT_SMTP_PASS?.trim();
  if (fromEnv) return fromEnv.replace(/\s+/g, '');

  try {
    if (fs.existsSync(PASS_FILE)) {
      const raw = fs.readFileSync(PASS_FILE, 'utf8').trim();
      if (raw) return raw.replace(/\s+/g, '');
    }
  } catch {
    /* ignore */
  }
  return '';
}

export function getSupportSmtpUser() {
  const fromEnv = process.env.SUPPORT_SMTP_USER?.trim();
  if (fromEnv) return fromEnv.toLowerCase();

  try {
    if (fs.existsSync(USER_FILE)) {
      const raw = fs.readFileSync(USER_FILE, 'utf8').trim();
      if (raw) return raw.toLowerCase();
    }
  } catch {
    /* ignore */
  }

  return 'draloenglish@gmail.com';
}

export function isSupportSmtpReady() {
  return Boolean(getSupportSmtpUser() && getSupportSmtpPass());
}

export function saveSupportSmtpCredentials({ user, pass }) {
  fs.mkdirSync(SECRETS_DIR, { recursive: true });
  fs.writeFileSync(USER_FILE, user.toLowerCase(), { encoding: 'utf8', mode: 0o600 });
  fs.writeFileSync(PASS_FILE, pass.replace(/\s+/g, ''), { encoding: 'utf8', mode: 0o600 });
}

export function formatSmtpAuthError(message = '') {
  if (!/535|BadCredentials|Username and Password not accepted/i.test(message)) {
    return message || 'Error SMTP al enviar el aviso.';
  }
  return (
    'Gmail rechazó la contraseña. Usa una contraseña de aplicación (16 letras), no la contraseña normal. ' +
    'Debe ser de la misma cuenta que el email remitente. Si creaste la clave en draloenglish@gmail.com, ' +
    'pon ese email arriba; si la creaste en carlos.garcia.cano87@gmail.com, usa esa.'
  );
}
