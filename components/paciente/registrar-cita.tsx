"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
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
  preselectedEspecialidad?: string | null
  onEspecialidadUsed?: () => void
}

export function RegistrarCita({ pacienteId, preselectedEspecialidad, onEspecialidadUsed }: RegistrarCitaProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [especialidades, setEspecialidades] = useState<any[]>([])
  const [medicos, setMedicos] = useState<any[]>([])
  const [selectedEspecialidad, setSelectedEspecialidad] = useState("")
  const [selectedMedico, setSelectedMedico] = useState("")
  const [fecha, setFecha] = useState("")
  const [hora, setHora] = useState("")
  const [boleta, setBoleta] = useState<any>(null)
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadEspecialidades()
  }, [])

  // Pre-seleccionar especialidad cuando llega desde el chatbot
  useEffect(() => {
    if (preselectedEspecialidad && especialidades.length > 0) {
      const especialidadMatch = especialidades.find(
        e => e.nombre.toLowerCase() === preselectedEspecialidad.toLowerCase()
      )
      if (especialidadMatch) {
        setSelectedEspecialidad(especialidadMatch.id)
        onEspecialidadUsed?.() // Limpiar el parámetro de la URL
        
        // Scroll suave al formulario
        setTimeout(() => {
          cardRef.current?.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
          })
        }, 100)
        
        // Mostrar notificación
        toast({
          title: "✅ Especialidad Pre-seleccionada",
          description: `Se ha seleccionado automáticamente: ${especialidadMatch.nombre}`,
        })
      }
    }
  }, [preselectedEspecialidad, especialidades, onEspecialidadUsed, toast])

  useEffect(() => {
    if (selectedEspecialidad) {
      loadMedicos(selectedEspecialidad)
    }
  }, [selectedEspecialidad])

  const loadEspecialidades = async () => {
    const supabase = createClient()
    // Obtener especialidades únicas de los médicos
    const { data, error } = await supabase
      .from("medico")
      .select("especialidad")
      .order("especialidad")

    if (!error && data) {
      // Obtener especialidades únicas
      const uniqueEspecialidades = [...new Set(data.map(m => m.especialidad))]
        .filter(e => e && e !== "Emergencia")
        .map((e, index) => ({ id: index.toString(), nombre: e }))
      
      setEspecialidades(uniqueEspecialidades)
    }
  }

  const loadMedicos = async (especialidadId: string) => {
    const supabase = createClient()
    // Buscar el nombre de la especialidad
    const especialidadNombre = especialidades.find(e => e.id === especialidadId)?.nombre
    
    // Primero obtener los médicos
    const { data: medicosData, error: medicosError } = await supabase
      .from("medico")
      .select("*")
      .eq("especialidad", especialidadNombre)

    if (medicosError || !medicosData) {
      console.error("[Registrar Cita] Error cargando médicos:", medicosError)
      setMedicos([])
      return
    }

    // Luego obtener los datos de usuario para cada médico
    const medicosConUsuario = await Promise.all(
      medicosData.map(async (medico) => {
        // En tu schema, medico.id_medico ES el id_usuario
        const { data: usuarioData } = await supabase
          .from("usuario")
          .select("nombre, apellido")
          .eq("id_usuario", medico.id_medico)
          .single()

        return {
          ...medico,
          usuario: usuarioData || { nombre: "Sin asignar", apellido: "" }
        }
      })
    )

    console.log("[Registrar Cita] Médicos cargados:", medicosConUsuario)
    console.log("[Registrar Cita] Primer médico detallado:", JSON.stringify(medicosConUsuario[0], null, 2))
    setMedicos(medicosConUsuario)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const supabase = createClient()

      // NOTA: Comentado porque la tabla horarios_medicos no existe en el schema actual
      // Si necesitas esta funcionalidad, deberás crear la tabla primero
      /*
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
      */

      // Verificar límite de citas del día
      const { data: citasDelDia } = await supabase
        .from("cita")
        .select("*")
        .eq("id_medico", selectedMedico)
        .eq("fecha", fecha)
        .neq("estado", "cancelada")

      const { data: medicoLimite } = await supabase
        .from("medico")
        .select("max_pacientes_dia")
        .eq("id_medico", selectedMedico)
        .single()

      if (citasDelDia && medicoLimite && citasDelDia.length >= medicoLimite.max_pacientes_dia) {
        toast({
          title: "⚠️ Cupo lleno",
          description: "El médico ha alcanzado el máximo de citas para ese día",
          variant: "destructive",
        })
        setLoading(false)
        return
      }

      // Generar código único de boleta
      const timestamp = Date.now().toString().slice(-8) // Últimos 8 dígitos del timestamp
      const random = Math.random().toString(36).substr(2, 6).toUpperCase() // 6 caracteres aleatorios
      const codigoBoleta = `CITA-${timestamp}-${random}`

      // Crear la cita
      const { data: cita, error } = await supabase
        .from("cita")
        .insert({
          codigo_boleta: codigoBoleta,
          id_paciente: pacienteId,
          id_medico: selectedMedico,
          fecha,
          hora,
          tipo: "Normal", // Tipo válido: 'Normal' o 'Emergencia'
          piso: Math.floor(Math.random() * 3) + 2, // Pisos 2-4
          puerta: `${Math.floor(Math.random() * 20) + 100}`, // Puertas 100-119
          estado: "Pendiente", // Estado válido: 'Pendiente', 'Completada', 'Cancelada'
        })
        .select("*")
        .single()

      if (error) throw error

      // Obtener datos del médico para mostrar en el mensaje
      const { data: medicoData } = await supabase
        .from("medico")
        .select("*")
        .eq("id_medico", selectedMedico)
        .single()

      // medico.id_medico ES el id_usuario
      const { data: usuarioMedico } = await supabase
        .from("usuario")
        .select("nombre, apellido")
        .eq("id_usuario", medicoData?.id_medico)
        .single()

      setBoleta(cita)
      toast({
        title: "✅ Cita registrada exitosamente",
        description: `Su cita con Dr(a). ${usuarioMedico?.nombre} ${usuarioMedico?.apellido} ha sido agendada. Código de boleta: ${codigoBoleta}`,
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
              <span className="font-mono text-primary">{boleta.codigo_boleta}</span>
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
            <div className="flex justify-between border-b pb-2">
              <span className="font-semibold">Puerta:</span>
              <span>{boleta.puerta}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold">Estado:</span>
              <span className="text-green-600 font-medium">✓ Programada</span>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Importante:</strong> Guarde su código de boleta <span className="font-mono font-bold">{boleta.codigo_boleta}</span> para futuras consultas.
            </p>
          </div>

          <Button onClick={() => setBoleta(null)} className="w-full">
            Registrar Nueva Cita
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card ref={cardRef} className={preselectedEspecialidad && selectedEspecialidad ? "ring-2 ring-blue-500 ring-offset-2 transition-all" : ""}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Registrar Nueva Cita
        </CardTitle>
        <CardDescription>Complete los datos para agendar su cita médica</CardDescription>
        
        {/* Banner informativo si viene desde el chatbot */}
        {preselectedEspecialidad && selectedEspecialidad && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg animate-in fade-in slide-in-from-top-2 duration-500">
            <p className="text-sm text-blue-900 flex items-center gap-2">
              <span className="text-lg">🤖</span>
              <span>
                <strong>ESSALUDITO</strong> ha recomendado esta especialidad basándose en tus síntomas
              </span>
            </p>
          </div>
        )}
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
                      <SelectItem key={med.id_medico} value={med.id_medico.toString()}>
                        Dr(a). {med.usuario?.nombre || "Sin nombre"} {med.usuario?.apellido || ""}
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
