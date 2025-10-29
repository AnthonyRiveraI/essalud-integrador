"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AdministradorDashboardNav } from "@/components/administrador/dashboard-nav"
import { ListaPacientes } from "@/components/administrador/lista-pacientes"
import { ListaMedicos } from "@/components/administrador/lista-medicos"
import { HistorialesCompletos } from "@/components/administrador/historiales-completos"
import { ListaAsistentes } from "@/components/administrador/lista-asistentes"
import { RegistrarUsuario } from "@/components/administrador/registrar-usuario"
import { EstadisticasSistema } from "@/components/administrador/estadisticas-sistema"
import { DashboardOverview } from "@/components/administrador/dashboard-overview"

export default function AdministradorDashboardPage() {
  const router = useRouter()
  const [usuario, setUsuario] = useState<any>(null)
  const [activeSection, setActiveSection] = useState("pacientes")

  useEffect(() => {
    const usuarioData = localStorage.getItem("usuario")
    if (!usuarioData) {
      router.push("/administrador/login")
      return
    }

    const parsed = JSON.parse(usuarioData)
    if (parsed.rol !== "administrador") {
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
          <h1 className="text-2xl font-bold">ESSALUD - Portal del Administrador</h1>
        </div>
      </header>

      <AdministradorDashboardNav
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        userName={`${usuario.nombre} ${usuario.apellido}`}
      />

      <main className="container mx-auto px-4 py-8">
        {activeSection === "pacientes" && (
          <>
            <EstadisticasSistema />
            <div className="mt-8">
              <DashboardOverview />
            </div>
            <div className="mt-8">
              <ListaPacientes />
            </div>
          </>
        )}
        {activeSection === "registrar" && <RegistrarUsuario />}
        {activeSection === "medicos" && <ListaMedicos />}
        {activeSection === "historial" && <HistorialesCompletos />}
        {activeSection === "asistentes" && <ListaAsistentes />}
      </main>
    </div>
  )
}
