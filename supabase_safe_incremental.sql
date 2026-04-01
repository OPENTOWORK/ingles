-- =====================================================
-- SCRIPT SEGURO INCREMENTAL PARA SUPABASE
-- Verifica qué existe antes de crear nada
-- =====================================================

-- =====================================================
-- VERIFICAR QUÉ TABLAS YA EXISTEN
-- =====================================================

-- Mostrar tablas existentes
SELECT 'TABLAS EXISTENTES:' as info;
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- =====================================================
-- CREAR SOLO LAS TABLAS QUE NO EXISTEN
-- =====================================================

-- 2.1 Medios (solo si no existe)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'medios') THEN
        CREATE TABLE public.medios (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            nombre TEXT NOT NULL,
            tipo TEXT NOT NULL CHECK (tipo IN ('imagen', 'audio', 'video', 'documento', 'interactivo')),
            url TEXT NOT NULL,
            mime_type TEXT,
            tamaño_bytes BIGINT,
            duracion_segundos INTEGER,
            descripcion TEXT,
            alt_text TEXT,
            is_active BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        RAISE NOTICE 'Tabla medios creada';
    ELSE
        RAISE NOTICE 'Tabla medios ya existe';
    END IF;
END $$;

-- 2.2 Etiquetas (solo si no existe)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'etiquetas') THEN
        CREATE TABLE public.etiquetas (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            nombre TEXT UNIQUE NOT NULL,
            descripcion TEXT,
            categoria TEXT,
            color TEXT DEFAULT '#3B82F6',
            is_active BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        RAISE NOTICE 'Tabla etiquetas creada';
    ELSE
        RAISE NOTICE 'Tabla etiquetas ya existe';
    END IF;
END $$;

-- 2.2.1 Etiquetas-Contenido (solo si no existe)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'etiquetas_contenido') THEN
        CREATE TABLE public.etiquetas_contenido (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            etiqueta_id UUID REFERENCES public.etiquetas(id) ON DELETE CASCADE,
            contenido_tipo TEXT NOT NULL,
            contenido_id UUID NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(etiqueta_id, contenido_tipo, contenido_id)
        );
        RAISE NOTICE 'Tabla etiquetas_contenido creada';
    ELSE
        RAISE NOTICE 'Tabla etiquetas_contenido ya existe';
    END IF;
END $$;

-- 2.3 Banco-Preguntas (solo si no existe)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'banco_preguntas') THEN
        CREATE TABLE public.banco_preguntas (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            enunciado TEXT NOT NULL,
            solucion TEXT NOT NULL,
            explicacion TEXT,
            habilidad TEXT NOT NULL CHECK (habilidad IN ('reading', 'writing', 'listening', 'speaking', 'use_of_english', 'grammar', 'vocabulary')),
            nivel TEXT NOT NULL CHECK (nivel IN ('A1', 'A2', 'B1', 'B2', 'C1', 'C2')),
            tipo_pregunta TEXT DEFAULT 'multiple_choice' CHECK (tipo_pregunta IN ('multiple_choice', 'true_false', 'fill_blank', 'matching', 'open_answer', 'drag_drop')),
            tiempo_sugerido_segundos INTEGER DEFAULT 60,
            dificultad INTEGER DEFAULT 1 CHECK (dificultad BETWEEN 1 AND 5),
            puntos_base INTEGER DEFAULT 1,
            referencias JSONB DEFAULT '[]'::jsonb,
            is_active BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        RAISE NOTICE 'Tabla banco_preguntas creada';
    ELSE
        RAISE NOTICE 'Tabla banco_preguntas ya existe';
    END IF;
END $$;

-- 2.3.1 Banco-Preguntas-Teoría (solo si no existe)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'banco_preguntas_teoria') THEN
        CREATE TABLE public.banco_preguntas_teoria (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            pregunta_id UUID REFERENCES public.banco_preguntas(id) ON DELETE CASCADE,
            tema_teoria_id UUID,
            orden INTEGER DEFAULT 0,
            notas_especificas TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(pregunta_id, tema_teoria_id)
        );
        RAISE NOTICE 'Tabla banco_preguntas_teoria creada';
    ELSE
        RAISE NOTICE 'Tabla banco_preguntas_teoria ya existe';
    END IF;
