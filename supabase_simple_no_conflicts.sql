-- ========================================
-- SCRIPT SIMPLE SIN CONFLICTOS - BASADO EN TU SUPABASE REAL
-- ========================================
-- Este script NO usa ON CONFLICT para evitar errores

-- 1. CREAR TABLAS FALTANTES (solo las que no existen)
-- ========================================

-- Tabla para medios/archivos multimedia
CREATE TABLE IF NOT EXISTS public.medios (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre TEXT NOT NULL,
    tipo TEXT NOT NULL CHECK (tipo IN ('imagen', 'audio', 'video', 'documento')),
    url TEXT NOT NULL,
    descripcion TEXT,
    tamaño INTEGER,
    duracion INTEGER, -- en segundos para audio/video
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla para banco de preguntas (preguntas reutilizables)
CREATE TABLE IF NOT EXISTS public.banco_preguntas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    enunciado TEXT NOT NULL,
    tipo TEXT NOT NULL CHECK (tipo IN ('multiple_choice', 'true_false', 'fill_blank', 'matching', 'ordering')),
    nivel TEXT NOT NULL CHECK (nivel IN ('A1', 'A2', 'B1', 'B2', 'C1', 'C2')),
    habilidad TEXT NOT NULL CHECK (habilidad IN ('reading', 'writing', 'listening', 'speaking', 'use_of_english')),
    puntos INTEGER DEFAULT 1,
    tiempo_estimado INTEGER DEFAULT 60, -- en segundos
    explicacion TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla para logros/achievements
CREATE TABLE IF NOT EXISTS public.logros (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre TEXT NOT NULL UNIQUE, -- Agregamos UNIQUE para poder usar ON CONFLICT después
    descripcion TEXT NOT NULL,
    categoria TEXT NOT NULL CHECK (categoria IN ('progreso', 'habilidad', 'consistencia', 'velocidad', 'dedicacion')),
    icono TEXT,
    puntos_xp INTEGER DEFAULT 10,
    requisitos JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. CREAR TABLAS DE RELACIÓN
-- ========================================

-- Logros de usuarios
CREATE TABLE IF NOT EXISTS public.logros_usuario (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    logro_id UUID REFERENCES public.logros(id) ON DELETE CASCADE,
    obtenido_en TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    progreso INTEGER DEFAULT 0,
    UNIQUE(user_id, logro_id)
);

-- XP de usuarios
CREATE TABLE IF NOT EXISTS public.xp_usuario (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    total_xp INTEGER DEFAULT 0,
    xp_por_habilidad JSONB DEFAULT '{"reading": 0, "writing": 0, "listening": 0, "speaking": 0, "use_of_english": 0}',
    nivel_actual TEXT DEFAULT 'A1',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Relación medios con preguntas
CREATE TABLE IF NOT EXISTS public.preguntas_medios (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    pregunta_id UUID REFERENCES public.preguntas(id) ON DELETE CASCADE,
    medio_id UUID REFERENCES public.medios(id) ON DELETE CASCADE,
    tipo_relacion TEXT DEFAULT 'attachment' CHECK (tipo_relacion IN ('attachment', 'answer', 'hint')),
    orden INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(pregunta_id, medio_id, tipo_relacion)
);

-- Relación banco_preguntas con opciones
CREATE TABLE IF NOT EXISTS public.banco_preguntas_opciones (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    banco_pregunta_id UUID REFERENCES public.banco_preguntas(id) ON DELETE CASCADE,
    opcion_id UUID REFERENCES public.opciones(id) ON DELETE CASCADE,
    es_correcta BOOLEAN DEFAULT FALSE,
    orden INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(banco_pregunta_id, opcion_id)
);

-- 3. INSERTAR DATOS INICIALES (SIN ON CONFLICT)
-- ========================================

-- Insertar logros básicos (solo si no existen)
INSERT INTO public.logros (nombre, descripcion, categoria, icono, puntos_xp) 
SELECT 'Primer Paso', 'Completar tu primer ejercicio', 'progreso', '🎯', 10
WHERE NOT EXISTS (SELECT 1 FROM public.logros WHERE nombre = 'Primer Paso');

INSERT INTO public.logros (nombre, descripcion, categoria, icono, puntos_xp) 
SELECT 'Estudiante Dedicado', 'Completar 10 ejercicios en un día', 'dedicacion', '📚', 25
WHERE NOT EXISTS (SELECT 1 FROM public.logros WHERE nombre = 'Estudiante Dedicado');

INSERT INTO public.logros (nombre, descripcion, categoria, icono, puntos_xp) 
SELECT 'Velocidad Relámpago', 'Completar un ejercicio en menos de 30 segundos', 'velocidad', '⚡', 15
WHERE NOT EXISTS (SELECT 1 FROM public.logros WHERE nombre = 'Velocidad Relámpago');

INSERT INTO public.logros (nombre, descripcion, categoria, icono, puntos_xp) 
SELECT 'Consistencia Perfecta', 'Completar ejercicios 7 días seguidos', 'consistencia', '📅', 50
WHERE NOT EXISTS (SELECT 1 FROM public.logros WHERE nombre = 'Consistencia Perfecta');

INSERT INTO public.logros (nombre, descripcion, categoria, icono, puntos_xp) 
SELECT 'Maestro de Lectura', 'Obtener 90% en 10 ejercicios de reading', 'habilidad', '📖', 30
WHERE NOT EXISTS (SELECT 1 FROM public.logros WHERE nombre = 'Maestro de Lectura');

INSERT INTO public.logros (nombre, descripcion, categoria, icono, puntos_xp) 
SELECT 'Escritor Experto', 'Obtener 90% en 10 ejercicios de writing', 'habilidad', '✍️', 30
WHERE NOT EXISTS (SELECT 1 FROM public.logros WHERE nombre = 'Escritor Experto');

INSERT INTO public.logros (nombre, descripcion, categoria, icono, puntos_xp) 
SELECT 'Oído de Oro', 'Obtener 90% en 10 ejercicios de listening', 'habilidad', '🎧', 30
WHERE NOT EXISTS (SELECT 1 FROM public.logros WHERE nombre = 'Oído de Oro');

INSERT INTO public.logros (nombre, descripcion, categoria, icono, puntos_xp) 
SELECT 'Conversador Natural', 'Obtener 90% en 10 ejercicios de speaking', 'habilidad', '🗣️', 30
WHERE NOT EXISTS (SELECT 1 FROM public.logros WHERE nombre = 'Conversador Natural');

INSERT INTO public.logros (nombre, descripcion, categoria, icono, puntos_xp) 
SELECT 'Gramático Profesional', 'Obtener 90% en 10 ejercicios de use of english', 'habilidad', '📝', 30
WHERE NOT EXISTS (SELECT 1 FROM public.logros WHERE nombre = 'Gramático Profesional');

-- Insertar medios de ejemplo (solo si no existen)
INSERT INTO public.medios (nombre, tipo, url, descripcion, tamaño) 
SELECT 'imagen_ejemplo_1.jpg', 'imagen', '/media/images/ejemplo1.jpg', 'Imagen de ejemplo para ejercicios', 1024
WHERE NOT EXISTS (SELECT 1 FROM public.medios WHERE nombre = 'imagen_ejemplo_1.jpg');

INSERT INTO public.medios (nombre, tipo, url, descripcion, tamaño) 
SELECT 'audio_ejemplo_1.mp3', 'audio', '/media/audio/ejemplo1.mp3', 'Audio de ejemplo para listening', 2048
WHERE NOT EXISTS (SELECT 1 FROM public.medios WHERE nombre = 'audio_ejemplo_1.mp3');

INSERT INTO public.medios (nombre, tipo, url, descripcion, tamaño) 
SELECT 'video_ejemplo_1.mp4', 'video', '/media/video/ejemplo1.mp4', 'Video de ejemplo para speaking', 5120
WHERE NOT EXISTS (SELECT 1 FROM public.medios WHERE nombre = 'video_ejemplo_1.mp4');

-- Insertar preguntas de ejemplo en banco (solo si no existen)
INSERT INTO public.banco_preguntas (enunciado, tipo, nivel, habilidad, puntos, explicacion) 
SELECT 'What is the capital of England?', 'multiple_choice', 'A2', 'reading', 1, 'London is the capital and largest city of England.'
WHERE NOT EXISTS (SELECT 1 FROM public.banco_preguntas WHERE enunciado = 'What is the capital of England?');

INSERT INTO public.banco_preguntas (enunciado, tipo, nivel, habilidad, puntos, explicacion) 
SELECT 'Choose the correct form: "I _____ to school every day."', 'multiple_choice', 'A1', 'use_of_english', 1, 'The present simple tense uses the base form of the verb.'
WHERE NOT EXISTS (SELECT 1 FROM public.banco_preguntas WHERE enunciado = 'Choose the correct form: "I _____ to school every day."');

INSERT INTO public.banco_preguntas (enunciado, tipo, nivel, habilidad, puntos, explicacion) 
SELECT 'Complete: "The weather is _____ today."', 'fill_blank', 'A2', 'use_of_english', 1, 'Adjectives describe the weather conditions.'
WHERE NOT EXISTS (SELECT 1 FROM public.banco_preguntas WHERE enunciado = 'Complete: "The weather is _____ today."');

-- 4. CREAR ÍNDICES PARA RENDIMIENTO
-- ========================================

-- Índices para medios
CREATE INDEX IF NOT EXISTS idx_medios_tipo ON public.medios(tipo);
CREATE INDEX IF NOT EXISTS idx_medios_created_at ON public.medios(created_at);

-- Índices para banco_preguntas
CREATE INDEX IF NOT EXISTS idx_banco_preguntas_nivel ON public.banco_preguntas(nivel);
CREATE INDEX IF NOT EXISTS idx_banco_preguntas_habilidad ON public.banco_preguntas(habilidad);
CREATE INDEX IF NOT EXISTS idx_banco_preguntas_tipo ON public.banco_preguntas(tipo);

-- Índices para logros
CREATE INDEX IF NOT EXISTS idx_logros_categoria ON public.logros(categoria);
CREATE INDEX IF NOT EXISTS idx_logros_puntos_xp ON public.logros(puntos_xp);

-- Índices para relaciones
CREATE INDEX IF NOT EXISTS idx_logros_usuario_user_id ON public.logros_usuario(user_id);
CREATE INDEX IF NOT EXISTS idx_logros_usuario_logro_id ON public.logros_usuario(logro_id);
CREATE INDEX IF NOT EXISTS idx_xp_usuario_user_id ON public.xp_usuario(user_id);
CREATE INDEX IF NOT EXISTS idx_preguntas_medios_pregunta_id ON public.preguntas_medios(pregunta_id);
CREATE INDEX IF NOT EXISTS idx_preguntas_medios_medio_id ON public.preguntas_medios(medio_id);

-- 5. HABILITAR RLS
-- ========================================

ALTER TABLE public.medios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banco_preguntas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logros ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logros_usuario ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xp_usuario ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.preguntas_medios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banco_preguntas_opciones ENABLE ROW LEVEL SECURITY;

-- 6. CREAR POLÍTICAS RLS
-- ========================================

-- Políticas para medios (lectura pública, escritura solo para admins)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'medios' AND policyname = 'medios_select_policy') THEN
        CREATE POLICY medios_select_policy ON public.medios FOR SELECT USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'medios' AND policyname = 'medios_insert_policy') THEN
        CREATE POLICY medios_insert_policy ON public.medios FOR INSERT WITH CHECK (
            EXISTS (SELECT 1 FROM public.user_profiles WHERE user_id = auth.uid() AND rol = 'admin')
        );
    END IF;
END $$;

-- Políticas para banco_preguntas (lectura pública, escritura solo para admins/teachers)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'banco_preguntas' AND policyname = 'banco_preguntas_select_policy') THEN
        CREATE POLICY banco_preguntas_select_policy ON public.banco_preguntas FOR SELECT USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'banco_preguntas' AND policyname = 'banco_preguntas_insert_policy') THEN
        CREATE POLICY banco_preguntas_insert_policy ON public.banco_preguntas FOR INSERT WITH CHECK (
            EXISTS (SELECT 1 FROM public.user_profiles WHERE user_id = auth.uid() AND rol IN ('admin', 'teacher'))
        );
    END IF;
