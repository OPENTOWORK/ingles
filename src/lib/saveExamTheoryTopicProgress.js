import {
  findExamUnitSlugForTopicHref,
  writeLocalLevelsProgreso,
} from '@/lib/examTheoryProgress';

/**
 * Guarda progreso de un tema de Exam theory (local + API).
 */
export async function saveExamTheoryTopicProgress({
  userId,
  accessToken,
  topicHref,
  progresoPct,
}) {
  if (!userId || !topicHref) return;

  const unidad = findExamUnitSlugForTopicHref(topicHref);
  if (!unidad) return;

  writeLocalLevelsProgreso(userId, topicHref, progresoPct);

  if (!accessToken) return;

  try {
    await fetch('/api/levels-progreso', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        topic_href: topicHref,
        unidad,
        progreso_pct: progresoPct,
      }),
    });
  } catch {
    /* offline */
  }
}
