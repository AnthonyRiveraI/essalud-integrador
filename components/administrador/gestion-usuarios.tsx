"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, UserCog, Stethoscope } from "lucide-react"
import { TablaUsuarios } from "./tabla-usuarios"

export function GestionUsuarios() {
  const [activeTab, setActiveTab] = useState("pacientes")

  return (
    <div className="space-y-6">
      <Card className="shadow-lg border-2">
        <CardHeader className="bg-linear-to-r from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30">
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Users className="w-6 h-6 text-blue-600" />
            Gestión de Usuarios
          </CardTitle>
          <CardDescription className="text-base">
            Administra pacientes, médicos y asistentes de enfermería del sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 h-14">
              <TabsTrigger value="pacientes" className="gap-2 text-base">
                <Users className="w-4 h-4" />
                Pacientes
              </TabsTrigger>
              <TabsTrigger value="medicos" className="gap-2 text-base">
                <Stethoscope className="w-4 h-4" />
                Médicos
              </TabsTrigger>
              <TabsTrigger value="asistentes" className="gap-2 text-base">
                <UserCog className="w-4 h-4" />
                Asistentes de Enfermería
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pacientes" className="space-y-4">
              <TablaUsuarios rol="Paciente" />
            </TabsContent>

            <TabsContent value="medicos" className="space-y-4">
              <TablaUsuarios rol="Medico" />
            </TabsContent>

            <TabsContent value="asistentes" className="space-y-4">
              <TablaUsuarios rol="AsistenteEnfermeria" />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
