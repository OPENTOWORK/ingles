-- ========================================
-- ANÁLISIS SIMPLE PASO A PASO
-- ========================================

-- 1. TODAS LAS TABLAS EXISTENTES
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
