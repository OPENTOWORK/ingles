-- =====================================================
-- SCRIPT CORREGIDO PARA AGREGAR SOLO LAS TABLAS PRINCIPALES
-- Sin errores de índices en columnas inexistentes
-- =====================================================

-- =====================================================
-- 1. CREAR TABLA MEDIOS (Archivos multimedia)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.medios (
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

-- =====================================================
-- 2. CREAR TABLA BANCO_PREGUNTAS (Base de preguntas reutilizables)
-- =====================================================

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
    referencias JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 3. CREAR TABLA LOGROS (Sistema de gamificación)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.logros (
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

-- =====================================================
-- 4. CREAR TABLA LOGROS_USUARIO (Relación usuario-logro)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.logros_usuario (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    logro_id UUID REFERENCES public.logros(id) ON DELETE CASCADE,
    fecha_obtencion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    progreso_actual DECIMAL(5,2) DEFAULT 0,
    is_completado BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, logro_id)
);

-- =====================================================
-- 5. CREAR TABLA XP_USUARIO (Sistema de puntos)
-- =====================================================

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

-- =====================================================
-- 6. CREAR TABLA ETIQUETAS (Sistema de etiquetas)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.etiquetas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre TEXT UNIQUE NOT NULL,
    descripcion TEXT,
    categoria TEXT,
    color TEXT DEFAULT '#3B82F6',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 7. CREAR TABLA ETIQUETAS_CONTENIDO (Tabla puente)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.etiquetas_contenido (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    etiqueta_id UUID REFERENCES public.etiquetas(id) ON DELETE CASCADE,
    contenido_tipo TEXT NOT NULL,
    contenido_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(etiqueta_id, contenido_tipo, contenido_id)
);

-- =====================================================
-- 8. CREAR ÍNDICES DESPUÉS DE CREAR LAS TABLAS
-- =====================================================

-- Índices para medios
CREATE INDEX IF NOT EXISTS idx_medios_tipo ON public.medios(tipo);
CREATE INDEX IF NOT EXISTS idx_medios_activo ON public.medios(is_active);

-- Índices para banco_preguntas
CREATE INDEX IF NOT EXISTS idx_banco_preguntas_habilidad ON public.banco_preguntas(habilidad);
CREATE INDEX IF NOT EXISTS idx_banco_preguntas_nivel ON public.banco_preguntas(nivel);
CREATE INDEX IF NOT EXISTS idx_banco_preguntas_tipo ON public.banco_preguntas(tipo_pregunta);
CREATE INDEX IF NOT EXISTS idx_banco_preguntas_activo ON public.banco_preguntas(is_active);

-- Índices para logros
CREATE INDEX IF NOT EXISTS idx_logros_categoria ON public.logros(categoria);
CREATE INDEX IF NOT EXISTS idx_logros_activo ON public.logros(is_active);
CREATE INDEX IF NOT EXISTS idx_logros_orden ON public.logros(orden);

-- Índices para logros_usuario
CREATE INDEX IF NOT EXISTS idx_logros_usuario_user ON public.logros_usuario(user_id);
CREATE INDEX IF NOT EXISTS idx_logros_usuario_completado ON public.logros_usuario(is_completado);

-- Índices para xp_usuario
CREATE INDEX IF NOT EXISTS idx_xp_usuario_total ON public.xp_usuario(xp_total);
CREATE INDEX IF NOT EXISTS idx_xp_usuario_nivel ON public.xp_usuario(nivel_actual);

-- Índices para etiquetas
CREATE INDEX IF NOT EXISTS idx_etiquetas_categoria ON public.etiquetas(categoria);
CREATE INDEX IF NOT EXISTS idx_etiquetas_activo ON public.etiquetas(is_active);

-- Índices para etiquetas_contenido
CREATE INDEX IF NOT EXISTS idx_etiquetas_contenido_tipo ON public.etiquetas_contenido(contenido_tipo);
CREATE INDEX IF NOT EXISTS idx_etiquetas_contenido_id ON public.etiquetas_contenido(contenido_id);

-- =====================================================
-- 9. HABILITAR RLS EN TODAS LAS TABLAS NUEVAS
-- =====================================================

ALTER TABLE public.medios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banco_preguntas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logros ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logros_usuario ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xp_usuario ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.etiquetas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.etiquetas_contenido ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 10. CREAR POLÍTICAS RLS BÁSICAS
-- =====================================================

-- Políticas para medios
CREATE POLICY "Everyone can view active media" ON public.medios
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage all media" ON public.medios
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Políticas para banco_preguntas
CREATE POLICY "Everyone can view active questions" ON public.banco_preguntas
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage all questions" ON public.banco_preguntas
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Políticas para logros
CREATE POLICY "Everyone can view active achievements" ON public.logros
    FOR SELECT USING (is_active = true);

-- Políticas para logros_usuario
CREATE POLICY "Users can view their own achievements" ON public.logros_usuario
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own achievements" ON public.logros_usuario
    FOR ALL USING (auth.uid() = user_id);

-- Políticas para xp_usuario
CREATE POLICY "Users can view their own XP" ON public.xp_usuario
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own XP" ON public.xp_usuario
    FOR ALL USING (auth.uid() = user_id);

-- Políticas para etiquetas
CREATE POLICY "Everyone can view active tags" ON public.etiquetas
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage all tags" ON public.etiquetas
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Políticas para etiquetas_contenido
CREATE POLICY "Everyone can view content tags" ON public.etiquetas_contenido
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage all content tags" ON public.etiquetas_contenido
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- =====================================================
-- 11. INSERTAR DATOS INICIALES
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
-- 12. CREAR FUNCIÓN PARA ACTUALIZAR TIMESTAMPS
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- =====================================================
-- 13. CREAR TRIGGERS PARA TIMESTAMPS AUTOMÁTICOS
-- =====================================================

CREATE TRIGGER update_medios_updated_at 
    BEFORE UPDATE ON public.medios 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_banco_preguntas_updated_at 
    BEFORE UPDATE ON public.banco_preguntas 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_xp_usuario_updated_at 
    BEFORE UPDATE ON public.xp_usuario 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 14. VERIFICACIÓN FINAL
-- =====================================================

SELECT '=== VERIFICACIÓN DE TABLAS CREADAS ===' as resultado;

SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'medios'
        ) THEN '✅ medios creada'
        ELSE '❌ medios NO creada'
    END as "Estado"
UNION ALL
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'banco_preguntas'
        ) THEN '✅ banco_preguntas creada'
        ELSE '❌ banco_preguntas NO creada'
    END as "Estado"
UNION ALL
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'logros'
        ) THEN '✅ logros creada'
        ELSE '❌ logros NO creada'
    END as "Estado"
UNION ALL
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'etiquetas'
        ) THEN '✅ etiquetas creada'
        ELSE '❌ etiquetas NO creada'
    END as "Estado";

-- Contar registros insertados
SELECT '=== DATOS INICIALES INSERTADOS ===' as resultado;
SELECT 'Etiquetas:' as tipo, COUNT(*) as total FROM public.etiquetas
UNION ALL
SELECT 'Logros:' as tipo, COUNT(*) as total FROM public.logros;

SELECT '=== SCRIPT COMPLETADO ===' as resultado;
