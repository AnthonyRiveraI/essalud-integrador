"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { User, Mail, CreditCard, Key, Stethoscope, Calendar } from "lucide-react"

interface FormularioUsuarioProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  rol: "Paciente" | "Medico" | "AsistenteEnfermeria"
  usuario?: any
  onSuccess: () => void
}

const generatePassword = (nombre: string, apellido: string, rol: string): string => {
  if (rol === "Paciente") return "Paciente123!"
  if (rol === "Medico") return "Medico123!"
  if (rol === "AsistenteEnfermeria") return "Enfermera123!"
  return "Usuario123!"
}

export function FormularioUsuario({ open, onOpenChange, rol, usuario, onSuccess }: FormularioUsuarioProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    dni: "",
    correo: "",
    password: "",
    fecha_nacimiento: "",
    telefono: "",
    especialidad: "",
    max_pacientes_dia: "20",
  })

  useEffect(() => {
    if (usuario) {
      // Modo edición
      setFormData({
        nombre: usuario.usuario?.nombre || "",
        apellido: usuario.usuario?.apellido || "",
        dni: usuario.usuario?.dni || usuario.dni || "",
        correo: usuario.usuario?.correo || "",
        password: usuario.usuario?.password || "",
        fecha_nacimiento: usuario.fecha_nacimiento || "",
        telefono: "",
        especialidad: usuario.especialidad || "",
        max_pacientes_dia: String(usuario.max_pacientes_dia || "20"),
      })
    } else {
      // Modo creación
      resetForm()
    }
  }, [usuario, open])

  const resetForm = () => {
    setFormData({
      nombre: "",
      apellido: "",
      dni: "",
      correo: "",
      password: "",
      fecha_nacimiento: "",
      telefono: "",
      especialidad: "",
      max_pacientes_dia: "20",
    })
  }

  const handleSubmit = async () => {
    // Validaciones
    if (!formData.nombre || !formData.apellido || !formData.dni) {
      toast({
        title: "⚠️ Campos incompletos",
        description: "Por favor completa: Nombre, Apellido y DNI",
        variant: "destructive",
      })
      return
    }

    if ((rol === "Medico" || rol === "AsistenteEnfermeria") && !formData.correo) {
      toast({
        title: "⚠️ Campo requerido",
        description: "El correo es obligatorio para médicos y asistentes",
        variant: "destructive",
      })
      return
    }

    if (rol === "Medico" && !formData.especialidad) {
      toast({
        title: "⚠️ Campo requerido",
        description: "La especialidad es obligatoria para médicos",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    const supabase = createClient()

    try {
      // Generar correo si es necesario
      let correoFinal = formData.correo?.trim()
      if (!correoFinal) {
        if (rol === "Paciente") {
          correoFinal = `paciente${formData.dni}@hospital.com`
        } else if (rol === "Medico") {
          correoFinal = `medico${formData.dni}@hospital.com`
        } else {
          correoFinal = `asistente${formData.dni}@hospital.com`
        }
      }

      // Generar contraseña si es necesario
      const passwordFinal = formData.password?.trim() || generatePassword(formData.nombre, formData.apellido, rol)

      if (usuario) {
        // ACTUALIZAR USUARIO EXISTENTE
        const idUsuario = usuario.id_paciente || usuario.id_medico || usuario.id_usuario

        await supabase
          .from("usuario")
          .update({
            nombre: formData.nombre,
            apellido: formData.apellido,
            dni: formData.dni,
            correo: correoFinal,
          })
          .eq("id_usuario", idUsuario)

        if (rol === "Paciente") {
          await supabase
            .from("paciente")
            .update({
              dni: formData.dni,
              fecha_nacimiento: formData.fecha_nacimiento || null,
            })
            .eq("id_paciente", idUsuario)
        } else if (rol === "Medico") {
          await supabase
            .from("medico")
            .update({
              especialidad: formData.especialidad,
              max_pacientes_dia: parseInt(formData.max_pacientes_dia) || 20,
            })
            .eq("id_medico", idUsuario)
        }

        toast({
          title: "✅ Usuario actualizado",
          description: `${formData.nombre} ${formData.apellido} fue actualizado correctamente`,
        })
      } else {
        // CREAR NUEVO USUARIO
        const { data: newUser, error: usuarioError } = await supabase
          .from("usuario")
          .insert({
            nombre: formData.nombre,
            apellido: formData.apellido,
            dni: formData.dni,
            correo: correoFinal,
            password: passwordFinal,
            rol: rol,
          })
          .select()
          .single()

        if (usuarioError) throw usuarioError

        // Crear registro específico según el rol
        if (rol === "Paciente" && newUser) {
          await supabase.from("paciente").insert({
            id_paciente: newUser.id_usuario,
            dni: formData.dni,
            fecha_nacimiento: formData.fecha_nacimiento || null,
          })
        } else if (rol === "Medico" && newUser) {
          await supabase.from("medico").insert({
            id_medico: newUser.id_usuario,
            especialidad: formData.especialidad,
            max_pacientes_dia: parseInt(formData.max_pacientes_dia) || 20,
          })
        }

        toast({
          title: "✅ Usuario registrado exitosamente",
          description: `${formData.nombre} ${formData.apellido} - Correo: ${correoFinal} - Contraseña: ${passwordFinal}`,
          duration: 10000,
        })
      }

      onSuccess()
      onOpenChange(false)
      resetForm()
    } catch (error: any) {
      console.error("Error al guardar usuario:", error)
      toast({
        title: "❌ Error al guardar",
        description: error.message || "No se pudo guardar el usuario",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getRolLabel = () => {
    if (rol === "Paciente") return "Paciente"
    if (rol === "Medico") return "Médico"
    return "Asistente de Enfermería"
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="bg-linear-to-r from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 -m-6 mb-4 p-6 rounded-t-lg">
          <DialogTitle className="text-xl flex items-center gap-2">
            {usuario ? `Editar ${getRolLabel()}` : `Registrar Nuevo ${getRolLabel()}`}
          </DialogTitle>
          <DialogDescription>
            {usuario
              ? `Actualiza los datos de ${usuario.usuario?.nombre || ""}`
              : `Completa los datos para registrar un nuevo ${getRolLabel().toLowerCase()}`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Información Personal */}
          <div className="space-y-4 p-4 bg-muted/30 rounded-lg border">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <User className="w-4 h-4 text-blue-600" />
              Información Personal
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nombre">
                  Nombre <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="nombre"
                  placeholder="Ej: Juan"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="apellido">
                  Apellido <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="apellido"
                  placeholder="Ej: Pérez"
                  value={formData.apellido}
                  onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                  className="h-11"
                />
              </div>
            </div>
          </div>

          {/* Identificación */}
          <div className="space-y-4 p-4 bg-muted/30 rounded-lg border">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <CreditCard className="w-4 h-4 text-green-600" />
              Identificación
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dni">
                  DNI <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="dni"
                  placeholder="Ej: 12345678"
                  value={formData.dni}
                  onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
                  maxLength={8}
                  className="h-11"
                />
              </div>
              {rol === "Paciente" && (
                <div className="space-y-2">
                  <Label htmlFor="fecha_nacimiento">
                    <Calendar className="w-3 h-3 inline mr-1" />
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
              )}
            </div>
          </div>

          {/* Información de Contacto */}
          <div className="space-y-4 p-4 bg-muted/30 rounded-lg border">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Mail className="w-4 h-4 text-purple-600" />
              Información de Contacto
            </div>
            <div className="space-y-2">
              <Label htmlFor="correo">
                Correo Electrónico{" "}
                {(rol === "Medico" || rol === "AsistenteEnfermeria") && <span className="text-destructive">*</span>}
                {rol === "Paciente" && (
                  <span className="text-muted-foreground text-xs ml-2">(se generará automáticamente si no se ingresa)</span>
                )}
              </Label>
              <Input
                id="correo"
                type="email"
                placeholder={rol === "Paciente" ? "Opcional" : "Ej: usuario@hospital.com"}
                value={formData.correo}
                onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
                className="h-11"
              />
              {rol === "Paciente" && !formData.correo && formData.dni && (
                <p className="text-xs text-muted-foreground">
                  Se usará: <strong>paciente{formData.dni}@hospital.com</strong>
                </p>
              )}
            </div>
          </div>

          {/* Información Profesional - Solo para Médicos */}
          {rol === "Medico" && (
            <div className="space-y-4 p-4 bg-muted/30 rounded-lg border">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Stethoscope className="w-4 h-4 text-orange-600" />
                Información Profesional
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="especialidad">
                    Especialidad <span className="text-destructive">*</span>
                  </Label>
                  <Select value={formData.especialidad} onValueChange={(value) => setFormData({ ...formData, especialidad: value })}>
                    <SelectTrigger id="especialidad" className="h-11">
                      <SelectValue placeholder="Seleccionar especialidad" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Cardiología">Cardiología</SelectItem>
                      <SelectItem value="Pediatría">Pediatría</SelectItem>
                      <SelectItem value="Neurología">Neurología</SelectItem>
                      <SelectItem value="Traumatología">Traumatología</SelectItem>
                      <SelectItem value="Medicina General">Medicina General</SelectItem>
                      <SelectItem value="Dermatología">Dermatología</SelectItem>
                      <SelectItem value="Oftalmología">Oftalmología</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max_pacientes_dia">Máximo Pacientes/Día</Label>
                  <Input
                    id="max_pacientes_dia"
                    type="number"
                    min="1"
                    max="50"
                    value={formData.max_pacientes_dia}
                    onChange={(e) => setFormData({ ...formData, max_pacientes_dia: e.target.value })}
                    className="h-11"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Credenciales - Solo para nuevos usuarios */}
          {!usuario && (
            <div className="space-y-4 p-4 bg-linear-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 rounded-lg border-2 border-blue-300 dark:border-blue-700">
              <div className="flex items-center gap-2 text-sm font-semibold text-blue-900 dark:text-blue-100">
                <Key className="w-5 h-5 text-blue-600" />
                Credenciales de Acceso
              </div>
              <div className="space-y-3">
                <div className="p-3 bg-white dark:bg-gray-900 rounded-md border border-blue-200">
                  <p className="text-xs text-muted-foreground mb-1">Usuario (DNI):</p>
                  <p className="text-sm font-bold font-mono">{formData.dni || "Ingrese el DNI arriba"}</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña (opcional)</Label>
                  <Input
                    id="password"
                    type="text"
                    placeholder={`Por defecto: ${generatePassword("", "", rol)}`}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="h-11 font-mono"
                  />
                  <p className="text-xs text-muted-foreground">
                    Si no especificas una, se usará: <strong>{generatePassword("", "", rol)}</strong>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Botones */}
          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1 h-11" disabled={loading}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} className="flex-1 h-11" disabled={loading}>
              {loading ? "Guardando..." : usuario ? "Actualizar" : "Registrar"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
