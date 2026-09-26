/**
 * One-off: Dralofelicidades de cumpleaños a Ramón.
 *   node --loader ./scripts/alias-loader.mjs scripts/send-ramon-birthday.mjs
 */
import { loadEnvLocal } from './load-env-local.mjs';

loadEnvLocal();

import { sendTransactionalEmail } from '@/lib/sendTransactionalEmail';

const to = 'ramontejada14@gmail.com';
const subject = '¡Dralofelicidades, Ramón!';
const text = `Hola Ramón,

Hoy es tu cumple y en Dralo no podíamos dejarlo pasar.

¡Dralofelicidades! Que este año venga cargado de planes buenos, mucha energía y, si te apetece, algún rato de inglés que no cuente como deberes.

Un abrazo enorme del equipo Dralo.

https://www.dralo.es
`;

const result = await sendTransactionalEmail({
  to,
  subject,
  text,
  branded: true,
  ctaLabel: 'Abrir Dralo',
  preheader: 'Hoy celebramos tu cumple en Dralo. ¡Dralofelicidades!',
});

if (!result.ok) {
  console.error('No se pudo enviar:', result.error);
  process.exit(1);
}

console.log(`Enviado a ${to} (${result.channel || 'ok'})`);
