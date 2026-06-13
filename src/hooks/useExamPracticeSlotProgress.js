'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabaseClient';
import { getSessionUserId } from '@/utils/levelsEstadisticas';
import { fetchExamModeSlotStats } from '@/lib/fetchExamModeSlotStats';

function aggregateEstadisticasByPart(puntuaciones, estadisticas) {
  const preguntaToPart = new Map();
  for (const row of puntuaciones || []) {
    if (row.id_pregunta && row.parte_numero) {
      preguntaToPart.set(row.id_pregunta, Number(row.parte_numero));
    }
  }

  const byPart = {};

  for (const est of estadisticas || []) {
    const part = preguntaToPart.get(est.pregunta_id);
    if (!part) continue;
    if (!byPart[part]) {
      byPart[part] = {
        accesos: 0,
        intentos: 0,
        evaluadas: 0,
        correctas: 0,
        mejorPct: null,
      };
    }
    const bucket = byPart[part];
    bucket.accesos += Number(est.accesos) || 0;
    bucket.intentos += Number(est.intentos_completados) || 0;
    bucket.evaluadas += Number(est.respuestas_evaluadas) || 0;
    bucket.correctas += Number(est.respuestas_correctas) || 0;
    const mejor = est.mejor_porcentaje != null ? Number(est.mejor_porcentaje) : null;
    if (mejor != null) {
      bucket.mejorPct = bucket.mejorPct == null ? mejor : Math.max(bucket.mejorPct, mejor);
    }
  }

  return byPart;
}

/**
 * Carga levels_estadisticas del examen activo (complementa progressBySlot de levels_puntuaciones).
 */
export function useExamPracticeSlotProgress({ slug, examSlot, enabled = true }) {
  const [signedIn, setSignedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [estadisticasByPart, setEstadisticasByPart] = useState({});

  useEffect(() => {
    if (!enabled || !slug || !examSlot) {
      setEstadisticasByPart({});
      setSignedIn(false);
      return;
    }

    let cancelled = false;

    (async () => {
      setLoading(true);
      try {
        const uid = await getSessionUserId();
        if (cancelled) return;
        setSignedIn(Boolean(uid));
        if (!uid) {
          setEstadisticasByPart({});
          return;
        }

        const { puntuaciones, estadisticas } = await fetchExamModeSlotStats(supabase, {
          userId: uid,
          slug,
          examSlot,
        });
        if (cancelled) return;
        setEstadisticasByPart(aggregateEstadisticasByPart(puntuaciones, estadisticas));
      } catch (err) {
        console.warn('[useExamPracticeSlotProgress]', err);
        if (!cancelled) setEstadisticasByPart({});
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [slug, examSlot, enabled]);

  return { signedIn, loading, estadisticasByPart };
}
