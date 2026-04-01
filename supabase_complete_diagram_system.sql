-- =====================================================
-- SCRIPT COMPLETO PARA IMPLEMENTAR TODO EL DIAGRAMA
-- Incluye TODAS las tablas y relaciones del diagrama completo
-- =====================================================

-- =====================================================
-- 1. USUARIOS Y PERFIL (Ya existen, pero verificamos)
-- =====================================================

-- Verificar que las tablas de usuarios existen (ya las tienes)
-- 1.1.1 Usuarios (auth.users de Supabase)
-- 1.1.2 Roles (ya tienes user_profiles con role)
-- 1.1.3 Perfil (ya tienes user_profiles)

-- =====================================================
-- 2. BIBLIOTECA DE CONTENIDO (NUEVAS TABLAS)
-- =====================================================

-- 2.1 Medios (audios, imágenes, videos...)
CREATE TABLE IF NOT EXISTS public.medios (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre TEXT NOT NULL,
    tipo TEXT NOT NULL CHECK (tipo IN ('imagen', 'audio', 'video', 'documento', 'interactivo')),
    url TEXT NOT NULL,
    mime_type TEXT,
    tamaño_bytes BIGINT,
    duracion_segundos INTEGER, -- Para audios/videos
    descripcion TEXT,
    alt_text TEXT, -- Para accesibilidad
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2.2 Etiquetas (Phrasal verbs, B2 reading...)
CREATE TABLE IF NOT EXISTS public.etiquetas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre TEXT UNIQUE NOT NULL,
    descripcion TEXT,
    categoria TEXT, -- "grammar", "vocabulary", "skill", "level"
    color TEXT DEFAULT '#3B82F6', -- Color para UI
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2.2.1 Etiquetas-Contenido (Tabla puente para cualquier contenido)
CREATE TABLE IF NOT EXISTS public.etiquetas_contenido (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    etiqueta_id UUID REFERENCES public.etiquetas(id) ON DELETE CASCADE,
    contenido_tipo TEXT NOT NULL, -- "pregunta", "ejercicio", "leccion", "tema_teoria"
    contenido_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(etiqueta_id, contenido_tipo, contenido_id)
);

-- 2.3 Banco-Preguntas (Base de datos de preguntas)
CREATE TABLE IF NOT EXISTS public.banco_preguntas (
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
    referencias JSONB DEFAULT '[]'::jsonb, -- Referencias a exámenes, temas, etc.
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2.3.1 Banco-Preguntas-Teoría (Relación con temas de teoría)
CREATE TABLE IF NOT EXISTS public.banco_preguntas_teoria (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    pregunta_id UUID REFERENCES public.banco_preguntas(id) ON DELETE CASCADE,
    tema_teoria_id UUID REFERENCES public.temas_teoria(id) ON DELETE CASCADE,
    orden INTEGER DEFAULT 0,
    notas_especificas TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(pregunta_id, tema_teoria_id)
);

-- 2.3.2 Banco-Preguntas-Nivel (Para pruebas de nivel)
CREATE TABLE IF NOT EXISTS public.banco_preguntas_nivel (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    pregunta_id UUID REFERENCES public.banco_preguntas(id) ON DELETE CASCADE,
    nivel_target TEXT NOT NULL CHECK (nivel_target IN ('A1', 'A2', 'B1', 'B2', 'C1', 'C2')),
    peso_diagnostico DECIMAL(3,2) DEFAULT 1.0, -- Peso para determinar nivel
    is_adaptativa BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2.3.3 Banco-Preguntas-Examen (Para exámenes Cambridge)
CREATE TABLE IF NOT EXISTS public.banco_preguntas_examen (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    pregunta_id UUID REFERENCES public.banco_preguntas(id) ON DELETE CASCADE,
    examen_id UUID REFERENCES public.examenes(id) ON DELETE CASCADE,
    seccion_tipo TEXT, -- "reading_part1", "use_of_english_part2", etc.
    peso_examen DECIMAL(3,2) DEFAULT 1.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2.3.4 Banco-Preguntas-Training (Para entrenamientos)
CREATE TABLE IF NOT EXISTS public.banco_preguntas_training (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    pregunta_id UUID REFERENCES public.banco_preguntas(id) ON DELETE CASCADE,
    curso_id UUID REFERENCES public.cursos(id) ON DELETE CASCADE,
    unidad_tipo TEXT, -- "use_of_english", "listening", etc.
    dificultad_target TEXT CHECK (dificultad_target IN ('básico', 'intermedio', 'avanzado')),
    nivel_target TEXT CHECK (nivel_target IN ('A1', 'A2', 'B1', 'B2', 'C1', 'C2')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2.3.5 Explicaciones-Ejercicio (Explicaciones adicionales)
CREATE TABLE IF NOT EXISTS public.explicaciones_ejercicio (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    pregunta_id UUID REFERENCES public.banco_preguntas(id) ON DELETE CASCADE,
    tipo_explicacion TEXT DEFAULT 'detallada' CHECK (tipo_explicacion IN ('breve', 'detallada', 'gramatical', 'cultural')),
    contenido TEXT NOT NULL,
    ejemplos JSONB DEFAULT '[]'::jsonb,
    referencias TEXT[],
    orden INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2.4 Ejercicios (Paquetes de preguntas)
CREATE TABLE IF NOT EXISTS public.ejercicios (
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
    is_aleatorio BOOLEAN DEFAULT FALSE, -- Si las preguntas se muestran aleatoriamente
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2.4.1 Opciones-Pregunta (Para preguntas con opciones)
CREATE TABLE IF NOT EXISTS public.opciones_pregunta (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    pregunta_id UUID REFERENCES public.banco_preguntas(id) ON DELETE CASCADE,
    texto_opcion TEXT NOT NULL,
    es_correcta BOOLEAN DEFAULT FALSE,
    orden INTEGER DEFAULT 0,
    explicacion TEXT, -- Explicación específica de esta opción
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2.4.2 Medios-Pregunta (Relación pregunta ↔ medios)
CREATE TABLE IF NOT EXISTS public.medios_pregunta (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    pregunta_id UUID REFERENCES public.banco_preguntas(id) ON DELETE CASCADE,
    medio_id UUID REFERENCES public.medios(id) ON DELETE CASCADE,
    tipo_uso TEXT DEFAULT 'contenido' CHECK (tipo_uso IN ('contenido', 'opcion', 'explicacion', 'ayuda')),
    orden INTEGER DEFAULT 0,
    notas TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(pregunta_id, medio_id, tipo_uso)
);

-- 2.4.3 Preguntas-Ejercicio (Orden y puntuación en ejercicio)
CREATE TABLE IF NOT EXISTS public.preguntas_ejercicio (
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

-- =====================================================
-- 3. TEORÍA (ACTUALIZADA CON RELACIONES)
-- =====================================================

-- Las tablas de teoría ya están en el script anterior, pero necesitamos
-- asegurar que existan las relaciones correctas

-- =====================================================
-- 4. EXÁMENES CAMBRIDGE (ACTUALIZADA)
-- =====================================================

-- Las tablas de exámenes ya están, pero necesitamos actualizar las relaciones

-- =====================================================
-- 5. PRUEBA DE NIVEL (ACTUALIZADA)
-- =====================================================

-- Las tablas de prueba de nivel ya están

-- =====================================================
-- 6. TRAINING (ACTUALIZADA CON RELACIONES COMPLETAS)
-- =====================================================

-- 6.5 Ejercicios-En-Nivel (ACTUALIZADA con sub-campos)
CREATE TABLE IF NOT EXISTS public.ejercicios_en_nivel (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    leccion_id UUID REFERENCES public.lecciones(id) ON DELETE CASCADE,
    ejercicio_id UUID REFERENCES public.ejercicios(id) ON DELETE CASCADE,
    orden INTEGER DEFAULT 0,
    peso_puntuacion DECIMAL(3,2) DEFAULT 1.0,
    explicacion TEXT, -- 6.5.1 Explicación
    puntuacion_maxima INTEGER DEFAULT 100, -- 6.5.2 Puntuaciones
    tiempo_limite_minutos INTEGER,
    intentos_permitidos INTEGER DEFAULT 3,
    is_aleatorio BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(leccion_id, ejercicio_id)
);

-- =====================================================
-- 7. PROGRESO Y ESTADÍSTICAS (NUEVAS TABLAS)
-- =====================================================

-- 7.1 Progreso General Usuario
CREATE TABLE IF NOT EXISTS public.progreso_general_usuario (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    nivel_actual TEXT CHECK (nivel_actual IN ('A1', 'A2', 'B1', 'B2', 'C1', 'C2')),
    xp_total INTEGER DEFAULT 0,
    tiempo_total_estudio_minutos INTEGER DEFAULT 0,
    ejercicios_completados INTEGER DEFAULT 0,
    examenes_completados INTEGER DEFAULT 0,
    mejor_puntuacion_examen INTEGER DEFAULT 0,
    ultimo_acceso TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    streak_dias INTEGER DEFAULT 0, -- Racha de días consecutivos
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- 7.2 Estadísticas por Habilidad
CREATE TABLE IF NOT EXISTS public.estadisticas_habilidad (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    habilidad TEXT NOT NULL CHECK (habilidad IN ('reading', 'writing', 'listening', 'speaking', 'use_of_english', 'grammar', 'vocabulary')),
    nivel_actual TEXT CHECK (nivel_actual IN ('A1', 'A2', 'B1', 'B2', 'C1', 'C2')),
    ejercicios_completados INTEGER DEFAULT 0,
    puntuacion_promedio DECIMAL(5,2) DEFAULT 0,
    tiempo_promedio_segundos INTEGER DEFAULT 0,
    fortalezas TEXT[], -- Áreas fuertes
    debilidades TEXT[], -- Áreas débiles
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, habilidad)
);

-- 7.3 Historial de Actividad
CREATE TABLE IF NOT EXISTS public.historial_actividad (
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

-- 7.4 Logs Detallados de Sesiones
CREATE TABLE IF NOT EXISTS public.logs_sesiones (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    sesion_tipo TEXT NOT NULL CHECK (sesion_tipo IN ('training', 'examen', 'test_nivel', 'teoria')),
    sesion_id UUID NOT NULL, -- ID del intento/sesión específico
    accion TEXT NOT NULL, -- "inicio", "pausa", "continuar", "completar", "abandonar"
    timestamp_accion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    datos_contexto JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 8. GAMIFICACIÓN (NUEVAS TABLAS)
-- =====================================================

-- 8.1 Logros/Achievements
CREATE TABLE IF NOT EXISTS public.logros (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre TEXT UNIQUE NOT NULL,
    descripcion TEXT,
    categoria TEXT NOT NULL CHECK (categoria IN ('progreso', 'habilidad', 'tiempo', 'puntuacion', 'consistencia', 'social')),
    tipo TEXT NOT NULL CHECK (tipo IN ('individual', 'social', 'temporal')),
    criterio JSONB NOT NULL, -- Criterios para desbloquear
    recompensa_xp INTEGER DEFAULT 0,
    recompensa_tipo TEXT, -- "badge", "title", "access", "item"
    recompensa_valor TEXT,
    icono TEXT, -- Nombre del icono
    color TEXT DEFAULT '#FFD700',
    is_active BOOLEAN DEFAULT TRUE,
    is_secreto BOOLEAN DEFAULT FALSE,
    orden INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8.2 Logros de Usuario (Tabla puente)
CREATE TABLE IF NOT EXISTS public.logros_usuario (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    logro_id UUID REFERENCES public.logros(id) ON DELETE CASCADE,
    fecha_obtencion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    progreso_actual DECIMAL(5,2) DEFAULT 0, -- Para logros progresivos
    is_completado BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, logro_id)
);

-- 8.3 XP y Puntos
CREATE TABLE IF NOT EXISTS public.xp_usuario (
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

-- 8.4 Leaderboard
CREATE TABLE IF NOT EXISTS public.leaderboard (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    tipo_leaderboard TEXT NOT NULL CHECK (tipo_leaderboard IN ('global', 'semanal', 'mensual', 'por_nivel', 'por_habilidad')),
    periodo TEXT, -- "2024-01", "semana-15", etc.
    habilidad TEXT, -- Para leaderboards específicos por habilidad
    nivel TEXT, -- Para leaderboards por nivel
    puntuacion INTEGER DEFAULT 0,
    posicion INTEGER,
    participaciones INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, tipo_leaderboard, periodo, habilidad, nivel)
);

-- =====================================================
-- 9. MODERACIÓN Y CALIDAD (NUEVAS TABLAS)
-- =====================================================

-- 9.1 Reportes de Contenido
CREATE TABLE IF NOT EXISTS public.reportes_contenido (
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

-- 9.2 Calificaciones de Contenido
CREATE TABLE IF NOT EXISTS public.calificaciones_contenido (
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

-- 9.3 Sugerencias de Mejora
CREATE TABLE IF NOT EXISTS public.sugerencias_mejora (
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

-- =====================================================
-- ÍNDICES PARA RENDIMIENTO
-- =====================================================

-- Índices para biblioteca
CREATE INDEX IF NOT EXISTS idx_medios_tipo ON public.medios(tipo);
CREATE INDEX IF NOT EXISTS idx_etiquetas_categoria ON public.etiquetas(categoria);
CREATE INDEX IF NOT EXISTS idx_etiquetas_contenido_tipo ON public.etiquetas_contenido(contenido_tipo);
CREATE INDEX IF NOT EXISTS idx_banco_preguntas_habilidad ON public.banco_preguntas(habilidad);
CREATE INDEX IF NOT EXISTS idx_banco_preguntas_nivel ON public.banco_preguntas(nivel);
CREATE INDEX IF NOT EXISTS idx_ejercicios_habilidad_nivel ON public.ejercicios(habilidad, nivel);

-- Índices para progreso y estadísticas
CREATE INDEX IF NOT EXISTS idx_progreso_general_user ON public.progreso_general_usuario(user_id);
CREATE INDEX IF NOT EXISTS idx_estadisticas_habilidad_user ON public.estadisticas_habilidad(user_id);
CREATE INDEX IF NOT EXISTS idx_historial_actividad_user ON public.historial_actividad(user_id);
CREATE INDEX IF NOT EXISTS idx_logs_sesiones_user ON public.logs_sesiones(user_id);

-- Índices para gamificación
CREATE INDEX IF NOT EXISTS idx_logros_categoria ON public.logros(categoria);
CREATE INDEX IF NOT EXISTS idx_logros_usuario_user ON public.logros_usuario(user_id);
CREATE INDEX IF NOT EXISTS idx_leaderboard_tipo ON public.leaderboard(tipo_leaderboard);
CREATE INDEX IF NOT EXISTS idx_leaderboard_periodo ON public.leaderboard(periodo);

-- Índices para moderación
CREATE INDEX IF NOT EXISTS idx_reportes_contenido_tipo ON public.reportes_contenido(contenido_tipo);
CREATE INDEX IF NOT EXISTS idx_reportes_contenido_estado ON public.reportes_contenido(estado);
CREATE INDEX IF NOT EXISTS idx_calificaciones_contenido_tipo ON public.calificaciones_contenido(contenido_tipo);
CREATE INDEX IF NOT EXISTS idx_sugerencias_mejora_estado ON public.sugerencias_mejora(estado);

-- =====================================================
-- FUNCIONES Y TRIGGERS
-- =====================================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Función para actualizar estadísticas de ejercicio
CREATE OR REPLACE FUNCTION update_ejercicio_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Actualizar número de preguntas en ejercicio
    UPDATE public.ejercicios 
    SET numero_preguntas = (
        SELECT COUNT(*) 
        FROM public.preguntas_ejercicio 
        WHERE ejercicio_id = NEW.ejercicio_id
    ),
    updated_at = NOW()
    WHERE id = NEW.ejercicio_id;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Función para actualizar XP de usuario
CREATE OR REPLACE FUNCTION update_user_xp()
RETURNS TRIGGER AS $$
BEGIN
    -- Actualizar XP total del usuario
    INSERT INTO public.xp_usuario (user_id, xp_total, xp_semana, xp_mes, updated_at)
    VALUES (NEW.user_id, NEW.xp_obtenido, NEW.xp_obtenido, NEW.xp_obtenido, NOW())
    ON CONFLICT (user_id) 
    DO UPDATE SET 
        xp_total = xp_usuario.xp_total + NEW.xp_obtenido,
        xp_semana = xp_usuario.xp_semana + NEW.xp_obtenido,
        xp_mes = xp_usuario.xp_mes + NEW.xp_obtenido,
        updated_at = NOW();
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
DO $$
BEGIN
    -- Triggers para tablas que ya tenían updated_at
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_medios_updated_at') THEN
        CREATE TRIGGER update_medios_updated_at 
            BEFORE UPDATE ON public.medios 
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_banco_preguntas_updated_at') THEN
        CREATE TRIGGER update_banco_preguntas_updated_at 
            BEFORE UPDATE ON public.banco_preguntas 
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_ejercicios_updated_at') THEN
        CREATE TRIGGER update_ejercicios_updated_at 
            BEFORE UPDATE ON public.ejercicios 
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_progreso_general_updated_at') THEN
        CREATE TRIGGER update_progreso_general_updated_at 
            BEFORE UPDATE ON public.progreso_general_usuario 
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_estadisticas_habilidad_updated_at') THEN
        CREATE TRIGGER update_estadisticas_habilidad_updated_at 
            BEFORE UPDATE ON public.estadisticas_habilidad 
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_xp_usuario_updated_at') THEN
        CREATE TRIGGER update_xp_usuario_updated_at 
            BEFORE UPDATE ON public.xp_usuario 
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_leaderboard_updated_at') THEN
        CREATE TRIGGER update_leaderboard_updated_at 
            BEFORE UPDATE ON public.leaderboard 
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_sugerencias_mejora_updated_at') THEN
        CREATE TRIGGER update_sugerencias_mejora_updated_at 
            BEFORE UPDATE ON public.sugerencias_mejora 
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Triggers para estadísticas automáticas
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_ejercicio_stats_trigger') THEN
        CREATE TRIGGER update_ejercicio_stats_trigger 
            AFTER INSERT OR DELETE ON public.preguntas_ejercicio 
            FOR EACH ROW EXECUTE FUNCTION update_ejercicio_stats();
    END IF;
END $$;

-- =====================================================
-- POLÍTICAS RLS (ROW LEVEL SECURITY)
-- =====================================================

-- Habilitar RLS en todas las tablas nuevas
ALTER TABLE public.medios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.etiquetas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.etiquetas_contenido ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banco_preguntas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banco_preguntas_teoria ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banco_preguntas_nivel ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banco_preguntas_examen ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banco_preguntas_training ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.explicaciones_ejercicio ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ejercicios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opciones_pregunta ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medios_pregunta ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.preguntas_ejercicio ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ejercicios_en_nivel ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progreso_general_usuario ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.estadisticas_habilidad ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.historial_actividad ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logs_sesiones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logros ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logros_usuario ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xp_usuario ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboard ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reportes_contenido ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calificaciones_contenido ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sugerencias_mejora ENABLE ROW LEVEL SECURITY;

-- Políticas básicas (solo si no existen)
DO $$
BEGIN
    -- Políticas para contenido público (lectura)
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'medios' AND policyname = 'Everyone can view active media') THEN
        CREATE POLICY "Everyone can view active media" ON public.medios
            FOR SELECT USING (is_active = true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'etiquetas' AND policyname = 'Everyone can view active tags') THEN
        CREATE POLICY "Everyone can view active tags" ON public.etiquetas
            FOR SELECT USING (is_active = true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'banco_preguntas' AND policyname = 'Everyone can view active questions') THEN
        CREATE POLICY "Everyone can view active questions" ON public.banco_preguntas
            FOR SELECT USING (is_active = true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ejercicios' AND policyname = 'Everyone can view active exercises') THEN
        CREATE POLICY "Everyone can view active exercises" ON public.ejercicios
            FOR SELECT USING (is_active = true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'logros' AND policyname = 'Everyone can view active achievements') THEN
        CREATE POLICY "Everyone can view active achievements" ON public.logros
            FOR SELECT USING (is_active = true);
    END IF;

    -- Políticas para progreso de usuario
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'progreso_general_usuario' AND policyname = 'Users can manage their own progress') THEN
        CREATE POLICY "Users can manage their own progress" ON public.progreso_general_usuario
            FOR ALL USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'estadisticas_habilidad' AND policyname = 'Users can manage their own skill stats') THEN
        CREATE POLICY "Users can manage their own skill stats" ON public.estadisticas_habilidad
            FOR ALL USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'historial_actividad' AND policyname = 'Users can view their own activity') THEN
        CREATE POLICY "Users can view their own activity" ON public.historial_actividad
            FOR SELECT USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'logros_usuario' AND policyname = 'Users can view their own achievements') THEN
        CREATE POLICY "Users can view their own achievements" ON public.logros_usuario
            FOR SELECT USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'xp_usuario' AND policyname = 'Users can view their own XP') THEN
        CREATE POLICY "Users can view their own XP" ON public.xp_usuario
            FOR SELECT USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'leaderboard' AND policyname = 'Everyone can view leaderboards') THEN
        CREATE POLICY "Everyone can view leaderboards" ON public.leaderboard
            FOR SELECT USING (true);
    END IF;

    -- Políticas para moderación
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'reportes_contenido' AND policyname = 'Users can create reports') THEN
        CREATE POLICY "Users can create reports" ON public.reportes_contenido
            FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'calificaciones_contenido' AND policyname = 'Users can manage their own ratings') THEN
        CREATE POLICY "Users can manage their own ratings" ON public.calificaciones_contenido
            FOR ALL USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'sugerencias_mejora' AND policyname = 'Users can create suggestions') THEN
        CREATE POLICY "Users can create suggestions" ON public.sugerencias_mejora
            FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;

    -- Políticas para administradores
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'medios' AND policyname = 'Admins can manage all media') THEN
        CREATE POLICY "Admins can manage all media" ON public.medios
            FOR ALL USING (
                EXISTS (
                    SELECT 1 FROM public.user_profiles 
                    WHERE id = auth.uid() AND role = 'admin'
                )
            );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'banco_preguntas' AND policyname = 'Admins can manage all questions') THEN
        CREATE POLICY "Admins can manage all questions" ON public.banco_preguntas
            FOR ALL USING (
                EXISTS (
                    SELECT 1 FROM public.user_profiles 
                    WHERE id = auth.uid() AND role = 'admin'
                )
            );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ejercicios' AND policyname = 'Admins can manage all exercises') THEN
        CREATE POLICY "Admins can manage all exercises" ON public.ejercicios
            FOR ALL USING (
                EXISTS (
                    SELECT 1 FROM public.user_profiles 
                    WHERE id = auth.uid() AND role = 'admin'
                )
            );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'reportes_contenido' AND policyname = 'Admins can manage all reports') THEN
        CREATE POLICY "Admins can manage all reports" ON public.reportes_contenido
            FOR ALL USING (
                EXISTS (
                    SELECT 1 FROM public.user_profiles 
                    WHERE id = auth.uid() AND role = 'admin'
                )
            );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'sugerencias_mejora' AND policyname = 'Admins can manage all suggestions') THEN
        CREATE POLICY "Admins can manage all suggestions" ON public.sugerencias_mejora
            FOR ALL USING (
                EXISTS (
                    SELECT 1 FROM public.user_profiles 
                    WHERE id = auth.uid() AND role = 'admin'
                )
            );
    END IF;
END $$;

-- =====================================================
-- DATOS INICIALES
-- =====================================================

-- Insertar etiquetas básicas
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

-- Insertar logros básicos
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

-- =====================================================
-- COMENTARIOS Y DOCUMENTACIÓN
-- =====================================================

COMMENT ON TABLE public.medios IS 'Archivos multimedia (imágenes, audios, videos)';
COMMENT ON TABLE public.etiquetas IS 'Etiquetas para categorizar contenido';
COMMENT ON TABLE public.etiquetas_contenido IS 'Relación entre etiquetas y cualquier tipo de contenido';
COMMENT ON TABLE public.banco_preguntas IS 'Base de datos de preguntas reutilizables';
COMMENT ON TABLE public.ejercicios IS 'Paquetes de preguntas organizados';
COMMENT ON TABLE public.preguntas_ejercicio IS 'Relación entre ejercicios y preguntas con orden';
COMMENT ON TABLE public.opciones_pregunta IS 'Opciones para preguntas de selección múltiple';
COMMENT ON TABLE public.medios_pregunta IS 'Medios asociados a preguntas específicas';
COMMENT ON TABLE public.progreso_general_usuario IS 'Progreso general de cada usuario';
COMMENT ON TABLE public.estadisticas_habilidad IS 'Estadísticas detalladas por habilidad';
COMMENT ON TABLE public.historial_actividad IS 'Historial de actividades del usuario';
COMMENT ON TABLE public.logros IS 'Sistema de logros y recompensas';
COMMENT ON TABLE public.logros_usuario IS 'Logros obtenidos por cada usuario';
COMMENT ON TABLE public.xp_usuario IS 'Sistema de puntos de experiencia';
COMMENT ON TABLE public.leaderboard IS 'Tablas de clasificación';
COMMENT ON TABLE public.reportes_contenido IS 'Reportes de problemas en el contenido';
COMMENT ON TABLE public.calificaciones_contenido IS 'Calificaciones de usuarios sobre el contenido';
COMMENT ON TABLE public.sugerencias_mejora IS 'Sugerencias de mejora del sistema';

-- =====================================================
-- VISTAS ÚTILES PARA CONSULTAS
-- =====================================================

-- Vista de ejercicios completos con preguntas
CREATE OR REPLACE VIEW public.v_ejercicios_completos AS
SELECT 
    e.id,
    e.titulo,
    e.descripcion,
    e.habilidad,
    e.nivel,
    e.tiempo_sugerido_minutos,
    e.puntuacion_total,
    e.numero_preguntas,
    e.is_aleatorio,
    COALESCE(array_agg(
        json_build_object(
            'pregunta_id', pe.pregunta_id,
            'orden', pe.orden,
            'puntuacion', pe.puntuacion_pregunta,
            'enunciado', bp.enunciado,
            'tipo_pregunta', bp.tipo_pregunta,
            'opciones', (
                SELECT json_agg(
                    json_build_object(
                        'id', op.id,
                        'texto', op.texto_opcion,
                        'es_correcta', op.es_correcta,
                        'orden', op.orden
                    )
                )
                FROM public.opciones_pregunta op
                WHERE op.pregunta_id = bp.id
                ORDER BY op.orden
            )
        ) ORDER BY pe.orden
    ) FILTER (WHERE pe.id IS NOT NULL), '{}'::json) as preguntas
FROM public.ejercicios e
LEFT JOIN public.preguntas_ejercicio pe ON e.id = pe.ejercicio_id
LEFT JOIN public.banco_preguntas bp ON pe.pregunta_id = bp.id
WHERE e.is_active = true
GROUP BY e.id, e.titulo, e.descripcion, e.habilidad, e.nivel, e.tiempo_sugerido_minutos, e.puntuacion_total, e.numero_preguntas, e.is_aleatorio;

-- Vista de progreso de usuario con detalles
CREATE OR REPLACE VIEW public.v_progreso_usuario_detallado AS
SELECT 
    pgu.user_id,
    pgu.nivel_actual,
    pgu.xp_total,
    pgu.tiempo_total_estudio_minutos,
    pgu.ejercicios_completados,
    pgu.examenes_completados,
    pgu.streak_dias,
    pgu.ultimo_acceso,
    xu.nivel_actual as nivel_xp,
    xu.xp_para_siguiente_nivel,
    COALESCE(array_agg(
        json_build_object(
            'habilidad', eh.habilidad,
            'nivel', eh.nivel_actual,
            'ejercicios_completados', eh.ejercicios_completados,
            'puntuacion_promedio', eh.puntuacion_promedio,
            'fortalezas', eh.fortalezas,
            'debilidades', eh.debilidades
        )
    ) FILTER (WHERE eh.id IS NOT NULL), '{}'::json) as estadisticas_habilidades,
    (
        SELECT COUNT(*) 
        FROM public.logros_usuario lu 
        WHERE lu.user_id = pgu.user_id AND lu.is_completado = true
    ) as logros_obtenidos
FROM public.progreso_general_usuario pgu
LEFT JOIN public.xp_usuario xu ON pgu.user_id = xu.user_id
LEFT JOIN public.estadisticas_habilidad eh ON pgu.user_id = eh.user_id
GROUP BY pgu.user_id, pgu.nivel_actual, pgu.xp_total, pgu.tiempo_total_estudio_minutos, 
         pgu.ejercicios_completados, pgu.examenes_completados, pgu.streak_dias, pgu.ultimo_acceso,
         xu.nivel_actual, xu.xp_para_siguiente_nivel;

-- =====================================================
-- INSTRUCCIONES POST-EJECUCIÓN
-- =====================================================

-- 1. Verificar que todas las tablas se crearon:
--    SELECT table_name FROM information_schema.tables 
--    WHERE table_schema = 'public' 
--    AND table_name IN (
--        'medios', 'etiquetas', 'banco_preguntas', 'ejercicios',
--        'progreso_general_usuario', 'logros', 'reportes_contenido'
--    )
--    ORDER BY table_name;

-- 2. Verificar las relaciones:
--    SELECT 
--        tc.table_name, 
--        kcu.column_name, 
--        ccu.table_name AS foreign_table_name,
--        ccu.column_name AS foreign_column_name 
--    FROM information_schema.table_constraints AS tc 
--    JOIN information_schema.key_column_usage AS kcu
--      ON tc.constraint_name = kcu.constraint_name
--      AND tc.table_schema = kcu.table_schema
--    JOIN information_schema.constraint_column_usage AS ccu
--      ON ccu.constraint_name = tc.constraint_name
--      AND ccu.table_schema = tc.table_schema
--    WHERE tc.constraint_type = 'FOREIGN KEY' 
--    AND tc.table_schema = 'public'
--    ORDER BY tc.table_name;

-- 3. Verificar datos iniciales:
--    SELECT * FROM public.etiquetas ORDER BY categoria, nombre;
--    SELECT * FROM public.logros ORDER BY orden;

-- 4. Verificar políticas RLS:
--    SELECT tablename, policyname, cmd FROM pg_policies 
--    WHERE tablename IN ('medios', 'ejercicios', 'banco_preguntas')
--    ORDER BY tablename, policyname;

-- =====================================================
-- FIN DEL SCRIPT COMPLETO
-- =====================================================
