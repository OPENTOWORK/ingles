import {
  findTheoryApartadoForTopicHref,
  writeLocalTeoriaProgreso,
} from '@/lib/teoriaProgress';

/** Guarda progreso de un tema del hub Theory (local + API). */
export async function saveTeoriaTopicProgress({
  userId,
  accessToken,
  topicHref,
  progresoPct,
}) {
  if (!userId || !topicHref) return;

  const apartado = findTheoryApartadoForTopicHref(topicHref);
  if (!apartado) return;

  writeLocalTeoriaProgreso(userId, topicHref, progresoPct);

  if (!accessToken) return;

  try {
    await fetch('/api/teoria-progreso', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        topic_href: topicHref,
        apartado,
        progreso_pct: progresoPct,
      }),
    });
  } catch {
    /* offline */
  }
}
