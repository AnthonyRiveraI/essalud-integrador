"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AdministradorDashboardNav } from "@/components/administrador/dashboard-nav"
import { GestionUsuarios } from "@/components/administrador/gestion-usuarios"
import { HistorialesCompletos } from "@/components/administrador/historiales-completos"
import { EstadisticasSistema } from "@/components/administrador/estadisticas-sistema"
import { DashboardOverview } from "@/components/administrador/dashboard-overview"

export default function AdministradorDashboardPage() {
  const router = useRouter()
  const [usuario, setUsuario] = useState<any>(null)
  const [activeSection, setActiveSection] = useState("inicio")

  useEffect(() => {
    const usuarioData = localStorage.getItem("usuario")
    if (!usuarioData) {
      router.push("/administrador/login")
      return
    }

    const parsed = JSON.parse(usuarioData)
    if (parsed.rol !== "Administrador") {
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
    <div className="min-h-screen bg-linear-to-br from-primary/5 via-background to-primary/10">
      <header className="bg-primary text-primary-foreground py-4 shadow-lg">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-bold">ESSALUD - Portal del Administrador</h1>
        </div>
      </header>

      <AdministradorDashboardNav
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        userName={`${usuario.nombre} ${usuario.apellido}`}
      />

      <main className="container mx-auto px-4 py-8">
        {activeSection === "inicio" && (
          <>
            <EstadisticasSistema />
            <div className="mt-8">
              <DashboardOverview />
            </div>
          </>
        )}
        {activeSection === "usuarios" && <GestionUsuarios />}
        {activeSection === "historial" && <HistorialesCompletos />}
      </main>
    </div>
  )
}
