export const EXAM_MODE_SECTION_DRAFT_VERSION = 1;

/**
 * @typedef {object} ExamModeSectionDraft
 * @property {number} version
 * @property {Record<number, object>} [draftByPart]
 * @property {Record<string, number>} [selectedQuestionByPart]
 * @property {number|null} [activePartNumber]
 * @property {string|null} [activePartId]
 * @property {number|null} [remainingSeconds]
 * @property {Record<string, string>} [localStorageSnapshots]
 * @property {{ correct: number, total: number, byPart?: Record<number, object>, scoringVersion?: number }|null} [scorePreview]
 */

export function buildExamModeSectionDraft({
  draftByPart = {},
  selectedQuestionByPart = {},
  activePartNumber = null,
  activePartId = null,
  remainingSeconds = null,
  localStorageSnapshots = null,
  currentPartSnapshot = null,
  scorePreview = null,
}) {
  const byPart = { ...draftByPart };
  if (currentPartSnapshot?.partNumber != null) {
    byPart[currentPartSnapshot.partNumber] = currentPartSnapshot.snapshot;
  }

  /** @type {ExamModeSectionDraft} */
  const draft = {
    version: EXAM_MODE_SECTION_DRAFT_VERSION,
    draftByPart: byPart,
    selectedQuestionByPart: { ...selectedQuestionByPart },
    activePartNumber,
    activePartId,
    remainingSeconds,
  };

  if (localStorageSnapshots && Object.keys(localStorageSnapshots).length > 0) {
    draft.localStorageSnapshots = { ...localStorageSnapshots };
  }

  if (scorePreview) {
    draft.scorePreview = scorePreview;
  }

  return draft;
}

export function collectLocalStorageSnapshots(keys = []) {
  if (typeof window === 'undefined') return {};
  const out = {};
  for (const key of keys) {
    if (!key) continue;
    try {
      const value = localStorage.getItem(key);
      if (value != null) out[key] = value;
    } catch {
      /* ignore */
    }
  }
  return out;
}

export function applyLocalStorageSnapshots(snapshots = {}) {
  if (typeof window === 'undefined') return;
  for (const [key, value] of Object.entries(snapshots)) {
    try {
      if (value == null || value === '') localStorage.removeItem(key);
      else localStorage.setItem(key, value);
    } catch {
      /* ignore */
    }
  }
}

export function revertLocalStorageSnapshots(savedSnapshots = {}, currentKeys = []) {
  if (typeof window === 'undefined') return;
  const saved = savedSnapshots || {};
  const keys = new Set([...Object.keys(saved), ...currentKeys.filter(Boolean)]);
  for (const key of keys) {
    try {
      if (Object.prototype.hasOwnProperty.call(saved, key)) {
        const value = saved[key];
        if (value == null || value === '') localStorage.removeItem(key);
        else localStorage.setItem(key, value);
      } else {
        localStorage.removeItem(key);
      }
    } catch {
      /* ignore */
    }
  }
}

export function resolvePartIdByNumber(partsData = [], partNumber) {
  if (!partNumber || !partsData?.length) return null;
  const part = partsData.find((p) => Number(p.nombre?.match(/\d+/)?.[0] || 0) === partNumber);
  return part?.id ?? null;
}

export function resolveActivePartNumberFromDraft(draft, partsData = []) {
  if (!draft) return null;
  if (draft.activePartNumber) return Number(draft.activePartNumber);
  if (draft.activePartId) {
    const part = partsData.find((p) => p.id === draft.activePartId);
    return Number(part?.nombre?.match(/\d+/)?.[0] || 0) || null;
  }
  return null;
}

/** Initial part/question selection when reloading exam content with a saved draft. */
export function resolveInitialExamPartSelection(normalizedParts = [], sectionDraft) {
  if (!sectionDraft || sectionDraft.version !== EXAM_MODE_SECTION_DRAFT_VERSION) {
    return null;
  }
  const selectedPartId =
    sectionDraft.activePartId ||
    resolvePartIdByNumber(normalizedParts, sectionDraft.activePartNumber) ||
    normalizedParts[0]?.id ||
    null;

  const selectedQuestionByPart = { ...(sectionDraft.selectedQuestionByPart || {}) };

  const activePartNumber = resolveActivePartNumberFromDraft(sectionDraft, normalizedParts);
  const partDraft = activePartNumber ? sectionDraft.draftByPart?.[activePartNumber] : null;
  if (partDraft?.preguntaId && selectedPartId) {
    selectedQuestionByPart[selectedPartId] = partDraft.preguntaId;
  }

  return { selectedPartId, selectedQuestionByPart };
}

export function applyReadingStyleSectionDraft(
  draft,
  {
    examDraftRef,
    setSelectedQuestionByPart,
    setSelectedPartId,
    partsData,
    setAnswerState,
  },
) {
  if (!draft || draft.version !== EXAM_MODE_SECTION_DRAFT_VERSION) return { applied: false, activePartNumber: null };

  examDraftRef.current = { ...(draft.draftByPart || {}) };

  if (draft.selectedQuestionByPart && setSelectedQuestionByPart) {
    setSelectedQuestionByPart(draft.selectedQuestionByPart);
  }

  const activePartNumber = resolveActivePartNumberFromDraft(draft, partsData);

  if (draft.activePartId && setSelectedPartId) {
    setSelectedPartId(draft.activePartId);
  } else if (activePartNumber && setSelectedPartId) {
    const partId = resolvePartIdByNumber(partsData, activePartNumber);
    if (partId) setSelectedPartId(partId);
  }

  if (draft.localStorageSnapshots) {
    applyLocalStorageSnapshots(draft.localStorageSnapshots);
  }

  const partDraft = activePartNumber ? examDraftRef.current[activePartNumber] : null;
  if (partDraft?.preguntaId && setSelectedQuestionByPart) {
    const partId =
      draft.activePartId || resolvePartIdByNumber(partsData, activePartNumber);
    if (partId) {
      setSelectedQuestionByPart((prev) => ({
        ...prev,
        ...(draft.selectedQuestionByPart || {}),
        [partId]: partDraft.preguntaId,
      }));
    }
  }

  if (partDraft && typeof setAnswerState === 'function') {
    setAnswerState({
      selectedOptions: partDraft.selectedOptions || {},
      openInputs: partDraft.openInputs || {},
      checkedQuestions: partDraft.checkedQuestions || {},
    });
  }

  return { applied: true, activePartNumber: activePartNumber || null };
}
