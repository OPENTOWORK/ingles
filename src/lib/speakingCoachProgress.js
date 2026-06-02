const STORAGE_KEY = 'dralo-speaking-coach-progress';

function readAll() {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeAll(data) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    /* ignore quota */
  }
}

/** @returns {Record<string, { xp: number, completions: number, bestStars: number }>} */
export function loadSpeakingProgressForLevel(level) {
  const key = String(level || 'B2').toUpperCase();
  const all = readAll();
  return all[key] && typeof all[key] === 'object' ? { ...all[key] } : {};
}

export function recordSpeakingMissionComplete(level, missionId, { xpEarned = 0, stars = 1 } = {}) {
  if (!missionId) return loadSpeakingProgressForLevel(level);
  const lvl = String(level || 'B2').toUpperCase();
  const all = readAll();
  const bucket = { ...(all[lvl] || {}) };
  const prev = bucket[missionId] || { xp: 0, completions: 0, bestStars: 0 };
  const earned = Math.max(0, Number(xpEarned) || 0);
  bucket[missionId] = {
    xp: prev.xp + earned,
    completions: prev.completions + 1,
    bestStars: Math.max(prev.bestStars, Math.min(3, Number(stars) || 1)),
  };
  all[lvl] = bucket;
  writeAll(all);
  return bucket;
}

export function getMissionXpPct(mission, entry) {
  const cap = Math.max(1, Number(mission?.estimatedXp) || 100);
  const xp = Math.max(0, Number(entry?.xp) || 0);
  return Math.min(100, Math.round((xp / cap) * 100));
}

export function getOverallSpeakingXp(missions, progressByMission) {
  let earned = 0;
  let cap = 0;
  for (const m of missions || []) {
    const capOne = Math.max(1, Number(m.estimatedXp) || 100);
    cap += capOne;
    earned += Math.min(capOne, Number(progressByMission?.[m.id]?.xp) || 0);
  }
  const pct = cap ? Math.round((earned / cap) * 100) : 0;
  return { earned, cap, pct };
}

export function speakingCoachLevel(totalEarned) {
  const xp = Math.max(0, Number(totalEarned) || 0);
  const level = Math.floor(xp / 200) + 1;
  const inLevel = xp % 200;
  const pct = Math.round((inLevel / 200) * 100);
  return { level, inLevel, pct, nextAt: 200 - inLevel };
}
