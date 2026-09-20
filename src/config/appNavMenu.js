import {
  isAdminRole,
  isCoordinatorRole,
  isItRole,
  isMarketingRole,
  isStudentRole,
  isSupportRole,
  isTeacherRole,
  normalizeRoleName,
} from '@/utils/authRoles';
import { canViewPricing } from '@/utils/pricingAccess';
import { getExamUnitSlugFromPathname } from '@/lib/examTheoryUnlock';
import { isExamTheoryPartTipsPath } from '@/lib/nivelesPartTipsRoutes';
import { usesStudentContentRestrictions } from '@/constants/studentFeatureAccess';
import { getExamStrategiesMenuItems } from '@/data/examSkillTheme';
import { APP_ROUTES, isExamPracticeAppPath, isExamStrategiesPath } from '@/config/appRoutes';
import { STAFF_PANELS_HUB_PATH } from '@/config/staffPanelHub';
import {
  permissionKeysToMenuItems,
  resolvePermissionKeysForRole,
  resolveStaffRolePermissionKey,
} from '@/lib/staffRolePermissions';
import {
  ADMIN_SHELL_MENU_SECTIONS,
  STAFF_BUZON_PANEL_ITEM,
  STAFF_TASKS_PANEL_ITEM,
  getAdminPanelMenuItems,
} from '@/config/adminShellMenu';

/** Theory solo en la home (inferior, oculto para estudiantes). */
export const HOME_THEORY_LINK = { href: '/teoria', label: 'Theory', tourId: 'nav-theory' };

/** Enlaces inferiores de la home (placement/training solo admin). */
export const NAV_LINK_PLACEMENT = {
  href: '/prueba-nivel',
  label: 'Placement Test',
  tourId: 'nav-placement',
};

export const NAV_LINK_TRAINING = {
  href: '/training',
  label: 'Training',
  tourId: 'nav-training',
};

export const NAV_LINKS_LEARNING = [NAV_LINK_PLACEMENT, NAV_LINK_TRAINING];

/** Placement Test y Training: solo administradores (todos los dispositivos). */
export function canViewPlacementAndTraining(userRole) {
  return isAdminRole(userRole);
}

export function getAdminLearningLinks(userRole) {
  return canViewPlacementAndTraining(userRole) ? NAV_LINKS_LEARNING : [];
}

/** Planes en home: usuarios con sesión excepto estudiantes. */
export const HOME_PRICING_LINK = { href: '/precios', label: 'Planes', tourId: 'nav-pricing' };

/** Enlaces de home: placement/training solo admin; planes no para estudiantes. */
export function getHomeQuickLinksForRole(userRole) {
  const links = [...getAdminLearningLinks(userRole)];
  if (canViewPricing(userRole) && !isStudentRole(userRole)) links.push(HOME_PRICING_LINK);
  return links;
}

/** Enlaces en la barra superior (escritorio) y base del menú móvil. */
export const EXAM_STRATEGIES_MENU_ITEMS = getExamStrategiesMenuItems();

export const NAV_LINK_EXAM_STRATEGIES = {
  href: APP_ROUTES.examStrategies,
  label: 'Exam Strategies',
  tourId: 'nav-exam-theory',
  menuItems: EXAM_STRATEGIES_MENU_ITEMS,
};

export const NAV_LINKS_BEFORE_DRALO = [
  { href: APP_ROUTES.examPracticeDefaultLevel, label: 'Exam Practice', tourId: 'nav-levels' },
  NAV_LINK_EXAM_STRATEGIES,
];

export const NAV_LINK_HOME = { href: '/', label: 'Home' };

/** Visitante sin sesión (no autenticado). */
export function isGuestNavSession(session) {
  return !session;
}

/** Enlace a login conservando la ruta de destino tras iniciar sesión. */
export function getGuestLoginHref(targetHref) {
  return `/login?next=${encodeURIComponent(targetHref)}`;
}

/** Href real del ítem de menú: visitantes van a login con `next`. */
export function resolveNavItemHref(href, session) {
  if (isGuestNavSession(session)) {
    return getGuestLoginHref(href);
  }
  return href;
}

/** Extras de home visibles solo para admin en drawer / menú lateral (no barra desktop). */
export function getAdminDrawerExtraLinks(userRole) {
  if (!isAdminRole(userRole)) return [];
  return [HOME_THEORY_LINK, ...getAdminLearningLinks(userRole)];
}

/**
 * Enlaces de sección en drawer móvil y menú lateral home.
 * Visitantes ven Exam theory / Exam practice (→ login); staff/admin reciben extras.
 */
export function getNavLinksForMobileDrawer(userRole, session) {
  const links = isGuestNavSession(session)
    ? [...NAV_LINKS_BEFORE_DRALO]
    : [...getAdminDrawerExtraLinks(userRole), ...NAV_LINKS_BEFORE_DRALO];
  return links.map((item) => ({
    ...item,
    href: resolveNavItemHref(item.href, session),
  }));
}

