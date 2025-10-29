"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"
import { UserPlus, Bed, AlertCircle } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export function DarAlta() {
  const { toast } = useToast()
  const [pacientesHospitalizados, setPacientesHospitalizados] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPaciente, setSelectedPaciente] = useState<string | null>(null)

  useEffect(() => {
    loadPacientes()
  }, [])

  const loadPacientes = async () => {
    setLoading(true)
    const supabase = createClient()
    const { data, error } = await supabase
      .from("triaje")
      .select(
        `
        *,
        paciente:usuarios(nombre, apellido, dni)
      `,
      )
      .eq("estado", "hospitalizado")
      .order("created_at", { ascending: false })

    if (!error && data) {
      setPacientesHospitalizados(data)
    }
    setLoading(false)
  }

  const handleDarAlta = async () => {
    if (!selectedPaciente) return

    const supabase = createClient()

    // Obtener información del triaje
    const { data: triajeData } = await supabase
      .from("triaje")
      .select("cama_asignada")
      .eq("id", selectedPaciente)
      .single()

    if (!triajeData) return

    // Actualizar estado del triaje
    const { error: triajeError } = await supabase.from("triaje").update({ estado: "alta" }).eq("id", selectedPaciente)

    if (triajeError) {
      toast({
        title: "❌ Error al dar de alta",
        description: "No se pudo dar de alta al paciente. Intenta nuevamente.",
        variant: "destructive",
      })
      return
    }

    // Liberar la cama
    if (triajeData.cama_asignada) {
      await supabase
        .from("camas_emergencia")
        .update({
          estado: "disponible",
          paciente_triaje_id: null,
          fecha_ocupacion: null,
        })
        .eq("numero_cama", triajeData.cama_asignada)
    }

    toast({
      title: "✅ Alta médica registrada",
      description: "El paciente ha sido dado de alta y la cama está disponible",
    })

    setSelectedPaciente(null)
    loadPacientes()
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">Cargando pacientes...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Dar de Alta a Pacientes Hospitalizados
          </CardTitle>
          <CardDescription>
            Gestione las altas médicas y libere camas de emergencia •{" "}
            <span className="font-semibold text-primary">{pacientesHospitalizados.length}</span> pacientes hospitalizados
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pacientesHospitalizados.length === 0 ? (
            <div className="text-center py-8">
              <Bed className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No hay pacientes hospitalizados actualmente</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pacientesHospitalizados.map((paciente) => (
                <div key={paciente.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">
                        {paciente.paciente
                          ? `${paciente.paciente.nombre} ${paciente.paciente.apellido}`
                          : paciente.nombre_temporal}
                      </h3>
                      {paciente.paciente && (
                        <p className="text-sm text-muted-foreground">DNI: {paciente.paciente.dni}</p>
                      )}
                      {paciente.edad_aproximada && (
                        <p className="text-sm text-muted-foreground">Edad: {paciente.edad_aproximada} años</p>
                      )}
                    </div>
                    <Badge
                      variant={
                        paciente.nivel_urgencia === "critico"
                          ? "destructive"
                          : paciente.nivel_urgencia === "urgente"
                            ? "default"
                            : "secondary"
                      }
                    >
                      {paciente.nivel_urgencia.charAt(0).toUpperCase() + paciente.nivel_urgencia.slice(1)}
                    </Badge>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Bed className="w-4 h-4 text-muted-foreground" />
                      <span>Cama: {paciente.cama_asignada}</span>
                    </div>
                    <div>
                      <span className="font-semibold">Síntomas: </span>
                      <span className="text-muted-foreground">{paciente.sintomas}</span>
                    </div>
                    {paciente.presion_arterial && (
                      <div>
                        <span className="font-semibold">Presión Arterial: </span>
                        <span className="text-muted-foreground">{paciente.presion_arterial}</span>
                      </div>
                    )}
                  </div>

                  <Button
                    variant="default"
                    className="w-full h-11 shadow-md hover:shadow-lg transition-all"
                    onClick={() => setSelectedPaciente(paciente.id)}
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Dar de Alta
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!selectedPaciente} onOpenChange={() => setSelectedPaciente(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-primary" />
              Confirmar Alta Médica
            </AlertDialogTitle>
            <AlertDialogDescription>
              ¿Está seguro de dar de alta a este paciente? La cama quedará disponible para nuevos ingresos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDarAlta}>Confirmar Alta</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
