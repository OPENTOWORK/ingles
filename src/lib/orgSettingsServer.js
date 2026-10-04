import { CONFIG_TABLE, applyAuditedOrgSettings, assertAuditTransactionReady, isMissingRelationError } from '@/lib/adminChangeLog';
import {
  ORG_SETTING_FIELDS,
  persistedLegalIdentity,
  persistedOrgBranding,
  validateOrgSettingsPatch,
} from '@/lib/orgSettings';

const ALLOWED_KEYS = ORG_SETTING_FIELDS.map((field) => field.key);

export async function readOrgSettingRows(db) {
  const { data, error } = await db
    .from(CONFIG_TABLE)
    .select('id, clave, valor, tipo, descripcion')
    .in('clave', ALLOWED_KEYS);

  if (error) {
    if (isMissingRelationError(error)) {
      const missing = new Error('La tabla de configuración no está disponible.');
      missing.status = 503;
      throw missing;
    }
    throw new Error(error.message || 'No se pudo leer la configuración.');
  }
  return data || [];
}

export function presentOrgSettings(rows = []) {
  const grouped = new Map();
  for (const row of rows) {
    const key = String(row?.clave || '');
    if (!key) continue;
    const list = grouped.get(key) || [];
    list.push(row);
    grouped.set(key, list);
  }

  return ORG_SETTING_FIELDS.map((field) => {
    const matches = grouped.get(field.key) || [];
    return {
      ...field,
      value: matches.length === 1 && matches[0].valor != null ? String(matches[0].valor) : field.fallback,
      persisted: matches.length === 1 && String(matches[0].valor || '').trim() !== '',
      duplicate: matches.length > 1,
    };
  });
}

export async function saveOrgSettings(db, actorId, input) {
  const checked = validateOrgSettingsPatch(input);
  if (!checked.ok) {
    const invalid = new Error(checked.error);
    invalid.status = 400;
    throw invalid;
  }

  const rows = await readOrgSettingRows(db);
  const duplicates = presentOrgSettings(rows).filter((field) => field.duplicate);
  if (duplicates.length) {
    const ambiguous = new Error(
      `Hay varios registros para ${duplicates.map((field) => field.label).join(', ')}. La migración no borra datos: hay que dejar una sola fila por clave antes de guardar.`,
    );
    ambiguous.status = 409;
    throw ambiguous;
  }

  await assertAuditTransactionReady(db, actorId);
  const { saved } = await applyAuditedOrgSettings(db, actorId, checked.values);
  return { saved, fields: presentOrgSettings(await readOrgSettingRows(db)) };
}

export async function loadPersistedLegalIdentity(db) {
  if (!db) return {};
  try {
    const rows = await readOrgSettingRows(db);
    return persistedLegalIdentity(rows.filter((row) => {
      const same = rows.filter((item) => item.clave === row.clave);
      return same.length === 1;
    }));
  } catch (error) {
    console.error('[org-settings] legal identity', error);
    return {};
  }
}

export async function loadPersistedEmailBranding(db) {
  if (!db) return {};
  try {
    const rows = await readOrgSettingRows(db);
    const branding = persistedOrgBranding(rows.filter((row) => {
      const same = rows.filter((item) => item.clave === row.clave);
      return same.length === 1;
    }));
    return branding;
  } catch (error) {
    console.error('[org-settings] branding', error);
    return {};
  }
}
