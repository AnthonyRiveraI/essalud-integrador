"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"
import { UserCog, AlertCircle, Edit, Save } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export function GestionarPacientes() {
  const { toast } = useToast()
  const [pacientesNoReconocidos, setPacientesNoReconocidos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    dni: "",
    nombre: "",
    apellido: "",
    telefono: "",
    fechaNacimiento: "",
    direccion: "",
  })

  useEffect(() => {
    loadPacientes()
  }, [])

  const loadPacientes = async () => {
    setLoading(true)
    const supabase = createClient()
    const { data, error } = await supabase
      .from("triaje")
      .select("*")
      .is("paciente_id", null)
      .order("created_at", { ascending: false })

    if (!error && data) {
      setPacientesNoReconocidos(data)
    }
    setLoading(false)
  }

  const handleEdit = (paciente: any) => {
    setEditingId(paciente.id)
    setFormData({
      dni: "",
      nombre: paciente.nombre_temporal || "",
      apellido: "",
      telefono: "",
      fechaNacimiento: "",
      direccion: "",
    })
  }

  const handleSave = async (triajeId: string) => {
    if (!formData.dni || !formData.nombre || !formData.apellido) {
      toast({
        title: "⚠️ Datos incompletos",
        description: "DNI, nombre y apellido son obligatorios",
        variant: "destructive",
      })
      return
    }

    const supabase = createClient()

    try {
      // Verificar si el paciente ya existe
      const { data: existingUser } = await supabase.from("usuarios").select("*").eq("dni", formData.dni).single()

      let pacienteId: string

      if (existingUser) {
        // Paciente ya existe
        pacienteId = existingUser.id
      } else {
        const { data: newUser, error: userError } = await supabase
          .from("usuarios")
          .insert({
            dni: formData.dni,
            password_hash: "temp_password_hash", // Contraseña temporal
            nombre: formData.nombre,
            apellido: formData.apellido,
            telefono: formData.telefono,
            fecha_nacimiento: formData.fechaNacimiento || null,
            direccion: formData.direccion,
            rol: "paciente",
            tipo_asegurado: "no_asegurado", // Marcar como no asegurado
          })
          .select()
          .single()

        if (userError) throw userError
        pacienteId = newUser.id
      }

      // Actualizar el triaje con el paciente_id
      const { error: triajeError } = await supabase
        .from("triaje")
        .update({
          paciente_id: pacienteId,
        })
        .eq("id", triajeId)

      if (triajeError) throw triajeError

      toast({
        title: "✅ Paciente registrado",
        description: "Los datos del paciente han sido actualizados exitosamente",
      })

      setEditingId(null)
      setFormData({
        dni: "",
        nombre: "",
        apellido: "",
        telefono: "",
        fechaNacimiento: "",
        direccion: "",
      })
      loadPacientes()
    } catch (error) {
      console.error("[v0] Error al guardar paciente:", error)
      toast({
        title: "❌ Error al guardar",
        description: "No se pudo guardar la información del paciente",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">Cargando pacientes...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserCog className="w-5 h-5" />
          Gestionar Pacientes No Reconocidos
        </CardTitle>
        <CardDescription>
          Complete los datos de pacientes que ingresaron por emergencia crítica sin identificación •{" "}
          <span className="font-semibold text-primary">{pacientesNoReconocidos.length}</span> pendientes
        </CardDescription>
      </CardHeader>
      <CardContent>
        {pacientesNoReconocidos.length === 0 ? (
          <div className="text-center py-8">
            <UserCog className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No hay pacientes pendientes de identificación</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pacientesNoReconocidos.map((paciente) => (
              <div key={paciente.id} className="border rounded-lg p-4 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="w-5 h-5 text-destructive" />
                      <h3 className="font-semibold text-lg">{paciente.nombre_temporal || "Paciente Desconocido"}</h3>
                    </div>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <p>Edad aproximada: {paciente.edad_aproximada || "No especificada"} años</p>
                      <p>Síntomas: {paciente.sintomas}</p>
                      {paciente.cama_asignada && <p>Cama: {paciente.cama_asignada}</p>}
                    </div>
                  </div>
                  <Badge
                    variant={
                      paciente.nivel_urgencia === "critico"
                        ? "destructive"
                        : paciente.nivel_urgencia === "urgente"
                          ? "default"
                          : "secondary"
                    }
                  >
                    {paciente.nivel_urgencia.charAt(0).toUpperCase() + paciente.nivel_urgencia.slice(1)}
                  </Badge>
                </div>

                {editingId === paciente.id ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      handleSave(paciente.id)
                    }}
                    className="space-y-4 pt-4 border-t"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`dni-${paciente.id}`}>DNI *</Label>
                        <Input
                          id={`dni-${paciente.id}`}
                          placeholder="12345678"
                          maxLength={8}
                          value={formData.dni}
                          onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
                          required
                          className="h-11"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`telefono-${paciente.id}`}>Teléfono</Label>
                        <Input
                          id={`telefono-${paciente.id}`}
                          placeholder="987654321"
                          value={formData.telefono}
                          onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                          className="h-11"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`nombre-${paciente.id}`}>Nombre *</Label>
                        <Input
                          id={`nombre-${paciente.id}`}
                          placeholder="Juan"
                          value={formData.nombre}
                          onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                          required
                          className="h-11"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`apellido-${paciente.id}`}>Apellido *</Label>
                        <Input
                          id={`apellido-${paciente.id}`}
                          placeholder="Pérez"
                          value={formData.apellido}
                          onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                          required
                          className="h-11"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`fechaNacimiento-${paciente.id}`}>Fecha de Nacimiento</Label>
                        <Input
                          id={`fechaNacimiento-${paciente.id}`}
                          type="date"
                          value={formData.fechaNacimiento}
                          onChange={(e) => setFormData({ ...formData, fechaNacimiento: e.target.value })}
                          className="h-11"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`direccion-${paciente.id}`}>Dirección</Label>
                        <Input
                          id={`direccion-${paciente.id}`}
                          placeholder="Av. Principal 123"
                          value={formData.direccion}
                          onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                          className="h-11"
                        />
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button type="submit" className="flex-1 h-11 shadow-md hover:shadow-lg transition-all">
                        <Save className="w-4 h-4 mr-2" />
                        Guardar Datos
                      </Button>
                      <Button type="button" variant="outline" onClick={() => setEditingId(null)} className="h-11">
                        Cancelar
                      </Button>
                    </div>
                  </form>
                ) : (
                  <Button onClick={() => handleEdit(paciente)} className="w-full h-11 shadow-md hover:shadow-lg transition-all">
                    <Edit className="w-4 h-4 mr-2" />
                    Completar Datos del Paciente
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
