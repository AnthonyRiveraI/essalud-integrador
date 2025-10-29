"use client"

import { Button } from "@/components/ui/button"
import { FileText, UserCog, LogOut, ClipboardList } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

interface DashboardNavProps {
  activeSection: string
  onSectionChange: (section: string) => void
  userName: string
}

export function AsistenteDashboardNav({ activeSection, onSectionChange, userName }: DashboardNavProps) {
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
    { id: "historial", label: "Historial Médico General", icon: FileText },
    { id: "pacientes", label: "Gestionar Pacientes", icon: UserCog },
  ]

  return (
    <div className="bg-card border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <ClipboardList className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold">{userName}</p>
              <p className="text-xs text-muted-foreground">Asistente de Enfermería</p>
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
