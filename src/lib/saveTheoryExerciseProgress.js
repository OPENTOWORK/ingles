import {
  EXAM_THEORY_PROGRESS_EVENT,
  findExamUnitSlugForTopicHref,
  writeLocalLevelsProgreso,
} from '@/lib/examTheoryProgress';
import {
  findTheoryApartadoForTopicHref,
  TEORIA_PROGRESS_EVENT,
  writeLocalTeoriaProgreso,
} from '@/lib/teoriaProgress';
import {
  computeTopicExerciseProgressPercent,
  countPassedForTopic,
  shouldPersistExercisePass,
  writeLocalPassedExercise,
  THEORY_EXERCISE_PROGRESS_EVENT,
} from '@/lib/theoryExerciseProgress';

/**
 * Registra un ejercicio de teoría acertado (solo score === 100 avanza la barra).
 */
export async function saveTheoryExercisePass({
  userId,
  accessToken,
  topicHref,
  topicLevelLabel,
  cefrLevel,
  exerciseKey,
  score,
}) {
  if (!userId || !topicHref || !exerciseKey) return { saved: false };

  if (!shouldPersistExercisePass(score)) {
    return { saved: false, reason: 'incorrect' };
  }

  writeLocalPassedExercise(userId, topicHref, cefrLevel, exerciseKey);

  const progresoPct = computeTopicExerciseProgressPercent({
    passedCount: countPassedForTopic(userId, topicHref, topicLevelLabel),
    topicLevelLabel,
  });

  if (findExamUnitSlugForTopicHref(topicHref)) {
    writeLocalLevelsProgreso(userId, topicHref, progresoPct);
  }
  if (findTheoryApartadoForTopicHref(topicHref)) {
    writeLocalTeoriaProgreso(userId, topicHref, progresoPct);
  }

  if (!accessToken) {
    return { saved: true, offline: true, progreso_pct: progresoPct };
  }

  try {
    const res = await fetch('/api/theory-exercise-progress', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        topic_href: topicHref,
        exercise_key: exerciseKey,
        cefr_level: cefrLevel,
        topic_level_label: topicLevelLabel,
        puntuacion: 100,
      }),
    });

    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { saved: false, error: json.error || res.statusText };
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(THEORY_EXERCISE_PROGRESS_EVENT));
      window.dispatchEvent(new CustomEvent(EXAM_THEORY_PROGRESS_EVENT));
      window.dispatchEvent(new CustomEvent(TEORIA_PROGRESS_EVENT));
    }

    return {
      saved: true,
      progreso_pct: json.progreso_pct,
      passedKeys: json.passedKeys,
    };
  } catch (error) {
    return { saved: false, error: error.message, offline: true };
  }
}
