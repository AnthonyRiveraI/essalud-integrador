-- Script para verificar el estado de la tabla camas_emergencia

-- 1. Verificar si la tabla existe
SELECT 
  table_name,
  table_type
FROM information_schema.tables
WHERE table_schema = 'public' 
  AND table_name = 'camas_emergencia';

-- 2. Verificar estado de RLS
SELECT 
  relname as tabla,
  relrowsecurity as rls_habilitado,
  relforcerowsecurity as rls_forzado
FROM pg_class
WHERE relname = 'camas_emergencia';

-- 3. Ver TODAS las camas (sin filtros)
SELECT 
  id_cama,
  numero_cama,
  piso,
  estado,
  id_triaje,
  fecha_ocupacion
FROM camas_emergencia
ORDER BY numero_cama;

-- 4. Contar camas por estado
SELECT 
  estado,
  COUNT(*) as cantidad
FROM camas_emergencia
GROUP BY estado;

-- 5. Ver políticas RLS activas
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  cmd
FROM pg_policies
WHERE tablename = 'camas_emergencia';
