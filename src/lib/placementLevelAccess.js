import { isAdminRole, isTeacherRole } from '@/utils/authRoles';

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
  return isAdminRole(roleName) || isTeacherRole(roleName);
}

/**
 * Placement gating disabled: students can access all niveles without a placement result.
 */
export function isNivelesLevelLocked() {
  return false;
}

export function getPlacementLockReason() {
  return null;
}

/** Extrae el slug CEFR de rutas /niveles/b2/… o /niveles/speaking-lab/b2/… */
export function cefrSlugFromNivelesPath(pathname = '') {
  if (!pathname) return null;
  const match = pathname.match(/^\/niveles\/(?:speaking-lab\/)?([a-z0-9]+)/i);
  return match ? cefrSlugToLevel(match[1]) : null;
}
