/** Copia oculta de Trustpilot Automatic Feedback Service para dralo.es. */
export const TRUSTPILOT_AFS_BCC = 'dralo.es+d3c5c9120f@invite.trustpilot.com';

/** Un solo correo de cliente: bienvenida del día 7. */
export const TRUSTPILOT_AFS_TEMPLATE_SLUG = 'welcome_start_account';

export function trustpilotBccForTemplate(slug) {
  return slug === TRUSTPILOT_AFS_TEMPLATE_SLUG ? TRUSTPILOT_AFS_BCC : '';
}

export function trustpilotReferenceId(email) {
  return `welcome-day7:${String(email || '').trim().toLowerCase()}`;
}

/**
 * Trustpilot lee este bloque en el HTML. Va dentro de un comentario para que
 * el estudiante no lo vea y el cliente de correo no lo borre.
 * @param {string} html
 * @param {{ recipientEmail: string, recipientName?: string, senderEmail?: string }} params
 */
export function appendTrustpilotStructuredData(html, { recipientEmail, recipientName, senderEmail }) {
  const sender = String(senderEmail || 'support@dralo.es').trim() || 'support@dralo.es';
  /** @type {Record<string, string>} */
  const data = {
    recipientEmail: String(recipientEmail || '').trim(),
    referenceId: trustpilotReferenceId(recipientEmail),
    locale: 'es-ES',
    senderName: 'Dralo',
    senderEmail: sender,
    replyTo: sender,
  };
  const name = String(recipientName || '').trim();
  if (name) data.recipientName = name;

  const snippet = `<!--\n<script type="application/json+trustpilot">\n${JSON.stringify(data, null, 2)}\n</script>\n-->`;
  const source = String(html || '');
  if (source.includes('</body>')) return source.replace('</body>', `${snippet}\n</body>`);
  return `${source}\n${snippet}`;
}
