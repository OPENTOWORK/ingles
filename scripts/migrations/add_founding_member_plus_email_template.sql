-- Plantilla: Plan Plus para las 50 primeras inscripciones (slots 2–50).
INSERT INTO public.soporte_correos_automaticos (
  slug,
  nombre,
  trigger_event,
  trigger_reason,
  asunto,
  cuerpo,
  activo,
  delay_minutos,
  es_sistema
)
VALUES (
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
