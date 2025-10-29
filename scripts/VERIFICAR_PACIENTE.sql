-- Script para verificar datos del paciente y médico

-- 1. Verificar si existe el paciente con DNI 72794662
SELECT 
  id,
  nombre,
  apellido,
  dni,
  rol,
  email
FROM usuarios 
WHERE dni = '72794662';

-- 2. Verificar el médico actual
SELECT 
  id,
  nombre,
  apellido,
  dni,
  rol,
  email
FROM usuarios 
WHERE id = '99381b0a-bc1e-4487-b02b-9e6912432ebc';

-- 3. Verificar si hay algún historial clínico para este médico
SELECT 
  hc.id,
  hc.fecha,
  hc.diagnostico,
  p.nombre AS paciente_nombre,
  p.apellido AS paciente_apellido,
  p.dni AS paciente_dni,
  e.nombre AS especialidad
FROM historial_clinico hc
JOIN usuarios p ON hc.paciente_id = p.id
JOIN especialidades e ON hc.especialidad_id = e.id
WHERE hc.medico_id = '99381b0a-bc1e-4487-b02b-9e6912432ebc'
ORDER BY hc.fecha DESC;

-- 4. Verificar citas del médico
SELECT 
  c.id,
  c.fecha,
  c.hora,
  c.estado,
  c.atendido,
  p.nombre AS paciente_nombre,
  p.apellido AS paciente_apellido,
  p.dni AS paciente_dni,
  e.nombre AS especialidad
FROM citas c
JOIN usuarios p ON c.paciente_id = p.id
JOIN especialidades e ON c.especialidad_id = e.id
WHERE c.medico_id = '99381b0a-bc1e-4487-b02b-9e6912432ebc'
ORDER BY c.fecha DESC, c.hora DESC;

-- 5. Listar todos los pacientes registrados
SELECT 
  id,
  nombre,
  apellido,
  dni,
  email,
  telefono
FROM usuarios 
WHERE rol = 'paciente'
ORDER BY nombre, apellido;

-- 6. Verificar RLS (Row Level Security) en la tabla usuarios
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'usuarios';
