-- =====================================================
-- SCRIPT SIMPLE - SOLO AGREGAR TABLAS FALTANTES
-- =====================================================

-- Sistema de Teoría
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

CREATE TABLE IF NOT EXISTS public.ejemplos_teoria (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tema_teoria_id UUID REFERENCES public.temas_teoria(id) ON DELETE CASCADE,
    frase_o_caso TEXT NOT NULL,
    explicacion TEXT,
    tipo_ejemplo TEXT DEFAULT 'ejemplo' CHECK (tipo_ejemplo IN ('ejemplo', 'caso_practico', 'nota_importante')),
    orden INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.teoria_ejercicios (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tema_teoria_id UUID REFERENCES public.temas_teoria(id) ON DELETE CASCADE,
    ejercicio_id UUID REFERENCES public.ejercicios(id) ON DELETE CASCADE,
    orden INTEGER DEFAULT 0,
    notas TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(tema_teoria_id, ejercicio_id)
);

-- Sistema de Exámenes Cambridge
CREATE TABLE IF NOT EXISTS public.examenes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre TEXT NOT NULL,
    nivel TEXT NOT NULL CHECK (nivel IN ('A2', 'B1', 'B2', 'C1', 'C2')),
    descripcion TEXT,
    duracion_total_minutos INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

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

-- Sistema de Prueba de Nivel
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

-- Sistema de Training
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

-- Datos iniciales básicos
INSERT INTO public.cursos (nivel, nombre, descripcion, enfoque, nivel_partida, duracion_estimada_horas, orden) VALUES
('A1', 'A1 Beginner', 'Curso de inglés nivel A1', 'Fundamentos básicos del inglés', 'Principiante', 80, 1),
('A2', 'A2 Elementary', 'Curso de inglés nivel A2', 'Desarrollo de habilidades básicas', 'A1', 100, 2),
('B1', 'B1 Intermediate', 'Curso de inglés nivel B1', 'Consolidación de conocimientos intermedios', 'A2', 120, 3),
('B2', 'B2 Upper-Intermediate', 'Curso de inglés nivel B2', 'Preparación para exámenes avanzados', 'B1', 140, 4),
('C1', 'C1 Advanced', 'Curso de inglés nivel C1', 'Dominio avanzado del idioma', 'B2', 160, 5),
('C2', 'C2 Proficiency', 'Curso de inglés nivel C2', 'Dominio nativo del idioma', 'C1', 180, 6)
ON CONFLICT (nivel) DO NOTHING;

INSERT INTO public.examenes (nombre, nivel, descripcion, duracion_total_minutos) VALUES
('A2 Key', 'A2', 'Examen Cambridge A2 Key (KET)', 110),
('B1 Preliminary', 'B1', 'Examen Cambridge B1 Preliminary (PET)', 140),
('B2 First', 'B2', 'Examen Cambridge B2 First (FCE)', 210),
('C1 Advanced', 'C1', 'Examen Cambridge C1 Advanced (CAE)', 235),
('C2 Proficiency', 'C2', 'Examen Cambridge C2 Proficiency (CPE)', 236)
ON CONFLICT DO NOTHING;
