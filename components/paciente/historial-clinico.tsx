"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { FileText, Calendar, User, Pill } from "lucide-react"

interface HistorialClinicoProps {
  pacienteId: string
}

export function HistorialClinico({ pacienteId }: HistorialClinicoProps) {
  const [historial, setHistorial] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadHistorial()
  }, [])

  const loadHistorial = async () => {
    setLoading(true)
    const supabase = createClient()
    const { data, error } = await supabase
      .from("historial_clinico")
      .select(
        `
        *,
        medico:medicos!historial_clinico_medico_id_fkey(
          usuario:usuarios!medicos_usuario_id_fkey(nombre, apellido)
        ),
        especialidad:especialidades!historial_clinico_especialidad_id_fkey(nombre)
      `,
      )
      .eq("paciente_id", pacienteId)
      .order("fecha", { ascending: false })

    if (!error && data) {
      setHistorial(data)
    }
    setLoading(false)
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">Cargando historial...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Historial Clínico
        </CardTitle>
        <CardDescription>Consulte su historial médico completo</CardDescription>
      </CardHeader>
      <CardContent>
        {historial.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No hay registros en su historial clínico</p>
          </div>
        ) : (
          <div className="space-y-4">
            {historial.map((registro) => (
              <div key={registro.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <h3 className="font-semibold">
                        Dr(a). {registro.medico.usuario.nombre} {registro.medico.usuario.apellido}
                      </h3>
                    </div>
                    <p className="text-sm text-muted-foreground">{registro.especialidad.nombre}</p>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(registro.fecha).toLocaleDateString("es-PE")}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div>
                    <h4 className="font-semibold text-sm mb-1">Diagnóstico:</h4>
                    <p className="text-sm text-muted-foreground">{registro.diagnostico}</p>
                  </div>

                  {registro.receta_medica && (
                    <div>
                      <h4 className="font-semibold text-sm mb-1 flex items-center gap-2">
                        <Pill className="w-4 h-4" />
                        Receta Médica:
                      </h4>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">{registro.receta_medica}</p>
                    </div>
                  )}

                  {registro.observaciones && (
                    <div>
                      <h4 className="font-semibold text-sm mb-1">Observaciones:</h4>
                      <p className="text-sm text-muted-foreground">{registro.observaciones}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
