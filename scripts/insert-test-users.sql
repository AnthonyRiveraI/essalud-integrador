-- Insert test users for the ESSALUD system
-- These users are for testing purposes only

-- 1. Patient user
INSERT INTO usuarios (id, email, password_hash, nombre, apellido, dni, telefono, direccion, rol, fecha_nacimiento, tipo_asegurado, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'juan.perez@example.com',
  'password123',
  'Juan',
  'Pérez',
  '12345678',
  '987654321',
  'Calle Principal 123, Lima',
  'paciente',
  '1990-05-15',
  'SIS',
  NOW(),
  NOW()
);

-- 2. Doctor user
INSERT INTO usuarios (id, email, password_hash, nombre, apellido, dni, telefono, direccion, rol, fecha_nacimiento, tipo_asegurado, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'dr.garcia@example.com',
  'password123',
  'Carlos',
  'García',
  '87654321',
  '987654322',
  'Calle Médica 456, Lima',
  'medico',
  '1985-03-20',
  'PRIVADO',
  NOW(),
  NOW()
);

-- 3. Administrator user
INSERT INTO usuarios (id, email, password_hash, nombre, apellido, dni, telefono, direccion, rol, fecha_nacimiento, tipo_asegurado, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'admin@example.com',
  'password123',
  'María',
  'López',
  '11111111',
  '987654323',
  'Calle Administrativa 789, Lima',
  'administrador',
  '1988-07-10',
  'PRIVADO',
  NOW(),
  NOW()
);

-- 4. Assistant user
INSERT INTO usuarios (id, email, password_hash, nombre, apellido, dni, telefono, direccion, rol, fecha_nacimiento, tipo_asegurado, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'asistente@example.com',
  'password123',
  'Roberto',
  'Martínez',
  '22222222',
  '987654324',
  'Calle Asistencia 321, Lima',
  'asistente',
  '1992-11-25',
  'PRIVADO',
  NOW(),
  NOW()
);

-- Verify the users were inserted
SELECT id, email, nombre, apellido, rol FROM usuarios WHERE email IN ('juan.perez@example.com', 'dr.garcia@example.com', 'admin@example.com', 'asistente@example.com');
