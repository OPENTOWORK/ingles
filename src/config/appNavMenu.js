/** Theory, placement y training: en la home debajo de «How it works», no en la barra superior. */
export const HOME_MAIN_LINKS = [
  { href: '/teoria', label: 'Theory', tourId: 'nav-theory' },
  { href: '/prueba-nivel', label: 'Placement Test', tourId: 'nav-placement' },
  { href: '/training', label: 'Training' },
];

/** Enlaces en la barra superior / menú móvil antes de Dralo AI. */
export const NAV_LINKS_BEFORE_DRALO = [
  { href: '/niveles', label: 'Exam practice', tourId: 'nav-levels' },
];

export const NAV_LINK_CONTACT = { href: '/contacto', label: 'Contact' };

export const DRALO_MENU_ITEMS = [
  { label: 'Use of English', href: '/dralo-ai/use-of-english' },
  { label: 'Reading', href: '/dralo-ai/reading' },
  { label: 'Writing', href: '/dralo-ai/writing' },
  { label: 'Listening', href: '/dralo-ai/listening' },
  { label: 'Speaking', href: '/dralo-ai/speaking' },
  { label: 'Grammar coach', href: '/dralo-ai/grammar-coach' },
  { label: 'Dictionary', href: '/dralo-ai/dictionary' },
];

/** Desplegable «Admin» solo para rol administrador. */
export const ADMIN_PANEL_MENU_ITEMS = [
  { href: '/admin', label: 'Panel de administración' },
  { href: '/admin/profesor', label: 'Panel de profesor' },
  { href: '/soporte', label: 'Panel de soporte' },
  { href: '/informatico', label: 'Panel informático' },
  { href: '/admin/plan-objetivos', label: 'Plan de objetivos' },
  { href: '/admin/plan-financiero', label: 'Plan financiero' },
];

export const TEACHER_PANEL_MENU_ITEMS = [
  { href: '/teacher', label: 'Panel de profesor' },
];
