"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MessageSquare, Send, Bot, User } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ChatbotMedicoProps {
  pacienteId: string
}

export function ChatbotMedico({ pacienteId }: ChatbotMedicoProps) {
  const { toast } = useToast()
  const [messages, setMessages] = useState<Array<{ role: "user" | "bot"; content: string }>>([
    {
      role: "bot",
      content:
        "¡Hola! Soy EsSaludito, tu asistente médico de ESSALUD. Puedo ayudarte a identificar síntomas, recomendar especialistas, recetar medicamentos para enfermedades leves y ayudarte a agendar citas. ¿En qué puedo ayudarte hoy?",
    },
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSend = async () => {
    if (!input.trim()) return

    const userMessage = input.trim()
    setInput("")
    setMessages((prev) => [...prev, { role: "user", content: userMessage }])
    setLoading(true)

    // Simulación de respuesta del chatbot (en producción, usar AI SDK)
    setTimeout(() => {
      let botResponse = ""

      const lowerInput = userMessage.toLowerCase()

      if (
        lowerInput.includes("dolor de pecho") ||
        lowerInput.includes("dificultad para respirar") ||
        lowerInput.includes("sangrado") ||
        lowerInput.includes("desmayo") ||
        lowerInput.includes("convulsiones") ||
        lowerInput.includes("pérdida de conciencia")
      ) {
        botResponse =
          "⚠️ ALERTA: Los síntomas que describes son CRÍTICOS y requieren atención inmediata. Debes ir a EMERGENCIA ahora mismo o llamar a una ambulancia. No esperes más. ¿Necesitas ayuda para registrar tu triaje de emergencia?"
      } else if (
        lowerInput.includes("fiebre alta") ||
        lowerInput.includes("vómito") ||
        lowerInput.includes("dolor intenso") ||
        lowerInput.includes("mareos") ||
        lowerInput.includes("debilidad")
      ) {
        botResponse =
          "Estos síntomas requieren atención médica urgente. Te recomiendo agendar una cita lo antes posible. ¿Deseas que te ayude a registrar una cita urgente? Puedo recomendarte especialidades según tus síntomas."
      } else if (
        lowerInput.includes("dolor de cabeza") ||
        lowerInput.includes("resfriado") ||
        lowerInput.includes("gripe") ||
        lowerInput.includes("tos leve")
      ) {
        botResponse =
          "Para estos síntomas leves, te recomiendo: descansar, mantenerte hidratado, tomar paracetamol (500mg cada 6 horas) o ibuprofeno (400mg cada 8 horas). Si los síntomas persisten más de 3 días, agenda una cita con Medicina General."
      } else if (
        lowerInput.includes("hormigueo") ||
        lowerInput.includes("entumecimiento") ||
        lowerInput.includes("visión borrosa") ||
        lowerInput.includes("pérdida de memoria")
      ) {
        botResponse =
          "Estos síntomas podrían indicar varios problemas. Te recomiendo consultar con un especialista en Neurología para un diagnóstico preciso. ¿Deseas que te ayude a agendar una cita con Neurología?"
      } else if (
        lowerInput.includes("corazón") ||
        lowerInput.includes("presión") ||
        lowerInput.includes("palpitaciones")
      ) {
        botResponse =
          "Para problemas cardíacos o de presión arterial, necesitas consultar con un especialista en Cardiología. Ellos pueden hacer un diagnóstico completo. ¿Deseas agendar una cita con Cardiología?"
      } else if (
        lowerInput.includes("piel") ||
        lowerInput.includes("manchas") ||
        lowerInput.includes("acné") ||
        lowerInput.includes("picazón")
      ) {
        botResponse =
          "Para problemas dermatológicos, te recomiendo un especialista en Dermatología. ¿Deseas agendar una cita? Puedo ayudarte a encontrar disponibilidad."
      } else if (lowerInput.includes("niño") || lowerInput.includes("bebé") || lowerInput.includes("pediatría")) {
        botResponse =
          "Para consultas de niños y bebés, necesitas un especialista en Pediatría. ¿Deseas agendar una cita pediátrica?"
      } else if (lowerInput.includes("cabeza") || lowerInput.includes("migraña") || lowerInput.includes("neurología")) {
        botResponse =
          "Para problemas neurológicos como migrañas o dolores de cabeza persistentes, te recomiendo Neurología. ¿Deseas agendar una cita?"
      } else if (lowerInput.includes("cita") || lowerInput.includes("agendar") || lowerInput.includes("reservar")) {
        botResponse =
          "Perfecto, puedo ayudarte a agendar una cita. Ve a la sección 'Registrar Cita' en el menú superior, selecciona la especialidad que necesitas, y yo te recomendaré el médico disponible más cercano."
      } else {
        botResponse =
          "Entiendo tu consulta. Para poder ayudarte mejor, ¿podrías describir tus síntomas con más detalle? Por ejemplo: ¿tienes dolor?, ¿fiebre?, ¿cuánto tiempo llevas con estos síntomas? Esto me ayudará a recomendarte la mejor especialidad."
      }

      setMessages((prev) => [...prev, { role: "bot", content: botResponse }])
      setLoading(false)
    }, 1000)
  }

  return (
    <Card className="flex flex-col h-full max-h-[600px]">
      <CardHeader className="flex-shrink-0">
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          EsSaludito - Asistente Médico
        </CardTitle>
        <CardDescription>Consulta sobre síntomas, recibe recomendaciones y agenda citas</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col min-h-0">
        <div className="flex-1 overflow-y-auto space-y-4 mb-4 p-4 bg-muted/20 rounded-lg">
          {messages.map((message, index) => (
            <div key={index} className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}>
              {message.role === "bot" && (
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-5 h-5 text-primary" />
                </div>
              )}
              <div
                className={`max-w-xs rounded-lg p-3 break-words ${
                  message.role === "user" ? "bg-primary text-primary-foreground" : "bg-card border"
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              </div>
              {message.role === "user" && (
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-primary" />
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Bot className="w-5 h-5 text-primary" />
              </div>
              <div className="bg-card border rounded-lg p-3">
                <p className="text-sm text-muted-foreground">EsSaludito está pensando...</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2 flex-shrink-0">
          <Input
            placeholder="Describe tus síntomas o haz una pregunta a EsSaludito..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            disabled={loading}
          />
          <Button onClick={handleSend} disabled={loading || !input.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
