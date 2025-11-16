# 🤖 ESSALUDITO - Agente IA con Function Calling

## 🎯 ¿Qué es un Agente?

Un **agente** es un sistema de IA que puede **decidir por sí mismo** cuándo y cómo usar herramientas para completar una tarea. A diferencia de un chatbot simple, un agente:

- ✅ **Analiza** la conversación
- ✅ **Decide** si necesita usar una herramienta
- ✅ **Ejecuta** la herramienta apropiada
- ✅ **Integra** el resultado en su respuesta

---

## 🔧 Arquitectura del Agente ESSALUDITO

### 1. **System Prompt** (Instrucciones del Agente)
```typescript
"Eres ESSALUDITO, un asistente médico virtual..."

USO DE HERRAMIENTAS:
- Cuando el paciente describe síntomas que requieren atención médica (NO emergencia),
  usa la función "recomendar_cita"
- SOLO usa la función si los síntomas NO son de emergencia
```

### 2. **Tool Definition** (Herramienta Disponible)
```typescript
{
  name: "recomendar_cita",
  description: "Recomienda agendar una cita médica...",
  parameters: {
    especialidad: "Cardiología | Neurología | ...",
    urgencia: "baja | media | alta",
    sintomas_principales: ["dolor de cabeza", "fiebre"],
    razon: "Breve explicación..."
  }
}
```

### 3. **Gemini Function Calling API**
Google Gemini analiza la conversación y decide:
- **Opción A**: Responder normalmente (sin herramienta)
- **Opción B**: Usar `recomendar_cita` (con herramienta)

---

## 🔄 Flujo de Trabajo del Agente

### Caso 1: Conversación Normal (Sin Herramienta)

**Usuario**: "Hola, ¿cómo estás?"

**Proceso Interno del Agente**:
```
1. Gemini analiza el mensaje
2. Detecta: Saludo, no hay síntomas
3. Decisión: NO usar herramienta
4. Genera respuesta de texto normal
```

**Respuesta**:
```json
{
  "message": "¡Hola! Estoy bien, gracias...",
  "shouldShowBooking": false,
  "metadata": { "functionCall": false }
}
```

---

### Caso 2: Síntomas Médicos (CON Herramienta)

**Usuario**: "Tengo dolor de cabeza y fiebre desde hace 2 días"

**Proceso Interno del Agente**:
```
1. Gemini analiza el mensaje
2. Detecta: Síntomas médicos (dolor de cabeza, fiebre)
3. Evalúa urgencia: No es emergencia
4. Decisión: USAR herramienta "recomendar_cita"
5. Gemini llama a la función con parámetros:
   {
     "especialidad": "Neurología",
     "urgencia": "media",
     "sintomas_principales": ["dolor de cabeza", "fiebre"],
     "razon": "Dolor de cabeza persistente requiere evaluación"
   }
6. Backend recibe el Function Call
7. Genera respuesta con recomendación de cita
```

**Respuesta**:
```json
{
  "message": "Entiendo que tienes dolor de cabeza...",
  "shouldShowBooking": true,
  "especialidadRecomendada": "Neurología",
  "urgencia": "media",
  "sintomasDetectados": ["dolor de cabeza", "fiebre"],
  "metadata": {
    "functionCall": true,
    "toolUsed": "recomendar_cita"
  }
}
```

