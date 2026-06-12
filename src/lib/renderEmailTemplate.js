/**
 * Sustituye variables {{clave}} en plantillas de correo.
 * @param {string} template
 * @param {Record<string, string | number | null | undefined>} variables
 */
export function renderEmailTemplate(template, variables = {}) {
  const src = String(template || '');
  return src.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_, key) => {
    const val = variables[key];
    if (val === null || val === undefined) return '';
    return String(val);
  });
}

export function buildDefaultEmailVariables(extra = {}) {
  const base =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    'https://www.dralo.es';
  const loginUrl = base.replace(/\/$/, '');

  return {
    login_url: loginUrl ? `Acceso: ${loginUrl}` : '',
    support_email: 'draloenglish@gmail.com',
    agent_name: 'Equipo Dralo',
    nombre: '',
    email: '',
    ticket_subject: '',
    temporary_password: '',
    message: '',
    ...extra,
  };
}

export function formatNombreVariable(name) {
  const trimmed = String(name || '').trim();
  if (!trimmed) return '';
  const first = trimmed.split(/\s+/)[0];
  return ` ${first}`;
}
