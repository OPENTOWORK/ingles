// Importar ejercicios de todos los skills
import { getExercisesByPath } from './useOfEnglishExercises.js';
import { getVocabularyExercisesByPath } from './vocabularyExercises.js';
import { getWritingExercisesByPath } from './writingExercises.js';
import { getListeningExercisesByPath } from './listeningExercises.js';
import { getSpeakingExercisesByPath } from './speakingExercises.js';
import { getReadingExercisesByPath } from './readingExercises.js';
import { getAllExercisesByPath } from './allExercises.js';
import { getChallengeExercisesByPath } from './challengeExercises.js';

// Función para generar ejercicios por skill
const generateExercisesBySkill = (level, skill, difficulty, levelNumber, count = 10) => {
  const baseId = parseInt(levelNumber.replace('level', '')) * 1000 + Math.floor(Math.random() * 100);
  const difficultyNum = difficulty === 'basico' ? 1 : difficulty === 'intermedio' ? 2 : 3;
  
  // Normalizar el nombre de la skill para usar guiones bajos
  const normalizedSkill = skill.replace(/-/g, '_');
  
  const levelNum = levelNumber.replace('level', '');
  
  switch (normalizedSkill) {
    case 'use_of_english':
      const exercises = getExercisesByPath(level, skill, difficulty, levelNum);
      return exercises.slice(0, count).map((exercise, i) => ({
        ...exercise,
        id: baseId + i + 1,
        difficulty: difficultyNum,
        estimatedTime: 45,
        tags: ["use_of_english", "grammar", difficulty]
      }));
    case 'vocabulary':
      const vocabExercises = getVocabularyExercisesByPath(level, difficulty, levelNum);
      return vocabExercises.slice(0, count).map((exercise, i) => ({
        ...exercise,
        id: baseId + i + 1,
        difficulty: difficultyNum,
        estimatedTime: 30,
        tags: ["vocabulary", difficulty]
      }));
    case 'writing':
      const writingExercises = getWritingExercisesByPath(level, difficulty, levelNum);
      return writingExercises.slice(0, count).map((exercise, i) => ({
        ...exercise,
        id: baseId + i + 1,
        difficulty: difficultyNum,
        estimatedTime: 60,
        tags: ["writing", difficulty]
      }));
    case 'listening':
      const listeningExercises = getListeningExercisesByPath(level, difficulty, levelNum);
      return listeningExercises.slice(0, count).map((exercise, i) => ({
        ...exercise,
        id: baseId + i + 1,
        difficulty: difficultyNum,
        estimatedTime: 40,
        tags: ["listening", difficulty]
      }));
    case 'speaking':
      const speakingExercises = getSpeakingExercisesByPath(level, difficulty, levelNum);
      return speakingExercises.slice(0, count).map((exercise, i) => ({
        ...exercise,
        id: baseId + i + 1,
        difficulty: difficultyNum,
        estimatedTime: 50,
        tags: ["speaking", difficulty]
      }));
    case 'reading':
      const readingExercises = getReadingExercisesByPath(level, difficulty, levelNum);
      return readingExercises.slice(0, count).map((exercise, i) => ({
        ...exercise,
        id: baseId + i + 1,
        difficulty: difficultyNum,
        estimatedTime: 45,
        tags: ["reading", difficulty]
      }));
    case 'all':
      const allExercises = getAllExercisesByPath(level, difficulty, levelNum);
      return allExercises.slice(0, count).map((exercise, i) => ({
        ...exercise,
        id: baseId + i + 1,
        difficulty: difficultyNum,
        estimatedTime: 40,
        tags: ["all", "mixed", difficulty]
      }));
    case 'challenge':
      const challengeExercises = getChallengeExercisesByPath(level, difficulty, levelNum);
      return challengeExercises.slice(0, count).map((exercise, i) => ({
        ...exercise,
        id: baseId + i + 1,
        difficulty: difficultyNum,
        estimatedTime: 90,
        tags: ["challenge", "advanced", difficulty]
      }));
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

