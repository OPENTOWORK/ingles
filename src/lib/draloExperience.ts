import type { SupabaseClient } from '@supabase/supabase-js';
import { getLevelInfo, type DraloLevelInfo } from '@/lib/dralo-levels';
import { isSchemaNotReadyError } from '@/lib/teacherAccess';

/**
 * Catálogo de niveles en Supabase (`nivel`, `rango`). Los nombres activos viven en código
 * (`dralo-levels.ts`); esta tabla queda como referencia opcional.
 */
export const DRALO_EXPERIENCE_CATALOG_TABLE = 'DraloIA_Experience';

/** XP del usuario: `id_usuario` + columna `XP`. */
export const DRALO_USER_XP_TABLE = 'DraloIA_nivel_usuario';

const USER_COLUMNS = 'id, id_usuario, XP, id_experiencia, created_at';

export type DraloUserXpRow = {
  id: string;
  id_usuario: string;
  XP: number | null;
  id_experiencia: string | null;
  created_at: string;
};

export type DraloXpResult = {
  totalXp: number;
  levelInfo: DraloLevelInfo;
  hasRecord: boolean;
  rowId: string | null;
};

function parseXpValue(value: unknown): number {
  const n = Number(value);
  return Number.isFinite(n) ? Math.max(0, Math.floor(n)) : 0;
}

function buildXpResult(row: DraloUserXpRow | null, totalXp: number): DraloXpResult {
  return {
    totalXp,
    levelInfo: getLevelInfo(totalXp),
    hasRecord: Boolean(row?.id),
    rowId: row?.id ?? null,
  };
}

/**
 * Lee el XP total del usuario desde `DraloIA_nivel_usuario`.
 * Si hay varias filas, usa la más reciente (`created_at`).
 */
export async function getDraloUserXp(
  db: SupabaseClient,
  userId: string,
): Promise<DraloXpResult> {
  const { data, error } = await db
    .from(DRALO_USER_XP_TABLE)
    .select(USER_COLUMNS)
    .eq('id_usuario', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    if (isSchemaNotReadyError(error)) {
      return buildXpResult(null, 0);
    }
    throw new Error(error.message || 'No se pudo leer el XP de Dralo IA.');
  }

  const row = (data as DraloUserXpRow | null) ?? null;
  return buildXpResult(row, parseXpValue(row?.XP));
}

/**
 * Suma XP de forma segura y devuelve el estado actualizado.
 *
 * - `amount` debe ser > 0.
 * - Crea fila si el usuario aún no tiene registro.
 * - No modifica `DraloIA_Experience` (catálogo); el nivel se calcula en código.
 */
export async function addDraloXp(
  db: SupabaseClient,
  userId: string,
  amount: number,
): Promise<DraloXpResult> {
  const delta = Math.floor(Number(amount));
  if (!Number.isFinite(delta) || delta <= 0) {
    throw new Error('amount debe ser un número positivo.');
  }

  const current = await getDraloUserXp(db, userId);
  const nextTotal = current.levelInfo.currentXp + delta;

  if (current.hasRecord && current.rowId) {
    const { data, error } = await db
      .from(DRALO_USER_XP_TABLE)
      .update({ XP: nextTotal })
      .eq('id', current.rowId)
      .select(USER_COLUMNS)
      .single();

    if (error) {
      throw new Error(error.message || 'No se pudo actualizar el XP.');
    }

    return buildXpResult(data as DraloUserXpRow, nextTotal);
  }

  const { data, error } = await db
    .from(DRALO_USER_XP_TABLE)
    .insert({
      id_usuario: userId,
      XP: nextTotal,
      id_experiencia: null,
    })
    .select(USER_COLUMNS)
    .single();

  if (error) {
    throw new Error(error.message || 'No se pudo crear el registro de XP.');
  }

  return buildXpResult(data as DraloUserXpRow, nextTotal);
}
