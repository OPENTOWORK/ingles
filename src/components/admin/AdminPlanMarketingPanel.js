'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import MarketingCalendar from '@/components/marketing/MarketingCalendar';
import ProjectRoadmapMap from '@/components/marketing/ProjectRoadmapMap';
import { supabase } from '@/utils/supabaseClient';
import { getClientAuth } from '@/utils/getClientAuth';
import { getRoleNameByUserId } from '@/utils/authRoles';
import { mayEnterStaffModule } from '@/lib/staffModuleGate';
import PanelPageHeader from '@/components/PanelPageHeader';
import RouteLoadingMascot from '@/components/RouteLoadingMascot';
import {
  formatPlanAnnualTotal,
  getPlanMonthlyPrice,
} from '@/data/financialPlanConfig';
import styles from './AdminPlanMarketingPanel.module.css';

const TABS = [
  { id: 'promociones', label: 'Promociones' },
  { id: 'calendario', label: 'Calendario' },
  { id: 'proyectos', label: 'Proyectos' },
];

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

function formatAnnualPriceCell(plan) {
  const monthlyWhenAnnual = getPlanMonthlyPrice(plan, 'annual');
  if (monthlyWhenAnnual <= 0) return '—';
  return `${formatMoney(monthlyWhenAnnual)}/mes · ${formatPlanAnnualTotal(plan)}/año`;
}

function campaignBadgeClass(estado) {
  if (estado === 'activa') return styles.badgeActive;
  if (estado === 'pendiente_migracion' || estado === 'sin_publicar') return styles.badgePending;
  return styles.badgeInactive;
}

function campaignBadgeLabel(estado) {
  if (estado === 'activa') return 'Activa';
  if (estado === 'pendiente_migracion') return 'Pendiente';
  if (estado === 'sin_publicar') return 'Sin publicar';
  return 'Inactiva';
}

function campaignIsListed(estado) {
  return estado === 'activa' || estado === 'pendiente_migracion' || estado === 'sin_publicar';
}

function PromotionsTab({ data }) {
  const promotions = data?.promotions;
  const [showInactive, setShowInactive] = useState(false);
  if (!promotions) return null;

  const inactiveCampaigns = promotions.campaigns.filter((campaign) => !campaignIsListed(campaign.estado));
  const inactivePlans = promotions.plans.filter((plan) => !plan.activo);
  const inactiveCount = inactiveCampaigns.length + inactivePlans.length;
  const visibleCampaigns = promotions.campaigns.filter((campaign) => (
    showInactive || campaignIsListed(campaign.estado)
  ));
  const visiblePlans = promotions.plans.filter((plan) => showInactive || plan.activo);

  return (
    <div className={styles.section}>
      <div className={`${styles.sectionHead} ${styles.sectionHeadSplit}`}>
        <div>
          <h2 className={styles.sectionTitle}>Campañas activas</h2>
          <p className={styles.sectionDesc}>
            Promociones y programas que impactan en captación, conversión y retención.
          </p>
        </div>
        {inactiveCount > 0 ? (
          <button
            type="button"
            className={styles.inactiveToggle}
            aria-expanded={showInactive}
            onClick={() => setShowInactive((current) => !current)}
          >
            {showInactive ? 'Ocultar inactivas' : `Mostrar inactivas (${inactiveCount})`}
          </button>
        ) : null}
      </div>

      <div className={styles.cardGrid}>
        {visibleCampaigns.length === 0 ? (
          <p className={styles.sectionDesc}>No hay campañas activas.</p>
        ) : null}
        {visibleCampaigns.map((campaign) => (
          <article key={campaign.id} className={styles.card}>
            <div className={styles.cardHead}>
              <h3 className={styles.cardTitle}>{campaign.nombre}</h3>
              <span className={`${styles.badge} ${campaignBadgeClass(campaign.estado)}`}>
                {campaignBadgeLabel(campaign.estado)}
              </span>
            </div>
            <p className={styles.cardText}>{campaign.descripcion}</p>
            {campaign.meta ? <p className={styles.cardMeta}>{campaign.meta}</p> : null}
            {campaign.enlace ? (
              <div className={styles.linkRow}>
                <Link href={campaign.enlace} className={styles.linkBtnSecondary} target="_blank">
                  Ver en la web
                </Link>
              </div>
            ) : null}
          </article>
        ))}
      </div>

      <div className={styles.sectionHead}>
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
              <th>Precio mensual</th>
              <th>Precio anual</th>
              <th>Referencia</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {visiblePlans.map((plan) => (
              <tr key={plan.id}>
                <td>{plan.nombre}</td>
                <td>{plan.tipo === 'lanzamiento' ? 'Lanzamiento' : 'Estándar'}</td>
                <td>{formatMoney(plan.precio)}</td>
                <td>{formatAnnualPriceCell(plan)}</td>
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

export default function AdminPlanMarketingPanel({ embedded = false } = {}) {
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
      if (!embedded) {
        const { session, user } = await getClientAuth();
        if (!session?.user || !user) {
          router.push('/login?next=/admin/plan-marketing');
          return;
        }

        const role = await getRoleNameByUserId(user.id, user.email);
        if (!(await mayEnterStaffModule(role, 'planMarketing'))) {
          router.push('/perfil');
          return;
        }
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
  }, [router, load, embedded]);

  const tabContent = useMemo(() => {
    if (!embedded && activeTab === 'calendario') return <MarketingCalendar />;
    if (!embedded && activeTab === 'proyectos') return <ProjectRoadmapMap />;
    if (!data) return null;
    return <PromotionsTab data={data} />;
  }, [activeTab, data, embedded]);

  if (loading) {
    return (
      <RouteLoadingMascot
        label={embedded ? 'Cargando promociones…' : 'Cargando plan de marketing…'}
        variant={5}
        width={120}
      />
    );
  }

  const tabBar = (
    <div
      className={styles.tabBar}
      role="tablist"
      aria-label={embedded ? 'Secciones de promociones' : 'Secciones del plan de marketing'}
    >
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
  );

  const body = (
    <>
      {embedded ? null : tabBar}
      {error ? (
        <p className={styles.error} role="alert">
          {error}
        </p>
      ) : null}
      {tabContent}
    </>
  );

  if (embedded) {
    return <div className={styles.embedded}>{body}</div>;
  }

  return (
    <div className={`admin-module ${styles.wrap}`}>
      <PanelPageHeader
        title="Plan de marketing"
        subtitle="Promociones, calendario de campañas y entregas de los proyectos."
        mascotVariant={5}
      />
      {body}
    </div>
  );
}
