import { supabase } from './supabaseClient';

export async function getUserProgress(userId) {
  const progress = {
    exams: [],
    training: [],
    theory: [],
    stats: {},
  };

  // 1. Obtener exámenes
  const { data: exams, error: examError } = await supabase
    .from('answers')
    .select('*')
    .eq('user_id', userId);

  if (examError) {
    console.error('Error al obtener exámenes:', examError.message);
  } else {
    progress.exams = exams.map((exam) => ({
      id: exam.exam_id,
      date: exam.created_at,
      answers: exam.answers,
      total_score: exam.total_score || 0,
      correct_answers: exam.correct_answers || 0
    }));
  }

  // 2. Obtener sesiones de entrenamiento (solo si ya las estás registrando)
  const { data: trainings, error: trainError } = await supabase
    .from('training_sessions')
    .select('*')
    .eq('user_id', userId);

  if (trainError) {
    console.error('Error al obtener entrenamientos:', trainError.message);
  } else {
    progress.training = trainings || [];
  }

  // 3. Teoría (opcional, si tienes algo como theory_progress)
  const { data: theory } = await supabase
    .from('theory_progress')
    .select('*')
    .eq('user_id', userId);

  progress.theory = theory || [];

  // 4. Cálculo de estadísticas globales
  progress.stats = calculateStats(progress);

  return progress;
}

// Lógica para generar estadísticas globales
function calculateStats({ exams, training }) {
  const completedExams = exams.length;
  const totalScore = exams.reduce((sum, e) => sum + (e.total_score || 0), 0);
  const totalCorrect = exams.reduce((sum, e) => sum + (e.correct_answers || 0), 0);
  const trainingCount = training.length;

  return {
    completedExams,
    totalScore,
    totalCorrect,
    trainingCount,
    levelEstimate: estimateLevel(totalScore),
  };
}

// Estimación de nivel basada en el total de puntuación
function estimateLevel(score) {
  if (score > 80) return 'C1';
  if (score > 60) return 'B2';
  if (score > 40) return 'B1';
  if (score > 20) return 'A2';
  return 'A1';
}
