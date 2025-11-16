# 🚨 Módulo de Emergencias - Documentación Completa

## 📋 Descripción General

El **Módulo de Emergencias** es un sistema completo para la gestión de pacientes en situaciones críticas que requieren atención médica inmediata. Incluye triaje, asignación automática de camas, registro de signos vitales y seguimiento de pacientes.

---

## ✨ Características Principales

### 1. **Formulario de Triaje Médico** 🏥
- ✅ Registro rápido de emergencias desde el dashboard del paciente
- ✅ Sistema de clasificación por nivel de urgencia (Triaje Manchester)
- ✅ Asignación automática de camas de emergencia
- ✅ Registro completo de signos vitales
- ✅ Soporte para pacientes sin identificar

### 2. **Sistema de Clasificación de Urgencia** 🚦
- 🔴 **Crítico (Rojo)**: Atención inmediata
- 🟠 **Urgente (Naranja)**: 10-15 minutos
- 🟡 **Menos Urgente (Amarillo)**: 30-60 minutos
- 🟢 **No Urgente (Verde)**: 1-2 horas

### 3. **Gestión de Camas** 🛏️
- 20 camas de emergencia distribuidas en 2 pisos
- Estado en tiempo real: disponible/ocupada
- Asignación automática al registrar emergencia
- Sistema de liberación de camas al dar de alta

### 4. **Panel de Gestión para Médicos** 👨‍⚕️
- Vista completa de pacientes en emergencia
- Monitoreo de signos vitales
- Dar de alta pacientes
- Estadísticas en tiempo real

---

## 🔧 Componentes del Sistema

### **1. EmergencyDialog** (`components/emergency-dialog.tsx`)
Formulario completo de registro de emergencias con:

#### Campos de Identificación:
- Nombre completo (o "Desconocido" para pacientes sin identificar)
- Edad aproximada
- Nivel de urgencia (triaje)

#### Signos Vitales:
- 💓 Presión Arterial (ej: 120/80 mmHg)
- 💗 Frecuencia Cardíaca (60-100 lpm normal)
- 🌡️ Temperatura Corporal (36.5-37.5°C normal)
- 💨 Saturación de Oxígeno (≥95% normal)

#### Información Clínica:
- Síntomas principales
- Motivo de consulta
- Tiempo de evolución

#### Características:
- ✅ Validación automática de campos
- ✅ Indicador visual de camas disponibles
- ✅ Mensajes de feedback con emojis
- ✅ Debugging detallado en consola
- ✅ Diseño responsive y accesible

### **2. GestionarEmergencias** (`components/medico/gestionar-emergencias.tsx`)
Panel de control para médicos con:

#### Estadísticas:
- 📊 Total de pacientes en emergencia
- 🛏️ Camas disponibles vs ocupadas
- 📈 Gráficos visuales

#### Gestión de Pacientes:
- Vista completa de emergencias activas
- Filtros por nivel de urgencia
- Signos vitales de cada paciente
- Botón para dar de alta y liberar cama

---

## 💾 Estructura de Base de Datos

