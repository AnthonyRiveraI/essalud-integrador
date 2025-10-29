-- Agregar campos necesarios para integrar emergencias con especialidad y médico
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS tipo_asegurado VARCHAR(20) DEFAULT 'asegurado' CHECK (tipo_asegurado IN ('asegurado', 'no_asegurado'));

ALTER TABLE triaje ADD COLUMN IF NOT EXISTS especialidad_id INTEGER REFERENCES especialidades(id);
ALTER TABLE triaje ADD COLUMN IF NOT EXISTS medico_id UUID REFERENCES medicos(id);
ALTER TABLE triaje ADD COLUMN IF NOT EXISTS estado_paciente VARCHAR(50) DEFAULT 'estable' CHECK (estado_paciente IN ('estable', 'en_coma', 'en_rehabilitacion', 'de_alta', 'fallecido'));
ALTER TABLE triaje ADD COLUMN IF NOT EXISTS fecha_muerte DATE;

-- Crear especialidad de Emergencia si no existe
INSERT INTO especialidades (nombre, descripcion) 
VALUES ('Emergencia', 'Servicio de Emergencias y Atención Crítica')
ON CONFLICT (nombre) DO NOTHING;
