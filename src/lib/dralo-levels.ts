/** XP to leave level 0. Each later level costs 7% more, rounded. */
export const FIRST_LEVEL_XP = 30;
export const LEVEL_XP_GROWTH = 1.07;
export const MAX_LEVEL = 99;

/** XP required to reach each level. Index 0 is 0; index 99 is the cap. */
export const LEVEL_XP_THRESHOLDS: readonly number[] = buildLevelXpThresholds();
export const MAX_XP = LEVEL_XP_THRESHOLDS[MAX_LEVEL];

function buildLevelXpThresholds(): number[] {
  const thresholds = [0];
  for (let level = 0; level < MAX_LEVEL; level += 1) {
    thresholds.push(thresholds[level] + xpCostForLevel(level));
  }
  return thresholds;
}

/** 100 level names (0–99). */
export const DRALO_LEVEL_NAMES: readonly string[] = [
  'Rookie Silence',
  'First Word',
  'Hello Starter',
  'Word Hunter',
  'Grammar Seed',
  'Tiny Speaker',
  'Basic Explorer',
  'Sentence Builder',
  'Listening Rookie',
  'English Spark',
  'A1 Adventurer',
  'Phrase Collector',
  'Grammar Walker',
  'Daily Talker',
  'Question Maker',
  'Vocabulary Scout',
  'Small Talk Hero',
  'Reading Rookie',
  'Speaking Sprinter',
  'Confident Starter',
  'A2 Pathfinder',
  'Dialogue Ranger',
  'Grammar Climber',
  'Fast Listener',
  'Message Master',
  'Travel Speaker',
  'Story Builder',
  'Pronunciation Pilot',
  'English Nomad',
  'Real-Life Rookie',
  'B1 Challenger',
  'Opinion Maker',
  'Fluency Seeker',
  'Grammar Warrior',
  'Listening Fighter',
  'Writing Builder',
  'Conversation Ninja',
  'Reading Hunter',
  'Vocabulary Raider',
  'Everyday Pro',
  'B1+ Gladiator',
  'Debate Starter',
  'Email Expert',
  'Fluency Rider',
  'Grammar Tactician',
  'Listening Commander',
  'Speaking Warrior',
  'Writing Strategist',
  'Vocabulary Beast',
  'English Fighter',
  'B2 Contender',
  'Use of English Rookie',
  'Exam Explorer',
  'Fluency Hunter',
  'Essay Builder',
  'Listening Pro',
  'Speaking Pro',
  'Reading Pro',
  'Grammar Crusher',
  'B2 Warrior',
  'B2 Champion',
  'Advanced Speaker',
  'Exam Tactician',
  'Vocabulary Commander',
  'Essay Specialist',
  'Listening Specialist',
  'Grammar Specialist',
  'Fluency Machine',
  'English Strategist',
  'B2 Elite',
  'C1 Initiate',
  'Advanced Thinker',
  'Precision Speaker',
  'Academic Writer',
  'Natural Listener',
  'Expression Master',
  'Debate Warrior',
  'Grammar Architect',
  'Vocabulary Architect',
  'C1 Climber',
  'C1 Specialist',
  'Fluent Mind',
  'Native Flow',
  'Essay Master',
  'Speaking Master',
  'Listening Master',
  'Reading Master',
  'English Commander',
  'C1 Elite',
  'Near Native',
  'C2 Gatekeeper',
  'Master Communicator',
  'Language Strategist',
  'Native-Level Speaker',
  'English Overlord',
  'Fluency Legend',
  'Exam Destroyer',
  'C2 Champion',
  'Grand Master',
  'English Legend',
] as const;

export type DraloLevelInfo = {
  level: number;
  levelName: string;
  currentXp: number;
  currentLevelMinXp: number;
  currentLevelMaxXp: number;
  nextLevelXp: number | null;
  xpInsideCurrentLevel: number;
  xpNeededForNextLevel: number | null;
  /** XP this level asks for. The bar is `xpInsideCurrentLevel / levelXpSpan`. */
  levelXpSpan: number;
  progressPercent: number;
  isMaxLevel: boolean;
};

/** XP required to leave `level` (0–98). Level 99 has no next step. */
export function xpCostForLevel(level: number): number {
  const idx = Math.max(0, Math.min(MAX_LEVEL - 1, Math.floor(level)));
  return Math.round(FIRST_LEVEL_XP * LEVEL_XP_GROWTH ** idx);
}

/** Clamp XP to the supported range [0, MAX_XP]. */
export function normalizeDraloXp(totalXp: number): number {
  const xp = Math.max(0, Math.floor(Number(totalXp) || 0));
  return Math.min(xp, MAX_XP);
}

/** Level 0–99 from total XP. */
export function getUserLevel(totalXp: number): number {
  const xp = normalizeDraloXp(totalXp);
  let lo = 0;
  let hi = MAX_LEVEL;
  while (lo < hi) {
    const mid = Math.ceil((lo + hi) / 2);
    if (LEVEL_XP_THRESHOLDS[mid] <= xp) lo = mid;
    else hi = mid - 1;
  }
  return lo;
}

export function getLevelName(level: number): string {
  const idx = Math.max(0, Math.min(MAX_LEVEL, Math.floor(level)));
  return DRALO_LEVEL_NAMES[idx] ?? `Level ${idx}`;
}

/** Full progress snapshot for UI and APIs. */
export function getLevelInfo(totalXp: number): DraloLevelInfo {
  const currentXp = normalizeDraloXp(totalXp);
  const level = getUserLevel(currentXp);
  const isMaxLevel = level >= MAX_LEVEL;
  const currentLevelMinXp = LEVEL_XP_THRESHOLDS[level];
  const levelXpSpan = isMaxLevel
    ? LEVEL_XP_THRESHOLDS[MAX_LEVEL] - LEVEL_XP_THRESHOLDS[MAX_LEVEL - 1]
    : LEVEL_XP_THRESHOLDS[level + 1] - currentLevelMinXp;
  const nextLevelXp = isMaxLevel ? null : LEVEL_XP_THRESHOLDS[level + 1];
  const currentLevelMaxXp = nextLevelXp == null ? MAX_XP : nextLevelXp - 1;
  const xpInsideCurrentLevel = isMaxLevel ? levelXpSpan : currentXp - currentLevelMinXp;
  const xpNeededForNextLevel = isMaxLevel ? null : nextLevelXp - currentXp;
  const progressPercent = isMaxLevel
    ? 100
    : Math.min(100, Math.round((xpInsideCurrentLevel / levelXpSpan) * 100));

  return {
    level,
    levelName: getLevelName(level),
    currentXp,
    currentLevelMinXp,
    currentLevelMaxXp,
    nextLevelXp,
    xpInsideCurrentLevel,
    xpNeededForNextLevel,
    levelXpSpan,
    progressPercent,
    isMaxLevel,
  };
}
