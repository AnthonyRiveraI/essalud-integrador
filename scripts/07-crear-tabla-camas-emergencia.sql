-- Script para crear la tabla de camas de emergencia
-- Compatible con la estructura existente del sistema

-- Crear tabla de camas de emergencia
CREATE TABLE IF NOT EXISTS public.camas_emergencia (
  id_cama SERIAL PRIMARY KEY,
  numero_cama VARCHAR(10) NOT NULL UNIQUE,
  piso INTEGER NOT NULL,
  estado VARCHAR(20) NOT NULL DEFAULT 'disponible' CHECK (estado IN ('disponible', 'ocupada', 'mantenimiento')),
  id_triaje INTEGER,
  fecha_ocupacion TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT camas_emergencia_id_triaje_fkey FOREIGN KEY (id_triaje) REFERENCES public.triaje(id_triaje) ON DELETE SET NULL
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_camas_emergencia_estado ON public.camas_emergencia(estado);
CREATE INDEX IF NOT EXISTS idx_camas_emergencia_piso ON public.camas_emergencia(piso);
CREATE INDEX IF NOT EXISTS idx_camas_emergencia_id_triaje ON public.camas_emergencia(id_triaje);

-- Insertar las 20 camas de emergencia (2 pisos, 10 camas cada uno)
INSERT INTO public.camas_emergencia (numero_cama, piso, estado) VALUES
  -- Piso 1 (10 camas)
  ('E001', 1, 'disponible'),
  ('E002', 1, 'disponible'),
  ('E003', 1, 'disponible'),
  ('E004', 1, 'disponible'),
  ('E005', 1, 'disponible'),
  ('E006', 1, 'disponible'),
  ('E007', 1, 'disponible'),
  ('E008', 1, 'disponible'),
  ('E009', 1, 'disponible'),
  ('E010', 1, 'disponible'),
  
  -- Piso 2 (10 camas)
  ('E011', 2, 'disponible'),
  ('E012', 2, 'disponible'),
  ('E013', 2, 'disponible'),
  ('E014', 2, 'disponible'),
  ('E015', 2, 'disponible'),
  ('E016', 2, 'disponible'),
  ('E017', 2, 'disponible'),
  ('E018', 2, 'disponible'),
  ('E019', 2, 'disponible'),
  ('E020', 2, 'disponible')
ON CONFLICT (numero_cama) DO NOTHING;

-- Comentarios descriptivos
COMMENT ON TABLE public.camas_emergencia IS 'Tabla para gestionar las camas de emergencia del hospital';
COMMENT ON COLUMN public.camas_emergencia.numero_cama IS 'Código único de la cama (E001-E020)';
COMMENT ON COLUMN public.camas_emergencia.piso IS 'Piso donde se encuentra la cama (1 o 2)';
COMMENT ON COLUMN public.camas_emergencia.estado IS 'Estado actual de la cama: disponible, ocupada, mantenimiento';
COMMENT ON COLUMN public.camas_emergencia.id_triaje IS 'ID del triaje del paciente asignado a la cama';
COMMENT ON COLUMN public.camas_emergencia.fecha_ocupacion IS 'Fecha y hora en que la cama fue ocupada';
