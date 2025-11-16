"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

export function DashboardOverview() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const supabase = createClient()

    // Obtener todas las citas
    const { data: citasData } = await supabase
      .from("cita")
      .select("id_medico")
      .neq("estado", "Cancelada")

    if (!citasData) {
      setLoading(false)
      return
    }

    // Obtener datos de médicos
    const medicosMap = new Map()
    
    for (const cita of citasData) {
      if (!medicosMap.has(cita.id_medico)) {
        const { data: medicoData } = await supabase
          .from("medico")
          .select("especialidad")
          .eq("id_medico", cita.id_medico)
          .single()
        
        if (medicoData) {
          const especialidad = medicoData.especialidad || "Sin especialidad"
          medicosMap.set(cita.id_medico, especialidad)
        }
      }
    }

    // Agrupar por especialidad
    const especialidadesCount = new Map()
    citasData.forEach((cita: any) => {
      const especialidad = medicosMap.get(cita.id_medico) || "Sin especialidad"
      especialidadesCount.set(especialidad, (especialidadesCount.get(especialidad) || 0) + 1)
    })

    const chartData = Array.from(especialidadesCount.entries()).map(([nombre, count]) => ({
      nombre,
      citas: count,
    }))

    setData(chartData)
    setLoading(false)
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="h-64 bg-muted rounded animate-pulse" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Citas por Especialidad</CardTitle>
        <CardDescription>Distribución de citas en el sistema</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="nombre" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="citas" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
