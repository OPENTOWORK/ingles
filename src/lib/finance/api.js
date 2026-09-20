import { NextResponse } from 'next/server';
import { authenticateFinanceRequest } from '@/lib/finance/access';
import { DEFAULT_PAGE_SIZE } from '@/lib/finance/constants';

/** Respuesta JSON de error sin filtrar detalles internos al cliente. */
export function financeError(message, status = 500) {
  return NextResponse.json({ error: message }, { status });
}

/**
 * Traduce errores de Postgres a mensajes accionables.
 * Las excepciones lanzadas por nuestras funciones/triggers llevan mensaje propio en español.
 */
export function describeDbError(error, fallback = 'No se ha podido completar la operación.') {
  const message = String(error?.message || '');

  if (!message) return fallback;

  // Mensajes propios de los guardarraíles financieros (siempre en español y seguros de exponer).
  if (/^(Factura|Asiento|Cuenta|Ejercicio|El |La |Un |Una |Solo |No existe|Indica)/.test(message)) {
    return message;
  }

  if (error?.code === '23505') {
    if (message.includes('fin_invoices_number_key')) return 'Ya existe una factura con ese número.';
    if (message.includes('fin_parties_tax_id_key')) return 'Ya existe un tercero con ese NIF/CIF.';
    if (message.includes('fin_payments_idempotency_key')) return 'Este cobro ya estaba registrado.';
    if (message.includes('fin_treasury_accounts_name_key')) return 'Ya existe una cuenta con ese nombre.';
    if (message.includes('fin_invoice_series')) return 'Ya existe una serie con ese código.';
    return 'Ya existe un registro con esos datos.';
  }

  if (error?.code === '23503') return 'El registro está relacionado con otros datos y no se puede modificar.';
  if (error?.code === '23514') return 'Los datos no cumplen las reglas de integridad financiera.';
  if (error?.code === '42501') return 'Sin permiso para esta operación.';

  return fallback;
}

/**
 * Envoltorio estándar de los handlers del área financiera:
 * autentica, comprueba capability y normaliza errores.
 *
 * @param {Request} req
 * @param {string} permission clave de FINANCE_PERMISSIONS
 * @param {(ctx: { db: object, user: object, searchParams: URLSearchParams, req: Request }) => Promise<Response>} handler
 */
export async function withFinanceAuth(req, permission, handler) {
  try {
    const auth = await authenticateFinanceRequest(req, permission);
    if (auth.error) return financeError(auth.error, auth.status);

    const { searchParams } = new URL(req.url);
    return await handler({ db: auth.db, user: auth.user, searchParams, req, auth });
  } catch (err) {
    console.error(`[finanzas:${permission}]`, err);
    return financeError(describeDbError(err), 500);
  }
}

/** Lee parámetros de paginación de la query con límites razonables. */
export function readPagination(searchParams) {
  const page = Math.max(1, Number(searchParams.get('page')) || 1);
  const rawSize = Number(searchParams.get('pageSize')) || DEFAULT_PAGE_SIZE;
  const pageSize = Math.min(200, Math.max(1, rawSize));
  return { page, pageSize, from: (page - 1) * pageSize, to: page * pageSize - 1 };
}

/** Normaliza un texto opcional: cadena vacía → null. */
export function optionalText(value) {
  const text = String(value ?? '').trim();
  return text ? text : null;
}

/** Normaliza un importe recibido del cliente. */
export function parseAmount(value) {
  const n = typeof value === 'string' ? Number(value.replace(',', '.')) : Number(value);
  return Number.isFinite(n) ? Math.round(n * 100) / 100 : null;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Valida un UUID antes de usarlo en una consulta. */
export function parseUuid(value) {
  const text = String(value ?? '').trim();
  return UUID_RE.test(text) ? text : null;
}

/** Valida una fecha `YYYY-MM-DD`. */
export function parseDate(value) {
  const text = String(value ?? '').trim().slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) return null;
  const d = new Date(`${text}T00:00:00Z`);
  return Number.isNaN(d.getTime()) ? null : text;
}

/** Registra una acción en el log de auditoría financiera sin romper la operación principal. */
export async function logFinanceAudit(db, { entityType, entityId, action, detail = {}, actorId }) {
  try {
    await db.from('fin_audit_log').insert({
      entity_type: entityType,
      entity_id: entityId || null,
      action,
      detail,
      actor_id: actorId || null,
    });
  } catch (err) {
    console.error('[finanzas:audit]', err);
  }
}
