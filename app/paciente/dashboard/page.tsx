"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { DashboardNav } from "@/components/paciente/dashboard-nav"
import { RegistrarCita } from "@/components/paciente/registrar-cita"
import { ConsultarCitas } from "@/components/paciente/consultar-citas"
import { HistorialClinico } from "@/components/paciente/historial-clinico"
import { ChatbotMedico } from "@/components/paciente/chatbot-medico"
import { EmergencyDialog } from "@/components/emergency-dialog"
import { DashboardStats } from "@/components/paciente/dashboard-stats"

export default function PacienteDashboardPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [usuario, setUsuario] = useState<any>(null)
  const [activeSection, setActiveSection] = useState("citas")
  const [emergencyOpen, setEmergencyOpen] = useState(false)
  const [preselectedEspecialidad, setPreselectedEspecialidad] = useState<string | null>(null)

  useEffect(() => {
    const usuarioData = localStorage.getItem("usuario")
    if (!usuarioData) {
      router.push("/paciente/login")
      return
    }

    const parsed = JSON.parse(usuarioData)
    if (parsed.rol !== "Paciente") {
      router.push("/")
      return
    }

    setUsuario(parsed)
  }, [router])

  // 🔥 Separar en otro useEffect para que se ejecute cuando cambien los searchParams
  useEffect(() => {
    // Verificar si hay parámetros de URL para pre-llenar
    const tab = searchParams.get('tab')
    const especialidad = searchParams.get('especialidad')
    
    if (tab === 'citas') {
      setActiveSection('citas')
    }
    
    if (especialidad) {
      setPreselectedEspecialidad(especialidad)
    }
  }, [searchParams]) // 🔥 Ahora escucha cambios en searchParams

  useEffect(() => {
    if (activeSection === "emergencia") {
      setEmergencyOpen(true)
      setActiveSection("citas")
    }
  }, [activeSection])

  // 🔥 NUEVO: Handler para agendar cita desde el chatbot
  const handleBookAppointmentFromChat = (especialidad: string) => {
    setPreselectedEspecialidad(especialidad)
    setActiveSection("citas")
    
    // Scroll al top para ver el formulario
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

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
            <DashboardStats pacienteId={usuario.id_paciente} />
            <div className="mt-8">
              <RegistrarCita 
                pacienteId={usuario.id_paciente} 
                preselectedEspecialidad={preselectedEspecialidad}
                onEspecialidadUsed={() => setPreselectedEspecialidad(null)}
              />
            </div>
          </>
        )}
        {activeSection === "consultar" && <ConsultarCitas pacienteId={usuario.id_paciente} />}
        {activeSection === "historial" && <HistorialClinico pacienteId={usuario.id_paciente} />}
        {activeSection === "chatbot" && (
          <ChatbotMedico 
            pacienteId={usuario.id_paciente} 
            onBookAppointment={handleBookAppointmentFromChat}
          />
        )}
      </main>

      <EmergencyDialog 
        open={emergencyOpen} 
        onOpenChange={setEmergencyOpen}
        pacienteId={String(usuario.id_paciente)}
        pacienteNombre={`${usuario.nombre} ${usuario.apellido}`}
      />
    </div>
  )
}
