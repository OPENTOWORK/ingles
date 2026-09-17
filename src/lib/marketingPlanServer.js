import {
  DEFAULT_MONETIZATION_PLANS,
  LAUNCH_PRICE_LABEL,
  getPlanDisplayLabel,
  planHasLaunchPricing,
  planSlugFromDbRow,
} from '@/data/financialPlanConfig';
import { getFoundingMemberSlotAvailability } from '@/lib/foundingMemberPlus';
import { MAX_FOUNDING_SLOT } from '@/lib/foundingMemberPlus.rules';
import { REFERRAL_INVITATIONS_TABLE, REFERRAL_STATUS } from '@/lib/referrals';
import { SUBSCRIPTIONS_TABLE } from '@/lib/stripe/subscriptions';
import { subscriptionGrantsAccess } from '@/lib/stripe/server';

function isMissingTableError(error) {
  const msg = String(error?.message || error?.code || '').toLowerCase();
  return (
    error?.code === '42P01' ||
    error?.code === 'PGRST205' ||
    msg.includes('does not exist') ||
    msg.includes('could not find the table')
  );
}

function monthKey(dateValue) {
  const d = new Date(dateValue);
  if (Number.isNaN(d.getTime())) return null;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function formatMonthLabel(key) {
  if (!key) return '—';
  const [year, month] = key.split('-').map(Number);
  const d = new Date(year, month - 1, 1);
  return d.toLocaleDateString('es-ES', { month: 'short', year: '2-digit' });
}

function daysAgo(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

function buildPromotionFromPlan(plan) {
  const slug = plan.slug || planSlugFromDbRow(plan);
  const hasLaunch = planHasLaunchPricing(plan);
  return {
    id: slug,
    slug,
    nombre: plan.nombre || getPlanDisplayLabel(slug),
    activo: plan.activo !== false,
    badge: plan.badge || (hasLaunch ? LAUNCH_PRICE_LABEL : ''),
    precio: Number(plan.precio) || 0,
    precioRegular: Number(plan.precioRegular) || 0,
    precioLista: Number(plan.precioLista) || 0,
    tipo: hasLaunch ? 'lanzamiento' : 'estandar',
    enlacePublico: '/precios',
  };
}

async function fetchPromotionPlans(db) {
  const defaultsBySlug = Object.fromEntries(
    DEFAULT_MONETIZATION_PLANS.map((plan) => [plan.slug, plan]),
  );

  const { data, error } = await db.from('monetizacion_planes').select('*').order('orden', {
    ascending: true,
  });

  if (error) {
    if (isMissingTableError(error)) {
      return DEFAULT_MONETIZATION_PLANS.map((plan) => buildPromotionFromPlan(plan));
    }
    throw error;
  }

  const rows = (data || []).map((row) => {
    const slug = planSlugFromDbRow(row);
    const fallback = defaultsBySlug[slug] || {};
    return buildPromotionFromPlan({
      ...fallback,
      ...row,
      slug,
      precioRegular: row.precio_regular ?? fallback.precioRegular,
      precioLista: row.precio_lista ?? fallback.precioLista,
    });
  });

  if (!rows.length) {
    return DEFAULT_MONETIZATION_PLANS.map((plan) => buildPromotionFromPlan(plan));
  }

  return rows;
}

async function fetchUsersSnapshot(db) {
  const { data, error } = await db
    .from('Usuarios_y_Perfil_users')
    .select('id, email, creado_en, marketing_updates, metadata')
    .order('creado_en', { ascending: false })
    .limit(5000);

  if (error) {
    if (isMissingTableError(error)) return { users: [], tableReady: false };
    throw error;
  }

  const users = (data || []).map((row) => {
    const metadata = row.metadata && typeof row.metadata === 'object' ? row.metadata : {};
    const marketingAccepted =
      typeof row.marketing_updates === 'boolean'
        ? row.marketing_updates
        : typeof metadata?.legal_acceptance?.marketing_updates === 'boolean'
          ? metadata.legal_acceptance.marketing_updates
          : false;
    return {
      id: row.id,
      email: row.email || '',
      createdAt: row.creado_en,
      marketingAccepted,
    };
  });

  return { users, tableReady: true };
}

async function fetchReferralSnapshot(db) {
  const { data, error } = await db
    .from(REFERRAL_INVITATIONS_TABLE)
    .select(
      'id, inviter_user_id, invitee_email, status, invited_user_id, paid_plan_slug, email_sent_at, registered_at, paid_at, created_at',
    )
    .order('created_at', { ascending: false })
    .limit(500);

  if (error) {
    if (isMissingTableError(error)) {
      return { invitations: [], tableReady: false };
    }
    throw error;
  }

  return { invitations: data || [], tableReady: true };
}

async function fetchActiveSubscriptionsCount(db) {
  const { data, error } = await db.from(SUBSCRIPTIONS_TABLE).select('status');

  if (error) {
    if (isMissingTableError(error)) return { count: 0, tableReady: false };
    throw error;
  }

  const count = (data || []).filter((row) => subscriptionGrantsAccess(row.status)).length;
  return { count, tableReady: true };
}

function buildRegistrationSeries(users = [], months = 6) {
  const now = new Date();
  const keys = [];
  for (let i = months - 1; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    keys.push(monthKey(d));
  }

  const counts = Object.fromEntries(keys.map((key) => [key, 0]));
  users.forEach((user) => {
    const key = monthKey(user.createdAt);
    if (key && counts[key] !== undefined) counts[key] += 1;
  });

  return keys.map((key) => ({
    month: formatMonthLabel(key),
    registros: counts[key] || 0,
  }));
}

function buildReferralFunnel(invitations = []) {
  const sent = invitations.length;
  const registered = invitations.filter(
    (row) => row.status === REFERRAL_STATUS.REGISTERED || row.status === REFERRAL_STATUS.PAID,
  ).length;
  const paid = invitations.filter((row) => row.status === REFERRAL_STATUS.PAID).length;

  return [
    { etapa: 'Invitaciones enviadas', total: sent },
    { etapa: 'Registro completado', total: registered },
    { etapa: 'Plan de pago', total: paid },
  ];
}

function buildAttributionSummary(users = [], invitations = []) {
  const referredUserIds = new Set(
    invitations.filter((row) => row.invited_user_id).map((row) => row.invited_user_id),
  );

  let referred = 0;
  let organic = 0;
  users.forEach((user) => {
    if (referredUserIds.has(user.id)) referred += 1;
    else organic += 1;
  });

  const total = referred + organic;
  const referralRate = total ? Math.round((referred / total) * 100) : 0;

  return {
    referred,
    organic,
    total,
    referralRate,
    channels: [
      { canal: 'Referido (invitación)', leads: referred },
      { canal: 'Orgánico / directo', leads: organic },
    ],
  };
}

function buildFoundingLifetimePlusCampaign(slots = {}) {
  const total = Number(slots.total) || MAX_FOUNDING_SLOT;
  const claimed = Math.max(0, Number(slots.claimed) || 0);
  const remaining = Math.max(0, Number(slots.remaining) ?? total - claimed);
  const soldOut = Boolean(slots.soldOut ?? remaining === 0);

  return {
    id: 'founding-lifetime-plus',
    nombre: 'Plan Plus de por vida (50 primeros registros)',
    descripcion:
      'Los registros en los cupos 2–50 reciben Plan Plus gratuito de por vida. El banner de la home muestra las plazas restantes. A los 30 días deben completar la encuesta founding para confirmar el beneficio.',
    estado: soldOut ? 'inactiva' : 'activa',
    enlace: '/',
    meta: soldOut
      ? `Agotado · ${claimed}/${total} plazas asignadas`
      : `Quedan ${remaining} de ${total} plazas · ${claimed} asignadas`,
  };
}

function mapReferralRows(invitations = []) {
  return invitations.slice(0, 40).map((row) => ({
    id: row.id,
    email: row.invitee_email,
    status: row.status,
    paidPlan: row.paid_plan_slug || '',
    sentAt: row.email_sent_at || row.created_at,
    registeredAt: row.registered_at,
    paidAt: row.paid_at,
    canal: 'Programa de referidos',
  }));
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} db
 */
export async function fetchMarketingPlanDashboard(db) {
  const [promotions, usersSnapshot, referralSnapshot, subscriptionsSnapshot, foundingSlots] =
    await Promise.all([
      fetchPromotionPlans(db),
      fetchUsersSnapshot(db),
      fetchReferralSnapshot(db),
      fetchActiveSubscriptionsCount(db),
      getFoundingMemberSlotAvailability(db),
    ]);

  const users = usersSnapshot.users;
  const invitations = referralSnapshot.invitations;
  const since30d = daysAgo(30);

  const registrationsLast30d = users.filter((user) => user.createdAt && user.createdAt >= since30d)
    .length;
  const marketingOptIn = users.filter((user) => user.marketingAccepted).length;
  const marketingOptInRate = users.length
    ? Math.round((marketingOptIn / users.length) * 100)
    : 0;

  const referralPaid = invitations.filter((row) => row.status === REFERRAL_STATUS.PAID).length;

  return {
    promotions: {
      plans: promotions,
      campaigns: [
        buildFoundingLifetimePlusCampaign(foundingSlots),
        {
          id: 'referral-program',
          nombre: 'Programa de referidos',
          descripcion:
            'Los alumnos invitan amigos desde su perfil. Si el invitado contrata un plan de pago, se registra la conversión.',
          estado: referralSnapshot.tableReady ? 'activa' : 'pendiente_migracion',
          enlace: '/perfil',
        },
        {
          id: 'launch-pricing',
          nombre: LAUNCH_PRICE_LABEL,
          descripcion: 'Precios promocionales visibles en la página de precios y checkout.',
          estado: promotions.some((plan) => plan.tipo === 'lanzamiento') ? 'activa' : 'inactiva',
          enlace: '/precios',
        },
      ],
    },
    results: {
      totals: {
        users: users.length,
        registrationsLast30d,
        marketingOptIn,
        marketingOptInRate,
        activeSubscriptions: subscriptionsSnapshot.count,
        referralConversions: referralPaid,
      },
      registrationSeries: buildRegistrationSeries(users),
      referralFunnel: buildReferralFunnel(invitations),
      tablesReady: {
        users: usersSnapshot.tableReady,
        referrals: referralSnapshot.tableReady,
        subscriptions: subscriptionsSnapshot.tableReady,
      },
    },
    attribution: {
      summary: buildAttributionSummary(users, invitations),
      referrals: mapReferralRows(invitations),
      tablesReady: {
        users: usersSnapshot.tableReady,
        referrals: referralSnapshot.tableReady,
      },
    },
  };
}
