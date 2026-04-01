-- =====================================================
-- SCRIPT COMPLETO CON TODAS LAS RELACIONES DEL DIAGRAMA
-- Incluye tablas principales + todas las relaciones (tablas puente)
-- =====================================================

-- =====================================================
-- 1. TABLAS PRINCIPALES (las que ya tienes + las que faltan)
-- =====================================================

-- 2.1 Medios (Archivos multimedia)
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

-- 2.2 Etiquetas
CREATE TABLE IF NOT EXISTS public.etiquetas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre TEXT UNIQUE NOT NULL,
    descripcion TEXT,
    categoria TEXT,
    color TEXT DEFAULT '#3B82F6',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2.3 Banco-Preguntas (Base de preguntas reutilizables)
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
    is_aleatorio BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3.1 Temas-Teoría
CREATE TABLE IF NOT EXISTS public.temas_teoria (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    titulo TEXT NOT NULL,
    resumen TEXT,
    cuerpo_contenido TEXT NOT NULL,
    referencias_examen JSONB DEFAULT '[]'::jsonb,
    habilidad TEXT CHECK (habilidad IN ('reading', 'writing', 'listening', 'speaking', 'use_of_english', 'grammar', 'vocabulary')),
    nivel TEXT CHECK (nivel IN ('A1', 'A2', 'B1', 'B2', 'C1', 'C2')),
    orden INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3.2 Ejemplos-Teoría
CREATE TABLE IF NOT EXISTS public.ejemplos_teoria (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tema_teoria_id UUID REFERENCES public.temas_teoria(id) ON DELETE CASCADE,
    frase_o_caso TEXT NOT NULL,
    explicacion TEXT,
    tipo_ejemplo TEXT DEFAULT 'ejemplo' CHECK (tipo_ejemplo IN ('ejemplo', 'caso_practico', 'nota_importante')),
    orden INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4.1 Exámenes Cambridge
CREATE TABLE IF NOT EXISTS public.examenes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre TEXT NOT NULL,
    nivel TEXT NOT NULL CHECK (nivel IN ('A2', 'B1', 'B2', 'C1', 'C2')),
    descripcion_general TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4.2 Tipo-Examen
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

-- 4.3 Modelos-Examen
CREATE TABLE IF NOT EXISTS public.modelos_examen (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tipo_examen_id UUID REFERENCES public.tipos_examen(id) ON DELETE CASCADE,
    nombre TEXT NOT NULL,
    version TEXT,
    duracion_total_minutos INTEGER,
    fecha_disponible DATE,
    is_published BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4.4 Secciones-Examen
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

-- 4.6 Rubricas-Examen
CREATE TABLE IF NOT EXISTS public.rubricas_examen (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    seccion_examen_id UUID REFERENCES public.secciones_examen(id) ON DELETE CASCADE,
    nombre_criterio TEXT NOT NULL,
    descripcion TEXT,
    puntuacion_maxima INTEGER DEFAULT 0,
    orden INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4.7 Intentos-Examen
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

-- 4.8 Respuestas-Examen
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

-- 4.9 Puntuaciones-Rubrica
CREATE TABLE IF NOT EXISTS public.puntuaciones_rubrica (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    intento_examen_id UUID REFERENCES public.intentos_examen(id) ON DELETE CASCADE,
    rubrica_examen_id UUID REFERENCES public.rubricas_examen(id) ON DELETE CASCADE,
    puntuacion_obtenida INTEGER DEFAULT 0,
    puntuacion_maxima INTEGER DEFAULT 0,
    notas_corrector TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5.1 Pruebas-Nivel
CREATE TABLE IF NOT EXISTS public.pruebas_nivel (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre TEXT NOT NULL,
    tipo TEXT DEFAULT 'fija' CHECK (tipo IN ('adaptativa', 'fija')),
    notas TEXT,
    nivel_inicial TEXT CHECK (nivel_inicial IN ('A1', 'A2', 'B1', 'B2', 'C1', 'C2')),
    nivel_final TEXT CHECK (nivel_final IN ('A1', 'A2', 'B1', 'B2', 'C1', 'C2')),
    tiempo_estimado_minutos INTEGER DEFAULT 30,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5.3 Sesiones-Nivel
CREATE TABLE IF NOT EXISTS public.sesiones_nivel (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    prueba_nivel_id UUID REFERENCES public.pruebas_nivel(id) ON DELETE CASCADE,
    fecha_inicio TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    fecha_fin TIMESTAMP WITH TIME ZONE,
    tiempo_total_minutos INTEGER DEFAULT 0,
    nivel_sugerido TEXT CHECK (nivel_sugerido IN ('A1', 'A2', 'B1', 'B2', 'C1', 'C2')),
    grado_confianza DECIMAL(3,2) DEFAULT 0.00,
    puntuacion_total DECIMAL(5,2) DEFAULT 0,
    estado TEXT DEFAULT 'en_progreso' CHECK (estado IN ('en_progreso', 'completada', 'abandonada')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5.4 Respuestas-Prueba-Nivel
CREATE TABLE IF NOT EXISTS public.respuestas_prueba_nivel (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sesion_nivel_id UUID REFERENCES public.sesiones_nivel(id) ON DELETE CASCADE,
    pregunta_id UUID REFERENCES public.preguntas(id) ON DELETE CASCADE,
    respuesta_usuario TEXT,
    es_correcta BOOLEAN,
    tiempo_respuesta_segundos INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5.5 Recomendaciones-Nivel
CREATE TABLE IF NOT EXISTS public.recomendaciones_nivel (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sesion_nivel_id UUID REFERENCES public.sesiones_nivel(id) ON DELETE CASCADE,
    curso_recomendado TEXT,
    unidad_recomendada TEXT,
    lecciones_recomendadas TEXT[],
    notas_para_usuario TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6.1 Cursos
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

-- 6.2 Unidades
CREATE TABLE IF NOT EXISTS public.unidades (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    curso_id UUID REFERENCES public.cursos(id) ON DELETE CASCADE,
    nombre TEXT NOT NULL,
    descripcion TEXT,
    tipo TEXT CHECK (tipo IN ('use_of_english', 'listening', 'reading', 'writing', 'speaking', 'all_together', 'retos')),
    orden INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6.3 Dificultades
CREATE TABLE IF NOT EXISTS public.dificultades (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre TEXT UNIQUE NOT NULL CHECK (nombre IN ('básico', 'intermedio', 'avanzado')),
    descripcion TEXT,
    nivel_numerico INTEGER DEFAULT 1,
    orden INTEGER DEFAULT 0
);

-- 6.4 Niveles-Entrenamiento
CREATE TABLE IF NOT EXISTS public.niveles_entrenamiento (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre TEXT NOT NULL,
    numero_nivel INTEGER NOT NULL,
    descripcion TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    orden INTEGER DEFAULT 0
);

-- Lecciones
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

-- 6.6 Progreso-Lección-Usuario
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

-- 6.7 Intentos-Entrenamiento
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

-- 6.8 Respuestas-Entrenamiento
CREATE TABLE IF NOT EXISTS public.respuestas_entrenamiento (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    intento_entrenamiento_id UUID REFERENCES public.intentos_entrenamiento(id) ON DELETE CASCADE,
    pregunta_id UUID REFERENCES public.preguntas(id) ON DELETE CASCADE,
    respuesta_usuario TEXT,
    es_correcta BOOLEAN,
    tiempo_respuesta_segundos INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

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
    streak_dias INTEGER DEFAULT 0,
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
    fortalezas TEXT[],
    debilidades TEXT[],
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
    sesion_id UUID NOT NULL,
    accion TEXT NOT NULL,
    timestamp_accion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    datos_contexto JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8.1 Logros
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

-- 8.3 XP Usuario
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
-- 2. TABLAS DE RELACIÓN (TABLAS PUENTE) - LAS QUE FALTAN
-- =====================================================

-- 2.2.1 Etiquetas-Contenido (UNE CUALQUIER CONTENIDO CON ETIQUETAS)
CREATE TABLE IF NOT EXISTS public.etiquetas_contenido (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    etiqueta_id UUID REFERENCES public.etiquetas(id) ON DELETE CASCADE,
    contenido_tipo TEXT NOT NULL, -- "pregunta", "ejercicio", "leccion", "tema_teoria"
    contenido_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(etiqueta_id, contenido_tipo, contenido_id)
);

-- 2.3.1 Banco-Preguntas-Teoría (2.3 ↔ 3.1)
CREATE TABLE IF NOT EXISTS public.banco_preguntas_teoria (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    pregunta_id UUID REFERENCES public.banco_preguntas(id) ON DELETE CASCADE,
    tema_teoria_id UUID REFERENCES public.temas_teoria(id) ON DELETE CASCADE,
    orden INTEGER DEFAULT 0,
    notas_especificas TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(pregunta_id, tema_teoria_id)
);

-- 2.3.2 Banco-Preguntas-Nivel (2.3 ↔ 6.4)
CREATE TABLE IF NOT EXISTS public.banco_preguntas_nivel (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    pregunta_id UUID REFERENCES public.banco_preguntas(id) ON DELETE CASCADE,
    nivel_target TEXT NOT NULL CHECK (nivel_target IN ('A1', 'A2', 'B1', 'B2', 'C1', 'C2')),
    peso_diagnostico DECIMAL(3,2) DEFAULT 1.0,
    is_adaptativa BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2.3.3 Banco-Preguntas-Examen (2.3 ↔ 4.5)
CREATE TABLE IF NOT EXISTS public.banco_preguntas_examen (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    pregunta_id UUID REFERENCES public.banco_preguntas(id) ON DELETE CASCADE,
    examen_id UUID REFERENCES public.examenes(id) ON DELETE CASCADE,
    seccion_tipo TEXT,
    peso_examen DECIMAL(3,2) DEFAULT 1.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2.3.4 Banco-Preguntas-Training (2.3 ↔ 6.4)
CREATE TABLE IF NOT EXISTS public.banco_preguntas_training (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    pregunta_id UUID REFERENCES public.banco_preguntas(id) ON DELETE CASCADE,
    curso_id UUID REFERENCES public.cursos(id) ON DELETE CASCADE,
    unidad_tipo TEXT,
    dificultad_target TEXT CHECK (dificultad_target IN ('básico', 'intermedio', 'avanzado')),
    nivel_target TEXT CHECK (nivel_target IN ('A1', 'A2', 'B1', 'B2', 'C1', 'C2')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2.3.5 Explicaciones-Ejercicio
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

-- 2.4.1 Opciones-Pregunta (PARA PREGUNTAS CON OPCIONES)
CREATE TABLE IF NOT EXISTS public.opciones_pregunta (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    pregunta_id UUID REFERENCES public.banco_preguntas(id) ON DELETE CASCADE,
    texto_opcion TEXT NOT NULL,
    es_correcta BOOLEAN DEFAULT FALSE,
    orden INTEGER DEFAULT 0,
    explicacion TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2.4.2 Medios-Pregunta (2.3 ↔ 2.1 VÍA 2.4.2)
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

-- 2.4.3 Preguntas-Ejercicio (2.3 ↔ 2.4 VÍA 2.4.3)
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

-- 3.3 Ejercicios-Teoría (3.1 ↔ 2.4 VÍA 3.3)
CREATE TABLE IF NOT EXISTS public.teoria_ejercicios (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tema_teoria_id UUID REFERENCES public.temas_teoria(id) ON DELETE CASCADE,
    ejercicio_id UUID REFERENCES public.ejercicios(id) ON DELETE CASCADE,
    orden INTEGER DEFAULT 0,
    notas TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(tema_teoria_id, ejercicio_id)
);

-- 4.5 Tareas-Examen (4.4 → 2.4)
CREATE TABLE IF NOT EXISTS public.tareas_examen (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    seccion_examen_id UUID REFERENCES public.secciones_examen(id) ON DELETE CASCADE,
    ejercicio_id UUID REFERENCES public.ejercicios(id) ON DELETE CASCADE,
    orden INTEGER DEFAULT 0,
    notas_especificas TEXT,
    puntuacion_peso DECIMAL(3,2) DEFAULT 1.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5.2 Preguntas-Prueba-Nivel (5.1 → 2.3)
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

-- 6.5 Ejercicios-En-Nivel (6.2 → 2.4)
CREATE TABLE IF NOT EXISTS public.ejercicios_en_nivel (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    leccion_id UUID REFERENCES public.lecciones(id) ON DELETE CASCADE,
    ejercicio_id UUID REFERENCES public.ejercicios(id) ON DELETE CASCADE,
    orden INTEGER DEFAULT 0,
    peso_puntuacion DECIMAL(3,2) DEFAULT 1.0,
    explicacion TEXT,
    puntuacion_maxima INTEGER DEFAULT 100,
    tiempo_limite_minutos INTEGER,
    intentos_permitidos INTEGER DEFAULT 3,
    is_aleatorio BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(leccion_id, ejercicio_id)
);

-- 8.2 Logros-Usuario (8.1 ↔ 1.1.1 VÍA 8.2)
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
-- 3. HABILITAR RLS EN TODAS LAS TABLAS
-- =====================================================

-- Habilitar RLS en tablas principales
ALTER TABLE public.medios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.etiquetas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banco_preguntas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ejercicios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.temas_teoria ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ejemplos_teoria ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.examenes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tipos_examen ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modelos_examen ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.secciones_examen ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rubricas_examen ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.intentos_examen ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.respuestas_examen ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.puntuaciones_rubrica ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pruebas_nivel ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sesiones_nivel ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.respuestas_prueba_nivel ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recomendaciones_nivel ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cursos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.unidades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dificultades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.niveles_entrenamiento ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lecciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progreso_leccion_usuario ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.intentos_entrenamiento ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.respuestas_entrenamiento ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progreso_general_usuario ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.estadisticas_habilidad ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.historial_actividad ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logs_sesiones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logros ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xp_usuario ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboard ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reportes_contenido ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calificaciones_contenido ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sugerencias_mejora ENABLE ROW LEVEL SECURITY;

-- Habilitar RLS en tablas de relación
ALTER TABLE public.etiquetas_contenido ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banco_preguntas_teoria ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banco_preguntas_nivel ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banco_preguntas_examen ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banco_preguntas_training ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.explicaciones_ejercicio ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opciones_pregunta ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medios_pregunta ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.preguntas_ejercicio ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teoria_ejercicios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tareas_examen ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.preguntas_pruebas_nivel ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ejercicios_en_nivel ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logros_usuario ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 4. INSERTAR DATOS INICIALES
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

-- Insertar exámenes Cambridge
INSERT INTO public.examenes (nombre, nivel, descripcion_general) VALUES
('A2 Key', 'A2', 'Examen Cambridge A2 Key (KET) - Certifica nivel básico de inglés'),
('B1 Preliminary', 'B1', 'Examen Cambridge B1 Preliminary (PET) - Certifica nivel intermedio'),
('B2 First', 'B2', 'Examen Cambridge B2 First (FCE) - Certifica nivel intermedio-alto'),
('C1 Advanced', 'C1', 'Examen Cambridge C1 Advanced (CAE) - Certifica nivel avanzado'),
('C2 Proficiency', 'C2', 'Examen Cambridge C2 Proficiency (CPE) - Certifica nivel experto')
ON CONFLICT DO NOTHING;

-- =====================================================
-- 5. VERIFICACIÓN FINAL
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
            AND table_name = 'preguntas_ejercicio'
        ) THEN '✅ preguntas_ejercicio creada'
        ELSE '❌ preguntas_ejercicio NO creada'
    END as "Estado"
UNION ALL
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'medios_pregunta'
        ) THEN '✅ medios_pregunta creada'
        ELSE '❌ medios_pregunta NO creada'
    END as "Estado";

-- Contar registros insertados
SELECT '=== DATOS INICIALES INSERTADOS ===' as resultado;
SELECT 'Etiquetas:' as tipo, COUNT(*) as total FROM public.etiquetas
UNION ALL
SELECT 'Logros:' as tipo, COUNT(*) as total FROM public.logros
UNION ALL
SELECT 'Cursos:' as tipo, COUNT(*) as total FROM public.cursos
UNION ALL
SELECT 'Exámenes:' as tipo, COUNT(*) as total FROM public.examenes;

SELECT '=== SCRIPT COMPLETADO ===' as resultado;
