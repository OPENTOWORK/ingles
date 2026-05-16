import { supabase } from './supabaseClient';

export async function getUserProgress(userId) {
  const progress = {
    exams: [],
    training: [],
    theory: [],
    stats: {},
  };

  const isMissingTable = (err) =>
    !!err && (err.code === '42P01' || /Could not find the table/i.test(err.message || ''));

  // 1. Obtener exámenes
  const { data: exams, error: examError } = await supabase
    .from('answers')
    .select('*')
    .eq('user_id', userId);

  if (examError) {
    if (!isMissingTable(examError)) {
      console.error('Error al obtener exámenes:', examError.message);
    }
  } else if (exams) {
    progress.exams = exams.map((exam) => ({
      id: exam.intento_id || exam.id,
      date: exam.creado_en || null,
      answers: exam.respuesta || null,
      total_score: exam.correcta ? 100 : 0,
      correct_answers: exam.correcta ? 1 : 0
    }));
  }

  // 2. Obtener sesiones de entrenamiento (solo si ya las estás registrando)
  const { data: trainings, error: trainError } = await supabase
    .from('training_sessions')
    .select('*')
    .eq('user_id', userId);

  if (trainError) {
    if (!isMissingTable(trainError)) {
      console.error('Error al obtener entrenamientos:', trainError.message);
    }
  } else {
    progress.training = (trainings || []).map((item) => ({
      ...item,
      score: item.correcta ? 100 : 0,
      time_spent: 0
    }));
  }

  // 3. Teoría (opcional, si tienes algo como theory_progress)
  const { data: theory, error: theoryError } = await supabase
    .from('theory_progress')
    .select('*')
    .eq('user_id', userId);

  if (theoryError) {
    if (!isMissingTable(theoryError)) {
      console.error('Error al obtener teoría:', theoryError.message);
    }
  } else {
    progress.theory = (theory || []).map((item) => ({
      ...item,
      topic_id: item.contenido_id
    }));
  }

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
  return 'A2';
}
