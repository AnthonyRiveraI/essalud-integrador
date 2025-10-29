"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"
import { AlertCircle, AlertTriangle } from "lucide-react"

interface EmergencyDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  pacienteId?: string
  pacienteNombre?: string
}

export function EmergencyDialog({ open, onOpenChange, pacienteId, pacienteNombre }: EmergencyDialogProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [camasDisponibles, setCamasDisponibles] = useState(0)
  const [formData, setFormData] = useState({
    nombreTemporal: "",
    edadAproximada: "",
    nivelUrgencia: "critico",
    sintomas: "",
    presionArterial: "",
    frecuenciaCardiaca: "",
    temperatura: "",
    saturacionOxigeno: "",
  })

  useEffect(() => {
    if (open) {
      loadCamasDisponibles()
      if (pacienteId) {
        setFormData((prev) => ({
          ...prev,
          nombreTemporal: pacienteNombre || "",
        }))
      }
    }
  }, [open, pacienteId, pacienteNombre])

  const loadCamasDisponibles = async () => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("camas_emergencia")
      .select("*", { count: "exact" })
      .eq("estado", "disponible")

    if (!error && data) {
      setCamasDisponibles(data.length)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const supabase = createClient()

      // Verificar camas disponibles
      const { data: camasDisponiblesData, error: camasError } = await supabase
        .from("camas_emergencia")
        .select("*")
        .eq("estado", "disponible")
        .limit(1)

      if (camasError) throw camasError

      if (!camasDisponiblesData || camasDisponiblesData.length === 0) {
        toast({
          title: "Sin camas disponibles",
          description:
            "No hay camas de emergencia disponibles en este momento. Le recomendamos dirigirse al Hospital Nacional o al Hospital Regional más cercano.",
          variant: "destructive",
        })
        setLoading(false)
        return
      }

      const camaAsignada = camasDisponiblesData[0]

      const { data: triaje, error: triajeError } = await supabase
        .from("triaje")
        .insert({
          paciente_id: pacienteId || null,
          nombre_temporal: !pacienteId ? formData.nombreTemporal || null : null,
          edad_aproximada: formData.edadAproximada ? Number.parseInt(formData.edadAproximada) : null,
          nivel_urgencia: formData.nivelUrgencia,
          sintomas: formData.sintomas,
          presion_arterial: formData.presionArterial || null,
          frecuencia_cardiaca: formData.frecuenciaCardiaca ? Number.parseInt(formData.frecuenciaCardiaca) : null,
          temperatura: formData.temperatura ? Number.parseFloat(formData.temperatura) : null,
          saturacion_oxigeno: formData.saturacionOxigeno ? Number.parseInt(formData.saturacionOxigeno) : null,
          estado: "en_atencion",
          cama_asignada: camaAsignada.numero_cama,
        })
        .select()
        .single()

      if (triajeError) throw triajeError

      if (pacienteId) {
        const { data: especialidadEmergencia } = await supabase
          .from("especialidades")
          .select("id")
          .eq("nombre", "Emergencia")
          .single()

        const { data: medicosEmergencia } = await supabase
          .from("medicos")
          .select("id")
          .eq("especialidad_id", especialidadEmergencia?.id)
          .limit(1)

        if (medicosEmergencia?.[0]?.id && especialidadEmergencia?.id) {
          await supabase.from("historial_clinico").insert({
            paciente_id: pacienteId,
            medico_id: medicosEmergencia[0].id,
            especialidad_id: especialidadEmergencia.id,
            fecha: new Date().toISOString(),
            diagnostico: `Atención de Emergencia - ${formData.nivelUrgencia.toUpperCase()}`,
            observaciones: formData.sintomas,
          })
        }
      }

      // Actualizar estado de la cama
      await supabase
        .from("camas_emergencia")
        .update({
          estado: "ocupada",
          paciente_triaje_id: triaje.id,
          fecha_ocupacion: new Date().toISOString(),
        })
        .eq("id", camaAsignada.id)

      toast({
        title: "Emergencia registrada",
        description: `Boleto generado. Especialidad: Emergencia, Piso: ${camaAsignada.piso}, Cama: ${camaAsignada.numero_cama}. Camas disponibles: ${camasDisponibles - 1}`,
      })

      // Resetear formulario
      setFormData({
        nombreTemporal: "",
        edadAproximada: "",
        nivelUrgencia: "critico",
        sintomas: "",
        presionArterial: "",
        frecuenciaCardiaca: "",
        temperatura: "",
        saturacionOxigeno: "",
      })

      onOpenChange(false)
      loadCamasDisponibles()
    } catch (error) {
      console.error("[v0] Error al registrar emergencia:", error)
      toast({
        title: "Error",
        description: "No se pudo registrar la emergencia. Intente nuevamente.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertCircle className="w-6 h-6" />
            Formulario de Triaje - Emergencia Crítica
          </DialogTitle>
          <DialogDescription>Complete la información esencial del paciente para atención inmediata</DialogDescription>
        </DialogHeader>

        <div className="bg-muted p-4 rounded-lg flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-sm">
              Camas disponibles: <span className="text-lg text-primary">{camasDisponibles}/20</span>
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {camasDisponibles <= 5 && camasDisponibles > 0
                ? "Pocas camas disponibles. Atienda con urgencia."
                : camasDisponibles === 0
                  ? "No hay camas disponibles. Remita a otro hospital."
                  : "Camas disponibles para atención."}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {!pacienteId && (
              <div className="space-y-2">
                <Label htmlFor="nombreTemporal">Nombre del Paciente</Label>
                <Input
                  id="nombreTemporal"
                  placeholder="Nombre completo o 'Desconocido'"
                  value={formData.nombreTemporal}
                  onChange={(e) => setFormData({ ...formData, nombreTemporal: e.target.value })}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="edadAproximada">Edad Aproximada</Label>
              <Input
                id="edadAproximada"
                type="number"
                placeholder="Edad en años"
                value={formData.edadAproximada}
                onChange={(e) => setFormData({ ...formData, edadAproximada: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nivelUrgencia">Nivel de Urgencia</Label>
              <Select
                value={formData.nivelUrgencia}
                onValueChange={(value) => setFormData({ ...formData, nivelUrgencia: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="critico">Crítico (Rojo)</SelectItem>
                  <SelectItem value="urgente">Urgente (Naranja)</SelectItem>
                  <SelectItem value="menos_urgente">Menos Urgente (Amarillo)</SelectItem>
                  <SelectItem value="no_urgente">No Urgente (Verde)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="presionArterial">Presión Arterial</Label>
              <Input
                id="presionArterial"
                placeholder="Ej: 120/80"
                value={formData.presionArterial}
                onChange={(e) => setFormData({ ...formData, presionArterial: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="frecuenciaCardiaca">Frecuencia Cardíaca (lpm)</Label>
              <Input
                id="frecuenciaCardiaca"
                type="number"
                placeholder="Ej: 80"
                value={formData.frecuenciaCardiaca}
                onChange={(e) => setFormData({ ...formData, frecuenciaCardiaca: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="temperatura">Temperatura (°C)</Label>
              <Input
                id="temperatura"
                type="number"
                step="0.1"
                placeholder="Ej: 37.5"
                value={formData.temperatura}
                onChange={(e) => setFormData({ ...formData, temperatura: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="saturacionOxigeno">Saturación de Oxígeno (%)</Label>
              <Input
                id="saturacionOxigeno"
                type="number"
                placeholder="Ej: 98"
                value={formData.saturacionOxigeno}
                onChange={(e) => setFormData({ ...formData, saturacionOxigeno: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sintomas">Síntomas y Motivo de Consulta *</Label>
            <Textarea
              id="sintomas"
              placeholder="Describa los síntomas principales y el motivo de la emergencia..."
              value={formData.sintomas}
              onChange={(e) => setFormData({ ...formData, sintomas: e.target.value })}
              required
              rows={4}
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || camasDisponibles === 0}>
              {loading ? "Registrando..." : "Registrar Emergencia"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
