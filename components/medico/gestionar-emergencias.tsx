"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { 
  AlertCircle, 
  User, 
  Activity, 
  Clock, 
  Bed,
  CheckCircle,
  XCircle,
  Heart,
  Thermometer,
  Wind,
  RefreshCw
} from "lucide-react"

interface GestionarEmergenciasProps {
  medicoId?: string
}

export function GestionarEmergencias({ medicoId }: GestionarEmergenciasProps) {
  const { toast } = useToast()
  const [emergencias, setEmergencias] = useState<any[]>([])
  const [camasDisponibles, setCamasDisponibles] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    await Promise.all([loadEmergencias(), loadCamasDisponibles()])
    setLoading(false)
  }

  const loadEmergencias = async () => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("triaje")
      .select(`
        *,
        paciente:paciente!triaje_id_paciente_fkey(*)
      `)
      .in("estado_paciente", ["en_atencion", "estable"])
      .order("created_at", { ascending: false })

    if (!error && data) {
      console.log('🚨 Emergencias activas:', data)
      setEmergencias(data)
    } else if (error) {
      console.error('❌ Error al cargar emergencias:', error)
    }
  }

  const loadCamasDisponibles = async () => {
    const supabase = createClient()
    const { count } = await supabase
      .from("camas_emergencia")
      .select("*", { count: "exact", head: true })
      .eq("estado", "disponible")

    if (count !== null) {
      setCamasDisponibles(count)
    }
  }

  const handleLiberarCama = async (triajeId: string, camaNumero: string) => {
    const supabase = createClient()
    
    // Actualizar triaje
    const { error: triajeError } = await supabase
      .from("triaje")
      .update({ estado_paciente: "de_alta" })
      .eq("id_triaje", triajeId)

    if (triajeError) {
      toast({
        title: "❌ Error",
        description: "No se pudo actualizar el estado del paciente",
        variant: "destructive",
      })
      return
    }

    // Liberar cama
    const { error: camaError } = await supabase
      .from("camas_emergencia")
      .update({
        estado: "disponible",
        id_triaje: null,
        fecha_ocupacion: null,
      })
      .eq("numero_cama", camaNumero)

    if (camaError) {
      toast({
        title: "⚠️ Advertencia",
        description: "Paciente dado de alta pero hubo un problema al liberar la cama",
        variant: "destructive",
      })
    } else {
      toast({
        title: "✅ Cama liberada",
        description: `La cama ${camaNumero} está ahora disponible`,
      })
    }

    await loadData()
  }

  const getNivelUrgenciaColor = (nivel: string) => {
    switch (nivel) {
      case "critico": return "bg-red-600 text-white"
      case "urgente": return "bg-orange-500 text-white"
      case "menos_urgente": return "bg-yellow-500 text-black"
      case "no_urgente": return "bg-green-500 text-white"
      default: return "bg-gray-500 text-white"
    }
  }

  const getNivelUrgenciaLabel = (nivel: string) => {
    switch (nivel) {
      case "critico": return "🔴 Crítico"
      case "urgente": return "🟠 Urgente"
      case "menos_urgente": return "🟡 Menos Urgente"
      case "no_urgente": return "🟢 No Urgente"
      default: return nivel
    }
  }

  return (
    <div className="space-y-6">
      {/* Header con estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pacientes en Emergencia</p>
                <p className="text-3xl font-bold">{emergencias.length}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Camas Disponibles</p>
                <p className="text-3xl font-bold">{camasDisponibles}/20</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Bed className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Camas Ocupadas</p>
                <p className="text-3xl font-bold">{20 - camasDisponibles}/20</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <Activity className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Emergencias */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-destructive" />
                Pacientes en Emergencia
              </CardTitle>
              <CardDescription>
                Gestione los pacientes actualmente en el área de emergencias
              </CardDescription>
            </div>
            <Button onClick={loadData} variant="outline" className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Actualizar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Cargando emergencias...</p>
            </div>
          ) : emergencias.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 mx-auto text-green-500 mb-4" />
              <p className="text-muted-foreground">No hay pacientes en emergencia actualmente</p>
            </div>
          ) : (
            <div className="space-y-4">
              {emergencias.map((emergencia) => (
                <div 
                  key={emergencia.id} 
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center shrink-0">
                        <User className="w-6 h-6 text-red-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-lg">
                            {emergencia.paciente 
                              ? `${emergencia.paciente.nombre || ''} ${emergencia.paciente.apellido || ''}`
                              : emergencia.nombre_temporal || "Paciente sin identificar"}
                          </h3>
                          <Badge className={getNivelUrgenciaColor(emergencia.nivel_urgencia)}>
                            {getNivelUrgenciaLabel(emergencia.nivel_urgencia)}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          {emergencia.paciente?.dni && (
                            <span>DNI: {emergencia.paciente.dni}</span>
                          )}
                          {emergencia.edad_aproximada && (
                            <span>Edad: {emergencia.edad_aproximada} años</span>
                          )}
                          {emergencia.cama_asignada && (
                            <span className="flex items-center gap-1">
                              <Bed className="w-4 h-4" />
                              Cama: {emergencia.cama_asignada}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {new Date(emergencia.created_at || emergencia.fecha).toLocaleString("es-PE")}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Signos Vitales */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 bg-muted/50 p-3 rounded-lg">
                    {emergencia.presion_arterial && (
                      <div className="flex items-center gap-2">
                        <Heart className="w-4 h-4 text-red-500" />
                        <div>
                          <p className="text-xs text-muted-foreground">Presión</p>
                          <p className="text-sm font-semibold">{emergencia.presion_arterial}</p>
                        </div>
                      </div>
                    )}
                    {emergencia.frecuencia_cardiaca && (
                      <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-blue-500" />
                        <div>
                          <p className="text-xs text-muted-foreground">FC</p>
                          <p className="text-sm font-semibold">{emergencia.frecuencia_cardiaca} lpm</p>
                        </div>
                      </div>
                    )}
                    {emergencia.temperatura && (
                      <div className="flex items-center gap-2">
                        <Thermometer className="w-4 h-4 text-orange-500" />
                        <div>
                          <p className="text-xs text-muted-foreground">Temp</p>
                          <p className="text-sm font-semibold">{emergencia.temperatura}°C</p>
                        </div>
                      </div>
                    )}
                    {emergencia.saturacion_oxigeno && (
                      <div className="flex items-center gap-2">
                        <Wind className="w-4 h-4 text-cyan-500" />
                        <div>
                          <p className="text-xs text-muted-foreground">SpO2</p>
                          <p className="text-sm font-semibold">{emergencia.saturacion_oxigeno}%</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Síntomas */}
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold mb-1">Síntomas:</h4>
                    <p className="text-sm text-muted-foreground">{emergencia.sintomas}</p>
                  </div>

                  {/* Acciones */}
                  <div className="flex gap-2 justify-end pt-3 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleLiberarCama(emergencia.id_triaje.toString(), emergencia.cama_asignada)}
                      className="gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Dar de Alta y Liberar Cama
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
