'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, AlertCircle, CheckCircle2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface BookingSuggestionCardProps {
  especialidad: string
  urgencia: 'baja' | 'media' | 'alta' | 'urgente'
  sintomas: string[]
  onDismiss: () => void
}

const urgenciaConfig = {
  baja: {
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: CheckCircle2,
    texto: 'Puede esperar unos días'
  },
  media: {
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    icon: AlertCircle,
    texto: 'Se recomienda agendar pronto'
  },
  alta: {
    color: 'bg-orange-100 text-orange-800 border-orange-200',
    icon: AlertCircle,
    texto: 'Es importante agendar cuanto antes'
  },
  urgente: {
    color: 'bg-red-100 text-red-800 border-red-200',
    icon: AlertCircle,
    texto: 'Requiere atención inmediata'
  }
}

export function BookingSuggestionCard({ 
  especialidad, 
  urgencia, 
  sintomas,
  onDismiss 
}: BookingSuggestionCardProps) {
  const router = useRouter()
  const [isBooking, setIsBooking] = useState(false)
  
  const config = urgenciaConfig[urgencia]
  const Icon = config.icon

  const handleBookAppointment = () => {
    setIsBooking(true)
    // Navegar a la página de registro de citas con parámetros
    router.push(`/paciente/dashboard?tab=citas&especialidad=${encodeURIComponent(especialidad)}`)
  }

  if (urgencia === 'urgente') {
    return (
      <Card className="border-red-300 bg-red-50">
        <CardHeader>
          <div className="flex items-start gap-3">
            <AlertCircle className="h-6 w-6 text-red-600 mt-1" />
            <div>
              <CardTitle className="text-red-900">⚠️ Atención Urgente Requerida</CardTitle>
              <CardDescription className="text-red-700">
                Basado en tus síntomas, es importante que busques atención médica inmediata
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {sintomas.map((sintoma, idx) => (
              <Badge key={idx} variant="outline" className="bg-white border-red-300 text-red-800">
                {sintoma}
              </Badge>
            ))}
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-red-200">
            <p className="text-sm font-medium text-red-900 mb-2">
              📞 ¿Qué hacer?
            </p>
            <ul className="text-sm text-red-800 space-y-1">
              <li>• Llama a emergencias: <strong>106</strong> (SAMU)</li>
              <li>• Ve a la emergencia más cercana</li>
              <li>• Si estás en ESSALUD, acude a tu centro asistencial</li>
            </ul>
          </div>

          <Button 
            onClick={onDismiss} 
            variant="outline" 
            className="w-full border-red-300 hover:bg-red-100"
          >
            Entendido
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader>
        <div className="flex items-start gap-3">
          <Icon className="h-6 w-6 text-blue-600 mt-1" />
          <div className="flex-1">
            <CardTitle className="text-blue-900">💡 Recomendación de Consulta</CardTitle>
            <CardDescription className="text-blue-700">
              {config.texto}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Especialidad Recomendada */}
        <div className="bg-white rounded-lg p-4 border border-blue-200">
          <p className="text-sm font-medium text-gray-700 mb-2">
            Especialidad recomendada:
          </p>
          <Badge className="bg-blue-600 text-white text-base px-3 py-1">
            {especialidad}
          </Badge>
        </div>

        {/* Síntomas Detectados */}
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">
            Síntomas analizados:
          </p>
          <div className="flex flex-wrap gap-2">
            {sintomas.map((sintoma, idx) => (
              <Badge key={idx} variant="outline" className="bg-white border-blue-300">
                {sintoma}
              </Badge>
            ))}
          </div>
        </div>

        {/* Nivel de Urgencia */}
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">
            Nivel de urgencia:
          </p>
          <Badge className={cn('text-sm px-3 py-1', config.color)}>
            {urgencia.charAt(0).toUpperCase() + urgencia.slice(1)}
          </Badge>
        </div>

        {/* Botones de Acción */}
        <div className="flex gap-2 pt-2">
          <Button 
            onClick={handleBookAppointment}
            disabled={isBooking}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            <Calendar className="h-4 w-4 mr-2" />
            {isBooking ? 'Redirigiendo...' : 'Agendar Cita'}
          </Button>
          <Button 
            onClick={onDismiss}
            variant="outline"
            className="border-blue-300 hover:bg-blue-100"
          >
            Después
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ')
}
