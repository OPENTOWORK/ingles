import { createClient } from '@supabase/supabase-js';
import {
  createNewsletterTokenPair,
  normalizeNewsletterEmail,
  normalizeNewsletterToken,
  planNewsletterConfirm,
  planNewsletterSignup,
  planNewsletterUnsubscribe,
} from '@/lib/newsletter';
import { getSupabaseServiceRoleKey, getSupabaseUrl } from '@/lib/supabaseEnv';

function newsletterDb() {
  const key = getSupabaseServiceRoleKey()?.trim();
  if (!key) return null;
  return createClient(getSupabaseUrl(), key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

function missingTable(error) {
  const message = String(error?.message || '');
  return error?.code === '42P01' || /newsletter_suscriptores/i.test(message);
}

/**
 * Guarda el alta. Si ya está activa, no cambia nada.
 * @returns {Promise<{ ok: true, outcome: 'pending'|'active', confirmToken?: string, unsubscribeToken?: string } | { ok: false, error: string }>}
 */
export async function saveNewsletterSignup(email, now = new Date()) {
  const normalized = normalizeNewsletterEmail(email);
  if (!normalized) return { ok: false, error: 'invalid_email' };

  const db = newsletterDb();
  if (!db) return { ok: false, error: 'no_db' };

  const { data: existing, error: readError } = await db
    .from('newsletter_suscriptores')
    .select('id, status, confirm_token, unsubscribe_token')
    .eq('email', normalized)
    .maybeSingle();

  if (readError) {
    console.error('[newsletter] leer suscriptor', readError);
    return { ok: false, error: missingTable(readError) ? 'no_table' : 'read_failed' };
  }

  const plan = planNewsletterSignup(existing, createNewsletterTokenPair(), now.toISOString());
  if (plan.action === 'none') return { ok: true, outcome: 'active' };

  if (plan.action === 'insert') {
    const { error } = await db.from('newsletter_suscriptores').insert({
      email: normalized,
      ...plan.row,
    });
    if (error) {
      console.error('[newsletter] guardar suscriptor', error);
      return { ok: false, error: missingTable(error) ? 'no_table' : 'write_failed' };
    }
    return {
      ok: true,
      outcome: 'pending',
      confirmToken: plan.confirmToken,
      unsubscribeToken: plan.unsubscribeToken,
    };
  }

  const { error } = await db
    .from('newsletter_suscriptores')
    .update(plan.row)
    .eq('id', existing.id);
  if (error) {
    console.error('[newsletter] actualizar suscriptor', error);
    return { ok: false, error: 'write_failed' };
  }
  return {
    ok: true,
    outcome: plan.outcome,
    confirmToken: plan.confirmToken,
    unsubscribeToken: plan.unsubscribeToken,
  };
}

async function applyTokenPlan(column, token, planFn) {
  const clean = normalizeNewsletterToken(token);
  if (!clean) return { ok: false, error: 'invalid' };

  const db = newsletterDb();
  if (!db) return { ok: false, error: 'no_db' };

  const { data: row, error: readError } = await db
    .from('newsletter_suscriptores')
    .select('id, status')
    .eq(column, clean)
    .maybeSingle();

  if (readError) {
    console.error('[newsletter] leer token', readError);
    return { ok: false, error: missingTable(readError) ? 'no_table' : 'read_failed' };
  }

  const plan = planFn(row, new Date().toISOString());
  if (!plan.ok) return { ok: false, error: plan.code };
  if (plan.already) return { ok: true, already: true };

  const { error } = await db.from('newsletter_suscriptores').update(plan.patch).eq('id', row.id);
  if (error) {
    console.error('[newsletter] actualizar token', error);
    return { ok: false, error: 'write_failed' };
  }
  return { ok: true, already: false };
}

export function confirmNewsletterToken(token) {
  return applyTokenPlan('confirm_token', token, planNewsletterConfirm);
}

export function unsubscribeNewsletterToken(token) {
  return applyTokenPlan('unsubscribe_token', token, planNewsletterUnsubscribe);
}
