import { normalizeRoleName } from '@/utils/authRoles';

const STUDENT_ROLES = new Set(['student', 'alumno']);

/** Rol del usuario en servidor (tablas Supabase reales). */
export async function getUserRoleNameServer(userId, dbClient) {
  if (!userId || !dbClient) return 'student';

  const { data: userRow } = await dbClient
    .from('Usuarios_y_Perfil_users')
    .select('rol_id')
    .eq('id', userId)
    .maybeSingle();

  if (!userRow?.rol_id) return 'student';

  const { data: roleRow } = await dbClient
    .from('Usuarios_y_Perfil_roles')
    .select('nombre')
    .eq('id', userRow.rol_id)
    .maybeSingle();

  return roleRow?.nombre || 'student';
}

export function isStudentRole(roleName) {
  return STUDENT_ROLES.has(normalizeRoleName(roleName));
}
