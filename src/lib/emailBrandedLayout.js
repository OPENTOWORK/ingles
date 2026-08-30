function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function nl2br(text) {
  return escapeHtml(text).replace(/\n/g, '<br />');
}

function extractUrl(line) {
  const trimmed = String(line || '').trim();
  const labeled = trimmed.match(
    /^(?:Acceso|Únete aquí|Unirse aquí|Join here|Acceso:|Login:)\s*(https?:\/\/\S+)/i,
  );
  if (labeled) return labeled[1];
  if (/^https?:\/\/\S+$/.test(trimmed)) return trimmed;
  return null;
}

function initialsFromName(name = '') {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return 'D';
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();
  return `${parts[0].slice(0, 1)}${parts[1].slice(0, 1)}`.toUpperCase();
}

/**
 * Convierte texto plano de plantilla en HTML con marca Dralo + CTA.
 * @param {string} plainText
 * @param {{ preheader?: string, ctaLabel?: string, headline?: string, senderName?: string }} [options]
 */
export function buildBrandedEmailFromPlainText(plainText, options = {}) {
  const text = String(plainText || '').trim();
  const blocks = text.split(/\n\n+/).map((b) => b.trim()).filter(Boolean);

  /** @type {Array<{ type: string, html: string }>} */
  const bodyBlocks = [];
  let ctaUrl = null;
  let ctaLabel = options.ctaLabel || 'Ir a Dralo';
  let footerLine = options.senderName
    ? `${options.senderName} · Dralo English`
    : 'Equipo Dralo · dralo.es';

  for (const block of blocks) {
    if (block.startsWith('—')) {
      footerLine = block.replace(/^—\s*/, '').trim() || footerLine;
      continue;
    }

    const url = extractUrl(block);
    if (url) {
      ctaUrl = url;
      if (!options.ctaLabel) {
        if (/invita|invit/i.test(text)) ctaLabel = 'Aceptar invitación';
        else if (/contraseña|cuenta ha sido creada/i.test(text)) ctaLabel = 'Iniciar sesión';
        else if (/registr/i.test(text)) ctaLabel = 'Empezar a practicar';
        else if (/confirm/i.test(text)) ctaLabel = 'Confirmar mi email';
        else if (/contraseña|password/i.test(text)) ctaLabel = 'Crear nueva contraseña';
      }
      continue;
    }

    if (block.startsWith('Mensaje personal:')) {
      const quote = block.replace(/^Mensaje personal:\s*/i, '').trim();
      bodyBlocks.push({
        type: 'quote',
        html: `<blockquote style="margin:18px 0 0;padding:16px 18px;border-left:4px solid #6366f1;background:linear-gradient(90deg,#f8fafc 0%,#ffffff 100%);border-radius:0 12px 12px 0;color:#334155;font-style:italic;font-size:15px;line-height:1.6;">${nl2br(quote)}</blockquote>`,
      });
      continue;
    }

    if (/^Asunto:/i.test(block)) {
      bodyBlocks.push({
        type: 'info',
        html: `<p style="margin:0;padding:12px 14px;background:#eff6ff;border:1px solid #bfdbfe;border-radius:10px;color:#1e40af;font-size:14px;"><strong>Asunto:</strong> ${escapeHtml(block.replace(/^Asunto:\s*/i, ''))}</p>`,
      });
      continue;
    }

    if (/Contraseña temporal:/i.test(block)) {
      bodyBlocks.push({
        type: 'credentials',
        html: `<div style="margin:0;padding:16px 18px;background:#fffbeb;border:1px solid #fcd34d;border-radius:12px;font-size:14px;color:#78350f;line-height:1.6;">${nl2br(block)}</div>`,
      });
      continue;
    }

    if (/^Email:/i.test(block)) {
      bodyBlocks.push({
        type: 'info',
        html: `<p style="margin:0;font-size:14px;color:#475569;line-height:1.65;">${nl2br(block)}</p>`,
      });
      continue;
    }

    bodyBlocks.push({
      type: 'p',
      html: `<p style="margin:0 0 16px;font-size:16px;line-height:1.7;color:#1e293b;">${nl2br(block)}</p>`,
    });
  }

  const preheader = escapeHtml(options.preheader || options.headline || blocks[0]?.slice(0, 120) || 'Dralo English');
  const headline = options.headline ? escapeHtml(options.headline) : '';
  const bodyHtml = bodyBlocks.map((b) => b.html).join('\n');
  const senderLabel = footerLine.split('·')[0]?.trim() || 'Equipo Dralo';
  const senderInitials = initialsFromName(senderLabel);

  const ctaHtml = ctaUrl
    ? `<table role="presentation" cellspacing="0" cellpadding="0" style="margin:28px auto 10px;"><tr><td style="border-radius:12px;background:linear-gradient(135deg,#2563eb 0%,#4f46e5 55%,#7c3aed 100%);box-shadow:0 8px 20px rgba(79,70,229,0.28);"><a href="${escapeHtml(ctaUrl)}" target="_blank" rel="noopener noreferrer" style="display:inline-block;padding:15px 30px;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:12px;letter-spacing:0.01em;">${escapeHtml(ctaLabel)}</a></td></tr></table>
       <p style="margin:10px 0 0;font-size:12px;color:#94a3b8;text-align:center;word-break:break-all;line-height:1.5;"><a href="${escapeHtml(ctaUrl)}" style="color:#6366f1;text-decoration:none;">${escapeHtml(ctaUrl)}</a></p>`
    : '';

  const signatureHtml = `<table role="presentation" cellspacing="0" cellpadding="0" style="margin-top:28px;padding-top:22px;border-top:1px solid #e2e8f0;width:100%;">
    <tr>
      <td style="width:44px;vertical-align:top;">
        <div style="width:40px;height:40px;border-radius:12px;background:linear-gradient(135deg,#4f46e5,#2563eb);color:#fff;font-size:14px;font-weight:800;line-height:40px;text-align:center;">${escapeHtml(senderInitials)}</div>
      </td>
      <td style="vertical-align:middle;padding-left:12px;">
        <p style="margin:0;font-size:14px;font-weight:700;color:#0f172a;">${escapeHtml(senderLabel)}</p>
        <p style="margin:4px 0 0;font-size:12px;color:#64748b;">Dralo English · Academia online de inglés</p>
      </td>
    </tr>
  </table>`;

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="light" />
  <meta name="supported-color-schemes" content="light" />
  <title>Dralo English</title>
</head>
<body style="margin:0;padding:0;background:#eef2ff;font-family:'Segoe UI',system-ui,-apple-system,BlinkMacSystemFont,sans-serif;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${preheader}</div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#eef2ff;padding:36px 16px 44px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;">
          <tr>
            <td style="padding:0 0 18px;text-align:center;">
              <table role="presentation" cellspacing="0" cellpadding="0" align="center">
                <tr>
                  <td style="border-radius:16px;background:linear-gradient(135deg,#0f172a 0%,#1e293b 100%);padding:14px 22px;box-shadow:0 10px 30px rgba(15,23,42,0.18);">
                    <span style="font-size:22px;font-weight:800;color:#f8fafc;letter-spacing:-0.03em;">Dralo</span>
                    <span style="font-size:22px;font-weight:600;color:#93c5fd;margin-left:5px;">English</span>
                  </td>
                </tr>
              </table>
              <p style="margin:12px 0 0;font-size:13px;color:#64748b;letter-spacing:0.02em;">Practice English smarter · Cambridge-style exams</p>
            </td>
          </tr>
          <tr>
            <td style="background:#ffffff;border-radius:18px;border:1px solid #dbeafe;box-shadow:0 12px 40px rgba(79,70,229,0.10);overflow:hidden;">
              <div style="height:5px;background:linear-gradient(90deg,#2563eb 0%,#6366f1 50%,#8b5cf6 100%);"></div>
              <div style="padding:34px 30px 30px;">
                ${headline ? `<h1 style="margin:0 0 18px;font-size:22px;line-height:1.35;font-weight:800;color:#0f172a;letter-spacing:-0.02em;">${headline}</h1>` : ''}
                ${bodyHtml || `<p style="margin:0;font-size:16px;line-height:1.7;color:#1e293b;">${nl2br(text)}</p>`}
                ${ctaHtml}
                ${signatureHtml}
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding:22px 10px 0;text-align:center;font-size:12px;line-height:1.7;color:#64748b;">
              <p style="margin:0 0 8px;">
                <a href="https://dralo.es" style="color:#4f46e5;text-decoration:none;font-weight:600;">dralo.es</a>
                &nbsp;·&nbsp;
                <a href="https://dralo.es/contacto" style="color:#4f46e5;text-decoration:none;">Contacto</a>
                &nbsp;·&nbsp;
                <a href="mailto:draloenglish@gmail.com" style="color:#4f46e5;text-decoration:none;">Soporte</a>
              </p>
              <p style="margin:0;color:#94a3b8;">© ${new Date().getFullYear()} Dralo English. Todos los derechos reservados.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return { html, text };
}

/**
 * Envoltorio rápido para mensajes manuales (admin / profesor).
 */
export function buildBrandedManualMessageEmail({ message, subject, senderName }) {
  const text = [message, '', '—', `${senderName} · Dralo English`].join('\n');
  return buildBrandedEmailFromPlainText(text, {
    headline: subject,
    preheader: message.slice(0, 140),
    senderName,
  });
}
