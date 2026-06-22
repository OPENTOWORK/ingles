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
  const labeled = trimmed.match(/^(?:Acceso|Únete aquí|Unirse aquí|Join here):\s*(https?:\/\/\S+)/i);
  if (labeled) return labeled[1];
  if (/^https?:\/\/\S+$/.test(trimmed)) return trimmed;
  return null;
}

/**
 * Convierte texto plano de plantilla en HTML con marca Dralo + CTA.
 * @param {string} plainText
 * @param {{ preheader?: string, ctaLabel?: string }} [options]
 */
export function buildBrandedEmailFromPlainText(plainText, options = {}) {
  const text = String(plainText || '').trim();
  const blocks = text.split(/\n\n+/).map((b) => b.trim()).filter(Boolean);

  /** @type {Array<{ type: string, html: string }>} */
  const bodyBlocks = [];
  let ctaUrl = null;
  let ctaLabel = options.ctaLabel || 'Ir a Dralo';
  let footerLine = 'Dralo English · dralo.es';

  for (const block of blocks) {
    if (block.startsWith('—')) {
      footerLine = block.replace(/^—\s*/, '').trim() || footerLine;
      continue;
    }

    const url = extractUrl(block);
    if (url) {
      ctaUrl = url;
      if (/invita|invit/i.test(text)) ctaLabel = 'Aceptar invitación';
      else if (/contraseña|cuenta ha sido creada/i.test(text)) ctaLabel = 'Iniciar sesión';
      else if (/registr/i.test(text)) ctaLabel = 'Empezar a practicar';
      continue;
    }

    if (block.startsWith('Mensaje personal:')) {
      const quote = block.replace(/^Mensaje personal:\s*/i, '').trim();
      bodyBlocks.push({
        type: 'quote',
        html: `<blockquote style="margin:0;padding:14px 16px;border-left:4px solid #6366f1;background:#f8fafc;border-radius:0 8px 8px 0;color:#334155;font-style:italic;">${nl2br(quote)}</blockquote>`,
      });
      continue;
    }

    if (/^Asunto:/i.test(block)) {
      bodyBlocks.push({
        type: 'info',
        html: `<p style="margin:0;padding:12px 14px;background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;color:#1e40af;font-size:14px;"><strong>Asunto:</strong> ${escapeHtml(block.replace(/^Asunto:\s*/i, ''))}</p>`,
      });
      continue;
    }

    if (/Contraseña temporal:/i.test(block)) {
      bodyBlocks.push({
        type: 'credentials',
        html: `<div style="margin:0;padding:14px 16px;background:#fffbeb;border:1px solid #fcd34d;border-radius:8px;font-size:14px;color:#78350f;line-height:1.55;">${nl2br(block)}</div>`,
      });
      continue;
    }

    if (/^Email:/i.test(block)) {
      bodyBlocks.push({
        type: 'info',
        html: `<p style="margin:0;font-size:14px;color:#475569;line-height:1.6;">${nl2br(block)}</p>`,
      });
      continue;
    }

    bodyBlocks.push({
      type: 'p',
      html: `<p style="margin:0 0 14px;font-size:15px;line-height:1.65;color:#334155;">${nl2br(block)}</p>`,
    });
  }

  const preheader = escapeHtml(options.preheader || blocks[0]?.slice(0, 120) || 'Dralo English');
  const bodyHtml = bodyBlocks.map((b) => b.html).join('\n');

  const ctaHtml = ctaUrl
    ? `<table role="presentation" cellspacing="0" cellpadding="0" style="margin:24px auto 8px;"><tr><td style="border-radius:10px;background:linear-gradient(135deg,#2563eb 0%,#4f46e5 100%);"><a href="${escapeHtml(ctaUrl)}" target="_blank" rel="noopener noreferrer" style="display:inline-block;padding:14px 28px;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:10px;">${escapeHtml(ctaLabel)}</a></td></tr></table>
       <p style="margin:8px 0 0;font-size:12px;color:#64748b;text-align:center;word-break:break-all;"><a href="${escapeHtml(ctaUrl)}" style="color:#6366f1;">${escapeHtml(ctaUrl)}</a></p>`
    : '';

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Dralo English</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',system-ui,-apple-system,sans-serif;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${preheader}</div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f1f5f9;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;">
          <tr>
            <td style="padding:0 0 20px;text-align:center;">
              <div style="display:inline-block;padding:10px 18px;border-radius:12px;background:linear-gradient(135deg,#0f172a 0%,#1e293b 100%);">
                <span style="font-size:20px;font-weight:800;color:#f8fafc;letter-spacing:-0.02em;">Dralo</span>
                <span style="font-size:20px;font-weight:600;color:#93c5fd;margin-left:4px;">English</span>
              </div>
            </td>
          </tr>
          <tr>
            <td style="background:#ffffff;border-radius:16px;border:1px solid #e2e8f0;box-shadow:0 4px 24px rgba(15,23,42,0.08);padding:32px 28px;">
              ${bodyHtml}
              ${ctaHtml}
            </td>
          </tr>
          <tr>
            <td style="padding:20px 8px 0;text-align:center;font-size:12px;line-height:1.5;color:#64748b;">
              ${escapeHtml(footerLine)}<br />
              <a href="https://dralo.es" style="color:#6366f1;text-decoration:none;">dralo.es</a>
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
