"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { Calendar, FileText, AlertCircle, CheckCircle } from "lucide-react"

interface DashboardStatsProps {
  pacienteId: string
}

export function DashboardStats({ pacienteId }: DashboardStatsProps) {
  const [stats, setStats] = useState({
    citasProximas: 0,
    citasCompletadas: 0,
    registrosHistorial: 0,
    emergenciasAtendidas: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    const supabase = createClient()

    // Citas próximas
    const { count: citasProximas } = await supabase
      .from("citas")
      .select("*", { count: "exact" })
      .eq("paciente_id", pacienteId)
      .eq("estado", "programada")

    // Citas completadas
    const { count: citasCompletadas } = await supabase
      .from("citas")
      .select("*", { count: "exact" })
      .eq("paciente_id", pacienteId)
      .eq("estado", "completada")

    // Registros en historial
    const { count: registrosHistorial } = await supabase
      .from("historial_clinico")
      .select("*", { count: "exact" })
      .eq("paciente_id", pacienteId)

    // Emergencias atendidas
    const { count: emergenciasAtendidas } = await supabase
      .from("triaje")
      .select("*", { count: "exact" })
      .eq("paciente_id", pacienteId)

    setStats({
      citasProximas: citasProximas || 0,
      citasCompletadas: citasCompletadas || 0,
      registrosHistorial: registrosHistorial || 0,
      emergenciasAtendidas: emergenciasAtendidas || 0,
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
            <Calendar className="w-4 h-4 text-primary" />
            Citas Próximas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.citasProximas}</div>
          <p className="text-xs text-muted-foreground mt-1">Citas programadas</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            Citas Completadas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.citasCompletadas}</div>
          <p className="text-xs text-muted-foreground mt-1">Consultas realizadas</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-600" />
            Registros Clínicos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.registrosHistorial}</div>
          <p className="text-xs text-muted-foreground mt-1">En su historial</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600" />
            Emergencias
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.emergenciasAtendidas}</div>
          <p className="text-xs text-muted-foreground mt-1">Atenciones de emergencia</p>
        </CardContent>
      </Card>
    </div>
  )
}
