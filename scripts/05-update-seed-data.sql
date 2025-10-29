-- Crear 10 pacientes adicionales (asegurados y no asegurados)
INSERT INTO usuarios (dni, email, password_hash, nombre, apellido, telefono, fecha_nacimiento, direccion, rol, tipo_asegurado) VALUES
('12345678', 'juan.garcia@email.com', 'Paciente123!', 'Juan', 'García', '987654321', '1985-03-15', 'Av. Principal 123', 'paciente', 'asegurado'),
('23456789', 'maria.lopez@email.com', 'Paciente123!', 'María', 'López', '987654322', '1990-07-22', 'Calle Secundaria 456', 'paciente', 'asegurado'),
('34567890', 'carlos.martinez@email.com', 'Paciente123!', 'Carlos', 'Martínez', '987654323', '1988-11-10', 'Av. Tercera 789', 'paciente', 'no_asegurado'),
('45678901', 'ana.rodriguez@email.com', 'Paciente123!', 'Ana', 'Rodríguez', '987654324', '1992-05-18', 'Calle Cuarta 321', 'paciente', 'asegurado'),
('56789012', 'luis.sanchez@email.com', 'Paciente123!', 'Luis', 'Sánchez', '987654325', '1987-09-25', 'Av. Quinta 654', 'paciente', 'asegurado'),
('67890123', 'sofia.torres@email.com', 'Paciente123!', 'Sofía', 'Torres', '987654326', '1995-01-30', 'Calle Sexta 987', 'paciente', 'no_asegurado'),
('78901235', 'diego.flores@email.com', 'Paciente123!', 'Diego', 'Flores', '987654327', '1989-04-12', 'Av. Séptima 111', 'paciente', 'asegurado'),
('89012346', 'laura.morales@email.com', 'Paciente123!', 'Laura', 'Morales', '987654328', '1993-08-20', 'Calle Octava 222', 'paciente', 'asegurado'),
('90123457', 'pedro.gutierrez@email.com', 'Paciente123!', 'Pedro', 'Gutiérrez', '987654329', '1986-12-05', 'Av. Novena 333', 'paciente', 'no_asegurado'),
('01234568', 'elena.vargas@email.com', 'Paciente123!', 'Elena', 'Vargas', '987654330', '1991-06-14', 'Calle Décima 444', 'paciente', 'asegurado');

-- Agregar 2 médicos por especialidad (Cardiología, Pediatría, Neurología, Dermatología)
-- Cardiología
INSERT INTO medicos (usuario_id, especialidad_id, numero_colegiatura, minutos_por_cita, max_citas_dia) 
SELECT id, 1, 'COL-CARD-002', 30, 20 FROM usuarios WHERE email = 'jperez@essalud.gob.pe';

INSERT INTO usuarios (email, password_hash, nombre, apellido, telefono, fecha_nacimiento, direccion, rol) 
VALUES ('rgarcia@essalud.gob.pe', 'Medico123!', 'Roberto', 'García', '987654331', '1980-02-10', 'Av. Médicos 100', 'medico');

INSERT INTO medicos (usuario_id, especialidad_id, numero_colegiatura, minutos_por_cita, max_citas_dia) 
SELECT id, 1, 'COL-CARD-003', 30, 20 FROM usuarios WHERE email = 'rgarcia@essalud.gob.pe';

-- Pediatría
INSERT INTO usuarios (email, password_hash, nombre, apellido, telefono, fecha_nacimiento, direccion, rol) 
VALUES ('mrodriguez@essalud.gob.pe', 'Medico123!', 'Mariana', 'Rodríguez', '987654332', '1982-05-15', 'Av. Médicos 101', 'medico');

INSERT INTO medicos (usuario_id, especialidad_id, numero_colegiatura, minutos_por_cita, max_citas_dia) 
SELECT id, 2, 'COL-PED-002', 25, 20 FROM usuarios WHERE email = 'mrodriguez@essalud.gob.pe';

INSERT INTO usuarios (email, password_hash, nombre, apellido, telefono, fecha_nacimiento, direccion, rol) 
VALUES ('alopez@essalud.gob.pe', 'Medico123!', 'Andrés', 'López', '987654333', '1981-08-20', 'Av. Médicos 102', 'medico');

INSERT INTO medicos (usuario_id, especialidad_id, numero_colegiatura, minutos_por_cita, max_citas_dia) 
SELECT id, 2, 'COL-PED-003', 25, 20 FROM usuarios WHERE email = 'alopez@essalud.gob.pe';

-- Neurología
INSERT INTO usuarios (email, password_hash, nombre, apellido, telefono, fecha_nacimiento, direccion, rol) 
VALUES ('csanchez@essalud.gob.pe', 'Medico123!', 'Carlos', 'Sánchez', '987654334', '1979-11-25', 'Av. Médicos 103', 'medico');

INSERT INTO medicos (usuario_id, especialidad_id, numero_colegiatura, minutos_por_cita, max_citas_dia) 
SELECT id, 3, 'COL-NEUR-002', 35, 20 FROM usuarios WHERE email = 'csanchez@essalud.gob.pe';

INSERT INTO usuarios (email, password_hash, nombre, apellido, telefono, fecha_nacimiento, direccion, rol) 
VALUES ('dtorres@essalud.gob.pe', 'Medico123!', 'Diana', 'Torres', '987654335', '1983-03-30', 'Av. Médicos 104', 'medico');

