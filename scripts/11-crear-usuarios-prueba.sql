-- Script para crear usuarios de prueba para cada rol

-- IMPORTANTE: Ejecutar este script en Supabase SQL Editor

-- 1. Limpiar usuarios de prueba anteriores (opcional)
DELETE FROM public.medico WHERE id_medico IN (SELECT id_usuario FROM public.usuario WHERE correo LIKE '%@test.com');
DELETE FROM public.paciente WHERE id_paciente IN (SELECT id_usuario FROM public.usuario WHERE correo LIKE '%@test.com');
DELETE FROM public.usuario WHERE correo LIKE '%@test.com';

-- 2. Crear usuarios de prueba
-- PACIENTE
INSERT INTO public.usuario (nombre, apellido, correo, password, rol, dni)
VALUES ('Juan', 'Pérez', 'paciente@test.com', '12345678', 'Paciente', 12345678)
RETURNING id_usuario;

-- Obtener el ID del paciente recién creado
DO $$
DECLARE
  v_usuario_id INTEGER;
BEGIN
  SELECT id_usuario INTO v_usuario_id 
  FROM public.usuario 
  WHERE correo = 'paciente@test.com';
  
  -- Crear registro en tabla paciente
  INSERT INTO public.paciente (id_paciente, dni, fecha_nacimiento, telefono, direccion)
  VALUES (v_usuario_id, '12345678', '1990-01-01', '987654321', 'Av. Test 123');
END $$;

-- MÉDICO
INSERT INTO public.usuario (nombre, apellido, correo, password, rol, dni)
VALUES ('María', 'García', 'medico@test.com', '12345678', 'Medico', 23456789)
RETURNING id_usuario;

-- Crear registro en tabla medico
DO $$
DECLARE
  v_usuario_id INTEGER;
BEGIN
  SELECT id_usuario INTO v_usuario_id 
  FROM public.usuario 
  WHERE correo = 'medico@test.com';
  
  INSERT INTO public.medico (id_medico, especialidad, max_pacientes_dia)
  VALUES (v_usuario_id, 'Medicina General', 20);
END $$;

-- MÉDICO DE EMERGENCIA (para el módulo de emergencias)
INSERT INTO public.usuario (nombre, apellido, correo, password, rol, dni)
VALUES ('Carlos', 'Ramírez', 'emergencia@test.com', '12345678', 'Medico', 34567890)
RETURNING id_usuario;

-- Crear registro en tabla medico con especialidad Emergencia
DO $$
DECLARE
  v_usuario_id INTEGER;
BEGIN
  SELECT id_usuario INTO v_usuario_id 
  FROM public.usuario 
  WHERE correo = 'emergencia@test.com';
  
  INSERT INTO public.medico (id_medico, especialidad, max_pacientes_dia)
  VALUES (v_usuario_id, 'Emergencia', 30);
END $$;

-- ASISTENTE DE ENFERMERÍA
INSERT INTO public.usuario (nombre, apellido, correo, password, rol, dni)
VALUES ('Ana', 'López', 'asistente@test.com', '12345678', 'AsistenteEnfermeria', 45678901);

-- ADMINISTRADOR
INSERT INTO public.usuario (nombre, apellido, correo, password, rol, dni)
VALUES ('Admin', 'Sistema', 'admin@test.com', '12345678', 'Administrador', 56789012);

-- 3. Verificar usuarios creados
SELECT 
  u.id_usuario,
  u.nombre,
  u.apellido,
  u.correo,
  u.password,
  u.rol,
  u.dni,
  CASE 
    WHEN p.id_paciente IS NOT NULL THEN 'Tiene registro en paciente ✓'
    WHEN m.id_medico IS NOT NULL THEN 'Tiene registro en médico ✓'
    ELSE 'Solo en usuario'
  END as estado_registro
FROM public.usuario u
LEFT JOIN public.paciente p ON u.id_usuario = p.id_paciente
LEFT JOIN public.medico m ON u.id_usuario = m.id_medico
WHERE u.correo LIKE '%@test.com'
ORDER BY u.rol, u.nombre;

-- CREDENCIALES PARA PROBAR:
-- ================================
-- PACIENTE:
--   Correo: paciente@test.com
--   DNI: 12345678
--   Password: 12345678
--
-- MÉDICO:
--   Correo: medico@test.com
--   DNI: 23456789
--   Password: 12345678
--
-- MÉDICO EMERGENCIA:
--   Correo: emergencia@test.com
--   DNI: 34567890
--   Password: 12345678
--
-- ASISTENTE:
--   Correo: asistente@test.com
--   DNI: 45678901
--   Password: 12345678
--
-- ADMINISTRADOR:
--   Correo: admin@test.com
--   DNI: 56789012
--   Password: 12345678
