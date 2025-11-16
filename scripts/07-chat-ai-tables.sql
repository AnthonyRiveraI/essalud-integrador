-- =====================================================
-- SCRIPT: Tablas para Chatbot Médico con IA
-- Fecha: 2025-01-16
-- Descripción: Crear tablas para conversaciones, mensajes
--              y recomendaciones médicas del chatbot
-- =====================================================

-- Tabla: Conversaciones del chat
CREATE TABLE IF NOT EXISTS conversacion_chat (
  id_conversacion SERIAL PRIMARY KEY,
  id_paciente INTEGER NOT NULL REFERENCES paciente(id_paciente) ON DELETE CASCADE,
  fecha_inicio TIMESTAMP DEFAULT NOW(),
  fecha_ultimo_mensaje TIMESTAMP DEFAULT NOW(),
  estado VARCHAR(20) DEFAULT 'activa' CHECK (estado IN ('activa', 'cerrada', 'archivada')),
  resumen TEXT, -- Resumen generado por IA al cerrar conversación
  cita_generada INTEGER REFERENCES cita(id_cita),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla: Mensajes del chat
CREATE TABLE IF NOT EXISTS mensaje_chat (
  id_mensaje SERIAL PRIMARY KEY,
  id_conversacion INTEGER NOT NULL REFERENCES conversacion_chat(id_conversacion) ON DELETE CASCADE,
  rol VARCHAR(20) NOT NULL CHECK (rol IN ('user', 'assistant', 'system')),
  contenido TEXT NOT NULL,
  metadata JSONB, -- Información adicional: herramientas usadas, sugerencias, etc.
  timestamp TIMESTAMP DEFAULT NOW()
);

-- Tabla: Recomendaciones médicas (para que médicos recomienden citas)
CREATE TABLE IF NOT EXISTS recomendacion_medica (
  id_recomendacion SERIAL PRIMARY KEY,
  id_medico INTEGER NOT NULL REFERENCES medico(id_medico) ON DELETE CASCADE,
  id_paciente INTEGER NOT NULL REFERENCES paciente(id_paciente) ON DELETE CASCADE,
  especialidad_sugerida VARCHAR(100),
  motivo TEXT NOT NULL,
  urgencia VARCHAR(20) DEFAULT 'media' CHECK (urgencia IN ('baja', 'media', 'alta', 'urgente')),
  fecha_recomendacion TIMESTAMP DEFAULT NOW(),
  cita_creada INTEGER REFERENCES cita(id_cita),
  estado VARCHAR(20) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'aceptada', 'rechazada', 'completada')),
  notas_adicionales TEXT
);

-- Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_conversacion_paciente ON conversacion_chat(id_paciente);
CREATE INDEX IF NOT EXISTS idx_conversacion_estado ON conversacion_chat(estado);
CREATE INDEX IF NOT EXISTS idx_mensaje_conversacion ON mensaje_chat(id_conversacion);
CREATE INDEX IF NOT EXISTS idx_mensaje_timestamp ON mensaje_chat(timestamp);
CREATE INDEX IF NOT EXISTS idx_recomendacion_paciente ON recomendacion_medica(id_paciente);
CREATE INDEX IF NOT EXISTS idx_recomendacion_medico ON recomendacion_medica(id_medico);
CREATE INDEX IF NOT EXISTS idx_recomendacion_estado ON recomendacion_medica(estado);

-- Comentarios para documentación
COMMENT ON TABLE conversacion_chat IS 'Almacena las conversaciones del chatbot médico con IA';
COMMENT ON TABLE mensaje_chat IS 'Almacena cada mensaje de la conversación (usuario y asistente)';
COMMENT ON TABLE recomendacion_medica IS 'Almacena recomendaciones de citas hechas por médicos a pacientes';

COMMENT ON COLUMN conversacion_chat.resumen IS 'Resumen automático generado por IA al finalizar conversación';
COMMENT ON COLUMN mensaje_chat.metadata IS 'JSON con herramientas ejecutadas, sugerencias de cita, etc.';
COMMENT ON COLUMN recomendacion_medica.urgencia IS 'Nivel de urgencia: baja, media, alta, urgente';
