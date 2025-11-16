-- Script para verificar la estructura de la tabla historialclinico

-- 1. Ver todas las columnas de la tabla historialclinico
SELECT 
  column_name, 
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'historialclinico' 
ORDER BY ordinal_position;

-- 2. Ver algunos registros existentes (si los hay)
SELECT * FROM public.historialclinico LIMIT 5;

-- 3. Ver los constraints de la tabla
SELECT 
  con.conname AS constraint_name,
  pg_get_constraintdef(con.oid) AS constraint_definition
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
WHERE rel.relname = 'historialclinico';
