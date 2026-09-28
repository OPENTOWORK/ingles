'use client';

import { useCallback, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import PlanUpgradeModal from '@/components/subscriptions/PlanUpgradeModal';
import { isPlusTierPlanSlug } from '@/data/financialPlanConfig';
import { usePlanEntitlements } from '@/hooks/usePlanEntitlements';
import { useUserRole } from '@/context/UserRoleContext';
import { B2_EXAM_SLOT_MAX } from '@/lib/b2ExamCatalog';
import { getGuestRegisterHref, isGuestExamSlotAllowed } from '@/lib/guestPreviewAccess';
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
 * El aviso de plan se muestra siempre en español.
 */
export function useExamSlotPlanGating(progressBySlot = {}) {
  const { applyLimits, maxExamSlot, isExamSlotLocked, refresh, planSlug } = usePlanEntitlements();
  const { session } = useUserRole();
  const isGuest = !session;
  const router = useRouter();
  const pathname = usePathname();
  const guestMaxExamSlot = 1;
  const effectiveApplyLimits = applyLimits || isGuest;
  const effectiveMaxExamSlot = isGuest ? guestMaxExamSlot : maxExamSlot;
  const [modalState, setModalState] = useState({
    open: false,
    variant: 'locked_slot',
    message: null,
    slot: null,
  });

  const lockedSlots = useMemo(() => {
    if (!effectiveApplyLimits) return [];
    const slots = [];
    for (let s = effectiveMaxExamSlot + 1; s <= B2_EXAM_SLOT_MAX; s += 1) slots.push(s);
    return slots;
  }, [effectiveApplyLimits, effectiveMaxExamSlot]);

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
      if (isGuest) {
        router.push(getGuestRegisterHref(pathname || '/exam-practice/b2/'));
        return;
      }
      showPlanUpgradeModal({ variant: 'locked_slot', slot: slot ?? null, message });
    },
    [isGuest, pathname, router, showPlanUpgradeModal],
  );

  const guardExamSlotSelect = useCallback(
    async (slot, onAllowed) => {
      const n = Number(slot);
      if (!Number.isFinite(n) || n < 1) return false;

      if (isGuest && !isGuestExamSlotAllowed(n)) {
        onLockedSlotClick(n);
        return false;
      }

      if (applyLimits && isExamSlotLocked(n)) {
        const isPlus = isPlusTierPlanSlug(planSlug);
        const message = isPlus
          ? `Con Plus tienes desbloqueados los exámenes 1–${maxExamSlot}. Cada mes se desbloquean 10 nuevos hasta completar el catálogo. El examen ${n} estará disponible pronto.`
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
      isGuest,
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
      lang="es"
    />
  );

  return {
    applyLimits: effectiveApplyLimits,
    maxExamSlot: effectiveMaxExamSlot,
    planSlug,
    lockedSlots,
    onLockedSlotClick,
    guardExamSlotSelect,
    wrapSelectHandler,
    planUpgradeModal,
    pickerPlanProps: { lockedSlots, onLockedSlotClick },
  };
}

export default useExamSlotPlanGating;