INSERT INTO medicos (usuario_id, especialidad_id, numero_colegiatura, minutos_por_cita, max_citas_dia) 
SELECT id, 3, 'COL-NEUR-003', 35, 20 FROM usuarios WHERE email = 'dtorres@essalud.gob.pe';

-- Dermatología
INSERT INTO usuarios (email, password_hash, nombre, apellido, telefono, fecha_nacimiento, direccion, rol) 
VALUES ('eflores@essalud.gob.pe', 'Medico123!', 'Enrique', 'Flores', '987654336', '1980-07-12', 'Av. Médicos 105', 'medico');

INSERT INTO medicos (usuario_id, especialidad_id, numero_colegiatura, minutos_por_cita, max_citas_dia) 
SELECT id, 4, 'COL-DERM-002', 20, 20 FROM usuarios WHERE email = 'eflores@essalud.gob.pe';

INSERT INTO usuarios (email, password_hash, nombre, apellido, telefono, fecha_nacimiento, direccion, rol) 
VALUES ('fmorales@essalud.gob.pe', 'Medico123!', 'Fernanda', 'Morales', '987654337', '1984-09-18', 'Av. Médicos 106', 'medico');

INSERT INTO medicos (usuario_id, especialidad_id, numero_colegiatura, minutos_por_cita, max_citas_dia) 
SELECT id, 4, 'COL-DERM-003', 20, 20 FROM usuarios WHERE email = 'fmorales@essalud.gob.pe';

-- Agregar 4 médicos de emergencia
INSERT INTO usuarios (email, password_hash, nombre, apellido, telefono, fecha_nacimiento, direccion, rol) 
VALUES 
('emergencia1@essalud.gob.pe', 'Medico123!', 'Víctor', 'Mendoza', '987654338', '1978-01-05', 'Av. Médicos 107', 'medico'),
('emergencia2@essalud.gob.pe', 'Medico123!', 'Patricia', 'Castillo', '987654339', '1981-04-22', 'Av. Médicos 108', 'medico'),
('emergencia3@essalud.gob.pe', 'Medico123!', 'Raúl', 'Jiménez', '987654340', '1979-06-10', 'Av. Médicos 109', 'medico'),
('emergencia4@essalud.gob.pe', 'Medico123!', 'Gabriela', 'Romero', '987654341', '1982-10-28', 'Av. Médicos 110', 'medico');

-- Crear especialidad de Emergencia si no existe
INSERT INTO especialidades (nombre, descripcion) VALUES ('Emergencia', 'Atención de emergencias médicas') ON CONFLICT DO NOTHING;

-- Asignar médicos de emergencia
INSERT INTO medicos (usuario_id, especialidad_id, numero_colegiatura, minutos_por_cita, max_citas_dia) 
SELECT id, (SELECT id FROM especialidades WHERE nombre = 'Emergencia'), 'COL-EMERG-001', 15, 30 FROM usuarios WHERE email = 'emergencia1@essalud.gob.pe';

INSERT INTO medicos (usuario_id, especialidad_id, numero_colegiatura, minutos_por_cita, max_citas_dia) 
SELECT id, (SELECT id FROM especialidades WHERE nombre = 'Emergencia'), 'COL-EMERG-002', 15, 30 FROM usuarios WHERE email = 'emergencia2@essalud.gob.pe';

INSERT INTO medicos (usuario_id, especialidad_id, numero_colegiatura, minutos_por_cita, max_citas_dia) 
SELECT id, (SELECT id FROM especialidades WHERE nombre = 'Emergencia'), 'COL-EMERG-003', 15, 30 FROM usuarios WHERE email = 'emergencia3@essalud.gob.pe';

INSERT INTO medicos (usuario_id, especialidad_id, numero_colegiatura, minutos_por_cita, max_citas_dia) 
SELECT id, (SELECT id FROM especialidades WHERE nombre = 'Emergencia'), 'COL-EMERG-004', 15, 30 FROM usuarios WHERE email = 'emergencia4@essalud.gob.pe';

-- Agregar 3 asistentes de enfermería adicionales
INSERT INTO usuarios (email, password_hash, nombre, apellido, telefono, fecha_nacimiento, direccion, rol) 
VALUES 
('enfermera2@essalud.gob.pe', 'Enfermera123!', 'Beatriz', 'Mendoza', '987654342', '1985-02-14', 'Av. Enfermeras 101', 'asistente_enfermeria'),
('enfermera3@essalud.gob.pe', 'Enfermera123!', 'Claudia', 'Navarro', '987654343', '1988-05-20', 'Av. Enfermeras 102', 'asistente_enfermeria'),
('enfermera4@essalud.gob.pe', 'Enfermera123!', 'Daniela', 'Ortiz', '987654344', '1986-08-09', 'Av. Enfermeras 103', 'asistente_enfermeria');

-- Crear 20 camas de emergencia
INSERT INTO camas_emergencia (numero_cama, piso, estado) VALUES
(1, 1, 'disponible'), (2, 1, 'disponible'), (3, 1, 'disponible'), (4, 1, 'disponible'), (5, 1, 'disponible'),
(6, 2, 'disponible'), (7, 2, 'disponible'), (8, 2, 'disponible'), (9, 2, 'disponible'), (10, 2, 'disponible'),
(11, 3, 'disponible'), (12, 3, 'disponible'), (13, 3, 'disponible'), (14, 3, 'disponible'), (15, 3, 'disponible'),
(16, 4, 'disponible'), (17, 4, 'disponible'), (18, 4, 'disponible'), (19, 4, 'disponible'), (20, 4, 'disponible');
