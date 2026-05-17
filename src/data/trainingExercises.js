// Importar ejercicios de todos los skills
import { getExercisesByPath } from './useOfEnglishExercises.js';
import { getVocabularyExercisesByPath } from './vocabularyExercises.js';
import { getWritingExercisesByPath } from './writingExercises.js';
import { getListeningExercisesByPath } from './listeningExercises.js';
import { getSpeakingExercisesByPath } from './speakingExercises.js';
import { getReadingExercisesByPath } from './readingExercises.js';
import { getAllExercisesByPath } from './allExercises.js';
import { getChallengeExercisesByPath } from './challengeExercises.js';

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

// Función para generar ejercicios por skill
const generateExercisesBySkill = (level, skill, difficulty, levelNumber, count = 10) => {
  const baseId = parseInt(levelNumber.replace('level', '')) * 1000 + Math.floor(Math.random() * 100);
  const difficultyNum = difficulty === 'basico' ? 1 : difficulty === 'intermedio' ? 2 : 3;
  
  // Normalizar el nombre de la skill para usar guiones bajos
  const normalizedSkill = skill.replace(/-/g, '_');
  
  const levelNum = levelNumber.replace('level', '');
  const withFallback = (list, tags, estimatedTime) => {
    const slice = list.slice(0, count);
    if (slice.length > 0) {
      return mapExerciseList(slice, baseId, difficultyNum, tags, estimatedTime);
    }
    return createPlaceholderExercises(level, skill, difficulty, levelNumber, count, baseId, difficultyNum);
  };
  
  switch (normalizedSkill) {
    case 'use_of_english':
      return withFallback(
        getExercisesByPath(level, skill, difficulty, levelNum),
        ['use_of_english', 'grammar', difficulty],
        45
      );
    case 'vocabulary':
      return withFallback(
        getVocabularyExercisesByPath(level, difficulty, levelNum),
        ['vocabulary', difficulty],
        30
      );
    case 'writing':
      return withFallback(
        getWritingExercisesByPath(level, difficulty, levelNum),
        ['writing', difficulty],
        60
      );
    case 'listening':
      return withFallback(
        getListeningExercisesByPath(level, difficulty, levelNum),
        ['listening', difficulty],
        40
      );
    case 'speaking':
      return withFallback(
        getSpeakingExercisesByPath(level, difficulty, levelNum),
        ['speaking', difficulty],
        50
      );
    case 'reading':
      return withFallback(
        getReadingExercisesByPath(level, difficulty, levelNum),
        ['reading', difficulty],
        45
      );
    case 'all':
      return withFallback(
        getAllExercisesByPath(level, difficulty, levelNum),
        ['all', 'mixed', difficulty],
        40
      );
    case 'challenge':
      return withFallback(
        getChallengeExercisesByPath(level, difficulty, levelNum),
        ['challenge', 'advanced', difficulty],
        90
      );
    default:
      // Para skills no implementados, generar ejercicios básicos
      return Array.from({ length: count }, (_, i) => ({
        id: baseId + i + 1,
        type: "multiple_choice",
        question: `This is a ${difficulty} level ${skill} exercise.`,
        options: ["Option A", "Option B", "Option C", "Option D"],
        correct: "Option A",
        explanation: `This is a ${difficulty} level ${skill} exercise. Practice to improve your skills.`,
        difficulty: difficultyNum,
        estimatedTime: 60,
        tags: [skill, difficulty]
      }));
  }
};

// Helper function principal
export const getExercisesByLevel = (level, skill, sublevel, exerciseLevel) => {
  // Generar ejercicios aleatorios cada vez
  return generateExercisesBySkill(level, skill, sublevel, exerciseLevel, 10);
};

export const getExerciseById = (id) => {
  // No implementado aún
  return null;
};

export const getRandomExercise = (level, skill, sublevel, exerciseLevel) => {
  const exercises = getExercisesByLevel(level, skill, sublevel, exerciseLevel);
  if (exercises.length === 0) return null;
  return exercises[Math.floor(Math.random() * exercises.length)];
};

export const getExerciseStats = () => {
  return { totalExercises: 250, totalLevels: 1728 };
};

