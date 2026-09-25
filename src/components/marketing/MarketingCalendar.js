'use client';

import { useMemo, useState } from 'react';
import {
  MARKETING_CATEGORIES,
  daysUntil,
  formatEventDay,
  getMarketingEvents,
  monthNames,
} from '@/lib/marketingCalendar';
import styles from './MarketingCalendar.module.css';

const WEEKDAY_LABELS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
const FILTERS = [
  { id: 'todas', label: 'Todas' },
  { id: 'comercial', label: 'Comercial' },
  { id: 'academia', label: 'Academia' },
];

function monthCells(year, month) {
  const first = new Date(year, month - 1, 1);
  const lead = (first.getDay() + 6) % 7;
  const count = new Date(year, month, 0).getDate();
  const cells = Array.from({ length: lead }, () => null);
  for (let day = 1; day <= count; day += 1) cells.push(day);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

function sameDay(event, year, month, day) {
  return event.year === year && event.month === month && event.day === day;
}

function isToday(year, month, day, today) {
  return today.getFullYear() === year && today.getMonth() + 1 === month && today.getDate() === day;
}

function countdownLabel(days) {
  if (days === 0) return 'Hoy';
  if (days === 1) return 'Mañana';
  if (days > 1) return `Dentro de ${days} días`;
  if (days === -1) return 'Ayer';
  return `Hace ${Math.abs(days)} días`;
}

export default function MarketingCalendar() {
  const today = useMemo(() => new Date(), []);
  const [year, setYear] = useState(today.getFullYear());
  const [filter, setFilter] = useState('todas');
  const [selectedId, setSelectedId] = useState(null);

  const events = useMemo(() => getMarketingEvents(year), [year]);
  const visible = events.filter((event) => filter === 'todas' || event.category === filter);
  const byDay = useMemo(() => {
    const map = new Map();
    for (const event of visible) {
      const list = map.get(event.key) || [];
      list.push(event);
      map.set(event.key, list);
    }
    return map;
  }, [visible]);

  const selected = visible.find((event) => event.id === selectedId) || visible[0] || null;
  const nextEvent = visible.find((event) => daysUntil(event, today) >= 0) || null;

  return (
    <div className={styles.wrap}>
      <div className={styles.toolbar}>
        <div className={styles.yearNav}>
          <button type="button" className={styles.yearBtn} onClick={() => setYear((value) => value - 1)} aria-label="Año anterior">
            ‹
          </button>
          <p className={styles.year}>{year}</p>
          <button type="button" className={styles.yearBtn} onClick={() => setYear((value) => value + 1)} aria-label="Año siguiente">
            ›
          </button>
          {year !== today.getFullYear() ? (
            <button type="button" className={styles.todayBtn} onClick={() => setYear(today.getFullYear())}>
              Este año
            </button>
          ) : null}
        </div>
        <div className={styles.filters} role="tablist" aria-label="Tipo de fecha">
          {FILTERS.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={filter === item.id}
              className={`${styles.filter} ${filter === item.id ? styles.filterOn : ''}`}
              onClick={() => setFilter(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {nextEvent ? (
        <button
          type="button"
          className={styles.nextCard}
          onClick={() => setSelectedId(nextEvent.id)}
        >
          <span className={`${styles.dot} ${styles[`dot_${nextEvent.category}`]}`} aria-hidden />
          <span>
            <strong>{nextEvent.name}</strong>
            <span className={styles.nextMeta}>
              {formatEventDay(nextEvent)} · {countdownLabel(daysUntil(nextEvent, today))}
            </span>
          </span>
        </button>
      ) : null}

      <div className={styles.layout}>
        <div className={styles.months} aria-label={`Calendario ${year}`}>
          {monthNames().map((name, index) => {
            const month = index + 1;
            return (
              <section key={name} className={styles.month} aria-label={name}>
                <h2 className={styles.monthTitle}>{name}</h2>
                <div className={styles.weekdays} aria-hidden>
                  {WEEKDAY_LABELS.map((label) => (
                    <span key={label}>{label}</span>
                  ))}
                </div>
                <div className={styles.days}>
                  {monthCells(year, month).map((day, cellIndex) => {
                    if (!day) return <span key={`e-${cellIndex}`} className={styles.empty} />;
                    const key = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    const dayEvents = byDay.get(key) || [];
                    const active = dayEvents.some((event) => event.id === selected?.id);
                    const label = dayEvents.length
                      ? `${day} de ${name}, ${dayEvents.map((event) => event.name).join(', ')}`
                      : `${day} de ${name}`;
                    return (
                      <button
                        key={key}
                        type="button"
                        className={`${styles.day} ${dayEvents.length ? styles.dayMark : ''} ${active ? styles.dayOn : ''} ${isToday(year, month, day, today) ? styles.dayToday : ''}`}
                        disabled={!dayEvents.length}
                        aria-label={label}
                        aria-pressed={active}
                        onClick={() => dayEvents[0] && setSelectedId(dayEvents[0].id)}
                      >
                        {day}
                        {dayEvents.length ? (
                          <span className={styles.marks} aria-hidden>
                            {dayEvents.slice(0, 2).map((event) => (
                              <span key={event.id} className={`${styles.dot} ${styles[`dot_${event.category}`]}`} />
                            ))}
                          </span>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>

        <aside className={styles.agenda} aria-label="Fechas del año">
          {selected ? (
            <article className={styles.detail}>
              <p className={`${styles.kicker} ${styles[`kicker_${selected.category}`]}`}>
                {MARKETING_CATEGORIES[selected.category].label}
              </p>
              <h2 className={styles.detailTitle}>{selected.name}</h2>
              <p className={styles.detailDate}>
                {selected.weekday.charAt(0).toUpperCase() + selected.weekday.slice(1)} {selected.day} de {selected.monthLabel}
              </p>
              <p className={styles.detailNote}>{selected.note}</p>
            </article>
          ) : (
            <p className={styles.empty}>No hay fechas en este filtro.</p>
          )}

          <ol className={styles.list}>
            {visible.map((event) => {
              const days = daysUntil(event, today);
              const active = event.id === selected?.id;
              return (
                <li key={event.id}>
                  <button
                    type="button"
                    className={`${styles.listBtn} ${active ? styles.listBtnOn : ''}`}
                    onClick={() => setSelectedId(event.id)}
                  >
                    <span className={styles.listDay}>{formatEventDay(event)}</span>
                    <span className={styles.listBody}>
                      <span className={styles.listName}>{event.name}</span>
                      <span className={styles.listMeta}>{countdownLabel(days)}</span>
                    </span>
                    <span className={`${styles.dot} ${styles[`dot_${event.category}`]}`} aria-hidden />
                  </button>
                </li>
              );
            })}
          </ol>
        </aside>
      </div>
    </div>
  );
}
