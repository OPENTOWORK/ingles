/**
 * Envía a los administradores el correo de prueba de la encuesta founding.
 *
 *   node --loader ./scripts/alias-loader.mjs scripts/send-founding-survey-test.mjs [email...]
 */
import { createClient } from '@supabase/supabase-js';
import { getSupabaseServiceRoleKey, getSupabaseUrl } from '@/lib/supabaseEnv';
import { sendFoundingSurveyTestEmail } from '@/lib/foundingSurveyTestEmail';

const url = getSupabaseUrl();
const serviceKey = getSupabaseServiceRoleKey();

if (!serviceKey) {
  console.error('Falta la service role key de Supabase.');
  process.exit(1);
}

const adminClient = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const to = process.argv.slice(2).filter(Boolean);
const result = await sendFoundingSurveyTestEmail(adminClient, { to: to.length ? to : null });

console.log(JSON.stringify(result, null, 2));
process.exit(result.ok ? 0 : 1);
