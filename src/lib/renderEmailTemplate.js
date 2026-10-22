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
    app_url: loginUrl,
    action_url: '',
    support_email: 'draloenglish@gmail.com',
    agent_name: 'Equipo Dralo',
    nombre: '',
    email: '',
    ticket_subject: '',
    temporary_password: '',
    message: '',
    sender_name: '',
    invite_message: '',
    invite_url: loginUrl ? `${loginUrl}/registro` : '',
    creator_name: '',
    task_titulo: '',
    task_prioridad: '',
    task_estado: '',
    task_fase: '',
    task_subfase: '',
    task_fecha_limite: '',
    task_fase_line: '',
    task_subfase_line: '',
    task_fecha_line: '',
    task_descripcion_line: '',
    task_enlace: '',
    tasks_url: '',
    ...extra,
  };
}

/**
 * Saca del cuerpo las líneas de entrega que no deben verse en el correo:
 * `Preheader: …` (texto de vista previa) y `CTA: …` (etiqueta del botón).
 * @param {string} template
 */
export function splitEmailDeliveryMeta(template) {
  let preheader = '';
  let ctaLabel = '';
  const body = [];

  for (const line of String(template || '').split('\n')) {
    const preview = line.match(/^\s*Preheader:\s*(.*)$/i);
    if (preview) {
      preheader = preview[1].trim();
      continue;
    }
    const cta = line.match(/^\s*CTA:\s*(.*)$/i);
    if (cta) {
      ctaLabel = cta[1].trim();
      continue;
    }
    body.push(line);
  }

  return {
    preheader,
    ctaLabel,
    text: body.join('\n').replace(/^\n+|\n+$/g, '').replace(/\n{3,}/g, '\n\n'),
  };
}

export function formatNombreVariable(name) {
  const trimmed = String(name || '').trim();
  if (!trimmed) return '';
  const first = trimmed.split(/\s+/)[0];
  return ` ${first}`;
}
