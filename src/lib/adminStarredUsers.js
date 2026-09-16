/**
 * IDs de usuarios marcados con estrella de equipo (staff).
 *
 * En producción la columna vive en Usuarios_y_Perfil_users. El cliente browser
 * mapea user_profiles → esa tabla, pero las APIs de servidor usan createClient
 * sin ese alias: hay que consultar la tabla real.
 */
export async function resolveStarredTeamUserIds(db) {
  const ids = new Set();
  const tables = ['Usuarios_y_Perfil_users', 'user_profiles'];

  for (const table of tables) {
    const { data, error } = await db.from(table).select('id').eq('destacado_equipo', true);

    if (error) {
      const missing =
        error.code === '42P01' || String(error.message || '').toLowerCase().includes('does not exist');
      if (!missing) {
        console.error(`[admin] starred users (${table})`, error);
      }
      continue;
    }

    for (const row of data || []) {
      if (row?.id) ids.add(String(row.id));
    }
  }

  return ids;
}

/** @param {Set<string>} starredIds */
export function isStarredTeamMember(starredIds, userId) {
  if (!userId) return false;
  return starredIds.has(String(userId));
}
