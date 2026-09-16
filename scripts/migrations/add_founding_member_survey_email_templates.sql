-- Plantillas del ciclo de la encuesta founding (30 días → 7 días de plazo).
-- Editables después desde el panel de Soporte › Correos automáticos.

INSERT INTO public.soporte_correos_automaticos (
  slug, nombre, trigger_event, trigger_reason, asunto, cuerpo, activo, delay_minutos, es_sistema
)
VALUES
  (
    'founding_member_survey',
    'Encuesta founding — 30 días',
    'founding_member_survey',
    'Se envía a los 30 días del alta a las inscripciones 2–50. Responder el formulario consolida el Plan Plus de por vida; no hacerlo en 7 días lo retira.',
    'Tu Plan Plus de por vida: solo te pedimos 3 minutos',
    E'Hola{{nombre}},\n\nHace un mes te regalamos el Plan Plus por ser una de las 50 primeras personas en confiar en Dralo. Hoy toca la única cosa que te pedimos a cambio: contarnos qué tal te ha ido.\n\nHemos preparado un formulario de 3 minutos. Al enviarlo, tu Plan Plus queda confirmado de por vida, sin coste y sin fecha de caducidad.\n\n{{encuesta_url}}\n\nTienes hasta el {{fecha_limite}} ({{dias_plazo}} días). Si no recibimos tus respuestas antes de esa fecha, la plaza volverá al cupo y tu cuenta pasará al Plan Free. No perderás nada de tu progreso y podrás recuperar el Plus cuando quieras.\n\nSé todo lo sincero que quieras: lo que nos cuentes decide qué construimos los próximos meses. Las críticas nos sirven más que los elogios.\n\nGracias por haber estado desde el principio. 💙\n\n— Equipo Dralo',
    true, 0, true
  ),
  (
    'founding_member_survey_reminder',
    'Encuesta founding — recordatorio',
    'founding_member_survey_reminder',
    'Aviso cuando quedan pocos días para el cierre del formulario y el alumno aún no ha respondido.',
    'Te quedan {{dias_restantes}} días para conservar tu Plan Plus',
    E'Hola{{nombre}},\n\nNo queremos que pierdas tu Plan Plus por un despiste, así que te lo recordamos: todavía no hemos recibido tus respuestas.\n\n{{encuesta_url}}\n\nSon 3 minutos y el plazo termina el {{fecha_limite}}. Al enviarlo, tu Plan Plus queda confirmado de por vida.\n\nSi no llegamos a tiempo, tu cuenta pasará al Plan Free ese mismo día. Tu progreso se mantiene intacto.\n\n— Equipo Dralo',
    true, 0, true
  ),
  (
    'founding_member_survey_confirmed',
    'Encuesta founding — Plan Plus confirmado',
    'founding_member_survey_confirmed',
    'Se envía al recibir las respuestas del formulario de los 30 días.',
    'Hecho: tu Plan Plus es tuyo de por vida 🎉',
    E'Hola{{nombre}},\n\nHemos recibido tus respuestas. Tu Plan Plus queda confirmado de por vida: gratuito, sin caducidad y sin nada más que hacer por tu parte.\n\nGracias de verdad por el rato que le has dedicado. Leemos una a una todas las respuestas y salen de ahí buena parte de las mejoras que acaban en la plataforma.\n\n{{login_url}}\n\n— Equipo Dralo',
    true, 0, true
  ),
  (
    'founding_member_survey_revoked',
    'Encuesta founding — Plan Plus retirado',
    'founding_member_survey_revoked',
    'Se envía cuando vence el plazo del formulario sin respuesta y la cuenta vuelve al Plan Free.',
    'Tu Plan Plus de lanzamiento ha finalizado',
    E'Hola{{nombre}},\n\nSe ha cumplido el plazo para responder al formulario de los 30 días, así que tu cuenta ha vuelto al Plan Free y la plaza de lanzamiento queda libre para otra persona.\n\nNo pierdes nada de lo que has hecho: tu progreso, tus ejercicios y tus resultados siguen exactamente donde estaban, y puedes seguir practicando con el Plan Free.\n\nSi fue un despiste y quieres recuperar el Plus, escríbenos respondiendo a este correo y lo miramos sin problema.\n\n{{app_url}}/precios\n\n— Equipo Dralo',
    true, 0, true
  )
ON CONFLICT (slug) DO UPDATE SET
  nombre = EXCLUDED.nombre,
  trigger_event = EXCLUDED.trigger_event,
  trigger_reason = EXCLUDED.trigger_reason,
  asunto = EXCLUDED.asunto,
  cuerpo = EXCLUDED.cuerpo,
  activo = EXCLUDED.activo,
  delay_minutos = EXCLUDED.delay_minutos,
  es_sistema = EXCLUDED.es_sistema,
  actualizado_en = now();
