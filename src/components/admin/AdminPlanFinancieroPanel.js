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

  const seedPlans = async () => {
    setActionLoading(true);
    setError('');
    try {
      const headers = await getAdminFetchHeaders();
      const res = await fetch('/api/admin/plan-financiero', { method: 'POST', headers });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || 'No se pudieron crear los planes.');
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
  const plans = data?.plans || [];
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
          Modelo previsto: A2 gratuito; B1–C2 con suscripción. Enlaza con los planes de pago de
          abajo.
        </p>
        <div className={styles.levelGrid}>
          {PREMIUM_EXAM_LEVELS.map((level) => (
            <article
              key={level.slug}
              className={`${styles.levelCard} ${
                level.access === 'premium' ? styles['levelCard--premium'] : styles['levelCard--free']
              }`}
            >
              <span
                className={`${styles.levelBadge} ${
                  level.access === 'premium'
                    ? styles['levelBadge--premium']
                    : styles['levelBadge--free']
                }`}
              >
                {level.access === 'premium' ? 'Premium' : 'Gratis'}
              </span>
              <h3 className={styles.levelLabel}>{level.label}</h3>
              <p className={styles.levelNote}>{level.note}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Planes de monetización</h2>
        <p className={styles.sectionDesc}>Precios y duración publicados en la web.</p>
        <div className={styles.toolbar}>
          <button
            type="button"
            className={`${styles.btn} ${styles.btnPrimary}`}
            disabled={actionLoading || plans.length > 0}
            onClick={seedPlans}
          >
            {actionLoading ? 'Creando…' : 'Crear planes por defecto'}
          </button>
          <button type="button" className={styles.btn} onClick={() => load()} disabled={actionLoading}>
            Actualizar
          </button>
        </div>
        {plans.length === 0 ? (
          <div className={`${styles.banner} ${styles.bannerWarn}`}>
            No hay planes en la base de datos. Pulsa «Crear planes por defecto» para cargar la
            propuesta B2/C1 (editable después en Supabase).
          </div>
        ) : null}
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Plan</th>
                <th>Precio</th>
                <th>Duración</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {plans.length ? (
                plans.map((plan) => (
                  <tr key={plan.id}>
                    <td>
                      <strong>{plan.nombre}</strong>
                      {plan.descripcion ? (
                        <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: 4 }}>
                          {plan.descripcion}
                        </div>
                      ) : null}
                    </td>
                    <td>{formatMoney(plan.precio)}</td>
                    <td>
                      {plan.duracion_dias
                        ? `${plan.duracion_dias} días`
                        : '—'}
                    </td>
                    <td>
                      <span
                        className={
                          plan.activo !== false ? styles.statusActive : styles.statusInactive
                        }
                      >
                        {plan.activo !== false ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className={styles.empty}>
                    Sin planes configurados
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
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
