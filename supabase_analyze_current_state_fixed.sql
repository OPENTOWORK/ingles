-- =====================================================
-- SCRIPT PARA ANALIZAR EL ESTADO ACTUAL DE SUPABASE (CORREGIDO)
-- Muestra todas las tablas, columnas, índices y políticas existentes
-- =====================================================

-- =====================================================
-- 1. INFORMACIÓN GENERAL DE LA BASE DE DATOS
-- =====================================================

SELECT '=== INFORMACIÓN GENERAL ===' as seccion;

SELECT 
    'Base de datos:' as info,
    current_database() as valor
UNION ALL
SELECT 
    'Usuario actual:' as info,
    current_user as valor
UNION ALL
SELECT 
    'Esquema actual:' as info,
    current_schema() as valor;

-- =====================================================
-- 2. TODAS LAS TABLAS EXISTENTES
-- =====================================================

SELECT '=== TABLAS EXISTENTES ===' as seccion;

SELECT 
    table_name as "Nombre de Tabla",
    CASE 
        WHEN table_type = 'BASE TABLE' THEN 'Tabla'
        WHEN table_type = 'VIEW' THEN 'Vista'
        ELSE table_type
    END as "Tipo",
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_class c 
            JOIN pg_namespace n ON n.oid = c.relnamespace 
            WHERE c.relname = table_name 
            AND n.nspname = 'public'
            AND c.relrowsecurity = true
        ) THEN 'Sí'
        ELSE 'No'
    END as "RLS Habilitado"
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- =====================================================
-- 3. COLUMNAS DE CADA TABLA
-- =====================================================

SELECT '=== COLUMNAS POR TABLA ===' as seccion;

SELECT 
    t.table_name as "Tabla",
    c.column_name as "Columna",
    c.data_type as "Tipo de Dato",
    CASE WHEN c.is_nullable = 'YES' THEN 'Sí' ELSE 'No' END as "Permite NULL",
    CASE WHEN c.column_default IS NOT NULL THEN 'Sí' ELSE 'No' END as "Valor por Defecto",
    c.character_maximum_length as "Longitud Máxima"
FROM information_schema.tables t
JOIN information_schema.columns c ON t.table_name = c.table_name
WHERE t.table_schema = 'public' 
AND c.table_schema = 'public'
ORDER BY t.table_name, c.ordinal_position;

-- =====================================================
-- 4. CLAVES PRIMARIAS Y FORÁNEAS
-- =====================================================

SELECT '=== CLAVES PRIMARIAS ===' as seccion;

SELECT 
    tc.table_name as "Tabla",
    kcu.column_name as "Columna Clave Primaria"
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.constraint_type = 'PRIMARY KEY'
AND tc.table_schema = 'public'
ORDER BY tc.table_name;

SELECT '=== CLAVES FORÁNEAS ===' as seccion;

SELECT 
    tc.table_name as "Tabla Origen",
    kcu.column_name as "Columna Origen",
    ccu.table_name as "Tabla Destino",
    ccu.column_name as "Columna Destino",
    tc.constraint_name as "Nombre de Restricción"
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
AND tc.table_schema = 'public'
ORDER BY tc.table_name, kcu.column_name;

-- =====================================================
-- 5. ÍNDICES EXISTENTES
-- =====================================================

SELECT '=== ÍNDICES EXISTENTES ===' as seccion;

SELECT 
    schemaname as "Esquema",
    tablename as "Tabla",
    indexname as "Nombre del Índice",
    indexdef as "Definición del Índice"
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- =====================================================
-- 6. POLÍTICAS RLS (ROW LEVEL SECURITY)
-- =====================================================

SELECT '=== POLÍTICAS RLS ===' as seccion;

SELECT 
    schemaname as "Esquema",
    tablename as "Tabla",
    policyname as "Nombre de Política",
    permissive as "Tipo",
    roles as "Roles",
    cmd as "Comando",
    qual as "Condición WHERE",
    with_check as "Condición WITH CHECK"
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- =====================================================
-- 7. FUNCIONES Y TRIGGERS
-- =====================================================

