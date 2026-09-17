INSERT INTO public.soporte_correos_automaticos (
  slug, nombre, trigger_event, trigger_reason, asunto, cuerpo, activo, delay_minutos, es_sistema
)
VALUES (
  'staff_task_message',
  'Mensaje en chat de tarea',
  'staff_task_message',
  'Se envía a los involucrados cuando hay un mensaje nuevo en la conversación de una tarea.',
  'Nuevo mensaje en la tarea «{{task_titulo}}»',
  E'Hola{{nombre}},\n\n{{sender_name}} ha escrito en la conversación de la tarea «{{task_titulo}}» ({{task_estado}}):\n\n«{{message_preview}}»\n\n{{task_url}}\n\nEntra en el panel de tareas para responder. La conversación se cierra cuando la tarea se marca como completada o cancelada.\n\n— Equipo Dralo',
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
