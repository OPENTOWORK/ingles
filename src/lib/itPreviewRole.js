import {
  canAccessCoordinatorPanel,
  canAccessItPanel,
  canAccessStaffBuzon,
  canAccessStaffTasks,
  canAccessSupportPanel,
  isAdminRole,
  isItRole,
  isTeacherRole,
  normalizeRoleName,
} from '@/utils/authRoles';
import { canViewPlacementAndTraining } from '@/config/appNavMenu';
import { canViewPricing } from '@/utils/pricingAccess';
import { isPublicPath } from '@/utils/publicRoutes';
import {
  buildAppNavModel,
  NAV_LINK_CONTACT,
} from '@/config/appNavMenu';

export const IT_PREVIEW_ROLE_PARAM = 'itPreviewRole';
export const IT_PREVIEW_RELOAD_PARAM = '_itPreview';

/** Roles disponibles en el panel informático (solo UI; no cambia permisos reales). */
export const IT_PREVIEW_ROLE_OPTIONS = [
  { id: 'guest', label: 'Visitante (sin sesión)', roleName: 'guest', simulatesSession: false },
  { id: 'student', label: 'Alumno', roleName: 'student', simulatesSession: true },
  { id: 'teacher', label: 'Profesor', roleName: 'teacher', simulatesSession: true },
  { id: 'coordinator', label: 'Coordinador', roleName: 'coordinador', simulatesSession: true },
  { id: 'support', label: 'Soporte', roleName: 'soporte', simulatesSession: true },
  { id: 'informatico', label: 'Informático', roleName: 'informatico', simulatesSession: true },
  { id: 'admin', label: 'Administrador', roleName: 'admin', simulatesSession: true },
];

const PRESET_ROUTES = [
  { label: 'Inicio', path: '/', roles: ['guest', 'student', 'teacher', 'coordinator', 'support', 'informatico', 'admin'] },
  { label: 'Login', path: '/login', roles: ['guest'] },
  { label: 'Perfil', path: '/profile', roles: ['student', 'teacher', 'coordinator', 'support', 'informatico', 'admin'] },
  { label: 'Exam Strategies', path: '/exam-strategies', roles: ['student', 'teacher', 'coordinator', 'support', 'informatico', 'admin'] },
  { label: 'B2 — Hub exámenes', path: '/exam-practice/b2', roles: ['student', 'teacher', 'coordinator', 'support', 'informatico', 'admin'] },
  { label: 'B2 — Modo examen', path: '/exam-practice/b2/exam-mode', roles: ['student', 'teacher', 'coordinator', 'support', 'informatico', 'admin'] },
  { label: 'B2 — Reading', path: '/exam-practice/b2/exam-reading', roles: ['student', 'teacher', 'coordinator', 'support', 'informatico', 'admin'] },
  { label: 'B2 — Writing', path: '/exam-practice/b2/exam-writing', roles: ['student', 'teacher', 'coordinator', 'support', 'informatico', 'admin'] },
  { label: 'B2 — Listening', path: '/exam-practice/b2/exam-listening', roles: ['student', 'teacher', 'coordinator', 'support', 'informatico', 'admin'] },
  { label: 'B2 — Speaking', path: '/exam-practice/b2/exam-speaking', roles: ['student', 'teacher', 'coordinator', 'support', 'informatico', 'admin'] },
  { label: 'Placement Test', path: '/prueba-nivel', roles: ['admin'] },
  { label: 'Training', path: '/training', roles: ['admin'] },
  { label: 'Planes / Pricing', path: '/precios', roles: ['admin'] },
  { label: 'Dralo AI', path: '/dralo-ai', roles: ['student', 'teacher', 'coordinator', 'support', 'informatico', 'admin'] },
  { label: 'Contacto', path: '/contact', roles: ['guest', 'student', 'teacher', 'coordinator', 'support', 'informatico', 'admin'] },
  { label: 'Panel profesor', path: '/teacher', roles: ['teacher'] },
  { label: 'Panel profesor (admin)', path: '/admin/profesor', roles: ['admin', 'coordinator'] },
  { label: 'Panel coordinador', path: '/coordinador', roles: ['coordinator'] },
  { label: 'Panel soporte', path: '/soporte', roles: ['support', 'admin'] },
  { label: 'Panel informático', path: '/informatico', roles: ['informatico', 'admin'] },
  { label: 'Panel tareas', path: '/tareas', roles: ['teacher', 'coordinator', 'support', 'informatico', 'admin'] },
  { label: 'Hub paneles', path: '/paneles', roles: ['teacher', 'coordinator', 'support', 'informatico', 'admin'] },
  { label: 'Panel administración', path: '/admin', roles: ['admin'] },
];

export function canApplyItPreviewRoleOverride(realRole = '') {
  return canAccessItPanel(realRole);
}