### Tabla: `camas_emergencia`
```sql
CREATE TABLE camas_emergencia (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  numero_cama VARCHAR(10) UNIQUE NOT NULL,
  piso INTEGER NOT NULL,
  estado VARCHAR(20) DEFAULT 'disponible',
  paciente_triaje_id UUID REFERENCES triaje(id),
  fecha_ocupacion TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Distribución de Camas:**
- Piso 1: Camas E001-E010 (10 camas)
- Piso 2: Camas E011-E020 (10 camas)

### Tabla: `triaje`
```sql
CREATE TABLE triaje (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  paciente_id UUID REFERENCES usuarios(id),
  nombre_temporal VARCHAR(255),
  edad_aproximada INTEGER,
  nivel_urgencia VARCHAR(50) NOT NULL,
  sintomas TEXT NOT NULL,
  presion_arterial VARCHAR(20),
  frecuencia_cardiaca INTEGER,
  temperatura DECIMAL(4,2),
  saturacion_oxigeno INTEGER,
  estado_paciente VARCHAR(50) DEFAULT 'en_atencion',
  cama_asignada VARCHAR(10),
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🔄 Flujo de Trabajo

### **Escenario 1: Paciente Registrado** 👤

1. **Paciente accede al dashboard**
   - Hace clic en botón "🚨 Emergencia" en el navbar

2. **Se abre el diálogo de emergencias**
   - Nombre y datos del paciente precargados
   - Campos de signos vitales listos para completar

3. **Personal médico completa el formulario**
   - Ingresa signos vitales
   - Clasifica nivel de urgencia
   - Describe síntomas

4. **Sistema procesa automáticamente**
   - ✅ Verifica camas disponibles
   - ✅ Asigna cama automáticamente
   - ✅ Crea registro en triaje
   - ✅ Actualiza historial clínico
   - ✅ Marca cama como ocupada

5. **Confirmación visual**
   - Toast con número de cama asignada
   - Piso donde se encuentra
   - Camas restantes disponibles

### **Escenario 2: Paciente Sin Identificar** ❓

1. **Personal de emergencias abre el formulario**
   - Desde página principal: click en "Emergencia"

2. **Completa datos disponibles**
   - Nombre: "Desconocido" o descripción básica
   - Edad aproximada
   - Signos vitales observables

3. **Sistema crea registro anónimo**
   - Campo `nombre_temporal` usado
   - `paciente_id` queda como NULL
   - Resto del flujo igual

---

## 📊 Indicadores Visuales

### **Disponibilidad de Camas**

| Disponibles | Color | Mensaje |
|-------------|-------|---------|
| 0 camas | 🔴 Rojo | "⛔ No hay camas disponibles. Remita a otro centro hospitalario." |
| 1-5 camas | 🟡 Amarillo | "⚠️ Pocas camas disponibles. Priorice casos críticos." |
| 6-10 camas | 🔵 Azul | "📊 Capacidad moderada. Administre recursos con cuidado." |
| 11-20 camas | 🟢 Verde | "✅ Buena disponibilidad de camas para atención." |

### **Nivel de Urgencia (Badge)**

- 🔴 **Crítico**: Fondo rojo, texto blanco
- 🟠 **Urgente**: Fondo naranja, texto blanco  
- 🟡 **Menos Urgente**: Fondo amarillo, texto negro
- 🟢 **No Urgente**: Fondo verde, texto blanco

---

## 🎯 Casos de Uso

### **Caso 1: Paciente con Dolor de Pecho**
```
Nombre: Juan Pérez
Edad: 55 años
Nivel: 🔴 Crítico
PA: 150/95 mmHg
FC: 110 lpm
Temp: 37.2°C
SpO2: 94%
Síntomas: "Dolor opresivo en pecho irradiado a brazo izquierdo. 
           Inicio hace 30 minutos. Diaforesis. Antecedentes: HTA."
```

### **Caso 2: Accidente de Tránsito**
```
Nombre: Desconocido (Varón joven)
Edad: ~25 años
Nivel: 🔴 Crítico
PA: 90/60 mmHg (hipotensión)
FC: 130 lpm (taquicardia)
Temp: 36.8°C
SpO2: 92%
Síntomas: "Politraumatizado. TEC moderado. Fractura expuesta 
           en pierna derecha. Glasgow 13/15. Sangrado activo."
```

### **Caso 3: Fiebre Alta en Niño**
```
Nombre: María García
Edad: 4 años
Nivel: 🟠 Urgente
PA: N/A (pediátrico)
FC: 140 lpm
Temp: 39.5°C
SpO2: 97%
Síntomas: "Fiebre de 39.5°C no cede con antipiréticos. 
           Vómitos. Convulsión febril hace 1 hora. 
           Madre refiere deshidratación."
```

---

## 🔍 Debugging y Logs

El sistema incluye logging detallado en consola:

### **Al abrir el diálogo:**
```javascript
🚨 Abriendo diálogo de emergencia { 
  pacienteId: "uuid-xxx",
  pacienteNombre: "Juan Pérez"
}
```

### **Al cargar camas:**
```javascript
🏥 Cargando camas disponibles...
📊 Camas disponibles: {
  total: 15,
  camas: [...],
  error: null
}
```

### **Al registrar emergencia:**
```javascript
📝 Enviando formulario de emergencia: {...}
🛏️ Cama asignada: { numero_cama: "E005", piso: 1 }
✅ Triaje creado: {...}
🏥 Especialidad Emergencia: {...}
👨‍⚕️ Médicos de emergencia: [...]
✅ Historial clínico creado
✅ Cama actualizada
```

---

## ⚠️ Manejo de Errores

### **Sin Camas Disponibles**
```
❌ Toast destructivo:
Título: "❌ Sin camas disponibles"
Descripción: "No hay camas de emergencia disponibles. 
              Recomendamos dirigirse al Hospital Nacional 
              o Regional más cercano."
```

### **Error al Verificar Camas**
```
⚠️ Toast destructivo:
Título: "⚠️ Error al verificar disponibilidad"
Descripción: "No se pudo verificar la disponibilidad de camas. 
              Intente nuevamente."
```

### **Error al Registrar**
```
❌ Toast destructivo:
Título: "❌ Error al registrar emergencia"
Descripción: <mensaje de error específico>
```

---

## 🚀 Mejoras Implementadas

### **Versión Actual (v2.0)**

#### UI/UX:
- ✅ Header con gradiente rojo-naranja y badge "URGENTE"
- ✅ Indicador animado (pulse) en ícono de emergencia
- ✅ Secciones organizadas con títulos y iconos
- ✅ Campos h-11 consistentes
- ✅ Tooltips informativos en signos vitales
- ✅ Spinner animado en botón de envío

#### Funcionalidad:
- ✅ Validación de campos requeridos
- ✅ Rangos min/max en campos numéricos
- ✅ Formato sugerido para presión arterial
- ✅ Reset automático de formulario al cerrar
- ✅ Precarga de datos del paciente
- ✅ Debugging completo en consola

#### Integración:
- ✅ Conexión con dashboard del paciente
- ✅ Panel de gestión para médicos
- ✅ Actualización automática de estadísticas
- ✅ Sistema de altas y liberación de camas

---

## 📱 Acceso al Módulo

### **Desde el Paciente:**
1. Login en `/paciente/login`
2. Click en botón "🚨 Emergencia" en el navbar
3. Completar formulario

### **Desde el Médico:**
1. Login en `/medico/login`
2. Click en "Emergencias" en el navbar
3. Ver listado de pacientes activos
4. Dar de alta cuando corresponda

---

## 🧪 Testing

### **Pruebas Recomendadas:**

1. **Registro de Emergencia con Paciente**
   - Login como paciente (DNI: 78901234)
   - Abrir formulario de emergencia
   - Completar todos los campos
   - Verificar asignación de cama

2. **Registro Sin Paciente**
   - Ir a página principal sin login
   - Click en "Emergencia"
   - Completar formulario con "Desconocido"
   - Verificar creación de registro anónimo

3. **Gestión desde Médico**
   - Login como médico (jperez@essalud.gob.pe)
   - Ir a sección "Emergencias"
   - Verificar lista de pacientes
   - Dar de alta a un paciente
   - Confirmar liberación de cama

4. **Capacidad Máxima**
   - Registrar 20 emergencias
   - Intentar registrar la 21
   - Verificar mensaje de error

---

## 📞 Soporte

Para problemas o dudas:
- Revisar logs en consola del navegador (F12)
- Verificar estado de tablas en Supabase
- Confirmar políticas RLS activas

---

**Última actualización:** Noviembre 2025  
**Versión:** 2.0
