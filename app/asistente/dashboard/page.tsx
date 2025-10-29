"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AsistenteDashboardNav } from "@/components/asistente/dashboard-nav"
import { HistorialGeneral } from "@/components/asistente/historial-general"
import { GestionarPacientes } from "@/components/asistente/gestionar-pacientes"

export default function AsistenteDashboardPage() {
  const router = useRouter()
  const [usuario, setUsuario] = useState<any>(null)
  const [activeSection, setActiveSection] = useState("historial")

  useEffect(() => {
    const usuarioData = localStorage.getItem("usuario")
    if (!usuarioData) {
      router.push("/asistente/login")
      return
    }

    const parsed = JSON.parse(usuarioData)
    if (parsed.rol !== "asistente_enfermeria") {
      router.push("/")
      return
    }

    setUsuario(parsed)
  }, [router])

  if (!usuario) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Cargando...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10">
      <header className="bg-primary text-primary-foreground py-4 shadow-lg">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-bold">ESSALUD - Portal de Asistente de Enfermería</h1>
        </div>
      </header>

      <AsistenteDashboardNav
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        userName={`${usuario.nombre} ${usuario.apellido}`}
      />

      <main className="container mx-auto px-4 py-8">
        {activeSection === "historial" && <HistorialGeneral />}
        {activeSection === "pacientes" && <GestionarPacientes />}
      </main>
    </div>
  )
}
