/**
 * Reglas de confirmación de rol.
 *
 * El rol por defecto del proveedor es 'student', así que tenerlo no prueba nada. Solo cuenta
 * como confirmado cuando se ha leído de verdad de la base de datos (no un respaldo tras error)
 * y pertenece al usuario de la sesión que se está mostrando.
 */

/** ¿El rol del contexto pertenece al usuario de esta sesión y se resolvió realmente? */
export function isRoleConfirmedForSession(session, roleConfirmedForUserId) {
  const userId = session?.user?.id ?? null;
  if (!userId || !roleConfirmedForUserId) return false;
  return roleConfirmedForUserId === userId;
}

/**
 * Qué hacer con una lectura de rol que acaba de llegar.
 * Descarta las respuestas del usuario anterior y no confirma los respaldos.
 */
export function nextRoleConfirmation({ currentUserId, resolvedForUserId, confirmed }) {
  if (!resolvedForUserId || resolvedForUserId !== currentUserId) {
    return { apply: false, confirmedForUserId: null };
  }
  return { apply: true, confirmedForUserId: confirmed ? resolvedForUserId : null };
}

/**
 * Solo una entrada confirmada evita la lectura. Una entrada antigua, sin `confirmed`,
 * o un respaldo tras error devuelve null para que se resuelva el rol real.
 */
export function roleFromConfirmedCache(entry) {
  if (entry?.confirmed !== true || !entry?.role) return null;
  return { role: entry.role, confirmed: true };
}

/** Un respaldo no se guarda: si se guardara, bloquearía la siguiente lectura real. */
export function shouldCacheResolvedRole(resolved) {
  return resolved?.confirmed === true && Boolean(resolved?.role);
}
