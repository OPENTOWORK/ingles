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

  shouldRecordTheoryExerciseAttempt,

  writeLocalPassedExercise,

  THEORY_EXERCISE_PROGRESS_EVENT,

} from '@/lib/theoryExerciseProgress';

import { ensureAppUserProfile } from '@/utils/ensureAppUserProfile';



/**

 * Registra cada intento de ejercicio de teoría en Supabase (acierto y fallo).

 * La barra de progreso solo avanza con puntuación 100.

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



  if (!shouldRecordTheoryExerciseAttempt(score)) {

    return { saved: false, reason: 'invalid_score' };

  }



  const passed = shouldPersistExercisePass(score);



  if (passed) {

    writeLocalPassedExercise(userId, topicHref, cefrLevel, exerciseKey);

  }



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

    return { saved: true, offline: true, progreso_pct: progresoPct, correct: passed };

  }



  const profile = await ensureAppUserProfile();

  if (!profile.ok) {

    return {

      saved: false,

      error:

        profile.reason === 'no_session'

          ? 'Inicia sesión para guardar en la base de datos.'

          : 'No se pudo sincronizar tu perfil de usuario.',

      progreso_pct: progresoPct,

      correct: passed,

    };

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

        puntuacion: Math.round(Number(score)),

      }),

    });



    const json = await res.json().catch(() => ({}));

    if (!res.ok) {

      return { saved: false, error: json.error || res.statusText, correct: passed };

    }



    if (typeof window !== 'undefined') {

      window.dispatchEvent(new CustomEvent(THEORY_EXERCISE_PROGRESS_EVENT));

      window.dispatchEvent(new CustomEvent(EXAM_THEORY_PROGRESS_EVENT));

      window.dispatchEvent(new CustomEvent(TEORIA_PROGRESS_EVENT));

    }



    return {

      saved: true,

      correct: json.correct ?? passed,

      progreso_pct: json.progreso_pct ?? progresoPct,

      passedKeys: json.passedKeys,

    };

  } catch (error) {

    return { saved: false, error: error.message, offline: true, correct: passed };

  }

}



/** Alias explícito para guardar cualquier intento (acierto o fallo). */

export const saveTheoryExerciseAttempt = saveTheoryExercisePass;


