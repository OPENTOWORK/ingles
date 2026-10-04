/** Claves que Administración puede editar. Cualquier otra clave de config_parametros se ignora. */

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const ORG_SETTING_FIELDS = [
  {
    key: 'legal.titular',
    group: 'identificacion',
    label: 'Titular',
    type: 'text',
    maxLength: 120,
    fallback: 'Servipacar SL',
    scope: 'Primera línea del cuadro de identificación de los términos y condiciones.',
  },
  {
    key: 'legal.cif',
    group: 'identificacion',
    label: 'CIF',
    type: 'text',
    maxLength: 20,
    fallback: 'B82133760',
    scope: 'CIF del cuadro de identificación de los términos y condiciones.',
  },
  {
    key: 'org.nombre_publico',
    group: 'identificacion',
    label: 'Nombre comercial',
    type: 'text',
    maxLength: 80,
    fallback: 'Dralo',
    scope:
      'Cuadro de identificación de los términos y cabecera de los correos automáticos. El remitente técnico sigue siendo el del servidor.',
  },
  {
    key: 'legal.email_contacto',
    group: 'identificacion',
    label: 'Email de contacto',
    type: 'email',
    maxLength: 120,
    fallback: 'draloenglish@gmail.com',
    scope: 'Correo del cuadro de identificación de los términos y condiciones.',
  },
  {
    key: 'legal.web',
    group: 'identificacion',
    label: 'Web',
    type: 'text',
    maxLength: 120,
    fallback: 'Dralo',
    scope: 'Web del cuadro de identificación de los términos y condiciones.',
  },
  {
    key: 'org.razon_social',
    group: 'datos',
    label: 'Razón social',
    type: 'text',
    maxLength: 120,
    fallback: 'ETT OPEN TO WORK SL',
    scope:
      'Línea legal del pie de los correos automáticos. No cambia contratos, facturas ni textos legales ya publicados.',
  },
  {
    key: 'contacto.soporte_email',
    group: 'contactos',
    label: 'Correo de soporte',
    type: 'email',
    maxLength: 120,
    fallback: 'soporte@dralo.es',
    scope:
      'Dirección que se muestra en el pie de los correos automáticos. No cambia la cuenta desde la que se envían.',
  },
];

export const ORG_SETTING_GROUPS = [
  {
    id: 'identificacion',
    title: 'Identificación del titular',
    description: 'Este cuadro es el de los términos y condiciones. Lo que guardes aquí sustituye esas líneas.',
  },
  {
    id: 'datos',
    title: 'Datos de DRALO',
    description: 'Razón social del pie de los correos automáticos.',
  },
  {
    id: 'contactos',
    title: 'Contactos internos',
    description: 'Correo de soporte visible para quien recibe un correo de la plataforma.',
  },
  {
    id: 'preferencias',
    title: 'Preferencias generales',
    description:
      'Idioma y zona horaria no tienen un ajuste conectado. Las fechas de la plataforma siguen en Europe/Madrid y los textos no se traducen desde aquí.',
  },
];

const FIELD_BY_KEY = new Map(ORG_SETTING_FIELDS.map((field) => [field.key, field]));

export function isAllowedOrgSettingKey(key) {
  return FIELD_BY_KEY.has(String(key || ''));
}

export function validateOrgSettingValue(key, rawValue) {
  const field = FIELD_BY_KEY.get(String(key || ''));
  if (!field) return { ok: false, error: 'Ese ajuste no está permitido.' };
  const value = String(rawValue ?? '').trim();
  if (!value) return { ok: false, error: `${field.label} es obligatorio.` };
  if (value.length > field.maxLength) {
    return { ok: false, error: `${field.label} admite como máximo ${field.maxLength} caracteres.` };
  }
  if (field.type === 'email' && !EMAIL_PATTERN.test(value.toLowerCase())) {
    return { ok: false, error: `${field.label} no es un correo válido.` };
  }
  if (field.key === 'legal.cif') {
    const cif = value.toUpperCase();
    if (!/^[A-Z0-9][A-Z0-9-]{4,19}$/.test(cif)) {
      return { ok: false, error: `${field.label} no es válido.` };
    }
    return { ok: true, value: cif };
  }
  return { ok: true, value: field.type === 'email' ? value.toLowerCase() : value };
}

export function validateOrgSettingsPatch(input = {}) {
  const source = input && typeof input === 'object' ? input : {};
  const keys = Object.keys(source);
  if (!keys.length) return { ok: false, error: 'No hay cambios para guardar.' };
  const values = {};
  for (const key of keys) {
    if (!isAllowedOrgSettingKey(key)) {
      return { ok: false, error: 'Hay un ajuste que no está en la lista permitida.' };
    }
    const checked = validateOrgSettingValue(key, source[key]);
    if (!checked.ok) return checked;
    values[key] = checked.value;
  }
  return { ok: true, values };
}

/** Valores guardados que los correos pueden usar. Los fallbacks no se aplican solos. */
export function persistedOrgBranding(rows = []) {
  const byKey = new Map(
    (rows || [])
      .filter((row) => row?.clave && row.valor != null && String(row.valor).trim())
      .map((row) => [row.clave, String(row.valor).trim()]),
  );
  return {
    brandName: byKey.get('org.nombre_publico') || '',
    legalName: byKey.get('org.razon_social') || '',
    supportEmail: byKey.get('contacto.soporte_email') || '',
  };
}

/** Valores guardados del cuadro de identificación. Sin fila, el documento legal no cambia. */
export function persistedLegalIdentity(rows = []) {
  const byKey = new Map(
    (rows || [])
      .filter((row) => row?.clave && row.valor != null && String(row.valor).trim())
      .map((row) => [row.clave, String(row.valor).trim()]),
  );
  return {
    titular: byKey.get('legal.titular') || '',
    cif: byKey.get('legal.cif') || '',
    brandName: byKey.get('org.nombre_publico') || '',
    contactEmail: byKey.get('legal.email_contacto') || '',
    web: byKey.get('legal.web') || '',
  };
}

const IDENTITY_TERM_KEYS = {
  'titular:': 'titular',
  'cif:': 'cif',
  'nombre comercial:': 'brandName',
  'email de contacto:': 'contactEmail',
  'web:': 'web',
};

export function applyLegalIdentityDescription(term, description, identity) {
  const key = IDENTITY_TERM_KEYS[String(term || '').trim().toLowerCase()];
  const value = key ? String(identity?.[key] || '').trim() : '';
  return value || description;
}
