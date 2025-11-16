"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"
import { FileText, Search, Calendar, User, Stethoscope, Pill } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export function HistorialGeneral() {
  const [historial, setHistorial] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    loadHistorial()
  }, [])

  const loadHistorial = async () => {
    setLoading(true)
    const supabase = createClient()
    
    console.log('🔍 Cargando historial general...')
    
    // Obtener historial
    const { data: historialData, error: historialError } = await supabase
      .from("historialclinico")
      .select("*")
      .order("fecha", { ascending: false })
      .limit(100)

    console.log('📊 Historial obtenido:', { 
      registros: historialData?.length || 0, 
      error: historialError 
    })

    if (historialError || !historialData) {
      setHistorial([])
      setLoading(false)
      return
    }

    // Obtener datos completos para cada registro
    const historialCompleto = await Promise.all(
      historialData.map(async (registro) => {
        // Obtener datos del paciente
        const { data: pacienteData } = await supabase
          .from("paciente")
          .select("*")
          .eq("id_paciente", registro.id_paciente)
          .single()

        const { data: usuarioPaciente } = await supabase
          .from("usuario")
          .select("nombre, apellido, dni")
          .eq("id_usuario", pacienteData?.id_paciente)
          .single()

        // Obtener datos del médico
        const { data: medicoData } = await supabase
          .from("medico")
          .select("*")
          .eq("id_medico", registro.id_medico)
          .single()

        const { data: usuarioMedico } = await supabase
          .from("usuario")
          .select("nombre, apellido")
          .eq("id_usuario", medicoData?.id_medico)
          .single()

        return {
          ...registro,
          paciente: {
            ...pacienteData,
            ...usuarioPaciente
          },
          medico: {
            ...medicoData,
            usuario: usuarioMedico
          }
        }
      })
    )

    console.log('✅ Historial completo cargado:', historialCompleto.length)
    setHistorial(historialCompleto)
    setLoading(false)
  }

  const filteredHistorial = historial.filter(
    (h) =>
      h.paciente?.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.paciente?.apellido?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.paciente?.dni?.includes(searchTerm) ||
      h.medico?.usuario?.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.medico?.usuario?.apellido?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.medico?.especialidad?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

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
          Historial Médico General
        </CardTitle>
        <CardDescription>
          Consulte el historial clínico completo de todos los pacientes •{" "}
          <span className="font-semibold text-primary">{historial.length}</span> registros
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por paciente, médico, DNI o especialidad..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-11"
            />
          </div>
          {searchTerm && (
            <p className="text-sm text-muted-foreground mt-2">
              Mostrando <span className="font-semibold text-primary">{filteredHistorial.length}</span> de{" "}
              {historial.length} registros
            </p>
          )}
        </div>

        {filteredHistorial.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No se encontraron registros</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Paciente</TableHead>
                    <TableHead>DNI</TableHead>
                    <TableHead>Médico</TableHead>
                    <TableHead>Especialidad</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Diagnóstico</TableHead>
                    <TableHead>Receta</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredHistorial.map((registro) => (
                    <TableRow key={registro.id_historial}>
                      <TableCell className="font-mono text-xs">{registro.id_historial}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">
                            {registro.paciente?.nombre} {registro.paciente?.apellido}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{registro.paciente?.dni}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Stethoscope className="w-4 h-4 text-muted-foreground" />
                          <span>
                            Dr(a). {registro.medico?.usuario?.nombre} {registro.medico?.usuario?.apellido}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{registro.medico?.especialidad || '-'}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">{new Date(registro.fecha).toLocaleDateString("es-PE")}</span>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <p className="text-sm text-muted-foreground truncate">{registro.diagnostico}</p>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        {registro.receta ? (
                          <div className="flex items-center gap-2">
                            <Pill className="w-4 h-4 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground truncate">{registro.receta}</p>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
