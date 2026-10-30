import { getWeeklyChallenge, madridWeekday } from '@/data/weeklyTrainingChallenges';

function madridHour(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Europe/Madrid',
    hour: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date);
  return Number(parts.find((part) => part.type === 'hour')?.value);
}

/** Martes a las 10:00 en Madrid. El cron dispara a las 08:00 y a las 09:00 UTC para cubrir verano e invierno. */
export function isWeeklyTuesdaySendTime(date = new Date()) {
  return madridWeekday(date) === 'Tue' && madridHour(date) === 10;
}

/**
 * Datos del correo de esa semana. La solución y la letra correcta no salen de aquí.
 * @param {Date} [date]
 * @param {string} [origin]
 */
export function buildWeeklyChallengeEmailVariables(date = new Date(), origin = 'https://www.dralo.es') {
  const challenge = getWeeklyChallenge(date);
  const base = String(origin || 'https://www.dralo.es').replace(/\/$/, '');
  return {
    challenge_since: challenge.since,
    challenge_prompt: challenge.prompt,
    challenge_options: challenge.options.map((option) => `${option.id}) ${option.label}`).join('\n'),
    challenge_week_id: challenge.weekId,
    challenge_url: `${base}/training/`,
  };
}

function challengeCheckUrl(base, weekId, optionId) {
  const root = String(base || 'https://www.dralo.es/training/').trim();
  const url = new URL(root.includes('://') ? root : `https://www.dralo.es${root}`);
  if (weekId) url.searchParams.set('reto', weekId);
  if (optionId) url.searchParams.set('opcion', optionId);
  return url.toString();
}

const WEEKLY_PREHEADER =
  'Sabemos que vas a mil. Hoy no te pedimos una tarde libre: solo una pregunta y ganas de intentarlo.';

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function promptHtml(prompt) {
  const safe = escapeHtml(prompt).replace(/_____/g, '<span style="color:#5634d6;">_____</span>');
  return `“${safe}”`;
}

function optionRows(optionsText) {
  const lines = String(optionsText || '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  return lines
    .map((line) => {
      const match = line.match(/^([A-C])\)\s*(.*)$/);
      const letter = match ? match[1] : '';
      const label = match ? match[2] : line;
      return `<tr><td style="padding:0 0 8px;">
        <label style="display:block;cursor:pointer;color:#1d1857;background:#fbfaff;border:1px solid #e8e4f7;border-radius:12px;padding:14px 16px;font-size:17px;line-height:24px;">
          <input type="radio" name="opcion" value="${escapeHtml(letter)}" required style="width:16px;height:16px;accent-color:#5634d6;vertical-align:middle;margin:0 12px 0 0;" />
          <span style="color:#6c6989;font-size:13px;font-weight:bold;">${escapeHtml(letter)}</span>&nbsp;&nbsp;${escapeHtml(label)}
        </label>
      </td></tr>`;
    })
    .join('\n');
}

/**
 * Maqueta del reto semanal. La opción se marca en el correo y se comprueba en la web.
 * La solución no sale en el mensaje.
 * @param {Record<string, string>} variables
 */
