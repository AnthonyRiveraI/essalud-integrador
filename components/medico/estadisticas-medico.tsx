"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { Users, Calendar, CheckCircle, Clock } from "lucide-react"

interface EstadisticasMedicoProps {
  medicoId: string
}

export function EstadisticasMedico({ medicoId }: EstadisticasMedicoProps) {
  const [stats, setStats] = useState({
    pacientesAtendidos: 0,
    citasHoy: 0,
    citasCompletadas: 0,
    citasPendientes: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    const supabase = createClient()
    const today = new Date().toISOString().split("T")[0]

    // Pacientes únicos atendidos
    const { data: pacientesData } = await supabase
      .from("citas")
      .select("paciente_id", { count: "exact" })
      .eq("medico_id", medicoId)
      .eq("estado", "completada")

    const pacientesUnicos = new Set(pacientesData?.map((c) => c.paciente_id) || []).size

    // Citas hoy
    const { count: citasHoy } = await supabase
      .from("citas")
      .select("*", { count: "exact" })
      .eq("medico_id", medicoId)
      .eq("fecha", today)
      .neq("estado", "cancelada")

    // Citas completadas
    const { count: citasCompletadas } = await supabase
      .from("citas")
      .select("*", { count: "exact" })
      .eq("medico_id", medicoId)
      .eq("estado", "completada")

    // Citas pendientes
    const { count: citasPendientes } = await supabase
      .from("citas")
      .select("*", { count: "exact" })
      .eq("medico_id", medicoId)
      .eq("estado", "programada")

    setStats({
      pacientesAtendidos: pacientesUnicos,
      citasHoy: citasHoy || 0,
      citasCompletadas: citasCompletadas || 0,
      citasPendientes: citasPendientes || 0,
    })
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="py-6">
              <div className="h-8 bg-muted rounded animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            Pacientes Atendidos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.pacientesAtendidos}</div>
          <p className="text-xs text-muted-foreground mt-1">Total de pacientes</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-600" />
            Citas Hoy
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.citasHoy}</div>
          <p className="text-xs text-muted-foreground mt-1">Programadas para hoy</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            Completadas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.citasCompletadas}</div>
          <p className="text-xs text-muted-foreground mt-1">Citas finalizadas</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Clock className="w-4 h-4 text-yellow-600" />
            Pendientes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.citasPendientes}</div>
          <p className="text-xs text-muted-foreground mt-1">Por atender</p>
        </CardContent>
      </Card>
    </div>
  )
}
