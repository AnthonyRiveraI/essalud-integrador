"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { MedicoDashboardNav } from "@/components/medico/dashboard-nav"
import { CitasDelDia } from "@/components/medico/citas-del-dia"
import { HistorialClinicoMedico } from "@/components/medico/historial-clinico-medico"
import { DarAlta } from "@/components/medico/dar-alta"
import { GestionarTriaje } from "@/components/medico/gestionar-triaje"
import { createClient } from "@/lib/supabase/client"
import { EstadisticasMedico } from "@/components/medico/estadisticas-medico"

export default function MedicoDashboardPage() {
  const router = useRouter()
  const [usuario, setUsuario] = useState<any>(null)
  const [medicoData, setMedicoData] = useState<any>(null)
  const [activeSection, setActiveSection] = useState("citas")

  useEffect(() => {
    const loadData = async () => {
      const usuarioData = localStorage.getItem("usuario")
      if (!usuarioData) {
        router.push("/medico/login")
        return
      }

      const parsed = JSON.parse(usuarioData)
      if (parsed.rol !== "medico") {
        router.push("/")
        return
      }

      setUsuario(parsed)

      // Cargar datos del médico
      const supabase = createClient()
      const { data, error } = await supabase
        .from("medicos")
        .select(
          `
          *,
          especialidad:especialidades!medicos_especialidad_id_fkey(id, nombre)
        `,
        )
        .eq("usuario_id", parsed.id)
        .single()

      if (!error && data) {
        setMedicoData(data)
      }
    }

    loadData()
  }, [router])

  if (!usuario || !medicoData) {
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
          <h1 className="text-2xl font-bold">ESSALUD - Portal del Médico</h1>
        </div>
      </header>

      <MedicoDashboardNav
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        userName={`${usuario.nombre} ${usuario.apellido}`}
        especialidad={medicoData.especialidad.nombre}
      />

      <main className="container mx-auto px-4 py-8">
        {activeSection === "citas" && (
          <>
            <EstadisticasMedico medicoId={medicoData.id} />
            <div className="mt-8">
              <CitasDelDia
                medicoId={medicoData.id}
                maxCitasDia={medicoData.max_citas_dia}
                minutosPorCita={medicoData.minutos_por_cita}
              />
            </div>
          </>
        )}
        {activeSection === "historial" && (
          <HistorialClinicoMedico medicoId={medicoData.id} especialidadId={medicoData.especialidad.id} />
        )}
        {activeSection === "triaje" && medicoData.especialidad.nombre === "Emergencia" && (
          <GestionarTriaje medicoId={medicoData.id} />
        )}
        {activeSection === "altas" && medicoData.especialidad.nombre === "Emergencia" && <DarAlta />}
      </main>
    </div>
  )
}