export function findItPreviewRoleOption(roleId = '') {
  const id = String(roleId || '').trim().toLowerCase();
  if (!id) return null;
  return IT_PREVIEW_ROLE_OPTIONS.find((option) => option.id === id) || null;
}

/** Rol efectivo para menús (visitante → student en helpers de nav). */
export function getItPreviewNavRoleName(option) {
  if (!option || option.id === 'guest') return 'student';
  return option.roleName;
}

export function resolveItPreviewState(requestedRoleId, realRole, realSession) {
  const option = findItPreviewRoleOption(requestedRoleId);
  const allowed = option && canApplyItPreviewRoleOverride(realRole);

  if (!allowed) {
    return {
      isActive: false,
      option: null,
      userRole: realRole,
      session: realSession,
    };
  }

  const navRole = getItPreviewNavRoleName(option);
  return {
    isActive: true,
    option,
    userRole: navRole,
    session: option.simulatesSession ? realSession : null,
  };
}

export function getItPreviewPresetsForRole(roleId = 'student') {
  return PRESET_ROUTES.filter((route) => route.roles.includes(roleId));
}

export function isItPreviewPathAccessible(path, roleId = 'student') {
  const normalized = String(path || '/').split('#')[0];
  const pathname = normalized.split('?')[0] || '/';

  if (roleId === 'guest') {
    return isPublicPath(pathname);
  }

  if (pathname.startsWith('/admin') && !isAdminRole(roleId) && roleId !== 'coordinador') {
    if (roleId === 'coordinator' && pathname === '/admin/profesor') return true;
    if (roleId === 'coordinador' && pathname.startsWith('/admin/plan-objetivos')) return true;
    if (
      (roleId === 'coordinator' || roleId === 'coordinador') &&
      pathname.startsWith('/admin/blog')
    ) {
      return true;
    }
    return false;
  }

  if (pathname === '/tareas' && !canAccessStaffTasks(roleId)) return false;
  if (pathname === '/paneles' && !canAccessStaffTasks(roleId)) return false;
  if (pathname === '/buzon' && !canAccessStaffBuzon(roleId)) return false;
  if (pathname === '/teacher' && !isTeacherRole(roleId)) return false;
  if (pathname === '/coordinador' && !canAccessCoordinatorPanel(roleId)) return false;
  if (pathname === '/soporte' && !canAccessSupportPanel(roleId)) return false;
  if (pathname === '/informatico' && !canAccessItPanel(roleId)) return false;
  if (pathname === '/precios' && !canViewPricing(roleId)) return false;
  if ((pathname === '/prueba-nivel' || pathname.startsWith('/training')) && !canViewPlacementAndTraining(roleId)) {
    return false;
  }

  return true;
}

export function getDefaultItPreviewPathForRole(roleId = 'student') {
  if (roleId === 'guest') return '/';
  if (roleId === 'admin' || roleId === 'informatico') return '/niveles/b2';
  const presets = getItPreviewPresetsForRole(roleId);
  return presets.find((p) => p.path.startsWith('/niveles'))?.path || presets[0]?.path || '/';
}

/** Etiquetas de menú visibles (barra + drawer móvil / menú lateral home). */
export function getItPreviewNavSummary(roleId = 'student') {
  const option = findItPreviewRoleOption(roleId);
  const navRole = getItPreviewNavRoleName(option || { id: roleId, roleName: roleId });
  const session = option?.simulatesSession ? { user: { id: 'preview' } } : null;
  const model = buildAppNavModel(navRole, session);
  const items = [];

  if (model.showPrimaryNav) {
    model.sectionLinks.forEach((link) => {
      if (!items.includes(link.label)) items.push(link.label);
      if (link.label === 'Exam Strategies' && model.examStrategiesLocked) {
        items.push('(Coming soon)');
      }
    });
  }

  if (model.showDralo) {
    items.push('Dralo AI');
    if (model.draloLocked) items.push('(Coming soon)');
  }

  if (model.showPricing) items.push('Pricing');
  if (model.showContact) items.push(NAV_LINK_CONTACT.label);

  if (model.showStaffDropdown || model.showStaffSingleLink) {
    model.staffItems.forEach((panel) => items.push(panel.label));
  }

  if (model.showProfile) items.push('Profile');
  if (model.showLogout) items.push('Logout');
  if (model.showLogin) items.push('Login');

  return items;
}

export function appendItPreviewParams(url, { roleId, reloadToken = 0 } = {}) {
  const base = String(url || '');
  const sep = base.includes('?') ? '&' : '?';
  const parts = [`${IT_PREVIEW_RELOAD_PARAM}=${reloadToken}`];
  if (roleId) parts.push(`${IT_PREVIEW_ROLE_PARAM}=${encodeURIComponent(roleId)}`);
  return `${base}${sep}${parts.join('&')}`;
}
