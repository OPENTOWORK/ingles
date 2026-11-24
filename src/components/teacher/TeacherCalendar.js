'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabaseClient';
import { getRoleNameByUserId } from '@/utils/authRoles';
import { mayEnterStaffModule } from '@/lib/staffModuleGate';
import RouteLoadingMascot from '@/components/RouteLoadingMascot';
import styles from './TeacherCalendar.module.css';

const WEEKDAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

function dateKeyFromValue(value) {
  if (!value) return '';
  const text = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;
  const date = new Date(text);
  if (Number.isNaN(date.getTime())) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function keyFor(year, monthIndex, day) {
  return `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function monthCells(year, monthIndex) {
  const first = new Date(year, monthIndex, 1);
  const lead = (first.getDay() + 6) % 7;
  const count = new Date(year, monthIndex + 1, 0).getDate();
  const cells = Array.from({ length: lead }, () => null);
  for (let day = 1; day <= count; day += 1) cells.push(day);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

function studentLabel(task) {
  return task?.alumno?.nombre || task?.alumno?.email || 'Sin alumno';
}

async function teacherRequest(path, options = {}) {
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData?.session?.access_token;
  if (!token) return { error: 'Sesión no válida.' };
  const res = await fetch(path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });
  const payload = await res.json().catch(() => ({}));
  if (!res.ok) return { ...payload, error: payload?.error || 'Error en la petición.' };
  return payload;
}

export default function TeacherCalendar() {
  const router = useRouter();
  const today = useMemo(() => new Date(), []);
  const todayKey = keyFor(today.getFullYear(), today.getMonth(), today.getDate());
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [googleEvents, setGoogleEvents] = useState([]);
  const [googleLink, setGoogleLink] = useState({ connected: false, name: '', warning: '', tablesReady: true });
  const [linkUrl, setLinkUrl] = useState('');
  const [linking, setLinking] = useState(false);
  const [linkError, setLinkError] = useState('');
  const [year, setYear] = useState(today.getFullYear());
  const [monthIndex, setMonthIndex] = useState(today.getMonth());
  const [selectedKey, setSelectedKey] = useState(todayKey);

  const monthParam = `${year}-${String(monthIndex + 1).padStart(2, '0')}`;

  const loadGoogle = useCallback(async (month) => {
    const data = await teacherRequest(`/api/teacher/google-calendar?month=${month}`);
    if (data.error && !data.connected) {
      setGoogleLink((current) => ({ ...current, warning: data.error }));
      setGoogleEvents([]);
      return;
    }
    setGoogleLink({
      connected: Boolean(data.connected),
      name: data.name || '',
      warning: data.warning || '',
      tablesReady: data.tablesReady !== false,
    });
    setGoogleEvents(data.events || []);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error || !user) {
          router.push('/login');
          return;
        }
        const role = await getRoleNameByUserId(user.id, user.email);
        if (!(await mayEnterStaffModule(role, ['profesor', 'profesorAdmin']))) {
          router.push('/perfil');
          return;
        }
        const data = await teacherRequest('/api/teacher/tasks');
        if (!data.error) setTasks(data.tasks || []);
        await loadGoogle(monthParam);
      } catch (err) {
        console.error('[TeacherCalendar] init', err);
        if (String(err?.message || '').includes('Sesión')) router.push('/login');
      } finally {
        setLoading(false);
      }
    })();
  }, [router, loadGoogle, monthParam]);

  const datedTasks = useMemo(
    () => tasks
      .map((task) => ({
        id: `task-${task.id}`,
        title: task.titulo,
        date: dateKeyFromValue(task.fecha_limite),
        time: '',
        meta: studentLabel(task),
        source: 'task',
        estado: task.estado || '',
      }))
      .filter((task) => task.date),
    [tasks],
  );

  const items = useMemo(() => {
    const google = googleEvents.map((event) => ({
      ...event,
      meta: event.location || 'Google Calendar',
      source: 'google',
    }));
    return [...google, ...datedTasks].sort((a, b) => `${a.date}${a.time || '99'}${a.title}`.localeCompare(`${b.date}${b.time || '99'}${b.title}`));
  }, [googleEvents, datedTasks]);

  const byDay = useMemo(() => {
    const map = new Map();
    items.forEach((item) => {
      const list = map.get(item.date) || [];
      list.push(item);
      map.set(item.date, list);
    });
    return map;
  }, [items]);

  const cells = useMemo(() => monthCells(year, monthIndex), [year, monthIndex]);
  const monthName = new Date(year, monthIndex, 1).toLocaleDateString('es-ES', { month: 'long' });
  const monthTitle = `${monthName.charAt(0).toUpperCase()}${monthName.slice(1)} ${year}`;
  const selectedItems = byDay.get(selectedKey) || [];
  const selectedLabel = new Date(`${selectedKey}T12:00:00`).toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  const shiftMonth = (delta) => {
    const next = new Date(year, monthIndex + delta, 1);
    setYear(next.getFullYear());
    setMonthIndex(next.getMonth());
  };

  const connectCalendar = async (event) => {
    event.preventDefault();
    setLinkError('');
    setLinking(true);
    try {
      const data = await teacherRequest('/api/teacher/google-calendar', {
        method: 'PUT',
        body: JSON.stringify({ url: linkUrl }),
      });
      if (data.error) {
        setLinkError(data.error);
        return;
      }
      setLinkUrl('');
      await loadGoogle(monthParam);
    } finally {
      setLinking(false);
    }
  };

  const disconnectCalendar = async () => {
    setLinking(true);
    setLinkError('');
    try {
      const data = await teacherRequest('/api/teacher/google-calendar', { method: 'DELETE' });
      if (data.error) {
        setLinkError(data.error);
        return;
      }
      setGoogleEvents([]);
      setGoogleLink({ connected: false, name: '', warning: '', tablesReady: true });
    } finally {
      setLinking(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <RouteLoadingMascot label="Cargando calendario…" variant={4} width={120} />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.toolbar}>
        <div>
          <p className={styles.kicker}>Calendario</p>
          <h1 className={styles.title}>{monthTitle}</h1>
        </div>
        <div className={styles.nav}>
          <button type="button" className={styles.navBtn} onClick={() => shiftMonth(-1)} aria-label="Mes anterior">
            ‹
          </button>
          <button
            type="button"
            className={styles.todayBtn}
            onClick={() => {
              setYear(today.getFullYear());
              setMonthIndex(today.getMonth());
              setSelectedKey(todayKey);
            }}
          >
            Hoy
          </button>
          <button type="button" className={styles.navBtn} onClick={() => shiftMonth(1)} aria-label="Mes siguiente">
            ›
          </button>
        </div>
      </div>

      <div className={styles.layout}>
        <section className={styles.board} aria-label={monthTitle}>
          <div className={styles.weekdays}>
            {WEEKDAYS.map((label) => (
              <div key={label} className={styles.weekday}>{label}</div>
            ))}
          </div>
          <div className={styles.grid}>
            {cells.map((day, index) => {
              if (!day) return <div key={`empty-${index}`} className={styles.empty} />;
              const key = keyFor(year, monthIndex, day);
              const dayItems = byDay.get(key) || [];
              const selected = key === selectedKey;
              const isToday = key === todayKey;
              const visible = dayItems.slice(0, 3);
              const hidden = dayItems.length - visible.length;
              return (
                <button
                  key={key}
                  type="button"
                  className={[
                    styles.day,
                    selected ? styles.daySelected : '',
                    !selected && (index % 7 === 5 || index % 7 === 6) ? styles.dayOutside : '',
                  ].filter(Boolean).join(' ')}
                  aria-pressed={selected}
                  aria-label={`${day} de ${monthTitle}${dayItems.length ? `, ${dayItems.length} eventos` : ''}`}
                  onClick={() => setSelectedKey(key)}
                >
                  <span className={`${styles.dayNum}${isToday ? ` ${styles.dayNumToday}` : ''}`}>{day}</span>
                  {visible.length > 0 ? (
                    <span className={styles.chips}>
                      {visible.map((item) => (
                        <span
                          key={item.id}
                          className={`${styles.chip} ${item.source === 'google' ? styles.chipGoogle : styles.chipTask}`}
                        >
                          {item.time ? `${item.time} ` : ''}
                          {item.title}
                        </span>
                      ))}
                      {hidden > 0 ? <span className={styles.more}>+{hidden}</span> : null}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </section>

        <aside className={styles.side}>
          <section className={styles.sideCard}>
            <h2 className={styles.sideTitle}>Google Calendar</h2>
            {googleLink.connected ? (
              <>
                <p className={styles.status}>
                  <span className={styles.dot} aria-hidden />
                  {googleLink.name || 'Calendario enlazado'}
                </p>
                <p className={styles.sideText}>Las citas de este profesor aparecen en azul.</p>
                {googleLink.warning ? <p className={styles.warning}>{googleLink.warning}</p> : null}
                <div className={styles.actions}>
                  <button type="button" className={styles.quiet} onClick={disconnectCalendar} disabled={linking}>
                    Desenlazar
                  </button>
                  <a className={styles.quiet} href="https://calendar.google.com/calendar/r" target="_blank" rel="noreferrer">
                    Abrir Google Calendar
                  </a>
                </div>
              </>
            ) : (
              <>
                <p className={styles.sideText}>
                  Enlaza el calendario de este profesor. Cada cuenta guarda el suyo.
                </p>
                <form className={styles.form} onSubmit={connectCalendar}>
                  <input
                    type="url"
                    value={linkUrl}
                    onChange={(event) => setLinkUrl(event.target.value)}
                    placeholder="https://calendar.google.com/calendar/ical/…"
                    aria-label="Dirección secreta iCal de Google Calendar"
                    required
                  />
                  <button type="submit" className={styles.primary} disabled={linking}>
                    {linking ? 'Enlazando…' : 'Enlazar calendario'}
                  </button>
                </form>
                {linkError ? <p className={styles.warning}>{linkError}</p> : null}
                {!googleLink.tablesReady ? (
                  <p className={styles.warning}>Falta crear la tabla del enlace en Supabase.</p>
                ) : null}
                <details className={styles.help}>
                  <summary>Dónde está la dirección</summary>
                  <ol>
                    <li>Abre Google Calendar con la cuenta del profesor.</li>
                    <li>Ajustes del calendario que quieras enlazar.</li>
                    <li>Integrar calendario → Dirección secreta en formato iCal.</li>
                    <li>Cópiala y pégala aquí.</li>
                  </ol>
                </details>
              </>
            )}
          </section>

          <section className={styles.sideCard}>
            <h2 className={styles.sideTitle}>Agenda</h2>
            <p className={styles.agendaDate}>{selectedLabel}</p>
            <p className={styles.legend}>
              <span><i className={`${styles.swatch} ${styles.swatchTask}`} /> Tareas</span>
              <span><i className={`${styles.swatch} ${styles.swatchGoogle}`} /> Google</span>
            </p>
            {selectedItems.length === 0 ? (
              <p className={styles.emptyDay}>Nada en este día.</p>
            ) : (
              <ul className={styles.agenda}>
                {selectedItems.map((item) => (
                  <li key={item.id} className={styles.agendaItem}>
                    <span className={styles.when}>{item.time || (item.source === 'google' ? 'Día' : 'Límite')}</span>
                    <div>
                      <p className={styles.agendaTitle}>{item.title}</p>
                      <p className={styles.agendaMeta}>
                        {item.meta}
                        {item.estado ? ` · ${item.estado}` : ''}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}