**UI Resultante**:
```
┌─────────────────────────────────────────┐
│ 🤖 Bot: Entiendo que tienes dolor...   │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ ✨ Recomendación del Agente IA      │ │
│ │                                     │ │
│ │ 💡 Análisis Completado              │ │
│ │                                     │ │
│ │ Especialidad: Neurología            │ │
│ │ Urgencia: Media                     │ │
│ │ Síntomas: dolor de cabeza, fiebre   │ │
│ │                                     │ │
│ │ [📅 Agendar Cita con Neurología]    │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

---

### Caso 3: Emergencia (Sin Herramienta, Respuesta Especial)

**Usuario**: "Me duele el pecho y no puedo respirar"

**Proceso Interno del Agente**:
```
1. Gemini analiza el mensaje
2. Detecta: Síntomas de emergencia
3. Evalúa urgencia: EMERGENCIA
4. Decisión: NO usar herramienta (emergencia)
5. Genera respuesta con instrucciones urgentes
```

**Respuesta**:
```json
{
  "message": "⚠️ ALERTA: Estos síntomas son de emergencia...",
  "shouldShowBooking": false,
  "metadata": { "functionCall": false }
}
```

---

## 🧠 Ventajas del Agente vs Detección Manual

### ❌ Detección Manual (Anterior)
```typescript
// Buscar keywords exactas
if (mensaje.includes("dolor de cabeza")) {
  return "Neurología"
}
```

**Problemas**:
- Solo detecta frases exactas
- No entiende contexto
- No puede razonar sobre urgencia
- Mantenimiento manual de keywords

### ✅ Agente con Function Calling (Actual)
```typescript
// Gemini decide autónomamente
Agent analyzes: "Me duele la cabeza desde hace una semana"
Agent thinks: "Dolor de cabeza persistente → Requiere consulta"
Agent calls: recomendar_cita(especialidad="Neurología", urgencia="media")
```

**Ventajas**:
- ✅ Entiende lenguaje natural
- ✅ Detecta variaciones ("cabeza me duele", "cefalea", etc.)
- ✅ Razona sobre urgencia
- ✅ Considera contexto completo
- ✅ Auto-mejora con el tiempo

---

## 📊 Comparación de Casos

| Mensaje del Usuario | Detección Manual | Agente IA |
|---------------------|------------------|-----------|
| "Tengo dolor de cabeza" | ✅ Detecta | ✅ Detecta |
| "Me duele la cabeza" | ❌ No detecta | ✅ Detecta |
| "Tengo cefalea" | ❌ No detecta | ✅ Detecta |
| "Mi cabeza me está matando" | ❌ No detecta | ✅ Detecta |
| "Dolor de cabeza leve hace 1 hora" | ✅ Detecta (urgencia incorrecta) | ✅ Detecta (urgencia: baja) |
| "Dolor de cabeza severo hace 3 días" | ✅ Detecta (urgencia incorrecta) | ✅ Detecta (urgencia: media) |

---

## 🔍 Logs del Agente

En la consola del navegador verás:

```javascript
[Chatbot] 🤖 Respuesta del agente: {
  usedTool: true,
  toolName: "recomendar_cita",
  especialidad: "Neurología",
  urgencia: "media",
  sintomas: ["dolor de cabeza", "fiebre"]
}
```

Esto te permite ver **exactamente** cuándo el agente decidió usar una herramienta.

---

## 🎯 Casos de Uso Reales

### 1. Síntomas Difusos
**Usuario**: "No me siento bien, estoy cansado y me duele todo"

**Agente**:
- Analiza: síntomas generales
- Decide: usar `recomendar_cita`
- Especialidad: "Medicina General"
- Urgencia: "media"

### 2. Seguimiento
**Usuario**: "Ayer me diste una recomendación, ¿puedo agendar ahora?"

**Agente**:
- Analiza: no hay nuevos síntomas, es seguimiento
- Decide: NO usar herramienta
- Responde: "Sí, puedes ir a la pestaña..."

### 3. Emergencia Detectada
**Usuario**: "Tengo convulsiones"

**Agente**:
- Analiza: emergencia médica
- Decide: NO usar herramienta (es emergencia)
- Responde: "⚠️ EMERGENCIA - Llama al 106..."

---

## 🚀 Próximas Mejoras del Agente

### Tools Adicionales Posibles:

1. **`buscar_medicamento`**
   - Permite al agente buscar información de medicamentos
   - Ejemplo: "¿Para qué sirve el paracetamol?"

2. **`calcular_imc`**
   - Calcula IMC del paciente
   - Ejemplo: "Peso 70kg y mido 1.70m"

3. **`verificar_disponibilidad`**
   - Verifica disponibilidad de médicos en tiempo real
   - Ejemplo: "¿Hay cardiólogos disponibles mañana?"

4. **`historial_paciente`**
   - Accede al historial clínico
   - Ejemplo: "¿Cuál fue mi última cita?"

---

## 📖 Conceptos Clave

### Function Calling
Permite al modelo de IA **decidir** cuándo llamar funciones externas.

### Tool Definition
Especificación JSON de qué hace la función y qué parámetros necesita.

### Agent Reasoning
El modelo **razona** sobre si usar o no una herramienta.

---

## ✅ Conclusión

ESSALUDITO ahora es un **verdadero agente** que:

1. ✅ Escucha y entiende al paciente
2. ✅ Razona sobre los síntomas
3. ✅ Decide cuándo recomendar una cita
4. ✅ Genera recomendaciones inteligentes
5. ✅ Maneja emergencias apropiadamente

**No es solo un chatbot, es un asistente médico inteligente.** 🚀
