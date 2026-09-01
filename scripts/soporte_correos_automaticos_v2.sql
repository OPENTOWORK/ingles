-- Actualiza plantillas de correo automático y añade invitación a amigo.
-- Ejecutar en Supabase SQL Editor (idempotente).

insert into soporte_correos_automaticos (slug, nombre, trigger_event, trigger_reason, asunto, cuerpo, activo, delay_minutos, es_sistema)
values
  (
    'friend_invite',
    'Invitar a un amigo',
    'friend_invited',
    'Se envía cuando un usuario invita a un amigo desde la sección «Invite friends» del perfil.',
    '{{sender_name}} te invita a practicar en Dralo',
    E'Hola,\n\n{{sender_name}} quiere que practiques inglés juntos en Dralo — la plataforma para preparar exámenes Cambridge (A2–C2) con ejercicios, simulacros de examen y herramientas de IA.\n\n{{invite_message}}\n\n{{app_url}}\n\nEmpieza con Exam practice, explora Dralo AI para writing y speaking, y sigue tu progreso desde tu perfil.\n\n— Equipo Dralo English',
    true,
    0,
    true
  )
on conflict (slug) do nothing;

update soporte_correos_automaticos set
  asunto = '¡Bienvenido/a a Dralo English!',
  cuerpo = E'Hola{{nombre}},\n\n¡Gracias por unirte a Dralo English! Ya formas parte de una comunidad que prepara exámenes Cambridge con práctica real, simulacros y feedback inteligente.\n\nTu acceso está listo con el email {{email}}. Entra cuando quieras para practicar reading, writing, listening, speaking y use of English por niveles A2–C2.\n\n{{login_url}}\n\nSi tienes cualquier duda, responde a este correo o escríbenos desde la sección Contacto.\n\n— Equipo Dralo English',
  actualizado_en = now()
where slug = 'welcome_registration';

update soporte_correos_automaticos set
  asunto = 'Hemos recibido tu consulta — Dralo English',
  cuerpo = E'Hola{{nombre}},\n\nGracias por escribirnos. Hemos recibido tu mensaje y nuestro equipo de soporte ya lo tiene en cola.\n\nAsunto: {{ticket_subject}}\n\nTe responderemos lo antes posible, normalmente en un plazo máximo de 48 horas laborables.\n\nSi quieres añadir más detalles, puedes responder directamente a este correo.\n\n— Equipo Dralo English',
  actualizado_en = now()
where slug = 'support_ticket_ack';

update soporte_correos_automaticos set
  asunto = 'Tu cuenta en Dralo English está lista',
  cuerpo = E'Hola{{nombre}},\n\nUn administrador ha creado tu cuenta en Dralo English. Aquí tienes tus datos de acceso:\n\nEmail: {{email}}\nContraseña temporal: {{temporary_password}}\n\nPor seguridad, te recomendamos cambiar la contraseña en tu perfil nada más iniciar sesión.\n\n{{login_url}}\n\n— Equipo Dralo English',
  actualizado_en = now()
where slug = 'admin_user_welcome';

insert into soporte_correos_automaticos (slug, nombre, trigger_event, trigger_reason, asunto, cuerpo, activo, delay_minutos, es_sistema)
values
  (
    'founding_member_plus',
    'Plan Plus — 50 primeras inscripciones',
    'founding_member_plus_granted',
    'Se envía a las inscripciones 2–50 de la campaña de lanzamiento con Plan Plus gratuito e indefinido.',
    '¡Plan Plus gratuito e indefinido para ti! — Dralo',
    E'Buenas tardes{{nombre}},\n\nTenemos una buena noticia para ti 🎉\n\nPor haber sido una de las 50 primeras personas en registrarse en Dralo, queremos agradecerte la confianza que has depositado en nosotros regalándote el Plan Plus de forma gratuita e indefinida.\n\nA partir de ahora podrás disfrutar de todas las ventajas incluidas en el Plan Plus sin ningún coste y sin fecha de caducidad.\n\nDralo acaba de empezar y todavía tenemos muchísimo por mejorar, añadir y construir. Por eso, para nosotros tiene un valor especial que hayas confiado en el proyecto desde sus primeros pasos.\n\nEsperamos que Dralo te ayude a preparar tu examen, mejorar tu inglés y, sobre todo, a conseguir ese aprobado que estás buscando. 🚀\n\nY esto es solo el principio: durante los próximos meses iremos incorporando nuevos ejercicios, funcionalidades, contenido y mejoras.\n\nGracias por formar parte de los primeros usuarios de Dralo. 💙\n\n¡Nos vemos dentro!\n\n{{login_url}}\n\n— Equipo Dralo',
    true,
    0,
    true
  )
on conflict (slug) do nothing;
