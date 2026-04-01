-- =====================================================
-- SISTEMA DE ROLES PARA ENGLISH PRACTICE
-- =====================================================

-- 1. Tabla de perfiles de usuario (extiende auth.users)
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

-- 2. Tabla de estudiantes (datos específicos de estudiantes)
CREATE TABLE IF NOT EXISTS public.students (
    id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE PRIMARY KEY,
    current_level TEXT DEFAULT 'A1' CHECK (current_level IN ('A1', 'A2', 'B1', 'B2', 'C1', 'C2')),
    target_level TEXT DEFAULT 'C2' CHECK (target_level IN ('A1', 'A2', 'B1', 'B2', 'C1', 'C2')),
    study_goals TEXT[],
    preferred_study_time TIME,
    study_duration_minutes INTEGER DEFAULT 30,
    notifications_enabled BOOLEAN DEFAULT TRUE,
    progress_data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabla de profesores (datos específicos de profesores)
CREATE TABLE IF NOT EXISTS public.teachers (
    id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE PRIMARY KEY,
    specializations TEXT[] DEFAULT '{}',
    experience_years INTEGER DEFAULT 0,
    bio TEXT,
    hourly_rate DECIMAL(10,2),
    available_hours JSONB DEFAULT '{}'::jsonb,
    rating DECIMAL(3,2) DEFAULT 0.00,
    total_reviews INTEGER DEFAULT 0,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Tabla de administradores (datos específicos de admins)
CREATE TABLE IF NOT EXISTS public.administrators (
    id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE PRIMARY KEY,
    permissions TEXT[] DEFAULT '{}',
    department TEXT,
    access_level INTEGER DEFAULT 1 CHECK (access_level BETWEEN 1 AND 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Tabla de progreso de estudiantes
CREATE TABLE IF NOT EXISTS public.student_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    exercise_id UUID,
    exercise_type TEXT, -- 'exam', 'training', 'theory'
    level TEXT,
    skill TEXT,
    score INTEGER CHECK (score >= 0 AND score <= 100),
    time_spent_seconds INTEGER DEFAULT 0,
    attempts INTEGER DEFAULT 1,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- 6. Tabla de sesiones de estudio
CREATE TABLE IF NOT EXISTS public.study_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    teacher_id UUID REFERENCES public.teachers(id) ON DELETE SET NULL,
    session_type TEXT DEFAULT 'self_study' CHECK (session_type IN ('self_study', 'teacher_guided', 'group_session')),
    level TEXT,
    skills_covered TEXT[],
    duration_minutes INTEGER,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ended_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ÍNDICES PARA RENDIMIENTO
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON public.user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_active ON public.user_profiles(is_active);

CREATE INDEX IF NOT EXISTS idx_students_level ON public.students(current_level);
CREATE INDEX IF NOT EXISTS idx_teachers_verified ON public.teachers(is_verified);
CREATE INDEX IF NOT EXISTS idx_teachers_specializations ON public.teachers USING GIN(specializations);

CREATE INDEX IF NOT EXISTS idx_student_progress_student ON public.student_progress(student_id);
CREATE INDEX IF NOT EXISTS idx_student_progress_exercise ON public.student_progress(exercise_id);
CREATE INDEX IF NOT EXISTS idx_student_progress_date ON public.student_progress(completed_at);

CREATE INDEX IF NOT EXISTS idx_study_sessions_student ON public.study_sessions(student_id);
CREATE INDEX IF NOT EXISTS idx_study_sessions_teacher ON public.study_sessions(teacher_id);
CREATE INDEX IF NOT EXISTS idx_study_sessions_date ON public.study_sessions(started_at);

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

-- Triggers para updated_at
CREATE TRIGGER update_user_profiles_updated_at 
    BEFORE UPDATE ON public.user_profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_students_updated_at 
    BEFORE UPDATE ON public.students 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_teachers_updated_at 
    BEFORE UPDATE ON public.teachers 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_administrators_updated_at 
    BEFORE UPDATE ON public.administrators 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

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
    );
    
    -- Crear registro específico según el rol
    IF COALESCE(NEW.raw_user_meta_data->>'role', 'student') = 'student' THEN
        INSERT INTO public.students (id) VALUES (NEW.id);
    ELSIF NEW.raw_user_meta_data->>'role' = 'teacher' THEN
        INSERT INTO public.teachers (id) VALUES (NEW.id);
    ELSIF NEW.raw_user_meta_data->>'role' = 'admin' THEN
        INSERT INTO public.administrators (id) VALUES (NEW.id);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para crear perfil automáticamente
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- POLÍTICAS RLS (ROW LEVEL SECURITY)
-- =====================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.administrators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;

-- Políticas para user_profiles
CREATE POLICY "Users can view their own profile" ON public.user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.user_profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Teachers can view student profiles" ON public.user_profiles
    FOR SELECT USING (
        role = 'student' AND EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE id = auth.uid() AND role = 'teacher'
        )
    );

-- Políticas para students
CREATE POLICY "Students can view their own data" ON public.students
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Students can update their own data" ON public.students
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Teachers can view student data" ON public.students
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE id = auth.uid() AND role = 'teacher'
        )
    );

