"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import { FileText, Search, Calendar, User, Stethoscope, Pill, FileSpreadsheet, Filter } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import * as XLSX from 'xlsx'

export function HistorialesCompletos() {
  const { toast } = useToast()
  const [historial, setHistorial] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [downloadingAll, setDownloadingAll] = useState(false)
  
  // Filtros de fecha
  const [fechaInicio, setFechaInicio] = useState("")
  const [fechaFin, setFechaFin] = useState("")
  const [showFilters, setShowFilters] = useState(false)

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
      .order('fecha', { ascending: false })
      .limit(500)

    if (historialError || !historialData) {
      setLoading(false)
      return
    }

    // Obtener datos de pacientes y médicos para cada historial
    const historialConDatos = await Promise.all(
      historialData.map(async (registro) => {
        const { data: pacienteData } = await supabase
          .from("usuario")
          .select("id_usuario, nombre, apellido, dni, correo")
          .eq("id_usuario", registro.id_paciente)
          .maybeSingle()

        const { data: medicoData } = await supabase
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
          } : { nombre: "Médico eliminado", apellido: "", correo: "N/A", especialidad: "N/A" },
        }
      })
    )

    setHistorial(historialConDatos)
    setLoading(false)
  }

  const downloadAllAsExcel = async () => {
    setDownloadingAll(true)
    try {
      // Filtrar data según rango de fechas
      let dataToExport = filteredHistorial

      // Preparar datos para Excel
      const excelData = dataToExport.map((registro, index) => ({
        'N°': index + 1,
        'Fecha': new Date(registro.fecha).toLocaleString('es-PE', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        }),
        'ID Paciente': registro.id_paciente,
        'Paciente': `${registro.paciente.nombre} ${registro.paciente.apellido}`,
        'DNI Paciente': registro.paciente.dni,
        'Correo Paciente': registro.paciente.correo || '-',
        'Médico': `Dr(a). ${registro.medico.nombre} ${registro.medico.apellido}`,
        'Especialidad': registro.medico.especialidad,
        'Diagnóstico': registro.diagnostico,
        'Receta Médica': registro.receta || 'No aplica',
      }))

      // Crear libro de trabajo
      const wb = XLSX.utils.book_new()
      
      // Crear hoja con los datos
      const ws = XLSX.utils.json_to_sheet(excelData)

      // Ajustar ancho de columnas
      const columnWidths = [
        { wch: 5 },  // N°
        { wch: 18 }, // Fecha
        { wch: 12 }, // ID Paciente
        { wch: 25 }, // Paciente
        { wch: 12 }, // DNI
        { wch: 30 }, // Correo
        { wch: 25 }, // Médico
        { wch: 20 }, // Especialidad
        { wch: 50 }, // Diagnóstico
        { wch: 50 }, // Receta
      ]
      ws['!cols'] = columnWidths

      // Agregar hoja al libro
      XLSX.utils.book_append_sheet(wb, ws, 'Historiales Clínicos')

      // Generar nombre del archivo
      let fileName = 'Historiales_Completos'
      if (fechaInicio && fechaFin) {
        fileName += `_${fechaInicio}_a_${fechaFin}`
      }
      fileName += `_${new Date().toISOString().split('T')[0]}.xlsx`

      // Descargar archivo
      XLSX.writeFile(wb, fileName)

      toast({
        title: "✅ Exportación exitosa",
        description: `${dataToExport.length} registros exportados a Excel`,
      })
    } catch (error) {
      console.error("Error exportando a Excel:", error)
      toast({
        title: "❌ Error al exportar",
        description: "No se pudo generar el archivo Excel",
        variant: "destructive",
      })
    } finally {
      setDownloadingAll(false)
    }
  }


  const clearFilters = () => {
    setFechaInicio("")
    setFechaFin("")
    setSearchTerm("")
  }

  // Aplicar filtros
  let filteredHistorial = historial.filter(
    (h) =>
      h.paciente?.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.paciente?.apellido?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.paciente?.dni?.includes(searchTerm) ||
      h.medico?.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.medico?.apellido?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.medico?.especialidad?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.diagnostico?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Filtrar por rango de fechas
  if (fechaInicio) {
    filteredHistorial = filteredHistorial.filter(h => {
      const fechaRegistro = new Date(h.fecha).toISOString().split('T')[0]
      return fechaRegistro >= fechaInicio
    })
  }

  if (fechaFin) {
    filteredHistorial = filteredHistorial.filter(h => {
      const fechaRegistro = new Date(h.fecha).toISOString().split('T')[0]
      return fechaRegistro <= fechaFin
    })
  }

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
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2"
            >
              <Filter className="w-4 h-4" />
              {showFilters ? 'Ocultar' : 'Filtros'}
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={downloadAllAsExcel}
              disabled={downloadingAll || filteredHistorial.length === 0}
              className="gap-2 bg-green-600 hover:bg-green-700"
            >
              <FileSpreadsheet className="w-4 h-4" />
              {downloadingAll ? 'Exportando...' : 'Exportar a Excel'}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filtros */}
        {showFilters && (
          <div className="mb-6 p-4 border rounded-lg bg-muted/50">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Filtrar por Rango de Fechas
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="fecha-inicio">Fecha Inicio</Label>
                <Input
                  id="fecha-inicio"
                  type="date"
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="fecha-fin">Fecha Fin</Label>
                <Input
                  id="fecha-fin"
                  type="date"
                  value={fechaFin}
                  onChange={(e) => setFechaFin(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="w-full"
                >
                  Limpiar Filtros
                </Button>
              </div>
            </div>
            {(fechaInicio || fechaFin) && (
              <p className="text-xs text-muted-foreground mt-2">
                {fechaInicio && fechaFin 
                  ? `Mostrando registros desde ${new Date(fechaInicio).toLocaleDateString('es-PE')} hasta ${new Date(fechaFin).toLocaleDateString('es-PE')}`
                  : fechaInicio 
                  ? `Mostrando registros desde ${new Date(fechaInicio).toLocaleDateString('es-PE')}`
                  : `Mostrando registros hasta ${new Date(fechaFin).toLocaleDateString('es-PE')}`
                }
              </p>
            )}
          </div>
        )}

        {/* Búsqueda */}
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
          {(searchTerm || fechaInicio || fechaFin) && (
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
            {(searchTerm || fechaInicio || fechaFin) && (
              <Button variant="link" onClick={clearFilters} className="mt-2">
                Limpiar filtros
              </Button>
            )}
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
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredHistorial.map((registro, index) => {
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
