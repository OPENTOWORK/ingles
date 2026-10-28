/**
 * Envía el reto del martes, tal como lo verá el alumno, a administración y marketing.
 *
 *   node --loader ./scripts/alias-loader.mjs scripts/send-weekly-challenge-test.mjs
 */
import { loadEnvLocal } from './load-env-local.mjs';

loadEnvLocal();

import { createClient } from '@supabase/supabase-js';
import { getSupabaseServiceRoleKey, getSupabaseUrl } from '@/lib/supabaseEnv';
import { dispatchAutomatedEmail } from '@/lib/dispatchAutomatedEmail';
import { AUTOMATED_EMAIL_TRIGGERS } from '@/lib/automatedEmailTriggers';
import { buildWeeklyChallengeEmailVariables } from '@/lib/weeklyChallengeEmail';
import { formatNombreVariable } from '@/lib/renderEmailTemplate';

const ADMIN_EMAIL = 'direccion@opentowork.com';
const onlyTo = String(process.argv[2] || '').trim().toLowerCase();

function normalizeRole(role) {
  return String(role || '')
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '_');
}

function isStaffRecipient(roleName) {
  const role = normalizeRole(roleName);
  return (
    role === 'admin' ||
    role === 'administrador' ||
    role === 'resp.marketing' ||
    role === 'resp_marketing' ||
    role === 'responsable_marketing' ||
    role === 'responsable_de_marketing' ||
    role === 'marketing'
  );
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

const roleNameById = new Map((roles || []).map((role) => [role.id, role.nombre || '']));
const staffRoleIds = [...roleNameById.entries()]
  .filter(([, name]) => isStaffRecipient(name))
  .map(([id]) => id);

const recipients = new Map();

if (!onlyTo && staffRoleIds.length) {
  const { data: users, error: usersError } = await adminClient
    .from('Usuarios_y_Perfil_users')
    .select('email, nombre, activo, rol_id')
    .in('rol_id', staffRoleIds);

  if (usersError) {
    console.error(usersError.message);
    process.exit(1);
  }

  for (const user of users || []) {
    if (user.activo === false) continue;
    const email = String(user.email || '').trim().toLowerCase();
    if (!email) continue;
    recipients.set(email, {
      email,
      nombre: user.nombre || '',
      rol: roleNameById.get(user.rol_id) || '',
    });
  }
}

const testTo = onlyTo || ADMIN_EMAIL;
if (!recipients.has(testTo)) {
  recipients.set(testTo, { email: testTo, nombre: '', rol: 'admin' });
}

const variables = buildWeeklyChallengeEmailVariables(new Date(), 'https://www.dralo.es');
const results = [];

for (const recipient of recipients.values()) {
  const mail = await dispatchAutomatedEmail({
    adminClient,
    triggerEvent: AUTOMATED_EMAIL_TRIGGERS.WEEKLY_TUESDAY_CHALLENGE,
    to: recipient.email,
    variables: {
      email: recipient.email,
      nombre: formatNombreVariable(recipient.nombre),
      ...variables,
    },
  });

  results.push({
    email: recipient.email,
    rol: recipient.rol,
    sent: Boolean(mail?.sent || mail?.queued),
    error: mail?.error || null,
  });
}

console.log(JSON.stringify({ challenge: variables.challenge_prompt, results }, null, 2));
process.exit(results.some((row) => row.sent) ? 0 : 1);