SELECT '=== FUNCIONES DEFINIDAS ===' as seccion;

SELECT 
    routine_name as "Nombre de Función",
    routine_type as "Tipo",
    data_type as "Tipo de Retorno"
FROM information_schema.routines
WHERE routine_schema = 'public'
ORDER BY routine_name;

SELECT '=== TRIGGERS ===' as seccion;

SELECT 
    trigger_name as "Nombre del Trigger",
    event_object_table as "Tabla",
    action_timing as "Momento",
    event_manipulation as "Evento",
    action_statement as "Acción"
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- =====================================================
-- 8. VISTAS EXISTENTES
-- =====================================================

SELECT '=== VISTAS EXISTENTES ===' as seccion;

SELECT 
    table_name as "Nombre de Vista",
    view_definition as "Definición de Vista"
FROM information_schema.views
WHERE table_schema = 'public'
ORDER BY table_name;

-- =====================================================
-- 9. ESTADÍSTICAS DE DATOS (CORREGIDO)
-- =====================================================

SELECT '=== ESTADÍSTICAS DE DATOS ===' as seccion;

SELECT 
    schemaname as "Esquema",
    relname as "Tabla",
    n_tup_ins as "Filas Insertadas",
    n_tup_upd as "Filas Actualizadas",
    n_tup_del as "Filas Eliminadas",
    n_live_tup as "Filas Vivas",
    n_dead_tup as "Filas Muertas",
    last_vacuum as "Último Vacuum",
    last_autovacuum as "Último Auto-vacuum",
    last_analyze as "Último Analyze",
    last_autoanalyze as "Último Auto-analyze"
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY relname;

-- =====================================================
-- 10. USUARIOS Y PERMISOS
-- =====================================================

SELECT '=== USUARIOS Y ROLES ===' as seccion;

SELECT 
    rolname as "Nombre de Rol",
    rolsuper as "Es Superusuario",
    rolinherit as "Hereda Privilegios",
    rolcreaterole as "Puede Crear Roles",
    rolcreatedb as "Puede Crear BD",
    rolcanlogin as "Puede Iniciar Sesión",
    rolconnlimit as "Límite de Conexiones",
    rolvaliduntil as "Válido Hasta"
FROM pg_roles
WHERE rolname NOT LIKE 'pg_%'
ORDER BY rolname;

-- =====================================================
-- 11. ESPACIO OCUPADO POR TABLAS (CORREGIDO)
-- =====================================================

SELECT '=== ESPACIO OCUPADO POR TABLAS ===' as seccion;

SELECT 
    schemaname as "Esquema",
    tablename as "Tabla",
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as "Tamaño Total",
    pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) as "Tamaño de Datos",
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename) - pg_relation_size(schemaname||'.'||tablename)) as "Tamaño de Índices"
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- =====================================================
-- 12. CONTEOS DE REGISTROS POR TABLA
-- =====================================================

SELECT '=== CONTEOS DE REGISTROS ===' as seccion;

DO $$
DECLARE
    table_record RECORD;
    count_result INTEGER;
BEGIN
    FOR table_record IN 
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
        ORDER BY table_name
    LOOP
        BEGIN
            EXECUTE format('SELECT COUNT(*) FROM public.%I', table_record.table_name) INTO count_result;
            RAISE NOTICE 'Tabla: % - Registros: %', table_record.table_name, count_result;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Error al contar registros en tabla %: %', table_record.table_name, SQLERRM;
        END;
    END LOOP;
END $$;

-- =====================================================
-- 13. CONFIGURACIÓN DE EXTENSIONES
-- =====================================================

SELECT '=== EXTENSIONES INSTALADAS ===' as seccion;

SELECT 
    extname as "Nombre de Extensión",
    extversion as "Versión",
    extrelocatable as "Reubicable"
FROM pg_extension
ORDER BY extname;

-- =====================================================
-- 14. CONFIGURACIÓN DE AUTENTICACIÓN
-- =====================================================

SELECT '=== CONFIGURACIÓN DE AUTENTICACIÓN ===' as seccion;