END $$;

-- 2.3.2 Banco-Preguntas-Nivel (solo si no existe)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'banco_preguntas_nivel') THEN
        CREATE TABLE public.banco_preguntas_nivel (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            pregunta_id UUID REFERENCES public.banco_preguntas(id) ON DELETE CASCADE,
            nivel_target TEXT NOT NULL CHECK (nivel_target IN ('A1', 'A2', 'B1', 'B2', 'C1', 'C2')),
            peso_diagnostico DECIMAL(3,2) DEFAULT 1.0,
            is_adaptativa BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        RAISE NOTICE 'Tabla banco_preguntas_nivel creada';
    ELSE
        RAISE NOTICE 'Tabla banco_preguntas_nivel ya existe';
    END IF;
END $$;

-- 2.3.3 Banco-Preguntas-Examen (solo si no existe)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'banco_preguntas_examen') THEN
        CREATE TABLE public.banco_preguntas_examen (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            pregunta_id UUID REFERENCES public.banco_preguntas(id) ON DELETE CASCADE,
            examen_id UUID,
            seccion_tipo TEXT,
            peso_examen DECIMAL(3,2) DEFAULT 1.0,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        RAISE NOTICE 'Tabla banco_preguntas_examen creada';
    ELSE
        RAISE NOTICE 'Tabla banco_preguntas_examen ya existe';
    END IF;
END $$;

-- 2.3.4 Banco-Preguntas-Training (solo si no existe)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'banco_preguntas_training') THEN
        CREATE TABLE public.banco_preguntas_training (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            pregunta_id UUID REFERENCES public.banco_preguntas(id) ON DELETE CASCADE,
            curso_id UUID,
            unidad_tipo TEXT,
            dificultad_target TEXT CHECK (dificultad_target IN ('básico', 'intermedio', 'avanzado')),
            nivel_target TEXT CHECK (nivel_target IN ('A1', 'A2', 'B1', 'B2', 'C1', 'C2')),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        RAISE NOTICE 'Tabla banco_preguntas_training creada';
    ELSE
        RAISE NOTICE 'Tabla banco_preguntas_training ya existe';
    END IF;
END $$;

-- 2.3.5 Explicaciones-Ejercicio (solo si no existe)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'explicaciones_ejercicio') THEN
        CREATE TABLE public.explicaciones_ejercicio (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            pregunta_id UUID REFERENCES public.banco_preguntas(id) ON DELETE CASCADE,
            tipo_explicacion TEXT DEFAULT 'detallada' CHECK (tipo_explicacion IN ('breve', 'detallada', 'gramatical', 'cultural')),
            contenido TEXT NOT NULL,
            ejemplos JSONB DEFAULT '[]'::jsonb,
            referencias TEXT[],
            orden INTEGER DEFAULT 0,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        RAISE NOTICE 'Tabla explicaciones_ejercicio creada';
    ELSE
        RAISE NOTICE 'Tabla explicaciones_ejercicio ya existe';
    END IF;
END $$;

-- 2.4 Ejercicios (solo si no existe)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'ejercicios') THEN
        CREATE TABLE public.ejercicios (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            titulo TEXT NOT NULL,
            descripcion TEXT,
            habilidad TEXT NOT NULL CHECK (habilidad IN ('reading', 'writing', 'listening', 'speaking', 'use_of_english', 'grammar', 'vocabulary', 'mixed')),
            nivel TEXT NOT NULL CHECK (nivel IN ('A1', 'A2', 'B1', 'B2', 'C1', 'C2')),
            tiempo_sugerido_minutos INTEGER DEFAULT 30,
            puntuacion_total INTEGER DEFAULT 100,
            numero_preguntas INTEGER DEFAULT 0,
            instrucciones TEXT,
            tipo_ejercicio TEXT DEFAULT 'practica' CHECK (tipo_ejercicio IN ('practica', 'examen', 'test_nivel', 'training')),
            is_aleatorio BOOLEAN DEFAULT FALSE,
            is_active BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        RAISE NOTICE 'Tabla ejercicios creada';
    ELSE
        RAISE NOTICE 'Tabla ejercicios ya existe';
    END IF;
END $$;

-- 2.4.1 Opciones-Pregunta (solo si no existe)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'opciones_pregunta') THEN
        CREATE TABLE public.opciones_pregunta (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            pregunta_id UUID REFERENCES public.banco_preguntas(id) ON DELETE CASCADE,
            texto_opcion TEXT NOT NULL,
            es_correcta BOOLEAN DEFAULT FALSE,
            orden INTEGER DEFAULT 0,
            explicacion TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        RAISE NOTICE 'Tabla opciones_pregunta creada';
    ELSE
        RAISE NOTICE 'Tabla opciones_pregunta ya existe';
    END IF;
END $$;

-- 2.4.2 Medios-Pregunta (solo si no existe)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'medios_pregunta') THEN
        CREATE TABLE public.medios_pregunta (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            pregunta_id UUID REFERENCES public.banco_preguntas(id) ON DELETE CASCADE,
            medio_id UUID REFERENCES public.medios(id) ON DELETE CASCADE,
            tipo_uso TEXT DEFAULT 'contenido' CHECK (tipo_uso IN ('contenido', 'opcion', 'explicacion', 'ayuda')),
            orden INTEGER DEFAULT 0,
            notas TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(pregunta_id, medio_id, tipo_uso)
        );
        RAISE NOTICE 'Tabla medios_pregunta creada';
    ELSE
        RAISE NOTICE 'Tabla medios_pregunta ya existe';
    END IF;
