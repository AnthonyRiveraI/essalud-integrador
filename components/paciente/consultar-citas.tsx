"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"
import { Calendar, Clock, MapPin, Trash2, Edit } from "lucide-react"
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

interface ConsultarCitasProps {
  pacienteId: string
}

export function ConsultarCitas({ pacienteId }: ConsultarCitasProps) {
  const { toast } = useToast()
  const [citas, setCitas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  useEffect(() => {
    loadCitas()
  }, [])

  const loadCitas = async () => {
    setLoading(true)
    const supabase = createClient()
    const { data, error } = await supabase
      .from("citas")
      .select(
        `
        *,
        medico:medicos!citas_medico_id_fkey(
          usuario:usuarios!medicos_usuario_id_fkey(nombre, apellido)
        ),
        especialidad:especialidades!citas_especialidad_id_fkey(nombre)
      `,
      )
      .eq("paciente_id", pacienteId)
      .neq("estado", "cancelada")
      .order("fecha", { ascending: true })
      .order("hora", { ascending: true })

    if (!error && data) {
      setCitas(data)
    }
    setLoading(false)
  }

  const handleDelete = async () => {
    if (!deleteId) return

    const supabase = createClient()
    const { error } = await supabase.from("citas").update({ estado: "cancelada" }).eq("id", deleteId)

    if (error) {
      toast({
        title: "❌ Error al cancelar",
        description: "No se pudo cancelar la cita. Intenta nuevamente.",
        variant: "destructive",
      })
    } else {
      toast({
        title: "✅ Cita cancelada",
        description: "La cita ha sido cancelada exitosamente",
      })
      loadCitas()
    }
    setDeleteId(null)
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
    <>
      <Card>
        <CardHeader>
          <CardTitle>Mis Citas Programadas</CardTitle>
          <CardDescription>
            Consulte, reprograme o cancele sus citas médicas •{" "}
            <span className="font-semibold text-primary">{citas.length}</span> citas activas
          </CardDescription>
        </CardHeader>
        <CardContent>
          {citas.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No tiene citas programadas</p>
            </div>
          ) : (
            <div className="space-y-4">
              {citas.map((cita) => (
                <div key={cita.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">
                        Dr(a). {cita.medico.usuario.nombre} {cita.medico.usuario.apellido}
                      </h3>
                      <p className="text-sm text-muted-foreground">{cita.especialidad.nombre}</p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        cita.estado === "programada"
                          ? "bg-primary/10 text-primary"
                          : cita.estado === "completada"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {cita.estado.charAt(0).toUpperCase() + cita.estado.slice(1)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span>{new Date(cita.fecha).toLocaleDateString("es-PE")}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span>{cita.hora}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span>
                        Piso {cita.piso}, Puerta {cita.puerta}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs">{cita.codigo_boleta}</span>
                    </div>
                  </div>

                  {cita.estado === "programada" && (
                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                        <Edit className="w-4 h-4 mr-2" />
                        Reprogramar
                      </Button>
                      <Button variant="destructive" size="sm" className="flex-1" onClick={() => setDeleteId(cita.id)}>
                        <Trash2 className="w-4 h-4 mr-2" />
                        Cancelar
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Cancelar cita?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. La cita será cancelada permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No, mantener</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Sí, cancelar cita</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