END $$;

-- Políticas para logros (lectura pública, escritura solo para admins)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'logros' AND policyname = 'logros_select_policy') THEN
        CREATE POLICY logros_select_policy ON public.logros FOR SELECT USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'logros' AND policyname = 'logros_insert_policy') THEN
        CREATE POLICY logros_insert_policy ON public.logros FOR INSERT WITH CHECK (
            EXISTS (SELECT 1 FROM public.user_profiles WHERE user_id = auth.uid() AND rol = 'admin')
        );
    END IF;
END $$;

-- Políticas para logros_usuario (solo el usuario puede ver sus propios logros)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'logros_usuario' AND policyname = 'logros_usuario_select_policy') THEN
        CREATE POLICY logros_usuario_select_policy ON public.logros_usuario FOR SELECT USING (user_id = auth.uid());
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'logros_usuario' AND policyname = 'logros_usuario_insert_policy') THEN
        CREATE POLICY logros_usuario_insert_policy ON public.logros_usuario FOR INSERT WITH CHECK (user_id = auth.uid());
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'logros_usuario' AND policyname = 'logros_usuario_update_policy') THEN
        CREATE POLICY logros_usuario_update_policy ON public.logros_usuario FOR UPDATE USING (user_id = auth.uid());
    END IF;
END $$;

