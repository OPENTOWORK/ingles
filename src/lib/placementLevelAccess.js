import { canAccessCoordinatorPanel, canAccessTeacherPanel, isAdminRole } from '@/utils/authRoles';

/** Niveles CEFR disponibles en /niveles (orden ascendente). */
export const NIVELES_CEFR_ORDER = ['A2', 'B1', 'B2', 'C1', 'C2'];

/** Temporal: todos los niveles de Levels accesibles sin placement. */
export const UNLOCK_ALL_NIVELES_LEVELS = true;

const CEFR_SLUG_PATTERN = /^(a2|b1|b2|c1|c2)$/i;

/**
 * Normaliza un slug o etiqueta a nivel CEFR (A2–C2).
 * @param {string} raw
 * @returns {'A2'|'B1'|'B2'|'C1'|'C2'|null}
 */
export function parseAssignedCefrLevel(raw) {
  if (raw == null || raw === '') return null;
  const s = String(raw).trim();
  const direct = s.match(/\b(A2|B1|B2|C1|C2)\b/i);
  if (direct) return direct[1].toUpperCase();

  const lower = s.toLowerCase();
  if (/upper|upper.?intermediate/.test(lower)) return 'B2';
  if (/advanced/.test(lower)) return 'C1';
  if (/proficiency|mastery|higher\s*level/.test(lower)) return 'C2';
  if (/pre.?inter|elementary/.test(lower)) return 'A2';
  if (/intermediate/.test(lower)) return 'B1';
  return null;
}

export function cefrSlugToLevel(slug) {
  if (!slug || typeof slug !== 'string') return null;
  const normalized = slug.trim().toLowerCase();
  if (!CEFR_SLUG_PATTERN.test(normalized)) return null;
  return normalized.toUpperCase();
}

export function isStaffRole(roleName = '') {
  return (
    isAdminRole(roleName) ||
    canAccessTeacherPanel(roleName) ||
    canAccessCoordinatorPanel(roleName)
  );
}

/**
 * @param {object} options
 * @param {boolean} options.isStudent — alumno / student
 * @param {boolean} options.hasPlacementResult — fila en placement_results
 * @param {string|null} options.assignedLevel — valor de nivel_asignado
 * @param {string} options.targetLevel — A2, B1, …
 */
export function isNivelesLevelLocked({
  isStudent,
  hasPlacementResult,
  assignedLevel,
  targetLevel,
}) {
  if (UNLOCK_ALL_NIVELES_LEVELS) return false;
  if (!isStudent) return false;

  const target = parseAssignedCefrLevel(targetLevel) || cefrSlugToLevel(targetLevel);
  if (!target || !NIVELES_CEFR_ORDER.includes(target)) return true;

  const targetIdx = NIVELES_CEFR_ORDER.indexOf(target);

  if (!hasPlacementResult) {
    return target !== 'A2';
  }

  const assigned = parseAssignedCefrLevel(assignedLevel);
  if (!assigned || !NIVELES_CEFR_ORDER.includes(assigned)) {
    return target !== 'A2';
  }

  const assignedIdx = NIVELES_CEFR_ORDER.indexOf(assigned);
  return targetIdx > assignedIdx;
}

export function getPlacementLockReason({
  isStudent,
  hasPlacementResult,
  assignedLevel,
  targetLevel,
}) {
  if (
    !isStudent ||
    !isNivelesLevelLocked({
      isStudent,
      hasPlacementResult,
      assignedLevel,
      targetLevel,
    })
  ) {
    return null;
  }

  if (!hasPlacementResult) {
    return {
      variant: 'no-placement',
      message:
        'Para acceder a este nivel debes completar el placement test. Mientras tanto solo está disponible A2.',
    };
  }

  const assigned = parseAssignedCefrLevel(assignedLevel) || '—';
  return {
    variant: 'above-assigned',
    assignedLevel: assigned,
    message: `Tu nivel asignado es ${assigned}. Los niveles superiores permanecen bloqueados hasta que actualices tu placement.`,
  };
}

/** Extrae el slug CEFR de rutas /niveles/b2/… o /niveles/speaking-lab/b2/… */
export function cefrSlugFromNivelesPath(pathname = '') {
  if (!pathname) return null;
  const match = pathname.match(/^\/niveles\/(?:speaking-lab\/)?([a-z0-9]+)/i);
  return match ? cefrSlugToLevel(match[1]) : null;
}
