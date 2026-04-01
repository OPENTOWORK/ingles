-- =====================================================
-- SISTEMA COMPLETO PARA ENGLISH PRACTICE (VERSIÓN CORREGIDA)
-- Maneja conflictos con elementos existentes
-- =====================================================

-- =====================================================
-- 1. SISTEMA DE USUARIOS Y ROLES
-- =====================================================

-- Tabla de perfiles de usuario (extiende auth.users)
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('admin', 'teacher', 'student')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Tabla de estudiantes
CREATE TABLE IF NOT EXISTS public.students (
    id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE PRIMARY KEY,
    current_level TEXT DEFAULT 'A1' CHECK (current_level IN ('A1', 'A2', 'B1', 'B2', 'C1', 'C2')),
    target_level TEXT DEFAULT 'C2' CHECK (target_level IN ('A1', 'A2', 'B1', 'B2', 'C1', 'C2')),
    enrollment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    progress_data JSONB DEFAULT '{}'::jsonb,
    study_preferences JSONB DEFAULT '{}'::jsonb
);

-- Tabla de profesores
CREATE TABLE IF NOT EXISTS public.teachers (
    id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE PRIMARY KEY,
    specializations TEXT[] DEFAULT '{}',
    experience_years INTEGER DEFAULT 0,
    bio TEXT,
    hourly_rate DECIMAL(10,2),
    rating DECIMAL(3,2) DEFAULT 0.00,
    total_reviews INTEGER DEFAULT 0,
    is_verified BOOLEAN DEFAULT FALSE,
    hire_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    availability JSONB DEFAULT '{}'::jsonb
);

