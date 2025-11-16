-- Script para modificar la tabla de triaje para el sistema de emergencias
-- Compatible con la estructura existente

-- Primero, agregar las nuevas columnas necesarias para emergencias
ALTER TABLE public.triaje 
  ADD COLUMN IF NOT EXISTS nombre_temporal VARCHAR(255),
  ADD COLUMN IF NOT EXISTS edad_aproximada INTEGER,
  ADD COLUMN IF NOT EXISTS nivel_urgencia VARCHAR(50),
  ADD COLUMN IF NOT EXISTS sintomas TEXT,
  ADD COLUMN IF NOT EXISTS saturacion_oxigeno INTEGER,
  ADD COLUMN IF NOT EXISTS estado_paciente VARCHAR(50) DEFAULT 'en_atencion',
  ADD COLUMN IF NOT EXISTS cama_asignada VARCHAR(10),
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();

-- Hacer que id_paciente sea opcional (para pacientes sin identificar)
ALTER TABLE public.triaje 
  ALTER COLUMN id_paciente DROP NOT NULL;

-- Hacer que id_asistente sea opcional
ALTER TABLE public.triaje 
  ALTER COLUMN id_asistente DROP NOT NULL;

-- Agregar CHECK constraints para los nuevos campos
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'triaje_nivel_urgencia_check'
  ) THEN
    ALTER TABLE public.triaje 
      ADD CONSTRAINT triaje_nivel_urgencia_check 
      CHECK (nivel_urgencia IN ('critico', 'urgente', 'menos_urgente', 'no_urgente'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'triaje_estado_paciente_check'
  ) THEN
    ALTER TABLE public.triaje 
      ADD CONSTRAINT triaje_estado_paciente_check 
      CHECK (estado_paciente IN ('en_atencion', 'estable', 'en_coma', 'en_rehabilitacion', 'de_alta', 'fallecido'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'triaje_saturacion_oxigeno_check'
  ) THEN
    ALTER TABLE public.triaje 
      ADD CONSTRAINT triaje_saturacion_oxigeno_check 
      CHECK (saturacion_oxigeno >= 50 AND saturacion_oxigeno <= 100);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'triaje_edad_aproximada_check'
  ) THEN
    ALTER TABLE public.triaje 
      ADD CONSTRAINT triaje_edad_aproximada_check 
      CHECK (edad_aproximada >= 0 AND edad_aproximada <= 120);
  END IF;
END $$;

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_triaje_estado_paciente ON public.triaje(estado_paciente);
CREATE INDEX IF NOT EXISTS idx_triaje_nivel_urgencia ON public.triaje(nivel_urgencia);
CREATE INDEX IF NOT EXISTS idx_triaje_cama_asignada ON public.triaje(cama_asignada);
CREATE INDEX IF NOT EXISTS idx_triaje_created_at ON public.triaje(created_at DESC);

-- Comentarios descriptivos para las nuevas columnas
COMMENT ON COLUMN public.triaje.nombre_temporal IS 'Nombre del paciente si no está identificado en el sistema';
COMMENT ON COLUMN public.triaje.edad_aproximada IS 'Edad aproximada del paciente (0-120 años)';
COMMENT ON COLUMN public.triaje.nivel_urgencia IS 'Nivel de urgencia según triaje: critico, urgente, menos_urgente, no_urgente';
COMMENT ON COLUMN public.triaje.sintomas IS 'Descripción detallada de síntomas y motivo de consulta';
COMMENT ON COLUMN public.triaje.saturacion_oxigeno IS 'Saturación de oxígeno en porcentaje (50-100%)';
COMMENT ON COLUMN public.triaje.estado_paciente IS 'Estado actual del paciente: en_atencion, estable, en_coma, en_rehabilitacion, de_alta, fallecido';
COMMENT ON COLUMN public.triaje.cama_asignada IS 'Número de cama asignada en emergencia (E001-E020)';
COMMENT ON COLUMN public.triaje.created_at IS 'Fecha y hora de creación del registro';

-- Actualizar registros existentes si los hay (establecer valores por defecto)
UPDATE public.triaje 
SET 
  nivel_urgencia = CASE 
    WHEN nivel_riesgo = 'Critico' THEN 'critico'
    WHEN nivel_riesgo = 'Alto' THEN 'urgente'
    WHEN nivel_riesgo = 'Moderado' THEN 'menos_urgente'
    WHEN nivel_riesgo = 'Bajo' THEN 'no_urgente'
    ELSE 'urgente'
  END,
  estado_paciente = 'en_atencion',
  created_at = COALESCE(fecha, NOW())
WHERE nivel_urgencia IS NULL;
