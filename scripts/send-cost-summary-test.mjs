/**
 * Prueba: resumen del gasto de Vercel a los administradores.
 *
 *   node --loader ./scripts/alias-loader.mjs scripts/send-cost-summary-test.mjs
 */
import { loadEnvLocal } from './load-env-local.mjs';

loadEnvLocal();

import { createClient } from '@supabase/supabase-js';
import { getSupabaseServiceRoleKey, getSupabaseUrl } from '@/lib/supabaseEnv';
import { sendTransactionalEmail } from '@/lib/sendTransactionalEmail';

const ADMIN_EMAIL = 'direccion@opentowork.com';

function isAdminRole(roleName) {
  const role = String(roleName || '')
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  return role === 'admin' || role === 'administrador';
}

function money(value) {
  return `${Number(value).toFixed(2).replace('.', ',')} USD`;
}

const url = getSupabaseUrl();
const serviceKey = getSupabaseServiceRoleKey();
if (!serviceKey) {
  console.error('Falta la service role key de Supabase.');
  process.exit(1);
}

const adminClient = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data: roles, error: rolesError } = await adminClient
  .from('Usuarios_y_Perfil_roles')
  .select('id, nombre');

if (rolesError) {
  console.error(rolesError.message);
  process.exit(1);
}

const adminRoleIds = (roles || []).filter((role) => isAdminRole(role.nombre)).map((role) => role.id);
const recipients = new Map([[ADMIN_EMAIL, 'admin']]);

if (adminRoleIds.length) {
  const { data: users, error: usersError } = await adminClient
    .from('Usuarios_y_Perfil_users')
    .select('email, activo, rol_id')
    .in('rol_id', adminRoleIds);

  if (usersError) {
    console.error(usersError.message);
    process.exit(1);
  }

  const roleNameById = new Map((roles || []).map((role) => [role.id, role.nombre || '']));
  for (const user of users || []) {
    if (user.activo === false) continue;
    const email = String(user.email || '').trim().toLowerCase();
    if (!email) continue;
    recipients.set(email, roleNameById.get(user.rol_id) || 'admin');
  }
}

const text = [
  'Esto es una prueba para administración.',
  '',
  'Vercel, ciclo del 10 de noviembre al 10 de diciembre de 2026. Cifras de todo el equipo, acumuladas hasta el 13 de noviembre.',
  '',
  `Total para pagar: ${money(44.96)}.`,
  `El contador en bruto marca ${money(64.96)}. El crédito del plan, ${money(20)}, ya está gastado.`,
  '',
  `Plan Pro: ${money(20)}`,
  `CDN de tarifa fija: ${money(20)}`,
  `Builds: ${money(23.49)} (6.712 minutos)`,
  `Resto del uso: ${money(1.47)}`,
  '',
  'OpenAI no entra en este total. La clave de la aplicación no puede leer la factura: le falta el permiso de uso.',
  '',
  'La partida que se ha disparado son los builds. El 12 de noviembre la rama del B1 lanzó decenas de construcciones, y cada subida se hace en los dos proyectos.',
].join('\n');

const subject = 'Prueba: gasto de Vercel hasta el 13 de noviembre';
const results = [];

for (const [email, rol] of recipients) {
  const mail = await sendTransactionalEmail({
    to: email,
    subject,
    text,
    preheader: 'Total para pagar en Vercel: 44,96 USD. OpenAI no se ha podido leer.',
  });
  results.push({ email, rol, sent: Boolean(mail.ok), channel: mail.channel || null, error: mail.error || null });
}

console.log(JSON.stringify({ recipients: results.length, results }, null, 2));
process.exit(results.some((row) => row.sent) ? 0 : 1);
