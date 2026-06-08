'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { B2_EXAM_SLOT_MAX } from '@/utils/b2ResolveExam';

const SLOT_MENU_MIN_WIDTH = 168;

function StarIcon({ state }) {
  const isFull = state === 'full';
  const isHalf = state === 'half';
  const color = isFull || isHalf ? '#ca8a04' : '#cbd5e1';

  if (isHalf) {
    return (
      <span
        style={{
          position: 'relative',
          display: 'inline-block',
          width: '1em',
          height: '1em',
          fontSize: '0.9rem',
          lineHeight: 1,
        }}
      >
        <span style={{ color: '#cbd5e1' }}>★</span>
        <span
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: '50%',
            overflow: 'hidden',
            color: '#ca8a04',
          }}
        >
          ★
        </span>
      </span>
    );
  }

  return (
    <span style={{ color, fontSize: '0.9rem' }}>
      ★
    </span>
  );
}

function StarRow({ filled = 0, max = 3 }) {
  const value = Math.min(max, Math.max(0, Number(filled) || 0));

  return (
    <div
      aria-hidden
      style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '0.15rem',
        marginTop: '0.3rem',
        alignItems: 'center',
      }}
    >
      {Array.from({ length: max }, (_, i) => {
        const remainder = value - i;
        let state = 'empty';
        if (remainder >= 1) state = 'full';
        else if (remainder >= 0.5) state = 'half';
        return <StarIcon key={i} state={state} />;
      })}
    </div>
  );
}

