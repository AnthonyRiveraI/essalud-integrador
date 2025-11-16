-- Script para agregar columnas faltantes a la tabla cita
-- Ejecutar en Supabase SQL Editor

-- 1. Agregar la columna codigo_boleta
ALTER TABLE public.cita 
ADD COLUMN IF NOT EXISTS codigo_boleta VARCHAR(50) UNIQUE;

-- 2. Agregar la columna hora (TIME)
ALTER TABLE public.cita 
ADD COLUMN IF NOT EXISTS hora TIME;

-- 3. Agregar la columna piso (INTEGER)
ALTER TABLE public.cita 
ADD COLUMN IF NOT EXISTS piso INTEGER;

-- 4. Agregar la columna puerta (VARCHAR)
ALTER TABLE public.cita 
ADD COLUMN IF NOT EXISTS puerta VARCHAR(10);

-- 5. Generar códigos de boleta para citas existentes (si las hay)
UPDATE public.cita
SET codigo_boleta = 'CITA-' || LPAD(id_cita::TEXT, 8, '0') || '-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 6))
WHERE codigo_boleta IS NULL;

-- 6. Verificar que se agregaron correctamente
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'cita' 
  AND column_name IN ('codigo_boleta', 'hora', 'piso', 'puerta');

-- 7. Ver la estructura completa de la tabla cita
SELECT 
  column_name, 
  data_type
FROM information_schema.columns 
WHERE table_name = 'cita' 
ORDER BY ordinal_position;

-- 8. Ver los constraints de la tabla cita (especialmente para 'estado' y 'tipo')
SELECT 
  con.conname AS constraint_name,
  pg_get_constraintdef(con.oid) AS constraint_definition
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
WHERE rel.relname = 'cita' 
  AND con.contype = 'c'; -- 'c' = check constraint

-- 9. Ver algunas citas con sus códigos de boleta
SELECT 
  id_cita,
  codigo_boleta,
  fecha,
  hora,
  piso,
  puerta,
  tipo,
  estado
FROM public.cita
LIMIT 5;
