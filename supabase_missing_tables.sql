-- =====================================================
-- SCRIPT PARA AGREGAR TABLAS FALTANTES A SUPABASE
-- Solo agrega lo que falta, no modifica lo existente
-- =====================================================

-- =====================================================
-- 3. SISTEMA DE TEORÍA
-- =====================================================

-- 3.1 Temas-Teoría (Páginas de explicación)
CREATE TABLE IF NOT EXISTS public.temas_teoria (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    titulo TEXT NOT NULL,
    resumen TEXT,
    cuerpo_contenido TEXT NOT NULL,
    referencias_examen JSONB DEFAULT '[]'::jsonb, -- A qué examen/parte se refiere
    habilidad TEXT CHECK (habilidad IN ('reading', 'writing', 'listening', 'speaking', 'use_of_english', 'grammar', 'vocabulary')),
    nivel TEXT CHECK (nivel IN ('A1', 'A2', 'B1', 'B2', 'C1', 'C2')),
    orden INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3.2 Ejemplos-Teoría (Frases o mini-casos que ilustran)
CREATE TABLE IF NOT EXISTS public.ejemplos_teoria (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tema_teoria_id UUID REFERENCES public.temas_teoria(id) ON DELETE CASCADE,
    frase_o_caso TEXT NOT NULL,
    explicacion TEXT,
    tipo_ejemplo TEXT DEFAULT 'ejemplo' CHECK (tipo_ejemplo IN ('ejemplo', 'caso_practico', 'nota_importante')),
    orden INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3.3 Ejercicios-Teoría (Enlaza tema con ejercicios y su orden)
CREATE TABLE IF NOT EXISTS public.teoria_ejercicios (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tema_teoria_id UUID REFERENCES public.temas_teoria(id) ON DELETE CASCADE,
    ejercicio_id UUID REFERENCES public.ejercicios(id) ON DELETE CASCADE,
    orden INTEGER DEFAULT 0,
    notas TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(tema_teoria_id, ejercicio_id)
);

-- =====================================================
-- 4. SISTEMA DE EXÁMENES CAMBRIDGE
-- =====================================================

-- 4.1 Examen (Define el tipo: First/B2, Advanced/C1, etc.)
CREATE TABLE IF NOT EXISTS public.examenes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre TEXT NOT NULL, -- "B2 First", "C1 Advanced"
    nivel TEXT NOT NULL CHECK (nivel IN ('A2', 'B1', 'B2', 'C1', 'C2')),
    descripcion_general TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4.2 Tipo-Examen (Full exam, Use of English, Writing, etc.)
CREATE TABLE IF NOT EXISTS public.tipos_examen (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    examen_id UUID REFERENCES public.examenes(id) ON DELETE CASCADE,
    tipo TEXT NOT NULL, -- "full", "use_of_english", "writing", "listening", "reading"
    nombre TEXT NOT NULL, -- "Full Exam", "Use of English", "Writing Paper"
    descripcion TEXT,
    duracion_minutos INTEGER DEFAULT 0,
    orden INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE
);

-- 4.3 Modelos-Examen (Versión concreta: "B2 First - June 2023 - Paper 1")
CREATE TABLE IF NOT EXISTS public.modelos_examen (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tipo_examen_id UUID REFERENCES public.tipos_examen(id) ON DELETE CASCADE,
    nombre TEXT NOT NULL, -- "B2 First - June 2023 - Paper 1"
    version TEXT, -- "2023-06"
    duracion_total_minutos INTEGER,
    fecha_disponible DATE,
    is_published BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4.4 Secciones-Examen (Reading Part 1, Use of English Part 3, etc.)
CREATE TABLE IF NOT EXISTS public.secciones_examen (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    modelo_examen_id UUID REFERENCES public.modelos_examen(id) ON DELETE CASCADE,
    nombre TEXT NOT NULL, -- "Reading Part 1", "Use of English Part 3"
    instrucciones TEXT,
    puntuacion_maxima INTEGER DEFAULT 0,
    tiempo_sugerido_minutos INTEGER DEFAULT 0,
    orden INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE
);

-- 4.5 Tareas-Examen (Cada sección apunta a ejercicios de la biblioteca)
CREATE TABLE IF NOT EXISTS public.tareas_examen (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    seccion_examen_id UUID REFERENCES public.secciones_examen(id) ON DELETE CASCADE,
    ejercicio_id UUID REFERENCES public.ejercicios(id) ON DELETE CASCADE,
    orden INTEGER DEFAULT 0,
    notas_especificas TEXT,
    puntuacion_peso DECIMAL(3,2) DEFAULT 1.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4.6 Rubricas-Examen (Descriptores para Writing/Speaking)
CREATE TABLE IF NOT EXISTS public.rubricas_examen (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    seccion_examen_id UUID REFERENCES public.secciones_examen(id) ON DELETE CASCADE,
    nombre_criterio TEXT NOT NULL, -- "Content", "Communicative Achievement", etc.
    descripcion TEXT,
    puntuacion_maxima INTEGER DEFAULT 0,
    orden INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4.7 Intentos-Examen (Cuando usuario hace simulacro)
CREATE TABLE IF NOT EXISTS public.intentos_examen (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    modelo_examen_id UUID REFERENCES public.modelos_examen(id) ON DELETE CASCADE,
    fecha_inicio TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    fecha_fin TIMESTAMP WITH TIME ZONE,
    tiempo_total_minutos INTEGER DEFAULT 0,
    puntuacion_total INTEGER DEFAULT 0,
    puntuacion_maxima INTEGER DEFAULT 0,
    porcentaje DECIMAL(5,2) DEFAULT 0.00,
    estado TEXT DEFAULT 'en_progreso' CHECK (estado IN ('en_progreso', 'completado', 'abandonado', 'corregido')),
    notas_corrector TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4.8 Respuestas-Examen (Lo que contestó el usuario)
CREATE TABLE IF NOT EXISTS public.respuestas_examen (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    intento_examen_id UUID REFERENCES public.intentos_examen(id) ON DELETE CASCADE,
    pregunta_id UUID REFERENCES public.preguntas(id) ON DELETE CASCADE,
    respuesta_usuario TEXT,
    es_correcta BOOLEAN,
    puntuacion_obtenida DECIMAL(5,2) DEFAULT 0,
    tiempo_respuesta_segundos INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4.9 Puntuaciones-Rubrica (Para Writing/Speaking)
CREATE TABLE IF NOT EXISTS public.puntuaciones_rubrica (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    intento_examen_id UUID REFERENCES public.intentos_examen(id) ON DELETE CASCADE,
    rubrica_examen_id UUID REFERENCES public.rubricas_examen(id) ON DELETE CASCADE,
    puntuacion_obtenida INTEGER DEFAULT 0,
    puntuacion_maxima INTEGER DEFAULT 0,
    notas_corrector TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 5. SISTEMA DE PRUEBA DE NIVEL
-- =====================================================

-- 5.1 Pruebas-Nivel (Define prueba activa)
CREATE TABLE IF NOT EXISTS public.pruebas_nivel (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre TEXT NOT NULL,
    tipo TEXT DEFAULT 'fija' CHECK (tipo IN ('adaptativa', 'fija')),
    notas TEXT, -- Notas sobre si es adaptativa o fija
    nivel_inicial TEXT CHECK (nivel_inicial IN ('A1', 'A2', 'B1', 'B2', 'C1', 'C2')),
    nivel_final TEXT CHECK (nivel_final IN ('A1', 'A2', 'B1', 'B2', 'C1', 'C2')),
    tiempo_estimado_minutos INTEGER DEFAULT 30,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5.2 Preguntas-Prueba-Nivel (Lista y orden de preguntas)
CREATE TABLE IF NOT EXISTS public.preguntas_pruebas_nivel (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    prueba_nivel_id UUID REFERENCES public.pruebas_nivel(id) ON DELETE CASCADE,
    pregunta_id UUID REFERENCES public.preguntas(id) ON DELETE CASCADE,
    orden INTEGER DEFAULT 0,
    peso_puntuacion DECIMAL(3,2) DEFAULT 1.0,
    nivel_dificultad TEXT CHECK (nivel_dificultad IN ('A1', 'A2', 'B1', 'B2', 'C1', 'C2')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(prueba_nivel_id, pregunta_id)
);

-- 5.3 Sesiones-Nivel (Cada intento del usuario)
CREATE TABLE IF NOT EXISTS public.sesiones_nivel (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    prueba_nivel_id UUID REFERENCES public.pruebas_nivel(id) ON DELETE CASCADE,
    fecha_inicio TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    fecha_fin TIMESTAMP WITH TIME ZONE,
    tiempo_total_minutos INTEGER DEFAULT 0,
    nivel_sugerido TEXT CHECK (nivel_sugerido IN ('A1', 'A2', 'B1', 'B2', 'C1', 'C2')),
    grado_confianza DECIMAL(3,2) DEFAULT 0.00, -- Grado de confianza en el resultado
    puntuacion_total DECIMAL(5,2) DEFAULT 0,
    estado TEXT DEFAULT 'en_progreso' CHECK (estado IN ('en_progreso', 'completada', 'abandonada')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5.4 Respuestas-Prueba-Nivel (Respuestas con aciertos y tiempo)
CREATE TABLE IF NOT EXISTS public.respuestas_prueba_nivel (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sesion_nivel_id UUID REFERENCES public.sesiones_nivel(id) ON DELETE CASCADE,
    pregunta_id UUID REFERENCES public.preguntas(id) ON DELETE CASCADE,
    respuesta_usuario TEXT,
    es_correcta BOOLEAN,
    tiempo_respuesta_segundos INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5.5 Recomendaciones-Nivel (Qué curso/unidad/lecciones recomendar)
CREATE TABLE IF NOT EXISTS public.recomendaciones_nivel (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sesion_nivel_id UUID REFERENCES public.sesiones_nivel(id) ON DELETE CASCADE,
    curso_recomendado TEXT, -- "A2", "B1", etc.
    unidad_recomendada TEXT,
    lecciones_recomendadas TEXT[],
    notas_para_usuario TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 6. SISTEMA DE TRAINING (CURSOS → UNIDADES → LECCIONES)
-- =====================================================

-- 6.1 Cursos (A1, A2, B1, B2, C1, C2)
CREATE TABLE IF NOT EXISTS public.cursos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nivel TEXT UNIQUE NOT NULL CHECK (nivel IN ('A1', 'A2', 'B1', 'B2', 'C1', 'C2')),
    nombre TEXT NOT NULL, -- "A1 Beginner", "B2 Upper-Intermediate"
    descripcion TEXT,
    enfoque TEXT, -- Describe el enfoque
    nivel_partida TEXT, -- Nivel de partida
    duracion_estimada_horas INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    orden INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6.2 Unidades (Use of English, Listening, Reading, Writing, etc.)
CREATE TABLE IF NOT EXISTS public.unidades (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    curso_id UUID REFERENCES public.cursos(id) ON DELETE CASCADE,
    nombre TEXT NOT NULL, -- "Use of English", "Listening", "Reading", "Writing", "All Together", "Retos"
    descripcion TEXT,
    tipo TEXT CHECK (tipo IN ('use_of_english', 'listening', 'reading', 'writing', 'speaking', 'all_together', 'retos')),
    orden INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6.3 Dificultades (básico, intermedio, avanzado)
CREATE TABLE IF NOT EXISTS public.dificultades (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre TEXT UNIQUE NOT NULL CHECK (nombre IN ('básico', 'intermedio', 'avanzado')),
    descripcion TEXT,
    nivel_numerico INTEGER DEFAULT 1, -- 1, 2, 3
    orden INTEGER DEFAULT 0
);

-- 6.4 Niveles de Entrenamiento (nivel 1, nivel 2...)
CREATE TABLE IF NOT EXISTS public.niveles_entrenamiento (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre TEXT NOT NULL, -- "Nivel 1", "Nivel 2"
    numero_nivel INTEGER NOT NULL,
    descripcion TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    orden INTEGER DEFAULT 0
);

-- Lecciones dentro de unidades
CREATE TABLE IF NOT EXISTS public.lecciones (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    unidad_id UUID REFERENCES public.unidades(id) ON DELETE CASCADE,
    dificultad_id UUID REFERENCES public.dificultades(id) ON DELETE CASCADE,
    nivel_entrenamiento_id UUID REFERENCES public.niveles_entrenamiento(id) ON DELETE CASCADE,
    titulo TEXT NOT NULL,
    descripcion TEXT,
    explicacion TEXT,
    puntuacion_maxima INTEGER DEFAULT 100,
    tiempo_estimado_minutos INTEGER DEFAULT 30,
    orden INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6.5 Ejercicios-En-Nivel (Orden de ejercicios que componen lección)
CREATE TABLE IF NOT EXISTS public.ejercicios_en_nivel (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    leccion_id UUID REFERENCES public.lecciones(id) ON DELETE CASCADE,
    ejercicio_id UUID REFERENCES public.ejercicios(id) ON DELETE CASCADE,
    orden INTEGER DEFAULT 0,
    peso_puntuacion DECIMAL(3,2) DEFAULT 1.0,
    notas TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(leccion_id, ejercicio_id)
);

-- 6.6 Progreso-Lección-Usuario (Estado del usuario en cada lección)
CREATE TABLE IF NOT EXISTS public.progreso_leccion_usuario (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    leccion_id UUID REFERENCES public.lecciones(id) ON DELETE CASCADE,
    estado TEXT DEFAULT 'no_empezada' CHECK (estado IN ('no_empezada', 'en_curso', 'completada')),
    mejor_puntuacion INTEGER DEFAULT 0,
    estrellas INTEGER DEFAULT 0 CHECK (estrellas BETWEEN 0 AND 5),
    xp_obtenido INTEGER DEFAULT 0,
    ultimo_intento TIMESTAMP WITH TIME ZONE,
    intentos_totales INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, leccion_id)
);

-- 6.7 Intentos-Entrenamiento (Cada vez que ejecuta ejercicio)
CREATE TABLE IF NOT EXISTS public.intentos_entrenamiento (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    leccion_id UUID REFERENCES public.lecciones(id) ON DELETE CASCADE,
    ejercicio_id UUID REFERENCES public.ejercicios(id) ON DELETE CASCADE,
    fecha_inicio TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    fecha_fin TIMESTAMP WITH TIME ZONE,
    puntuacion INTEGER DEFAULT 0,
    tiempo_total_segundos INTEGER DEFAULT 0,
    aprobo BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6.8 Respuestas-Entrenamiento (Respuestas pregunta a pregunta)
CREATE TABLE IF NOT EXISTS public.respuestas_entrenamiento (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    intento_entrenamiento_id UUID REFERENCES public.intentos_entrenamiento(id) ON DELETE CASCADE,
    pregunta_id UUID REFERENCES public.preguntas(id) ON DELETE CASCADE,
    respuesta_usuario TEXT,
    es_correcta BOOLEAN,
    tiempo_respuesta_segundos INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ÍNDICES PARA RENDIMIENTO
-- =====================================================

-- Índices para sistema de teoría
CREATE INDEX IF NOT EXISTS idx_temas_teoria_nivel ON public.temas_teoria(nivel);
CREATE INDEX IF NOT EXISTS idx_temas_teoria_habilidad ON public.temas_teoria(habilidad);
CREATE INDEX IF NOT EXISTS idx_temas_teoria_activo ON public.temas_teoria(is_active);
CREATE INDEX IF NOT EXISTS idx_ejemplos_teoria_tema ON public.ejemplos_teoria(tema_teoria_id);

-- Índices para sistema de exámenes
CREATE INDEX IF NOT EXISTS idx_examenes_nivel ON public.examenes(nivel);
CREATE INDEX IF NOT EXISTS idx_modelos_examen_tipo ON public.modelos_examen(tipo_examen_id);
CREATE INDEX IF NOT EXISTS idx_intentos_examen_user ON public.intentos_examen(user_id);
CREATE INDEX IF NOT EXISTS idx_intentos_examen_modelo ON public.intentos_examen(modelo_examen_id);
CREATE INDEX IF NOT EXISTS idx_respuestas_examen_intento ON public.respuestas_examen(intento_examen_id);

-- Índices para sistema de prueba de nivel
CREATE INDEX IF NOT EXISTS idx_pruebas_nivel_tipo ON public.pruebas_nivel(tipo);
CREATE INDEX IF NOT EXISTS idx_sesiones_nivel_user ON public.sesiones_nivel(user_id);
CREATE INDEX IF NOT EXISTS idx_respuestas_prueba_sesion ON public.respuestas_prueba_nivel(sesion_nivel_id);

-- Índices para sistema de training
CREATE INDEX IF NOT EXISTS idx_cursos_nivel ON public.cursos(nivel);
CREATE INDEX IF NOT EXISTS idx_unidades_curso ON public.unidades(curso_id);
CREATE INDEX IF NOT EXISTS idx_lecciones_unidad ON public.lecciones(unidad_id);
CREATE INDEX IF NOT EXISTS idx_progreso_leccion_user ON public.progreso_leccion_usuario(user_id);
CREATE INDEX IF NOT EXISTS idx_intentos_entrenamiento_user ON public.intentos_entrenamiento(user_id);

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

-- Triggers para updated_at (solo si no existen)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_temas_teoria_updated_at') THEN
        CREATE TRIGGER update_temas_teoria_updated_at 
            BEFORE UPDATE ON public.temas_teoria 
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_progreso_leccion_updated_at') THEN
        CREATE TRIGGER update_progreso_leccion_updated_at 
            BEFORE UPDATE ON public.progreso_leccion_usuario 
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- =====================================================
-- POLÍTICAS RLS (ROW LEVEL SECURITY)
-- =====================================================

-- Habilitar RLS en todas las tablas nuevas
ALTER TABLE public.temas_teoria ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ejemplos_teoria ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teoria_ejercicios ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.examenes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.intentos_examen ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.respuestas_examen ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.pruebas_nivel ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sesiones_nivel ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.respuestas_prueba_nivel ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.cursos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.unidades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lecciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progreso_leccion_usuario ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.intentos_entrenamiento ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.respuestas_entrenamiento ENABLE ROW LEVEL SECURITY;

-- Políticas básicas (solo si no existen)
DO $$
BEGIN
    -- Políticas para contenido público
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'temas_teoria' AND policyname = 'Everyone can view active theory topics') THEN
        CREATE POLICY "Everyone can view active theory topics" ON public.temas_teoria
            FOR SELECT USING (is_active = true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'cursos' AND policyname = 'Everyone can view active courses') THEN
        CREATE POLICY "Everyone can view active courses" ON public.cursos
            FOR SELECT USING (is_active = true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'lecciones' AND policyname = 'Everyone can view active lessons') THEN
        CREATE POLICY "Everyone can view active lessons" ON public.lecciones
            FOR SELECT USING (is_active = true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'examenes' AND policyname = 'Everyone can view active exams') THEN
        CREATE POLICY "Everyone can view active exams" ON public.examenes
            FOR SELECT USING (is_active = true);
    END IF;

    -- Políticas para progreso de usuario
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'progreso_leccion_usuario' AND policyname = 'Users can view their own progress') THEN
        CREATE POLICY "Users can view their own progress" ON public.progreso_leccion_usuario
            FOR SELECT USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'progreso_leccion_usuario' AND policyname = 'Users can update their own progress') THEN
        CREATE POLICY "Users can update their own progress" ON public.progreso_leccion_usuario
            FOR ALL USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'intentos_examen' AND policyname = 'Users can view their own exam attempts') THEN
        CREATE POLICY "Users can view their own exam attempts" ON public.intentos_examen
            FOR SELECT USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'intentos_examen' AND policyname = 'Users can create their own exam attempts') THEN
        CREATE POLICY "Users can create their own exam attempts" ON public.intentos_examen
            FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;

    -- Políticas para administradores
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'temas_teoria' AND policyname = 'Admins can manage all content') THEN
        CREATE POLICY "Admins can manage all content" ON public.temas_teoria
            FOR ALL USING (
                EXISTS (
                    SELECT 1 FROM public.user_profiles 
                    WHERE id = auth.uid() AND role = 'admin'
                )
            );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'cursos' AND policyname = 'Admins can manage all courses') THEN
        CREATE POLICY "Admins can manage all courses" ON public.cursos
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

-- Insertar dificultades
INSERT INTO public.dificultades (nombre, descripcion, nivel_numerico, orden) VALUES
('básico', 'Nivel básico de dificultad', 1, 1),
('intermedio', 'Nivel intermedio de dificultad', 2, 2),
('avanzado', 'Nivel avanzado de dificultad', 3, 3)
ON CONFLICT (nombre) DO NOTHING;

-- Insertar niveles de entrenamiento
INSERT INTO public.niveles_entrenamiento (nombre, numero_nivel, descripcion, orden) VALUES
('Nivel 1', 1, 'Primer nivel de entrenamiento', 1),
('Nivel 2', 2, 'Segundo nivel de entrenamiento', 2),
('Nivel 3', 3, 'Tercer nivel de entrenamiento', 3),
('Nivel 4', 4, 'Cuarto nivel de entrenamiento', 4),
('Nivel 5', 5, 'Quinto nivel de entrenamiento', 5)
ON CONFLICT DO NOTHING;

-- Insertar cursos
INSERT INTO public.cursos (nivel, nombre, descripcion, enfoque, nivel_partida, duracion_estimada_horas, orden) VALUES
('A1', 'A1 Beginner', 'Curso de inglés nivel A1', 'Fundamentos básicos del inglés', 'Principiante', 80, 1),
('A2', 'A2 Elementary', 'Curso de inglés nivel A2', 'Desarrollo de habilidades básicas', 'A1', 100, 2),
('B1', 'B1 Intermediate', 'Curso de inglés nivel B1', 'Consolidación de conocimientos intermedios', 'A2', 120, 3),
('B2', 'B2 Upper-Intermediate', 'Curso de inglés nivel B2', 'Preparación para exámenes avanzados', 'B1', 140, 4),
('C1', 'C1 Advanced', 'Curso de inglés nivel C1', 'Dominio avanzado del idioma', 'B2', 160, 5),
('C2', 'C2 Proficiency', 'Curso de inglés nivel C2', 'Dominio nativo del idioma', 'C1', 180, 6)
ON CONFLICT (nivel) DO NOTHING;

-- Insertar unidades para cada curso
INSERT INTO public.unidades (curso_id, nombre, descripcion, tipo, orden) 
SELECT 
    c.id,
    unidad.nombre,
    unidad.descripcion,
    unidad.tipo,
    unidad.orden
FROM public.cursos c
CROSS JOIN (VALUES
    ('Use of English', 'Gramática y uso del inglés', 'use_of_english', 1),
    ('Reading', 'Comprensión lectora', 'reading', 2),
    ('Listening', 'Comprensión auditiva', 'listening', 3),
    ('Writing', 'Expresión escrita', 'writing', 4),
    ('Speaking', 'Expresión oral', 'speaking', 5),
    ('All Together', 'Todas las habilidades', 'all_together', 6),
    ('Retos', 'Ejercicios desafiantes', 'retos', 7)
) AS unidad(nombre, descripcion, tipo, orden)
ON CONFLICT DO NOTHING;

-- Insertar exámenes Cambridge
INSERT INTO public.examenes (nombre, nivel, descripcion_general) VALUES
('A2 Key', 'A2', 'Examen Cambridge A2 Key (KET) - Certifica nivel básico de inglés'),
('B1 Preliminary', 'B1', 'Examen Cambridge B1 Preliminary (PET) - Certifica nivel intermedio'),
('B2 First', 'B2', 'Examen Cambridge B2 First (FCE) - Certifica nivel intermedio-alto'),
('C1 Advanced', 'C1', 'Examen Cambridge C1 Advanced (CAE) - Certifica nivel avanzado'),
('C2 Proficiency', 'C2', 'Examen Cambridge C2 Proficiency (CPE) - Certifica nivel experto')
ON CONFLICT DO NOTHING;

-- Insertar tipos de examen para cada examen
INSERT INTO public.tipos_examen (examen_id, tipo, nombre, descripcion, duracion_minutos, orden)
SELECT 
    e.id,
    tipo_examen.tipo,
    tipo_examen.nombre,
    tipo_examen.descripcion,
    tipo_examen.duracion_minutos,
    tipo_examen.orden
FROM public.examenes e
CROSS JOIN (VALUES
    ('full', 'Full Exam', 'Examen completo', 0, 1),
    ('use_of_english', 'Use of English', 'Gramática y vocabulario', 0, 2),
    ('reading', 'Reading', 'Comprensión lectora', 0, 3),
    ('writing', 'Writing', 'Expresión escrita', 0, 4),
    ('listening', 'Listening', 'Comprensión auditiva', 0, 5),
    ('speaking', 'Speaking', 'Expresión oral', 0, 6)
) AS tipo_examen(tipo, nombre, descripcion, duracion_minutos, orden)
ON CONFLICT DO NOTHING;

-- =====================================================
-- COMENTARIOS Y DOCUMENTACIÓN
-- =====================================================

COMMENT ON TABLE public.temas_teoria IS 'Temas de teoría con explicaciones y ejemplos';
COMMENT ON TABLE public.ejemplos_teoria IS 'Ejemplos que ilustran los temas de teoría';
COMMENT ON TABLE public.teoria_ejercicios IS 'Enlaces entre temas de teoría y ejercicios';

COMMENT ON TABLE public.examenes IS 'Tipos de exámenes Cambridge disponibles';
COMMENT ON TABLE public.modelos_examen IS 'Modelos específicos de cada examen';
COMMENT ON TABLE public.intentos_examen IS 'Intentos de usuarios en exámenes';
COMMENT ON TABLE public.respuestas_examen IS 'Respuestas individuales en exámenes';

COMMENT ON TABLE public.pruebas_nivel IS 'Pruebas de nivel disponibles';
COMMENT ON TABLE public.sesiones_nivel IS 'Sesiones de usuarios en pruebas de nivel';
COMMENT ON TABLE public.respuestas_prueba_nivel IS 'Respuestas en pruebas de nivel';

COMMENT ON TABLE public.cursos IS 'Cursos organizados por niveles A1-C2';
COMMENT ON TABLE public.unidades IS 'Unidades dentro de cada curso';
COMMENT ON TABLE public.lecciones IS 'Lecciones dentro de cada unidad';
COMMENT ON TABLE public.progreso_leccion_usuario IS 'Progreso de usuarios en lecciones';
COMMENT ON TABLE public.intentos_entrenamiento IS 'Intentos de ejercicios en entrenamientos';

-- =====================================================
-- INSTRUCCIONES POST-EJECUCIÓN
-- =====================================================

-- 1. Verificar que las tablas se crearon correctamente:
--    SELECT table_name FROM information_schema.tables 
--    WHERE table_schema = 'public' 
--    AND table_name IN ('temas_teoria', 'examenes', 'pruebas_nivel', 'cursos')
--    ORDER BY table_name;

-- 2. Verificar los datos iniciales:
--    SELECT * FROM public.cursos ORDER BY orden;
--    SELECT * FROM public.examenes;
--    SELECT * FROM public.dificultades;

-- 3. Verificar las políticas RLS:
--    SELECT tablename, policyname FROM pg_policies 
--    WHERE tablename IN ('temas_teoria', 'cursos', 'lecciones', 'examenes')
--    ORDER BY tablename, policyname;

-- =====================================================
-- FIN DEL SCRIPT
-- =====================================================
