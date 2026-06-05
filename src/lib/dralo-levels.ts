export const LEVEL_XP_STEP = 200;
export const MAX_LEVEL = 99;
export const MAX_XP = 19_999;

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
  progressPercent: number;
  isMaxLevel: boolean;
};

/** Clamp XP to the supported range [0, MAX_XP]. */
export function normalizeDraloXp(totalXp: number): number {
  const xp = Math.max(0, Math.floor(Number(totalXp) || 0));
  return Math.min(xp, MAX_XP);
}

/** Level 0–99 from total XP. */
export function getUserLevel(totalXp: number): number {
  const xp = normalizeDraloXp(totalXp);
  return Math.min(Math.floor(xp / LEVEL_XP_STEP), MAX_LEVEL);
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
  const currentLevelMinXp = level * LEVEL_XP_STEP;
  const currentLevelMaxXp = isMaxLevel ? MAX_XP : currentLevelMinXp + LEVEL_XP_STEP - 1;
  const xpInsideCurrentLevel = currentXp - currentLevelMinXp;
  const xpNeededForNextLevel = isMaxLevel ? null : LEVEL_XP_STEP - xpInsideCurrentLevel;
  const nextLevelXp = isMaxLevel ? null : currentLevelMinXp + LEVEL_XP_STEP;
  const progressPercent = isMaxLevel
    ? 100
    : Math.min(100, Math.round((xpInsideCurrentLevel / LEVEL_XP_STEP) * 100));

  return {
    level,
    levelName: getLevelName(level),
    currentXp,
    currentLevelMinXp,
    currentLevelMaxXp,
    nextLevelXp,
    xpInsideCurrentLevel,
    xpNeededForNextLevel,
    progressPercent,
    isMaxLevel,
  };
}