export function renderWeeklyChallengeEmail(variables = {}) {
  const prompt = String(variables.challenge_prompt || '').trim();
  const options = String(variables.challenge_options || '').trim();
  const weekId = String(variables.challenge_week_id || '').trim();
  const url = String(variables.challenge_url || 'https://www.dralo.es/training/').trim();
  const checkUrl = challengeCheckUrl(url, weekId);
  const safeUrl = escapeHtml(url);
  const optionLines = options
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .join('\n');
  const formAction = escapeHtml(challengeCheckUrl(url).replace(/\?.*$/, ''));

  const text = [
    'EL RETO DEL MARTES',
    '',
    'Ese B2 está cada vez más cerca.',
    '',
    WEEKLY_PREHEADER,
    '',
    '5 minutos para ti. Un paso hacia tu examen.',
    '',
    '01 CALENTAMOS',
    '¿Cuál pondrías tú?',
    'Sin traductor. Confía en lo que sabes.',
    '',
    `“${prompt}”`,
    '',
    optionLines,
    '',
    'Marca una opción. Chequear respuesta abre el reto y te dice si has acertado y por qué.',
    '',
    `Chequear respuesta: ${checkUrl}`,
    '',
    '02 VAMOS A POR EL RETO',
    'Un ejercicio. Algo nuevo que aprender.',
    '',
    'Entra en Dralo, completa un ejercicio de Use of English B2 y quédate con una expresión que no conocías.',
    '',
    `Acepto el reto: ${url}`,
    '',
    'No hace falta hacerlo perfecto. Hace falta empezar.',
    '',
    'Un martes. Un reto. Un paso más.',
    'Nos vemos dentro.',
    'El equipo de Dralo',
  ].join('\n');

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>El reto del martes</title>
</head>
<body style="margin:0;padding:0;background-color:#fbfaff;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${escapeHtml(WEEKLY_PREHEADER)}</div>
  <table role="presentation" lang="es" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;background-color:#fbfaff;font-family:Arial,Helvetica,sans-serif;color:#1d1857;">
    <tr><td align="center" style="padding:24px 12px;">
      <!--[if mso]><table role="presentation" width="600" align="center"><tr><td><![endif]-->
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;max-width:600px;">
        <tr><td style="padding:8px 12px 24px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"><tr>
            <td><a href="https://www.dralo.es" style="font-size:23px;font-weight:800;letter-spacing:0.23px;line-height:28px;color:#1d1857;text-decoration:none;">Dralo Academy</a></td>
            <td align="right" style="font-size:11px;letter-spacing:1.5px;color:#6c6989;font-weight:bold;">EL RETO DEL MARTES</td>
          </tr></table>
        </td></tr>
        <tr><td bgcolor="#6a4be8" style="background-color:#6a4be8;border-radius:24px;padding:32px 28px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;table-layout:fixed;"><tr>
            <td width="68%" valign="middle" style="width:68%;padding-right:12px;">
              <p style="margin:0 0 20px;color:#ddd6fe;font-size:11px;line-height:18px;font-weight:bold;letter-spacing:2px;">B2 &nbsp; / &nbsp; USE OF ENGLISH</p>
              <h1 style="margin:0 0 18px;color:#ffffff;font-size:30px;line-height:35px;letter-spacing:-1px;">Ese B2 está cada vez más cerca.</h1>
              <p style="margin:0;color:#ede9fe;font-size:17px;line-height:26px;">${escapeHtml(WEEKLY_PREHEADER)}</p>
              <p style="margin:24px 0 0;font-size:13px;line-height:20px;color:#ffffff;">5 minutos para ti. Un paso hacia tu examen.</p>
            </td>
            <td width="32%" align="right" valign="middle" style="width:32%;"><a href="https://www.dralo.es" style="text-decoration:none;"><img src="https://www.dralo.es/mascot/3.png" width="150" alt="La mascota de Dralo te saluda" style="display:block;width:100%;max-width:150px;height:auto;border:0;"></a></td>
          </tr></table>
        </td></tr>
        <tr><td height="16" style="height:16px;font-size:1px;line-height:16px;">&nbsp;</td></tr>
        <tr><td bgcolor="#ffffff" style="background-color:#ffffff;border:1px solid #e8e4f7;border-radius:24px;padding:28px;">
          <p style="margin:0 0 12px;font-size:11px;font-weight:bold;letter-spacing:1.7px;color:#5634d6;">01 &nbsp; CALENTAMOS</p>
          <h2 style="margin:0 0 10px;font-size:25px;line-height:31px;letter-spacing:-0.5px;">¿Cuál pondrías tú?</h2>
          <p style="margin:0 0 22px;color:#6c6989;font-size:15px;line-height:23px;">Sin traductor. Confía en lo que sabes.</p>
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"><tr><td bgcolor="#fbfaff" style="background-color:#fbfaff;border-radius:14px;padding:22px 18px;">
            <p lang="en" style="margin:0;font-size:22px;line-height:32px;font-weight:bold;color:#1d1857;">${promptHtml(prompt)}</p>
          </td></tr></table>
          <form action="${formAction}" method="get" target="_blank" style="margin:18px 0 0;">
            <input type="hidden" name="reto" value="${escapeHtml(weekId)}" />
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
              ${optionRows(options)}
            </table>
            <p style="margin:6px 0 16px;font-size:12px;line-height:19px;color:#6c6989;">Marca una opción. Chequear respuesta abre el reto y te dice si has acertado y por qué.</p>
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%"><tr><td align="center" bgcolor="#5634d6" style="background-color:#5634d6;border-radius:12px;mso-padding-alt:18px 24px;">
              <button type="submit" style="display:block;width:100%;border:1px solid #5634d6;border-radius:12px;padding:18px 24px;background:#5634d6;font-size:17px;line-height:22px;font-weight:bold;text-align:center;text-decoration:none;color:#ffffff;cursor:pointer;">Chequear respuesta &nbsp; &rarr;</button>
            </td></tr></table>
          </form>
        </td></tr>
        <tr><td height="16" style="height:16px;font-size:1px;line-height:16px;">&nbsp;</td></tr>
        <tr><td bgcolor="#f0ebff" style="background-color:#f0ebff;border:1px solid #e8e4f7;border-radius:24px;padding:28px;">
          <p style="margin:0 0 12px;font-size:11px;font-weight:bold;letter-spacing:1.7px;color:#5634d6;">02 &nbsp; VAMOS A POR EL RETO</p>
          <h2 style="margin:0 0 12px;font-size:25px;line-height:31px;letter-spacing:-0.5px;">Un ejercicio. Algo nuevo que aprender.</h2>
          <p style="margin:0 0 24px;font-size:16px;line-height:25px;color:#4a4769;">Entra en Dralo, completa un ejercicio de <strong>Use of English B2</strong> y quédate con una expresión que no conocías.</p>
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%"><tr><td align="center" bgcolor="#5634d6" style="background-color:#5634d6;border-radius:12px;mso-padding-alt:18px 24px;">
            <a href="${safeUrl}" target="_blank" style="display:block;border:1px solid #5634d6;border-radius:12px;padding:18px 24px;font-size:17px;line-height:22px;font-weight:bold;text-align:center;text-decoration:none;color:#ffffff;">Acepto el reto &nbsp; &rarr;</a>
          </td></tr></table>
          <p style="margin:16px 0 0;text-align:center;color:#4a4769;font-size:12px;line-height:19px;">No hace falta hacerlo perfecto. Hace falta empezar.</p>
        </td></tr>
        <tr><td style="padding:30px 20px;text-align:center;">
          <p style="margin:0 0 8px;font-size:18px;line-height:26px;font-weight:bold;">Un martes. Un reto. Un paso más.</p>
          <p style="margin:0;color:#6c6989;font-size:14px;line-height:22px;">Nos vemos dentro.<br>El equipo de Dralo</p>
        </td></tr>
      </table>
      <!--[if mso]></td></tr></table><![endif]-->
    </td></tr>
  </table>
</body>
</html>`;

  return { html, text, preheader: WEEKLY_PREHEADER };
}
