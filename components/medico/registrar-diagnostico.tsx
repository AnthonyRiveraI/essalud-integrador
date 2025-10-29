"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"
import { FileText } from "lucide-react"

interface RegistrarDiagnosticoProps {
  citaId: string
  pacienteId: string
  medicoId: string
  especialidadId: number
}

export function RegistrarDiagnostico({ citaId, pacienteId, medicoId, especialidadId }: RegistrarDiagnosticoProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    diagnostico: "",
    recetaMedica: "",
    observaciones: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const supabase = createClient()

      const { error } = await supabase.from("historial_clinico").insert({
        cita_id: citaId,
        paciente_id: pacienteId,
        medico_id: medicoId,
        especialidad_id: especialidadId,
        fecha: new Date().toISOString(),
        diagnostico: formData.diagnostico,
        receta_medica: formData.recetaMedica || null,
        observaciones: formData.observaciones || null,
      })

      if (error) throw error

      toast({
        title: "Éxito",
        description: "Diagnóstico registrado correctamente",
      })

      setFormData({
        diagnostico: "",
        recetaMedica: "",
        observaciones: "",
      })
    } catch (error) {
      console.error("[v0] Error al registrar diagnóstico:", error)
      toast({
        title: "Error",
        description: "No se pudo registrar el diagnóstico",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Registrar Diagnóstico
        </CardTitle>
        <CardDescription>Complete el diagnóstico y la receta médica</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="diagnostico">Diagnóstico *</Label>
            <Textarea
              id="diagnostico"
              placeholder="Describa el diagnóstico del paciente..."
              value={formData.diagnostico}
              onChange={(e) => setFormData({ ...formData, diagnostico: e.target.value })}
              required
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="recetaMedica">Receta Médica</Label>
            <Textarea
              id="recetaMedica"
              placeholder="Medicamentos prescritos, dosis y duración..."
              value={formData.recetaMedica}
              onChange={(e) => setFormData({ ...formData, recetaMedica: e.target.value })}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="observaciones">Observaciones</Label>
            <Textarea
              id="observaciones"
              placeholder="Observaciones adicionales o recomendaciones..."
              value={formData.observaciones}
              onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
              rows={3}
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Guardando..." : "Guardar Diagnóstico"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
