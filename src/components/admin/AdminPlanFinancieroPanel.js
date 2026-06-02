'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { supabase } from '@/utils/supabaseClient';
import { getClientAuth } from '@/utils/getClientAuth';
import { userHasRole } from '@/utils/authRoles';
import {
  PREMIUM_EXAM_LEVELS,
  SUBSCRIPTION_STATUS_LABELS,
} from '@/data/financialPlanConfig';
import SubscriptionPlansSection from '@/components/subscriptions/SubscriptionPlansSection';
import AdminPlanEditModal from '@/components/admin/AdminPlanEditModal';
import AdminPlanRowMenu from '@/components/admin/AdminPlanRowMenu';
import PanelPageHeader from '@/components/PanelPageHeader';
import RouteLoadingMascot from '@/components/RouteLoadingMascot';
import styles from './AdminPlanFinancieroPanel.module.css';

async function getAdminFetchHeaders() {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) {
    throw new Error('Sesión no válida. Cierra sesión y vuelve a entrar.');
  }
  const { data: sessionData } = await supabase.auth.getSession();
  let accessToken = sessionData?.session?.access_token || null;
  if (!accessToken) {
    const { data: refreshed, error: refreshError } = await supabase.auth.refreshSession();
    if (refreshError) throw new Error('Sesión expirada. Vuelve a iniciar sesión.');
    accessToken = refreshed?.session?.access_token || null;
  }
  const headers = { 'Content-Type': 'application/json' };
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
  return headers;
}

function formatMoney(value) {
  const n = Number(value) || 0;
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(n);
}