-- Verificar si existe la tabla de usuarios de Supabase
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'auth' 
            AND table_name = 'users'
        ) THEN 'auth.users existe'
        ELSE 'auth.users NO existe'
    END as "Estado de auth.users";

-- Verificar si existe la tabla de perfiles
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'user_profiles'
        ) THEN 'user_profiles existe'
        ELSE 'user_profiles NO existe'
    END as "Estado de user_profiles";

-- Verificar otras tablas importantes
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'ejercicios'
        ) THEN 'ejercicios existe'
        ELSE 'ejercicios NO existe'
    END as "Estado de ejercicios";

SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'preguntas'
        ) THEN 'preguntas existe'
        ELSE 'preguntas NO existe'
    END as "Estado de preguntas";

SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'versiones_preguntas'
        ) THEN 'versiones_preguntas existe'
        ELSE 'versiones_preguntas NO existe'
    END as "Estado de versiones_preguntas";

SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'opciones'
        ) THEN 'opciones existe'
        ELSE 'opciones NO existe'
    END as "Estado de opciones";

-- =====================================================
-- 15. RESUMEN EJECUTIVO
-- =====================================================

SELECT '=== RESUMEN EJECUTIVO ===' as seccion;

SELECT 
    'Total de tablas:' as metrica,
    COUNT(*)::text as valor
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'

UNION ALL

SELECT 
    'Total de vistas:' as metrica,
    COUNT(*)::text as valor
FROM information_schema.views 
WHERE table_schema = 'public'

UNION ALL

SELECT 
    'Total de índices:' as metrica,
    COUNT(*)::text as valor
FROM pg_indexes 
WHERE schemaname = 'public'

UNION ALL

SELECT 
    'Total de políticas RLS:' as metrica,
    COUNT(*)::text as valor
FROM pg_policies 
WHERE schemaname = 'public'

UNION ALL

SELECT 
    'Total de funciones:' as metrica,
    COUNT(*)::text as valor
FROM information_schema.routines 
WHERE routine_schema = 'public'

UNION ALL

SELECT 
    'Total de triggers:' as metrica,
    COUNT(*)::text as valor
FROM information_schema.triggers 
WHERE trigger_schema = 'public';

-- =====================================================
-- 16. VERIFICACIÓN ESPECÍFICA DE TABLAS DEL DIAGRAMA
-- =====================================================

SELECT '=== VERIFICACIÓN DE TABLAS DEL DIAGRAMA ===' as seccion;

-- Verificar tablas de biblioteca
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'medios'
        ) THEN 'medios existe'
        ELSE 'medios NO existe'
    END as "Estado de medios";

SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'etiquetas'
        ) THEN 'etiquetas existe'
        ELSE 'etiquetas NO existe'
    END as "Estado de etiquetas";

SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'banco_preguntas'
        ) THEN 'banco_preguntas existe'
        ELSE 'banco_preguntas NO existe'
    END as "Estado de banco_preguntas";

-- Verificar tablas de teoría
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'temas_teoria'
        ) THEN 'temas_teoria existe'
        ELSE 'temas_teoria NO existe'
    END as "Estado de temas_teoria";

-- Verificar tablas de exámenes
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'examenes'
        ) THEN 'examenes existe'
        ELSE 'examenes NO existe'
    END as "Estado de examenes";

-- Verificar tablas de training
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'cursos'
        ) THEN 'cursos existe'
        ELSE 'cursos NO existe'
    END as "Estado de cursos";

SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'lecciones'
        ) THEN 'lecciones existe'
        ELSE 'lecciones NO existe'
    END as "Estado de lecciones";

-- Verificar tablas de gamificación
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'logros'
        ) THEN 'logros existe'
        ELSE 'logros NO existe'
    END as "Estado de logros";

SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'xp_usuario'
        ) THEN 'xp_usuario existe'
        ELSE 'xp_usuario NO existe'
    END as "Estado de xp_usuario";

-- =====================================================
-- FIN DEL ANÁLISIS
-- =====================================================

SELECT '=== ANÁLISIS COMPLETADO ===' as resultado;
