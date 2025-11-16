-- Script de diagnóstico para verificar el estado de las camas de emergencia

-- 1. Verificar que la tabla existe
SELECT 
  tablename,
  schemaname,
  tableowner
FROM pg_tables
WHERE tablename = 'camas_emergencia';

-- 2. Verificar estructura de la tabla
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'camas_emergencia'
ORDER BY ordinal_position;

-- 3. Contar todas las camas
SELECT 
  COUNT(*) as total_camas
FROM camas_emergencia;

-- 4. Ver todas las camas con su estado
SELECT 
  id_cama,
  numero_cama,
  piso,
  estado,
  id_triaje,
  fecha_ocupacion,
  created_at
FROM camas_emergencia
ORDER BY numero_cama;

-- 5. Contar camas por estado
SELECT 
  estado,
  COUNT(*) as cantidad
FROM camas_emergencia
GROUP BY estado
ORDER BY estado;

-- 6. Verificar políticas RLS
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename = 'camas_emergencia';

-- 7. Verificar si RLS está habilitado
SELECT 
  relname as table_name,
  relrowsecurity as rls_enabled,
  relforcerowsecurity as rls_forced
FROM pg_class
WHERE relname = 'camas_emergencia';

-- 8. Ver índices de la tabla
SELECT
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'camas_emergencia';

-- 9. Verificar camas disponibles (query exacta del frontend)
SELECT 
  *
FROM camas_emergencia
WHERE estado = 'disponible';

-- 10. Verificar si hay foreign keys problemáticas
SELECT
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name = 'camas_emergencia'
  AND tc.constraint_type = 'FOREIGN KEY';

-- RESULTADO ESPERADO:
-- - La tabla debe existir
-- - Debe tener 20 filas
-- - Todas deben estar en estado 'disponible' (si no hay emergencias activas)
-- - RLS debe estar habilitado con políticas de lectura pública