function formatDate(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function statusLabel(estado) {
  const key = String(estado || '').toLowerCase();
  return SUBSCRIPTION_STATUS_LABELS[key] || estado || '—';
}

export default function AdminPlanFinancieroPanel() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  /** null = cerrado; 'create' = nuevo plan; objeto = editar */
  const [planModal, setPlanModal] = useState(null);
  const [savingPlan, setSavingPlan] = useState(false);

  const load = useCallback(async () => {
    setError('');
    const headers = await getAdminFetchHeaders();
    const res = await fetch('/api/admin/plan-financiero', { headers });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json.error || 'No se pudieron cargar los datos.');
    setData(json);
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const { session, user } = await getClientAuth();
      if (!session?.user || !user) {
        router.push('/login');
        return;
      }
      const isAdmin = await userHasRole(user.id, ['admin', 'administrador'], user.email);
      if (!isAdmin) {
        router.push('/perfil');
        return;
      }
      try {
        await load();
      } catch (e) {
        if (!cancelled) setError(e.message || 'Error al cargar');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [router, load]);

  const savePlan = async (payload) => {
    const isCreate = !payload.id;
    setSavingPlan(true);
    setError('');
    try {
      const headers = await getAdminFetchHeaders();
      const res = await fetch('/api/admin/plan-financiero', {
        method: isCreate ? 'POST' : 'PATCH',
        headers,
        body: JSON.stringify(
          isCreate ? { action: 'create-plan', ...payload } : payload,
        ),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || 'No se pudo guardar el plan.');
      setPlanModal(null);
      await load();
    } catch (e) {
      setError(e.message || 'Error');
    } finally {
      setSavingPlan(false);
    }
  };

  const deletePlan = async (plan) => {
    const ok = window.confirm(
      `¿Eliminar el plan «${plan.nombre}»?\n\nSi tiene suscripciones asociadas se desactivará en lugar de borrarse.`,
    );
    if (!ok) return;

    setActionLoading(true);
    setError('');
    try {
      const headers = await getAdminFetchHeaders();
      const res = await fetch(`/api/admin/plan-financiero?id=${encodeURIComponent(plan.id)}`, {
        method: 'DELETE',
        headers,
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || 'No se pudo eliminar el plan.');
      await load();
    } catch (e) {
      setError(e.message || 'Error');
    } finally {
      setActionLoading(false);
    }
  };

  const syncCatalog = async () => {
    setActionLoading(true);
    setError('');
    try {
      const headers = await getAdminFetchHeaders();
      const res = await fetch('/api/admin/plan-financiero', {
        method: 'POST',
        headers,
        body: JSON.stringify({ action: 'sync-catalog' }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || 'No se pudo sincronizar el catálogo.');
      await load();
    } catch (e) {
      setError(e.message || 'Error');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <RouteLoadingMascot label="Cargando plan financiero…" variant={6} width={120} />;
  }

  const summary = data?.summary || {};
  const plans = [...(data?.plans || [])]
    .filter((p) => p.activo !== false)
    .sort((a, b) => {
      const oa = a.orden ?? Number(a.precio) ?? 0;
      const ob = b.orden ?? Number(b.precio) ?? 0;
      return oa - ob;
    });
  const subscriptions = data?.subscriptions || [];
  const subsByMonth = data?.subscriptionsByMonth || [];
  const revenueByMonth = data?.revenueByMonth || [];

  return (
    <div className={styles.wrap}>
      <PanelPageHeader
        title="Plan financiero"
        subtitle="Monetización, niveles premium y suscripciones (solo administración)"
        mascotVariant={9}
        mascotWidth={96}
      >
        <Link href="/admin" className={styles.btn}>
          ← Panel admin
        </Link>
      </PanelPageHeader>

      <div className={styles.banner} role="status">
        Datos desde Supabase: <strong>monetizacion_planes</strong>,{' '}
        <strong>monetizacion_suscripciones</strong> y <strong>monetizacion_pagos</strong>. Solo
        visible para administradores.
      </div>

      {error ? <p className={styles.error}>{error}</p> : null}

      <div className={styles.kpiGrid}>
        <div className={styles.kpi}>
          <p className={styles.kpiLabel}>Suscriptores (total)</p>
          <p className={styles.kpiValue}>{summary.totalSubscriptions ?? 0}</p>
        </div>
        <div className={styles.kpi}>
          <p className={styles.kpiLabel}>Suscripciones activas</p>
          <p className={styles.kpiValue}>{summary.activeSubscriptions ?? 0}</p>
        </div>
        <div className={styles.kpi}>
          <p className={styles.kpiLabel}>Nuevas (30 días)</p>
          <p className={styles.kpiValue}>{summary.newSubscriptionsLast30Days ?? 0}</p>
        </div>
        <div className={styles.kpi}>
          <p className={styles.kpiLabel}>Ingresos confirmados</p>
          <p className={styles.kpiValue}>{formatMoney(summary.totalRevenue)}</p>
        </div>
        <div className={styles.kpi}>
          <p className={styles.kpiLabel}>Ingresos (30 días)</p>
          <p className={styles.kpiValue}>{formatMoney(summary.revenueLast30Days)}</p>
        </div>
        <div className={styles.kpi}>
          <p className={styles.kpiLabel}>Planes activos</p>
          <p className={styles.kpiValue}>
            {summary.activePlans ?? 0}/{summary.totalPlans ?? 0}
          </p>
        </div>
      </div>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Niveles premium (Exam practice)</h2>
        <p className={styles.sectionDesc}>
          A2 en FREE; B1 desde STARTER; B2–C2 desde PREMIUM (PRO incluye todo).
        </p>
        <div className={styles.levelGrid}>
          {PREMIUM_EXAM_LEVELS.map((level) => (
            <article
              key={level.slug}
              className={`${styles.levelCard} ${
                level.access === 'free'
                  ? styles['levelCard--free']
                  : level.access === 'starter'
                    ? styles['levelCard--starter']
                    : styles['levelCard--premium']
              }`}
            >
              <span
                className={`${styles.levelBadge} ${
                  level.access === 'free'
                    ? styles['levelBadge--free']
                    : level.access === 'starter'
                      ? styles['levelBadge--starter']
                      : styles['levelBadge--premium']
                }`}
              >
                {level.access === 'free'
                  ? 'FREE'
                  : level.access === 'starter'
                    ? 'STARTER+'
                    : 'PREMIUM+'}
              </span>
              <h3 className={styles.levelLabel}>{level.label}</h3>
              {level.note ? <p className={styles.levelNote}>{level.note}</p> : null}
            </article>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Planes de monetización (catálogo)</h2>
        <p className={styles.sectionDesc}>
          Solo se muestran planes activos. Usa <strong>Crear plan</strong> para añadir uno nuevo o ⋮
          para editar o eliminar.
        </p>
        <div className={styles.toolbar}>
          <button
            type="button"
            className={`${styles.btn} ${styles.btnPrimary}`}
            disabled={actionLoading || savingPlan}
            onClick={() => setPlanModal('create')}
          >
            Crear plan
          </button>
          <button
            type="button"
            className={styles.btn}
            disabled={actionLoading}
            onClick={syncCatalog}
          >
            {actionLoading ? 'Sincronizando…' : 'Sincronizar catálogo (4 planes)'}
          </button>
          <button type="button" className={styles.btn} onClick={() => load()} disabled={actionLoading}>
            Actualizar
          </button>
          <Link href="/precios" className={styles.btn}>
            Ver página pública /precios
          </Link>
        </div>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Plan</th>
                <th>Slug</th>
                <th>Precio</th>
                <th>Duración</th>
                <th>Stripe</th>
                <th className={styles.thActions} aria-label="Acciones" />
              </tr>
            </thead>
            <tbody>
              {plans.length ? (
                plans.map((plan) => (
                  <tr key={plan.id}>
                    <td>
                      <strong>{plan.nombre}</strong>
                      {plan.badge ? (
                        <div style={{ fontSize: '0.75rem', color: '#6366f1', marginTop: 4 }}>
                          {plan.badge}
                        </div>
                      ) : null}
                      {plan.descripcion ? (
                        <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: 4 }}>
                          {plan.descripcion}
                        </div>
                      ) : null}
                    </td>
                    <td>
                      <code style={{ fontSize: '0.78rem' }}>{plan.slug || '—'}</code>
                    </td>
                    <td>{formatMoney(plan.precio)}</td>
                    <td>
                      {plan.duracion_dias
                        ? `${plan.duracion_dias} días`
                        : '—'}
                    </td>
                    <td>
                      <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                        {plan.stripe_price_id || '—'}
                      </span>
                    </td>
                    <td className={styles.tdActions}>
                      <AdminPlanRowMenu
                        plan={plan}
                        disabled={actionLoading || savingPlan}
                        onEdit={setPlanModal}
                        onDelete={deletePlan}
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className={styles.empty}>
                    Sin planes. Pulsa «Sincronizar catálogo».
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <SubscriptionPlansSection
          title="Vista previa — elegir plan"
          subtitle="Así verán los alumnos la comparativa en /precios y en su perfil."
          showCta={false}
        />

        <AdminPlanEditModal
          mode={planModal === 'create' ? 'create' : 'edit'}
          plan={planModal === 'create' ? null : planModal}
          open={planModal !== null}
          saving={savingPlan}
          onClose={() => setPlanModal(null)}
          onSave={savePlan}
        />
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Estadísticas</h2>
        <p className={styles.sectionDesc}>Altas y facturación por mes (según datos registrados).</p>
        <div className={styles.chartBox}>
          <p style={{ margin: '0 0 0.5rem', fontSize: '0.85rem', color: '#64748b' }}>
            Nuevas suscripciones por mes
          </p>
          {subsByMonth.length ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={subsByMonth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" name="Suscriptores" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className={styles.empty}>Aún no hay suscripciones registradas.</p>
          )}
        </div>
        <div className={styles.chartBox}>
          <p style={{ margin: '0 0 0.5rem', fontSize: '0.85rem', color: '#64748b' }}>
            Ingresos por mes (pagos exitosos)
          </p>
          {revenueByMonth.length ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={revenueByMonth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => formatMoney(v)} />
                <Bar dataKey="revenue" name="Ingresos" fill="#059669" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className={styles.empty}>Aún no hay pagos registrados.</p>
          )}
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Personas suscritas</h2>
        <p className={styles.sectionDesc}>
          Listado de monetizacion_suscripciones (últimas 200).
        </p>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Plan</th>
                <th>Estado</th>
                <th>Inicio</th>
                <th>Fin</th>
                <th>Auto-renovación</th>
              </tr>
            </thead>
            <tbody>
              {subscriptions.length ? (
                subscriptions.map((sub) => (
                  <tr key={sub.id}>
                    <td>
                      {sub.profile?.email || sub.user_id?.slice(0, 8) || '—'}
                      {sub.profile?.nombre ? (
                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                          {sub.profile.nombre}
                        </div>
                      ) : null}
                    </td>
                    <td>{sub.plan?.nombre || '—'}</td>
                    <td>{statusLabel(sub.estado)}</td>
                    <td>{formatDate(sub.inicio_en)}</td>
                    <td>{formatDate(sub.fin_en)}</td>
                    <td>{sub.auto_renovacion ? 'Sí' : 'No'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className={styles.empty}>
                    Nadie se ha suscrito todavía. Cuando un alumno pague, aparecerá aquí.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
