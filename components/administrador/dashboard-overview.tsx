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

    // Obtener citas por especialidad
    const { data: citasData } = await supabase
      .from("citas")
      .select("especialidad_id, especialidades!citas_especialidad_id_fkey(nombre)")
      .neq("estado", "cancelada")

    // Agrupar por especialidad
    const especialidadesMap = new Map()
    citasData?.forEach((cita: any) => {
      const nombre = cita.especialidades.nombre
      especialidadesMap.set(nombre, (especialidadesMap.get(nombre) || 0) + 1)
    })

    const chartData = Array.from(especialidadesMap.entries()).map(([nombre, count]) => ({
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
