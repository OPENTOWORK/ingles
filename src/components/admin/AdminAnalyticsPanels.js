'use client';

import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/utils/supabaseClient';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  BookOpen,
  Clock3,
  EyeOff,
  LogIn,
  Target,
  TrendingUp,
  CalendarDays,
  UserMinus,
  UserPlus,
  Users,
} from 'lucide-react';
import { formatSessionDuration } from '@/lib/userActivity';
import { isStudentRole } from '@/utils/authRoles';
import { useReadingNightMode } from '@/hooks/useReadingNightMode';
import styles from './AdminAnalyticsPanels.module.css';

const PERIOD_LABELS = {
  dias: 'Días',
  semanas: 'Semanas',
  meses: 'Meses',
  anios: 'Años',
};

const DAY_ORDER = ['lun', 'mar', 'mié', 'mie', 'jue', 'vie', 'sáb', 'sab', 'dom'];
const HOUR_BUCKETS = [
  { label: '0–3', start: 0, end: 3 },
  { label: '4–7', start: 4, end: 7 },
  { label: '8–11', start: 8, end: 11 },
  { label: '12–15', start: 12, end: 15 },
  { label: '16–19', start: 16, end: 19 },
  { label: '20–23', start: 20, end: 23 },
];

const CHART_COLORS = {
  primary: '#6366f1',
  secondary: '#0ea5e9',
  success: '#10b981',
  levels: ['#6366f1', '#8b5cf6', '#0ea5e9', '#14b8a6', '#f59e0b', '#f97316', '#ec4899'],
};

function normalizeDayKey(value = '') {
  return String(value)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\./g, '')
    .slice(0, 3);
}

function ChartTooltip({ active, payload, label, valueLabel }) {
  if (!active || !payload?.length) return null;
  return (
    <div className={styles.tooltipBox}>
      <p className={styles.tooltipLabel}>{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} className={styles.tooltipValue}>
          {entry.name}: {entry.value}
        </p>
      ))}
      {valueLabel ? <p className={styles.tooltipValue}>{valueLabel}</p> : null}
    </div>
  );
}

function PeriodFilters({
  period,
  setPeriod,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  onClear,
  roleFilter,
  setRoleFilter,
  roles = [],
  showRoleFilter = false,
  userIdFilter,
  setUserIdFilter,
  audienceFilter = 'all',
  setAudienceFilter,
  starredTeamCount = 0,
  onExecute,
  executing = false,
}) {
  const hasUserIdFilter = typeof setUserIdFilter === 'function';
  const hasAudienceFilter = typeof setAudienceFilter === 'function';

  return (
    <div className={styles.filterBar}>
      {hasAudienceFilter ? (
        <div className={styles.filterField}>
          <label htmlFor="analytics-audience">Audiencia</label>
          <select
            id="analytics-audience"
            value={audienceFilter}
            onChange={(event) => setAudienceFilter(event.target.value)}
          >
            <option value="all">Todos los usuarios</option>
            <option value="sin_staff">Sin staff (sin estrella)</option>
          </select>
          {audienceFilter === 'sin_staff' && starredTeamCount > 0 ? (
            <span className={styles.audienceHint}>
              Excluye {starredTeamCount} con estrella
            </span>
          ) : null}
        </div>
      ) : null}
      <div className={styles.filterField}>
        <label htmlFor="analytics-period">Periodo</label>
        <select id="analytics-period" value={period} onChange={(e) => setPeriod(e.target.value)}>
          {Object.entries(PERIOD_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>
      <div className={styles.filterField}>
        <label htmlFor="analytics-start">Fecha inicio</label>
        <input
          id="analytics-start"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
      </div>
      <div className={styles.filterField}>
        <label htmlFor="analytics-end">Fecha fin</label>
        <input
          id="analytics-end"
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
      </div>
      {showRoleFilter && typeof setRoleFilter === 'function' ? (
        <div className={styles.filterField}>
          <label htmlFor="analytics-role">Rol</label>
          <select
            id="analytics-role"
            value={roleFilter ?? 'all'}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="all">Todos los roles</option>
            {roles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.nombre}
              </option>
            ))}
          </select>
        </div>
      ) : null}
      {hasUserIdFilter ? (
        <div className={styles.filterField}>
          <label htmlFor="analytics-user-id">ID de usuario</label>
          <input
            id="analytics-user-id"
            type="text"
            value={userIdFilter ?? ''}
            onChange={(e) => setUserIdFilter(e.target.value)}
            placeholder="Opcional"
            className="font-mono"
          />
        </div>
      ) : null}
      {onExecute ? (
        <div className={`${styles.filterField} ${styles.filterActions}`}>
          <button type="button" onClick={onExecute} disabled={executing} className={styles.btnPrimary}>
            {executing ? 'Consultando…' : 'Aplicar filtros'}
          </button>
        </div>
      ) : null}
      {onClear ? (
        <div className={`${styles.filterField} ${styles.filterActions}`}>
          <button type="button" onClick={onClear} className={styles.btnSecondary}>
            Limpiar fechas
          </button>
        </div>
      ) : null}
    </div>
  );
}

