'use client';

import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/utils/supabaseClient';
import { buildClientApiUrl } from '@/utils/clientApiUrl';
import { userHasRole } from '@/utils/authRoles';
import { getCachedLevelBySlug, getCachedExamenIdsBySlot, invalidateLevelExamCache } from '@/utils/levelsLevelCache';
import { sortLevelsExamenesRows } from '@/utils/b2ResolveExam';
import { filterVisibleExamenes, findDraftExamSlots } from '@/utils/levelsExamVisibility';
import { notifyLevelsExamRegenerated } from '@/utils/levelsExamRegenerationSync';
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

/**
 * Primer slot libre (1…max) para un examen nuevo.
 * Los slots ocupados por exámenes draft (modelo='draft') NUNCA cuentan como
 * libres aunque el catálogo filtrado no los muestre: crear ahí pisaría el borrador.
 */
export function findNextEmptyExamSlot(examenIdBySlot = {}, max = B2_EXAM_SLOT_MAX, draftSlots = new Set()) {
  for (let s = 1; s <= max; s += 1) {
    if (!examenIdBySlot[s] && !draftSlots.has(s)) return s;
  }
  return null;
}

/**
 * Slots reservados por exámenes draft del nivel (consulta sin filtrar:
 * los slots son posicionales sobre la lista completa).
 * @returns {Promise<Set<number>>}
 */
export async function fetchDraftExamSlots(slug) {
  try {
    const { data: levelData } = await getCachedLevelBySlug(supabase, slug);
    if (!levelData?.id) return new Set();
    const { data } = await supabase
      .from('levels_examenes')
      .select('id, nombre, modelo')
      .eq('level_id', levelData.id);
    return findDraftExamSlots(sortLevelsExamenesRows(data));
  } catch {
    return new Set();
  }
}