-- Políticas para xp_usuario (solo el usuario puede ver/modificar su XP)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'xp_usuario' AND policyname = 'xp_usuario_select_policy') THEN
        CREATE POLICY xp_usuario_select_policy ON public.xp_usuario FOR SELECT USING (user_id = auth.uid());
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'xp_usuario' AND policyname = 'xp_usuario_insert_policy') THEN
        CREATE POLICY xp_usuario_insert_policy ON public.xp_usuario FOR INSERT WITH CHECK (user_id = auth.uid());
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'xp_usuario' AND policyname = 'xp_usuario_update_policy') THEN
        CREATE POLICY xp_usuario_update_policy ON public.xp_usuario FOR UPDATE USING (user_id = auth.uid());
    END IF;
END $$;

-- 7. CREAR FUNCIONES Y TRIGGERS
-- ========================================

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_medios_updated_at') THEN
        CREATE TRIGGER update_medios_updated_at BEFORE UPDATE ON public.medios FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_banco_preguntas_updated_at') THEN
        CREATE TRIGGER update_banco_preguntas_updated_at BEFORE UPDATE ON public.banco_preguntas FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_logros_updated_at') THEN
        CREATE TRIGGER update_logros_updated_at BEFORE UPDATE ON public.logros FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_xp_usuario_updated_at') THEN
        CREATE TRIGGER update_xp_usuario_updated_at BEFORE UPDATE ON public.xp_usuario FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