END $$;

-- 2.4.3 Preguntas-Ejercicio (solo si no existe)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'preguntas_ejercicio') THEN
        CREATE TABLE public.preguntas_ejercicio (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            ejercicio_id UUID REFERENCES public.ejercicios(id) ON DELETE CASCADE,
            pregunta_id UUID REFERENCES public.banco_preguntas(id) ON DELETE CASCADE,
            orden INTEGER DEFAULT 0,
            puntuacion_pregunta INTEGER DEFAULT 1,
            tiempo_sugerido_segundos INTEGER,
            is_obligatoria BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(ejercicio_id, pregunta_id)
        );
        RAISE NOTICE 'Tabla preguntas_ejercicio creada';
    ELSE
        RAISE NOTICE 'Tabla preguntas_ejercicio ya existe';
    END IF;
END $$;

-- 7.1 Progreso General Usuario (solo si no existe)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'progreso_general_usuario') THEN
        CREATE TABLE public.progreso_general_usuario (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
            nivel_actual TEXT CHECK (nivel_actual IN ('A1', 'A2', 'B1', 'B2', 'C1', 'C2')),
            xp_total INTEGER DEFAULT 0,
            tiempo_total_estudio_minutos INTEGER DEFAULT 0,
            ejercicios_completados INTEGER DEFAULT 0,
            examenes_completados INTEGER DEFAULT 0,
            mejor_puntuacion_examen INTEGER DEFAULT 0,
            ultimo_acceso TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            streak_dias INTEGER DEFAULT 0,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(user_id)
        );
        RAISE NOTICE 'Tabla progreso_general_usuario creada';
    ELSE
        RAISE NOTICE 'Tabla progreso_general_usuario ya existe';
    END IF;
END $$;

