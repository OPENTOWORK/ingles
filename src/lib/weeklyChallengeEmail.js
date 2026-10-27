import { getWeeklyChallenge, madridWeekday } from '@/data/weeklyTrainingChallenges';

/** De martes a domingo. El lunes ya es la víspera del reto siguiente. */
const MAIL_DAYS = new Set(['Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);

/** Tope por ejecución del cron, para no alargar la petición. */
export const WEEKLY_CHALLENGE_SEND_CAP = 40;

export function isWeeklyChallengeMailDay(date = new Date()) {
  return MAIL_DAYS.has(madridWeekday(date));
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
    challenge_solution: challenge.solution,
    challenge_url: `${base}/training/`,
  };
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
    .map((line, index) => {
      const match = line.match(/^([A-C])\)\s*(.*)$/);
      const letter = match ? match[1] : '';
      const label = match ? match[2] : line;
      const border = index === lines.length - 1 ? '' : 'border-bottom:1px solid #e8e4f7;';
      return `<tr><td style="${border}padding:14px 4px;font-size:17px;line-height:24px;"><span style="color:#6c6989;font-size:13px;font-weight:bold;">${escapeHtml(letter)} &nbsp;&nbsp;</span> ${escapeHtml(label)}</td></tr>`;
    })
    .join('\n');
}

function solutionHtml(solution) {
  const text = String(solution || '').trim();
  const splitAt = text.indexOf('. ');
  if (splitAt === -1) return `<strong style="color:#1d1857;">${escapeHtml(text)}</strong>`;
  return `<strong style="color:#1d1857;">${escapeHtml(text.slice(0, splitAt + 1))}</strong> ${escapeHtml(text.slice(splitAt + 2))}`;
}

/**
 * Maqueta del reto semanal. La pregunta va primero; la explicación, debajo del botón.
 * @param {Record<string, string>} variables
 */
export function renderWeeklyChallengeEmail(variables = {}) {
  const prompt = String(variables.challenge_prompt || '').trim();
  const options = String(variables.challenge_options || '').trim();
  const solution = String(variables.challenge_solution || '').trim();
  const url = String(variables.challenge_url || 'https://www.dralo.es/training/').trim();
  const safeUrl = escapeHtml(url);

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
    options,
    '',
    'Elige mentalmente tu respuesta. La solución está al final.',
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
    '',
    'LA SOLUCIÓN, SIN MISTERIO',
    solution,
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
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top:18px;">
            ${optionRows(options)}
          </table>
          <p style="margin:14px 0 0;font-size:12px;line-height:19px;color:#6c6989;">Elige mentalmente tu respuesta. La solución está al final.</p>
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
        <tr><td style="border-top:1px solid #e8e4f7;padding:24px 20px 8px;">
          <p style="margin:0 0 8px;font-size:11px;font-weight:bold;letter-spacing:1.4px;color:#6c6989;">LA SOLUCIÓN, SIN MISTERIO</p>
          <p style="margin:0;font-size:14px;line-height:23px;color:#6c6989;">${solutionHtml(solution)}</p>
        </td></tr>
      </table>
      <!--[if mso]></td></tr></table><![endif]-->
    </td></tr>
  </table>
</body>
</html>`;

  return { html, text, preheader: WEEKLY_PREHEADER };
}
