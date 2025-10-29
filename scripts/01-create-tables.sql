-- Tabla de usuarios (base para todos los roles)
CREATE TABLE IF NOT EXISTS usuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dni VARCHAR(8) UNIQUE,
  email VARCHAR(255) UNIQUE,
  password_hash TEXT NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100) NOT NULL,
  telefono VARCHAR(15),
  fecha_nacimiento DATE,
  direccion TEXT,
  rol VARCHAR(50) NOT NULL CHECK (rol IN ('paciente', 'medico', 'asistente_enfermeria', 'administrador')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de especialidades médicas
CREATE TABLE IF NOT EXISTS especialidades (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL UNIQUE,
  descripcion TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de médicos (extiende usuarios)
CREATE TABLE IF NOT EXISTS medicos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  especialidad_id INTEGER NOT NULL REFERENCES especialidades(id),
  numero_colegiatura VARCHAR(20) UNIQUE NOT NULL,
  minutos_por_cita INTEGER DEFAULT 30,
  max_citas_dia INTEGER DEFAULT 20,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de horarios de médicos
CREATE TABLE IF NOT EXISTS horarios_medicos (
  id SERIAL PRIMARY KEY,
  medico_id UUID NOT NULL REFERENCES medicos(id) ON DELETE CASCADE,
  dia_semana INTEGER NOT NULL CHECK (dia_semana BETWEEN 0 AND 6), -- 0=Domingo, 6=Sábado
  hora_inicio TIME NOT NULL,
  hora_fin TIME NOT NULL,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de citas
CREATE TABLE IF NOT EXISTS citas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo_boleta VARCHAR(20) UNIQUE NOT NULL,
  paciente_id UUID NOT NULL REFERENCES usuarios(id),
  medico_id UUID NOT NULL REFERENCES medicos(id),
  especialidad_id INTEGER NOT NULL REFERENCES especialidades(id),
  fecha DATE NOT NULL,
  hora TIME NOT NULL,
  piso INTEGER,
  puerta VARCHAR(10),
  estado VARCHAR(50) DEFAULT 'programada' CHECK (estado IN ('programada', 'completada', 'cancelada', 'reprogramada')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de historial clínico
CREATE TABLE IF NOT EXISTS historial_clinico (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paciente_id UUID NOT NULL REFERENCES usuarios(id),
  medico_id UUID NOT NULL REFERENCES medicos(id),
  cita_id UUID REFERENCES citas(id),
  especialidad_id INTEGER NOT NULL REFERENCES especialidades(id),
  fecha TIMESTAMP WITH TIME ZONE NOT NULL,
  diagnostico TEXT NOT NULL,
  receta_medica TEXT,
  observaciones TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de triaje (emergencias)
CREATE TABLE IF NOT EXISTS triaje (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paciente_id UUID REFERENCES usuarios(id),
  nombre_temporal VARCHAR(200), -- Para pacientes no identificados
  edad_aproximada INTEGER,
  nivel_urgencia VARCHAR(20) NOT NULL CHECK (nivel_urgencia IN ('critico', 'urgente', 'menos_urgente', 'no_urgente')),
  sintomas TEXT NOT NULL,
  presion_arterial VARCHAR(20),
  frecuencia_cardiaca INTEGER,
  temperatura DECIMAL(4,2),
  saturacion_oxigeno INTEGER,
  estado VARCHAR(50) DEFAULT 'en_espera' CHECK (estado IN ('en_espera', 'en_atencion', 'hospitalizado', 'alta')),
  cama_asignada INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de camas de emergencia
CREATE TABLE IF NOT EXISTS camas_emergencia (
  id SERIAL PRIMARY KEY,
  numero_cama INTEGER UNIQUE NOT NULL,
  piso INTEGER NOT NULL,
  estado VARCHAR(20) DEFAULT 'disponible' CHECK (estado IN ('disponible', 'ocupada', 'mantenimiento')),
  paciente_triaje_id UUID REFERENCES triaje(id),
  fecha_ocupacion TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_usuarios_dni ON usuarios(dni);
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_rol ON usuarios(rol);
CREATE INDEX IF NOT EXISTS idx_citas_paciente ON citas(paciente_id);
CREATE INDEX IF NOT EXISTS idx_citas_medico ON citas(medico_id);
CREATE INDEX IF NOT EXISTS idx_citas_fecha ON citas(fecha);
CREATE INDEX IF NOT EXISTS idx_historial_paciente ON historial_clinico(paciente_id);
CREATE INDEX IF NOT EXISTS idx_triaje_estado ON triaje(estado);