-- 7.2 Estadísticas por Habilidad (solo si no existe)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'estadisticas_habilidad') THEN
        CREATE TABLE public.estadisticas_habilidad (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
            habilidad TEXT NOT NULL CHECK (habilidad IN ('reading', 'writing', 'listening', 'speaking', 'use_of_english', 'grammar', 'vocabulary')),
            nivel_actual TEXT CHECK (nivel_actual IN ('A1', 'A2', 'B1', 'B2', 'C1', 'C2')),
            ejercicios_completados INTEGER DEFAULT 0,
            puntuacion_promedio DECIMAL(5,2) DEFAULT 0,
            tiempo_promedio_segundos INTEGER DEFAULT 0,
            fortalezas TEXT[],
            debilidades TEXT[],
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(user_id, habilidad)
        );
        RAISE NOTICE 'Tabla estadisticas_habilidad creada';
    ELSE
        RAISE NOTICE 'Tabla estadisticas_habilidad ya existe';
    END IF;
END $$;

-- 7.3 Historial de Actividad (solo si no existe)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'historial_actividad') THEN
        CREATE TABLE public.historial_actividad (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
            tipo_actividad TEXT NOT NULL CHECK (tipo_actividad IN ('ejercicio', 'examen', 'test_nivel', 'teoria', 'training')),
            actividad_id UUID NOT NULL,
            actividad_nombre TEXT,
            duracion_minutos INTEGER DEFAULT 0,
            puntuacion INTEGER DEFAULT 0,
            fecha_actividad TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        RAISE NOTICE 'Tabla historial_actividad creada';
    ELSE
        RAISE NOTICE 'Tabla historial_actividad ya existe';
    END IF;
END $$;

-- 7.4 Logs Detallados de Sesiones (solo si no existe)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'logs_sesiones') THEN
        CREATE TABLE public.logs_sesiones (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
            sesion_tipo TEXT NOT NULL CHECK (sesion_tipo IN ('training', 'examen', 'test_nivel', 'teoria')),
            sesion_id UUID NOT NULL,
            accion TEXT NOT NULL,
            timestamp_accion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            datos_contexto JSONB DEFAULT '{}'::jsonb,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        RAISE NOTICE 'Tabla logs_sesiones creada';
    ELSE
        RAISE NOTICE 'Tabla logs_sesiones ya existe';
    END IF;
END $$;

-- 8.1 Logros/Achievements (solo si no existe)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'logros') THEN
        CREATE TABLE public.logros (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            nombre TEXT UNIQUE NOT NULL,
            descripcion TEXT,
            categoria TEXT NOT NULL CHECK (categoria IN ('progreso', 'habilidad', 'tiempo', 'puntuacion', 'consistencia', 'social')),
            tipo TEXT NOT NULL CHECK (tipo IN ('individual', 'social', 'temporal')),
            criterio JSONB NOT NULL,
            recompensa_xp INTEGER DEFAULT 0,
            recompensa_tipo TEXT,
            recompensa_valor TEXT,
            icono TEXT,
            color TEXT DEFAULT '#FFD700',
            is_active BOOLEAN DEFAULT TRUE,
            is_secreto BOOLEAN DEFAULT FALSE,
            orden INTEGER DEFAULT 0,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        RAISE NOTICE 'Tabla logros creada';
    ELSE
        RAISE NOTICE 'Tabla logros ya existe';
    END IF;
END $$;

-- 8.2 Logros de Usuario (solo si no existe)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'logros_usuario') THEN
        CREATE TABLE public.logros_usuario (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
            logro_id UUID REFERENCES public.logros(id) ON DELETE CASCADE,
            fecha_obtencion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            progreso_actual DECIMAL(5,2) DEFAULT 0,
            is_completado BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(user_id, logro_id)
        );
        RAISE NOTICE 'Tabla logros_usuario creada';
    ELSE
        RAISE NOTICE 'Tabla logros_usuario ya existe';
    END IF;
END $$;

