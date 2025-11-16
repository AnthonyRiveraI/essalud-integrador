-- Script para verificar y arreglar acceso a camas_emergencia

-- 1. Verificar estado actual de RLS
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_habilitado
FROM pg_tables
WHERE tablename = 'camas_emergencia';

-- 2. DESACTIVAR RLS completamente
ALTER TABLE camas_emergencia DISABLE ROW LEVEL SECURITY;

-- 3. Eliminar TODAS las políticas
DROP POLICY IF EXISTS "Permitir lectura de camas a todos" ON camas_emergencia;
DROP POLICY IF EXISTS "Permitir inserción a usuarios autenticados" ON camas_emergencia;
DROP POLICY IF EXISTS "Permitir actualización a usuarios autenticados" ON camas_emergencia;
DROP POLICY IF EXISTS "Permitir eliminación a administradores" ON camas_emergencia;
DROP POLICY IF EXISTS "Enable read access for all users" ON camas_emergencia;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON camas_emergencia;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON camas_emergencia;

-- 4. Verificar que NO hay políticas
SELECT 
  policyname,
  tablename
FROM pg_policies
WHERE tablename = 'camas_emergencia';

-- 5. Verificar datos en la tabla
SELECT 
  id_cama,
  numero_cama,
  piso,
  estado,
  id_triaje
FROM camas_emergencia
ORDER BY numero_cama;

-- 6. Contar por estado
SELECT 
  estado,
  COUNT(*) as total
FROM camas_emergencia
GROUP BY estado;

-- 7. Verificar RLS está OFF
SELECT 
  relname as tabla,
  relrowsecurity as rls_habilitado,
  relforcerowsecurity as rls_forzado
FROM pg_class
WHERE relname = 'camas_emergencia';

-- Resultado esperado:
-- rls_habilitado: false
-- rls_forzado: false
-- 20 camas con estado 'disponible'
