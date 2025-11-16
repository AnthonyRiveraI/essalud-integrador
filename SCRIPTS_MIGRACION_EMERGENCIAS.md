# 🔧 Scripts de Migración para Módulo de Emergencias

## 📋 Resumen de Cambios

Se han creado scripts SQL para adaptar el módulo de emergencias a tu estructura de base de datos existente.

---

## 📁 Scripts Creados

### 1. **07-crear-tabla-camas-emergencia.sql**
Crea la tabla de camas de emergencia compatible con tu esquema.

**Características:**
- ✅ Usa nomenclatura de tu BD (`id_cama`, `id_triaje`, etc.)
- ✅ 20 camas distribuidas en 2 pisos (E001-E020)
- ✅ Estados: disponible, ocupada, mantenimiento
- ✅ Foreign key a tabla `triaje`
- ✅ Índices para optimización

### 2. **08-modificar-tabla-triaje.sql**
Modifica la tabla triaje existente para soportar emergencias.

**Nuevas columnas agregadas:**
- `nombre_temporal` - Para pacientes sin identificar
- `edad_aproximada` - Edad del paciente
- `nivel_urgencia` - Clasificación de triaje
- `sintomas` - Descripción detallada
- `saturacion_oxigeno` - SpO2
- `estado_paciente` - Estado actual
- `cama_asignada` - Cama en emergencia
- `created_at` - Timestamp de creación

**Modificaciones:**
- ✅ `id_paciente` ahora es NULLABLE (para pacientes sin identificar)
- ✅ `id_asistente` ahora es NULLABLE
- ✅ Mapeo automático de `nivel_riesgo` a `nivel_urgencia`
- ✅ Constraints de validación
- ✅ Índices para búsquedas rápidas

---

## 🚀 Orden de Ejecución

### **Paso 1: Ejecutar Scripts SQL en Supabase**

En el SQL Editor de Supabase, ejecuta **en orden**:

```sql
-- 1. Primero crear la tabla de camas
\i scripts/07-crear-tabla-camas-emergencia.sql

-- 2. Luego modificar tabla triaje
\i scripts/08-modificar-tabla-triaje.sql
```

O copia y pega el contenido de cada archivo manualmente.

### **Paso 2: Verificar Creación**

Ejecuta estas consultas para verificar:

```sql
-- Verificar tabla camas_emergencia
SELECT * FROM camas_emergencia LIMIT 5;

-- Verificar nuevas columnas en triaje
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'triaje' 
ORDER BY ordinal_position;

-- Contar camas disponibles
SELECT estado, COUNT(*) 
FROM camas_emergencia 
GROUP BY estado;
```

**Resultado esperado:**
- 20 camas creadas (todas en estado 'disponible')
- Nuevas columnas visibles en tabla triaje
- Sin errores de foreign keys

---

## 🔄 Mapeo de Campos

### **Triaje - Campos Antiguos vs Nuevos**

| Campo Original | Nuevo Campo | Mapeo |
|----------------|-------------|-------|
| `nivel_riesgo` | `nivel_urgencia` | Critico→critico, Alto→urgente, Moderado→menos_urgente, Bajo→no_urgente |
| `tiempo_atencion` | `nivel_urgencia` | Se mantienen ambos por compatibilidad |
| `spo2` | `saturacion_oxigeno` | Se mantienen ambos |
| - | `nombre_temporal` | Nuevo (pacientes sin ID) |
| - | `edad_aproximada` | Nuevo |
| - | `estado_paciente` | Nuevo |
| - | `cama_asignada` | Nuevo |

