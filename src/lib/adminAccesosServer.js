import {
  assertAuditTransactionReady,
  isMissingRelationError,
  isUndefinedFunctionError,
  migrationRequiredError,
} from '@/lib/adminChangeLog';
import { presentAcceso, validateAccesoWeb } from '@/lib/adminAccesos';

const TABLE = 'admin_accesos_web';

function throwAccesoError(error) {
  if (isUndefinedFunctionError(error) || isMissingRelationError(error)) throw migrationRequiredError();
  const message = error?.message || 'No se pudo guardar el acceso.';
  const denied = /actor no administrador/i.test(message);
  const missing = /no existe/i.test(message);
  const wrapped = new Error(denied ? 'Solo un administrador puede registrar este cambio.' : message);
  wrapped.status = denied ? 403 : missing ? 404 : 500;
  throw wrapped;
}

export async function listAccesosWeb(db) {
  const { data, error } = await db
    .from(TABLE)
    .select('id, nombre, url, para_que, conectado_con, usuario, correo, contrasena, actualizado_en')
    .order('nombre', { ascending: true });
  if (error) throwAccesoError(error);
  return (data || []).map(presentAcceso);
}

export async function saveAccesoWeb(db, actorId, input, { id = null } = {}) {
  const checked = validateAccesoWeb(input, { editing: Boolean(id) });
  if (!checked.ok) {
    const error = new Error(checked.error);
    error.status = 400;
    throw error;
  }
  await assertAuditTransactionReady(db, actorId);
  const value = checked.value;
  const { data, error } = await db.rpc('admin_save_acceso_web', {
    p_actor: actorId,
    p_id: id,
    p_nombre: value.nombre,
    p_url: value.url,
    p_para_que: value.paraQue,
    p_conectado_con: value.conectadoCon,
    p_usuario: value.usuario,
    p_correo: value.correo,
    p_contrasena: value.contrasena,
    p_keep_password: value.keepPassword,
  });
  if (error) throwAccesoError(error);
  return { id: data };
}

export async function deleteAccesoWeb(db, actorId, id) {
  await assertAuditTransactionReady(db, actorId);
  const { error } = await db.rpc('admin_delete_acceso_web', {
    p_actor: actorId,
    p_id: id,
  });
  if (error) throwAccesoError(error);
}
