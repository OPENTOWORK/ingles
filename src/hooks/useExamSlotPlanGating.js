'use client';

import { useCallback, useMemo, useState } from 'react';
import PlanUpgradeModal from '@/components/subscriptions/PlanUpgradeModal';
import { isPlusTierPlanSlug } from '@/data/financialPlanConfig';
import { usePlanEntitlements } from '@/hooks/usePlanEntitlements';
import { B2_EXAM_SLOT_MAX } from '@/lib/b2ExamCatalog';
import { requestStartExamSession } from '@/utils/requestStartExamSession';

function slotHasPriorProgress(progressBySlot, slot) {
  const prog = progressBySlot?.[slot];
  if (!prog) return false;
  return Boolean(
    prog.inProgress ||
      Number(prog.approvedParts) > 0 ||
      Number(prog.stars) > 0 ||
      Number(prog.total) > 0,
  );
}

/**
 * Bloqueo de slots y cuota mensual de exámenes según plan (solo estudiantes).
 * @param {Record<number, object>} progressBySlot
 * @param {{ lang?: 'en' | 'es' }} [options]
 */
export function useExamSlotPlanGating(progressBySlot = {}, { lang = 'en' } = {}) {
  const { applyLimits, maxExamSlot, isExamSlotLocked, refresh, planSlug } = usePlanEntitlements();
  const [modalState, setModalState] = useState({
    open: false,
    variant: 'locked_slot',
    message: null,
    slot: null,
  });

  const lockedSlots = useMemo(() => {
    if (!applyLimits) return [];
    const slots = [];
    for (let s = maxExamSlot + 1; s <= B2_EXAM_SLOT_MAX; s += 1) slots.push(s);
    return slots;
  }, [applyLimits, maxExamSlot]);

  const closePlanUpgradeModal = useCallback(() => {
    setModalState((current) => ({ ...current, open: false }));
  }, []);

  const showPlanUpgradeModal = useCallback((patch) => {
    setModalState((current) => ({
      ...current,
      open: true,
      variant: 'locked_slot',
      message: null,
      slot: null,
      ...patch,
    }));
  }, []);

  const onLockedSlotClick = useCallback(
    (slot, message = null) => {
      showPlanUpgradeModal({ variant: 'locked_slot', slot: slot ?? null, message });
    },
    [showPlanUpgradeModal],
  );

  const guardExamSlotSelect = useCallback(
    async (slot, onAllowed) => {
      const n = Number(slot);
      if (!Number.isFinite(n) || n < 1) return false;

      if (applyLimits && isExamSlotLocked(n)) {
        const isPlus = isPlusTierPlanSlug(planSlug);
        const message = isPlus
          ? lang === 'es'
            ? `Con Plus tienes desbloqueados los exámenes 1–${maxExamSlot}. Cada mes se desbloquean 10 nuevos hasta completar el catálogo. El examen ${n} estará disponible pronto.`
            : `Your Plus plan includes Exams 1–${maxExamSlot}. Ten new exams unlock each month until the full catalogue is available. Exam ${n} will be available soon.`
          : null;
        onLockedSlotClick(n, message);
        return false;
      }

      if (applyLimits) {
        const resuming = slotHasPriorProgress(progressBySlot, n);
        const result = await requestStartExamSession(n, { resuming });
        if (!result.allowed) {
          const variant =
            result.code === 'EXAM_SLOT_LOCKED' || result.code === 'START_EXAM_DENIED'
              ? 'locked_slot'
              : 'quota_exceeded';
          showPlanUpgradeModal({
            variant,
            message: result.message || null,
            slot: n,
          });
          void refresh();
          return false;
        }
        void refresh();
      }

      if (typeof onAllowed === 'function') onAllowed(n);
      return true;
    },
    [
      applyLimits,
      isExamSlotLocked,
      lang,
      maxExamSlot,
      onLockedSlotClick,
      planSlug,
      progressBySlot,
      refresh,
      showPlanUpgradeModal,
    ],
  );

  const wrapSelectHandler = useCallback(
    (handler) => (slot) => {
      void guardExamSlotSelect(slot, (allowedSlot) => handler(allowedSlot));
    },
    [guardExamSlotSelect],
  );

  const planUpgradeModal = (
    <PlanUpgradeModal
      open={modalState.open}
      onClose={closePlanUpgradeModal}
      variant={modalState.variant}
      message={modalState.message}
      slot={modalState.slot}
      lang={lang}
    />
  );

  return {
    applyLimits,
    maxExamSlot,
    lockedSlots,
    onLockedSlotClick,
    guardExamSlotSelect,
    wrapSelectHandler,
    planUpgradeModal,
    pickerPlanProps: { lockedSlots, onLockedSlotClick },
  };
}

export default useExamSlotPlanGating;
