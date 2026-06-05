import { fetchTeoriaExercisesForTopic } from '@/lib/fetchTeoriaExercisesForTopic';
import { parseUoePartDescripcion } from '@/utils/levelsPuntuaciones';

function excerptText(text, max = 280) {
  const s = String(text || '').trim();
  if (!s) return '';
  return s.length > max ? `${s.slice(0, max)}…` : s;
}

function parseExerciseIdFromKey(exerciseKey) {
  const m = String(exerciseKey || '').match(/^supabase:([0-9a-f-]{36})$/i);
  return m ? m[1] : null;
}

function buildTheoryWhyWrong(exercise) {
  if (!exercise) {
    return {
      correctAnswer: null,
      explanation: 'We could not load the exercise details. Open the topic and try the exercise again.',
      question: null,
    };
  }

  if (exercise.answerMode === 'open') {
    return {
      question: exercise.pregunta,
      correctAnswer: exercise.respuestaAbierta,
      explanation:
        exercise.respuestaAbiertaDescripcion ||
        exercise.instruction ||
        'Compare your answer with the model answer above. Check grammar, word choice and whether you answered the full question.',
    };
  }

  const correctOptions = (exercise.opciones || []).filter((o) => o.correcta);
  const correctAnswer = correctOptions.map((o) => o.text).join(' · ') || null;
  const wrongOptions = (exercise.opciones || []).filter((o) => !o.correcta);

  let explanation =
    'The correct option matches the grammar rule for this topic. Review the lesson and notice why the other choices do not fit.';
  if (wrongOptions.length && correctOptions.length === 1) {
    explanation = `Option "${correctOptions[0].text}" is correct. The other choices change the meaning or break the grammar pattern for this topic.`;
  }

  return {
    question: exercise.pregunta,
    correctAnswer,
    explanation: exercise.instruction || explanation,
  };
}

async function fetchTheoryReviewDetail(db, item) {
  const exerciseId = parseExerciseIdFromKey(item.exerciseKey);
  if (!exerciseId || !item.topicHref) {
    return {
      question: item.title,
      correctAnswer: null,
      explanation:
        'This theory exercise was not passed. Open the topic, read the explanation in the lesson, and try the exercise again.',
      practiceHref: item.practiceHref,
    };
  }

  const exercises = await fetchTeoriaExercisesForTopic(db, {
    topicHref: item.topicHref,
    cefrLevel: item.level || 'B2',
    allCefrLevels: false,
  });

  const exercise = exercises.find((ex) => ex.id === exerciseId) || null;
  const detail = buildTheoryWhyWrong(exercise);

  return {
    ...detail,
    practiceHref: item.practiceHref,
    exerciseType: exercise?.tipoColloquialLabel || exercise?.tipoLabel || 'Theory',
  };
}

async function fetchExamReviewDetail(db, item) {
  const preguntaId = item.preguntaId;
  if (!preguntaId) {
    if (item.parteNumero) {
      const correctas = String(item.userAttempt || '').match(/(\d+)\/(\d+)/);
      return {
        question: item.title,
        correctAnswer: null,
        explanation: item.parteNumero
          ? `You did not pass this exam part (score ${item.score}%). You need more correct answers to pass. Open the part and review each question carefully.`
          : 'Review the exam part and check each question against the text or audio.',
        practiceHref: item.practiceHref,
      };
    }
    return {
      question: item.title,
      correctAnswer: null,
      explanation: 'Review this exam question in context and compare your answer with the official key.',
      practiceHref: item.practiceHref,
    };
  }

  const [preguntaRes, mcqRes, openRes] = await Promise.all([
    db.from('levels_preguntas').select('id, enunciado').eq('id', preguntaId).maybeSingle(),
    db.from('levels_respuestas').select('respuesta, correcta').eq('pregunta_id', preguntaId),
    db
      .from('levels_respuestas_abiertas')
      .select('respuesta_texto')
      .eq('pregunta_id_abierta', preguntaId),
  ]);

  const enunciado = excerptEnunciadoJson(preguntaRes.data?.enunciado);
  const correctMcq = (mcqRes.data || []).filter((r) => r.correcta).map((r) => r.respuesta);
  const correctOpen = (openRes.data || []).map((r) => r.respuesta_texto).filter(Boolean);

  const correctAnswer =
    [...correctMcq, ...correctOpen].join(' · ') || null;

  let explanation = 'Your answer did not match the correct key for this item.';
  if (item.userAttempt && correctAnswer) {
    explanation = `You answered "${item.userAttempt}". The correct answer is shown below. Read the task again and check why your choice does not fit.`;
  } else if (/\d+\/\d+/.test(String(item.userAttempt || ''))) {
    explanation = 'You did not reach the passing score for this part. Practise the questions you missed.';
  }

  return {
    question: enunciado || item.title,
    correctAnswer,
    explanation,
    practiceHref: item.practiceHref,
    userAttempt: item.userAttempt,
  };
}

function excerptEnunciadoJson(enunciado) {
  const raw = String(enunciado || '').trim();
  if (!raw) return '';
  if (raw.startsWith('{')) {
    try {
      const data = JSON.parse(raw);
      return excerptText(
        data.directions ||
          data.passage ||
          data.title ||
          data.instructions ||
          data.taskTitle ||
          '',
      );
    } catch {
      return excerptText(raw);
    }
  }
  return excerptText(raw);
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} db
 * @param {object} item — normalized error from fetchUserPracticeErrors
 */
export async function fetchErrorReviewDetail(db, item) {
  if (!item) {
    return { ok: false, error: 'Missing error item.' };
  }

  try {
    const detail =
      item.sourceKey === 'theory'
        ? await fetchTheoryReviewDetail(db, item)
        : await fetchExamReviewDetail(db, item);

    return {
      ok: true,
      data: {
        errorKey: item.id,
        title: item.title,
        subtitle: item.subtitle,
        score: item.score,
        source: item.source,
        category: item.category,
        level: item.level,
        userAttempt: item.userAttempt,
        ...detail,
      },
    };
  } catch (err) {
    return { ok: false, error: err?.message || 'Could not load review details.' };
  }
}

export async function fetchReviewedErrorKeys(db, userId) {
  const { data, error } = await db
    .from('user_practice_error_reviews')
    .select('error_key')
    .eq('user_id', userId);

  if (error) {
    if (error.code === '42P01') return { ok: true, keys: [] };
    return { ok: false, keys: [], error: error.message };
  }

  return {
    ok: true,
    keys: (data || []).map((r) => r.error_key).filter(Boolean),
  };
}

export async function markErrorAsReviewed(db, userId, errorKey) {
  if (!userId || !errorKey) {
    return { ok: false, error: 'Missing data.' };
  }

  const { error } = await db.from('user_practice_error_reviews').upsert(
    {
      user_id: userId,
      error_key: errorKey,
      reviewed_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,error_key' },
  );

  if (error) {
    if (error.code === '42P01') {
      return { ok: false, error: 'Review table not ready. Run scripts/user_practice_error_reviews.sql in Supabase.' };
    }
    return { ok: false, error: error.message };
  }

  return { ok: true };
}
