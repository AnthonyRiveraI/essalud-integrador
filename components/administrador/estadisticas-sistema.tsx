"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { Users, Stethoscope, Calendar, AlertCircle } from "lucide-react"

export function EstadisticasSistema() {
  const [stats, setStats] = useState({
    totalPacientes: 0,
    totalMedicos: 0,
    citasHoy: 0,
    emergenciasActivas: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    const supabase = createClient()
    const today = new Date().toISOString().split("T")[0]

    // Total de pacientes
    const { count: totalPacientes } = await supabase
      .from("usuarios")
      .select("*", { count: "exact" })
      .eq("rol", "paciente")

    // Total de médicos
    const { count: totalMedicos } = await supabase.from("medicos").select("*", { count: "exact" })

    // Citas hoy
    const { count: citasHoy } = await supabase
      .from("citas")
      .select("*", { count: "exact" })
      .eq("fecha", today)
      .neq("estado", "cancelada")

    // Emergencias activas
    const { count: emergenciasActivas } = await supabase
      .from("triaje")
      .select("*", { count: "exact" })
      .eq("estado", "en_atencion")

    setStats({
      totalPacientes: totalPacientes || 0,
      totalMedicos: totalMedicos || 0,
      citasHoy: citasHoy || 0,
      emergenciasActivas: emergenciasActivas || 0,
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
            Total Pacientes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalPacientes}</div>
          <p className="text-xs text-muted-foreground mt-1">Registrados en el sistema</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Stethoscope className="w-4 h-4 text-blue-600" />
            Total Médicos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalMedicos}</div>
          <p className="text-xs text-muted-foreground mt-1">Profesionales activos</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Calendar className="w-4 h-4 text-green-600" />
            Citas Hoy
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.citasHoy}</div>
          <p className="text-xs text-muted-foreground mt-1">Programadas</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600" />
            Emergencias Activas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.emergenciasActivas}</div>
          <p className="text-xs text-muted-foreground mt-1">En atención</p>
        </CardContent>
      </Card>
    </div>
  )
}