-- 8.3 XP y Puntos (solo si no existe)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'xp_usuario') THEN
        CREATE TABLE public.xp_usuario (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
            xp_total INTEGER DEFAULT 0,
            xp_semana INTEGER DEFAULT 0,
            xp_mes INTEGER DEFAULT 0,
            nivel_actual INTEGER DEFAULT 1,
            xp_para_siguiente_nivel INTEGER DEFAULT 100,
            ultima_actividad TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(user_id)
        );
        RAISE NOTICE 'Tabla xp_usuario creada';
    ELSE
        RAISE NOTICE 'Tabla xp_usuario ya existe';
    END IF;
END $$;

-- 8.4 Leaderboard (solo si no existe)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'leaderboard') THEN
        CREATE TABLE public.leaderboard (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
            tipo_leaderboard TEXT NOT NULL CHECK (tipo_leaderboard IN ('global', 'semanal', 'mensual', 'por_nivel', 'por_habilidad')),
            periodo TEXT,
            habilidad TEXT,
            nivel TEXT,
            puntuacion INTEGER DEFAULT 0,
            posicion INTEGER,
            participaciones INTEGER DEFAULT 1,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(user_id, tipo_leaderboard, periodo, habilidad, nivel)
        );
        RAISE NOTICE 'Tabla leaderboard creada';
    ELSE
        RAISE NOTICE 'Tabla leaderboard ya existe';
    END IF;
END $$;

-- 9.1 Reportes de Contenido (solo si no existe)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'reportes_contenido') THEN
        CREATE TABLE public.reportes_contenido (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
            contenido_tipo TEXT NOT NULL CHECK (contenido_tipo IN ('pregunta', 'ejercicio', 'leccion', 'tema_teoria', 'examen')),
            contenido_id UUID NOT NULL,
            motivo TEXT NOT NULL CHECK (motivo IN ('error_gramatical', 'error_contenido', 'inapropiado', 'duplicado', 'mal_formato', 'otro')),
            descripcion TEXT,
            estado TEXT DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'revisando', 'resuelto', 'rechazado')),
            moderador_id UUID REFERENCES auth.users(id),
            respuesta_moderador TEXT,
            fecha_resolucion TIMESTAMP WITH TIME ZONE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        RAISE NOTICE 'Tabla reportes_contenido creada';
    ELSE
        RAISE NOTICE 'Tabla reportes_contenido ya existe';
    END IF;
END $$;

-- 9.2 Calificaciones de Contenido (solo si no existe)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'calificaciones_contenido') THEN
        CREATE TABLE public.calificaciones_contenido (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
            contenido_tipo TEXT NOT NULL CHECK (contenido_tipo IN ('leccion', 'examen', 'tema_teoria', 'ejercicio')),
            contenido_id UUID NOT NULL,
            calificacion INTEGER NOT NULL CHECK (calificacion BETWEEN 1 AND 5),
            comentario TEXT,
            aspectos_positivos TEXT[],
            aspectos_mejora TEXT[],
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(user_id, contenido_tipo, contenido_id)
        );
        RAISE NOTICE 'Tabla calificaciones_contenido creada';
    ELSE
        RAISE NOTICE 'Tabla calificaciones_contenido ya existe';
    END IF;
END $$;

