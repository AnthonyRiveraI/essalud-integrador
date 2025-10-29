-- Agregar campos para estado de paciente, tipo de asegurado y fecha de muerte
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS tipo_asegurado VARCHAR(50) DEFAULT 'asegurado' CHECK (tipo_asegurado IN ('asegurado', 'no_asegurado'));

-- Agregar campos de estado del paciente en triaje
ALTER TABLE triaje ADD COLUMN IF NOT EXISTS estado_paciente VARCHAR(50) DEFAULT 'estable' CHECK (estado_paciente IN ('estable', 'en_coma', 'en_rehabilitacion', 'de_alta', 'fallecido'));
ALTER TABLE triaje ADD COLUMN IF NOT EXISTS fecha_muerte TIMESTAMP WITH TIME ZONE;

-- Agregar campo para marcar citas como atendidas
ALTER TABLE citas ADD COLUMN IF NOT EXISTS atendido BOOLEAN DEFAULT false;

-- Aumentar camas de emergencia de 20 a 20 (ya está bien, pero asegurar que existan)
-- Las camas se crearán en el seed data

-- Agregar índices para búsquedas frecuentes
CREATE INDEX IF NOT EXISTS idx_usuarios_tipo_asegurado ON usuarios(tipo_asegurado);
CREATE INDEX IF NOT EXISTS idx_triaje_estado_paciente ON triaje(estado_paciente);
CREATE INDEX IF NOT EXISTS idx_citas_atendido ON citas(atendido);
