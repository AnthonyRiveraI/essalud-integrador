-- Insertar especialidades médicas
INSERT INTO especialidades (nombre, descripcion) VALUES
  ('Medicina General', 'Atención médica general y preventiva'),
  ('Cardiología', 'Especialidad del corazón y sistema circulatorio'),
  ('Pediatría', 'Atención médica para niños y adolescentes'),
  ('Traumatología', 'Tratamiento de lesiones y enfermedades del sistema musculoesquelético'),
  ('Ginecología', 'Salud reproductiva femenina'),
  ('Dermatología', 'Enfermedades de la piel'),
  ('Oftalmología', 'Enfermedades de los ojos'),
  ('Neurología', 'Enfermedades del sistema nervioso'),
  ('Psiquiatría', 'Salud mental'),
  ('Emergencia', 'Atención de urgencias y emergencias')
ON CONFLICT (nombre) DO NOTHING;

-- Actualizar usuarios con contraseñas en texto plano para que funcione el login
-- USUARIOS PREDEFINIDOS PARA EL SISTEMA (Solo pueden iniciar sesión, no registrarse)

-- Administrador: admin@essalud.gob.pe / Admin123!
INSERT INTO usuarios (dni, email, password_hash, nombre, apellido, rol) VALUES
  ('12345678', 'admin@essalud.gob.pe', 'Admin123!', 'Carlos', 'Administrador Sistema', 'administrador')
ON CONFLICT (dni) DO NOTHING;

-- Médicos: Contraseña para todos: Medico123!
INSERT INTO usuarios (dni, email, password_hash, nombre, apellido, telefono, rol) VALUES
  ('23456789', 'jperez@essalud.gob.pe', 'Medico123!', 'Juan Carlos', 'Pérez García', '987654321', 'medico'),
  ('34567890', 'mrodriguez@essalud.gob.pe', 'Medico123!', 'María Elena', 'Rodríguez López', '987654322', 'medico'),
  ('45678901', 'cgomez@essalud.gob.pe', 'Medico123!', 'Carlos Alberto', 'Gómez Silva', '987654323', 'medico'),
  ('56789012', 'lmartinez@essalud.gob.pe', 'Medico123!', 'Laura Patricia', 'Martínez Torres', '987654324', 'medico')
ON CONFLICT (dni) DO NOTHING;

-- Asistente de Enfermería: Contraseña para todos: Enfermera123!
INSERT INTO usuarios (dni, email, password_hash, nombre, apellido, telefono, rol) VALUES
  ('67890123', 'asistente@essalud.gob.pe', 'Enfermera123!', 'Ana María', 'Flores Quispe', '987654325', 'asistente_enfermeria'),
  ('67890124', 'rlopez@essalud.gob.pe', 'Enfermera123!', 'Rosa Elena', 'López Mendoza', '987654326', 'asistente_enfermeria')
ON CONFLICT (dni) DO NOTHING;

-- Pacientes de ejemplo: Contraseña para todos: Paciente123!
INSERT INTO usuarios (dni, email, password_hash, nombre, apellido, telefono, fecha_nacimiento, direccion, rol) VALUES
  ('78901234', 'pedro.sanchez@example.com', 'Paciente123!', 'Pedro Antonio', 'Sánchez Vargas', '987654327', '1990-05-15', 'Av. Principal 123, Lima', 'paciente'),
  ('78901235', 'lucia.torres@example.com', 'Paciente123!', 'Lucía Isabel', 'Torres Ramírez', '987654328', '1985-08-22', 'Jr. Los Olivos 456, Lima', 'paciente'),
  ('78901236', 'miguel.castro@example.com', 'Paciente123!', 'Miguel Ángel', 'Castro Fernández', '987654329', '1978-12-10', 'Av. Los Pinos 789, Lima', 'paciente')
ON CONFLICT (dni) DO NOTHING;

-- Insertar médicos en la tabla de médicos
INSERT INTO medicos (usuario_id, especialidad_id, numero_colegiatura, minutos_por_cita, max_citas_dia)
SELECT u.id, e.id, 'CMP-' || u.dni, 30, 20
FROM usuarios u
CROSS JOIN especialidades e
WHERE u.dni IN ('23456789', '34567890', '45678901', '56789012')
  AND e.nombre IN ('Medicina General', 'Cardiología', 'Pediatría', 'Emergencia')
  AND u.dni = CASE 
    WHEN e.nombre = 'Medicina General' THEN '23456789'
    WHEN e.nombre = 'Cardiología' THEN '34567890'
    WHEN e.nombre = 'Pediatría' THEN '45678901'
    WHEN e.nombre = 'Emergencia' THEN '56789012'
  END
ON CONFLICT DO NOTHING;

-- Insertar horarios para los médicos (Lunes a Viernes, 8:00 - 17:00)
INSERT INTO horarios_medicos (medico_id, dia_semana, hora_inicio, hora_fin)
SELECT m.id, d.dia, '08:00:00', '17:00:00'
FROM medicos m
CROSS JOIN (SELECT generate_series(1, 5) AS dia) d
ON CONFLICT DO NOTHING;

-- Insertar 30 camas de emergencia
INSERT INTO camas_emergencia (numero_cama, piso, estado)
SELECT generate_series(1, 30), 1, 'disponible'
ON CONFLICT (numero_cama) DO NOTHING;
