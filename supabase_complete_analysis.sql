-- ========================================
-- ANÁLISIS COMPLETO DE SUPABASE
-- ========================================
-- Este script me dará TODA la información necesaria

-- 1. TODAS LAS TABLAS EXISTENTES
SELECT 'TABLAS EXISTENTES' as info;
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

-- 2. ESTRUCTURA DE CADA TABLA
SELECT 'ESTRUCTURA DE TABLAS' as info;
SELECT 
    t.table_name as "Tabla",
    c.column_name as "Columna",
    c.data_type as "Tipo",
    c.is_nullable as "Nulo",
    c.column_default as "Default",
    CASE WHEN pk.column_name IS NOT NULL THEN 'PK' ELSE '' END as "Clave"
FROM information_schema.tables t
JOIN information_schema.columns c ON t.table_name = c.table_name
LEFT JOIN (
    SELECT ku.table_name, ku.column_name
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage ku 
        ON tc.constraint_name = ku.constraint_name
    WHERE tc.constraint_type = 'PRIMARY KEY'
    AND tc.table_schema = 'public'
) pk ON t.table_name = pk.table_name AND c.column_name = pk.column_name
WHERE t.table_schema = 'public' 
AND t.table_type = 'BASE TABLE'
ORDER BY t.table_name, c.ordinal_position;

-- 3. RELACIONES (FOREIGN KEYS)
SELECT 'RELACIONES EXISTENTES' as info;
SELECT 
    tc.table_name as "Tabla",
    kcu.column_name as "Columna",
    ccu.table_name as "Tabla_Referenciada",
    ccu.column_name as "Columna_Referenciada",
    tc.constraint_name as "Nombre_Constraint"
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu 
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
AND tc.table_schema = 'public'
ORDER BY tc.table_name, kcu.column_name;

-- 4. ÍNDICES EXISTENTES
SELECT 'ÍNDICES EXISTENTES' as info;
SELECT 
    schemaname as "Esquema",
    tablename as "Tabla",
    indexname as "Índice",
    indexdef as "Definición"
FROM pg_indexes 
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- 5. POLÍTICAS RLS
SELECT 'POLÍTICAS RLS' as info;
SELECT 
    schemaname as "Esquema",
    tablename as "Tabla",
    policyname as "Política",
    permissive as "Permisiva",
    roles as "Roles",
    cmd as "Comando",
    qual as "Condición",
    with_check as "Con_Check"
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 6. FUNCIONES EXISTENTES
SELECT 'FUNCIONES EXISTENTES' as info;
SELECT 
    routine_name as "Función",
    routine_type as "Tipo",
    data_type as "Tipo_Retorno"
FROM information_schema.routines 
WHERE routine_schema = 'public'
ORDER BY routine_name;

-- 7. TRIGGERS EXISTENTES
SELECT 'TRIGGERS EXISTENTES' as info;
SELECT 
    trigger_name as "Trigger",
    event_manipulation as "Evento",
    event_object_table as "Tabla",
    action_timing as "Momento",
    action_statement as "Acción"
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- 8. VISTAS EXISTENTES
SELECT 'VISTAS EXISTENTES' as info;
SELECT 
    table_name as "Vista",
    view_definition as "Definición"
FROM information_schema.views 
WHERE table_schema = 'public'
ORDER BY table_name;

-- 9. DATOS DE EJEMPLO (primeras 3 filas de cada tabla)
SELECT 'DATOS DE EJEMPLO' as info;

-- Para cada tabla, mostrar algunas filas
DO $$
DECLARE
    rec RECORD;
    query_text TEXT;
BEGIN
    FOR rec IN 
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
        ORDER BY table_name
    LOOP
        query_text := format('SELECT ''%s'' as tabla, count(*) as total_filas FROM public.%I', 
                           rec.table_name, rec.table_name);
        EXECUTE query_text;
    END LOOP;
END $$;
