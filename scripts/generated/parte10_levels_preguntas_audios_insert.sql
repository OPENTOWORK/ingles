-- Generado por scripts/generate-parte10-preguntas-audios-sql.mjs
-- Parte 10 listening: 8 audios por pregunta (exámenes en Excel).
BEGIN;
DELETE FROM public.levels_preguntas_audios
WHERE pregunta_id IN ('2e44ac3c-2e7e-430b-9b0d-226f7e459bea'::uuid, 'ba46a83c-6f2f-4899-bb82-01cc3ca1d561'::uuid, '81a4a85a-c928-4260-84f2-3aa5c585ffad'::uuid, 'a73489dd-47ad-4cb2-997d-ad605c898cff'::uuid, 'a3bf3439-57c9-48bf-992b-2cff82a00eb8'::uuid);

INSERT INTO public.levels_preguntas_audios (pregunta_id, audio_url, orden, titulo) VALUES
('2e44ac3c-2e7e-430b-9b0d-226f7e459bea'::uuid, 'https://qnazrzvwvkwhkfbqsbmr.supabase.co/storage/v1/object/public/Levels_Listening/Parte%2010%20-%20B2%20-%201.1.mp3', 1, 'You hear a woman talking to her colleague about a meeting.'),
('2e44ac3c-2e7e-430b-9b0d-226f7e459bea'::uuid, 'https://qnazrzvwvkwhkfbqsbmr.supabase.co/storage/v1/object/public/Levels_Listening/Parte%2010%20-%20B2%20-%201.2.mp3', 2, 'You hear two friends talking about a gym.'),
('2e44ac3c-2e7e-430b-9b0d-226f7e459bea'::uuid, 'https://qnazrzvwvkwhkfbqsbmr.supabase.co/storage/v1/object/public/Levels_Listening/Parte%2010%20-%20B2%20-%201.3.mp3', 3, 'You hear a student talking about learning to drive.'),
('2e44ac3c-2e7e-430b-9b0d-226f7e459bea'::uuid, 'https://qnazrzvwvkwhkfbqsbmr.supabase.co/storage/v1/object/public/Levels_Listening/Parte%2010%20-%20B2%20-%201.4.mp3', 4, 'You hear a man talking about a concert he attended.'),
('2e44ac3c-2e7e-430b-9b0d-226f7e459bea'::uuid, 'https://qnazrzvwvkwhkfbqsbmr.supabase.co/storage/v1/object/public/Levels_Listening/Parte%2010%20-%20B2%20-%201.5.mp3', 5, 'You hear two people talking about a hotel they stayed in.'),
('2e44ac3c-2e7e-430b-9b0d-226f7e459bea'::uuid, 'https://qnazrzvwvkwhkfbqsbmr.supabase.co/storage/v1/object/public/Levels_Listening/Parte%2010%20-%20B2%20-%201.6.mp3', 6, 'You hear a woman talking on a podcast about working from home.'),
('2e44ac3c-2e7e-430b-9b0d-226f7e459bea'::uuid, 'https://qnazrzvwvkwhkfbqsbmr.supabase.co/storage/v1/object/public/Levels_Listening/Parte%2010%20-%20B2%20-%201.7.mp3', 7, 'You overhear two friends discussing a new café.'),
('2e44ac3c-2e7e-430b-9b0d-226f7e459bea'::uuid, 'https://qnazrzvwvkwhkfbqsbmr.supabase.co/storage/v1/object/public/Levels_Listening/Parte%2010%20-%20B2%20-%201.8.mp3', 8, 'You hear a man making an announcement at a train station.'),
('ba46a83c-6f2f-4899-bb82-01cc3ca1d561'::uuid, 'https://qnazrzvwvkwhkfbqsbmr.supabase.co/storage/v1/object/public/Levels_Listening/Parte%2010%20-%20B2%20-%202.1.mp3', 1, 'You hear a man talking about a book he recently read.'),
('ba46a83c-6f2f-4899-bb82-01cc3ca1d561'::uuid, 'https://qnazrzvwvkwhkfbqsbmr.supabase.co/storage/v1/object/public/Levels_Listening/Parte%2010%20-%20B2%20-%202.2.mp3', 2, 'You hear two friends talking about a cycling trip.'),
('ba46a83c-6f2f-4899-bb82-01cc3ca1d561'::uuid, 'https://qnazrzvwvkwhkfbqsbmr.supabase.co/storage/v1/object/public/Levels_Listening/Parte%2010%20-%20B2%20-%202.3.mp3', 3, 'You hear a woman speaking about her new job.'),
('ba46a83c-6f2f-4899-bb82-01cc3ca1d561'::uuid, 'https://qnazrzvwvkwhkfbqsbmr.supabase.co/storage/v1/object/public/Levels_Listening/Parte%2010%20-%20B2%20-%202.4.mp3', 4, 'You hear two people discussing a film they saw.'),
('ba46a83c-6f2f-4899-bb82-01cc3ca1d561'::uuid, 'https://qnazrzvwvkwhkfbqsbmr.supabase.co/storage/v1/object/public/Levels_Listening/Parte%2010%20-%20B2%20-%202.5.mp3', 5, 'You hear a radio presenter talking about a local event.'),
('ba46a83c-6f2f-4899-bb82-01cc3ca1d561'::uuid, 'https://qnazrzvwvkwhkfbqsbmr.supabase.co/storage/v1/object/public/Levels_Listening/Parte%2010%20-%20B2%20-%202.6.mp3', 6, 'You hear two students talking about a science project.'),
('ba46a83c-6f2f-4899-bb82-01cc3ca1d561'::uuid, 'https://qnazrzvwvkwhkfbqsbmr.supabase.co/storage/v1/object/public/Levels_Listening/Parte%2010%20-%20B2%20-%202.7.mp3', 7, 'You hear a woman talking about learning a language abroad.'),
('ba46a83c-6f2f-4899-bb82-01cc3ca1d561'::uuid, 'https://qnazrzvwvkwhkfbqsbmr.supabase.co/storage/v1/object/public/Levels_Listening/Parte%2010%20-%20B2%20-%202.8.mp3', 8, 'You hear a man leaving a voicemail message.'),
('81a4a85a-c928-4260-84f2-3aa5c585ffad'::uuid, 'https://qnazrzvwvkwhkfbqsbmr.supabase.co/storage/v1/object/public/Levels_Listening/Parte%2010%20-%20B2%20-%203.1.mp3', 1, 'You hear a woman talking about a photography course.'),
('81a4a85a-c928-4260-84f2-3aa5c585ffad'::uuid, 'https://qnazrzvwvkwhkfbqsbmr.supabase.co/storage/v1/object/public/Levels_Listening/Parte%2010%20-%20B2%20-%203.2.mp3', 2, 'You hear two friends talking about a football match.'),
('81a4a85a-c928-4260-84f2-3aa5c585ffad'::uuid, 'https://qnazrzvwvkwhkfbqsbmr.supabase.co/storage/v1/object/public/Levels_Listening/Parte%2010%20-%20B2%20-%203.3.mp3', 3, 'You hear a man talking about shopping online.'),
('81a4a85a-c928-4260-84f2-3aa5c585ffad'::uuid, 'https://qnazrzvwvkwhkfbqsbmr.supabase.co/storage/v1/object/public/Levels_Listening/Parte%2010%20-%20B2%20-%203.4.mp3', 4, 'You hear a student talking about giving a presentation.'),
('81a4a85a-c928-4260-84f2-3aa5c585ffad'::uuid, 'https://qnazrzvwvkwhkfbqsbmr.supabase.co/storage/v1/object/public/Levels_Listening/Parte%2010%20-%20B2%20-%203.5.mp3', 5, 'You hear two people talking about a neighbour.'),
('81a4a85a-c928-4260-84f2-3aa5c585ffad'::uuid, 'https://qnazrzvwvkwhkfbqsbmr.supabase.co/storage/v1/object/public/Levels_Listening/Parte%2010%20-%20B2%20-%203.6.mp3', 6, 'You hear a woman talking on the radio about travelling by train.'),
('81a4a85a-c928-4260-84f2-3aa5c585ffad'::uuid, 'https://qnazrzvwvkwhkfbqsbmr.supabase.co/storage/v1/object/public/Levels_Listening/Parte%2010%20-%20B2%20-%203.7.mp3', 7, 'You overhear two friends discussing an art exhibition.'),
('81a4a85a-c928-4260-84f2-3aa5c585ffad'::uuid, 'https://qnazrzvwvkwhkfbqsbmr.supabase.co/storage/v1/object/public/Levels_Listening/Parte%2010%20-%20B2%20-%203.8.mp3', 8, 'You hear a message in an airport.'),
('a73489dd-47ad-4cb2-997d-ad605c898cff'::uuid, 'https://qnazrzvwvkwhkfbqsbmr.supabase.co/storage/v1/object/public/Levels_Listening/Parte%2010%20-%20B2%20-%204.1.mp3', 1, 'You hear a man talking about a cooking class.'),
('a73489dd-47ad-4cb2-997d-ad605c898cff'::uuid, 'https://qnazrzvwvkwhkfbqsbmr.supabase.co/storage/v1/object/public/Levels_Listening/Parte%2010%20-%20B2%20-%204.2.mp3', 2, 'You hear two friends talking about a mobile phone.'),
('a73489dd-47ad-4cb2-997d-ad605c898cff'::uuid, 'https://qnazrzvwvkwhkfbqsbmr.supabase.co/storage/v1/object/public/Levels_Listening/Parte%2010%20-%20B2%20-%204.3.mp3', 3, 'You hear a woman talking about a concert venue.'),
('a73489dd-47ad-4cb2-997d-ad605c898cff'::uuid, 'https://qnazrzvwvkwhkfbqsbmr.supabase.co/storage/v1/object/public/Levels_Listening/Parte%2010%20-%20B2%20-%204.4.wav', 4, 'You hear two colleagues discussing remote working.'),
('a73489dd-47ad-4cb2-997d-ad605c898cff'::uuid, 'https://qnazrzvwvkwhkfbqsbmr.supabase.co/storage/v1/object/public/Levels_Listening/Parte%2010%20-%20B2%20-%204.5.mp3', 5, 'You hear a student talking about a sports competition.'),
('a73489dd-47ad-4cb2-997d-ad605c898cff'::uuid, 'https://qnazrzvwvkwhkfbqsbmr.supabase.co/storage/v1/object/public/Levels_Listening/Parte%2010%20-%20B2%20-%204.6.wav', 6, 'You hear two people talking about a documentary.'),
('a73489dd-47ad-4cb2-997d-ad605c898cff'::uuid, 'https://qnazrzvwvkwhkfbqsbmr.supabase.co/storage/v1/object/public/Levels_Listening/Parte%2010%20-%20B2%20-%204.7.mp3', 7, 'You hear a woman talking about moving to a new city.'),
('a73489dd-47ad-4cb2-997d-ad605c898cff'::uuid, 'https://qnazrzvwvkwhkfbqsbmr.supabase.co/storage/v1/object/public/Levels_Listening/Parte%2010%20-%20B2%20-%204.8.mp3', 8, 'You hear a man speaking on local radio.'),
('a3bf3439-57c9-48bf-992b-2cff82a00eb8'::uuid, 'https://qnazrzvwvkwhkfbqsbmr.supabase.co/storage/v1/object/public/Levels_Listening/Parte%2010%20-%20B2%20-%205.1.mp3', 1, 'You hear a woman talking about a weekend trip.'),
('a3bf3439-57c9-48bf-992b-2cff82a00eb8'::uuid, 'https://qnazrzvwvkwhkfbqsbmr.supabase.co/storage/v1/object/public/Levels_Listening/Parte%2010%20-%20B2%20-%205.2.wav', 2, 'You hear two friends discussing a new teacher.'),
('a3bf3439-57c9-48bf-992b-2cff82a00eb8'::uuid, 'https://qnazrzvwvkwhkfbqsbmr.supabase.co/storage/v1/object/public/Levels_Listening/Parte%2010%20-%20B2%20-%205.3.mp3', 3, 'You hear a man talking about learning to play the guitar.'),
('a3bf3439-57c9-48bf-992b-2cff82a00eb8'::uuid, 'https://qnazrzvwvkwhkfbqsbmr.supabase.co/storage/v1/object/public/Levels_Listening/Parte%2010%20-%20B2%20-%205.4.wav', 4, 'You hear two people talking about a shopping centre.'),
('a3bf3439-57c9-48bf-992b-2cff82a00eb8'::uuid, 'https://qnazrzvwvkwhkfbqsbmr.supabase.co/storage/v1/object/public/Levels_Listening/Parte%2010%20-%20B2%20-%205.5.mp3', 5, 'You hear a woman talking about a job interview.'),
('a3bf3439-57c9-48bf-992b-2cff82a00eb8'::uuid, 'https://qnazrzvwvkwhkfbqsbmr.supabase.co/storage/v1/object/public/Levels_Listening/Parte%2010%20-%20B2%20-%205.6.wav', 6, 'You hear two friends talking about a basketball game.'),
('a3bf3439-57c9-48bf-992b-2cff82a00eb8'::uuid, 'https://qnazrzvwvkwhkfbqsbmr.supabase.co/storage/v1/object/public/Levels_Listening/Parte%2010%20-%20B2%20-%205.7.mp3', 7, 'You hear a radio presenter talking about a book festival.'),
('a3bf3439-57c9-48bf-992b-2cff82a00eb8'::uuid, 'https://qnazrzvwvkwhkfbqsbmr.supabase.co/storage/v1/object/public/Levels_Listening/Parte%2010%20-%20B2%20-%205.8.mp3', 8, 'You hear a man leaving a voicemail message.');
COMMIT;
