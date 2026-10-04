import { ORG_SETTING_FIELDS } from '@/lib/orgSettings';

export const CHANGE_LOG_TABLE = 'config_log_cambios';
export const CONFIG_TABLE = 'config_parametros';
export const PROFILE_TABLE = 'Usuarios_y_Perfil_users';

export const AUDIT_MIGRATION_REQUIRED =
  'No se ha guardado ningún cambio. La auditoría todavía no está activa en la base de datos.';

const SECRET_FIELD = /password|token|secret|clave_api|authorization/i;

export function isUndefinedFunctionError(error) {
  const msg = String(error?.message || error?.code || '').toLowerCase();
  return (
    error?.code === '42883' ||
    error?.code === 'PGRST202' ||
    msg.includes('could not find the function') ||
    (msg.includes('function') && msg.includes('does not exist'))
  );
}

export function isMissingRelationError(error) {
  const msg = String(error?.message || error?.code || '').toLowerCase();
  return (
    error?.code === '42P01' ||
    error?.code === 'PGRST205' ||
    msg.includes('does not exist') ||
    msg.includes('could not find the table')
  );
}

export function auditText(value) {
  if (value == null) return null;
  const text = String(value).trim();
  if (!text) return null;
  if (SECRET_FIELD.test(text)) return '[omitido]';
  return text.slice(0, 500);
}

export function migrationRequiredError() {
  const error = new Error(AUDIT_MIGRATION_REQUIRED);
  error.status = 503;
  return error;
}

function throwRpcError(error) {
  if (isUndefinedFunctionError(error)) throw migrationRequiredError();
  const message = error?.message || 'No se pudo aplicar el cambio.';
  const denied = /actor no administrador/i.test(message);
  const missingUser = /usuario no encontrado/i.test(message);
  const duplicate = /clave duplicada/i.test(message);
  const wrapped = new Error(
    denied ? 'Solo un administrador puede registrar este cambio.' : message,
  );
  wrapped.status = denied ? 403 : missingUser ? 404 : duplicate ? 409 : 500;
  throw wrapped;
}

/** Comprueba que la transacción de auditoría existe antes de cualquier escritura previa. */
export async function assertAuditTransactionReady(db, actorId) {
  const { data, error } = await db.rpc('admin_audit_ready', { p_actor: actorId });
  if (error) throwRpcError(error);
  if (data !== true) {
    const denied = new Error('Solo un administrador puede registrar este cambio.');
    denied.status = 403;
    throw denied;
  }
}

/**
 * Rol o estado y su historial, en la función SQL. No escribe si la migración no está aplicada.
 */
export async function applyAuditedProfileField(db, { actorId, userId, column, nextValue }) {
  const allowed = new Set(['rol_id', 'activo']);
  if (!allowed.has(column)) {
    throw new Error('Ese campo del perfil no se audita por esta vía.');
  }

  const { data, error } = await db.rpc('admin_apply_profile_field', {
    p_user_id: userId,
    p_column: column,
    p_value: nextValue == null ? null : String(nextValue),
    p_actor: actorId,
  });
  if (error) throwRpcError(error);
  return { changed: data === true, mode: 'transaction' };
}

/** Plan de la ficha y su historial. No incluye Auth ni Stripe. */
export async function applyAuditedPlan(db, { actorId, userId, planSlug }) {
  const { data, error } = await db.rpc('admin_apply_plan_change', {
    p_user_id: userId,
    p_plan: planSlug,
    p_actor: actorId,
  });
  if (error) throwRpcError(error);
  return { changed: data === true, mode: 'transaction' };
}

/** Todos los ajustes enviados y sus historiales, en una sola transacción. */
export async function applyAuditedOrgSettings(db, actorId, values) {
  const { data, error } = await db.rpc('admin_apply_org_settings', {
    p_actor: actorId,
    p_values: values,
  });
  if (error) throwRpcError(error);
  const saved = Array.isArray(data?.saved) ? data.saved : [];
  return { saved, mode: 'transaction' };
}

/** Respuesta cuando el plan de la ficha ya está confirmado. Auth puede seguir pendiente. */
export function buildAdminPlanWriteResult({ auditRecorded, authSynced, effective }) {
  const authSync = authSynced ? 'synced' : 'pending';
  return {
    ok: true,
    planSaved: true,
    authSync,
    auditRecorded: auditRecorded === true,
    stripeChanged: false,
    effectivePlanFromStripe: effective?.source === 'stripe',
    planSlug: effective?.planSlug ?? null,
    assignedPlanSlug: effective?.assignedPlanSlug ?? null,
    source: effective?.source ?? null,
    stripeStatus: effective?.stripeStatus || null,
    authSyncDetail:
      authSync === 'pending'
        ? 'El plan de la ficha y el historial ya están guardados. La sincronización con Auth sigue pendiente.'
        : null,
  };
}

export function settingLabel(key) {
  return ORG_SETTING_FIELDS.find((field) => field.key === key)?.label || key;
}