-- 9.3 Sugerencias de Mejora (solo si no existe)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'sugerencias_mejora') THEN
        CREATE TABLE public.sugerencias_mejora (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
            contenido_tipo TEXT NOT NULL CHECK (contenido_tipo IN ('pregunta', 'ejercicio', 'leccion', 'tema_teoria', 'examen', 'sistema')),
            contenido_id UUID,
            categoria TEXT NOT NULL CHECK (categoria IN ('contenido', 'funcionalidad', 'diseno', 'usabilidad', 'rendimiento', 'otro')),
            titulo TEXT NOT NULL,
            descripcion TEXT NOT NULL,
            prioridad TEXT DEFAULT 'media' CHECK (prioridad IN ('baja', 'media', 'alta', 'critica')),
            estado TEXT DEFAULT 'nueva' CHECK (estado IN ('nueva', 'en_revision', 'planificada', 'en_desarrollo', 'implementada', 'rechazada')),
            votos_positivos INTEGER DEFAULT 0,
            votos_negativos INTEGER DEFAULT 0,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        RAISE NOTICE 'Tabla sugerencias_mejora creada';
    ELSE
        RAISE NOTICE 'Tabla sugerencias_mejora ya existe';
    END IF;
END $$;

-- =====================================================
-- CREAR ÍNDICES SOLO PARA TABLAS QUE EXISTEN Y TIENEN LAS COLUMNAS
-- =====================================================

-- Verificar y crear índices para medios
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'medios') 
       AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'medios' AND column_name = 'tipo') THEN
        IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'medios' AND indexname = 'idx_medios_tipo') THEN
            CREATE INDEX idx_medios_tipo ON public.medios(tipo);
            RAISE NOTICE 'Índice idx_medios_tipo creado';
        ELSE
            RAISE NOTICE 'Índice idx_medios_tipo ya existe';
        END IF;
    END IF;
END $$;

-- Verificar y crear índices para banco_preguntas
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'banco_preguntas') THEN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'banco_preguntas' AND column_name = 'habilidad') THEN
            IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'banco_preguntas' AND indexname = 'idx_banco_preguntas_habilidad') THEN
                CREATE INDEX idx_banco_preguntas_habilidad ON public.banco_preguntas(habilidad);
                RAISE NOTICE 'Índice idx_banco_preguntas_habilidad creado';
            ELSE
                RAISE NOTICE 'Índice idx_banco_preguntas_habilidad ya existe';
            END IF;
        END IF;
        
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'banco_preguntas' AND column_name = 'nivel') THEN
            IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'banco_preguntas' AND indexname = 'idx_banco_preguntas_nivel') THEN
                CREATE INDEX idx_banco_preguntas_nivel ON public.banco_preguntas(nivel);
                RAISE NOTICE 'Índice idx_banco_preguntas_nivel creado';
            ELSE
                RAISE NOTICE 'Índice idx_banco_preguntas_nivel ya existe';
            END IF;
        END IF;
    END IF;
END $$;

-- Verificar y crear índices para ejercicios
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'ejercicios') THEN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'ejercicios' AND column_name = 'habilidad') 
           AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'ejercicios' AND column_name = 'nivel') THEN
            IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'ejercicios' AND indexname = 'idx_ejercicios_habilidad_nivel') THEN
                CREATE INDEX idx_ejercicios_habilidad_nivel ON public.ejercicios(habilidad, nivel);
                RAISE NOTICE 'Índice idx_ejercicios_habilidad_nivel creado';
            ELSE
                RAISE NOTICE 'Índice idx_ejercicios_habilidad_nivel ya existe';
            END IF;
        END IF;
    END IF;
END $$;

-- =====================================================
-- HABILITAR RLS SOLO EN TABLAS QUE EXISTEN
-- =====================================================

-- Habilitar RLS en tablas nuevas
DO $$
DECLARE
    table_name TEXT;
    tables_to_check TEXT[] := ARRAY['medios', 'etiquetas', 'etiquetas_contenido', 'banco_preguntas', 'ejercicios', 'logros'];
BEGIN
    FOREACH table_name IN ARRAY tables_to_check
    LOOP
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = table_name) THEN
            EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', table_name);
            RAISE NOTICE 'RLS habilitado en tabla %', table_name;
        END IF;
    END LOOP;
END $$;

-- =====================================================
-- INSERTAR DATOS INICIALES SOLO SI NO EXISTEN
-- =====================================================