CREATE POLICY "Admins can manage all student data" ON public.students
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Políticas para teachers
CREATE POLICY "Teachers can view their own data" ON public.teachers
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Teachers can update their own data" ON public.teachers
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Students can view teacher profiles" ON public.teachers
    FOR SELECT USING (is_verified = true);

CREATE POLICY "Admins can manage all teacher data" ON public.teachers
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Políticas para administrators
CREATE POLICY "Admins can view their own data" ON public.administrators
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can update their own data" ON public.administrators
    FOR UPDATE USING (auth.uid() = id);

-- Políticas para student_progress
CREATE POLICY "Students can view their own progress" ON public.student_progress
    FOR SELECT USING (student_id = auth.uid());

CREATE POLICY "Teachers can view their students' progress" ON public.student_progress
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.study_sessions 
            WHERE student_id = student_progress.student_id 
            AND teacher_id = auth.uid()
        )
    );

CREATE POLICY "Admins can view all progress" ON public.student_progress
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Políticas para study_sessions
CREATE POLICY "Students can view their own sessions" ON public.study_sessions
    FOR SELECT USING (student_id = auth.uid());

CREATE POLICY "Teachers can view their sessions" ON public.study_sessions
    FOR SELECT USING (teacher_id = auth.uid());

CREATE POLICY "Teachers can create sessions" ON public.study_sessions
    FOR INSERT WITH CHECK (teacher_id = auth.uid());

CREATE POLICY "Admins can manage all sessions" ON public.study_sessions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- =====================================================
-- DATOS INICIALES
-- =====================================================

-- Insertar el usuario administrador existente si no existe
INSERT INTO public.user_profiles (id, email, full_name, role)
VALUES (
    '00000000-0000-0000-0000-000000000000', -- Reemplazar con el ID real del usuario admin
    'direccion@opentowork.com',
    'Administrador',
    'admin'
) ON CONFLICT (email) DO UPDATE SET
    role = 'admin',
    updated_at = NOW();

-- Insertar en tabla de administradores
INSERT INTO public.administrators (id, permissions, department, access_level)
VALUES (
    '00000000-0000-0000-0000-000000000000', -- Reemplazar con el ID real del usuario admin
    ARRAY['manage_users', 'manage_content', 'view_analytics', 'system_settings'],
    'IT',
    5
) ON CONFLICT (id) DO UPDATE SET
    permissions = ARRAY['manage_users', 'manage_content', 'view_analytics', 'system_settings'],
    updated_at = NOW();

-- =====================================================
-- VISTAS ÚTILES
-- =====================================================

-- Vista para obtener información completa de usuarios
CREATE OR REPLACE VIEW public.users_with_roles AS
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
            'study_goals', s.study_goals
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

-- Vista para estadísticas de progreso de estudiantes
CREATE OR REPLACE VIEW public.student_progress_summary AS
SELECT 
    sp.student_id,
    up.email,
    up.full_name,
    s.current_level,
    COUNT(*) as total_exercises,
    AVG(sp.score) as average_score,
    SUM(sp.time_spent_seconds) as total_time_spent,
    MAX(sp.completed_at) as last_activity
FROM public.student_progress sp
JOIN public.user_profiles up ON sp.student_id = up.id
JOIN public.students s ON sp.student_id = s.id
GROUP BY sp.student_id, up.email, up.full_name, s.current_level;

-- =====================================================
-- COMENTARIOS FINALES
-- =====================================================

COMMENT ON TABLE public.user_profiles IS 'Perfiles de usuario que extienden auth.users con roles';
COMMENT ON TABLE public.students IS 'Datos específicos de estudiantes';
COMMENT ON TABLE public.teachers IS 'Datos específicos de profesores';
COMMENT ON TABLE public.administrators IS 'Datos específicos de administradores';
COMMENT ON TABLE public.student_progress IS 'Progreso y resultados de ejercicios de estudiantes';
COMMENT ON TABLE public.study_sessions IS 'Sesiones de estudio entre estudiantes y profesores';

COMMENT ON COLUMN public.user_profiles.role IS 'Rol del usuario: admin, teacher, o student';
COMMENT ON COLUMN public.students.current_level IS 'Nivel actual del estudiante (A1-C2)';
COMMENT ON COLUMN public.teachers.is_verified IS 'Si el profesor está verificado por administradores';
COMMENT ON COLUMN public.administrators.access_level IS 'Nivel de acceso del admin (1-5, donde 5 es máximo)';


