-- Verificar médicos y especialidades en la base de datos
-- Ejecuta estas queries en Supabase SQL Editor para diagnosticar el problema

-- 1. Ver todas las especialidades (excepto Emergencia)
SELECT id, nombre, descripcion 
FROM especialidades 
WHERE nombre != 'Emergencia'
ORDER BY nombre;

-- 2. Ver todos los médicos con sus especialidades
SELECT 
    m.id as medico_id,
    u.nombre,
    u.apellido,
    e.nombre as especialidad,
    m.especialidad_id,
    m.max_citas_dia
FROM medicos m
INNER JOIN usuarios u ON m.usuario_id = u.id
INNER JOIN especialidades e ON m.especialidad_id = e.id
ORDER BY e.nombre, u.apellido;

-- 3. Contar médicos por especialidad
SELECT 
    e.nombre as especialidad,
    COUNT(m.id) as cantidad_medicos
FROM especialidades e
LEFT JOIN medicos m ON e.id = m.especialidad_id
WHERE e.nombre != 'Emergencia'
GROUP BY e.id, e.nombre
ORDER BY e.nombre;

-- 4. Ver horarios de médicos
SELECT 
    m.id as medico_id,
    u.nombre || ' ' || u.apellido as medico,
    e.nombre as especialidad,
    hm.dia_semana,
    hm.hora_inicio,
    hm.hora_fin,
    hm.activo
FROM horarios_medicos hm
INNER JOIN medicos m ON hm.medico_id = m.id
INNER JOIN usuarios u ON m.usuario_id = u.id
INNER JOIN especialidades e ON m.especialidad_id = e.id
WHERE hm.activo = true
ORDER BY e.nombre, u.apellido, hm.dia_semana;

-- SOLUCIÓN: Si no hay médicos, ejecutar estos INSERT
-- (Descomenta y ajusta según tu estructura de datos)

/*
-- Primero verifica el ID de una especialidad, por ejemplo Cardiología
SELECT id FROM especialidades WHERE nombre = 'Cardiología';

-- Luego verifica el usuario_id de un médico existente
SELECT id, nombre, apellido FROM usuarios WHERE rol = 'medico';

-- Inserta un médico en la especialidad (reemplaza los UUIDs)
INSERT INTO medicos (usuario_id, especialidad_id, max_citas_dia)
VALUES (
    'UUID-DEL-USUARIO-MEDICO',
    'UUID-DE-LA-ESPECIALIDAD',
    10
);

-- Agregar horarios para el médico (0=Domingo, 1=Lunes, ..., 6=Sábado)
INSERT INTO horarios_medicos (medico_id, dia_semana, hora_inicio, hora_fin, activo)
VALUES 
    ('UUID-DEL-MEDICO', 1, '08:00', '12:00', true), -- Lunes mañana
    ('UUID-DEL-MEDICO', 1, '14:00', '18:00', true), -- Lunes tarde
    ('UUID-DEL-MEDICO', 2, '08:00', '12:00', true), -- Martes mañana
    ('UUID-DEL-MEDICO', 3, '08:00', '12:00', true), -- Miércoles mañana
    ('UUID-DEL-MEDICO', 4, '08:00', '12:00', true), -- Jueves mañana
    ('UUID-DEL-MEDICO', 5, '08:00', '12:00', true); -- Viernes mañana
*/
