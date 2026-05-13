-- URL pública del audio Parte 10 B2 1.1 para la fila con id fijo.
-- (Ya aplicado en producción ENGLISH; útil como referencia o para re-ejecutar.)

update public.levels_preguntas_audios
set audio_url =
  'https://qnazrzvwvkwhkfbqsbmr.supabase.co/storage/v1/object/public/Levels_Listening/Parte%2010%20-%20B2%20-%201.1.mp3'
where id = '630645a4-074b-4ff2-9a41-e7b1daa75f39'::uuid;
