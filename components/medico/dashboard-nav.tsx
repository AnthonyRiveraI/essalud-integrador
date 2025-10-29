"use client"

import { Button } from "@/components/ui/button"
import { Calendar, FileText, LogOut, Stethoscope, UserPlus, AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

interface DashboardNavProps {
  activeSection: string
  onSectionChange: (section: string) => void
  userName: string
  especialidad: string
}

export function MedicoDashboardNav({ activeSection, onSectionChange, userName, especialidad }: DashboardNavProps) {
  const router = useRouter()
  const { toast } = useToast()

  const handleLogout = () => {
    localStorage.removeItem("usuario")
    toast({
      title: "Sesión cerrada",
      description: "Ha cerrado sesión exitosamente",
    })
    router.push("/")
  }

  const sections = [
    { id: "citas", label: "Mis Citas del Día", icon: Calendar },
    { id: "historial", label: "Historial Clínico", icon: FileText },
  ]

  if (especialidad === "Emergencia") {
    sections.push({ id: "triaje", label: "Gestionar Triaje", icon: AlertCircle })
    sections.push({ id: "altas", label: "Dar de Alta", icon: UserPlus })
  }

  return (
    <div className="bg-card border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <Stethoscope className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold">Dr(a). {userName}</p>
              <p className="text-xs text-muted-foreground">{especialidad}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Cerrar Sesión
          </Button>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2">
          {sections.map((section) => {
            const Icon = section.icon
            return (
              <Button
                key={section.id}
                variant={activeSection === section.id ? "default" : "outline"}
                size="sm"
                onClick={() => onSectionChange(section.id)}
                className="flex-shrink-0"
              >
                <Icon className="w-4 h-4 mr-2" />
                {section.label}
              </Button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
