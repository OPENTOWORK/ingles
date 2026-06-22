const STORAGE_PREFIX = 'dralo_study_planner_';

function storageKey(userId) {
  return `${STORAGE_PREFIX}${userId || 'guest'}`;
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function toDateKey(date) {
  return date.toISOString().split('T')[0];
}

export function getWeekStart(date = new Date()) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function getWeekDays(anchor = new Date()) {
  const start = getWeekStart(anchor);
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

export function createDefaultPlannerData(levelEstimate = 'B2') {
  const week = getWeekDays();
  const tomorrow = toDateKey(addDays(new Date(), 1));

  return {
    version: 1,
    dailyGoalMinutes: 45,
    weeklyGoalMinutes: 300,
    events: [
      {
        id: `ev_${Date.now()}`,
        date: toDateKey(week[1]),
        title: 'Reading part 1 practice',
        skill: 'Reading',
        durationMin: 30,
        done: false,
      },
      {
        id: `ev_${Date.now() + 1}`,
        date: toDateKey(week[3]),
        title: 'Listening review',
        skill: 'Listening',
        durationMin: 25,
        done: false,
      },
    ],
    goals: [
      {
        id: `goal_${Date.now()}`,
        title: `Reach ${levelEstimate} exam readiness`,
        description: 'Complete at least 2 skill sessions per week across reading and listening.',
        progress: 25,
        deadline: tomorrow,
        priority: 'high',
      },
      {
        id: `goal_${Date.now() + 1}`,
        title: 'Build a daily study habit',
        description: 'Study at least 30 minutes on 5 days each week.',
        progress: 40,
        deadline: toDateKey(addDays(new Date(), 21)),
        priority: 'medium',
      },
    ],
    habits: [
      {
        id: `habit_${Date.now()}`,
        name: 'Review Error Tracker items',
        frequency: 'Daily',
        streak: 0,
        lastDoneDate: null,
      },
      {
        id: `habit_${Date.now() + 1}`,
        name: 'One speaking practice session',
        frequency: '3× per week',
        streak: 0,
        lastDoneDate: null,
      },
      {
        id: `habit_${Date.now() + 2}`,
        name: 'Theory vocabulary drill',
        frequency: 'Daily',
        streak: 0,
        lastDoneDate: null,
      },
    ],
  };
}

export function loadStudyPlanner(userId, { levelEstimate = 'B2' } = {}) {
  if (typeof window === 'undefined') {
    return createDefaultPlannerData(levelEstimate);
  }
  try {
    const raw = localStorage.getItem(storageKey(userId));
    if (!raw) return createDefaultPlannerData(levelEstimate);
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return createDefaultPlannerData(levelEstimate);
    return {
      ...createDefaultPlannerData(levelEstimate),
      ...parsed,
      events: Array.isArray(parsed.events) ? parsed.events : [],
      goals: Array.isArray(parsed.goals) ? parsed.goals : [],
      habits: Array.isArray(parsed.habits) ? parsed.habits : [],
    };
  } catch {
    return createDefaultPlannerData(levelEstimate);
  }
}

export function saveStudyPlanner(userId, data) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(storageKey(userId), JSON.stringify(data));
}

export function computePlannerStats(data, { externalStreak = 0, externalMinutes = 0 } = {}) {
  const weekDays = getWeekDays().map(toDateKey);
  const weekEvents = (data.events || []).filter((e) => weekDays.includes(e.date));
  const plannedMinutes = weekEvents.reduce((sum, e) => sum + (Number(e.durationMin) || 0), 0);
  const doneMinutes = weekEvents
    .filter((e) => e.done)
    .reduce((sum, e) => sum + (Number(e.durationMin) || 0), 0);
  const weeklyGoal = Math.max(1, Number(data.weeklyGoalMinutes) || 300);
  const dailyGoal = Math.max(1, Number(data.dailyGoalMinutes) || 45);

  const goals = data.goals || [];
  const avgGoalProgress =
    goals.length > 0
      ? Math.round(goals.reduce((s, g) => s + (Number(g.progress) || 0), 0) / goals.length)
      : 0;

  const todayKey = toDateKey(new Date());
  const habits = data.habits || [];
  const habitsDoneToday = habits.filter((h) => h.lastDoneDate === todayKey).length;
  const habitRate =
    habits.length > 0 ? Math.round((habitsDoneToday / habits.length) * 100) : 0;

  const habitStreakBest = habits.reduce((max, h) => Math.max(max, Number(h.streak) || 0), 0);

  return {
    plannedMinutes,
    doneMinutes,
    weeklyProgress: Math.min(100, Math.round((doneMinutes / weeklyGoal) * 100)),
    dailyGoal,
    weeklyGoal,
    avgGoalProgress,
    habitsDoneToday,
    habitsTotal: habits.length,
    habitRate,
    habitStreakBest,
    externalStreak,
    externalMinutes,
    sessionsThisWeek: weekEvents.length,
    sessionsDoneThisWeek: weekEvents.filter((e) => e.done).length,
  };
}

export function formatPlannerDate(dateKey, lang = 'en') {
  if (!dateKey) return '—';
  try {
    const d = new Date(`${dateKey}T12:00:00`);
    return d.toLocaleDateString(lang === 'es' ? 'es-GB' : 'en-GB', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
  } catch {
    return dateKey;
  }
}

export { toDateKey };
