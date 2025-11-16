# Estado del Módulo de Administrador

## Componentes Actualizados ✅

### 1. `dashboard-overview.tsx` ✅
- Actualizado de `citas` → `cita`
- Removido uso de foreign keys de especialidades
- Ahora agrupa citas por especialidad del médico

### 2. `estadisticas-sistema.tsx` ✅
- `usuarios` → `paciente` (para contar pacientes)
- `medicos` → `medico`
- `citas` → `cita`
- Estados actualizados: `cancelada` → `Cancelada`

### 3. `lista-pacientes.tsx` ✅
- Carga combinando `paciente` + `usuario`
- Crear: inserta en `usuario` y `paciente`
- Editar: actualiza ambas tablas
- Eliminar: elimina de `usuario` (cascade a `paciente`)
- IDs: `id` → `id_usuario`, `id_paciente`
- Columnas: `email` → `correo`, `password_hash` → `password`
- Removido campo `telefono` (no existe en tabla `usuario`)

## Componentes Pendientes ❌

### 4. `lista-medicos.tsx` ❌
**Problemas:**
- Usa tabla `medicos` (debe ser `medico`)
- Usa tabla `especialidades` (no existe - especialidad es string en medico)
- Usa foreign keys que no funcionan

**Cambios necesarios:**
```typescript
// Cargar médicos
const { data: medicosData } = await supabase
  .from("medico")
  .select("*")

// Obtener datos de usuario para cada médico
for (const medico of medicosData) {
  const { data: usuarioData } = await supabase
    .from("usuario")
    .select("*")
    .eq("id_usuario", medico.id_medico)
    .single()
}

// Crear médico
1. Crear en tabla usuario (rol: "Medico")
2. Crear en tabla medico (id_medico = id_usuario, especialidad: string)

// Eliminar médico
- Eliminar de usuario (cascade a medico)
```

### 5. `lista-asistentes.tsx` ❌
**Problemas similares a lista-medicos**

### 6. `historiales-completos.tsx` ❌
- Usa `historial_clinico` → debe ser `historialclinico`
- Usa foreign keys
- Necesita Promise.all() manual

### 7. `registrar-usuario.tsx` ❌
- Usa `usuarios` → `usuario`
- Necesita crear en tablas correspondientes (`paciente`, `medico`, etc.)

## Esquema Actual de la Base de Datos

### Tablas
- `usuario` (singular) - id_usuario, dni, correo, password, nombre, apellido, rol
- `paciente` (singular) - id_paciente (=id_usuario), dni, fecha_nacimiento
- `medico` (singular) - id_medico (=id_usuario), especialidad (STRING), max_pacientes_dia
- `cita` (singular) - id_cita, id_paciente, id_medico, fecha, hora, tipo, estado, codigo_boleta
- `historialclinico` (sin guion bajo) - id_historial, id_paciente, id_medico, fecha, diagnostico, receta
- `triaje` - id_triaje, id_paciente, nivel_urgencia, sintomas, estado

### Valores de Enums
- **Roles**: 'Paciente', 'Medico', 'AsistenteEnfermeria', 'Administrador' (Capitalizados)
- **Estado cita**: 'Pendiente', 'Completada', 'Cancelada' (Capitalizados)
- **Tipo cita**: 'Normal', 'Emergencia' (Capitalizados)

### Columnas Importantes
- ❌ NO existe: `telefono`, `especialidades` (tabla), `email` (es `correo`), `password_hash` (es `password`)
- ✅ SÍ existe: `correo`, `password`, `especialidad` (string en medico)

## Próximos Pasos

1. ✅ Verificar errores en componentes actualizados
2. ⏳ Actualizar lista-medicos.tsx
3. ⏳ Actualizar lista-asistentes.tsx  
4. ⏳ Actualizar historiales-completos.tsx
5. ⏳ Actualizar registrar-usuario.tsx
