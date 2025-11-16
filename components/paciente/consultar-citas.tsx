"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface ConsultarCitasProps {
  pacienteId: string
}

export function ConsultarCitas({ pacienteId }: ConsultarCitasProps) {
  const { toast } = useToast()
  const [citas, setCitas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [reprogramarCita, setReprogramarCita] = useState<any | null>(null)
  const [nuevaFecha, setNuevaFecha] = useState("")
  const [nuevaHora, setNuevaHora] = useState("")
  const [loadingReprogramar, setLoadingReprogramar] = useState(false)

  useEffect(() => {
    loadCitas()
  }, [])

  const loadCitas = async () => {
    setLoading(true)
    const supabase = createClient()
    
    // Primero obtener las citas
    const { data: citasData, error: citasError } = await supabase
      .from("cita")
      .select("*")
      .eq("id_paciente", pacienteId)
      .neq("estado", "Cancelada") // Valores válidos: 'Pendiente', 'Completada', 'Cancelada'
      .order("fecha", { ascending: true })
      .order("hora", { ascending: true })

    if (citasError || !citasData) {
      setLoading(false)
      return
    }

    // Luego obtener datos del médico para cada cita
    const citasConMedico = await Promise.all(
      citasData.map(async (cita) => {
        const { data: medicoData } = await supabase
          .from("medico")
          .select("*")
          .eq("id_medico", cita.id_medico)
          .single()

        // medico.id_medico ES el id_usuario
        const { data: usuarioData } = await supabase
          .from("usuario")
          .select("nombre, apellido")
          .eq("id_usuario", medicoData?.id_medico)
          .single()

        return {
          ...cita,
          medico: {
            ...medicoData,
            usuario: usuarioData
          }
        }
      })
    )

    setCitas(citasConMedico)
    setLoading(false)
  }

  const handleDelete = async () => {
    if (!deleteId) return

    const supabase = createClient()
    const { error } = await supabase.from("cita").update({ estado: "Cancelada" }).eq("id_cita", deleteId)

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

  const handleReprogramar = async () => {
    if (!reprogramarCita || !nuevaFecha || !nuevaHora) {
      toast({
        title: "⚠️ Campos incompletos",
        description: "Por favor complete la nueva fecha y hora",
        variant: "destructive",
      })
      return
    }

    setLoadingReprogramar(true)
    const supabase = createClient()
    
    const { error } = await supabase
      .from("cita")
      .update({ 
        fecha: nuevaFecha,
        hora: nuevaHora
      })
      .eq("id_cita", reprogramarCita.id_cita)

    if (error) {
      toast({
        title: "❌ Error al reprogramar",
        description: "No se pudo reprogramar la cita. Intenta nuevamente.",
        variant: "destructive",
      })
    } else {
      toast({
        title: "✅ Cita reprogramada",
        description: `La cita ha sido reprogramada para el ${new Date(nuevaFecha).toLocaleDateString('es-PE')} a las ${nuevaHora}`,
      })
      loadCitas()
      setReprogramarCita(null)
      setNuevaFecha("")
      setNuevaHora("")
    }
    setLoadingReprogramar(false)
  }

  const abrirReprogramar = (cita: any) => {
    setReprogramarCita(cita)
    // Convertir fecha a formato yyyy-MM-dd para el input type="date"
    const fechaFormateada = cita.fecha.split('T')[0]
    setNuevaFecha(fechaFormateada)
    setNuevaHora(cita.hora)
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
                <div key={cita.id_cita} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">
                        Dr(a). {cita.medico?.usuario?.nombre || "Sin asignar"} {cita.medico?.usuario?.apellido || ""}
                      </h3>
                      <p className="text-sm text-muted-foreground">{cita.medico?.especialidad || "Medicina General"}</p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        cita.estado === "Pendiente"
                          ? "bg-primary/10 text-primary"
                          : cita.estado === "Completada"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {cita.estado}
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

                  {cita.estado === "Pendiente" && (
                    <div className="flex gap-2 pt-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 bg-transparent"
                        onClick={() => abrirReprogramar(cita)}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Reprogramar
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        className="flex-1" 
                        onClick={() => setDeleteId(cita.id_cita)}
                      >
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

      <Dialog open={!!reprogramarCita} onOpenChange={() => setReprogramarCita(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reprogramar Cita</DialogTitle>
            <DialogDescription>
              Seleccione la nueva fecha y hora para su cita
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nueva-fecha">Nueva Fecha</Label>
              <Input
                id="nueva-fecha"
                type="date"
                value={nuevaFecha}
                onChange={(e) => setNuevaFecha(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="nueva-hora">Nueva Hora</Label>
              <Input
                id="nueva-hora"
                type="time"
                value={nuevaHora}
                onChange={(e) => setNuevaHora(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setReprogramarCita(null)}
              disabled={loadingReprogramar}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleReprogramar}
              disabled={loadingReprogramar}
            >
              {loadingReprogramar ? "Guardando..." : "Confirmar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
