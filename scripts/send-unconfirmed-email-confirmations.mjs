/**
 * Reenvía el correo de confirmación a las cuentas que aún no han confirmado.
 *
 *   node --loader ./scripts/alias-loader.mjs scripts/send-unconfirmed-email-confirmations.mjs
 */
import { loadEnvLocal } from './load-env-local.mjs';

loadEnvLocal();

import { createClient } from '@supabase/supabase-js';
import { generateAuthActionLink } from '@/lib/authActionLinks';
import { AUTOMATED_EMAIL_TRIGGERS } from '@/lib/automatedEmailTriggers';
import { dispatchAutomatedEmail } from '@/lib/dispatchAutomatedEmail';
import { getSupabaseServiceRoleKey, getSupabaseUrl } from '@/lib/supabaseEnv';

const SKIP_EMAIL = /mailinator\.com$|@example\.com$|^testreg/i;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function listAuthUsers(adminClient) {
  const users = [];
  let page = 1;
  while (true) {
    const { data, error } = await adminClient.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    const batch = data?.users || [];
    users.push(...batch);
    if (batch.length < 200) break;
    page += 1;
  }
  return users;
}

const supabaseUrl = getSupabaseUrl();
const serviceKey = getSupabaseServiceRoleKey();
if (!supabaseUrl || !serviceKey) {
  console.error('Falta la clave de servicio de Supabase.');
  process.exit(1);
}

const adminClient = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const authUsers = await listAuthUsers(adminClient);
const pending = authUsers.filter(
  (user) =>
    user.email &&
    !user.email_confirmed_at &&
    !user.deleted_at &&
    !SKIP_EMAIL.test(user.email),
);

const emails = pending.map((user) => user.email.toLowerCase());
const { data: profiles } = emails.length
  ? await adminClient.from('Usuarios_y_Perfil_users').select('email, nombre').in('email', emails)
  : { data: [] };
const nameByEmail = new Map(
  (profiles || []).map((row) => [String(row.email || '').toLowerCase(), row.nombre || '']),
);

console.log(`Cuentas sin confirmar: ${pending.length}`);

const results = [];
for (const user of pending) {
  const email = user.email.toLowerCase();
  const nombre = nameByEmail.get(email) || '';
  const link = await generateAuthActionLink(adminClient, {
    type: 'signup',
    email,
    origin: 'https://www.dralo.es',
    next: '/exam-practice/b2/exam-reading-and-use-of-english',
  });

  if (link.alreadyRegistered) {
    results.push({ email, status: 'ya_confirmada' });
    console.log(`ya confirmada  ${email}`);
    continue;
  }
  if (!link.url) {
    results.push({ email, status: 'sin_enlace', error: link.error });
    console.log(`sin enlace     ${email}  ${link.error || ''}`);
    continue;
  }

  const sent = await dispatchAutomatedEmail({
    adminClient,
    triggerEvent: AUTOMATED_EMAIL_TRIGGERS.USER_EMAIL_CONFIRMATION,
    to: email,
    variables: { email, nombre, action_url: link.url },
  });

  if (sent.sent || sent.queued) {
    results.push({ email, status: sent.sent ? 'enviado' : 'en_cola' });
    console.log(`${sent.sent ? 'enviado' : 'en cola'}      ${email}`);
  } else {
    results.push({ email, status: 'error', error: sent.error });
    console.log(`error          ${email}  ${sent.error || ''}`);
  }

  await sleep(400);
}

const sent = results.filter((row) => row.status === 'enviado' || row.status === 'en_cola').length;
const failed = results.filter((row) => row.status === 'error' || row.status === 'sin_enlace').length;
console.log(`Listo. Enviados: ${sent}. Fallidos: ${failed}.`);
