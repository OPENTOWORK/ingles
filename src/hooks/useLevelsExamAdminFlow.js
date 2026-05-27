'use client';

import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/utils/supabaseClient';
import { buildClientApiUrl } from '@/utils/clientApiUrl';
import { userHasRole } from '@/utils/authRoles';
import { getCachedLevelBySlug, getCachedExamenIdsBySlot, invalidateLevelExamCache } from '@/utils/levelsLevelCache';
import { sortLevelsExamenesRows } from '@/utils/b2ResolveExam';
import { A2_EXAM_PARTS } from '@/lib/a2ExamCatalog';

const A2_PART_TOTAL = A2_EXAM_PARTS.length;

/**
 * Flujo admin: generar examen A2 en Supabase al elegir slot vacío.
 */
export function useLevelsExamAdminFlow({ slug = 'a2', examenIdBySlot = {}, onCatalogUpdated }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState('');
  const [genProgress, setGenProgress] = useState('');
  const [genStep, setGenStep] = useState(0);
  const [genTotal, setGenTotal] = useState(A2_PART_TOTAL);
  const [genEtaSeconds, setGenEtaSeconds] = useState(null);
  const [genPartLabel, setGenPartLabel] = useState('');

  useEffect(() => {
    void (async () => {
      const { data } = await supabase.auth.getSession();
      const user = data?.session?.user;
      if (!user?.id) {
        setIsAdmin(false);
        return;
      }
      const admin = await userHasRole(user.id, ['admin', 'administrador'], user.email);
      setIsAdmin(admin);
    })();
  }, []);

  const slotHasContent = useCallback((slot) => Boolean(examenIdBySlot?.[slot]), [examenIdBySlot]);

  const generateExam = useCallback(
    async (slot, { force = false } = {}) => {
      setGenError('');
      setGenProgress('');
      setGenStep(0);
      setGenEtaSeconds(null);
      setGenPartLabel('');
      setGenTotal(A2_PART_TOTAL);
      setGenerating(true);

      const partDurations = [];

      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const token = sessionData?.session?.access_token;
        if (!token) throw new Error('Inicia sesión como administrador.');

        let levelId = null;

        if (force) {
          const delRes = await fetch(buildClientApiUrl('/api/admin/levels/generate-exam'), {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ slug, slot, resetExam: true }),
          });
          const delPayload = await delRes.json().catch(() => ({}));
          if (!delRes.ok) {
            throw new Error(delPayload.error || 'No se pudo borrar el examen anterior en Supabase.');
          }
          levelId = delPayload.levelId || levelId;
        }

        for (let i = 0; i < A2_EXAM_PARTS.length; i += 1) {
          const partDef = A2_EXAM_PARTS[i];
          const partNumber = partDef.partNumber;
          setGenStep(i + 1);
          setGenPartLabel(partDef.title || `Part ${partNumber}`);
          setGenEtaSeconds(null);

          const t0 = Date.now();
          const res = await fetch(buildClientApiUrl('/api/admin/levels/generate-exam'), {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              slug,
              slot,
              partNumber,
            }),
          });
          const payload = await res.json().catch(() => ({}));
          if (!res.ok) throw new Error(payload.error || `Error en parte ${partNumber}.`);

          levelId = payload.levelId || levelId;
          partDurations.push(Date.now() - t0);

          const remaining = A2_EXAM_PARTS.length - (i + 1);
          if (remaining > 0 && partDurations.length > 0) {
            const avgMs =
              partDurations.reduce((sum, ms) => sum + ms, 0) / partDurations.length;
            setGenEtaSeconds(Math.ceil((avgMs * remaining) / 1000));
          } else {
            setGenEtaSeconds(0);
          }
        }

        if (levelId) invalidateLevelExamCache(levelId);
        setGenError('');
        setGenProgress('Examen guardado en Supabase (14 partes).');
        onCatalogUpdated?.();
        return { created: true, examSlot: slot, levelId };
      } catch (e) {
        const msg = e?.message || 'No se pudo generar el examen.';
        setGenProgress('');
        setGenError(msg);
        throw e;
      } finally {
        setGenerating(false);
        setGenEtaSeconds(null);
        setGenPartLabel('');
      }
    },
    [slug, onCatalogUpdated],
  );

  const handleAdminExamSelect = useCallback(
    async (slot, onSelectSlot) => {
      if (!isAdmin) {
        onSelectSlot(slot);
        return;
      }

      if (!slotHasContent(slot)) {
        const ok = window.confirm(
          `El Examen ${slot} ${slug.toUpperCase()} aún no existe en Supabase.\n\n¿Generarlo ahora con DRALO AI? (14 partes; suele tardar varios minutos)`,
        );
        if (!ok) return;
        try {
          await generateExam(slot);
          onSelectSlot(slot);
        } catch {
          /* genError shown in UI */
        }
        return;
      }

      if (slug === 'a2') {
        const regen = window.confirm(
          `El Examen ${slot} ya existe.\n\n¿Regenerarlo completo con DRALO AI?\n\nSe borrará todo el contenido actual de este examen en Supabase y se crearán de nuevo las 14 partes (varios minutos).`,
        );
        if (!regen) {
          onSelectSlot(slot);
          return;
        }
        try {
          await generateExam(slot, { force: true });
          onSelectSlot(slot);
        } catch {
          /* genError shown in UI */
        }
        return;
      }

      onSelectSlot(slot);
    },
    [isAdmin, slotHasContent, generateExam, slug],
  );

  const clearGenError = useCallback(() => {
    setGenError('');
  }, []);

  return {
    isAdmin,
    generating,
    genError,
    genProgress,
    genStep,
    genTotal,
    genEtaSeconds,
    genPartLabel,
    clearGenError,
    slotHasContent,
    generateExam,
    handleAdminExamSelect,
  };
}

export async function reloadExamNamesBySlot(slug) {
  const names = Object.fromEntries([1, 2, 3, 4, 5].map((s) => [s, `Examen ${s}`]));
  const ids = {};
  try {
    const { data: levelData } = await getCachedLevelBySlug(supabase, slug);
    if (!levelData?.id) return { names, ids };
    const { data } = await supabase
      .from('levels_examenes')
      .select('id, nombre')
      .eq('level_id', levelData.id);
    const ordered = sortLevelsExamenesRows(data);
    const idsBySlot = await getCachedExamenIdsBySlot(supabase, levelData.id);
    Object.assign(ids, idsBySlot);
    Object.entries(idsBySlot).forEach(([slot, id]) => {
      const row = ordered.find((r) => r.id === id);
      names[Number(slot)] = row?.nombre?.trim() || `Examen ${slot}`;
    });
  } catch {
    /* defaults */
  }
  return { names, ids };
}
