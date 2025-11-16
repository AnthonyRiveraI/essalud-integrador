import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/client'

const GEMINI_API_KEY = process.env.GOOGLE_GEMINI_API_KEY
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent'

// System prompt para el chatbot médico
const SYSTEM_PROMPT = `Eres ESSALUDITO, un asistente médico virtual amigable y profesional de ESSALUD (Seguro Social de Salud del Perú).

TU MISIÓN:
- Brindar información médica básica y orientación
- NUNCA dar diagnósticos definitivos (solo orientación)
- Recomendar cuándo buscar atención médica presencial
- Ser empático, claro y usar lenguaje sencillo
- Hablar en español peruano

REGLAS IMPORTANTES:
1. NO eres un médico, eres un asistente de orientación
2. SIEMPRE recomienda consultar con un profesional de salud
3. En casos urgentes, indica buscar atención inmediata
4. Usa emojis moderadamente para ser amigable
5. Sé breve pero completo en tus respuestas

FORMATO DE RESPUESTA (USA MARKDOWN):
1. **Reconocimiento empático** - Muestra que entiendes
2. **Posibles causas** - Explica sin diagnosticar (usa listas con -)
3. **Consejos de autocuidado** - Qué puede hacer ahora (usa listas con -)
4. **Cuándo buscar ayuda** - Señales de alerta

IMPORTANTE: Usa markdown para dar formato:
- Usa **negritas** para resaltar información importante
- Usa listas con guión (-) para enumerar consejos
- Usa emojis de forma moderada (máximo 2-3 por mensaje)
- Mantén párrafos cortos y claros

USO DE HERRAMIENTAS:
- Cuando el paciente describe síntomas que requieren atención médica (NO emergencia), usa la función "recomendar_cita"
- SOLO usa la función si los síntomas NO son de emergencia
- Para emergencias (dolor de pecho intenso, dificultad respiratoria severa, etc.), NO uses la función, indica ir a emergencias

Recuerda: Tu objetivo es ORIENTAR, no diagnosticar.`

// Definición de la herramienta (Tool) para Function Calling
const TOOLS = [
  {
    functionDeclarations: [
      {
        name: "recomendar_cita",
        description: "Recomienda agendar una cita médica con una especialidad específica basándose en los síntomas del paciente. SOLO usar si NO es una emergencia.",
        parameters: {
          type: "object",
          properties: {
            especialidad: {
              type: "string",
              description: "La especialidad médica recomendada. Opciones: Cardiología, Pediatría, Neurología, Traumatología, Medicina General, Ginecología, Oftalmología, Dermatología, Gastroenterología, Neumología",
              enum: ["Cardiología", "Pediatría", "Neurología", "Traumatología", "Medicina General", "Ginecología", "Oftalmología", "Dermatología", "Gastroenterología", "Neumología"]
            },
            urgencia: {
              type: "string",
              description: "Nivel de urgencia de la consulta",
              enum: ["baja", "media", "alta"]
            },
            sintomas_principales: {
              type: "array",
              description: "Lista de síntomas principales que presenta el paciente",
              items: {
                type: "string"
              }
            },
            razon: {
              type: "string",
              description: "Breve explicación de por qué se recomienda esta especialidad"
            }
          },
          required: ["especialidad", "urgencia", "sintomas_principales", "razon"]
        }
      }
    ]
  }
]

