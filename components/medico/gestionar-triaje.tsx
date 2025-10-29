"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import { AlertCircle, User, Heart, Thermometer, Wind } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface GestionarTriajeProps {
  medicoId: string
}

export function GestionarTriaje({ medicoId }: GestionarTriajeProps) {
  const { toast } = useToast()
  const [triajes, setTriajes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTriajes()
  }, [])

  const loadTriajes = async () => {
    setLoading(true)
    const supabase = createClient()

    const { data, error } = await supabase
      .from("triaje")
      .select(
        `
        *,
        paciente:usuarios!triaje_paciente_id_fkey(nombre, apellido, dni)
      `,
      )
      .eq("estado", "en_atencion")
      .order("created_at", { ascending: false })

    if (!error && data) {
      setTriajes(data)
    }
    setLoading(false)
  }

  const handleAlta = async (triajeId: string) => {
    const supabase = createClient()
    const { error } = await supabase.from("triaje").update({ estado: "alta_medica" }).eq("id", triajeId)

    if (error) {
      toast({
        title: "Error",
        description: "No se pudo dar de alta",
        variant: "destructive",
      })
      return
    }

    toast({
      title: "Éxito",
      description: "Paciente dado de alta",
    })
    loadTriajes()
  }

  const getUrgencyColor = (nivel: string) => {
    switch (nivel) {
      case "critico":
        return "bg-red-100 text-red-800"
      case "urgente":
        return "bg-orange-100 text-orange-800"
      case "menos_urgente":
        return "bg-yellow-100 text-yellow-800"
      case "no_urgente":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">Cargando triajes...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-600" />
          Gestión de Triaje
        </CardTitle>
        <CardDescription>Pacientes en atención de emergencia</CardDescription>
      </CardHeader>
      <CardContent>
        {triajes.length === 0 ? (
          <div className="text-center py-8">
            <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No hay pacientes en triaje</p>
          </div>
        ) : (
          <div className="space-y-4">
            {triajes.map((triaje) => (
              <div key={triaje.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">
                        {triaje.paciente?.nombre} {triaje.paciente?.apellido} || {triaje.nombre_temporal}
                      </h3>
                      {triaje.paciente?.dni && (
                        <p className="text-sm text-muted-foreground">DNI: {triaje.paciente.dni}</p>
                      )}
                      <p className="text-sm text-muted-foreground">Edad: {triaje.edad_aproximada} años</p>
                    </div>
                  </div>
                  <Badge className={getUrgencyColor(triaje.nivel_urgencia)}>
                    {triaje.nivel_urgencia.toUpperCase()}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  {triaje.temperatura && (
                    <div className="flex items-center gap-2">
                      <Thermometer className="w-4 h-4 text-muted-foreground" />
                      <span>{triaje.temperatura}°C</span>
                    </div>
                  )}
                  {triaje.frecuencia_cardiaca && (
                    <div className="flex items-center gap-2">
                      <Heart className="w-4 h-4 text-muted-foreground" />
                      <span>{triaje.frecuencia_cardiaca} lpm</span>
                    </div>
                  )}
                  {triaje.saturacion_oxigeno && (
                    <div className="flex items-center gap-2">
                      <Wind className="w-4 h-4 text-muted-foreground" />
                      <span>{triaje.saturacion_oxigeno}%</span>
                    </div>
                  )}
                  {triaje.presion_arterial && (
                    <div className="text-xs">
                      <span className="font-semibold">PA:</span> {triaje.presion_arterial}
                    </div>
                  )}
                </div>

                <div>
                  <p className="text-sm font-semibold mb-1">Síntomas:</p>
                  <p className="text-sm text-muted-foreground">{triaje.sintomas}</p>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                    Ver Historial
                  </Button>
                  <Button size="sm" className="flex-1" onClick={() => handleAlta(triaje.id)}>
                    Dar de Alta
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
