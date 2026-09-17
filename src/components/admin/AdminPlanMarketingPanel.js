'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { supabase } from '@/utils/supabaseClient';
import { getClientAuth } from '@/utils/getClientAuth';
import { canAccessMarketingPlanAdminPanel, getRoleNameByUserId } from '@/utils/authRoles';
import PanelPageHeader from '@/components/PanelPageHeader';
import RouteLoadingMascot from '@/components/RouteLoadingMascot';
import styles from './AdminPlanMarketingPanel.module.css';

const TABS = [
  { id: 'promociones', label: 'Promociones' },
  { id: 'resultados', label: 'Resultados de marketing' },
  { id: 'atribucion', label: 'Atribución del lead' },
];

const PIE_COLORS = ['#6366f1', '#14b8a6'];

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
  return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
}

function campaignBadgeClass(estado) {
  if (estado === 'activa') return styles.badgeActive;
  if (estado === 'pendiente_migracion') return styles.badgePending;
  return styles.badgeInactive;
}

function referralStatusClass(status) {
  if (status === 'paid') return styles.statusPaid;
  if (status === 'registered') return styles.statusRegistered;
  return styles.statusSent;
}

function referralStatusLabel(status) {
  if (status === 'paid') return 'Plan de pago';
  if (status === 'registered') return 'Registrado';
  return 'Enviado';
}

