-- Generado por scripts/generate-parte12-preguntas-audios-sql.mjs (Excel Parte 12 audios)
-- Parte 12 listening: 5 audios por pregunta (Speaker 1–5), orden 1–5.
BEGIN;
DELETE FROM public.levels_preguntas_audios
WHERE pregunta_id IN ('2964745e-955c-4010-b3ac-e2f1f978d8b8', 'bca9c486-51a9-4c18-aff5-247bcbc90d0f', 'c08ac8fa-5199-48e4-af62-856e64227273', '976ae33f-eb19-4251-864f-dad5e334935a', 'aa6e56b2-5785-4865-9a18-ab6a850152c5');

INSERT INTO public.levels_preguntas_audios (pregunta_id, audio_url, orden, titulo) VALUES
('2964745e-955c-4010-b3ac-e2f1f978d8b8', 'https://qnazrzvwvkwhkfbqsbmr.supabase.co/storage/v1/object/public/Levels_Listening/Parte%2012%20-%20B2%20-%201.1.mp3', 1, 'Speaker 1'),
('2964745e-955c-4010-b3ac-e2f1f978d8b8', 'https://qnazrzvwvkwhkfbqsbmr.supabase.co/storage/v1/object/public/Levels_Listening/Parte%2012%20-%20B2%20-%201.2.mp3', 2, 'Speaker 2'),
('2964745e-955c-4010-b3ac-e2f1f978d8b8', 'https://qnazrzvwvkwhkfbqsbmr.supabase.co/storage/v1/object/public/Levels_Listening/Parte%2012%20-%20B2%20-%201.3.mp3', 3, 'Speaker 3'),
('2964745e-955c-4010-b3ac-e2f1f978d8b8', 'https://qnazrzvwvkwhkfbqsbmr.supabase.co/storage/v1/object/public/Levels_Listening/Parte%2012%20-%20B2%20-%201.4.mp3', 4, 'Speaker 4'),
('2964745e-955c-4010-b3ac-e2f1f978d8b8', 'https://qnazrzvwvkwhkfbqsbmr.supabase.co/storage/v1/object/public/Levels_Listening/Parte%2012%20-%20B2%20-%201.5.mp3', 5, 'Speaker 5'),
('bca9c486-51a9-4c18-aff5-247bcbc90d0f', 'https://qnazrzvwvkwhkfbqsbmr.supabase.co/storage/v1/object/public/Levels_Listening/Parte%2012%20-%20B2%20-%202.1.mp3', 1, 'Speaker 1'),
('bca9c486-51a9-4c18-aff5-247bcbc90d0f', 'https://qnazrzvwvkwhkfbqsbmr.supabase.co/storage/v1/object/public/Levels_Listening/Parte%2012%20-%20B2%20-%202.2.mp3', 2, 'Speaker 2'),
('bca9c486-51a9-4c18-aff5-247bcbc90d0f', 'https://qnazrzvwvkwhkfbqsbmr.supabase.co/storage/v1/object/public/Levels_Listening/Parte%2012%20-%20B2%20-%202.3.mp3', 3, 'Speaker 3'),
('bca9c486-51a9-4c18-aff5-247bcbc90d0f', 'https://qnazrzvwvkwhkfbqsbmr.supabase.co/storage/v1/object/public/Levels_Listening/Parte%2012%20-%20B2%20-%202.4.mp3', 4, 'Speaker 4'),
('bca9c486-51a9-4c18-aff5-247bcbc90d0f', 'https://qnazrzvwvkwhkfbqsbmr.supabase.co/storage/v1/object/public/Levels_Listening/Parte%2012%20-%20B2%20-%202.5.mp3', 5, 'Speaker 5'),
('c08ac8fa-5199-48e4-af62-856e64227273', 'https://qnazrzvwvkwhkfbqsbmr.supabase.co/storage/v1/object/public/Levels_Listening/Parte%2012%20-%20B2%20-%203.1.mp3', 1, 'Speaker 1'),
('c08ac8fa-5199-48e4-af62-856e64227273', 'https://qnazrzvwvkwhkfbqsbmr.supabase.co/storage/v1/object/public/Levels_Listening/Parte%2012%20-%20B2%20-%203.2.mp3', 2, 'Speaker 2'),
('c08ac8fa-5199-48e4-af62-856e64227273', 'https://qnazrzvwvkwhkfbqsbmr.supabase.co/storage/v1/object/public/Levels_Listening/Parte%2012%20-%20B2%20-%203.3.mp3', 3, 'Speaker 3'),
('c08ac8fa-5199-48e4-af62-856e64227273', 'https://qnazrzvwvkwhkfbqsbmr.supabase.co/storage/v1/object/public/Levels_Listening/Parte%2012%20-%20B2%20-%203.4.mp3', 4, 'Speaker 4'),
('c08ac8fa-5199-48e4-af62-856e64227273', 'https://qnazrzvwvkwhkfbqsbmr.supabase.co/storage/v1/object/public/Levels_Listening/Parte%2012%20-%20B2%20-%203.5.mp3', 5, 'Speaker 5'),
('976ae33f-eb19-4251-864f-dad5e334935a', 'https://qnazrzvwvkwhkfbqsbmr.supabase.co/storage/v1/object/public/Levels_Listening/Parte%2012%20-%20B2%20-%204.1.mp3', 1, 'Speaker 1'),
('976ae33f-eb19-4251-864f-dad5e334935a', 'https://qnazrzvwvkwhkfbqsbmr.supabase.co/storage/v1/object/public/Levels_Listening/Parte%2012%20-%20B2%20-%204.2.mp3', 2, 'Speaker 2'),
('976ae33f-eb19-4251-864f-dad5e334935a', 'https://qnazrzvwvkwhkfbqsbmr.supabase.co/storage/v1/object/public/Levels_Listening/Parte%2012%20-%20B2%20-%204.3.mp3', 3, 'Speaker 3'),
('976ae33f-eb19-4251-864f-dad5e334935a', 'https://qnazrzvwvkwhkfbqsbmr.supabase.co/storage/v1/object/public/Levels_Listening/Parte%2012%20-%20B2%20-%204.4.mp3', 4, 'Speaker 4'),
('976ae33f-eb19-4251-864f-dad5e334935a', 'https://qnazrzvwvkwhkfbqsbmr.supabase.co/storage/v1/object/public/Levels_Listening/Parte%2012%20-%20B2%20-%204.5.mp3', 5, 'Speaker 5'),
('aa6e56b2-5785-4865-9a18-ab6a850152c5', 'https://qnazrzvwvkwhkfbqsbmr.supabase.co/storage/v1/object/public/Levels_Listening/Parte%2012%20-%20B2%20-%205.1.mp3', 1, 'Speaker 1'),
('aa6e56b2-5785-4865-9a18-ab6a850152c5', 'https://qnazrzvwvkwhkfbqsbmr.supabase.co/storage/v1/object/public/Levels_Listening/Parte%2012%20-%20B2%20-%205.2.mp3', 2, 'Speaker 2'),
('aa6e56b2-5785-4865-9a18-ab6a850152c5', 'https://qnazrzvwvkwhkfbqsbmr.supabase.co/storage/v1/object/public/Levels_Listening/Parte%2012%20-%20B2%20-%205.3.mp3', 3, 'Speaker 3'),
('aa6e56b2-5785-4865-9a18-ab6a850152c5', 'https://qnazrzvwvkwhkfbqsbmr.supabase.co/storage/v1/object/public/Levels_Listening/Parte%2012%20-%20B2%20-%205.4.mp3', 4, 'Speaker 4'),
('aa6e56b2-5785-4865-9a18-ab6a850152c5', 'https://qnazrzvwvkwhkfbqsbmr.supabase.co/storage/v1/object/public/Levels_Listening/Parte%2012%20-%20B2%20-%205.5.mp3', 5, 'Speaker 5');
COMMIT;
