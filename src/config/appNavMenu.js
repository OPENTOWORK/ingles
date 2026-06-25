import {
  isAdminRole,
  isCoordinatorRole,
  isItRole,
  isSupportRole,
  isTeacherRole,
  normalizeRoleName,
} from '@/utils/authRoles';
import { canViewPricing } from '@/utils/pricingAccess';
import { getExamUnitSlugFromPathname } from '@/lib/examTheoryUnlock';
import { isExamTheoryPartTipsPath } from '@/lib/nivelesPartTipsRoutes';
import { isStudentRole } from '@/constants/studentFeatureAccess';
import { getExamStrategiesMenuItems } from '@/data/examSkillTheme';
import { APP_ROUTES, isExamPracticeAppPath, isExamStrategiesPath } from '@/config/appRoutes';

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

/** Planes: solo administradores (ver pricingAccess.js). */
export const HOME_PRICING_LINK = { href: '/precios', label: 'Planes', tourId: 'nav-pricing' };

/** Enlaces de home: placement/training solo admin; planes solo admin. */
export function getHomeQuickLinksForRole(userRole) {
  const links = [...getAdminLearningLinks(userRole)];
  if (canViewPricing(userRole)) links.push(HOME_PRICING_LINK);
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
  NAV_LINK_EXAM_STRATEGIES,
  { href: APP_ROUTES.examPracticeDefaultLevel, label: 'Exam practice', tourId: 'nav-levels' },
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

  return {
    guest,
    admin,
    sectionLinks: getNavLinksForMobileDrawer(userRole, session),
    showPrimaryNav: shouldShowLoggedInPrimaryNav(session),
    showDralo: shouldShowDraloNav(session),
    draloLocked: !guest && isDraloAiLockedForRole(userRole),
    showPricing,
    showContact: true,
    showLogin: guest,
    showProfile: !guest,
    showLogout: !guest,
    staffItems,
    staffMenuLabel: getStaffPanelMenuLabel(userRole),
    showStaffDropdown: staffItems.length > 1,
    showStaffSingleLink: staffItems.length === 1,
    isStudent: isStudentRole(userRole),
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

/** Solo visible para administradores (ver pricingAccess.js). */
export const NAV_LINK_PRICING = { href: '/precios', label: 'Pricing', tourId: 'nav-pricing' };

export const NAV_LINK_CONTACT = { href: APP_ROUTES.contact, label: 'Contact' };

export const DRALO_MENU_ITEMS = [
  { label: 'Writing', href: '/dralo-ai/writing' },
  { label: 'Listening', href: '/dralo-ai/listening' },
  { label: 'Speaking Coach', href: '/dralo-ai/speaking' },
  { label: 'Grammar coach', href: '/dralo-ai/grammar-coach' },
  { label: 'Pronunciation coach', href: '/dralo-ai/pronunciation-coach' },
  { label: 'Dictionary', href: '/dralo-ai/dictionary' },
];

/** Dralo AI bloqueado (visible + Coming soon) para estudiantes y visitantes sin rol staff. */
export function isDraloAiLockedForRole(userRole) {
  const role = normalizeRoleName(userRole);
  if (
    isAdminRole(role) ||
    isTeacherRole(role) ||
    isCoordinatorRole(role) ||
    isSupportRole(role) ||
    isItRole(role)
  ) {
    return false;
  }
  return true;
}

/** Desplegable «Admin» solo para rol administrador. */
const COORDINATOR_ADMIN_PANEL_ITEM = {
  href: '/admin/coordinador',
  label: 'Panel de coordinador',
};

const STAFF_BUZON_PANEL_ITEM = {
  href: '/buzon',
  label: 'Buzón',
};

export const ADMIN_PANEL_MENU_ITEMS = [
  STAFF_BUZON_PANEL_ITEM,
  { href: '/admin', label: 'Panel de administración' },
  { href: '/admin/profesor', label: 'Panel de profesor' },
  COORDINATOR_ADMIN_PANEL_ITEM,
  { href: '/soporte', label: 'Panel de soporte' },
  { href: '/informatico', label: 'Panel informático' },
  { href: '/admin/plan-objetivos', label: 'Plan de objetivos' },
  { href: '/admin/plan-financiero', label: 'Plan financiero' },
  { href: '/admin/ejercicios', label: 'Panel de ejercicios' },
];

/** Lista completa del desplegable Admin (incluye coordinador si faltara en caché antigua). */
export function getAdminPanelMenuItems() {
  if (ADMIN_PANEL_MENU_ITEMS.some((item) => item.href === COORDINATOR_ADMIN_PANEL_ITEM.href)) {
    return ADMIN_PANEL_MENU_ITEMS;
  }
  const items = [...ADMIN_PANEL_MENU_ITEMS];
  const profesorIdx = items.findIndex((item) => item.href === '/admin/profesor');
  if (profesorIdx >= 0) {
    items.splice(profesorIdx + 1, 0, COORDINATOR_ADMIN_PANEL_ITEM);
  } else {
    items.push(COORDINATOR_ADMIN_PANEL_ITEM);
  }
  return items;
}

export const TEACHER_PANEL_MENU_ITEMS = [
  { href: '/teacher', label: 'Panel de profesor' },
];

export const COORDINATOR_PANEL_MENU_ITEMS = [
  { href: '/coordinador', label: 'Panel de coordinador' },
];

const STAFF_PANEL_BY_KEY = {
  admin: { href: '/admin', label: 'Panel de administración' },
  profesorAdmin: { href: '/admin/profesor', label: 'Panel de profesor' },
  profesor: { href: '/teacher', label: 'Panel de profesor' },
  coordinador: { href: '/coordinador', label: 'Panel de coordinador' },
  soporte: { href: '/soporte', label: 'Panel de soporte' },
  informatico: { href: '/informatico', label: 'Panel informático' },
  buzon: STAFF_BUZON_PANEL_ITEM,
  planObjetivos: { href: '/admin/plan-objetivos', label: 'Plan de objetivos' },
  planFinanciero: { href: '/admin/plan-financiero', label: 'Plan financiero' },
  ejercicios: { href: '/admin/ejercicios', label: 'Panel de ejercicios' },
};

/**
 * Paneles visibles en el menú según rol:
 * - admin: todos
 * - coordinador: profesor, coordinador, plan de objetivos
 * - profesor: solo panel de profesor
 * - soporte / informático: su panel
 * - alumno y otros: ninguno
 */
export function getStaffPanelMenuItemsForRole(roleName = '') {
  if (isAdminRole(roleName)) {
    return getAdminPanelMenuItems();
  }
  if (isCoordinatorRole(roleName)) {
    return [
      STAFF_PANEL_BY_KEY.buzon,
      STAFF_PANEL_BY_KEY.profesorAdmin,
      STAFF_PANEL_BY_KEY.coordinador,
      STAFF_PANEL_BY_KEY.planObjetivos,
    ];
  }
  if (isTeacherRole(roleName)) {
    return [STAFF_PANEL_BY_KEY.buzon, STAFF_PANEL_BY_KEY.profesor];
  }
  const role = normalizeRoleName(roleName);
  if (isSupportRole(roleName)) {
    return [STAFF_PANEL_BY_KEY.buzon, STAFF_PANEL_BY_KEY.soporte];
  }
  if (isItRole(roleName)) {
    return [STAFF_PANEL_BY_KEY.buzon, STAFF_PANEL_BY_KEY.informatico];
  }
  if (role === 'centro_empresa' || role === 'centro/empresa') {
    return [{ href: '/centro-empresa', label: 'Panel centro/empresa' }];
  }
  if (role === 'clases_grupos' || role === 'clases/grupos') {
    return [{ href: '/clases-grupos', label: 'Panel clases/grupos' }];
  }
  return [];
}

export function getStaffPanelMenuLabel(roleName = '') {
  if (isAdminRole(roleName)) return 'Admin';
  if (getStaffPanelMenuItemsForRole(roleName).length > 1) return 'Paneles';
  return 'Panel';
}
