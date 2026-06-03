'use client';

import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/utils/supabaseClient';
import { buildClientApiUrl } from '@/utils/clientApiUrl';
import { userHasRole } from '@/utils/authRoles';
import { getCachedLevelBySlug, getCachedExamenIdsBySlot, invalidateLevelExamCache } from '@/utils/levelsLevelCache';
import { sortLevelsExamenesRows } from '@/utils/b2ResolveExam';
import { A2_EXAM_PARTS } from '@/lib/a2ExamCatalog';
import { B2_EXAM_SLOT_MAX } from '@/lib/b2ExamCatalog';
import { getLevelExamParts, isExamGenerationSlug } from '@/lib/levelsExamCatalog';

/** Slots con examen ya generado en Supabase (ordenados). */
export function getAvailableExamSlots(examenIdBySlot = {}) {
  return Object.entries(examenIdBySlot)
    .filter(([, id]) => Boolean(id))
    .map(([slot]) => Number(slot))
    .filter((n) => Number.isFinite(n) && n > 0)
    .sort((a, b) => a - b);
}

/** Primer slot libre (1…max) para un examen nuevo. */
export function findNextEmptyExamSlot(examenIdBySlot = {}, max = B2_EXAM_SLOT_MAX) {
  for (let s = 1; s <= max; s += 1) {
    if (!examenIdBySlot[s]) return s;
  }
  return null;
}

/** Props del selector: exámenes existentes + botón «Examen nuevo» (solo admin). */
export function buildExamSlotPickerProps({ examenIdBySlot = {}, adminFlow, onSelectSlot }) {
  return {
    availableSlots: getAvailableExamSlots(examenIdBySlot),
    showNewExamButton: Boolean(adminFlow?.canRegenerateExams),
    onNewExam: adminFlow?.canRegenerateExams
      ? () => void adminFlow.handleCreateNewExam(onSelectSlot)
      : undefined,
  };
}

function getPartsForSlug(slug) {
  const key = String(slug || '').toLowerCase();
  if (key === 'a2') return A2_EXAM_PARTS;
  return getLevelExamParts(key) || [];
}

/**
 * Flujo admin: generar examen en Supabase al elegir slot vacío o regenerar.
 * A2: regeneración completa con borrado previo. B1–C2 (incl. B2): solo partes sin contenido (no borra lo existente).
 */

/** Abre el examen elegido sin diálogos de generación (eso va en «Examen nuevo»). */
export function createAdminExamSelectHandler(_adminFlow, onSelectSlot) {
  return (slot) => {
    onSelectSlot(slot);
  };
}
export function useLevelsExamAdminFlow({ slug = 'a2', examenIdBySlot = {}, onCatalogUpdated }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState('');
  const [genProgress, setGenProgress] = useState('');
  const [genStep, setGenStep] = useState(0);
  const [genTotal, setGenTotal] = useState(A2_EXAM_PARTS.length);
  const [genEtaSeconds, setGenEtaSeconds] = useState(null);
  const [genPartLabel, setGenPartLabel] = useState('');

  const examParts = getPartsForSlug(slug);
  const partTotal = examParts.length;
  const levelUpper = String(slug || 'a2').toUpperCase();
  const supportsGeneration = slug === 'a2' || isExamGenerationSlug(slug);
  const canRegenerateExams = isAdmin && supportsGeneration;

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
    async (slot, { force = false, preserveExistingParts = false } = {}) => {
      if (!supportsGeneration) return null;

      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData?.session?.user;
      if (!user?.id) {
        throw new Error('Inicia sesión como administrador.');
      }
      const admin = await userHasRole(user.id, ['admin', 'administrador'], user.email);
      if (!admin) {
        throw new Error('Solo los administradores pueden generar o regenerar exámenes.');
      }

      setGenError('');
      setGenProgress('');
      setGenStep(0);
      setGenEtaSeconds(null);
      setGenPartLabel('');
      setGenTotal(partTotal);
      setGenerating(true);

      const partDurations = [];

      try {
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
          if (delRes.status === 403) {
            throw new Error(delPayload.error || 'Solo los administradores pueden generar o regenerar exámenes.');
          }
          if (!delRes.ok) {
            throw new Error(delPayload.error || 'No se pudo borrar el examen anterior en Supabase.');
          }
          levelId = delPayload.levelId || levelId;
        }

        for (let i = 0; i < examParts.length; i += 1) {
          const partDef = examParts[i];
          const partNumber = partDef.partNumber;
          setGenStep(i + 1);
          setGenPartLabel(partDef.title || partDef.section || `Part ${partNumber}`);
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
              preserveExistingParts,
            }),
          });
          const payload = await res.json().catch(() => ({}));
          if (res.status === 403) {
            throw new Error(payload.error || 'Solo los administradores pueden generar o regenerar exámenes.');
          }
          if (!res.ok) throw new Error(payload.error || `Error en parte ${partNumber}.`);

          levelId = payload.levelId || levelId;
          if (!payload.skipped) partDurations.push(Date.now() - t0);

          const remaining = examParts.length - (i + 1);
          if (remaining > 0 && partDurations.length > 0) {
            const avgMs = partDurations.reduce((sum, ms) => sum + ms, 0) / partDurations.length;
            setGenEtaSeconds(Math.ceil((avgMs * remaining) / 1000));
          } else {
            setGenEtaSeconds(0);
          }
        }

        if (levelId) invalidateLevelExamCache(levelId);
        setGenError('');
        const msg =
          preserveExistingParts && !force
            ? `Examen ${levelUpper} actualizado (solo partes sin contenido; ${partTotal} partes en el formato del nivel).`
            : `Examen guardado en Supabase (${partTotal} partes).`;
        setGenProgress(msg);
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
    [slug, onCatalogUpdated, examParts, partTotal, levelUpper, supportsGeneration],
  );

  const handleAdminExamSelect = useCallback((slot, onSelectSlot) => {
    onSelectSlot(slot);
  }, []);

  const handleCreateNewExam = useCallback(
    async (onSelectSlot) => {
      if (!canRegenerateExams) return;

      const targetSlot = findNextEmptyExamSlot(examenIdBySlot);
      if (!targetSlot) {
        window.alert(
          `Ya hay ${B2_EXAM_SLOT_MAX} exámenes ${levelUpper}. No se pueden crear más desde aquí.`,
        );
        return;
      }

      const ok = window.confirm(
        `¿Generar ${levelUpper} Examen ${targetSlot} con DRALO AI?\n\n${partTotal} partes; suele tardar varios minutos.`,
      );
      if (!ok) return;

      try {
        await generateExam(targetSlot, { preserveExistingParts: false });
        onSelectSlot(targetSlot);
      } catch {
        /* genError shown in UI */
      }
    },
    [canRegenerateExams, examenIdBySlot, generateExam, partTotal, levelUpper],
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
    handleCreateNewExam,
    supportsGeneration,
    /** true solo para rol admin/administrador en niveles con generación (A2–C2) */
    canRegenerateExams,
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