-- Insertar etiquetas básicas
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'etiquetas') THEN
        INSERT INTO public.etiquetas (nombre, descripcion, categoria, color) VALUES
        ('Phrasal Verbs', 'Verbos compuestos en inglés', 'vocabulary', '#FF6B6B'),
        ('B2 Reading', 'Lectura nivel B2', 'skill', '#4ECDC4'),
        ('Grammar', 'Reglas gramaticales', 'grammar', '#45B7D1'),
        ('Listening', 'Comprensión auditiva', 'skill', '#96CEB4'),
        ('Writing', 'Expresión escrita', 'skill', '#FFEAA7'),
        ('Speaking', 'Expresión oral', 'skill', '#DDA0DD'),
        ('Use of English', 'Uso del inglés', 'skill', '#98D8C8'),
        ('Vocabulary', 'Vocabulario general', 'vocabulary', '#F7DC6F'),
        ('A1 Level', 'Contenido nivel A1', 'level', '#AED6F1'),
        ('A2 Level', 'Contenido nivel A2', 'level', '#A9DFBF'),
        ('B1 Level', 'Contenido nivel B1', 'level', '#F9E79F'),
        ('B2 Level', 'Contenido nivel B2', 'level', '#FADBD8'),
        ('C1 Level', 'Contenido nivel C1', 'level', '#E8DAEF'),
        ('C2 Level', 'Contenido nivel C2', 'level', '#D5DBDB')
        ON CONFLICT (nombre) DO NOTHING;
        RAISE NOTICE 'Etiquetas básicas insertadas';
    END IF;
END $$;

-- Insertar logros básicos
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'logros') THEN
        INSERT INTO public.logros (nombre, descripcion, categoria, tipo, criterio, recompensa_xp, icono, color, orden) VALUES
        ('Primer Paso', 'Completa tu primer ejercicio', 'progreso', 'individual', '{"ejercicios_completados": 1}', 10, 'star', '#FFD700', 1),
        ('Estudiante Dedicado', 'Completa 10 ejercicios', 'progreso', 'individual', '{"ejercicios_completados": 10}', 50, 'medal', '#FF6B6B', 2),
        ('Maratón de Estudio', 'Estudia 7 días consecutivos', 'tiempo', 'individual', '{"streak_dias": 7}', 100, 'fire', '#FF4500', 3),
        ('Perfeccionista', 'Obtén 100% en un ejercicio', 'puntuacion', 'individual', '{"puntuacion_perfecta": 1}', 25, 'target', '#32CD32', 4),
        ('Multihabilidad', 'Completa ejercicios en 3 habilidades diferentes', 'habilidad', 'individual', '{"habilidades_diferentes": 3}', 75, 'layers', '#9370DB', 5),
        ('Primer Examen', 'Completa tu primer examen', 'progreso', 'individual', '{"examenes_completados": 1}', 50, 'award', '#FF8C00', 6),
        ('Racha de Oro', 'Mantén una racha de 30 días', 'tiempo', 'individual', '{"streak_dias": 30}', 500, 'crown', '#FFD700', 7),
        ('Experto en Gramática', 'Completa 50 ejercicios de gramática', 'habilidad', 'individual', '{"ejercicios_grammar": 50}', 200, 'book', '#20B2AA', 8)
        ON CONFLICT (nombre) DO NOTHING;
        RAISE NOTICE 'Logros básicos insertados';
    END IF;
END $$;

-- =====================================================
-- VERIFICACIÓN FINAL
-- =====================================================

SELECT '=== VERIFICACIÓN FINAL ===' as resultado;

-- Mostrar todas las tablas existentes
SELECT 'TABLAS EXISTENTES:' as info;
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Verificar datos iniciales
SELECT 'Etiquetas creadas:' as resultado, COUNT(*) as total FROM public.etiquetas;
SELECT 'Logros creados:' as resultado, COUNT(*) as total FROM public.logros;

SELECT '=== SCRIPT COMPLETADO ===' as resultado;
