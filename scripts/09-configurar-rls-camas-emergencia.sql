-- Script para DESACTIVAR RLS en camas_emergencia (para desarrollo/pruebas)

-- DESACTIVAR RLS completamente
ALTER TABLE camas_emergencia DISABLE ROW LEVEL SECURITY;

-- Eliminar todas las políticas existentes si las hay
DROP POLICY IF EXISTS "Permitir lectura de camas a todos" ON camas_emergencia;
DROP POLICY IF EXISTS "Permitir inserción a usuarios autenticados" ON camas_emergencia;
DROP POLICY IF EXISTS "Permitir actualización a usuarios autenticados" ON camas_emergencia;
DROP POLICY IF EXISTS "Permitir eliminación a administradores" ON camas_emergencia;

-- Verificar que RLS está desactivado
SELECT 
  relname as tabla,
  relrowsecurity as rls_habilitado
FROM pg_class
WHERE relname = 'camas_emergencia';

-- Verificar camas disponibles
SELECT 
  id_cama,
  numero_cama,
  piso,
  estado,
  id_triaje,
  fecha_ocupacion
FROM camas_emergencia
ORDER BY numero_cama;
