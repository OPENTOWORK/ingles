/**
 * Vista local del perfil de estudiante, sin sesión.
 * Fuera de desarrollo no existe: no es una ruta pública.
 */
export const STUDENT_PROFILE_PREVIEW_PATH = '/dralo-dev/student-profile';

export function isStudentProfilePreviewPath(pathname = '') {
  if (process.env.NODE_ENV === 'production') return false;
  if (!pathname) return false;
  return (
    pathname === STUDENT_PROFILE_PREVIEW_PATH ||
    pathname.startsWith(`${STUDENT_PROFILE_PREVIEW_PATH}/`)
  );
}
