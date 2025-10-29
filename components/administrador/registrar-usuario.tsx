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

interface Especialidad {
  id: number
  nombre: string
}

export function RegistrarUsuario() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [generatedPassword, setGeneratedPassword] = useState("")
  const [especialidades, setEspecialidades] = useState<Especialidad[]>([])
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    email: "",
    dni: "",
    telefono: "",
    rol: "paciente",
    tipo_asegurado: "asegurado",
    especialidad: "",
    colegiatura: "",
  })

  // Cargar especialidades al montar el componente
  useEffect(() => {
    const cargarEspecialidades = async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("especialidades")
        .select("id, nombre")
        .order("nombre")

      if (!error && data) {
        setEspecialidades(data)
      }
    }

    cargarEspecialidades()
  }, [])

  const generatePassword = (nombre: string, apellido: string, rol: string): string => {
    // Generar contraseña según el rol
    const randomNum = Math.floor(Math.random() * 100)
    if (rol === "paciente") {
      return "Paciente123!"
    } else if (rol === "medico") {
      return "Medico123!"
    } else if (rol === "asistente") {
      return "Enfermera123!"
    }
    return `${nombre}${apellido.charAt(0)}${randomNum}!`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const generatedPassword = generatePassword(formData.nombre, formData.apellido, formData.rol)
      setGeneratedPassword(generatedPassword)

      const supabase = createClient()

      // Validaciones específicas por rol
      if (formData.rol === "paciente" && !formData.dni) {
        toast({
          title: "Error",
          description: "El DNI es requerido para pacientes",
          variant: "destructive",
        })
        setLoading(false)
        return
      }

      if ((formData.rol === "medico" || formData.rol === "asistente") && !formData.email) {
        toast({
          title: "Error",
          description: "El email es requerido para médicos y asistentes",
          variant: "destructive",
        })
        setLoading(false)
        return
      }

      if (formData.rol === "medico" && !formData.especialidad) {
        toast({
          title: "Error",
          description: "La especialidad es requerida para médicos",
          variant: "destructive",
        })
        setLoading(false)
        return
      }

      if (formData.rol === "medico" && !formData.colegiatura) {
        toast({
          title: "Error",
          description: "La colegiatura es requerida para médicos",
          variant: "destructive",
        })
        setLoading(false)
        return
      }

      // Mapear el rol al formato de la base de datos
      const rolBD = formData.rol === "asistente" ? "asistente_enfermeria" : formData.rol

      // Preparar datos del usuario
      const usuarioData: any = {
        nombre: formData.nombre,
        apellido: formData.apellido,
        password_hash: generatedPassword, // La base de datos espera password_hash
        rol: rolBD,
        telefono: formData.telefono || null,
      }

      // Agregar DNI o email según el rol
      if (formData.rol === "paciente") {
        usuarioData.dni = formData.dni
        usuarioData.email = null
      } else {
        usuarioData.email = formData.email
        usuarioData.dni = null
      }

      // Insertar usuario y obtener el ID
      const { data: userData, error: userError } = await supabase
        .from("usuarios")
        .insert([usuarioData])
        .select()
        .single()

      if (userError) {
        if (userError.code === "23505") {
          // Código de error para violación de unique constraint
          toast({
            title: "Error",
            description: "El DNI o email ya está registrado en el sistema",
            variant: "destructive",
          })
        } else {
          throw userError
        }
        setLoading(false)
        return
      }

      // Si es médico, crear registro en tabla medicos
      if (formData.rol === "medico" && userData) {
        const { error: medicoError } = await supabase.from("medicos").insert([
          {
            usuario_id: userData.id,
            especialidad_id: parseInt(formData.especialidad),
            numero_colegiatura: formData.colegiatura,
          },
        ])
        
        if (medicoError) {
          // Si falla la creación del médico, eliminar el usuario creado
          await supabase.from("usuarios").delete().eq("id", userData.id)
          throw medicoError
        }
      }

      toast({
        title: "✅ Usuario Registrado Exitosamente",
        description: `${formData.nombre} ${formData.apellido} ha sido registrado. Contraseña: ${generatedPassword}`,
        duration: 8000,
      })

      // Reset form
      setFormData({
        nombre: "",
        apellido: "",
        email: "",
        dni: "",
        telefono: "",
        rol: "paciente",
        tipo_asegurado: "asegurado",
        especialidad: "",
        colegiatura: "",
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
      <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10">
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
                  <SelectItem value="paciente">👤 Paciente</SelectItem>
                  <SelectItem value="medico">🩺 Médico</SelectItem>
                  <SelectItem value="asistente">👩‍⚕️ Asistente de Enfermería</SelectItem>
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
          {formData.rol === "paciente" && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-primary" />
                </div>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Identificación
                </h3>
              </div>
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

            {(formData.rol === "medico" || formData.rol === "asistente") && (
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Correo Electrónico <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Ej: usuario@essalud.gob.pe"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="h-11"
                  required
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="telefono" className="text-sm font-medium">
                Teléfono {(formData.rol === "medico" || formData.rol === "asistente") ? "" : "(Opcional)"}
              </Label>
              <Input
                id="telefono"
                placeholder="Ej: 987654321"
                value={formData.telefono}
                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                className="h-11"
              />
            </div>
          </div>

          {/* Información Profesional - Solo para médicos */}
          {formData.rol === "medico" && (
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
                      {especialidades.length > 0 ? (
                        especialidades.map((esp) => (
                          <SelectItem key={esp.id} value={esp.id.toString()}>
                            {esp.nombre}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="0" disabled>
                          Cargando especialidades...
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="colegiatura" className="text-sm font-medium">
                    Número de Colegiatura <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="colegiatura"
                    placeholder="Ej: CMP-12345"
                    value={formData.colegiatura}
                    onChange={(e) => setFormData({ ...formData, colegiatura: e.target.value })}
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