export async function POST(request: NextRequest) {
  try {
    const { messages, pacienteId, conversacionId } = await request.json()

    if (!messages || messages.length === 0) {
      return NextResponse.json(
        { error: 'No se proporcionaron mensajes' },
        { status: 400 }
      )
    }

    const supabase = createClient()
    let currentConversacionId = conversacionId

    // Si no hay conversación ID, crear una nueva conversación
    if (!currentConversacionId && pacienteId) {
      const { data: newConversacion, error: conversacionError } = await supabase
        .from('conversacion_chat')
        .insert({
          id_paciente: pacienteId,
          estado: 'activa'
        })
        .select()
        .single()

      if (!conversacionError && newConversacion) {
        currentConversacionId = newConversacion.id_conversacion
        console.log('[API Chat] Nueva conversación creada:', currentConversacionId)
      }
    }

    // Preparar mensajes para Gemini
    const geminiMessages = messages.map((msg: any) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }))

    // Llamar a la API de Gemini con Function Calling
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: geminiMessages,
        systemInstruction: {
          parts: [{ text: SYSTEM_PROMPT }]
        },
        tools: TOOLS,
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
        safetySettings: [
          {
            category: 'HARM_CATEGORY_HARASSMENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          },
          {
            category: 'HARM_CATEGORY_HATE_SPEECH',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          },
          {
            category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          },
          {
            category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          }
        ]
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('Error de Gemini API:', errorData)
      
      // Respuesta de fallback si la API falla
      return NextResponse.json({
        message: "Lo siento, estoy teniendo problemas técnicos en este momento. Por favor, intenta de nuevo en unos momentos o contacta directamente con nuestro centro de atención.",
        shouldShowBooking: false
      })
    }

    const data = await response.json()
    const candidate = data.candidates[0]
    
    console.log('[API Chat] Response completa de Gemini:', JSON.stringify(data, null, 2))
    console.log('[API Chat] Candidate:', candidate)
    console.log('[API Chat] Parts:', candidate?.content?.parts)

    // Verificar si el modelo quiere usar una función (Function Call)
    const functionCall = candidate?.content?.parts?.find((part: any) => part.functionCall)
    
    if (functionCall?.functionCall?.name === 'recomendar_cita') {
      // El agente decidió recomendar una cita
      const args = functionCall.functionCall.args
      
      console.log('[API Chat] Function Call detectado:', args)
      
      // Obtener el texto de respuesta (puede venir antes o después del function call)
      const textPart = candidate?.content?.parts?.find((part: any) => part.text)
      const aiMessage = textPart?.text || 'He analizado tus síntomas y tengo una recomendación para ti.'
      
      // Guardar mensaje del usuario en la BD
      if (currentConversacionId && messages.length > 0) {
        const lastUserMessage = messages[messages.length - 1]
        await supabase.from('mensaje_chat').insert({
          id_conversacion: currentConversacionId,
          rol: lastUserMessage.role,
          contenido: lastUserMessage.content,
          metadata: { timestamp: new Date().toISOString() }
        })
      }

      // Guardar respuesta del asistente con metadata de function call
      if (currentConversacionId) {
        await supabase.from('mensaje_chat').insert({
          id_conversacion: currentConversacionId,
          rol: 'assistant',
          contenido: aiMessage,
          metadata: {
            functionCall: true,
            toolUsed: 'recomendar_cita',
            especialidad: args.especialidad,
            urgencia: args.urgencia,
            sintomas: args.sintomas_principales,
            razon: args.razon,
            timestamp: new Date().toISOString()
          }
        })

        // Actualizar fecha último mensaje
        await supabase
          .from('conversacion_chat')
          .update({ fecha_ultimo_mensaje: new Date().toISOString() })
          .eq('id_conversacion', currentConversacionId)
      }
      
      return NextResponse.json({
        message: aiMessage,
        shouldShowBooking: true,
        especialidadRecomendada: args.especialidad,
        urgencia: args.urgencia,
        sintomasDetectados: args.sintomas_principales || [],
        razonRecomendacion: args.razon,
        conversacionId: currentConversacionId,
        metadata: {
          functionCall: true,
          toolUsed: 'recomendar_cita'
        }
      })
    } else {
      // Respuesta normal sin function call
      const aiMessage = candidate?.content?.parts?.[0]?.text || 'No pude generar una respuesta'
      
      // DETECTAR EMERGENCIAS en la respuesta del agente
      const emergencyKeywords = [
        "emergencia",
        "urgente",
        "inmediato",
        "llamar a los números de emergencia",
        "centro de emergencia",
        "acudir de inmediato",
        "106",
        "🚑",
        "señal de alarma",
        "atención médica de emergencia"
      ]
      
      const isEmergency = emergencyKeywords.some(keyword => 
        aiMessage.toLowerCase().includes(keyword.toLowerCase())
      )

      console.log('[API Chat] ¿Es emergencia?', isEmergency)
      
      // Guardar mensaje del usuario en la BD
      if (currentConversacionId && messages.length > 0) {
        const lastUserMessage = messages[messages.length - 1]
        await supabase.from('mensaje_chat').insert({
          id_conversacion: currentConversacionId,
          rol: lastUserMessage.role,
          contenido: lastUserMessage.content,
          metadata: { timestamp: new Date().toISOString() }
        })
      }

      // Guardar respuesta del asistente con metadata de emergencia
      if (currentConversacionId) {
        await supabase.from('mensaje_chat').insert({
          id_conversacion: currentConversacionId,
          rol: 'assistant',
          contenido: aiMessage,
          metadata: {
            functionCall: false,
            emergencyDetected: isEmergency,
            timestamp: new Date().toISOString()
          }
        })

        // Actualizar fecha último mensaje
        await supabase
          .from('conversacion_chat')
          .update({ fecha_ultimo_mensaje: new Date().toISOString() })
          .eq('id_conversacion', currentConversacionId)
      }
      
      return NextResponse.json({
        message: aiMessage,
        shouldShowBooking: false,
        especialidadRecomendada: null,
        urgencia: null,
        sintomasDetectados: [],
        conversacionId: currentConversacionId,
        emergency: isEmergency, // 🔥 NUEVO: Flag de emergencia
        metadata: {
          functionCall: false,
          emergencyDetected: isEmergency
        }
      })
    }

  } catch (error) {
    console.error('Error en el chat:', error)
    return NextResponse.json(
      { 
        error: 'Error al procesar la solicitud',
        message: 'Lo siento, ocurrió un error. Por favor intenta de nuevo.'
      },
      { status: 500 }
    )
  }
}