/** Exam theory y Exam practice visibles para todos (visitantes → login al pulsar). */
export function shouldShowLoggedInPrimaryNav(_session) {
  return true;
}

/** Dralo AI visible para todos (visitantes → login al pulsar sub-ítems). */
export function shouldShowDraloNav(_session) {
  return true;
}

/**
 * Modelo unificado de navegación por rol (desktop, drawer móvil y menú lateral).
 * Prioriza la barra de escritorio como referencia; admin recibe extras en drawer.
 */
export function buildAppNavModel(userRole, session) {
  const guest = isGuestNavSession(session);
  const admin = isAdminRole(userRole);
  const showPricing = !guest && canViewPricing(userRole);
  const staffItems = guest ? [] : getStaffPanelMenuItemsForRole(userRole);
  const useAdminSidebarNav = admin && staffItems.length > 0;

  return {
    guest,
    admin,
    sectionLinks: getNavLinksForMobileDrawer(userRole, session),
    showPrimaryNav: shouldShowLoggedInPrimaryNav(session),
    showDralo: shouldShowDraloNav(session),
    draloLocked: !guest && isDraloAiLockedForRole(userRole),
    /** Sobrescribir con useExamStrategiesAccess() cuando haya sesión (plan real). */
    examStrategiesLocked: false,
    showPricing,
    showContact: true,
    showLogin: guest,
    showProfile: !guest,
    showLogout: !guest,
    staffItems,
    staffMenuLabel: getStaffPanelMenuLabel(userRole),
    userRole: userRole || '',
    showStaffAdminLink: useAdminSidebarNav,
    staffAdminHref: '/admin',
    staffAdminLabel: 'Admin',
    showStaffDropdown: !useAdminSidebarNav && staffItems.length > 1,
    showStaffSingleLink: !useAdminSidebarNav && staffItems.length === 1,
    isStudent: usesStudentContentRestrictions(userRole),
  };
}
/** Estado activo de enlaces del menú principal (incluye pestaña theory y rutas /teoria de examen). */
export function isNavLinkActive(href, pathname, searchParams) {
  if (!pathname || !href) return false;
  const path = pathname.replace(/\/$/, '') || '/';

  if (href === APP_ROUTES.examStrategies) {
    if (isExamStrategiesPath(path)) return true;
    if (path === '/niveles' && searchParams?.get('tab') === 'theory') return true;
    if (isExamTheoryPartTipsPath(pathname)) return true;
    return Boolean(getExamUnitSlugFromPathname(pathname));
  }

  if (href === APP_ROUTES.examPracticeDefaultLevel) {
    if (path === '/niveles' && searchParams?.get('tab') !== 'theory') return true;
    if (isExamPracticeAppPath(path)) return true;
    if (path.startsWith('/niveles/')) return true;
    if (isExamTheoryPartTipsPath(pathname)) return false;
    if (getExamUnitSlugFromPathname(pathname)) return false;
    return false;
  }

  const target = href.replace(/\/$/, '') || '/';
  if (target === '/') return path === '/';
  return path === target || path.startsWith(`${target}/`);
}

/** Visible para usuarios con sesión (ver pricingAccess.js). */
export const NAV_LINK_PRICING = { href: '/precios', label: 'Pricing', tourId: 'nav-pricing' };

export const NAV_LINK_CONTACT = {
  href: APP_ROUTES.contact,
  label: 'Contact',
  tourId: 'nav-contact',
};

export const NAV_LINK_PROFILE = {
  href: APP_ROUTES.profile,
  label: 'Profile',
  tourId: 'nav-profile',
};

export const DRALO_MENU_ITEMS = [
  { label: 'Writing', href: '/dralo-ai/writing' },
  { label: 'Listening', href: '/dralo-ai/listening' },
  { label: 'Speaking Coach', href: '/dralo-ai/speaking' },
  { label: 'Grammar coach', href: '/dralo-ai/grammar-coach' },
  { label: 'Pronunciation coach', href: '/dralo-ai/pronunciation-coach' },
  { label: 'Dictionary', href: '/dralo-ai/dictionary' },
];

/** Dralo AI desbloqueado para staff pedagógico y Resp.marketing (bloqueado solo para alumnos). */
export function isDraloAiLockedForRole(userRole) {
  const role = normalizeRoleName(userRole);
  if (
    isAdminRole(role) ||
    isTeacherRole(role) ||
    isCoordinatorRole(role) ||
    isSupportRole(role) ||
    isItRole(role) ||
    isMarketingRole(role)
  ) {
    return false;
  }
  return true;
}

/** Resalta «Admin» / «Paneles» en el hub o dentro de cualquier panel del rol. */
export function isStaffPanelsNavActive(pathname, searchParams, staffItems = []) {
  if (!pathname) return false;
  const path = pathname.replace(/\/$/, '') || '/';
  if (path === STAFF_PANELS_HUB_PATH) return true;
  return staffItems.some((item) => isNavLinkActive(item.href, pathname, searchParams));
}

