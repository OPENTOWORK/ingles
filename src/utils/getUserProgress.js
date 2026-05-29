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

  const [examsRes, trainingsRes, theoryRes] = await Promise.all([
    supabase.from('answers').select('*').eq('user_id', userId),
    supabase.from('training_sessions').select('*').eq('user_id', userId),
    supabase.from('theory_progress').select('*').eq('user_id', userId),
  ]);

  const { data: exams, error: examError } = examsRes;
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
      correct_answers: exam.correcta ? 1 : 0,
    }));
  }

  const { data: trainings, error: trainError } = trainingsRes;
  if (trainError) {
    if (!isMissingTable(trainError)) {
      console.error('Error al obtener entrenamientos:', trainError.message);
    }
  } else {
    progress.training = (trainings || []).map((item) => ({
      ...item,
      score: item.correcta ? 100 : 0,
      time_spent: 0,
    }));
  }

  const { data: theory, error: theoryError } = theoryRes;
  if (theoryError) {
    if (!isMissingTable(theoryError)) {
      console.error('Error al obtener teoría:', theoryError.message);
    }
  } else {
    progress.theory = (theory || []).map((item) => ({
      ...item,
      topic_id: item.contenido_id,
    }));
  }

  progress.stats = calculateStats(progress);

  return progress;
}

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

function estimateLevel(score) {
  if (score > 80) return 'C1';
  if (score > 60) return 'B2';
  if (score > 40) return 'B1';
  if (score > 20) return 'A2';
  return 'A2';
}
