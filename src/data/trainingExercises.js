import { getTrainingPathCurriculum, getLevelTopic } from './trainingPathCurriculum.js';

const mapExerciseList = (exercises, baseId, difficultyNum, tags, estimatedTime) =>
  exercises.map((exercise, i) => ({
    ...exercise,
    id: baseId + i + 1,
    difficulty: difficultyNum,
    estimatedTime,
    tags,
  }));

const createPlaceholderExercises = (level, skill, difficulty, levelNumber, count, baseId, difficultyNum) => {
  const levelLabel = levelNumber.replace('level', '');
  const skillLabel = skill.replace(/-/g, ' ');
  return Array.from({ length: count }, (_, i) => ({
    id: baseId + i + 1,
    type: 'multiple_choice',
    question: `${level.toUpperCase()} · ${skillLabel} · Level ${levelLabel} — Question ${i + 1}`,
    options: ['Option A', 'Option B', 'Option C', 'Option D'],
    correct: 'Option A',
    explanation: `Practice exercise for ${difficulty} ${skillLabel}, level ${levelLabel}.`,
    difficulty: difficultyNum,
    estimatedTime: 45,
    tags: [skill, difficulty, `level-${levelLabel}`],
  }));
};

/** Stable IDs so progress cache and Supabase rows stay consistent across visits. */
function stableBaseId(level, skill, difficulty, levelNumber) {
  const levelNum = parseInt(levelNumber.replace('level', ''), 10) || 1;
  let hash = 0;
  for (const part of [level, skill, difficulty]) {
    for (let i = 0; i < part.length; i++) {
      hash = (hash * 31 + part.charCodeAt(i)) | 0;
    }
  }
  return levelNum * 10000 + (Math.abs(hash) % 1000);
}

async function loadA2BasicoExercises(level, skill, difficulty, levelNumber, count, baseId, difficultyNum) {
  const { getA2BasicoExerciseTemplates, isA2BasicoTraining } = await import('./a2TrainingContent.js');
  const normalizedSkill = skill.replace(/-/g, '_');
  if (!isA2BasicoTraining(level, difficulty) || !['use_of_english', 'vocabulary'].includes(normalizedSkill)) {
    return null;
  }

  const curriculum = getTrainingPathCurriculum(level, difficulty, skill.replace(/_/g, '-'));
  const levelNum = levelNumber.replace('level', '');
  const levelNumInt = parseInt(levelNum, 10) || 1;
  const topic = getLevelTopic(levelNumInt, curriculum);
  const templates = getA2BasicoExerciseTemplates(normalizedSkill, levelNumInt);

  return mapExerciseList(
    templates.map((t) => ({
      type: 'multiple_choice',
      question: t.question,
      text: t.text,
      word: t.word,
      options: t.options,
      correct: t.correct,
      explanation: t.explanation,
      tags: ['a2', 'basico', topic, `level-${levelNum}`],
    })),
    baseId,
    difficultyNum,
    ['a2', 'basico', normalizedSkill, difficulty],
    normalizedSkill === 'vocabulary' ? 30 : 45,
  );
}

async function loadSkillExerciseList(normalizedSkill, level, skill, difficulty, levelNum) {
  switch (normalizedSkill) {
    case 'use_of_english': {
      const { getExercisesByPath } = await import('./useOfEnglishExercises.js');
      return getExercisesByPath(level, skill, difficulty, levelNum);
    }
    case 'vocabulary': {
      const { getVocabularyExercisesByPath } = await import('./vocabularyExercises.js');
      return getVocabularyExercisesByPath(level, difficulty, levelNum);
    }
    case 'writing': {
      const { getWritingExercisesByPath } = await import('./writingExercises.js');
      return getWritingExercisesByPath(level, difficulty, levelNum);
    }
    case 'listening': {
      const { getListeningExercisesByPath } = await import('./listeningExercises.js');
      return getListeningExercisesByPath(level, difficulty, levelNum);
    }
    case 'speaking': {
      const { getSpeakingExercisesByPath } = await import('./speakingExercises.js');
      return getSpeakingExercisesByPath(level, difficulty, levelNum);
    }
    case 'reading': {
      const { getReadingExercisesByPath } = await import('./readingExercises.js');
      return getReadingExercisesByPath(level, difficulty, levelNum);
    }
    case 'all': {
      const { getAllExercisesByPath } = await import('./allExercises.js');
      return getAllExercisesByPath(level, difficulty, levelNum);
    }
    case 'challenge': {
      const { getChallengeExercisesByPath } = await import('./challengeExercises.js');
      return getChallengeExercisesByPath(level, difficulty, levelNum);
    }
    default:
      return [];
  }
}