### **Camas Emergencia - Estructura**

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id_cama` | SERIAL | PK autoincremental |
| `numero_cama` | VARCHAR(10) | E001-E020 (único) |
| `piso` | INTEGER | 1 o 2 |
| `estado` | VARCHAR(20) | disponible/ocupada/mantenimiento |
| `id_triaje` | INTEGER | FK a triaje.id_triaje |
| `fecha_ocupacion` | TIMESTAMP | Cuándo se ocupó |
| `created_at` | TIMESTAMP | Cuándo se creó el registro |

---

## 🔍 Compatibilidad con Componentes

### **EmergencyDialog.tsx**
✅ Actualizado para usar:
- `id_paciente` (en lugar de `paciente_id`)
- `id_triaje` (en lugar de `id`)
- `id_cama` (en lugar de `id`)
- Mapeo a tabla `medico` con `especialidad = 'Emergencia'`
- Inserción en `historialclinico` con campos correctos

### **GestionarEmergencias.tsx**
✅ Actualizado para usar:
- Join con `paciente` table correctamente
- Campos `id_triaje` para referencias
- Campos `nombre_temporal` para pacientes sin ID
- Fechas desde `created_at` o `fecha`

---

## ⚠️ Consideraciones Importantes

### **1. Datos Existentes**
Si ya tienes registros en la tabla `triaje`:
- ✅ Se preservan todos los datos existentes
- ✅ Se mapea automáticamente `nivel_riesgo` → `nivel_urgencia`
- ✅ `created_at` usa la fecha del campo `fecha` existente
- ✅ `estado_paciente` se establece en 'en_atencion' por defecto

### **2. Campos Duplicados**
Algunos campos existen dos veces por compatibilidad:
- `spo2` y `saturacion_oxigeno` → ambos se llenan
- `nivel_riesgo` y `nivel_urgencia` → ambos se llenan
- `observaciones` y `sintomas` → ambos se llenan

Esto permite mantener compatibilidad con código existente.

### **3. Pacientes Sin Identificar**
El sistema ahora soporta:
- `id_paciente = NULL` → Paciente sin identificar
- `nombre_temporal` → Guardará "Paciente sin identificar" o descripción
- `edad_aproximada` → Edad estimada

### **4. Foreign Keys**
- ✅ `camas_emergencia.id_triaje` → `triaje.id_triaje` (ON DELETE SET NULL)
- ✅ `triaje.id_paciente` → `paciente.id_paciente` (ahora nullable)

---

## 🧪 Pruebas Recomendadas

### **Test 1: Crear Emergencia con Paciente Registrado**
```javascript
// Login como paciente
// Click en botón "Emergencia"
// Completar formulario
// Verificar en BD:
SELECT * FROM triaje WHERE id_paciente IS NOT NULL ORDER BY created_at DESC LIMIT 1;
SELECT * FROM camas_emergencia WHERE estado = 'ocupada';
```

### **Test 2: Crear Emergencia Sin Paciente**
```javascript
// Sin login, ir a página principal
// Click en "Emergencia"
// Llenar nombre temporal
// Verificar en BD:
SELECT * FROM triaje WHERE id_paciente IS NULL ORDER BY created_at DESC LIMIT 1;
```

### **Test 3: Liberar Cama**
```javascript
// Login como médico
// Ir a "Emergencias"
// Click en "Dar de Alta"
// Verificar en BD:
SELECT * FROM camas_emergencia WHERE numero_cama = 'E001';
SELECT * FROM triaje WHERE estado_paciente = 'de_alta';
```

---

## 🔧 Rollback (Si es necesario)

Si necesitas revertir los cambios:

```sql
-- Eliminar tabla camas_emergencia
DROP TABLE IF EXISTS camas_emergencia CASCADE;

-- Revertir columnas de triaje (CUIDADO: perderás datos nuevos)
ALTER TABLE triaje
  DROP COLUMN IF EXISTS nombre_temporal,
  DROP COLUMN IF EXISTS edad_aproximada,
  DROP COLUMN IF EXISTS nivel_urgencia,
  DROP COLUMN IF EXISTS sintomas,
  DROP COLUMN IF EXISTS saturacion_oxigeno,
  DROP COLUMN IF EXISTS estado_paciente,
  DROP COLUMN IF EXISTS cama_asignada,
  DROP COLUMN IF EXISTS created_at;

-- Restaurar NOT NULL en id_paciente
ALTER TABLE triaje
  ALTER COLUMN id_paciente SET NOT NULL,
  ALTER COLUMN id_asistente SET NOT NULL;
```

---

## 📞 Soporte

Si encuentras errores:

1. **Revisa la consola del navegador** (F12) - Hay logs detallados
2. **Verifica las tablas en Supabase** - SQL Editor
3. **Revisa políticas RLS** - Asegúrate de que estén habilitadas
4. **Revisa foreign keys** - Deben apuntar correctamente

---

## ✅ Checklist de Validación

Antes de usar el sistema:

- [ ] Script 07 ejecutado sin errores
- [ ] Script 08 ejecutado sin errores
- [ ] 20 camas creadas en `camas_emergencia`
- [ ] Nuevas columnas visibles en `triaje`
- [ ] Foreign keys funcionando
- [ ] Componentes actualizados (EmergencyDialog, GestionarEmergencias)
- [ ] Prueba de emergencia con paciente registrado ✅
- [ ] Prueba de emergencia sin paciente ✅
- [ ] Prueba de liberación de cama ✅

---

**Última actualización:** Noviembre 2025  
**Versión:** 2.1 - Compatibilidad con esquema personalizado
