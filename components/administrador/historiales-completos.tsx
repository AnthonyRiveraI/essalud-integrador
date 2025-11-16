"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { FileText, Search, Calendar, User, Stethoscope, Pill, Download } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"

export function HistorialesCompletos() {
  const { toast } = useToast()
  const [historial, setHistorial] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [downloadingPaciente, setDownloadingPaciente] = useState<string | null>(null)

  useEffect(() => {
    loadHistorial()
  }, [])

  const loadHistorial = async () => {
    setLoading(true)
    const supabase = createClient()
    
    // Cargar todos los historiales
    const { data: historialData, error: historialError } = await supabase
      .from("historialclinico")
      .select("*")
      .limit(200)

    if (historialError || !historialData) {
      setLoading(false)
      return
    }

    // Obtener datos de pacientes y médicos para cada historial
    const historialConDatos = await Promise.all(
      historialData.map(async (registro) => {
        const { data: pacienteData, error: pacienteError } = await supabase
          .from("usuario")
          .select("id_usuario, nombre, apellido, dni, correo")
          .eq("id_usuario", registro.id_paciente)
          .maybeSingle()

        const { data: medicoData, error: medicoError } = await supabase
          .from("usuario")
          .select("id_usuario, nombre, apellido, correo")
          .eq("id_usuario", registro.id_medico)
          .maybeSingle()

        const { data: medicoInfo } = await supabase
          .from("medico")
          .select("especialidad")
          .eq("id_medico", registro.id_medico)
          .maybeSingle()

        return {
          ...registro,
          paciente: pacienteData || { nombre: "Usuario eliminado", apellido: "", dni: "N/A", correo: "N/A" },
          medico: medicoData ? {
            ...medicoData,
            especialidad: medicoInfo?.especialidad || "General",
          } : { nombre: "Médico eliminado", apellido: "", correo: "N/A" },
        }
      })
    )

    setHistorial(historialConDatos)
    setLoading(false)
  }

  const downloadHistorialPaciente = async (pacienteId: number, pacienteNombre: string) => {
    setDownloadingPaciente(pacienteId.toString())
    try {
      const supabase = createClient()
      const { data: historialData, error } = await supabase
        .from("historialclinico")
        .select("*")
        .eq("id_paciente", pacienteId)

      if (error || !historialData) {
        toast({
          title: "❌ Error al descargar",
          description: "No se pudo descargar el historial del paciente",
          variant: "destructive",
        })
        return
      }

      // Obtener datos completos para cada registro
      const data = await Promise.all(
        historialData.map(async (registro) => {
          const { data: pacienteData } = await supabase
            .from("usuario")
            .select("id_usuario, nombre, apellido, dni, correo")
            .eq("id_usuario", registro.id_paciente)
            .maybeSingle()

          const { data: medicoData } = await supabase
            .from("usuario")
            .select("id_usuario, nombre, apellido")
            .eq("id_usuario", registro.id_medico)
            .maybeSingle()

          const { data: medicoInfo } = await supabase
            .from("medico")
            .select("especialidad")
            .eq("id_medico", registro.id_medico)
            .maybeSingle()

          return {
            ...registro,
            paciente: pacienteData || { nombre: "Usuario eliminado", apellido: "", dni: "N/A", correo: "N/A" },
            medico: medicoData || { nombre: "Médico eliminado", apellido: "" },
            especialidad: medicoInfo?.especialidad || "General",
          }
        })
      )

      let csvContent = ""
      csvContent += "HISTORIAL CLÍNICO DEL PACIENTE\n"
      csvContent += "=".repeat(80) + "\n\n"
      csvContent += `DATOS DEL PACIENTE\n`
      csvContent += "-".repeat(80) + "\n"
      csvContent += `Nombre Completo: ${data[0].paciente.nombre} ${data[0].paciente.apellido}\n`
      csvContent += `DNI: ${data[0].paciente.dni}\n`
      csvContent += `Correo: ${data[0].paciente.correo || "-"}\n`
      csvContent += `Fecha de Descarga: ${new Date().toLocaleDateString("es-PE")} ${new Date().toLocaleTimeString("es-PE")}\n`
      csvContent += `Total de Registros: ${data.length}\n\n`

      csvContent += "REGISTROS MÉDICOS\n"
      csvContent += "-".repeat(80) + "\n\n"

      data.forEach((registro: any, index: number) => {
        csvContent += `REGISTRO ${index + 1}\n`
        csvContent += `Fecha: ${new Date(registro.fecha).toLocaleDateString("es-PE")} ${new Date(registro.fecha).toLocaleTimeString("es-PE")}\n`
        csvContent += `Especialidad: ${registro.especialidad}\n`
        csvContent += `Médico: Dr(a). ${registro.medico.nombre} ${registro.medico.apellido}\n`
        csvContent += `Diagnóstico: ${registro.diagnostico}\n`
        csvContent += `Receta Médica: ${registro.receta || "No aplica"}\n`
        csvContent += "-".repeat(80) + "\n\n"
      })

      // Descargar archivo
      const element = document.createElement("a")
      element.setAttribute("href", "data:text/csv;charset=utf-8," + encodeURIComponent(csvContent))
      element.setAttribute("download", `Historial_${pacienteNombre.replace(/\s+/g, "_")}_${new Date().getTime()}.csv`)
      element.style.display = "none"
      document.body.appendChild(element)
      element.click()
      document.body.removeChild(element)

      toast({
        title: "✅ Descarga completada",
        description: `Historial de ${pacienteNombre} descargado exitosamente`,
      })
    } catch (error) {
      console.error("[v0] Error descargando historial:", error)
      toast({
        title: "❌ Error al descargar",
        description: "No se pudo descargar el historial. Intenta nuevamente.",
        variant: "destructive",
      })
    } finally {
      setDownloadingPaciente(null)
    }
  }

  const filteredHistorial = historial.filter(
    (h) =>
      h.paciente?.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.paciente?.apellido?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.paciente?.dni?.includes(searchTerm) ||
      h.medico?.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.medico?.apellido?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.medico?.especialidad?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.diagnostico?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Agrupar por paciente para mostrar botón de descarga
  const pacientesPorHistorial = new Map()
  filteredHistorial.forEach((h) => {
    if (!pacientesPorHistorial.has(h.id_paciente)) {
      pacientesPorHistorial.set(h.id_paciente, {
        id: h.id_paciente,
        nombre: `${h.paciente.nombre} ${h.paciente.apellido}`,
        dni: h.paciente.dni,
        registros: [],
      })
    }
    pacientesPorHistorial.get(h.id_paciente).registros.push(h)
  })

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">Cargando historiales...</p>
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
              <FileText className="w-5 h-5" />
              Historiales Clínicos Completos
            </CardTitle>
            <CardDescription>
              Consulte todos los registros médicos del sistema y descargue por paciente •{" "}
              <span className="font-semibold text-primary">{historial.length}</span> registros totales
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por paciente, médico, DNI, especialidad o diagnóstico..."
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
                    <TableHead>ID Paciente</TableHead>
                    <TableHead>Nombre Paciente</TableHead>
                    <TableHead>DNI</TableHead>
                    <TableHead>Nombre Médico</TableHead>
                    <TableHead>Especialidad</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Diagnóstico</TableHead>
                    <TableHead>Receta Médica</TableHead>
                    <TableHead>Acción</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredHistorial.map((registro, index) => {
                    const mostrarBoton =
                      index === 0 || filteredHistorial[index - 1].id_paciente !== registro.id_paciente
                    return (
                      <TableRow key={registro.id_historial}>
                        <TableCell className="font-mono text-xs">{registro.id_paciente}</TableCell>
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
                              Dr(a). {registro.medico?.nombre} {registro.medico?.apellido}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>{registro.medico?.especialidad}</TableCell>
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
                        <TableCell>
                          {mostrarBoton && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                downloadHistorialPaciente(
                                  registro.id_paciente,
                                  `${registro.paciente.nombre} ${registro.paciente.apellido}`,
                                )
                              }
                              disabled={downloadingPaciente === registro.id_paciente.toString()}
                              className="gap-1 hover:bg-green-50 hover:text-green-600 hover:border-green-300 transition-colors"
                            >
                              <Download className="w-4 h-4" />
                              {downloadingPaciente === registro.id_paciente.toString() ? "Descargando..." : "Descargar"}
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
