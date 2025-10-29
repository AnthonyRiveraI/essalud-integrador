"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"
import { Calendar } from "lucide-react"

interface RegistrarCitaProps {
  pacienteId: string
}

export function RegistrarCita({ pacienteId }: RegistrarCitaProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [especialidades, setEspecialidades] = useState<any[]>([])
  const [medicos, setMedicos] = useState<any[]>([])
  const [selectedEspecialidad, setSelectedEspecialidad] = useState("")
  const [selectedMedico, setSelectedMedico] = useState("")
  const [fecha, setFecha] = useState("")
  const [hora, setHora] = useState("")
  const [boleta, setBoleta] = useState<any>(null)

  useEffect(() => {
    loadEspecialidades()
  }, [])

  useEffect(() => {
    if (selectedEspecialidad) {
      loadMedicos(selectedEspecialidad)
    }
  }, [selectedEspecialidad])

  const loadEspecialidades = async () => {
    const supabase = createClient()
    const { data, error } = await supabase.from("especialidades").select("*").order("nombre")

    if (!error && data) {
      setEspecialidades(data.filter((e) => e.nombre !== "Emergencia"))
    }
  }

  const loadMedicos = async (especialidadId: string) => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("medicos")
      .select(
        `
        *,
        usuario:usuarios!medicos_usuario_id_fkey(nombre, apellido)
      `,
      )
      .eq("especialidad_id", especialidadId)

    if (!error && data) {
      console.log("[Registrar Cita] Médicos cargados:", data)
      setMedicos(data)
    } else {
      console.error("[Registrar Cita] Error cargando médicos:", error)
      setMedicos([])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const supabase = createClient()

      // Verificar disponibilidad del médico
      const fechaSeleccionada = new Date(fecha)
      const diaSemana = fechaSeleccionada.getDay()

      const { data: horarios } = await supabase
        .from("horarios_medicos")
        .select("*")
        .eq("medico_id", selectedMedico)
        .eq("dia_semana", diaSemana)
        .eq("activo", true)

      if (!horarios || horarios.length === 0) {
        toast({
          title: "⚠️ Médico no disponible",
          description: "El médico no atiende en el día seleccionado",
          variant: "destructive",
        })
        setLoading(false)
        return
      }

      // Verificar límite de citas del día
      const { data: citasDelDia } = await supabase
        .from("citas")
        .select("*")
        .eq("medico_id", selectedMedico)
        .eq("fecha", fecha)
        .neq("estado", "cancelada")

      const { data: medicoData } = await supabase
        .from("medicos")
        .select("max_citas_dia")
        .eq("id", selectedMedico)
        .single()

      if (citasDelDia && medicoData && citasDelDia.length >= medicoData.max_citas_dia) {
        toast({
          title: "⚠️ Cupo lleno",
          description: "El médico ha alcanzado el máximo de citas para ese día",
          variant: "destructive",
        })
        setLoading(false)
        return
      }

      const timestamp = Date.now().toString().slice(-8) // Últimos 8 dígitos del timestamp
      const random = Math.random().toString(36).substr(2, 6).toUpperCase() // 6 caracteres aleatorios
      const codigoBoleta = `CITA-${timestamp}-${random}`

      // Crear la cita
      const { data: cita, error } = await supabase
        .from("citas")
        .insert({
          codigo_boleta: codigoBoleta,
          paciente_id: pacienteId,
          medico_id: selectedMedico,
          especialidad_id: selectedEspecialidad,
          fecha,
          hora,
          piso: Math.floor(Math.random() * 3) + 2, // Pisos 2-4
          puerta: `${Math.floor(Math.random() * 20) + 100}`, // Puertas 100-119
          estado: "programada",
        })
        .select(
          `
          *,
          medico:medicos!citas_medico_id_fkey(
            usuario:usuarios!medicos_usuario_id_fkey(nombre, apellido)
          ),
          especialidad:especialidades!citas_especialidad_id_fkey(nombre)
        `,
        )
        .single()

      if (error) throw error

      setBoleta(cita)
      toast({
        title: "✅ Cita registrada exitosamente",
        description: `Su cita con ${cita.medico.usuario.nombre} ${cita.medico.usuario.apellido} ha sido agendada`,
      })

      // Resetear formulario
      setSelectedEspecialidad("")
      setSelectedMedico("")
      setFecha("")
      setHora("")
    } catch (error) {
      console.error("[v0] Error al registrar cita:", error)
      toast({
        title: "❌ Error al registrar cita",
        description: "No se pudo registrar la cita. Intenta nuevamente.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (boleta) {
    return (
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-primary">Boleta de Cita Médica</CardTitle>
          <CardDescription>Guarde esta información para su consulta</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-primary/5 p-6 rounded-lg space-y-3">
            <div className="flex justify-between border-b pb-2">
              <span className="font-semibold">Código de Boleta:</span>
              <span className="font-mono">{boleta.codigo_boleta}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="font-semibold">Médico:</span>
              <span>
                Dr(a). {boleta.medico.usuario.nombre} {boleta.medico.usuario.apellido}
              </span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="font-semibold">Especialidad:</span>
              <span>{boleta.especialidad.nombre}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="font-semibold">Fecha:</span>
              <span>{new Date(boleta.fecha).toLocaleDateString("es-PE")}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="font-semibold">Hora:</span>
              <span>{boleta.hora}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="font-semibold">Piso:</span>
              <span>{boleta.piso}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold">Puerta:</span>
              <span>{boleta.puerta}</span>
            </div>
          </div>

          <Button onClick={() => setBoleta(null)} className="w-full">
            Registrar Nueva Cita
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Registrar Nueva Cita
        </CardTitle>
        <CardDescription>Complete los datos para agendar su cita médica</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="especialidad" className="text-sm font-medium">
              Especialidad <span className="text-destructive">*</span>
            </Label>
            <Select value={selectedEspecialidad} onValueChange={setSelectedEspecialidad} required>
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Seleccione una especialidad" />
              </SelectTrigger>
              <SelectContent>
                {especialidades.length === 0 ? (
                  <div className="p-2 text-sm text-muted-foreground text-center">
                    No hay especialidades disponibles
                  </div>
                ) : (
                  especialidades.map((esp) => (
                    <SelectItem key={esp.id} value={esp.id}>
                      {esp.nombre}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {selectedEspecialidad && (
            <div className="space-y-2">
              <Label htmlFor="medico" className="text-sm font-medium">
                Médico <span className="text-destructive">*</span>
              </Label>
              <Select value={selectedMedico} onValueChange={setSelectedMedico} required>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder={medicos.length > 0 ? "Seleccione un médico" : "No hay médicos disponibles"} />
                </SelectTrigger>
                <SelectContent>
                  {medicos.length === 0 ? (
                    <div className="p-2 text-sm text-muted-foreground text-center">
                      No hay médicos disponibles para esta especialidad
                    </div>
                  ) : (
                    medicos.map((med) => (
                      <SelectItem key={med.id} value={med.id}>
                        Dr(a). {med.usuario.nombre} {med.usuario.apellido}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fecha" className="text-sm font-medium">
                Fecha <span className="text-destructive">*</span>
              </Label>
              <Input
                id="fecha"
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                required
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="hora" className="text-sm font-medium">
                Hora <span className="text-destructive">*</span>
              </Label>
              <Input 
                id="hora" 
                type="time" 
                value={hora} 
                onChange={(e) => setHora(e.target.value)} 
                required 
                className="h-11"
              />
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full h-11 shadow-md hover:shadow-lg transition-all" 
            disabled={loading || !selectedMedico}
          >
            {loading ? "Registrando..." : "Registrar Cita"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