-- Tabla de administradores
CREATE TABLE IF NOT EXISTS public.administrators (
    id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE PRIMARY KEY,
    permissions TEXT[] DEFAULT ARRAY['manage_users', 'manage_content', 'view_analytics'],
    department TEXT,
    access_level INTEGER DEFAULT 1 CHECK (access_level BETWEEN 1 AND 5),
    admin_since TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 2. SISTEMA DE TEORÍA
-- =====================================================

-- Temas de teoría (páginas de explicación)
CREATE TABLE IF NOT EXISTS public.temas_teoria (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    titulo TEXT NOT NULL,
    resumen TEXT,
    contenido_html TEXT,
    contenido_markdown TEXT,
    nivel TEXT CHECK (nivel IN ('A1', 'A2', 'B1', 'B2', 'C1', 'C2')),
    habilidad TEXT CHECK (habilidad IN ('reading', 'writing', 'listening', 'speaking', 'use_of_english', 'grammar', 'vocabulary')),
    referencias_examen JSONB DEFAULT '[]'::jsonb,
    orden INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ejemplos de teoría (frases/casos que ilustran)
CREATE TABLE IF NOT EXISTS public.ejemplos_teoria (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tema_teoria_id UUID REFERENCES public.temas_teoria(id) ON DELETE CASCADE,
    frase_o_caso TEXT NOT NULL,
    explicacion TEXT,
    tipo_ejemplo TEXT DEFAULT 'ejemplo' CHECK (tipo_ejemplo IN ('ejemplo', 'caso_practico', 'nota_importante')),
    orden INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enlaces teoría ↔ ejercicios
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
-- 3. SISTEMA DE EXÁMENES CAMBRIDGE
-- =====================================================

-- Tipos de examen (B2 First, C1 Advanced, etc.)
CREATE TABLE IF NOT EXISTS public.examenes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre TEXT NOT NULL,
    nivel TEXT NOT NULL CHECK (nivel IN ('A2', 'B1', 'B2', 'C1', 'C2')),
    descripcion TEXT,
    duracion_total_minutos INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tipos de examen (Full exam, Use of English, Writing, etc.)
CREATE TABLE IF NOT EXISTS public.tipos_examen (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    examen_id UUID REFERENCES public.examenes(id) ON DELETE CASCADE,
    tipo TEXT NOT NULL,
    nombre TEXT NOT NULL,
    descripcion TEXT,
    duracion_minutos INTEGER DEFAULT 0,
    orden INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE
);

-- Modelos específicos de examen
CREATE TABLE IF NOT EXISTS public.modelos_examen (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tipo_examen_id UUID REFERENCES public.tipos_examen(id) ON DELETE CASCADE,
    nombre TEXT NOT NULL,
    version TEXT,
    duracion_minutos INTEGER,
    fecha_disponible DATE,
    is_published BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Secciones del examen
CREATE TABLE IF NOT EXISTS public.secciones_examen (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    modelo_examen_id UUID REFERENCES public.modelos_examen(id) ON DELETE CASCADE,
    nombre TEXT NOT NULL,
    instrucciones TEXT,
    puntuacion_maxima INTEGER DEFAULT 0,
    tiempo_sugerido_minutos INTEGER DEFAULT 0,
    orden INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE
);

-- Tareas del examen (enlaces a ejercicios)
CREATE TABLE IF NOT EXISTS public.tareas_examen (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    seccion_examen_id UUID REFERENCES public.secciones_examen(id) ON DELETE CASCADE,
    ejercicio_id UUID REFERENCES public.ejercicios(id) ON DELETE CASCADE,
    orden INTEGER DEFAULT 0,
    notas TEXT,
    puntuacion_peso DECIMAL(3,2) DEFAULT 1.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Rúbricas para Writing/Speaking
CREATE TABLE IF NOT EXISTS public.rubricas_examen (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    seccion_examen_id UUID REFERENCES public.secciones_examen(id) ON DELETE CASCADE,
    nombre_criterio TEXT NOT NULL,
    descripcion TEXT,
    puntuacion_maxima INTEGER DEFAULT 0,
    orden INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Intentos de examen por usuario
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

-- Respuestas del usuario en exámenes
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

-- Puntuaciones de rúbricas
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
-- 4. SISTEMA DE PRUEBA DE NIVEL
-- =====================================================

-- Pruebas de nivel activas
CREATE TABLE IF NOT EXISTS public.pruebas_nivel (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre TEXT NOT NULL,
    tipo TEXT DEFAULT 'fija' CHECK (tipo IN ('adaptativa', 'fija')),
    nivel_inicial TEXT CHECK (nivel_inicial IN ('A1', 'A2', 'B1', 'B2', 'C1', 'C2')),
    nivel_final TEXT CHECK (nivel_final IN ('A1', 'A2', 'B1', 'B2', 'C1', 'C2')),
    descripcion TEXT,
    tiempo_estimado_minutos INTEGER DEFAULT 30,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Preguntas que componen cada prueba de nivel
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

-- Sesiones de prueba de nivel por usuario
CREATE TABLE IF NOT EXISTS public.sesiones_nivel (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    prueba_nivel_id UUID REFERENCES public.pruebas_nivel(id) ON DELETE CASCADE,
    fecha_inicio TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    fecha_fin TIMESTAMP WITH TIME ZONE,
    tiempo_total_minutos INTEGER DEFAULT 0,
    nivel_sugerido TEXT CHECK (nivel_sugerido IN ('A1', 'A2', 'B1', 'B2', 'C1', 'C2')),
    confianza_resultado DECIMAL(3,2) DEFAULT 0.00,
    puntuacion_total DECIMAL(5,2) DEFAULT 0,
    estado TEXT DEFAULT 'en_progreso' CHECK (estado IN ('en_progreso', 'completada', 'abandonada')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Respuestas en pruebas de nivel
CREATE TABLE IF NOT EXISTS public.respuestas_prueba_nivel (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sesion_nivel_id UUID REFERENCES public.sesiones_nivel(id) ON DELETE CASCADE,
    pregunta_id UUID REFERENCES public.preguntas(id) ON DELETE CASCADE,
    respuesta_usuario TEXT,
    es_correcta BOOLEAN,
    tiempo_respuesta_segundos INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recomendaciones después de la prueba
CREATE TABLE IF NOT EXISTS public.recomendaciones_nivel (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sesion_nivel_id UUID REFERENCES public.sesiones_nivel(id) ON DELETE CASCADE,
    curso_recomendado TEXT,
    unidad_recomendada TEXT,
    lecciones_recomendadas TEXT[],
    notas_para_usuario TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 5. SISTEMA DE TRAINING (CURSOS → UNIDADES → LECCIONES)
-- =====================================================

-- Cursos (A1, A2, B1, B2, C1, C2)
CREATE TABLE IF NOT EXISTS public.cursos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nivel TEXT UNIQUE NOT NULL CHECK (nivel IN ('A1', 'A2', 'B1', 'B2', 'C1', 'C2')),
    nombre TEXT NOT NULL,
    descripcion TEXT,
    enfoque TEXT,
    nivel_partida TEXT,
    duracion_estimada_horas INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    orden INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Unidades dentro de cursos
CREATE TABLE IF NOT EXISTS public.unidades (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    curso_id UUID REFERENCES public.cursos(id) ON DELETE CASCADE,
    nombre TEXT NOT NULL,
    descripcion TEXT,
    habilidad TEXT CHECK (habilidad IN ('reading', 'writing', 'listening', 'speaking', 'use_of_english', 'mixed', 'challenge')),
    orden INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Dificultades (básico, intermedio, avanzado)
CREATE TABLE IF NOT EXISTS public.dificultades (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre TEXT UNIQUE NOT NULL CHECK (nombre IN ('básico', 'intermedio', 'avanzado')),
    descripcion TEXT,
    nivel_numerico INTEGER DEFAULT 1,
    orden INTEGER DEFAULT 0
);

-- Niveles de entrenamiento (1, 2, 3...)
CREATE TABLE IF NOT EXISTS public.niveles_entrenamiento (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre TEXT NOT NULL,
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

-- Ejercicios dentro de cada lección
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

-- Progreso del usuario en cada lección
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

-- Intentos de entrenamiento
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

-- Respuestas en entrenamientos
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

-- Índices para sistema de usuarios y roles
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON public.user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_active ON public.user_profiles(is_active);

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
-- FUNCIONES Y TRIGGERS (CON MANEJO DE CONFLICTOS)
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
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_user_profiles_updated_at') THEN
        CREATE TRIGGER update_user_profiles_updated_at 
            BEFORE UPDATE ON public.user_profiles 
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
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

-- Función para crear perfil automáticamente al registrarse
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (id, email, full_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        COALESCE(NEW.raw_user_meta_data->>'role', 'student')
    )
    ON CONFLICT (id) DO NOTHING;
    
    -- Crear registro específico según el rol
    IF COALESCE(NEW.raw_user_meta_data->>'role', 'student') = 'student' THEN
        INSERT INTO public.students (id) VALUES (NEW.id) ON CONFLICT (id) DO NOTHING;
    ELSIF NEW.raw_user_meta_data->>'role' = 'teacher' THEN
        INSERT INTO public.teachers (id) VALUES (NEW.id) ON CONFLICT (id) DO NOTHING;
    ELSIF NEW.raw_user_meta_data->>'role' = 'admin' THEN
        INSERT INTO public.administrators (id) VALUES (NEW.id) ON CONFLICT (id) DO NOTHING;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para crear perfil automáticamente (solo si no existe)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created') THEN
        CREATE TRIGGER on_auth_user_created
            AFTER INSERT ON auth.users
            FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
    END IF;
END $$;

-- Función para manejar cambios de rol
CREATE OR REPLACE FUNCTION public.handle_role_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Eliminar de tablas específicas si el rol cambió
    IF OLD.role IS NOT NULL AND OLD.role != NEW.role THEN
        IF OLD.role = 'student' THEN
            DELETE FROM public.students WHERE id = OLD.id;
        ELSIF OLD.role = 'teacher' THEN
            DELETE FROM public.teachers WHERE id = OLD.id;
        ELSIF OLD.role = 'admin' THEN
            DELETE FROM public.administrators WHERE id = OLD.id;
        END IF;
    END IF;

    -- Insertar en nueva tabla según el rol
    IF NEW.role = 'student' AND NOT EXISTS (SELECT 1 FROM public.students WHERE id = NEW.id) THEN
        INSERT INTO public.students (id) VALUES (NEW.id);
    ELSIF NEW.role = 'teacher' AND NOT EXISTS (SELECT 1 FROM public.teachers WHERE id = NEW.id) THEN
        INSERT INTO public.teachers (id) VALUES (NEW.id);
    ELSIF NEW.role = 'admin' AND NOT EXISTS (SELECT 1 FROM public.administrators WHERE id = NEW.id) THEN
        INSERT INTO public.administrators (id) VALUES (NEW.id);
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para manejar cambios de rol (solo si no existe)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_role_change') THEN
        CREATE TRIGGER on_role_change
            AFTER INSERT OR UPDATE OF role ON public.user_profiles
            FOR EACH ROW EXECUTE FUNCTION public.handle_role_change();
    END IF;
END $$;

-- =====================================================
-- POLÍTICAS RLS (ROW LEVEL SECURITY)
-- =====================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.administrators ENABLE ROW LEVEL SECURITY;

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

-- Políticas básicas para usuarios y roles (solo si no existen)
DO $$
BEGIN
    -- Políticas para user_profiles
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_profiles' AND policyname = 'Users can view their own profile') THEN
        CREATE POLICY "Users can view their own profile" ON public.user_profiles
            FOR SELECT USING (auth.uid() = id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_profiles' AND policyname = 'Users can update their own profile') THEN
        CREATE POLICY "Users can update their own profile" ON public.user_profiles
            FOR UPDATE USING (auth.uid() = id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_profiles' AND policyname = 'Admins can view all profiles') THEN
        CREATE POLICY "Admins can view all profiles" ON public.user_profiles
            FOR SELECT USING (
                EXISTS (
                    SELECT 1 FROM public.user_profiles 
                    WHERE id = auth.uid() AND role = 'admin'
                )
            );
    END IF;

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

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'progreso_leccion_usuario' AND policyname = 'Admins can view all progress') THEN
        CREATE POLICY "Admins can view all progress" ON public.progreso_leccion_usuario
            FOR ALL USING (
                EXISTS (
                    SELECT 1 FROM public.user_profiles 
                    WHERE id = auth.uid() AND role = 'admin'
                )
            );
    END IF;
END $$;

-- =====================================================
-- VISTAS ÚTILES
-- =====================================================

-- Vista para usuarios con roles
CREATE OR REPLACE VIEW public.v_users_with_roles AS
SELECT 
    up.id,
    up.email,
    up.full_name,
    up.role,
    up.is_active,
    up.last_login,
    up.created_at,
    CASE 
        WHEN up.role = 'student' THEN jsonb_build_object(
            'current_level', s.current_level,
            'target_level', s.target_level,
            'enrollment_date', s.enrollment_date
        )
        WHEN up.role = 'teacher' THEN jsonb_build_object(
            'specializations', t.specializations,
            'experience_years', t.experience_years,
            'rating', t.rating,
            'is_verified', t.is_verified
        )
        WHEN up.role = 'admin' THEN jsonb_build_object(
            'permissions', a.permissions,
            'access_level', a.access_level,
            'department', a.department
        )
        ELSE '{}'::jsonb
    END as role_data
FROM public.user_profiles up
LEFT JOIN public.students s ON up.id = s.id
LEFT JOIN public.teachers t ON up.id = t.id
LEFT JOIN public.administrators a ON up.id = a.id;

-- Vista para progreso completo de usuario
CREATE OR REPLACE VIEW public.v_user_progress_summary AS
SELECT 
    plu.user_id,
    c.nivel as curso_nivel,
    u.nombre as unidad_nombre,
    l.titulo as leccion_titulo,
    plu.estado,
    plu.mejor_puntuacion,
    plu.estrellas,
    plu.xp_obtenido,
    plu.intentos_totales,
    plu.ultimo_intento
FROM public.progreso_leccion_usuario plu
JOIN public.lecciones l ON plu.leccion_id = l.id
JOIN public.unidades u ON l.unidad_id = u.id
JOIN public.cursos c ON u.curso_id = c.id
ORDER BY c.nivel, u.orden, l.orden;

-- Vista para estadísticas de exámenes
CREATE OR REPLACE VIEW public.v_exam_statistics AS
SELECT 
    e.nombre as examen_nombre,
    e.nivel,
    COUNT(DISTINCT ie.id) as total_intentos,
    COUNT(DISTINCT ie.user_id) as usuarios_unicos,
    AVG(ie.porcentaje) as promedio_porcentaje,
    MAX(ie.porcentaje) as mejor_porcentaje,
    MIN(ie.porcentaje) as peor_porcentaje
FROM public.examenes e
LEFT JOIN public.tipos_examen te ON e.id = te.examen_id
LEFT JOIN public.modelos_examen me ON te.id = me.tipo_examen_id
LEFT JOIN public.intentos_examen ie ON me.id = ie.modelo_examen_id
WHERE ie.estado = 'completado'
GROUP BY e.id, e.nombre, e.nivel;

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
INSERT INTO public.unidades (curso_id, nombre, descripcion, habilidad, orden) 
SELECT 
    c.id,
    unidad.nombre,
    unidad.descripcion,
    unidad.habilidad,
    unidad.orden
FROM public.cursos c
CROSS JOIN (VALUES
    ('Use of English', 'Gramática y uso del inglés', 'use_of_english', 1),
    ('Reading', 'Comprensión lectora', 'reading', 2),
    ('Listening', 'Comprensión auditiva', 'listening', 3),
    ('Writing', 'Expresión escrita', 'writing', 4),
    ('Speaking', 'Expresión oral', 'speaking', 5),
    ('All Together', 'Todas las habilidades', 'mixed', 6),
    ('Retos', 'Ejercicios desafiantes', 'challenge', 7)
) AS unidad(nombre, descripcion, habilidad, orden)
ON CONFLICT DO NOTHING;

-- Insertar exámenes Cambridge
INSERT INTO public.examenes (nombre, nivel, descripcion, duracion_total_minutos) VALUES
('A2 Key', 'A2', 'Examen Cambridge A2 Key (KET)', 110),
('B1 Preliminary', 'B1', 'Examen Cambridge B1 Preliminary (PET)', 140),
('B2 First', 'B2', 'Examen Cambridge B2 First (FCE)', 210),
('C1 Advanced', 'C1', 'Examen Cambridge C1 Advanced (CAE)', 235),
('C2 Proficiency', 'C2', 'Examen Cambridge C2 Proficiency (CPE)', 236)
ON CONFLICT DO NOTHING;

-- =====================================================
-- COMENTARIOS Y DOCUMENTACIÓN
-- =====================================================

COMMENT ON TABLE public.user_profiles IS 'Perfiles de usuario que extienden auth.users con roles';
COMMENT ON TABLE public.students IS 'Datos específicos de estudiantes';
COMMENT ON TABLE public.teachers IS 'Datos específicos de profesores';
COMMENT ON TABLE public.administrators IS 'Datos específicos de administradores';

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

-- 1. Después de ejecutar este script, obtén el ID del usuario admin:
--    SELECT id FROM auth.users WHERE email = 'direccion@opentowork.com';

-- 2. Actualiza el rol del usuario admin:
--    UPDATE public.user_profiles 
--    SET role = 'admin' 
--    WHERE email = 'direccion@opentowork.com';

-- 3. Inserta en la tabla de administradores:
--    INSERT INTO public.administrators (id, permissions, department, access_level)
--    SELECT id, ARRAY['manage_users', 'manage_content', 'view_analytics'], 'IT', 5
--    FROM public.user_profiles 
--    WHERE email = 'direccion@opentowork.com';

-- 4. Verifica que todo esté funcionando:
--    SELECT * FROM public.v_users_with_roles WHERE role = 'admin';

-- 5. Verifica las estructuras creadas:
--    SELECT table_name FROM information_schema.tables 
--    WHERE table_schema = 'public' 
--    ORDER BY table_name;

-- =====================================================
-- FIN DEL SCRIPT
-- =====================================================