function KpiCard({ label, value, hint, icon: Icon, accent = '#6366f1', iconBg = '#eef2ff' }) {
  return (
    <article
      className={styles.kpiCard}
      style={{ '--kpi-accent': accent, '--kpi-icon-bg': iconBg }}
    >
      {Icon ? (
        <div className={styles.kpiIcon}>
          <Icon size={16} aria-hidden />
        </div>
      ) : null}
      <p className={styles.kpiLabel}>{label}</p>
      <p className={styles.kpiValue}>{value}</p>
      {hint ? <p className={styles.kpiHint}>{hint}</p> : null}
    </article>
  );
}

function ActivityHeatmap({ heatmap = [], horaPico = '-', diaPico = '-' }) {
  const { grid, max } = useMemo(() => {
    const matrix = {};
    let peak = 0;

    for (const item of heatmap) {
      const [dayRaw, hourRaw] = String(item.slot || '').split('-');
      const day = normalizeDayKey(dayRaw);
      const hour = Number(hourRaw);
      if (!day || Number.isNaN(hour)) continue;

      const bucket = HOUR_BUCKETS.find((b) => hour >= b.start && hour <= b.end);
      if (!bucket) continue;

      const key = `${day}|${bucket.label}`;
      matrix[key] = (matrix[key] || 0) + (item.total || 0);
      peak = Math.max(peak, matrix[key]);
    }

    const daysInData = [...new Set(Object.keys(matrix).map((k) => k.split('|')[0]))];
    const orderedDays = DAY_ORDER.filter((d) => daysInData.includes(d));
    const days = orderedDays.length ? orderedDays : DAY_ORDER.slice(0, 5);

    const cells = days.map((day) =>
      HOUR_BUCKETS.map((bucket) => {
        const total = matrix[`${day}|${bucket.label}`] || 0;
        const intensity = peak > 0 ? total / peak : 0;
        return { day, bucket: bucket.label, total, intensity };
      }),
    );

    return { grid: cells, max: peak };
  }, [heatmap]);

  const cellColor = (intensity) => {
    if (intensity <= 0) return '#f8fafc';
    const alpha = 0.18 + intensity * 0.72;
    return `rgba(99, 102, 241, ${alpha})`;
  };

  return (
    <div className={styles.heatmapWrap}>
      <div className={styles.peakRow}>
        <div className={styles.peakChip}>
          <p className={styles.peakChipLabel}>Hora pico</p>
          <p className={styles.peakChipValue}>{horaPico}</p>
        </div>
        <div className={styles.peakChip}>
          <p className={styles.peakChipLabel}>Día pico</p>
          <p className={styles.peakChipValue}>{diaPico}</p>
        </div>
      </div>

      {max === 0 ? (
        <p className={styles.emptyState}>Sin actividad registrada en el rango seleccionado.</p>
      ) : (
        <>
          <div className={styles.heatmapGrid}>
            <div className={styles.heatmapCorner} />
            {HOUR_BUCKETS.map((bucket) => (
              <div key={bucket.label} className={styles.heatmapHourHead}>
                {bucket.label}h
              </div>
            ))}
            {grid.map((row) => (
              <div key={row[0]?.day} style={{ display: 'contents' }}>
                <div className={styles.heatmapDayLabel}>{row[0]?.day}</div>
                {row.map((cell) => (
                  <div
                    key={`${cell.day}-${cell.bucket}`}
                    className={styles.heatmapCell}
                    style={{ background: cellColor(cell.intensity) }}
                    title={`${cell.day} ${cell.bucket}h · ${cell.total} eventos`}
                  >
                    {cell.total > 0 ? cell.total : ''}
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div className={styles.heatmapLegend}>
            <span>Baja</span>
            <div className={styles.heatmapLegendBar} />
            <span>Alta</span>
          </div>
        </>
      )}
    </div>
  );
}

function LevelDistribution({ rows = [] }) {
  const max = Math.max(...rows.map((r) => r.total), 1);

  if (!rows.length) {
    return <p className={styles.emptyState}>Sin datos de niveles asignados.</p>;
  }

  return (
    <div className={styles.levelList}>
      {rows.map((row, index) => (
        <div key={row.nivel} className={styles.levelRow}>
          <span className={styles.levelName}>{row.nivel}</span>
          <div className={styles.levelBarTrack}>
            <div
              className={styles.levelBarFill}
              style={{
                width: `${(row.total / max) * 100}%`,
                background: CHART_COLORS.levels[index % CHART_COLORS.levels.length],
              }}
            />
          </div>
          <span className={styles.levelCount}>{row.total}</span>
        </div>
      ))}
    </div>
  );
}

function ConnectionUsersActivityPanel({
  users = [],
  onLoadUserPages,
  queryKey = '',
  emptyLabel = 'Sin usuarios con actividad en el rango.',
}) {
  const [expandedUserId, setExpandedUserId] = useState(null);
  const [pagesByUser, setPagesByUser] = useState({});
  const [loadingUserId, setLoadingUserId] = useState(null);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    setExpandedUserId(null);
    setPagesByUser({});
    setLoadError('');
  }, [queryKey]);

  const toggleUser = async (userId) => {
    if (expandedUserId === userId) {
      setExpandedUserId(null);
      setLoadError('');
      return;
    }

    setExpandedUserId(userId);
    setLoadError('');

    if (pagesByUser[userId]) return;
    if (typeof onLoadUserPages !== 'function') return;

    setLoadingUserId(userId);
    try {
      const pageViews = await onLoadUserPages(userId);
      setPagesByUser((prev) => ({ ...prev, [userId]: pageViews }));
    } catch (err) {
      setLoadError(err?.message || 'Error al cargar las páginas.');
    } finally {
      setLoadingUserId(null);
    }
  };

  return (
    <div className={styles.userListCard}>
      <div className={styles.userListHeader}>
        <h3 className={styles.userListTitle}>Usuarios con actividad</h3>
        <p className={styles.userListHint}>
          Pulsa un usuario para ver las páginas visitadas en el periodo.
        </p>
      </div>
      <div className={styles.userListBody}>
        {users.length === 0 && <p className={styles.emptyState}>{emptyLabel}</p>}
        {users.map((user) => {
          const isExpanded = expandedUserId === user.userId;
          const pages = pagesByUser[user.userId];
          const isLoading = loadingUserId === user.userId;

          return (
            <div key={user.userId} className={styles.userRow}>
              <button type="button" onClick={() => toggleUser(user.userId)} className={styles.userRowBtn}>
                <div className={styles.userRowTop}>
                  <div>
                    <p className={styles.userName}>{user.name !== '—' ? user.name : user.email}</p>
                    <p className={styles.userMeta}>{user.email !== '—' ? user.email : user.userId}</p>
                  </div>
                  <div className={styles.userStats}>
                    <p className={styles.userTime}>{user.totalLabel}</p>
                    <p className={styles.userSessions}>{user.sessionCount} sesión(es)</p>
                  </div>
                </div>
                {user.timeSlots?.length > 0 ? (
                  <p className={styles.userSlots}>
                    Franjas:{' '}
                    {user.timeSlots
                      .slice(0, 5)
                      .map((slot) => `${slot.slot} (${slot.count})`)
                      .join(' · ')}
                    {user.timeSlots.length > 5 ? '…' : ''}
                  </p>
                ) : null}
              </button>

              {isExpanded ? (
                <div className={styles.userPages}>
                  {isLoading ? (
                    <p className={styles.pageMeta}>Cargando páginas…</p>
                  ) : loadError && expandedUserId === user.userId ? (
                    <p className={styles.pageMeta} style={{ color: '#dc2626' }}>
                      {loadError}
                    </p>
                  ) : pages?.length === 0 ? (
                    <p className={styles.pageMeta}>Sin páginas registradas en el rango.</p>
                  ) : (
                    (pages || []).map((page) => (
                      <div key={page.id} className={styles.pageItem}>
                        <p className={styles.pageTitle}>{page.pageTitle}</p>
                        <p className={styles.pagePath}>{page.path}</p>
                        <p className={styles.pageMeta}>
                          {page.visitedLabel}
                          {page.durationLabel ? ` · ${page.durationLabel}` : ''}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StudyFocusBar({ studySeconds, browsingSeconds, unattributedSeconds }) {
  const total = studySeconds + browsingSeconds + unattributedSeconds;
  if (total <= 0) return null;

  const pct = (value) => `${(value / total) * 100}%`;

  return (
    <div
      className={styles.focusBar}
      role="img"
      aria-label={`Estudio ${Math.round((studySeconds / total) * 100)}%, navegación ${Math.round(
        (browsingSeconds / total) * 100,
      )}%, sin actividad ${Math.round((unattributedSeconds / total) * 100)}%`}
    >
      <span
        className={`${styles.focusSegment} ${styles.focusStudy}`}
        style={{ width: pct(studySeconds) }}
      />
      <span
        className={`${styles.focusSegment} ${styles.focusBrowsing}`}
        style={{ width: pct(browsingSeconds) }}
      />
      <span
        className={`${styles.focusSegment} ${styles.focusIdle}`}
        style={{ width: pct(unattributedSeconds) }}
      />
    </div>
  );
}

function formatMonitoredDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function StudyTrackingPanel({ tracking, loading, navigationReady }) {
  const summary = tracking?.summary;
  const users = tracking?.users || [];
  const monitored = tracking?.monitoredSessions || [];

  if (loading && !summary) {
    return <p className={styles.emptyState}>Cargando seguimiento de estudio…</p>;
  }

  if (navigationReady === false) {
    return (
      <p className={styles.emptyState}>
        La tabla <code>usuario_navegacion</code> todavía no está disponible. El seguimiento se
        activará en cuanto se registre navegación.
      </p>
    );
  }

  if (!summary) {
    return <p className={styles.emptyState}>Sin datos de seguimiento en el rango.</p>;
  }

  return (
    <>
      <div className={styles.kpiGrid}>
        <KpiCard
          icon={BookOpen}
          label="Tiempo de estudio"
          value={summary.studyLabel}
          hint="En ejercicios, teoría y speaking"
          accent="#6366f1"
          iconBg="#eef2ff"
        />
        <KpiCard
          icon={Target}
          label="Ratio de foco"
          value={`${summary.focusRatio}%`}
          hint="Estudio sobre tiempo conectado"
          accent="#10b981"
          iconBg="#ecfdf5"
        />
        <KpiCard
          icon={Users}
          label="Alumnos estudiando"
          value={summary.studentsWithStudy.toLocaleString('es-ES')}
          hint={`${summary.trackedUsers} con actividad registrada`}
          accent="#0ea5e9"
          iconBg="#f0f9ff"
        />
        <KpiCard
          icon={EyeOff}
          label="Sin actividad"
          value={summary.unattributedLabel}
          hint="Conectado sin página activa"
          accent="#f59e0b"
          iconBg="#fffbeb"
        />
      </div>

      <div className={styles.legendRow}>
        <span className={styles.legendItem}>
          <span className={`${styles.legendDot} ${styles.focusStudy}`} /> Estudio
        </span>
        <span className={styles.legendItem}>
          <span className={`${styles.legendDot} ${styles.focusBrowsing}`} /> Navegación en Dralo
        </span>
        <span className={styles.legendItem}>
          <span className={`${styles.legendDot} ${styles.focusIdle}`} /> Sin actividad / fuera de
          pestaña
        </span>
      </div>

      {users.length === 0 ? (
        <p className={styles.emptyState}>Sin alumnos con actividad en el rango seleccionado.</p>
      ) : (
        <div className={styles.trackingList}>
          {users.map((row) => (
            <article key={row.userId} className={styles.trackingRow}>
              <div className={styles.trackingHead}>
                <div className={styles.trackingIdentity}>
                  <p className={styles.trackingName}>{row.name}</p>
                  <p className={styles.trackingEmail}>{row.email}</p>
                </div>
                <div className={styles.trackingScore}>
                  <p className={styles.trackingScoreValue}>{row.focusRatio}%</p>
                  <p className={styles.trackingScoreLabel}>foco</p>
                </div>
              </div>

              <StudyFocusBar
                studySeconds={row.studySeconds}
                browsingSeconds={row.browsingSeconds}
                unattributedSeconds={row.unattributedSeconds}
              />

              <div className={styles.trackingMeta}>
                <span>
                  Estudio <strong>{row.studyLabel}</strong>
                </span>
                <span>
                  Navegación <strong>{row.browsingLabel}</strong>
                </span>
                <span>
                  Sin actividad <strong>{row.unattributedLabel}</strong>
                </span>
                <span>
                  Sesiones <strong>{row.sessionCount}</strong>
                </span>
              </div>

              {row.topAreas?.length ? (
                <div className={styles.trackingAreas}>
                  {row.topAreas.map((area) => (
                    <span
                      key={area.area}
                      className={`${styles.areaChip} ${area.isStudy ? styles.areaChipStudy : ''}`}
                    >
                      {area.area} · {area.label}
                    </span>
                  ))}
                </div>
              ) : null}
            </article>
          ))}
        </div>
      )}

      {monitored.length > 0 ? (
        <div className={styles.monitoredBlock}>
          <h3 className={styles.monitoredTitle}>Sesiones de estudio monitorizadas</h3>
          <p className={styles.monitoredIntro}>
            Sesiones que el alumno inició y consintió de forma expresa, con el resumen generado al
            cerrarlas.
          </p>
          <div className={styles.trackingList}>
            {monitored.map((entry) => (
              <article key={entry.sessionId} className={styles.trackingRow}>
                <div className={styles.trackingHead}>
                  <div className={styles.trackingIdentity}>
                    <p className={styles.trackingName}>{entry.name}</p>
                    <p className={styles.trackingEmail}>{formatMonitoredDate(entry.startedAt)}</p>
                  </div>
                  <div className={styles.trackingScore}>
                    <p className={styles.trackingScoreValue}>{entry.focusRatio}%</p>
                    <p className={styles.trackingScoreLabel}>foco</p>
                  </div>
                </div>

                <div className={styles.trackingMeta}>
                  <span>
                    Concentrado <strong>{entry.focusLabel}</strong>
                  </span>
                  <span>
                    Salidas <strong>{entry.awayCount}</strong>
                  </span>
                  <span>
                    Pausa m&aacute;s larga <strong>{entry.longestAwayLabel}</strong>
                  </span>
                  <span>
                    Total <strong>{entry.totalLabel}</strong>
                  </span>
                </div>

                {entry.resumen ? (
                  <p className={styles.monitoredSummary}>{entry.resumen}</p>
                ) : null}
              </article>
            ))}
          </div>
        </div>
      ) : null}
    </>
  );
}

export default function AdminAnalyticsPanels({
  period,
  setPeriod,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  analytics,
  chartPeriod,
  setChartPeriod,
  chartStartDate,
  setChartStartDate,
  chartEndDate,
  setChartEndDate,
  sessionChart,
  connectionAnalytics,
  connectionActiveUsers = [],
  connectionRoleFilter,
  setConnectionRoleFilter,
  connectionUserIdFilter,
  setConnectionUserIdFilter,
  appliedConnectionRoleFilter = 'all',
  appliedConnectionUserIdFilter = '',
  onRunConnectionQuery,
  onLoadConnectionUserPages,
  connectionQueryLoading = false,
  connectionQueryKey = '',
  roles = [],
  platformAnalyticsAudience = 'all',
  setPlatformAnalyticsAudience,
  starredTeamCount = 0,
  studyTracking = null,
  studyTrackingLoading = false,
  trackingStartDate = '',
  setTrackingStartDate,
  trackingEndDate = '',
  setTrackingEndDate,
  onRunStudyTrackingQuery,
  users = [],
}) {
  const [activeTab, setActiveTab] = useState('growth');
  const [visitStats, setVisitStats] = useState(null);
  const [entriesWithoutStaff, setEntriesWithoutStaff] = useState(true);
  const isNight = useReadingNightMode();
  const chartGrid = isNight ? '#334155' : '#e2e8f0';
  const chartTick = { fontSize: 11, fill: isNight ? '#94a3b8' : '#64748b' };

  const totalIncorporaciones = analytics.incorporaciones.reduce((acc, row) => acc + row.total, 0);
  const selectedConnectionRole =
    appliedConnectionRoleFilter && appliedConnectionRoleFilter !== 'all'
      ? roles.find((role) => String(role.id) === String(appliedConnectionRoleFilter))?.nombre
      : null;
  const selectedConnectionUserId = appliedConnectionUserIdFilter?.trim() || '';
  const excludeStaff = platformAnalyticsAudience === 'sin_staff';

  const sortedLevels = [...(analytics.usuariosPorNivel || [])].sort((a, b) => b.total - a.total);

  const registrationReport = useMemo(() => {
    const roleById = new Map(roles.map((role) => [String(role.id), role.nombre || '']));
    const rows = users
      .filter((item) => {
        const roleName = roleById.get(String(item.rol_id)) || '';
        return !roleName || isStudentRole(roleName);
      })
      .map((item) => {
        const created = item.creado_en ? new Date(item.creado_en) : null;
        return {
          id: item.id,
          nombre: item.nombre?.trim() || 'Sin nombre',
          email: item.email || '—',
          creadoEn: created && !Number.isNaN(created.getTime()) ? created : null,
        };
      })
      .sort((a, b) => (b.creadoEn?.getTime() || 0) - (a.creadoEn?.getTime() || 0));

    const firstDate = rows.reduce((earliest, row) => {
      if (!row.creadoEn) return earliest;
      if (!earliest || row.creadoEn < earliest) return row.creadoEn;
      return earliest;
    }, null);

    const byMonth = new Map();
    for (const row of rows) {
      if (!row.creadoEn) continue;
      const key = `${row.creadoEn.getFullYear()}-${String(row.creadoEn.getMonth() + 1).padStart(2, '0')}`;
      const bucket = byMonth.get(key) || { key, registrados: 0 };
      bucket.registrados += 1;
      byMonth.set(key, bucket);
    }
    const months = [...byMonth.values()]
      .sort((a, b) => a.key.localeCompare(b.key))
      .map((bucket) => ({
        ...bucket,
        label: new Date(`${bucket.key}-01T12:00:00`).toLocaleDateString('es-ES', {
          month: 'short',
          year: '2-digit',
        }),
      }));

    return {
      rows,
      total: rows.length,
      firstDate,
      months,
    };
  }, [users, roles]);

  useEffect(() => {
    if (activeTab !== 'entries') return undefined;
    let cancelled = false;

    (async () => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const token = sessionData?.session?.access_token;
        const res = await fetch('/api/admin/visitors/summary/', {
          credentials: 'include',
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const payload = await res.json().catch(() => ({}));
        if (!cancelled && res.ok) setVisitStats(payload);
      } catch {
        if (!cancelled) setVisitStats(null);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [activeTab]);

  return (
    <section className={styles.panel}>
      <header className={styles.panelHeader}>
        <div>
          <h2 className={styles.panelTitle}>Analíticas de la plataforma</h2>
          <p className={styles.panelSubtitle}>
            Visualiza incorporaciones, accesos y tiempo de conexión. Usa los filtros para acotar cada
            bloque al periodo que necesites.
          </p>
        </div>
        <div className={styles.tabList} role="tablist" aria-label="Secciones de analíticas">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'entries'}
            className={`${styles.tab} ${activeTab === 'entries' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('entries')}
          >
            Entradas
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'growth'}
            className={`${styles.tab} ${activeTab === 'growth' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('growth')}
          >
            Incorporaciones
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'engagement'}
            className={`${styles.tab} ${activeTab === 'engagement' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('engagement')}
          >
            Conexión
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'tracking'}
            className={`${styles.tab} ${activeTab === 'tracking' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('tracking')}
          >
            Seguimiento
          </button>
        </div>
      </header>

      <div className={styles.panelBody}>
        {activeTab === 'entries' ? (
          <>
            <div className={styles.entriesToolbar}>
              <p className={styles.sectionIntro}>
                Solo cuenta gente que entra sin ser usuaria. Si después crea cuenta, pasa a
                registrados. Quien ya tenía cuenta no entra en estas cifras.
                {entriesWithoutStaff
                  ? ' El equipo tampoco.'
                  : ' Con staff incluye las visitas del equipo.'}
                {visitStats?.since
                  ? ` Contando desde el ${new Date(visitStats.since).toLocaleString('es-ES', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}.`
                  : ' Todavía no hay ninguna visita guardada.'}
              </p>
              <div className={styles.tabList} role="group" aria-label="Incluir al equipo">
                <button
                  type="button"
                  className={`${styles.tab} ${entriesWithoutStaff ? styles.tabActive : ''}`}
                  aria-pressed={entriesWithoutStaff}
                  onClick={() => setEntriesWithoutStaff(true)}
                >
                  Sin staff
                </button>
                <button
                  type="button"
                  className={`${styles.tab} ${entriesWithoutStaff ? '' : styles.tabActive}`}
                  aria-pressed={!entriesWithoutStaff}
                  onClick={() => setEntriesWithoutStaff(false)}
                >
                  Con staff
                </button>
              </div>
            </div>

            <div className={styles.kpiGrid}>
              <KpiCard
                icon={Users}
                label="Entraron"
                value={
                  visitStats
                    ? (
                        visitStats.entered + (entriesWithoutStaff ? 0 : visitStats.staff || 0)
                      ).toLocaleString('es-ES')
                    : '…'
                }
                hint={
                  entriesWithoutStaff
                    ? `Personas que no eran usuarias${visitStats?.staff ? ` (${visitStats.staff} del equipo fuera)` : ''}`
                    : 'Personas que no eran usuarias, más el equipo'
                }
                accent="#6366f1"
                iconBg="#eef2ff"
              />
              <KpiCard
                icon={UserPlus}
                label="Se registraron"
                value={visitStats ? visitStats.registered.toLocaleString('es-ES') : '…'}
                hint="De esas entradas, crearon cuenta"
                accent="#10b981"
                iconBg="#ecfdf5"
              />
              <KpiCard
                icon={UserMinus}
                label="Sin registrarse"
                value={visitStats ? visitStats.unregistered.toLocaleString('es-ES') : '…'}
                hint="Entraron y siguieron sin cuenta"
                accent="#f59e0b"
                iconBg="#fffbeb"
              />
            </div>

            <div className={styles.chartCard}>
              <h3 className={styles.chartCardTitle}>Registro de entradas</h3>
              {(() => {
                const rows = (visitStats?.ipLog || []).filter(
                  (row) => !entriesWithoutStaff || row.kind !== 'staff',
                );
                if (!visitStats) return <p className={styles.emptyState}>Cargando…</p>;
                if (!rows.length) {
                  return <p className={styles.emptyState}>Todavía no hay visitas guardadas.</p>;
                }
                const kindLabel = {
                  anon: 'Sin cuenta',
                  account: 'Cuenta nueva',
                  returning: 'Ya tenía cuenta',
                  staff: 'Equipo',
                };
                return (
                  <div className={styles.registrationTableWrap}>
                      <table className={styles.registrationTable}>
                        <thead>
                          <tr>
                            <th>IP</th>
                            <th>Fecha</th>
                            <th>Origen</th>
                            <th>Llegan a</th>
                            <th>Tiempo</th>
                            <th>Cuenta</th>
                            <th>Estado</th>
                          </tr>
                        </thead>
                        <tbody>
                          {rows.map((row, index) => (
                            <tr key={`${row.seenAt}-${index}`}>
                              <td>{row.ip || 'No guardada'}</td>
                              <td>
                                {row.seenAt
                                  ? new Date(row.seenAt).toLocaleString('es-ES', {
                                      day: '2-digit',
                                      month: 'short',
                                      year: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })
                                  : '—'}
                              </td>
                              <td>{row.source || '—'}</td>
                              <td>{row.landing || '—'}</td>
                              <td>{row.seconds > 0 ? formatSessionDuration(row.seconds) : '—'}</td>
                              <td>{row.email || '—'}</td>
                              <td>{kindLabel[row.kind] || 'Sin cuenta'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                );
              })()}
            </div>

            <div className={styles.chartCard}>
              <h3 className={styles.chartCardTitle}>
                Cuentas creadas desde el inicio
                {registrationReport.firstDate
                  ? ` (${registrationReport.firstDate.toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })})`
                  : ''}
              </h3>
              {registrationReport.months.length === 0 ? (
                <p className={styles.emptyState}>Sin cuentas en este corte.</p>
              ) : (
                <div className={styles.chartBox}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={registrationReport.months}
                      margin={{ top: 8, right: 8, left: -12, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke={chartGrid} vertical={false} />
                      <XAxis dataKey="label" tick={chartTick} />
                      <YAxis allowDecimals={false} tick={chartTick} />
                      <Tooltip
                        content={({ active, payload, label }) => (
                          <ChartTooltip active={active} payload={payload} label={label} />
                        )}
                      />
                      <Bar dataKey="registrados" name="Se registraron" fill="#10b981" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {registrationReport.rows.length === 0 ? (
              <p className={styles.emptyState}>Nadie en este corte.</p>
            ) : (
              <div className={styles.registrationTableWrap}>
                <table className={styles.registrationTable}>
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>Correo</th>
                      <th>Fecha</th>
                    </tr>
                  </thead>
                  <tbody>
                    {registrationReport.rows.map((row) => (
                      <tr key={row.id}>
                        <td>{row.nombre}</td>
                        <td>{row.email}</td>
                        <td>
                          {row.creadoEn
                            ? row.creadoEn.toLocaleDateString('es-ES', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                              })
                            : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        ) : null}

        {activeTab === 'growth' ? (
          <>
            <p className={styles.sectionIntro}>
              Altas de usuario, abandonos y patrones de inicio de sesión en el rango seleccionado.
              {excludeStaff ? ' Los usuarios del equipo con estrella no se incluyen.' : ''}
            </p>
            <PeriodFilters
              period={period}
              setPeriod={setPeriod}
              startDate={startDate}
              setStartDate={setStartDate}
              endDate={endDate}
              setEndDate={setEndDate}
              audienceFilter={platformAnalyticsAudience}
              setAudienceFilter={setPlatformAnalyticsAudience}
              starredTeamCount={starredTeamCount}
            />

            <div className={styles.kpiGrid}>
              <KpiCard
                icon={UserPlus}
                label="Incorporaciones"
                value={totalIncorporaciones.toLocaleString('es-ES')}
                hint="Nuevos registros en el periodo"
                accent="#6366f1"
                iconBg="#eef2ff"
              />
              <KpiCard
                icon={CalendarDays}
                label="Media por día"
                value={(Number(analytics.mediaPorDia) || 0).toLocaleString('es-ES', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
                hint="Altas de media cada día del periodo"
                accent="#8b5cf6"
                iconBg="#f5f3ff"
              />
              <KpiCard
                icon={UserMinus}
                label="Abandonos"
                value={analytics.abandonos.toLocaleString('es-ES')}
                hint="Sesiones abandonadas + cuentas inactivas"
                accent="#f59e0b"
                iconBg="#fffbeb"
              />
              <KpiCard
                icon={LogIn}
                label="Éxito en accesos"
                value={`${analytics.patrones.tasaExito}%`}
                hint="Inicios de sesión correctos"
                accent="#10b981"
                iconBg="#ecfdf5"
              />
            </div>

            <div className={styles.chartGrid}>
              <div className={styles.chartCard}>
                <h3 className={styles.chartCardTitle}>Evolución de incorporaciones</h3>
                {analytics.incorporaciones.length === 0 ? (
                  <p className={styles.emptyState}>Sin datos en el rango seleccionado.</p>
                ) : (
                  <div className={styles.chartBox}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={analytics.incorporaciones}
                        margin={{ top: 8, right: 8, left: -12, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke={chartGrid} vertical={false} />
                        <XAxis dataKey="bucket" tick={chartTick} />
                        <YAxis allowDecimals={false} tick={chartTick} />
                        <Tooltip
                          content={({ active, payload, label }) => (
                            <ChartTooltip
                              active={active}
                              payload={payload}
                              label={`Periodo: ${label}`}
                            />
                          )}
                        />
                        <Bar dataKey="total" name="Incorporaciones" radius={[6, 6, 0, 0]}>
                          {analytics.incorporaciones.map((_, index) => (
                            <Cell
                              key={`inc-${index}`}
                              fill={CHART_COLORS.levels[index % CHART_COLORS.levels.length]}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

              <div className={styles.sideCard}>
                <h3 className={styles.sideCardTitle}>Mapa de actividad</h3>
                <ActivityHeatmap
                  heatmap={analytics.heatmap}
                  horaPico={analytics.patrones.horaPico}
                  diaPico={analytics.patrones.diaPico}
                />
              </div>
            </div>

            <div className={styles.chartCard}>
              <h3 className={styles.chartCardTitle}>Usuarios por nivel (placement)</h3>
              <LevelDistribution rows={sortedLevels} />
            </div>
          </>
        ) : activeTab === 'engagement' ? (
          <>
            <p className={styles.sectionIntro}>
              Sesiones en la app: usuarios activos por intervalo y tiempo medio por usuario con
              actividad.
              {excludeStaff ? ' Los usuarios del equipo con estrella no se incluyen.' : ''}
            </p>

            {(excludeStaff || selectedConnectionRole || selectedConnectionUserId) && (
              <div className={styles.activeFilters}>
                {excludeStaff ? (
                  <span className={styles.filterChip}>Sin staff</span>
                ) : null}
                {selectedConnectionRole ? (
                  <span className={styles.filterChip}>Rol: {selectedConnectionRole}</span>
                ) : null}
                {selectedConnectionUserId ? (
                  <span className={styles.filterChip}>Usuario: {selectedConnectionUserId}</span>
                ) : null}
              </div>
            )}

            <PeriodFilters
              period={chartPeriod}
              setPeriod={setChartPeriod}
              startDate={chartStartDate}
              setStartDate={setChartStartDate}
              endDate={chartEndDate}
              setEndDate={setChartEndDate}
              roleFilter={connectionRoleFilter}
              setRoleFilter={setConnectionRoleFilter}
              userIdFilter={connectionUserIdFilter}
              setUserIdFilter={setConnectionUserIdFilter}
              roles={roles}
              showRoleFilter
              audienceFilter={platformAnalyticsAudience}
              setAudienceFilter={setPlatformAnalyticsAudience}
              starredTeamCount={starredTeamCount}
              onExecute={onRunConnectionQuery}
              executing={connectionQueryLoading}
              onClear={() => {
                setChartStartDate('');
                setChartEndDate('');
              }}
            />

            <div className={styles.kpiGrid}>
              <KpiCard
                icon={Clock3}
                label="Tiempo total"
                value={connectionAnalytics.totalSessionLabel}
                hint="Suma de sesiones en el rango"
                accent="#0ea5e9"
                iconBg="#f0f9ff"
              />
              <KpiCard
                icon={Users}
                label="Usuarios activos"
                value={connectionAnalytics.activeUsers.toLocaleString('es-ES')}
                hint="Con al menos una sesión"
                accent="#6366f1"
                iconBg="#eef2ff"
              />
              <KpiCard
                icon={TrendingUp}
                label="Tiempo medio"
                value={connectionAnalytics.avgPerUserLabel}
                hint="Por usuario con actividad"
                accent="#10b981"
                iconBg="#ecfdf5"
              />
            </div>

            <div className={styles.chartGrid}>
              <div className={styles.chartCard}>
                <h3 className={styles.chartCardTitle}>Usuarios activos y tiempo medio de sesión</h3>
                {sessionChart.length === 0 ? (
                  <p className={styles.emptyState}>
                    Sin datos de sesión en el rango. Los usuarios generan actividad al navegar con la
                    sesión iniciada.
                  </p>
                ) : (
                  <div className={styles.chartBox}>
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={sessionChart} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={chartGrid} vertical={false} />
                        <XAxis dataKey="bucket" tick={chartTick} />
                        <YAxis yAxisId="users" allowDecimals={false} tick={chartTick} />
                        <YAxis
                          yAxisId="time"
                          orientation="right"
                          tick={chartTick}
                          tickFormatter={(v) => formatSessionDuration(v)}
                        />
                        <Tooltip
                          formatter={(value, name) => {
                            if (name === 'Tiempo medio / usuario') {
                              return [formatSessionDuration(value), name];
                            }
                            return [value, name];
                          }}
                          labelFormatter={(label) => `Periodo: ${label}`}
                          contentStyle={{
                            borderRadius: '0.5rem',
                            border: 'none',
                            background: '#0f172a',
                            color: '#f8fafc',
                          }}
                        />
                        <Legend wrapperStyle={{ fontSize: '0.75rem' }} />
                        <Bar
                          yAxisId="users"
                          dataKey="userCount"
                          name="Usuarios activos"
                          fill={CHART_COLORS.secondary}
                          radius={[6, 6, 0, 0]}
                        />
                        <Line
                          yAxisId="time"
                          type="monotone"
                          dataKey="avgSessionSeconds"
                          name="Tiempo medio / usuario"
                          stroke={CHART_COLORS.success}
                          strokeWidth={2.5}
                          dot={{ r: 3, fill: CHART_COLORS.success }}
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

              <ConnectionUsersActivityPanel
                users={connectionActiveUsers}
                onLoadUserPages={onLoadConnectionUserPages}
                queryKey={connectionQueryKey}
              />
            </div>

            <p className={styles.footnote}>
              Sesiones registradas en el rango: {connectionAnalytics.sessionCount.toLocaleString('es-ES')}
              {' · '}
              Los datos de conexión se actualizan automáticamente cada 45 segundos.
            </p>
          </>
        ) : (
          <>
            <p className={styles.sectionIntro}>
              Reparto del tiempo conectado de cada alumno entre estudio real (ejercicios, teoría,
              speaking), navegación por la plataforma y tiempo sin actividad.
              {excludeStaff ? ' Los usuarios del equipo con estrella no se incluyen.' : ''}
            </p>

            <PeriodFilters
              period={period}
              setPeriod={setPeriod}
              startDate={trackingStartDate}
              setStartDate={setTrackingStartDate}
              endDate={trackingEndDate}
              setEndDate={setTrackingEndDate}
              audienceFilter={platformAnalyticsAudience}
              setAudienceFilter={setPlatformAnalyticsAudience}
              starredTeamCount={starredTeamCount}
              onExecute={onRunStudyTrackingQuery}
              executing={studyTrackingLoading}
              onClear={
                typeof setTrackingStartDate === 'function'
                  ? () => {
                      setTrackingStartDate('');
                      setTrackingEndDate('');
                    }
                  : undefined
              }
            />

            <StudyTrackingPanel
              tracking={studyTracking}
              loading={studyTrackingLoading}
              navigationReady={studyTracking?.navigationReady}
            />

            <p className={styles.footnote}>
              El navegador no permite ver a qué sitios externos va el alumno. &quot;Sin
              actividad&quot; es tiempo conectado sin página de Dralo en primer plano: pestaña en
              segundo plano, otra aplicación o inactividad.
            </p>
          </>
        )}
      </div>
    </section>
  );
}