function ExamSlotMenu({
  slot,
  active,
  lang,
  onViewStatistics,
  onRepeatExam,
  onRegenerate,
  onDelete,
  showAdminActions,
  open,
  onToggle,
}) {
  const menuRef = useRef(null);
  const triggerRef = useRef(null);
  const dropdownRef = useRef(null);
  const [dropdownStyle, setDropdownStyle] = useState(null);
  const en = lang === 'en';

  const updateDropdownPosition = () => {
    const trigger = triggerRef.current;
    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();
    const viewportPadding = 8;
    let left = rect.right - SLOT_MENU_MIN_WIDTH;

    if (left < viewportPadding) {
      left = viewportPadding;
    } else if (left + SLOT_MENU_MIN_WIDTH > window.innerWidth - viewportPadding) {
      left = window.innerWidth - SLOT_MENU_MIN_WIDTH - viewportPadding;
    }

    setDropdownStyle({
      top: rect.bottom + 6,
      left,
      minWidth: SLOT_MENU_MIN_WIDTH,
    });
  };

  useEffect(() => {
    if (!open) {
      setDropdownStyle(null);
      return undefined;
    }

    updateDropdownPosition();
    window.addEventListener('resize', updateDropdownPosition);
    window.addEventListener('scroll', updateDropdownPosition, true);

    return () => {
      window.removeEventListener('resize', updateDropdownPosition);
      window.removeEventListener('scroll', updateDropdownPosition, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;

    const handlePointerDown = (event) => {
      const target = event.target;
      if (menuRef.current?.contains(target)) return;
      if (dropdownRef.current?.contains(target)) return;
      onToggle(false);
    };

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [open, onToggle]);

  const dropdown =
    open && dropdownStyle && typeof document !== 'undefined'
      ? createPortal(
          <div
            ref={dropdownRef}
            className="levels-b2-exam-picker__slot-menu-dropdown levels-b2-exam-picker__slot-menu-dropdown--portal"
            style={dropdownStyle}
            role="menu"
          >
            {onViewStatistics ? (
              <button
                type="button"
                role="menuitem"
                className="levels-b2-exam-picker__slot-menu-item"
                onClick={(event) => {
                  event.stopPropagation();
                  onToggle(false);
                  onViewStatistics(slot);
                }}
              >
                {en ? 'Statistics' : 'Estadísticas'}
              </button>
            ) : null}
            {onRepeatExam ? (
              <button
                type="button"
                role="menuitem"
                className="levels-b2-exam-picker__slot-menu-item"
                onClick={(event) => {
                  event.stopPropagation();
                  onToggle(false);
                  onRepeatExam(slot);
                }}
              >
                {en ? 'Repeat' : 'Repetir'}
              </button>
            ) : null}
            {showAdminActions && onRegenerate ? (
              <button
                type="button"
                role="menuitem"
                className="levels-b2-exam-picker__slot-menu-item levels-b2-exam-picker__slot-menu-item--admin"
                onClick={(event) => {
                  event.stopPropagation();
                  onToggle(false);
                  onRegenerate(slot);
                }}
              >
                {en ? 'Regenerate with AI' : 'Regenerar con IA'}
              </button>
            ) : null}
            {showAdminActions && onDelete ? (
              <button
                type="button"
                role="menuitem"
                className="levels-b2-exam-picker__slot-menu-item levels-b2-exam-picker__slot-menu-item--danger"
                onClick={(event) => {
                  event.stopPropagation();
                  onToggle(false);
                  onDelete(slot);
                }}
              >
                {en ? 'Delete' : 'Eliminar'}
              </button>
            ) : null}
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <div
        ref={menuRef}
        className={`levels-b2-exam-picker__slot-menu${active ? ' levels-b2-exam-picker__slot-menu--active' : ''}`}
      >
        <button
          ref={triggerRef}
          type="button"
          className="levels-b2-exam-picker__slot-menu-trigger"
          aria-label={en ? `Exam ${slot} options` : `Opciones del examen ${slot}`}
          aria-expanded={open}
          aria-haspopup="menu"
          onClick={(event) => {
            event.stopPropagation();
            onToggle(!open);
          }}
        >
          ⋮
        </button>
      </div>
      {dropdown}
    </>
  );
}

/**
 * @param {{
 *   value: number,
 *   onSelect: (n: number) => void,
 *   progressBySlot?: Record<number, { stars?: number, correct?: number, total?: number, approvedParts?: number }>,
 *   partsInPaper?: number,
 *   examLabelsBySlot?: Record<number, string>,
 *   availableSlots?: number[],
 *   showNewExamButton?: boolean,
 *   onNewExam?: () => void,
 *   showAdminMenu?: boolean,
 *   onRegenerateExam?: (slot: number) => void,
 *   onDeleteExam?: (slot: number) => void,
 *   onViewStatistics?: (slot: number) => void,
 *   onRepeatExam?: (slot: number) => void,
 *   lang?: 'es' | 'en',
 * }} props
 */
export function B2ExamSlotProgressPicker({
  value,
  onSelect,
  progressBySlot = {},
  partsInPaper = 4,
  examLabelsBySlot = {},
  availableSlots,
  showNewExamButton = false,
  onNewExam,
  showAdminMenu = false,
  onRegenerateExam,
  onDeleteExam,
  onViewStatistics,
  onRepeatExam,
  lang = 'en',
}) {
  const en = lang === 'en';
  const [openMenuSlot, setOpenMenuSlot] = useState(null);
  const slotsToShow =
    availableSlots !== undefined
      ? availableSlots
      : Array.from({ length: B2_EXAM_SLOT_MAX }, (_, i) => i + 1);
  const adminMenuEnabled = showAdminMenu && onRegenerateExam && onDeleteExam;
  const slotMenuEnabled = Boolean(onViewStatistics || onRepeatExam || adminMenuEnabled);

  return (
    <section
      aria-label={en ? 'Choose exam and view progress' : 'Elegir examen y ver progreso'}
      className="levels-b2-exam-picker"
    >
      <p className="levels-b2-exam-picker__title">{en ? 'Choose an exam' : 'Elige un examen'}</p>
      <div role="group" className="levels-b2-exam-picker__grid">
        {slotsToShow.length === 0 ? (
          <p className="levels-b2-exam-picker__empty">
            {en ? 'No exams available yet.' : 'Aún no hay exámenes disponibles.'}
          </p>
        ) : (
          slotsToShow.map((n) => {
            const active = value === n;
            const prog = progressBySlot[n] || {};
            const stars = Math.min(3, Math.max(0, Number(prog.stars) || 0));
            const approvedParts = Number(prog.approvedParts) || 0;
            const hasScore = approvedParts > 0 || Number(prog.total) > 0;

            return (
              <div
                key={n}
                className={`levels-b2-exam-picker__slot-wrap${active ? ' levels-b2-exam-picker__slot-wrap--active' : ''}`}
              >
                <button
                  type="button"
                  onClick={() => onSelect(n)}
                  aria-pressed={active}
                  className={`levels-b2-exam-picker__slot${active ? ' levels-b2-exam-picker__slot--active' : ''}`}
                >
                  <span>{examLabelsBySlot[n] || (en ? `Exam ${n}` : `Examen ${n}`)}</span>
                  <StarRow filled={stars} />
                  {hasScore ? (
                    <span className="levels-b2-exam-picker__slot-meta">
                      {approvedParts}/{partsInPaper} {en ? 'parts' : 'partes'}
                    </span>
                  ) : (
                    <span className="levels-b2-exam-picker__slot-meta">
                      {en ? 'No attempts' : 'Sin intentos'}
                    </span>
                  )}
                </button>
                {slotMenuEnabled ? (
                  <ExamSlotMenu
                    slot={n}
                    active={active}
                    lang={lang}
                    onViewStatistics={onViewStatistics}
                    onRepeatExam={onRepeatExam}
                    onRegenerate={onRegenerateExam}
                    onDelete={onDeleteExam}
                    showAdminActions={adminMenuEnabled}
                    open={openMenuSlot === n}
                    onToggle={(next) => setOpenMenuSlot(next ? n : null)}
                  />
                ) : null}
              </div>
            );
          })
        )}
        {showNewExamButton && onNewExam ? (
          <button
            type="button"
            onClick={onNewExam}
            className="levels-b2-exam-picker__slot levels-b2-exam-picker__slot--new"
          >
            <span>{en ? '+ New exam' : '+ Examen nuevo'}</span>
            <span className="levels-b2-exam-picker__slot-meta">
              {en ? 'Auto-generate with DRALO AI' : 'Generar con DRALO AI'}
            </span>
          </button>
        ) : null}
      </div>
    </section>
  );
}
