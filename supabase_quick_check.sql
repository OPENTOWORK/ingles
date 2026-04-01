-- =====================================================
-- VERIFICACIÓN RÁPIDA DE SUPABASE
-- Solo lo esencial para saber qué tienes
-- =====================================================

-- 1. TODAS LAS TABLAS QUE TIENES
SELECT '=== TABLAS EXISTENTES ===' as info;

SELECT 
    table_name as "Tabla",
    CASE 
        WHEN table_type = 'BASE TABLE' THEN 'Tabla'
        WHEN table_type = 'VIEW' THEN 'Vista'
        ELSE table_type
    END as "Tipo"
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- 2. VERIFICAR TABLAS IMPORTANTES
SELECT '=== VERIFICACIÓN DE TABLAS IMPORTANTES ===' as info;

SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'user_profiles'
        ) THEN '✅ user_profiles existe'
        ELSE '❌ user_profiles NO existe'
    END as "Estado"
UNION ALL
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'ejercicios'
        ) THEN '✅ ejercicios existe'
        ELSE '❌ ejercicios NO existe'
    END as "Estado"
UNION ALL
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'preguntas'
        ) THEN '✅ preguntas existe'
        ELSE '❌ preguntas NO existe'
    END as "Estado"
UNION ALL
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'versiones_preguntas'
        ) THEN '✅ versiones_preguntas existe'
        ELSE '❌ versiones_preguntas NO existe'
    END as "Estado"
UNION ALL
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'opciones'
        ) THEN '✅ opciones existe'
        ELSE '❌ opciones NO existe'
    END as "Estado"
UNION ALL
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'medios'
        ) THEN '✅ medios existe'
        ELSE '❌ medios NO existe'
    END as "Estado"
UNION ALL
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'etiquetas'
        ) THEN '✅ etiquetas existe'
        ELSE '❌ etiquetas NO existe'
    END as "Estado"
UNION ALL
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'banco_preguntas'
        ) THEN '✅ banco_preguntas existe'
        ELSE '❌ banco_preguntas NO existe'
    END as "Estado"
UNION ALL
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'temas_teoria'
        ) THEN '✅ temas_teoria existe'
        ELSE '❌ temas_teoria NO existe'
    END as "Estado"
UNION ALL
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'examenes'
        ) THEN '✅ examenes existe'
        ELSE '❌ examenes NO existe'
    END as "Estado"
UNION ALL
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'cursos'
        ) THEN '✅ cursos existe'
        ELSE '❌ cursos NO existe'
    END as "Estado"
UNION ALL
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'logros'
        ) THEN '✅ logros existe'
        ELSE '❌ logros NO existe'
    END as "Estado";

-- 3. RESUMEN SIMPLE
SELECT '=== RESUMEN ===' as info;

SELECT 
    'Total de tablas:' as metrica,
    COUNT(*)::text as valor
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE';
