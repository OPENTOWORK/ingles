export const COORDINATOR_ADMIN_PANEL_ITEM = {
  href: '/admin/coordinador',
  label: 'Coordinador',
};

export const STAFF_BUZON_PANEL_ITEM = {
  href: '/buzon',
  label: 'Buzón y reuniones',
};

export const STAFF_TASKS_PANEL_ITEM = {
  href: '/tareas',
  label: 'Tareas',
};

/** Índice lateral del shell admin agrupado por departamento. */
export const ADMIN_SHELL_MENU_SECTIONS = [
  {
    id: 'principal',
    title: null,
    items: [STAFF_BUZON_PANEL_ITEM],
  },
  {
    id: 'direccion',
    title: 'Dirección y Estrategia',
    items: [
      { href: '/admin', label: 'Administración' },
      STAFF_TASKS_PANEL_ITEM,
      { href: '/admin/plan-financiero', label: 'Financiero' },
      { href: '/admin/configuracion', label: 'Permisos' },
    ],
  },
  {
    id: 'informatica',
    title: 'Informática',
    items: [{ href: '/informatico', label: 'Informático' }],
  },
  {
    id: 'ingles',
    title: 'Departamento de inglés',
    items: [
      { href: '/admin/profesor', label: 'Profesor' },
      COORDINATOR_ADMIN_PANEL_ITEM,
      { href: '/admin/plan-objetivos', label: 'Objetivos' },
      { href: '/admin/ejercicios', label: 'Ejercicios' },
    ],
  },
  {
    id: 'comercial',
    title: 'Comercial',
    items: [
      { href: '/admin/marketing', label: 'Marketing' },
      { href: '/admin/blog', label: 'Blog' },
    ],
  },
  {
    id: 'soporte',
    title: 'Soporte',
    items: [{ href: '/soporte', label: 'Soporte' }],
  },
  {
    id: 'finanzas',
    title: 'Finanzas',
    items: [
      { href: '/admin/finanzas/facturacion', label: 'Facturación' },
      { href: '/admin/finanzas/contabilidad', label: 'Contabilidad' },
      { href: '/admin/finanzas/tesoreria', label: 'Tesorería' },
    ],
  },
];

export function flattenAdminShellMenuSections(sections = ADMIN_SHELL_MENU_SECTIONS) {
  const items = [];
  const seen = new Set();
  for (const section of sections) {
    for (const item of section.items || []) {
      const href = String(item.href || '').replace(/\/$/, '') || '/';
      if (seen.has(href)) continue;
      seen.add(href);
      items.push(item);
    }
  }
  return items;
}

export function getAdminPanelMenuItems() {
  return flattenAdminShellMenuSections(ADMIN_SHELL_MENU_SECTIONS);
}
