'use client';

import { useMemo, useState } from 'react';
import {
  MARKETING_CATEGORIES,
  daysUntil,
  formatEventDay,
  getMarketingEvents,
  getMarketingPromos,
  monthNames,
  promoIncludesKey,
  promoOnDay,
} from '@/lib/marketingCalendar';
import styles from './MarketingCalendar.module.css';

const WEEKDAY_LABELS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
const FILTERS = [
  { id: 'todas', label: 'Todas' },
  { id: 'comercial', label: 'Comercial' },
  { id: 'academia', label: 'Academia' },
  { id: 'proyecto', label: 'Proyectos' },
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

function dayKey(year, month, day) {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function shiftDayKey(year, month, day, delta) {
  const date = new Date(year, month - 1, day + delta);
  return dayKey(date.getFullYear(), date.getMonth() + 1, date.getDate());
}

const SHORT_MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

function formatPromoRange(promo) {
  const months = monthNames();
  const startMonth = months[promo.start.month - 1];
  const endMonth = months[promo.end.month - 1];
  if (promo.start.year === promo.end.year && promo.start.month === promo.end.month) {
    return `Del ${promo.start.day} al ${promo.end.day} de ${endMonth}`;
  }
  if (promo.start.year === promo.end.year) {
    return `Del ${promo.start.day} de ${startMonth} al ${promo.end.day} de ${endMonth}`;
  }
  return `Del ${promo.start.day} de ${startMonth} de ${promo.start.year} al ${promo.end.day} de ${endMonth} de ${promo.end.year}`;
}

function formatPromoListDay(promo) {
  const start = SHORT_MONTHS[promo.start.month - 1];
  const end = SHORT_MONTHS[promo.end.month - 1];
  if (promo.start.month === promo.end.month && promo.start.year === promo.end.year) {
    return `${promo.start.day}–${promo.end.day} ${start}`;
  }
  return `${promo.start.day} ${start} – ${promo.end.day} ${end}`;
}

function promoStatus(promo, today) {
  const untilStart = daysUntil(promo.start, today);
  const untilEnd = daysUntil(promo.end, today);
  if (untilStart > 0) return countdownLabel(untilStart);
  if (untilEnd < 0) return 'Cerrada';
  return 'En curso';
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
  const promos = useMemo(
    () => (filter === 'academia' || filter === 'proyecto' ? [] : getMarketingPromos(year)),
    [filter, year],
  );
  const todayKey = dayKey(today.getFullYear(), today.getMonth() + 1, today.getDate());
  const activePromo = promos.find((promo) => promoIncludesKey(promo, todayKey)) || null;
  const byDay = useMemo(() => {
    const map = new Map();
    for (const event of visible) {
      const list = map.get(event.key) || [];
      list.push(event);
      map.set(event.key, list);
    }
    return map;
  }, [visible]);

  const todayProjects = visible.filter((event) => event.category === 'proyecto' && daysUntil(event, today) === 0);
  const selectedEvent = visible.find((event) => event.id === selectedId)
    || (!selectedId ? todayProjects[0] : null)
    || null;
  const selectedPromo = promos.find((promo) => promo.id === selectedId) || null;
  const nextEvent = visible.find((event) => daysUntil(event, today) >= 0) || null;
  const rows = [
    ...promos.map((promo) => ({ type: 'promo', sort: promo.startKey, promo })),
    ...visible.map((event) => ({ type: 'event', sort: event.key, event })),
  ].sort((a, b) => a.sort.localeCompare(b.sort) || (a.type === 'promo' ? -1 : 1));

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

      {todayProjects.map((event) => (
        <button
          key={event.id}
          type="button"
          className={styles.nextCard}
          onClick={() => setSelectedId(event.id)}
        >
          <span className={styles.dot} style={{ background: event.color }} aria-hidden />
          <span>
            <strong>{event.name}</strong>
            <span className={styles.nextMeta}>Hoy · {event.kind}</span>
          </span>
        </button>
      ))}

      {activePromo ? (
        <button
          type="button"
          className={`${styles.nextCard} ${styles.nextCardPromo}`}
          data-promo={activePromo.color}
          onClick={() => setSelectedId(activePromo.id)}
        >
          <span className={styles.dot} data-promo={activePromo.color} aria-hidden />
          <span>
            <strong>{activePromo.name}</strong>
            <span className={styles.nextMeta}>
              {formatPromoRange(activePromo)} · En curso
            </span>
          </span>
        </button>
      ) : nextEvent ? (
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
                    const key = dayKey(year, month, day);
                    const dayEvents = byDay.get(key) || [];
                    const promo = promoOnDay(promos, key);
                    const column = cellIndex % 7;
                    const joinLeft = Boolean(
                      promo && column > 0 && promoIncludesKey(promo, shiftDayKey(year, month, day, -1)),
                    );
                    const joinRight = Boolean(
                      promo && column < 6 && promoIncludesKey(promo, shiftDayKey(year, month, day, 1)),
                    );
                    const active = dayEvents.some((event) => event.id === selectedEvent?.id);
                    const names = [
                      promo?.name,
                      ...dayEvents.map((event) => event.name),
                    ].filter(Boolean);
                    const label = names.length ? `${day} de ${name}, ${names.join(', ')}` : `${day} de ${name}`;
                    const lead = dayEvents.find((event) => event.category === 'proyecto') || dayEvents[0];
                    const openId = lead?.id || promo?.id || null;
                    const marks = [
                      ...dayEvents.filter((event) => event.category === 'proyecto'),
                      ...dayEvents.filter((event) => event.category !== 'proyecto'),
                    ].slice(0, 3);
                    return (
                      <button
                        key={key}
                        type="button"
                        className={`${styles.day} ${dayEvents.length ? styles.dayMark : ''} ${promo ? styles.dayPromo : ''} ${joinLeft ? styles.dayPromoJoinLeft : ''} ${joinRight ? styles.dayPromoJoinRight : ''} ${active ? styles.dayOn : ''} ${isToday(year, month, day, today) ? styles.dayToday : ''}`}
                        data-promo={promo?.color}
                        disabled={!openId}
                        aria-label={label}
                        aria-pressed={active}
                        onClick={() => openId && setSelectedId(openId)}
                      >
                        {day}
                        {marks.length ? (
                          <span className={styles.marks} aria-hidden>
                            {marks.map((event) => {
                              const eventPromo = event.category === 'proyecto'
                                ? null
                                : promos.find((item) => item.id === event.promoId);
                              return (
                                <span
                                  key={event.id}
                                  className={`${styles.dot} ${event.color || eventPromo ? '' : styles[`dot_${event.category}`]}`}
                                  style={event.color ? { background: event.color } : undefined}
                                  data-promo={eventPromo?.color}
                                />
                              );
                            })}
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
          {selectedPromo ? (
            <article className={styles.detail}>
              <p className={styles.kicker} data-promo={selectedPromo.color}>
                {selectedPromo.published ? 'Promo' : 'Sin publicar'}
              </p>
              <h2 className={styles.detailTitle}>{selectedPromo.name}</h2>
              <p className={styles.detailDate}>{formatPromoRange(selectedPromo)}</p>
              <p className={styles.detailNote}>{selectedPromo.note}</p>
            </article>
          ) : selectedEvent ? (
            <article className={styles.detail}>
              <p
                className={`${styles.kicker} ${styles[`kicker_${selectedEvent.category}`] || ''}`}
                style={selectedEvent.color ? { color: selectedEvent.color } : undefined}
              >
                {selectedEvent.category === 'proyecto'
                  ? `Proyecto · ${selectedEvent.kind}`
                  : MARKETING_CATEGORIES[selectedEvent.category].label}
              </p>
              <h2 className={styles.detailTitle}>{selectedEvent.name}</h2>
              <p className={styles.detailDate}>
                {selectedEvent.weekday.charAt(0).toUpperCase() + selectedEvent.weekday.slice(1)} {selectedEvent.day} de {selectedEvent.monthLabel}
              </p>
              <p className={styles.detailNote}>{selectedEvent.note}</p>
            </article>
          ) : (
            <p className={styles.empty}>No hay fechas en este filtro.</p>
          )}

          <ol className={styles.list}>
            {rows.map((row) => {
              if (row.type === 'promo') {
                const { promo } = row;
                const active = promo.id === selectedPromo?.id;
                return (
                  <li key={promo.id}>
                    <button
                      type="button"
                      className={`${styles.listBtn} ${styles.listBtnPromo} ${active ? styles.listBtnOnPromo : ''}`}
                      data-promo={promo.color}
                      onClick={() => setSelectedId(promo.id)}
                    >
                      <span className={styles.listDay}>{formatPromoListDay(promo)}</span>
                      <span className={styles.listBody}>
                        <span className={styles.listName}>{promo.name}</span>
                        <span className={styles.listMeta}>
                          {promo.published ? promoStatus(promo, today) : 'Sin publicar'}
                        </span>
                      </span>
                      <span className={styles.dot} data-promo={promo.color} aria-hidden />
                    </button>
                  </li>
                );
              }
              const { event } = row;
              const days = daysUntil(event, today);
              const active = event.id === selectedEvent?.id;
              const eventPromo = promos.find((promo) => promo.id === event.promoId) || null;
              return (
                <li key={event.id}>
                  <button
                    type="button"
                    className={`${styles.listBtn} ${active ? styles.listBtnOn : ''}`}
                    onClick={() => setSelectedId(event.id)}
                  >
                    <span className={styles.listDay} style={event.color ? { color: event.color } : undefined}>{formatEventDay(event)}</span>
                    <span className={styles.listBody}>
                      <span className={styles.listName}>{event.name}</span>
                      <span className={styles.listMeta}>
                        {event.category === 'proyecto' ? `${countdownLabel(days)} · ${event.kind}` : countdownLabel(days)}
                      </span>
                    </span>
                    <span
                      className={`${styles.dot} ${event.color || eventPromo ? '' : styles[`dot_${event.category}`]}`}
                      style={event.color ? { background: event.color } : undefined}
                      data-promo={eventPromo?.color}
                      aria-hidden
                    />
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
