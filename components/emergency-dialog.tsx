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
import { AlertCircle, AlertTriangle, Activity, Heart, Thermometer, Wind } from "lucide-react"
import { Badge } from "@/components/ui/badge"

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
      if (pacienteId && pacienteNombre) {
        setFormData((prev) => ({
          ...prev,
          nombreTemporal: pacienteNombre,
        }))
      } else {
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
      }
    }
  }, [open, pacienteId, pacienteNombre])

  const loadCamasDisponibles = async () => {
    const supabase = createClient()
    
    try {
      console.log('🏥 Consultando camas_emergencia...')
      
      const { data, error, count } = await supabase
        .from("camas_emergencia")
        .select("*", { count: "exact" })
        .eq("estado", "disponible")

      console.log('🔍 Resultado completo:', { 
        data, 
        error, 
        count,
        errorDetails: error ? JSON.stringify(error) : null,
        dataLength: data?.length 
      })

      if (error) {
        console.error('❌ Error detectado:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
          fullError: error
        })
        setCamasDisponibles(0)
        return
      }

      console.log('✅ Camas cargadas exitosamente:', count)
      setCamasDisponibles(count || 0)
    } catch (err) {
      console.error('💥 Excepción capturada:', err)
      setCamasDisponibles(0)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const supabase = createClient()

      const { data: camasDisponiblesData } = await supabase
        .from("camas_emergencia")
        .select("*")
        .eq("estado", "disponible")
        .limit(1)

      if (!camasDisponiblesData || camasDisponiblesData.length === 0) {
        toast({
          title: "❌ Sin camas disponibles",
          description: "No hay camas de emergencia disponibles.",
          variant: "destructive",
        })
        setLoading(false)
        return
      }

      const camaAsignada = camasDisponiblesData[0]

      const { data: triaje, error: triajeError } = await supabase
        .from("triaje")
        .insert({
          id_paciente: pacienteId ? parseInt(pacienteId) : null,
          nombre_temporal: !pacienteId ? formData.nombreTemporal || "Paciente sin identificar" : null,
          edad_aproximada: formData.edadAproximada ? Number.parseInt(formData.edadAproximada) : null,
          nivel_urgencia: formData.nivelUrgencia,
          sintomas: formData.sintomas,
          presion_arterial: formData.presionArterial || null,
          frecuencia_cardiaca: formData.frecuenciaCardiaca ? Number.parseInt(formData.frecuenciaCardiaca) : null,
          temperatura: formData.temperatura ? Number.parseFloat(formData.temperatura) : null,
          saturacion_oxigeno: formData.saturacionOxigeno ? Number.parseInt(formData.saturacionOxigeno) : null,
          estado_paciente: "en_atencion",
          cama_asignada: camaAsignada.numero_cama,
          fecha: new Date().toISOString(),
          spo2: formData.saturacionOxigeno ? Number.parseInt(formData.saturacionOxigeno) : null,
          nivel_riesgo: formData.nivelUrgencia === 'critico' ? 'Critico' : 
                       formData.nivelUrgencia === 'urgente' ? 'Alto' : 
                       formData.nivelUrgencia === 'menos_urgente' ? 'Moderado' : 'Bajo',
          tiempo_atencion: formData.nivelUrgencia === 'critico' ? 'Inmediato' : 
                          formData.nivelUrgencia === 'urgente' ? '10min' : 
                          formData.nivelUrgencia === 'menos_urgente' ? '60min' : '3h',
          observaciones: formData.sintomas
        })
        .select()
        .single()

      if (triajeError) throw triajeError

      if (pacienteId) {
        const { data: medicoEmergencia } = await supabase
          .from("medico")
          .select("id_medico")
          .eq("especialidad", "Emergencia")
          .limit(1)
          .maybeSingle()

        if (medicoEmergencia) {
          await supabase.from("historialclinico").insert({
            id_paciente: parseInt(pacienteId),
            id_medico: medicoEmergencia.id_medico,
            fecha: new Date().toISOString(),
            diagnostico: `Atención de Emergencia - ${formData.nivelUrgencia}`,
            receta: `PA: ${formData.presionArterial || "N/A"} FC: ${formData.frecuenciaCardiaca || "N/A"} Temp: ${formData.temperatura || "N/A"} SpO2: ${formData.saturacionOxigeno || "N/A"}`,
          })
        }
      }

      await supabase
        .from("camas_emergencia")
        .update({
          estado: "ocupada",
          id_triaje: triaje.id_triaje,
          fecha_ocupacion: new Date().toISOString(),
        })
        .eq("id_cama", camaAsignada.id_cama)

      toast({
        title: "✅ Emergencia registrada",
        description: `Cama: Piso ${camaAsignada.piso}, ${camaAsignada.numero_cama}`,
      })

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
      await loadCamasDisponibles()
    } catch (error) {
      toast({
        title: "❌ Error",
        description: "No se pudo registrar la emergencia",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="w-6 h-6 text-destructive" />
            Emergencia Médica
            {pacienteNombre && <span className="text-sm font-normal">- {pacienteNombre}</span>}
          </DialogTitle>
          <DialogDescription>
            Complete los datos para atención inmediata
          </DialogDescription>
        </DialogHeader>

        <div className="bg-muted p-4 rounded-lg flex items-center justify-between">
          <p className="font-semibold">Camas Disponibles:</p>
          <Badge variant={camasDisponibles === 0 ? "destructive" : "default"} className="text-lg">
            {camasDisponibles}/20
          </Badge>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!pacienteId && (
            <div>
              <Label htmlFor="nombreTemporal">Nombre *</Label>
              <Input
                id="nombreTemporal"
                value={formData.nombreTemporal}
                onChange={(e) => setFormData({ ...formData, nombreTemporal: e.target.value })}
                required
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="edadAproximada">Edad *</Label>
              <Input
                id="edadAproximada"
                type="number"
                value={formData.edadAproximada}
                onChange={(e) => setFormData({ ...formData, edadAproximada: e.target.value })}
                required={!pacienteId}
              />
            </div>

            <div>
              <Label htmlFor="nivelUrgencia">Nivel de Urgencia *</Label>
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
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="presionArterial">Presión Arterial</Label>
              <Input
                id="presionArterial"
                placeholder="120/80"
                value={formData.presionArterial}
                onChange={(e) => setFormData({ ...formData, presionArterial: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="frecuenciaCardiaca">Frecuencia Cardíaca</Label>
              <Input
                id="frecuenciaCardiaca"
                type="number"
                placeholder="80"
                value={formData.frecuenciaCardiaca}
                onChange={(e) => setFormData({ ...formData, frecuenciaCardiaca: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="temperatura">Temperatura (°C)</Label>
              <Input
                id="temperatura"
                type="number"
                step="0.1"
                placeholder="37.5"
                value={formData.temperatura}
                onChange={(e) => setFormData({ ...formData, temperatura: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="saturacionOxigeno">SpO2 (%)</Label>
              <Input
                id="saturacionOxigeno"
                type="number"
                placeholder="98"
                value={formData.saturacionOxigeno}
                onChange={(e) => setFormData({ ...formData, saturacionOxigeno: e.target.value })}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="sintomas">Síntomas *</Label>
            <Textarea
              id="sintomas"
              value={formData.sintomas}
              onChange={(e) => setFormData({ ...formData, sintomas: e.target.value })}
              required
              rows={4}
            />
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || camasDisponibles === 0}>
              {loading ? "Registrando..." : camasDisponibles === 0 ? "Sin Camas" : "Registrar Emergencia"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}