/** Props del selector: exámenes existentes + botón «Examen nuevo» (solo admin). */
export function buildExamSlotPickerProps({ examenIdBySlot = {}, adminFlow, onSelectSlot }) {
  const canAdmin = Boolean(adminFlow?.canRegenerateExams);
  return {
    availableSlots: getAvailableExamSlots(examenIdBySlot),
    showNewExamButton: canAdmin,
    onNewExam: canAdmin ? () => void adminFlow.handleCreateNewExam(onSelectSlot) : undefined,
    showAdminMenu: canAdmin,
    onRegenerateExam: canAdmin ? (slot) => void adminFlow.handleRegenerateExam(slot) : undefined,
    onDeleteExam: canAdmin ? (slot) => void adminFlow.handleDeleteExam(slot) : undefined,
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
  const [partPreviewLoading, setPartPreviewLoading] = useState(false);
  const [partPreviewSaving, setPartPreviewSaving] = useState(false);
  const [partPreview, setPartPreview] = useState(null);

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

      // Protección de borradores: nunca generar/regenerar encima de un slot draft
      // desde el flujo admin (los drafts se gestionan solo con scripts manuales).
      const draftSlots = await fetchDraftExamSlots(slug);
      if (draftSlots.has(Number(slot))) {
        throw new Error(
          `El Examen ${slot} ${levelUpper} está reservado como borrador interno (draft). ` +
            'No se puede generar ni regenerar desde aquí; usa los scripts de generación de exámenes.',
        );
      }

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

        let anyPartWritten = false;

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

          if (!payload.skipped) {
            anyPartWritten = true;
            partDurations.push(Date.now() - t0);
          }

          levelId = payload.levelId || levelId;

          const remaining = examParts.length - (i + 1);
          if (remaining > 0 && partDurations.length > 0) {
            const avgMs = partDurations.reduce((sum, ms) => sum + ms, 0) / partDurations.length;
            setGenEtaSeconds(Math.ceil((avgMs * remaining) / 1000));
          } else {
            setGenEtaSeconds(0);
          }
        }

        if (levelId) invalidateLevelExamCache(levelId);
        if (force || anyPartWritten) {
          notifyLevelsExamRegenerated({ slug, examSlot: slot });
        }
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

      const draftSlots = await fetchDraftExamSlots(slug);
      const targetSlot = findNextEmptyExamSlot(examenIdBySlot, B2_EXAM_SLOT_MAX, draftSlots);
      if (!targetSlot) {
        const draftNote = draftSlots.size
          ? ` (slots ${[...draftSlots].sort((a, b) => a - b).join(', ')} reservados como borrador)`
          : '';
        window.alert(
          `No hay slots libres para un examen ${levelUpper} nuevo${draftNote}. No se pueden crear más desde aquí.`,
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
    [canRegenerateExams, examenIdBySlot, generateExam, partTotal, levelUpper, slug],
  );

  const deleteExam = useCallback(
    async (slot) => {
      if (!supportsGeneration) return null;

      const draftSlots = await fetchDraftExamSlots(slug);
      if (draftSlots.has(Number(slot))) {
        throw new Error(
          `El Examen ${slot} ${levelUpper} está reservado como borrador interno (draft) y no puede eliminarse desde aquí.`,
        );
      }

      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData?.session?.user;
      if (!user?.id) {
        throw new Error('Inicia sesión como administrador.');
      }
      const admin = await userHasRole(user.id, ['admin', 'administrador'], user.email);
      if (!admin) {
        throw new Error('Solo los administradores pueden eliminar exámenes.');
      }

      setGenError('');
      setGenProgress('');

      const token = sessionData?.session?.access_token;
      if (!token) throw new Error('Inicia sesión como administrador.');

      const delRes = await fetch(buildClientApiUrl('/api/admin/levels/generate-exam'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ slug, slot, deleteExam: true }),
      });
      const delPayload = await delRes.json().catch(() => ({}));
      if (delRes.status === 403) {
        throw new Error(delPayload.error || 'Solo los administradores pueden eliminar exámenes.');
      }
      if (!delRes.ok) {
        throw new Error(delPayload.error || 'No se pudo eliminar el examen en Supabase.');
      }

      const levelId = delPayload.levelId;
      if (levelId) invalidateLevelExamCache(levelId);
      notifyLevelsExamRegenerated({ slug, examSlot: slot });
      onCatalogUpdated?.();
      return { deleted: true, examSlot: slot, levelId };
    },
    [slug, onCatalogUpdated, supportsGeneration, levelUpper],
  );

  const handleRegenerateExam = useCallback(
    async (slot) => {
      if (!canRegenerateExams) return;

      const ok = window.confirm(
        `¿Regenerar ${levelUpper} Examen ${slot} con DRALO AI?\n\nSe borrará el contenido actual y se generará de nuevo (${partTotal} partes; suele tardar varios minutos).`,
      );
      if (!ok) return;

      try {
        await generateExam(slot, { force: true, preserveExistingParts: false });
      } catch {
        /* genError shown in UI */
      }
    },
    [canRegenerateExams, generateExam, partTotal, levelUpper],
  );

  const handleDeleteExam = useCallback(
    async (slot) => {
      if (!canRegenerateExams) return;

      const ok = window.confirm(
        `¿Eliminar ${levelUpper} Examen ${slot}?\n\nSe borrará todo el contenido del examen en Supabase. Esta acción no se puede deshacer.`,
      );
      if (!ok) return;

      try {
        await deleteExam(slot);
        setGenError('');
        setGenProgress(`Examen ${slot} eliminado.`);
      } catch (e) {
        setGenProgress('');
        setGenError(e?.message || 'No se pudo eliminar el examen.');
      }
    },
    [canRegenerateExams, deleteExam],
  );

  const clearGenError = useCallback(() => {
    setGenError('');
  }, []);

  const cancelPartPreview = useCallback(() => {
    setPartPreview(null);
    setPartPreviewLoading(false);
    setPartPreviewSaving(false);
  }, []);

  const previewExamPart = useCallback(
    async (slot, partNumber) => {
      if (!supportsGeneration || !canRegenerateExams) return null;

      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      if (!token) throw new Error('Inicia sesión como administrador.');

      setPartPreviewLoading(true);
      setPartPreview({
        partNumber,
        loading: true,
        partLabel: '',
        validation: null,
        payload: null,
        enunciadoPreview: '',
        error: '',
      });
      setGenError('');

      try {
        const res = await fetch(buildClientApiUrl('/api/admin/levels/generate-exam-part'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            slug,
            slot,
            partNumber,
            action: 'preview',
          }),
        });
        const payload = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(payload.error || 'No se pudo generar la vista previa.');

        const preview = payload.preview || {};
        setPartPreview({
          partNumber: preview.partNumber ?? partNumber,
          partTitle: preview.partTitle,
          partLabel: preview.partLabel || preview.partTitle,
          loading: false,
          validation: preview.validation,
          payload: preview.payload,
          enunciadoPreview: preview.enunciadoPreview,
          error: '',
          examSlot: slot,
        });
        return preview;
      } catch (e) {
        const msg = e?.message || 'No se pudo generar la vista previa.';
        setPartPreview((prev) =>
          prev
            ? { ...prev, loading: false, error: msg }
            : { partNumber, loading: false, error: msg },
        );
        setGenError(msg);
        throw e;
      } finally {
        setPartPreviewLoading(false);
      }
    },
    [slug, supportsGeneration, canRegenerateExams],
  );

  const saveExamPart = useCallback(async () => {
    if (!partPreview?.payload || !partPreview?.examSlot) return null;
    if (!partPreview.validation?.ok) {
      throw new Error('Corrige los errores de validación antes de guardar.');
    }

    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData?.session?.access_token;
    if (!token) throw new Error('Inicia sesión como administrador.');

    setPartPreviewSaving(true);
    setGenError('');

    try {
      const res = await fetch(buildClientApiUrl('/api/admin/levels/generate-exam-part'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          slug,
          slot: partPreview.examSlot,
          partNumber: partPreview.partNumber,
          action: 'save',
          generated: partPreview.payload,
        }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(payload.error || 'No se pudo guardar la parte.');

      if (payload.levelId) invalidateLevelExamCache(payload.levelId);
      notifyLevelsExamRegenerated({ slug, examSlot: partPreview.examSlot });
      setGenProgress(
        `Parte ${partPreview.partLabel || partPreview.partNumber} guardada en Supabase.`,
      );
      cancelPartPreview();
      onCatalogUpdated?.();
      return payload;
    } catch (e) {
      const msg = e?.message || 'No se pudo guardar la parte.';
      setGenError(msg);
      throw e;
    } finally {
      setPartPreviewSaving(false);
    }
  }, [slug, partPreview, cancelPartPreview, onCatalogUpdated]);

  const adminPartFlow = {
    canRegenerateExams,
    partPreview,
    partPreviewLoading,
    partPreviewSaving,
    previewExamPart,
    saveExamPart,
    cancelPartPreview,
  };

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
    deleteExam,
    handleAdminExamSelect,
    handleCreateNewExam,
    handleRegenerateExam,
    handleDeleteExam,
    supportsGeneration,
    /** true solo para rol admin/administrador en niveles con generación (A2–C2) */
    canRegenerateExams,
    adminPartFlow,
    previewExamPart,
    saveExamPart,
    cancelPartPreview,
    partPreview,
    partPreviewLoading,
    partPreviewSaving,
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
      .select('id, nombre, modelo')
      .eq('level_id', levelData.id);
    const ordered = sortLevelsExamenesRows(filterVisibleExamenes(data));
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
