-- Repara ejercicios creados antes de guardar el enlace del tema en `descripcion`.
-- Sustituye YOUR_PREGUNTA_ID y el href/título según tu fila en Supabase.

-- Ejemplo (Articles, Determiners and Quantifiers, B2):
-- UPDATE levels_teoria_preguntas
-- SET descripcion = '/teoria/1-Articles-Determiners-and-Quantifiers · Articles, Determiners and Quantifiers · Tipo 1 — Unir y relacionar · Nivel B2 · Grammar | ' || COALESCE(NULLIF(descripcion, ''), 'Choose the correct option.')
-- WHERE id = 'YOUR_PREGUNTA_ID';
