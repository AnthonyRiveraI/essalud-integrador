"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { UserPlus, User, Mail, Phone, Stethoscope, Pill } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

  const generatePassword = (nombre: string, apellido: string, rol: string): string => {
    if (rol === "Paciente") {
      return "Paciente123!"
    } else if (rol === "Medico") {
      return "Medico123!"
    } else if (rol === "AsistenteEnfermeria") {
      return "Enfermera123!"
    }
    return "Usuario123!"
  }

export function RegistrarUsuario() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [generatedPassword, setGeneratedPassword] = useState("")
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    correo: "",
    dni: "",
    rol: "Paciente",
    fecha_nacimiento: "",
    especialidad: "",
    max_pacientes_dia: "20",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const generatedPassword = generatePassword(formData.nombre, formData.apellido, formData.rol)
      setGeneratedPassword(generatedPassword)

      const supabase = createClient()

      // Validaciones específicas por rol
      if (!formData.nombre || !formData.apellido) {
        toast({
          title: "Error",
          description: "El nombre y apellido son requeridos",
          variant: "destructive",
        })
        setLoading(false)
        return
      }

      if (formData.rol === "Paciente" && !formData.dni) {
        toast({
          title: "Error",
          description: "El DNI es requerido para pacientes",
          variant: "destructive",
        })
        setLoading(false)
        return
      }

      if ((formData.rol === "Medico" || formData.rol === "AsistenteEnfermeria") && !formData.correo) {
        toast({
          title: "Error",
          description: "El correo es requerido para médicos y asistentes",
          variant: "destructive",
        })
        setLoading(false)
        return
      }

      if (formData.rol === "Medico" && !formData.especialidad) {
        toast({
          title: "Error",
          description: "La especialidad es requerida para médicos",
          variant: "destructive",
        })
        setLoading(false)
        return
      }

      // Generar correo automáticamente si no se proporciona
      let correoFinal = formData.correo?.trim()
      if (!correoFinal) {
        if (formData.rol === "Paciente") {
          correoFinal = `paciente${formData.dni}@hospital.com`
        } else if (formData.rol === "Medico") {
          correoFinal = `medico${formData.dni || Date.now()}@hospital.com`
        } else if (formData.rol === "AsistenteEnfermeria") {
          correoFinal = `asistente${formData.dni || Date.now()}@hospital.com`
        } else {
          correoFinal = `usuario${Date.now()}@hospital.com`
        }
      }

      // Preparar datos del usuario
      const usuarioData: any = {
        nombre: formData.nombre,
        apellido: formData.apellido,
        password: generatedPassword,
        rol: formData.rol,
        dni: formData.dni,
        correo: correoFinal,
      }

      // Insertar usuario y obtener el ID
      const { data: userData, error: userError } = await supabase
        .from("usuario")
        .insert([usuarioData])
        .select()
        .single()

      if (userError) {
        if (userError.code === "23505") {
          toast({
            title: "Error",
            description: "El DNI o correo ya está registrado en el sistema",
            variant: "destructive",
          })
        } else {
          throw userError
        }
        setLoading(false)
        return
      }

      // Crear registro específico según el rol
      if (formData.rol === "Paciente" && userData) {
        const { error: pacienteError } = await supabase.from("paciente").insert([
          {
            id_paciente: userData.id_usuario,
            dni: formData.dni,
            fecha_nacimiento: formData.fecha_nacimiento || null,
          },
        ])
        
        if (pacienteError) {
          await supabase.from("usuario").delete().eq("id_usuario", userData.id_usuario)
          throw pacienteError
        }
      }

      if (formData.rol === "Medico" && userData) {
        const { error: medicoError } = await supabase.from("medico").insert([
          {
            id_medico: userData.id_usuario,
            especialidad: formData.especialidad,
            max_pacientes_dia: parseInt(formData.max_pacientes_dia),
          },
        ])
        
        if (medicoError) {
          await supabase.from("usuario").delete().eq("id_usuario", userData.id_usuario)
          throw medicoError
        }
      }

      toast({
        title: "✅ Usuario Registrado Exitosamente",
        description: `${formData.nombre} ${formData.apellido} - Correo: ${correoFinal} - Contraseña: ${generatedPassword}`,
        duration: 10000,
      })

      // Reset form
      setFormData({
        nombre: "",
        apellido: "",
        correo: "",
        dni: "",
        rol: "Paciente",
        fecha_nacimiento: "",
        especialidad: "",
        max_pacientes_dia: "20",
      })
      setGeneratedPassword("")
    } catch (error) {
      console.error("Error al registrar usuario:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al registrar usuario",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="shadow-lg">
      <CardHeader className="bg-linear-to-r from-primary/5 to-primary/10">
        <CardTitle className="flex items-center gap-2 text-2xl">
          <UserPlus className="w-6 h-6" />
          Registrar Nuevo Usuario
        </CardTitle>
        <CardDescription className="text-base">
          Crea nuevos usuarios para pacientes, médicos y asistentes de enfermería en el sistema
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Selección de Rol */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <UserPlus className="w-4 h-4 text-primary" />
              </div>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Tipo de Usuario
              </h3>
            </div>
            <div className="space-y-2">
              <Label htmlFor="rol" className="text-sm font-medium">
                Selecciona el rol <span className="text-destructive">*</span>
              </Label>
              <Select value={formData.rol} onValueChange={(value) => setFormData({ ...formData, rol: value })}>
                <SelectTrigger id="rol" className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Paciente">👤 Paciente</SelectItem>
                  <SelectItem value="Medico">🩺 Médico</SelectItem>
                  <SelectItem value="AsistenteEnfermeria">👩‍⚕️ Asistente de Enfermería</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Información Personal */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-primary" />
              </div>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Información Personal
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nombre" className="text-sm font-medium">
                  Nombre <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="nombre"
                  placeholder="Ej: Juan"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="h-11"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="apellido" className="text-sm font-medium">
                  Apellido <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="apellido"
                  placeholder="Ej: Pérez García"
                  value={formData.apellido}
                  onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                  className="h-11"
                  required
                />
              </div>
            </div>
          </div>

          {/* Identificación según rol */}
          {formData.rol === "Paciente" && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-primary" />
                </div>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Identificación
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dni" className="text-sm font-medium">
                    DNI <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="dni"
                    placeholder="Ej: 12345678"
                    maxLength={8}
                    value={formData.dni}
                    onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
                    className="h-11"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fecha_nacimiento" className="text-sm font-medium">
                    Fecha de Nacimiento
                  </Label>
                  <Input
                    id="fecha_nacimiento"
                    type="date"
                    value={formData.fecha_nacimiento}
                    onChange={(e) => setFormData({ ...formData, fecha_nacimiento: e.target.value })}
                    className="h-11"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Información de Contacto */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <Mail className="w-4 h-4 text-primary" />
              </div>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Información de Contacto
              </h3>
            </div>

            <div className="space-y-2">
              <Label htmlFor="correo" className="text-sm font-medium">
                Correo Electrónico {(formData.rol === "Medico" || formData.rol === "AsistenteEnfermeria") && <span className="text-destructive">*</span>}
                {formData.rol === "Paciente" && <span className="text-muted-foreground text-xs ml-2">(se generará automáticamente si no se ingresa)</span>}
              </Label>
              <Input
                id="correo"
                type="email"
                placeholder={formData.rol === "Paciente" ? "Opcional - Se generará automáticamente" : "Ej: usuario@essalud.gob.pe"}
                value={formData.correo}
                onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
                className="h-11"
                required={formData.rol === "Medico" || formData.rol === "AsistenteEnfermeria"}
              />
              {formData.rol === "Paciente" && !formData.correo && formData.dni && (
                <p className="text-xs text-muted-foreground">
                  Se usará: <strong>paciente{formData.dni}@hospital.com</strong>
                </p>
              )}
            </div>
          </div>

          {/* Información Profesional - Solo para médicos */}
          {formData.rol === "Medico" && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <Stethoscope className="w-4 h-4 text-primary" />
                </div>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Información Profesional
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="especialidad" className="text-sm font-medium">
                    Especialidad <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.especialidad}
                    onValueChange={(value) => setFormData({ ...formData, especialidad: value })}
                  >
                    <SelectTrigger id="especialidad" className="h-11">
                      <SelectValue placeholder="Seleccionar especialidad" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Cardiología">Cardiología</SelectItem>
                      <SelectItem value="Pediatría">Pediatría</SelectItem>
                      <SelectItem value="Neurología">Neurología</SelectItem>
                      <SelectItem value="Traumatología">Traumatología</SelectItem>
                      <SelectItem value="Medicina General">Medicina General</SelectItem>
                      <SelectItem value="Ginecología">Ginecología</SelectItem>
                      <SelectItem value="Oftalmología">Oftalmología</SelectItem>
                      <SelectItem value="Dermatología">Dermatología</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max_pacientes" className="text-sm font-medium">
                    Máximo Pacientes por Día
                  </Label>
                  <Input
                    id="max_pacientes"
                    type="number"
                    placeholder="Ej: 20"
                    value={formData.max_pacientes_dia}
                    onChange={(e) => setFormData({ ...formData, max_pacientes_dia: e.target.value })}
                    className="h-11"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Información de Contraseña */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <Pill className="w-4 h-4 text-primary" />
              </div>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Credenciales de Acceso
              </h3>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password-preview" className="text-sm font-medium">Contraseña Generada Automáticamente</Label>
              <Input 
                id="password-preview" 
                type="text" 
                value={generatedPassword || "Se generará automáticamente al registrar"} 
                disabled 
                className="font-mono bg-muted h-11" 
              />
              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <p className="text-xs font-medium text-muted-foreground">
                  Contraseñas predeterminadas por rol:
                </p>
                <ul className="text-xs text-muted-foreground space-y-1 pl-4">
                  <li>• Paciente: <code className="bg-background px-2 py-1 rounded">Paciente123!</code></li>
                  <li>• Médico: <code className="bg-background px-2 py-1 rounded">Medico123!</code></li>
                  <li>• Asistente: <code className="bg-background px-2 py-1 rounded">Enfermera123!</code></li>
                </ul>
              </div>
            </div>
          </div>

          {/* Botón de Registro */}
          <Button type="submit" className="w-full h-12 text-base gap-2" disabled={loading}>
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Registrando...
              </>
            ) : (
              <>
                <UserPlus className="w-5 h-5" />
                Registrar Usuario
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
