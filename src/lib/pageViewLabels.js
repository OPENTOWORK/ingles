/** Etiquetas legibles para rutas de la app (ficha admin / historial). */
const PATH_LABELS = [
  { prefix: '/training/', label: 'Training' },
  { prefix: '/niveles/', label: 'Niveles' },
  { prefix: '/teoria/', label: 'Teoría' },
  { prefix: '/admin/usuarios/', label: 'Ficha de usuario' },
  { prefix: '/admin', label: 'Panel de administración' },
  { prefix: '/teacher', label: 'Panel de profesor' },
  { prefix: '/training', label: 'Training' },
  { prefix: '/niveles', label: 'Niveles' },
  { prefix: '/teoria', label: 'Teoría' },
  { prefix: '/perfil', label: 'Perfil' },
  { prefix: '/speaking', label: 'Speaking' },
  { prefix: '/dralo-ai', label: 'Dralo AI' },
  { prefix: '/login', label: 'Inicio de sesión' },
  { prefix: '/register', label: 'Registro' },
  { prefix: '/placement', label: 'Placement test' },
  { prefix: '/', label: 'Inicio' },
];

export function getPageTitleForPath(pathname) {
  if (!pathname || typeof pathname !== 'string') return 'Página';
  const path = pathname.split('?')[0] || '/';

  for (const { prefix, label } of PATH_LABELS) {
    if (prefix === '/' && path === '/') return label;
    if (prefix !== '/' && path.startsWith(prefix)) {
      if (prefix === '/training/' || prefix === '/niveles/') {
        const rest = path.slice(prefix.length).split('/').filter(Boolean);
        if (rest.length) return `${label}: ${rest.join(' / ')}`;
      }
      return label;
    }
  }

  return path;
}
