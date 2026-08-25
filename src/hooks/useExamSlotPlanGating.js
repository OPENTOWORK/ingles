'use client';

import { useCallback, useMemo, useState } from 'react';
import PlanUpgradeModal from '@/components/subscriptions/PlanUpgradeModal';
import { usePlanEntitlements } from '@/hooks/usePlanEntitlements';
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
  const { applyLimits, maxExamSlot, isExamSlotLocked, refresh } = usePlanEntitlements();
  const [modalState, setModalState] = useState({
    open: false,
    variant: 'locked_slot',
    message: null,
    slot: null,
  });

  const lockedSlots = useMemo(() => {
    if (!applyLimits) return [];
    const slots = [];
    for (let s = maxExamSlot + 1; s <= 5; s += 1) slots.push(s);
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
    (slot) => {
      showPlanUpgradeModal({ variant: 'locked_slot', slot: slot ?? null });
    },
    [showPlanUpgradeModal],
  );

  const guardExamSlotSelect = useCallback(
    async (slot, onAllowed) => {
      const n = Number(slot);
      if (!Number.isFinite(n) || n < 1) return false;

      if (applyLimits && isExamSlotLocked(n)) {
        onLockedSlotClick(n);
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
      onLockedSlotClick,
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
