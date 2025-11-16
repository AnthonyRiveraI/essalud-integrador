# Nombres Correctos de Tablas en la Base de Datos

## ⚠️ Diferencias importantes

Tu esquema usa nombres **SINGULARES** y **sin guiones bajos**, pero el código está buscando nombres plurales/diferentes.

## Mapeo de Tablas

| ❌ Nombre en Código Actual | ✅ Nombre Real en DB |
|----------------------------|---------------------|
| `especialidades` | No existe (quitar) |
| `citas` | `cita` |
| `historial_clinico` | `historialclinico` |
| `medicos` | `medico` |
| `usuarios` | `usuario` |
| `pacientes` | `paciente` |

## Estructura de IDs

| Tabla | Campo ID Principal | Relación con Usuario |
|-------|-------------------|---------------------|
| `usuario` | `id_usuario` | - |
| `paciente` | `id_paciente` | = `usuario.id_usuario` |
| `medico` | `id_medico` | = `usuario.id_usuario` |
| `cita` | `id_cita` | Usa `id_paciente`, `id_medico` |
| `historialclinico` | `id_historial` | Usa `id_paciente`, `id_medico` |
| `triaje` | `id_triaje` | Usa `id_paciente`, `id_asistente` |
| `camas_emergencia` | `id_cama` | Usa `id_triaje` |

## Problema Actual

El usuario logueado tiene en `localStorage`:
```json
{
  "id_usuario": 1,
  "rol": "Paciente",
  "nombre": "Juan",
  "apellido": "Pérez",
  "dni": 12345678
}
```

Pero los componentes buscan `paciente_id` que **NO existe** en el objeto usuario.

## Solución

Necesitas:
1. Buscar el `id_paciente` en la tabla `paciente` usando `id_usuario`
2. Guardar ese `id_paciente` en el localStorage después del login
3. Actualizar todos los componentes para usar nombres correctos de tablas

## Scripts de Corrección

Ejecuta este SQL para crear la vista que falta (especialidades):
```sql
-- Si necesitas especialidades, créala o usa la columna especialidad de medico
CREATE TABLE IF NOT EXISTS especialidades (
  id_especialidad SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL UNIQUE
);

-- Insertar especialidades comunes
INSERT INTO especialidades (nombre) VALUES
  ('Medicina General'),
  ('Cardiología'),
  ('Pediatría'),
  ('Ginecología'),
  ('Traumatología'),
  ('Emergencia')
ON CONFLICT (nombre) DO NOTHING;
```
