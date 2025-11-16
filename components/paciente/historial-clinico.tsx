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
    
    // Primero obtener el historial
    const { data: historialData, error: historialError } = await supabase
      .from("historialclinico")
      .select("*")
      .eq("id_paciente", pacienteId)
      .order("fecha", { ascending: false })

    if (historialError || !historialData) {
      setLoading(false)
      return
    }

    // Luego obtener datos del médico para cada registro
    const historialConMedico = await Promise.all(
      historialData.map(async (registro) => {
        if (!registro.id_medico) {
          return registro
        }

        const { data: medicoData } = await supabase
          .from("medico")
          .select("*")
          .eq("id_medico", registro.id_medico)
          .single()

        // medico.id_medico ES el id_usuario
        const { data: usuarioData } = await supabase
          .from("usuario")
          .select("nombre, apellido")
          .eq("id_usuario", medicoData?.id_medico)
          .single()

        return {
          ...registro,
          medico: {
            ...medicoData,
            usuario: usuarioData
          }
        }
      })
    )

    setHistorial(historialConMedico)
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
            {historial.map((registro, index) => (
              <div key={registro.id_historial || index} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <h3 className="font-semibold">
                        Dr(a). {registro.medico.usuario.nombre} {registro.medico.usuario.apellido}
                      </h3>
                    </div>
                    <p className="text-sm text-muted-foreground">{registro.especialidad}</p>
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

                  {registro.receta && (
                    <div>
                      <h4 className="font-semibold text-sm mb-1 flex items-center gap-2">
                        <Pill className="w-4 h-4" />
                        Receta Médica:
                      </h4>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">{registro.receta}</p>
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
