"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MessageSquare, Send, Loader2, RefreshCw, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ChatMessage } from "./chat-message"
import { InlineBookingCard } from "./inline-booking-card"
import { EmergencyDialog } from "@/components/emergency-dialog"

interface Message {
  role: "user" | "assistant"
  content: string
  timestamp: Date
  bookingSuggestion?: {
    especialidad: string
    urgencia: 'baja' | 'media' | 'alta' | 'urgente'
    sintomas: string[]
  }
  isEmergency?: boolean // 🔥 NUEVO: Marca mensajes de emergencia
}

interface ChatbotMedicoProps {
  pacienteId: string
  onBookAppointment?: (especialidad: string) => void // 🔥 NUEVO callback
}

export function ChatbotMedico({ pacienteId, onBookAppointment }: ChatbotMedicoProps) {
  const { toast } = useToast()
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "¡Hola! 👋 Soy ESSALUDITO, tu asistente médico virtual de ESSALUD.\n\nPuedo ayudarte a:\n• Orientarte sobre síntomas\n• Recomendar especialidades médicas\n• Ayudarte a agendar citas\n• Dar consejos de autocuidado\n\n¿Cómo te sientes hoy? ¿En qué puedo ayudarte?",
      timestamp: new Date()
    },
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [conversacionId, setConversacionId] = useState<number | null>(null)
  const [showEmergencyDialog, setShowEmergencyDialog] = useState(false) // 🔥 NUEVO
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-scroll al final cuando hay nuevos mensajes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Enfocar input después de enviar
  useEffect(() => {
    if (!loading) {
      inputRef.current?.focus()
    }
  }, [loading])

  const handleSend = async () => {
    if (!input.trim() || loading) return

    const userMessage = input.trim()
    setInput("")
    
    const newUserMessage: Message = {
      role: "user",
      content: userMessage,
      timestamp: new Date()
    }
    
    setMessages((prev) => [...prev, newUserMessage])
    setLoading(true)

    try {
      // Preparar mensajes para el API
      const apiMessages = [...messages, newUserMessage].map(msg => ({
        role: msg.role,
        content: msg.content
      }))

      // Llamar al API de chat
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: apiMessages,
          pacienteId,
          conversacionId // Enviar ID de conversación actual
        })
      })

      if (!response.ok) {
        throw new Error('Error en la respuesta del servidor')
      }

      const data = await response.json()

      // Guardar ID de conversación si es nueva
      if (data.conversacionId && !conversacionId) {
        setConversacionId(data.conversacionId)
        console.log('[Chatbot] Conversación iniciada:', data.conversacionId)
      }

      console.log('[Chatbot] 🤖 Respuesta del agente:', {
        usedTool: data.metadata?.functionCall,
        toolName: data.metadata?.toolUsed,
        especialidad: data.especialidadRecomendada,
        urgencia: data.urgencia,
        sintomas: data.sintomasDetectados,
        emergency: data.emergency // 🔥 NUEVO
      })

      // Agregar respuesta del asistente
      const assistantMessage: Message = {
        role: "assistant",
        content: data.message,
        timestamp: new Date(),
        // Incluir sugerencia de cita en el mensaje si existe
        bookingSuggestion: data.shouldShowBooking && data.especialidadRecomendada ? {
          especialidad: data.especialidadRecomendada,
          urgencia: data.urgencia,
          sintomas: data.sintomasDetectados
        } : undefined,
        // 🔥 NUEVO: Marcar si es emergencia
        isEmergency: data.emergency
      }
      
      setMessages((prev) => [...prev, assistantMessage])

    } catch (error) {
      console.error('Error al enviar mensaje:', error)
      toast({
        title: "Error",
        description: "No pude procesar tu mensaje. Por favor intenta de nuevo.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRestart = () => {
    setMessages([
      {
        role: "assistant",
        content:
          "¡Hola! 👋 Soy ESSALUDITO, tu asistente médico virtual de ESSALUD.\n\nPuedo ayudarte a:\n• Orientarte sobre síntomas\n• Recomendar especialidades médicas\n• Ayudarte a agendar citas\n• Dar consejos de autocuidado\n\n¿Cómo te sientes hoy? ¿En qué puedo ayudarte?",
        timestamp: new Date()
      }
    ])
    setConversacionId(null) // Reset conversación
    setInput("")
    
    toast({
      title: "Nueva conversación iniciada",
      description: "El historial anterior se ha guardado"
    })
  }

  return (
    <div className="space-y-4">
      {/* Chat Principal */}
      <Card className="flex flex-col h-full max-h-[600px]">
        <CardHeader className="shrink-0 border-b">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-blue-600" />
                ESSALUDITO - Asistente Médico IA
              </CardTitle>
              <CardDescription>
                Orientación médica inteligente con Google Gemini
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRestart}
              disabled={loading}
              title="Reiniciar conversación"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col min-h-0 p-0">
          {/* Área de Mensajes */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {messages.map((message, index) => (
              <div key={index}>
                <ChatMessage
                  role={message.role}
                  content={message.content}
                  timestamp={message.timestamp}
                />
                {/* Mostrar tarjeta de cita inline si existe */}
                {message.bookingSuggestion && (
                  <div className="ml-11">
                    <InlineBookingCard
                      especialidad={message.bookingSuggestion.especialidad}
                      urgencia={message.bookingSuggestion.urgencia}
                      sintomas={message.bookingSuggestion.sintomas}
                      onBookAppointment={onBookAppointment}
                    />
                  </div>
                )}
                {/* 🔥 NUEVO: Mostrar botón de emergencia si se detectó */}
                {message.isEmergency && (
                  <div className="ml-11 mt-3">
                    <Button
                      variant="destructive"
                      size="lg"
                      className="w-full animate-pulse shadow-lg"
                      onClick={() => setShowEmergencyDialog(true)}
                    >
                      <AlertCircle className="w-5 h-5 mr-2" />
                      🚨 REGISTRAR EMERGENCIA AHORA
                    </Button>
                    <p className="text-xs text-muted-foreground text-center mt-2">
                      O llama al <strong>106</strong> para ambulancia
                    </p>
                  </div>
                )}
              </div>
            ))}
            
            {loading && (
              <div className="flex gap-3 py-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  ESSALUDITO está analizando...
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input de Mensaje */}
          <div className="shrink-0 border-t p-4">
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                placeholder="Describe tus síntomas o haz una pregunta..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    handleSend()
                  }
                }}
                disabled={loading}
                className="flex-1"
              />
              <Button 
                onClick={handleSend} 
                disabled={loading || !input.trim()}
                size="icon"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              💡 Presiona Enter para enviar • Shift+Enter para nueva línea
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 🔥 NUEVO: Diálogo de emergencia */}
      <EmergencyDialog
        open={showEmergencyDialog}
        onOpenChange={setShowEmergencyDialog}
        pacienteId={pacienteId}
      />
    </div>
  )
}
