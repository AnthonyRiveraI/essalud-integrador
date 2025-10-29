"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardNav } from "@/components/paciente/dashboard-nav"
import { RegistrarCita } from "@/components/paciente/registrar-cita"
import { ConsultarCitas } from "@/components/paciente/consultar-citas"
import { HistorialClinico } from "@/components/paciente/historial-clinico"
import { ChatbotMedico } from "@/components/paciente/chatbot-medico"
import { EmergencyDialog } from "@/components/emergency-dialog"
import { DashboardStats } from "@/components/paciente/dashboard-stats"

export default function PacienteDashboardPage() {
  const router = useRouter()
  const [usuario, setUsuario] = useState<any>(null)
  const [activeSection, setActiveSection] = useState("citas")
  const [emergencyOpen, setEmergencyOpen] = useState(false)

  useEffect(() => {
    const usuarioData = localStorage.getItem("usuario")
    if (!usuarioData) {
      router.push("/paciente/login")
      return
    }

    const parsed = JSON.parse(usuarioData)
    if (parsed.rol !== "paciente") {
      router.push("/")
      return
    }

    setUsuario(parsed)
  }, [router])

  useEffect(() => {
    if (activeSection === "emergencia") {
      setEmergencyOpen(true)
      setActiveSection("citas")
    }
  }, [activeSection])

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
          <h1 className="text-2xl font-bold">ESSALUD - Portal del Paciente</h1>
        </div>
      </header>

      <DashboardNav
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        userName={`${usuario.nombre} ${usuario.apellido}`}
      />

      <main className="container mx-auto px-4 py-8">
        {activeSection === "citas" && (
          <>
            <DashboardStats pacienteId={usuario.id} />
            <div className="mt-8">
              <RegistrarCita pacienteId={usuario.id} />
            </div>
          </>
        )}
        {activeSection === "consultar" && <ConsultarCitas pacienteId={usuario.id} />}
        {activeSection === "historial" && <HistorialClinico pacienteId={usuario.id} />}
        {activeSection === "chatbot" && <ChatbotMedico pacienteId={usuario.id} />}
      </main>

      <EmergencyDialog open={emergencyOpen} onOpenChange={setEmergencyOpen} />
    </div>
  )
}
