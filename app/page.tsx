"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { RoleCard } from "@/components/role-card"
import { EmergencyDialog } from "@/components/emergency-dialog"
import { User, Stethoscope, ClipboardList, Shield, AlertCircle } from "lucide-react"

export default function HomePage() {
  const router = useRouter()
  const [emergencyOpen, setEmergencyOpen] = useState(false)

  const roles = [
    {
      title: "Paciente",
      description: "Agende citas, consulte su historial médico y acceda a servicios de salud",
      icon: User,
      path: "/paciente/login",
    },
    {
      title: "Médico",
      description: "Gestione sus citas, consulte historiales clínicos y atienda pacientes",
      icon: Stethoscope,
      path: "/medico/login",
    },
    {
      title: "Asistente de Enfermería",
      description: "Administre registros de pacientes y apoye en la atención médica",
      icon: ClipboardList,
      path: "/asistente/login",
    },
    {
      title: "Administrador",
      description: "Supervise el sistema, gestione usuarios y consulte reportes generales",
      icon: Shield,
      path: "/administrador/login",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10">
      {/* Header */}
      <header className="bg-primary text-primary-foreground py-6 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary-foreground/10 rounded-lg flex items-center justify-center">
              <Stethoscope className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-balance">ESSALUD</h1>
              <p className="text-sm text-primary-foreground/90">Sistema de Gestión de Citas Médicas</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-balance">Bienvenido al Sistema de Citas</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            Seleccione su rol para acceder al sistema y gestionar sus servicios de salud de manera eficiente
          </p>
        </div>

        {/* Role Cards Grid + Emergency Card */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 max-w-7xl mx-auto">
          {roles.map((role) => (
            <RoleCard
              key={role.title}
              title={role.title}
              description={role.description}
              icon={role.icon}
              onClick={() => router.push(role.path)}
            />
          ))}

          {/* Emergency Card using RoleCard component */}
          <RoleCard
            title="Emergencia"
            description="Atención inmediata para casos críticos. Complete el formulario de triaje"
            icon={AlertCircle}
            onClick={() => setEmergencyOpen(true)}
            variant="destructive"
          />
        </div>

        {/* Emergency Info */}
        <div className="mt-12 max-w-3xl mx-auto">
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6">
            <div className="flex items-start gap-4">
              <AlertCircle className="w-6 h-6 text-destructive flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-lg mb-2 text-destructive">Atención de Emergencias</h3>
                <p className="text-sm text-muted-foreground text-pretty">
                  Si presenta una emergencia médica crítica, haga clic en la tarjeta de emergencia para completar el
                  formulario de triaje. Nuestro personal médico lo atenderá de inmediato según la gravedad de su
                  condición. Contamos con 30 camas disponibles para atención de emergencias.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-primary/5 border-t mt-16 py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2025 ESSALUD - Seguro Social de Salud del Perú</p>
          <p className="mt-1">Sistema de Gestión de Citas Médicas</p>
        </div>
      </footer>

      {/* Emergency Dialog */}
      <EmergencyDialog open={emergencyOpen} onOpenChange={setEmergencyOpen} />
    </div>
  )
}
