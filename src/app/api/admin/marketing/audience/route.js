import { NextResponse } from 'next/server';
import { authenticateMarketingPlanAdminRequest } from '@/lib/adminAccess';
import {
  getPlanDisplayLabel,
  normalizeAdminAssignablePlanSlug,
} from '@/data/financialPlanConfig';
import { subscriptionGrantsAccess } from '@/lib/stripe/server';
import { readCommercialConsent } from '@/lib/marketingPlanServer';

const USER_SELECTS = [
  'id, email, plan_id, consentimiento_comercial',
  'id, email, plan_id',
];

function isMissingColumn(error) {
  const message = String(error?.message || '').toLowerCase();
  return error?.code === '42703' || message.includes('column') || message.includes('schema cache');
}

async function loadUsers(db) {
  let lastError = null;
  for (const select of USER_SELECTS) {
    const { data, error } = await db.from('Usuarios_y_Perfil_users').select(select);
    if (!error) return data || [];
    lastError = error;
    if (!isMissingColumn(error)) break;
  }
  throw lastError || new Error('No se pudieron leer los usuarios.');
}

async function loadSubscriptions(db) {
  const { data, error } = await db.from('suscripciones').select('user_id, plan_id, status');
  if (error) return [];
  return data || [];
}

export async function GET(req) {
  try {
    const auth = await authenticateMarketingPlanAdminRequest(req);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const [rows, subscriptions] = await Promise.all([
      loadUsers(auth.db),
      loadSubscriptions(auth.db),
    ]);

    const subsByUser = new Map();
    for (const sub of subscriptions) {
      if (!sub?.user_id) continue;
      const current = subsByUser.get(sub.user_id);
      if (!current || subscriptionGrantsAccess(sub.status)) {
        subsByUser.set(sub.user_id, sub);
      }
    }

    const users = rows
      .map((row) => {
        const assignedSlug = normalizeAdminAssignablePlanSlug(row.plan_id);
        const sub = subsByUser.get(row.id);
        const planSlug =
          sub && subscriptionGrantsAccess(sub.status) && sub.plan_id
            ? normalizeAdminAssignablePlanSlug(sub.plan_id)
            : assignedSlug;
        return {
          id: row.id,
          email: String(row.email || '').trim(),
          planLabel: getPlanDisplayLabel(planSlug),
          marketingAccepted: readCommercialConsent(row),
        };
      })
      .filter((row) => row.email)
      .sort((a, b) => a.email.localeCompare(b.email, 'es'));

    return NextResponse.json({ users });
  } catch (err) {
    console.error('[api/admin/marketing/audience] GET', err);
    return NextResponse.json(
      { error: err.message || 'No se pudo cargar el listado de correos.' },
      { status: 500 },
    );
  }
}