function PromotionsTab({ data }) {
  const promotions = data?.promotions;
  if (!promotions) return null;

  return (
    <div className={styles.section}>
      <div>
        <h2 className={styles.sectionTitle}>Campañas activas</h2>
        <p className={styles.sectionDesc}>
          Promociones y programas que impactan en captación, conversión y retención.
        </p>
      </div>

      <div className={styles.cardGrid}>
        {promotions.campaigns.map((campaign) => (
          <article key={campaign.id} className={styles.card}>
            <div className={styles.cardHead}>
              <h3 className={styles.cardTitle}>{campaign.nombre}</h3>
              <span className={`${styles.badge} ${campaignBadgeClass(campaign.estado)}`}>
                {campaign.estado === 'activa'
                  ? 'Activa'
                  : campaign.estado === 'pendiente_migracion'
                    ? 'Pendiente'
                    : 'Inactiva'}
              </span>
            </div>
            <p className={styles.cardText}>{campaign.descripcion}</p>
            {campaign.meta ? <p className={styles.cardMeta}>{campaign.meta}</p> : null}
            <div className={styles.linkRow}>
              <Link href={campaign.enlace} className={styles.linkBtnSecondary} target="_blank">
                Ver en la web
              </Link>
            </div>
          </article>
        ))}
      </div>

      <div>
        <h2 className={styles.sectionTitle}>Precios y promociones de planes</h2>
        <p className={styles.sectionDesc}>
          Estado comercial de cada plan. Para editar precios o badges, usa el plan financiero.
        </p>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Plan</th>
              <th>Tipo</th>
              <th>Precio</th>
              <th>Referencia</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {promotions.plans.map((plan) => (
              <tr key={plan.id}>
                <td>{plan.nombre}</td>
                <td>{plan.tipo === 'lanzamiento' ? 'Lanzamiento' : 'Estándar'}</td>
                <td>{formatMoney(plan.precio)}</td>
                <td>
                  {plan.precioLista > 0 ? formatMoney(plan.precioLista) : '—'}
                  {plan.badge ? ` · ${plan.badge}` : ''}
                </td>
                <td>{plan.activo ? 'Activo' : 'Inactivo'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={styles.linkRow}>
        <Link href="/admin/plan-financiero" className={styles.linkBtn}>
          Abrir plan financiero
        </Link>
        <Link href="/precios" className={styles.linkBtnSecondary} target="_blank">
          Ver página de precios
        </Link>
      </div>
    </div>
  );
}

function ResultsTab({ data }) {
  const results = data?.results;
  if (!results) return null;

  const totals = results.totals;

  return (
    <div className={styles.section}>
      <div>
        <h2 className={styles.sectionTitle}>Resultados de marketing</h2>
        <p className={styles.sectionDesc}>
          Indicadores de captación, consentimiento comercial y conversión a planes de pago.
        </p>
      </div>

      {!results.tablesReady.users ? (
        <p className={styles.hint} role="status">
          No se pudo leer la tabla de usuarios. Revisa la conexión con Supabase.
        </p>
      ) : null}

      <div className={styles.kpiGrid}>
        <div className={styles.kpi}>
          <p className={styles.kpiLabel}>Usuarios registrados</p>
          <p className={styles.kpiValue}>{totals.users}</p>
        </div>
        <div className={styles.kpi}>
          <p className={styles.kpiLabel}>Altas (30 días)</p>
          <p className={styles.kpiValue}>{totals.registrationsLast30d}</p>
        </div>
        <div className={styles.kpi}>
          <p className={styles.kpiLabel}>Aceptan comunicaciones</p>
          <p className={styles.kpiValue}>{totals.marketingOptIn}</p>
          <p className={styles.cardMeta}>{totals.marketingOptInRate}% del total</p>
        </div>
        <div className={styles.kpi}>
          <p className={styles.kpiLabel}>Suscripciones activas</p>
          <p className={styles.kpiValue}>{totals.activeSubscriptions}</p>
        </div>
        <div className={styles.kpi}>
          <p className={styles.kpiLabel}>Referidos con pago</p>
          <p className={styles.kpiValue}>{totals.referralConversions}</p>
        </div>
      </div>

      <div>
        <h3 className={styles.sectionTitle}>Evolución de registros</h3>
        <div className={styles.chartBox}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={results.registrationSeries}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="registros" name="Registros" fill="#6366f1" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div>
        <h3 className={styles.sectionTitle}>Embudo de referidos</h3>
        <div className={styles.chartBox}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={results.referralFunnel} layout="vertical" margin={{ left: 12, right: 12 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} />
              <YAxis type="category" dataKey="etapa" width={150} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="total" name="Total" fill="#14b8a6" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function AttributionTab({ data }) {
  const attribution = data?.attribution;
  if (!attribution) return null;

  const pieData = attribution.summary.channels.map((row, index) => ({
    name: row.canal,
    value: row.leads,
    fill: PIE_COLORS[index % PIE_COLORS.length],
  }));

  return (
    <div className={styles.section}>
      <div>
        <h2 className={styles.sectionTitle}>Atribución del lead</h2>
        <p className={styles.sectionDesc}>
          Origen de los registros y seguimiento del programa de referidos.
        </p>
      </div>

      <div className={styles.kpiGrid}>
        <div className={styles.kpi}>
          <p className={styles.kpiLabel}>Leads referidos</p>
          <p className={styles.kpiValue}>{attribution.summary.referred}</p>
        </div>
        <div className={styles.kpi}>
          <p className={styles.kpiLabel}>Leads orgánicos</p>
          <p className={styles.kpiValue}>{attribution.summary.organic}</p>
        </div>
        <div className={styles.kpi}>
          <p className={styles.kpiLabel}>% atribución referido</p>
          <p className={styles.kpiValue}>{attribution.summary.referralRate}%</p>
        </div>
      </div>

      <div className={styles.chartBox}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={92}
              label={({ name, percent }) => `${name} (${Math.round(percent * 100)}%)`}
            >
              {pieData.map((entry, index) => (
                <Cell key={entry.name} fill={entry.fill || PIE_COLORS[index % PIE_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div>
        <h3 className={styles.sectionTitle}>Invitaciones de referidos</h3>
        {!attribution.tablesReady.referrals ? (
          <p className={styles.hint} role="status">
            Ejecuta la migración{' '}
            <code>scripts/migrations/create_referral_invitations.sql</code> para ver atribución
            detallada.
          </p>
        ) : null}
      </div>

      <div className={styles.tableWrap}>
        {attribution.referrals.length === 0 ? (
          <p className={styles.empty}>Todavía no hay invitaciones de referidos registradas.</p>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Email invitado</th>
                <th>Canal</th>
                <th>Estado</th>
                <th>Plan</th>
                <th>Enviado</th>
                <th>Registro</th>
                <th>Pago</th>
              </tr>
            </thead>
            <tbody>
              {attribution.referrals.map((row) => (
                <tr key={row.id}>
                  <td>{row.email}</td>
                  <td>{row.canal}</td>
                  <td>
                    <span className={`${styles.statusPill} ${referralStatusClass(row.status)}`}>
                      {referralStatusLabel(row.status)}
                    </span>
                  </td>
                  <td>{row.paidPlan || '—'}</td>
                  <td>{formatDate(row.sentAt)}</td>
                  <td>{formatDate(row.registeredAt)}</td>
                  <td>{formatDate(row.paidAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default function AdminPlanMarketingPanel() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState('promociones');

  const load = useCallback(async () => {
    setError('');
    const headers = await getAdminFetchHeaders();
    const res = await fetch('/api/admin/plan-marketing', { headers });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json.error || 'No se pudieron cargar los datos.');
    setData(json);
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const { session, user } = await getClientAuth();
      if (!session?.user || !user) {
        router.push('/login?next=/admin/plan-marketing');
        return;
      }

      const role = await getRoleNameByUserId(user.id, user.email);
      if (!canAccessMarketingPlanAdminPanel(role)) {
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

  const tabContent = useMemo(() => {
    if (!data) return null;
    if (activeTab === 'promociones') return <PromotionsTab data={data} />;
    if (activeTab === 'resultados') return <ResultsTab data={data} />;
    return <AttributionTab data={data} />;
  }, [activeTab, data]);

  if (loading) {
    return <RouteLoadingMascot label="Cargando plan de marketing…" variant={5} width={120} />;
  }

  return (
    <div className={`admin-module ${styles.wrap}`}>
      <PanelPageHeader
        title="Plan de marketing"
        subtitle="Promociones, resultados de captación y atribución de leads en un solo lugar."
        mascotVariant={5}
      />

      <div className={styles.tabs} role="tablist" aria-label="Secciones del plan de marketing">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            className={activeTab === tab.id ? styles.tabActive : styles.tab}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {error ? (
        <p className={styles.error} role="alert">
          {error}
        </p>
      ) : null}

      {tabContent}
    </div>
  );
}
