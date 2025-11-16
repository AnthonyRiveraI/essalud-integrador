'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, AlertTriangle, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react'

interface InlineBookingCardProps {
  especialidad: string
  urgencia: 'baja' | 'media' | 'alta' | 'urgente'
  sintomas: string[]
  onBookAppointment?: (especialidad: string) => void // 🔥 NUEVO callback
}

const urgenciaConfig = {
  baja: {
    color: 'bg-green-100 text-green-800 border-green-300',
    icon: CheckCircle2,
    texto: 'No urgente',
    iconColor: 'text-green-600'
  },
  media: {
    color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    icon: AlertCircle,
    texto: 'Moderada',
    iconColor: 'text-yellow-600'
  },
  alta: {
    color: 'bg-orange-100 text-orange-800 border-orange-300',
    icon: AlertTriangle,
    texto: 'Alta',
    iconColor: 'text-orange-600'
  },
  urgente: {
    color: 'bg-red-100 text-red-800 border-red-300',
    icon: AlertTriangle,
    texto: '¡Urgente!',
    iconColor: 'text-red-600'
  }
}

export function InlineBookingCard({ especialidad, urgencia, sintomas, onBookAppointment }: InlineBookingCardProps) {
  const config = urgenciaConfig[urgencia]
  const Icon = config.icon

  const handleBookAppointment = () => {
    if (onBookAppointment) {
      onBookAppointment(especialidad)
    }
  }

  if (urgencia === 'urgente') {
    return (
      <div className="my-3 p-4 bg-red-50 border-2 border-red-300 rounded-xl">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-6 w-6 text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-semibold text-red-900 mb-1">⚠️ Atención Urgente Requerida</h4>
            <p className="text-sm text-red-800 mb-3">
              Tus síntomas requieren atención inmediata. Por favor:
            </p>
            <ul className="text-sm text-red-800 space-y-1 mb-3">
              <li>• Llama a emergencias: <strong>106</strong> (SAMU)</li>
              <li>• Ve a la emergencia más cercana</li>
              <li>• Si estás en ESSALUD, acude a tu centro asistencial</li>
            </ul>
            <div className="flex flex-wrap gap-1.5">
              {sintomas.map((sintoma, idx) => (
                <Badge key={idx} variant="outline" className="bg-white border-red-300 text-red-800 text-xs">
                  {sintoma}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="my-3 p-4 bg-blue-50 border-2 border-blue-300 rounded-xl">
      {/* Badge de Agente IA */}
      <div className="flex items-center gap-2 mb-3">
        <Badge variant="secondary" className="bg-purple-100 text-purple-700 border-purple-300">
          <Sparkles className="h-3 w-3 mr-1" />
          Recomendación del Agente IA
        </Badge>
      </div>
      
      <div className="flex items-start gap-3 mb-3">
        <Icon className={`h-5 w-5 shrink-0 mt-0.5 ${config.iconColor}`} />
        <div className="flex-1">
          <h4 className="font-semibold text-blue-900 text-sm mb-1">
            💡 Análisis Completado
          </h4>
          <p className="text-xs text-blue-700">
            He analizado tus síntomas y tengo una recomendación médica para ti
          </p>
        </div>
      </div>

      <div className="space-y-2.5">
        {/* Especialidad */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-blue-900">Especialidad:</span>
          <Badge className="bg-blue-600 text-white text-xs">
            {especialidad}
          </Badge>
        </div>

        {/* Urgencia */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-blue-900">Urgencia:</span>
          <Badge className={`text-xs ${config.color}`}>
            {config.texto}
          </Badge>
        </div>

        {/* Síntomas */}
        {sintomas.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {sintomas.map((sintoma, idx) => (
              <Badge key={idx} variant="outline" className="bg-white border-blue-300 text-blue-800 text-xs">
                {sintoma}
              </Badge>
            ))}
          </div>
        )}

        {/* Botón de Acción */}
        <Button 
          onClick={handleBookAppointment}
          size="sm"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white mt-2"
        >
          <Calendar className="h-3.5 w-3.5 mr-1.5" />
          Agendar Cita con {especialidad}
        </Button>
      </div>
    </div>
  )
}
