"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import { Calendar, Clock, User, MapPin, CheckCircle, Search } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface CitasDelDiaProps {
  medicoId: number
  maxCitasDia: number
}

export function CitasDelDia({ medicoId, maxCitasDia }: CitasDelDiaProps) {
  const { toast } = useToast()
  const [citas, setCitas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])
  const [tempDate, setTempDate] = useState(new Date().toISOString().split("T")[0])

  useEffect(() => {
    console.log('🚀 Iniciando componente Citas del Día')
    console.log('📅 Fecha inicial:', new Date().toISOString().split("T")[0])
    loadCitas()
  }, [])

  const loadCitas = async (dateToSearch?: string) => {
    setLoading(true)
    const supabase = createClient()
    const searchDate = dateToSearch || selectedDate

    console.log('🔍 Buscando citas para:', {
      medicoId,
      fecha: searchDate,
      fechaFormateada: new Date(searchDate).toLocaleDateString('es-PE')
    })

    // Obtener citas
    const { data: citasData, error: citasError } = await supabase
      .from("cita")
      .select("*")
      .eq("id_medico", medicoId)
      .eq("fecha", searchDate)
      .neq("estado", "Cancelada")
      .order("hora", { ascending: true })

    console.log('📊 Resultado de citas:', {
      encontradas: citasData?.length || 0,
      citas: citasData,
      error: citasError
    })

    if (citasError || !citasData) {
      setCitas([])
      setLoading(false)
      return
    }

    // Obtener datos de paciente para cada cita
    const citasConPaciente = await Promise.all(
      citasData.map(async (cita) => {
        const { data: pacienteData } = await supabase
          .from("paciente")
          .select("*")
          .eq("id_paciente", cita.id_paciente)
          .single()

        const { data: usuarioData } = await supabase
          .from("usuario")
          .select("nombre, apellido, dni, telefono")
          .eq("id_usuario", pacienteData?.id_paciente)
          .single()

        return {
          ...cita,
          paciente: {
            ...pacienteData,
            ...usuarioData
          }
        }
      })
    )

    setCitas(citasConPaciente)
    setLoading(false)
  }

  const handleBuscarCitas = () => {
    setSelectedDate(tempDate)
    loadCitas(tempDate)
  }

  const handleVerHoy = () => {
    const hoy = new Date().toISOString().split("T")[0]
    setTempDate(hoy)
    setSelectedDate(hoy)
    loadCitas(hoy)
  }

  const handleMarcarAtendido = async (citaId: number) => {
    const supabase = createClient()
    const { error } = await supabase
      .from("cita")
      .update({ estado: "Completada" })
      .eq("id_cita", citaId)

    if (error) {
      toast({
        title: "❌ Error al marcar",
        description: "No se pudo marcar la cita como atendida",
        variant: "destructive",
      })
      return
    }

    toast({
      title: "✅ Cita atendida",
      description: "La cita fue marcada como atendida exitosamente",
    })
    loadCitas()
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">Cargando citas...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Mis Citas del Día
            </CardTitle>
            <CardDescription>
              <span className="font-semibold text-primary">{citas.length}</span> de {maxCitasDia} citas programadas
            </CardDescription>
          </div>
          <Badge variant={citas.length >= maxCitasDia ? "destructive" : citas.length > maxCitasDia * 0.7 ? "default" : "secondary"}>
            {citas.length}/{maxCitasDia}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex gap-2 items-end">
            <div className="flex-1 space-y-2">
              <Label htmlFor="fecha" className="text-sm font-medium">
                Seleccionar Fecha
              </Label>
              <Input
                id="fecha"
                type="date"
                value={tempDate}
                onChange={(e) => setTempDate(e.target.value)}
                className="h-11"
              />
            </div>
            <Button 
              onClick={handleBuscarCitas} 
              className="h-11 gap-2 shadow-md hover:shadow-lg transition-all"
            >
              <Search className="w-4 h-4" />
              Buscar
            </Button>
            <Button 
              variant="outline" 
              onClick={handleVerHoy}
              className="h-11 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 transition-colors"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Hoy
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Mostrando citas del: <span className="font-semibold text-primary">
              {new Date(selectedDate).toLocaleDateString("es-PE", { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </span>
          </p>
        </div>

        {citas.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No tiene citas programadas para esta fecha</p>
          </div>
        ) : (
          <div className="space-y-4">
            {citas.map((cita) => (
              <div key={cita.id} className="border rounded-lg p-4 space-y-3 hover:bg-muted/50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">
                        {cita.paciente.nombre} {cita.paciente.apellido}
                      </h3>
                      <p className="text-sm text-muted-foreground">DNI: {cita.paciente.dni}</p>
                      {cita.paciente.telefono && (
                        <p className="text-sm text-muted-foreground">Tel: {cita.paciente.telefono}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 items-end">
                    <Badge
                      variant={
                        cita.estado === "programada"
                          ? "default"
                          : cita.estado === "completada"
                            ? "secondary"
                            : "outline"
                      }
                    >
                      {cita.estado.charAt(0).toUpperCase() + cita.estado.slice(1)}
                    </Badge>
                    {!cita.atendido && cita.estado === "programada" && (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleMarcarAtendido(cita.id)}
                        className="gap-1 hover:bg-green-50 hover:text-green-600 hover:border-green-300 transition-colors"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Atendido
                      </Button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="font-semibold">{cita.hora}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span>
                      Piso {cita.piso}, Puerta {cita.puerta}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t">
                  <p className="text-xs text-muted-foreground">Código: {cita.codigo_boleta}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
