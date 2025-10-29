"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"
import { FileText, Search, Plus, Calendar, User, Pill } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface HistorialClinicoMedicoProps {
  medicoId: string
  especialidadId: number
}

export function HistorialClinicoMedico({ medicoId, especialidadId }: HistorialClinicoMedicoProps) {
  const { toast } = useToast()
  const [historial, setHistorial] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchDni, setSearchDni] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedPaciente, setSelectedPaciente] = useState<any>(null)
  const [formData, setFormData] = useState({
    diagnostico: "",
    recetaMedica: "",
    observaciones: "",
    estadoPaciente: "estable",
    fechaMuerte: "",
  })

  useEffect(() => {
    loadHistorial()
  }, [])

  const loadHistorial = async () => {
    setLoading(true)
    const supabase = createClient()
    
    console.log('🔍 Cargando historial clínico para médico:', medicoId)
    
    const { data, error } = await supabase
      .from("historial_clinico")
      .select(
        `
        *,
        paciente:usuarios!historial_clinico_paciente_id_fkey(nombre, apellido, dni),
        especialidad:especialidades!historial_clinico_especialidad_id_fkey(nombre)
      `,
      )
      .eq("medico_id", medicoId)
      .order("fecha", { ascending: false })

    console.log('📊 Resultado historial clínico:', {
      registrosEncontrados: data?.length || 0,
      data: data,
      error: error
    })

    if (!error && data) {
      setHistorial(data)
    }
    setLoading(false)
  }

  const handleSearch = async () => {
    if (!searchDni.trim()) {
      toast({
        title: "⚠️ DNI requerido",
        description: "Por favor ingrese el DNI del paciente para buscar",
        variant: "destructive",
      })
      return
    }

    console.log('🔍 Buscando paciente con DNI:', searchDni)

    const supabase = createClient()
    const { data, error } = await supabase
      .from("usuarios")
      .select("*")
      .eq("dni", searchDni)
      .eq("rol", "paciente")
      .maybeSingle() // Cambiado de .single() a .maybeSingle() para evitar error 406

    console.log('👤 Resultado búsqueda paciente:', {
      pacienteEncontrado: !!data,
      data: data,
      error: error
    })

    if (error) {
      console.error('❌ Error en búsqueda:', error)
      toast({
        title: "❌ Error en la búsqueda",
        description: error.message || "Ocurrió un error al buscar el paciente",
        variant: "destructive",
      })
      return
    }

    if (!data) {
      toast({
        title: "❌ Paciente no encontrado",
        description: `No se encontró un paciente con DNI: ${searchDni}`,
        variant: "destructive",
      })
      return
    }

    setSelectedPaciente(data)
    setDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedPaciente) return

    const supabase = createClient()

    const triageUpdate: any = { estado_paciente: formData.estadoPaciente }
    if (formData.estadoPaciente === "fallecido" && formData.fechaMuerte) {
      triageUpdate.fecha_muerte = formData.fechaMuerte
    }

    // Buscar triaje del paciente si existe
    const { data: triageData } = await supabase
      .from("triaje")
      .select("id")
      .eq("paciente_id", selectedPaciente.id)
      .single()

    if (triageData) {
      await supabase.from("triaje").update(triageUpdate).eq("id", triageData.id)
    }

    const { error } = await supabase.from("historial_clinico").insert({
      paciente_id: selectedPaciente.id,
      medico_id: medicoId,
      especialidad_id: especialidadId,
      fecha: new Date().toISOString(),
      diagnostico: formData.diagnostico,
      receta_medica: formData.recetaMedica,
      observaciones: formData.observaciones,
    })

    if (error) {
      toast({
        title: "❌ Error al guardar",
        description: "No se pudo guardar el registro en el historial clínico",
        variant: "destructive",
      })
      return
    }

    toast({
      title: "✅ Registro guardado exitosamente",
      description: `Historial clínico de ${selectedPaciente.nombre} ${selectedPaciente.apellido} actualizado`,
    })

    setFormData({
      diagnostico: "",
      recetaMedica: "",
      observaciones: "",
      estadoPaciente: "estable",
      fechaMuerte: "",
    })
    setDialogOpen(false)
    setSelectedPaciente(null)
    setSearchDni("")
    loadHistorial()
  }

  const filteredHistorial = searchDni ? historial.filter((h) => h.paciente.dni.includes(searchDni)) : historial
  
  console.log('📋 Mostrando historiales:', {
    totalHistoriales: historial.length,
    dniBusqueda: searchDni,
    historialesFiltrados: filteredHistorial.length,
    registros: filteredHistorial
  })

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Historial Clínico
          </CardTitle>
          <CardDescription>Consulte y registre diagnósticos, recetas y estado del paciente</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 mb-6">
            <div className="flex gap-2">
              <div className="flex-1 space-y-2">
                <Label htmlFor="search-dni" className="text-sm font-medium">
                  Buscar Paciente por DNI
                </Label>
                <Input
                  id="search-dni"
                  placeholder="Ingrese DNI del paciente (8 dígitos)..."
                  value={searchDni}
                  onChange={(e) => setSearchDni(e.target.value)}
                  maxLength={8}
                  className="h-11"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleSearch()
                    }
                  }}
                />
              </div>
              <Button 
                onClick={handleSearch}
                className="h-11 gap-2 shadow-md hover:shadow-lg transition-all self-end"
              >
                <Search className="w-4 h-4" />
                Buscar
              </Button>
            </div>
            {historial.length > 0 && (
              <p className="text-sm text-muted-foreground">
                Total de registros: <span className="font-semibold text-primary">{filteredHistorial.length}</span>
                {searchDni && ` (filtrado por DNI: ${searchDni})`}
              </p>
            )}
          </div>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader className="bg-linear-to-r from-blue-50 to-cyan-50 -m-6 mb-4 p-6 rounded-t-lg">
                <DialogTitle className="text-xl flex items-center gap-2">
                  <Plus className="w-5 h-5 text-blue-600" />
                  Nuevo Registro Clínico
                </DialogTitle>
                <DialogDescription>
                  {selectedPaciente &&
                    `Paciente: ${selectedPaciente.nombre} ${selectedPaciente.apellido} - DNI: ${selectedPaciente.dni}`}
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="diagnostico" className="text-sm font-medium">
                    Diagnóstico <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="diagnostico"
                    placeholder="Describa el diagnóstico del paciente..."
                    value={formData.diagnostico}
                    onChange={(e) => setFormData({ ...formData, diagnostico: e.target.value })}
                    required
                    rows={4}
                    className="resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="recetaMedica" className="text-sm font-medium">
                    Receta Médica
                  </Label>
                  <Textarea
                    id="recetaMedica"
                    placeholder="Medicamentos, dosis y frecuencia..."
                    value={formData.recetaMedica}
                    onChange={(e) => setFormData({ ...formData, recetaMedica: e.target.value })}
                    rows={4}
                    className="resize-none"
                  />
                  <p className="text-xs text-muted-foreground">Ejemplo: Paracetamol 500mg cada 8 horas por 5 días</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="estadoPaciente" className="text-sm font-medium">
                    Estado del Paciente
                  </Label>
                  <Select
                    value={formData.estadoPaciente}
                    onValueChange={(value) => setFormData({ ...formData, estadoPaciente: value })}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="estable">Estable</SelectItem>
                      <SelectItem value="en_coma">En Coma</SelectItem>
                      <SelectItem value="en_rehabilitacion">En Rehabilitación</SelectItem>
                      <SelectItem value="de_alta">De Alta</SelectItem>
                      <SelectItem value="fallecido">Fallecido</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.estadoPaciente === "fallecido" && (
                  <div className="space-y-2">
                    <Label htmlFor="fechaMuerte" className="text-sm font-medium">
                      Fecha de Muerte <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="fechaMuerte"
                      type="date"
                      value={formData.fechaMuerte}
                      onChange={(e) => setFormData({ ...formData, fechaMuerte: e.target.value })}
                      required
                      className="h-11"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="observaciones" className="text-sm font-medium">
                    Observaciones
                  </Label>
                  <Textarea
                    id="observaciones"
                    placeholder="Observaciones adicionales..."
                    value={formData.observaciones}
                    onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                    rows={3}
                    className="resize-none"
                  />
                </div>

                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="h-11">
                    Cancelar
                  </Button>
                  <Button type="submit" className="h-11 shadow-md hover:shadow-lg transition-all">
                    <Plus className="w-4 h-4 mr-2" />
                    Guardar Registro
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          {loading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Cargando historial...</p>
            </div>
          ) : filteredHistorial.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No hay registros en el historial</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredHistorial.map((registro) => (
                <div key={registro.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                        <User className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">
                          {registro.paciente.nombre} {registro.paciente.apellido}
                        </h3>
                        <p className="text-sm text-muted-foreground">DNI: {registro.paciente.dni}</p>
                      </div>
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
    </div>
  )
}