async function generateExercisesBySkill(level, skill, difficulty, levelNumber, count = 10) {
  const baseId = stableBaseId(level, skill, difficulty, levelNumber);
  const difficultyNum = difficulty === 'basico' ? 1 : difficulty === 'intermedio' ? 2 : 3;
  const normalizedSkill = skill.replace(/-/g, '_');
  const levelNum = levelNumber.replace('level', '');

  const withFallback = (list, tags, estimatedTime) => {
    const slice = list.slice(0, count);
    if (slice.length > 0) {
      return mapExerciseList(slice, baseId, difficultyNum, tags, estimatedTime);
    }
    return createPlaceholderExercises(level, skill, difficulty, levelNumber, count, baseId, difficultyNum);
  };

  const a2Set = await loadA2BasicoExercises(level, skill, difficulty, levelNumber, count, baseId, difficultyNum);
  if (a2Set) return a2Set;

  switch (normalizedSkill) {
    case 'use_of_english':
      return withFallback(
        await loadSkillExerciseList(normalizedSkill, level, skill, difficulty, levelNum),
        ['use_of_english', 'grammar', difficulty],
        45,
      );
    case 'vocabulary':
      return withFallback(
        await loadSkillExerciseList(normalizedSkill, level, skill, difficulty, levelNum),
        ['vocabulary', difficulty],
        30,
      );
    case 'writing':
      return withFallback(
        await loadSkillExerciseList(normalizedSkill, level, skill, difficulty, levelNum),
        ['writing', difficulty],
        60,
      );
    case 'listening':
      return withFallback(
        await loadSkillExerciseList(normalizedSkill, level, skill, difficulty, levelNum),
        ['listening', difficulty],
        40,
      );
    case 'speaking':
      return withFallback(
        await loadSkillExerciseList(normalizedSkill, level, skill, difficulty, levelNum),
        ['speaking', difficulty],
        50,
      );
    case 'reading':
      return withFallback(
        await loadSkillExerciseList(normalizedSkill, level, skill, difficulty, levelNum),
        ['reading', difficulty],
        45,
      );
    case 'all':
      return withFallback(
        await loadSkillExerciseList(normalizedSkill, level, skill, difficulty, levelNum),
        ['all', 'mixed', difficulty],
        40,
      );
    case 'challenge':
      return withFallback(
        await loadSkillExerciseList(normalizedSkill, level, skill, difficulty, levelNum),
        ['challenge', 'advanced', difficulty],
        90,
      );
    default:
      return Array.from({ length: count }, (_, i) => ({
        id: baseId + i + 1,
        type: 'multiple_choice',
        question: `This is a ${difficulty} level ${skill} exercise.`,
        options: ['Option A', 'Option B', 'Option C', 'Option D'],
        correct: 'Option A',
        explanation: `This is a ${difficulty} level ${skill} exercise. Practice to improve your skills.`,
        difficulty: difficultyNum,
        estimatedTime: 60,
        tags: [skill, difficulty],
      }));
  }
}

/** Loads exercises for one path level (code-split per skill). */
export async function loadExercisesByLevel(level, skill, sublevel, exerciseLevel) {
  return generateExercisesBySkill(level, skill, sublevel, exerciseLevel, 10);
}

export const getExerciseById = () => null;

export const getRandomExercise = async (level, skill, sublevel, exerciseLevel) => {
  const exercises = await loadExercisesByLevel(level, skill, sublevel, exerciseLevel);
  if (exercises.length === 0) return null;
  return exercises[Math.floor(Math.random() * exercises.length)];
};

export const getExerciseStats = () => ({
  totalExercises: 250,
  totalLevels: 1728,
});
