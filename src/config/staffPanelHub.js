/** Metadatos visuales del hub de paneles staff (ruta → icono y descripción). */

export const STAFF_PANELS_HUB_PATH = '/paneles';

export const STAFF_PANEL_HUB_META = {
  '/buzon': {
    icon: 'inbox',
    accent: 'sky',
    description: 'Mensajería interna del equipo',
  },
  '/tareas': {
    icon: 'tasks',
    accent: 'violet',
    description: 'Tareas, fases y reuniones',
  },
  '/admin': {
    icon: 'admin',
    accent: 'indigo',
    description: 'Usuarios, analíticas y configuración',
  },
  '/admin/profesor': {
    icon: 'teacher',
    accent: 'emerald',
    description: 'Vista docente ampliada',
  },
  '/teacher': {
    icon: 'teacher',
    accent: 'emerald',
    description: 'Alumnos, notas y seguimiento',
  },
  '/coordinador': {
    icon: 'coordinator',
    accent: 'purple',
    description: 'Profesores y alumnos por profesor',
  },
  '/admin/coordinador': {
    icon: 'coordinator',
    accent: 'purple',
    description: 'Profesores y alumnos por profesor',
  },
  '/soporte': {
    icon: 'support',
    accent: 'amber',
    description: 'Atención y tickets de soporte',
  },
  '/informatico': {
    icon: 'it',
    accent: 'cyan',
    description: 'Herramientas técnicas y preview',
  },
  '/admin/plan-objetivos': {
    icon: 'objectives',
    accent: 'rose',
    description: 'Plan de estudio y objetivos',
  },
  '/admin/plan-financiero': {
    icon: 'finance',
    accent: 'lime',
    description: 'Proyección y finanzas',
  },
  '/admin/ejercicios': {
    icon: 'exercises',
    accent: 'orange',
    description: 'Catálogo y edición de ejercicios',
  },
  '/centro-empresa': {
    icon: 'building',
    accent: 'slate',
    description: 'Gestión centro / empresa',
  },
  '/clases-grupos': {
    icon: 'groups',
    accent: 'teal',
    description: 'Clases y grupos',
  },
};

export function enrichStaffPanelMenuItem(item) {
  const meta = STAFF_PANEL_HUB_META[item.href] || {};
  return {
    ...item,
    icon: meta.icon || 'panel',
    accent: meta.accent || 'violet',
    description: meta.description || item.label,
  };
}
