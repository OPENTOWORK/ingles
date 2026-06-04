import {
  isAdminRole,
  isCoordinatorRole,
  isItRole,
  isSupportRole,
  isTeacherRole,
  normalizeRoleName,
} from '@/utils/authRoles';

/** Theory, placement, training y planes: en la home (solo admin ve esta fila). */
export const HOME_MAIN_LINKS = [
  { href: '/teoria', label: 'Theory', tourId: 'nav-theory' },
  { href: '/prueba-nivel', label: 'Placement Test', tourId: 'nav-placement' },
  { href: '/training', label: 'Training' },
  { href: '/precios', label: 'Planes', tourId: 'nav-pricing' },
];

/** Enlaces en la barra superior / menú móvil antes de Dralo AI. */
export const NAV_LINKS_BEFORE_DRALO = [
  { href: '/teoria', label: 'Theory', tourId: 'nav-theory' },
  { href: '/niveles', label: 'Exam practice', tourId: 'nav-levels' },
];

/** Solo visible para administradores (ver pricingAccess.js). */
export const NAV_LINK_PRICING = { href: '/precios', label: 'Pricing', tourId: 'nav-pricing' };

export const NAV_LINK_CONTACT = { href: '/contacto', label: 'Contact' };

export const DRALO_MENU_ITEMS = [
  { label: 'Writing', href: '/dralo-ai/writing' },
  { label: 'Listening', href: '/dralo-ai/listening' },
  { label: 'Speaking Coach', href: '/dralo-ai/speaking' },
  { label: 'Grammar coach', href: '/dralo-ai/grammar-coach' },
  { label: 'Pronunciation coach', href: '/dralo-ai/pronunciation-coach' },
  { label: 'Dictionary', href: '/dralo-ai/dictionary' },
];

/** Desplegable «Admin» solo para rol administrador. */
const COORDINATOR_ADMIN_PANEL_ITEM = {
  href: '/admin/coordinador',
  label: 'Panel de coordinador',
};

export const ADMIN_PANEL_MENU_ITEMS = [
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
      STAFF_PANEL_BY_KEY.profesorAdmin,
      STAFF_PANEL_BY_KEY.coordinador,
      STAFF_PANEL_BY_KEY.planObjetivos,
    ];
  }
  if (isTeacherRole(roleName)) {
    return [STAFF_PANEL_BY_KEY.profesor];
  }
  const role = normalizeRoleName(roleName);
  if (isSupportRole(roleName)) {
    return [STAFF_PANEL_BY_KEY.soporte];
  }
  if (isItRole(roleName)) {
    return [STAFF_PANEL_BY_KEY.informatico];
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