END $$;

-- 8. COMENTARIOS EN TABLAS
-- ========================================

COMMENT ON TABLE public.medios IS 'Archivos multimedia utilizados en ejercicios y teoría';
COMMENT ON TABLE public.banco_preguntas IS 'Preguntas reutilizables para generar ejercicios';
COMMENT ON TABLE public.logros IS 'Sistema de logros y achievements para gamificación';
COMMENT ON TABLE public.logros_usuario IS 'Logros obtenidos por cada usuario';
COMMENT ON TABLE public.xp_usuario IS 'Puntos de experiencia y progreso por habilidad';
COMMENT ON TABLE public.preguntas_medios IS 'Relación entre preguntas y archivos multimedia';
COMMENT ON TABLE public.banco_preguntas_opciones IS 'Opciones de respuesta para preguntas del banco';

-- ========================================
-- SCRIPT COMPLETADO
-- ========================================

-- Mensaje de confirmación
DO $$
BEGIN
    RAISE NOTICE '✅ Script ejecutado exitosamente!';
    RAISE NOTICE '📊 Tablas creadas: medios, banco_preguntas, logros, logros_usuario, xp_usuario, preguntas_medios, banco_preguntas_opciones';
    RAISE NOTICE '🔒 RLS habilitado y políticas creadas';
    RAISE NOTICE '⚡ Índices creados para rendimiento';
    RAISE NOTICE '🎯 Datos iniciales insertados';
    RAISE NOTICE '🚀 Sistema de gamificación listo!';
END $$;