export { STAFF_BUZON_PANEL_ITEM, STAFF_TASKS_PANEL_ITEM, getAdminPanelMenuItems };
export const ADMIN_PANEL_MENU_ITEMS = getAdminPanelMenuItems();

function normalizeStaffShellPath(path = '') {
  const trimmed = String(path || '').replace(/\/$/, '');
  return trimmed || '/';
}

function staffShellPathMatches(pathname = '', href = '') {
  const current = normalizeStaffShellPath(pathname);
  const target = normalizeStaffShellPath(href);
  if (target === '/admin') {
    return current === '/admin' || current.startsWith('/admin/');
  }
  return current === target || current.startsWith(`${target}/`);
}

/** Módulos del menú lateral Admin (lista plana; preferir getAdminShellMenuSections). */
export function getAdminShellMenuItems(roleName = '', permissionOverridesByRole = {}) {
  return flattenAdminShellMenuSections(getAdminShellMenuSections(roleName, permissionOverridesByRole));
}

/** Índice lateral agrupado por departamento. */
export function getAdminShellMenuSections(roleName = '', permissionOverridesByRole = {}) {
  if (isAdminRole(roleName)) {
    return ADMIN_SHELL_MENU_SECTIONS;
  }

  const items = getStaffPanelMenuItemsForRole(roleName, permissionOverridesByRole).filter((item) =>
    item.href.startsWith('/admin'),
  );

  if (!items.length) return [];

  return [{ id: 'modules', title: null, items }];
}

function flattenAdminShellMenuSections(sections = []) {
  const items = [];
  const seen = new Set();
  for (const section of sections) {
    for (const item of section.items || []) {
      const href = normalizeStaffShellPath(item.href);
      if (seen.has(href)) continue;
      seen.add(href);
      items.push(item);
    }
  }
  return items;
}

/** Muestra el shell lateral solo en rutas de gestión admin (rol administrador u otros con /admin/*). */
export function shouldShowAdminShell(pathname = '', roleName = '') {
  if (isAdminRole(roleName) && normalizeStaffShellPath(pathname) === STAFF_PANELS_HUB_PATH) {
    return true;
  }
  const menuItems = getAdminShellMenuItems(roleName);
  if (!menuItems.length) return false;
  return menuItems.some((item) => staffShellPathMatches(pathname, item.href));
}

export const TEACHER_PANEL_MENU_ITEMS = [
  { href: '/teacher', label: 'Profesor' },
];

export const COORDINATOR_PANEL_MENU_ITEMS = [
  { href: '/coordinador', label: 'Coordinador' },
];

const STAFF_PANEL_BY_KEY = {
  admin: { href: '/admin', label: 'Administración' },
  profesorAdmin: { href: '/admin/profesor', label: 'Profesor' },
  profesor: { href: '/teacher', label: 'Profesor' },
  coordinador: { href: '/coordinador', label: 'Coordinador' },
  soporte: { href: '/soporte', label: 'Soporte' },
  informatico: { href: '/informatico', label: 'Informático' },
  buzon: STAFF_BUZON_PANEL_ITEM,
  tareas: STAFF_TASKS_PANEL_ITEM,
  planObjetivos: { href: '/admin/plan-objetivos', label: 'Objetivos' },
  planFinanciero: { href: '/admin/plan-financiero', label: 'Financiero' },
  ejercicios: { href: '/admin/ejercicios', label: 'Ejercicios' },
  blog: { href: '/admin/blog', label: 'Blog' },
  planMarketing: { href: '/admin/marketing', label: 'Marketing' },
  configuracion: { href: '/admin/configuracion', label: 'Permisos' },
  facturacion: { href: '/admin/finanzas/facturacion', label: 'Facturación' },
  contabilidad: { href: '/admin/finanzas/contabilidad', label: 'Contabilidad' },
  tesoreria: { href: '/admin/finanzas/tesoreria', label: 'Tesorería' },
};

/**
 * Paneles visibles en el menú según rol:
 * - admin: todos
 * - coordinador: profesor, coordinador, plan de objetivos, blog
 * - marketing: buzón/reuniones + blog
 * - profesor: panel de profesor + buzón + tareas
 * - soporte / informático: su panel + buzón + tareas
 * - centro/empresa, clases/grupos: su panel + buzón + tareas
 * - alumno y otros sin rol: ninguno
 */
export function getStaffPanelMenuItemsForRole(roleName = '', permissionOverridesByRole = {}) {
  if (isAdminRole(roleName)) {
    return getAdminPanelMenuItems();
  }

  const roleKey = resolveStaffRolePermissionKey(roleName);
  const permissionKeys = resolvePermissionKeysForRole(roleKey, permissionOverridesByRole);
  return permissionKeysToMenuItems(permissionKeys);
}

export function canAccessStaffPanelsHub(roleName = '') {
  return getStaffPanelMenuItemsForRole(roleName).length > 0;
}

export function getStaffPanelMenuLabel(roleName = '') {
  if (isAdminRole(roleName)) return 'Admin';
  if (getStaffPanelMenuItemsForRole(roleName).length > 1) return 'Paneles';
  return 'Panel';
}
