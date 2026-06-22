'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import ProfileCollapsibleSection from '@/components/perfil/ProfileCollapsibleSection';
import {
  computePlannerStats,
  createDefaultPlannerData,
  formatPlannerDate,
  getWeekDays,
  loadStudyPlanner,
  saveStudyPlanner,
  toDateKey,
} from '@/lib/studyPlannerStorage';
import styles from './ProfileStudyPlannerPanel.module.css';

const SKILLS = ['Reading', 'Writing', 'Listening', 'Speaking', 'Use of English', 'Theory'];
const PRIORITIES = ['high', 'medium', 'low'];

function uid(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

export default function ProfileStudyPlannerPanel({
  userId = null,
  lang = 'en',
  statsSummary = {},
}) {
  const en = lang === 'en';
  const [planner, setPlanner] = useState(() => createDefaultPlannerData(statsSummary.levelEstimate));
  const [ready, setReady] = useState(false);
  const [selectedDate, setSelectedDate] = useState(() => toDateKey(new Date()));
  const [newEvent, setNewEvent] = useState({ title: '', skill: 'Reading', durationMin: 30 });
  const [newGoal, setNewGoal] = useState({ title: '', description: '', deadline: '', priority: 'medium' });

  const labels = {
    intro:
      'Plan your week, track goals and habits. Saved on this device — sync across devices coming later.',
    plan: en ? 'Weekly plan' : 'Plan semanal',
    calendar: en ? 'Study calendar' : 'Calendario de estudio',
    goals: en ? 'My study goals' : 'Mis objetivos',
    habits: en ? 'Study habits' : 'Hábitos de estudio',
    progress: en ? 'Detailed progress' : 'Progreso detallado',
    dailyGoal: en ? 'Daily goal' : 'Objetivo diario',
    weeklyGoal: en ? 'Weekly goal' : 'Objetivo semanal',
    planned: en ? 'Planned this week' : 'Planificado esta semana',
    completed: en ? 'Completed' : 'Completado',
    min: en ? 'min' : 'min',
    addSession: en ? 'Add session' : 'Añadir sesión',
    sessionTitle: en ? 'Session title' : 'Título de la sesión',
    duration: en ? 'Duration' : 'Duración',
    save: en ? 'Save' : 'Guardar',
    noEvents: en ? 'No sessions this day. Add one below.' : 'No hay sesiones este día.',
    markDone: en ? 'Done' : 'Hecho',
    remove: en ? 'Remove' : 'Quitar',
    addGoal: en ? 'Add goal' : 'Añadir objetivo',
    goalTitle: en ? 'Goal title' : 'Título del objetivo',
    goalDesc: en ? 'Description (optional)' : 'Descripción (opcional)',
    deadline: en ? 'Deadline' : 'Fecha límite',
    priority: en ? 'Priority' : 'Prioridad',
    progress: en ? 'Progress' : 'Progreso',
    markToday: en ? 'Done today' : 'Hecho hoy',
    streak: en ? 'Streak' : 'Racha',
    days: en ? 'days' : 'días',
    avgGoals: en ? 'Average goal progress' : 'Progreso medio de objetivos',
    habitsToday: en ? 'Habits today' : 'Hábitos hoy',
    platformStreak: en ? 'Platform study streak' : 'Racha en la plataforma',
    platformMinutes: en ? 'Total study time (platform)' : 'Tiempo total (plataforma)',
    sessionsWeek: en ? 'Sessions this week' : 'Sesiones esta semana',
    quickLinks: en ? 'Quick links' : 'Accesos rápidos',
    tools: en ? 'Study timer & notes' : 'Temporizador y notas',
    practice: en ? 'Exam practice' : 'Práctica de examen',
    errors: en ? 'Error tracker' : 'Error tracker',
    weekOf: en ? 'Week of' : 'Semana del',
  };

  const persist = useCallback(
    (next) => {
      setPlanner(next);
      saveStudyPlanner(userId, next);
    },
    [userId],
  );

  useEffect(() => {
    const loaded = loadStudyPlanner(userId, { levelEstimate: statsSummary.levelEstimate || 'B2' });
    setPlanner(loaded);
    setReady(true);
  }, [userId, statsSummary.levelEstimate]);

  const weekDays = useMemo(() => getWeekDays(), []);
  const weekLabel = formatPlannerDate(toDateKey(weekDays[0]), en ? 'en' : 'es');

  const stats = useMemo(
    () =>
      computePlannerStats(planner, {
        externalStreak: statsSummary.studyStreak ?? 0,
        externalMinutes: statsSummary.totalStudyMinutes ?? 0,
      }),
    [planner, statsSummary.studyStreak, statsSummary.totalStudyMinutes],
  );

  const dayEvents = useMemo(
    () => (planner.events || []).filter((e) => e.date === selectedDate),
    [planner.events, selectedDate],
  );

  const eventsByDate = useMemo(() => {
    const map = {};
    for (const ev of planner.events || []) {
      map[ev.date] = (map[ev.date] || 0) + 1;
    }
    return map;
  }, [planner.events]);

  const updateGoals = (goalId, patch) => {
    persist({
      ...planner,
      goals: planner.goals.map((g) => (g.id === goalId ? { ...g, ...patch } : g)),
    });
  };

  const removeGoal = (goalId) => {
    persist({ ...planner, goals: planner.goals.filter((g) => g.id !== goalId) });
  };

  const addGoal = () => {
    const title = newGoal.title.trim();
    if (!title) return;
    persist({
      ...planner,
      goals: [
        ...planner.goals,
        {
          id: uid('goal'),
          title,
          description: newGoal.description.trim(),
          progress: 0,
          deadline: newGoal.deadline || '',
          priority: newGoal.priority,
        },
      ],
    });
    setNewGoal({ title: '', description: '', deadline: '', priority: 'medium' });
  };

  const toggleHabitToday = (habitId) => {
    const todayKey = toDateKey(new Date());
    persist({
      ...planner,
      habits: planner.habits.map((h) => {
        if (h.id !== habitId) return h;
        if (h.lastDoneDate === todayKey) {
          return { ...h, lastDoneDate: null, streak: Math.max(0, (h.streak || 0) - 1) };
        }
        const yesterday = toDateKey(new Date(Date.now() - 86400000));
        const nextStreak = h.lastDoneDate === yesterday ? (h.streak || 0) + 1 : 1;
        return { ...h, lastDoneDate: todayKey, streak: nextStreak };
      }),
    });
  };

  const addEvent = () => {
    const title = newEvent.title.trim();
    if (!title || !selectedDate) return;
    persist({
      ...planner,
      events: [
        ...(planner.events || []),
        {
          id: uid('ev'),
          date: selectedDate,
          title,
          skill: newEvent.skill,
          durationMin: Number(newEvent.durationMin) || 30,
          done: false,
        },
      ],
    });
    setNewEvent({ title: '', skill: newEvent.skill, durationMin: newEvent.durationMin });
  };

  const toggleEventDone = (eventId) => {
    persist({
      ...planner,
      events: planner.events.map((e) => (e.id === eventId ? { ...e, done: !e.done } : e)),
    });
  };

  const removeEvent = (eventId) => {
    persist({ ...planner, events: planner.events.filter((e) => e.id !== eventId) });
  };

  if (!ready) {
    return (
      <div className="profile-tab-panels">
        <ProfileCollapsibleSection title={labels.plan} defaultOpen>
          <p className={styles.loading}>{en ? 'Loading planner…' : 'Cargando planificador…'}</p>
        </ProfileCollapsibleSection>
      </div>
    );
  }

  return (
    <div className="profile-tab-panels">
      <p className={styles.intro}>{labels.intro}</p>

      <ProfileCollapsibleSection title={labels.plan} defaultOpen>
        <div className={styles.planOverview}>
          <label className={styles.planField}>
            <span>{labels.dailyGoal}</span>
            <input
              type="number"
              min={5}
              max={480}
              value={planner.dailyGoalMinutes}
              onChange={(e) =>
                persist({ ...planner, dailyGoalMinutes: Number(e.target.value) || 45 })
              }
            />
            <em>{labels.min}</em>
          </label>
          <label className={styles.planField}>
            <span>{labels.weeklyGoal}</span>
            <input
              type="number"
              min={15}
              max={3000}
              value={planner.weeklyGoalMinutes}
              onChange={(e) =>
                persist({ ...planner, weeklyGoalMinutes: Number(e.target.value) || 300 })
              }
            />
            <em>{labels.min}</em>
          </label>
          <div className={styles.planStat}>
            <span className={styles.planStatLabel}>{labels.planned}</span>
            <strong>{stats.plannedMinutes} {labels.min}</strong>
          </div>
          <div className={styles.planStat}>
            <span className={styles.planStatLabel}>{labels.completed}</span>
            <strong>{stats.doneMinutes} {labels.min}</strong>
          </div>
        </div>
        <div className={styles.weeklyBar} aria-hidden>
          <div className={styles.weeklyBarFill} style={{ width: `${stats.weeklyProgress}%` }} />
        </div>
        <p className={styles.weeklyBarCaption}>
          {stats.weeklyProgress}% {labels.completed.toLowerCase()} ({stats.doneMinutes}/{stats.weeklyGoal} {labels.min})
        </p>
      </ProfileCollapsibleSection>

      <ProfileCollapsibleSection title={labels.calendar} defaultOpen>
        <p className={styles.weekCaption}>
          {labels.weekOf} {weekLabel}
        </p>
        <div className={styles.weekGrid}>
          {weekDays.map((day) => {
            const key = toDateKey(day);
            const isSelected = key === selectedDate;
            const isToday = key === toDateKey(new Date());
            const count = eventsByDate[key] || 0;
            return (
              <button
                key={key}
                type="button"
                className={`${styles.weekDay}${isSelected ? ` ${styles.weekDaySelected}` : ''}${isToday ? ` ${styles.weekDayToday}` : ''}`}
                onClick={() => setSelectedDate(key)}
              >
                <span className={styles.weekDayName}>
                  {day.toLocaleDateString(en ? 'en-GB' : 'es-GB', { weekday: 'short' })}
                </span>
                <span className={styles.weekDayNum}>{day.getDate()}</span>
                {count > 0 ? <span className={styles.weekDayDot}>{count}</span> : null}
              </button>
            );
          })}
        </div>

        <div className={styles.dayPanel}>
          <h3 className={styles.dayTitle}>{formatPlannerDate(selectedDate, en ? 'en' : 'es')}</h3>
          {dayEvents.length === 0 ? (
            <p className={styles.emptyDay}>{labels.noEvents}</p>
          ) : (
            <ul className={styles.eventList}>
              {dayEvents.map((ev) => (
                <li key={ev.id} className={`${styles.eventItem}${ev.done ? ` ${styles.eventItemDone}` : ''}`}>
                  <div className={styles.eventMain}>
                    <span className={styles.eventSkill}>{ev.skill}</span>
                    <strong>{ev.title}</strong>
                    <span className={styles.eventDuration}>{ev.durationMin} {labels.min}</span>
                  </div>
                  <div className={styles.eventActions}>
                    <button type="button" className={styles.eventDoneBtn} onClick={() => toggleEventDone(ev.id)}>
                      {ev.done ? '✓' : '○'} {labels.markDone}
                    </button>
                    <button type="button" className={styles.eventRemoveBtn} onClick={() => removeEvent(ev.id)}>
                      {labels.remove}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <div className={styles.addEventForm}>
            <input
              type="text"
              placeholder={labels.sessionTitle}
              value={newEvent.title}
              onChange={(e) => setNewEvent((p) => ({ ...p, title: e.target.value }))}
            />
            <select
              value={newEvent.skill}
              onChange={(e) => setNewEvent((p) => ({ ...p, skill: e.target.value }))}
            >
              {SKILLS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <input
              type="number"
              min={5}
              max={240}
              value={newEvent.durationMin}
              onChange={(e) => setNewEvent((p) => ({ ...p, durationMin: Number(e.target.value) }))}
              aria-label={labels.duration}
            />
            <button type="button" className={styles.primaryBtn} onClick={addEvent}>
              {labels.addSession}
            </button>
          </div>
        </div>
      </ProfileCollapsibleSection>

      <ProfileCollapsibleSection title={labels.goals}>
        <div className={styles.goalsGrid}>
          {planner.goals.map((goal) => (
            <article key={goal.id} className={`${styles.goalCard} ${styles[`priority_${goal.priority}`]}`}>
              <div className={styles.goalHead}>
                <h3 className={styles.goalTitle}>{goal.title}</h3>
                <span className={styles.goalPriority}>{goal.priority}</span>
              </div>
              {goal.description ? <p className={styles.goalDesc}>{goal.description}</p> : null}
              <label className={styles.goalProgressLabel}>
                {labels.progress}: {goal.progress}%
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={goal.progress}
                  onChange={(e) => updateGoals(goal.id, { progress: Number(e.target.value) })}
                />
              </label>
              {goal.deadline ? (
                <p className={styles.goalDeadline}>
                  {labels.deadline}: {formatPlannerDate(goal.deadline, en ? 'en' : 'es')}
                </p>
              ) : null}
              <button type="button" className={styles.textBtn} onClick={() => removeGoal(goal.id)}>
                {labels.remove}
              </button>
            </article>
          ))}
        </div>
        <div className={styles.addGoalForm}>
          <input
            type="text"
            placeholder={labels.goalTitle}
            value={newGoal.title}
            onChange={(e) => setNewGoal((p) => ({ ...p, title: e.target.value }))}
          />
          <input
            type="text"
            placeholder={labels.goalDesc}
            value={newGoal.description}
            onChange={(e) => setNewGoal((p) => ({ ...p, description: e.target.value }))}
          />
          <input
            type="date"
            value={newGoal.deadline}
            onChange={(e) => setNewGoal((p) => ({ ...p, deadline: e.target.value }))}
          />
          <select
            value={newGoal.priority}
            onChange={(e) => setNewGoal((p) => ({ ...p, priority: e.target.value }))}
          >
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          <button type="button" className={styles.primaryBtn} onClick={addGoal}>
            {labels.addGoal}
          </button>
        </div>
      </ProfileCollapsibleSection>

      <ProfileCollapsibleSection title={labels.habits}>
        <ul className={styles.habitsList}>
          {planner.habits.map((habit) => {
            const doneToday = habit.lastDoneDate === toDateKey(new Date());
            return (
              <li key={habit.id} className={`${styles.habitItem}${doneToday ? ` ${styles.habitItemDone}` : ''}`}>
                <div>
                  <strong>{habit.name}</strong>
                  <span className={styles.habitMeta}>{habit.frequency}</span>
                </div>
                <div className={styles.habitRight}>
                  <span className={styles.habitStreak}>
                    {labels.streak}: {habit.streak || 0} {labels.days}
                  </span>
                  <button
                    type="button"
                    className={`${styles.habitBtn}${doneToday ? ` ${styles.habitBtnActive}` : ''}`}
                    onClick={() => toggleHabitToday(habit.id)}
                  >
                    {doneToday ? '✓' : '○'} {labels.markToday}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </ProfileCollapsibleSection>

      <ProfileCollapsibleSection title={labels.progress}>
        <div className={styles.progressGrid}>
          <div className={styles.progressCard}>
            <span className={styles.progressLabel}>{labels.sessionsWeek}</span>
            <strong>
              {stats.sessionsDoneThisWeek}/{stats.sessionsThisWeek}
            </strong>
          </div>
          <div className={styles.progressCard}>
            <span className={styles.progressLabel}>{labels.avgGoals}</span>
            <strong>{stats.avgGoalProgress}%</strong>
          </div>
          <div className={styles.progressCard}>
            <span className={styles.progressLabel}>{labels.habitsToday}</span>
            <strong>
              {stats.habitsDoneToday}/{stats.habitsTotal}
            </strong>
          </div>
          <div className={styles.progressCard}>
            <span className={styles.progressLabel}>{labels.platformStreak}</span>
            <strong>{stats.externalStreak} {labels.days}</strong>
          </div>
          <div className={styles.progressCard}>
            <span className={styles.progressLabel}>{labels.platformMinutes}</span>
            <strong>{stats.externalMinutes} {labels.min}</strong>
          </div>
          <div className={styles.progressCard}>
            <span className={styles.progressLabel}>{labels.habitsToday} (%)</span>
            <strong>{stats.habitRate}%</strong>
          </div>
        </div>
        <div className={styles.quickLinks}>
          <span className={styles.quickLinksLabel}>{labels.quickLinks}</span>
          <Link href="/perfil?tab=study-tools" className={styles.quickLink}>
            {labels.tools}
          </Link>
          <Link href="/niveles/b2" className={styles.quickLink}>
            {labels.practice}
          </Link>
          <Link href="/perfil?tab=error-tracker" className={styles.quickLink}>
            {labels.errors}
          </Link>
        </div>
      </ProfileCollapsibleSection>
    </div>
  );
}
