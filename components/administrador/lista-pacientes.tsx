"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { Users, Search, Plus, Edit2, Trash2, User, CreditCard, Phone, Key } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"

export function ListaPacientes() {
  const { toast } = useToast()
  const [pacientes, setPacientes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [openDialog, setOpenDialog] = useState(false)
  const [editingPaciente, setEditingPaciente] = useState<any>(null)
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    dni: "",
    correo: "",
    fecha_nacimiento: "",
    password: "",
    telefono: "",
  })

  useEffect(() => {
    loadPacientes()
  }, [])

  const loadPacientes = async () => {
    setLoading(true)
    const supabase = createClient()
    
    // Obtener todos los pacientes
    const { data: pacientesData, error: pacientesError } = await supabase
      .from("paciente")
      .select("*")
      .order("id_paciente", { ascending: true })

    if (pacientesError || !pacientesData) {
      setLoading(false)
      return
    }

    // Obtener datos de usuario para cada paciente
    const pacientesCompletos = await Promise.all(
      pacientesData.map(async (paciente) => {
        const { data: usuarioData } = await supabase
          .from("usuario")
          .select("id_usuario, nombre, apellido, dni, correo, password, rol")
          .eq("id_usuario", paciente.id_paciente)
          .single()

        return {
          ...paciente,
          usuario: usuarioData || {},
        }
      })
    )

    setPacientes(pacientesCompletos)
    setLoading(false)
  }

  const generatePassword = (nombre: string, apellido: string) => {
    return "Paciente123!"
  }

  const handleSavePaciente = async () => {
    if (!formData.nombre || !formData.apellido || !formData.dni || !formData.correo) {
      toast({
        title: "⚠️ Campos incompletos",
        description: "Por favor completa: Nombre, Apellido, DNI y Correo Electrónico",
        variant: "destructive",
      })
      return
    }

    const supabase = createClient()
    
    // Usar la contraseña proporcionada o generar una por defecto
    const password = formData.password?.trim() || generatePassword(formData.nombre, formData.apellido)

    if (editingPaciente) {
      // Editar paciente existente - actualizar usuario
      const { error: usuarioError } = await supabase
        .from("usuario")
        .update({
          nombre: formData.nombre,
          apellido: formData.apellido,
          dni: formData.dni,
          correo: formData.correo,
        })
        .eq("id_usuario", editingPaciente.id_paciente) // id_paciente = id_usuario

      // Actualizar tabla paciente
      if (!usuarioError) {
        await supabase
          .from("paciente")
          .update({
            dni: formData.dni,
            fecha_nacimiento: formData.fecha_nacimiento || null,
          })
          .eq("id_paciente", editingPaciente.id_paciente)
      }

      if (!usuarioError) {
        toast({
          title: "✅ Paciente actualizado",
          description: `Se actualizó correctamente a ${formData.nombre} ${formData.apellido}`,
        })
        loadPacientes()
        setOpenDialog(false)
        resetForm()
      } else {
        toast({
          title: "❌ Error al actualizar",
          description: "No se pudo actualizar el paciente. Intenta nuevamente.",
          variant: "destructive",
        })
      }
    } else {
      // Crear nuevo paciente - primero crear usuario
      const { data: newUser, error: usuarioError } = await supabase
        .from("usuario")
        .insert({
          nombre: formData.nombre,
          apellido: formData.apellido,
          dni: formData.dni,
          correo: formData.correo,
          password: password,
          rol: "Paciente",
        })
        .select()
        .single()

      if (!usuarioError && newUser) {
        // Crear registro en tabla paciente
        await supabase.from("paciente").insert({
          id_paciente: newUser.id_usuario,
          dni: formData.dni,
          fecha_nacimiento: formData.fecha_nacimiento || null,
        })

        toast({
          title: "✅ Paciente registrado exitosamente",
          description: `Correo: ${formData.correo} | Contraseña: ${password}`,
          duration: 10000, // Mostrar por 10 segundos
        })
        loadPacientes()
        setOpenDialog(false)
        resetForm()
      } else {
        console.error("Error al registrar usuario:", usuarioError)
        toast({
          title: "❌ Error al registrar",
          description: usuarioError?.message || "No se pudo registrar el paciente. Intenta nuevamente.",
          variant: "destructive",
        })
      }
    }
  }

  const handleEditPaciente = (paciente: any) => {
    setEditingPaciente(paciente)
    setFormData({
      nombre: paciente.usuario?.nombre || "",
      apellido: paciente.usuario?.apellido || "",
      dni: paciente.dni || "",
      correo: paciente.usuario?.correo || "",
      fecha_nacimiento: paciente.fecha_nacimiento || "",
      password: paciente.usuario?.password || "",
      telefono: "",
    })
    setOpenDialog(true)
  }

  const handleDeletePaciente = async (id: number, nombre: string, apellido: string) => {
    const supabase = createClient()
    
    try {
      // Paso 1: Eliminar registros dependientes en orden
      // Eliminar historiales clínicos
      await supabase
        .from("historialclinico")
        .delete()
        .eq("id_paciente", id)

      // Eliminar triajes
      await supabase
        .from("triaje")
        .delete()
        .eq("id_paciente", id)

      // Eliminar citas
      await supabase
        .from("cita")
        .delete()
        .eq("id_paciente", id)

      // Paso 2: Eliminar de tabla paciente
      const { error: pacienteError } = await supabase
        .from("paciente")
        .delete()
        .eq("id_paciente", id)

      if (pacienteError) throw pacienteError

      // Paso 3: Eliminar de tabla usuario
      const { error: usuarioError } = await supabase
        .from("usuario")
        .delete()
        .eq("id_usuario", id)

      if (usuarioError) throw usuarioError

      toast({
        title: "✅ Paciente eliminado",
        description: `${nombre} ${apellido} fue eliminado del sistema`,
      })
      loadPacientes()
    } catch (error) {
      console.error("Error al eliminar paciente:", error)
      toast({
        title: "❌ Error al eliminar",
        description: "No se pudo eliminar el paciente. Intenta nuevamente.",
        variant: "destructive",
      })
    }
  }

  const resetForm = () => {
    setFormData({
      nombre: "",
      apellido: "",
      dni: "",
      correo: "",
      fecha_nacimiento: "",
      password: "",
      telefono: "",
    })
    setEditingPaciente(null)
  }

  const filteredPacientes = pacientes.filter((paciente) => {
    const searchLower = searchTerm.toLowerCase()
    const matchSearch =
      paciente.usuario?.nombre?.toLowerCase().includes(searchLower) ||
      paciente.usuario?.apellido?.toLowerCase().includes(searchLower) ||
      String(paciente.dni || "").includes(searchTerm) ||
      (paciente.usuario?.correo && paciente.usuario.correo.toLowerCase().includes(searchLower))

    return matchSearch
  })

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Lista de Pacientes
            </CardTitle>
            <CardDescription>
              Total de pacientes: <span className="font-semibold text-primary">{pacientes.length}</span>
            </CardDescription>
          </div>
          <Dialog open={openDialog} onOpenChange={setOpenDialog}>
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  resetForm()
                  setOpenDialog(true)
                }}
                className="gap-2 h-11 shadow-md hover:shadow-lg transition-all"
              >
                <Plus className="w-4 h-4" />
                Agregar Paciente
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader className="bg-linear-to-r from-blue-50 to-cyan-50 -m-6 mb-4 p-6 rounded-t-lg">
                <DialogTitle className="text-xl flex items-center gap-2">
                  {editingPaciente ? (
                    <>
                      <Edit2 className="w-5 h-5 text-blue-600" />
                      Editar Paciente
                    </>
                  ) : (
                    <>
                      <Plus className="w-5 h-5 text-blue-600" />
                      Registrar Nuevo Paciente
                    </>
                  )}
                </DialogTitle>
                <DialogDescription>
                  {editingPaciente
                    ? "Actualiza los datos del paciente seleccionado"
                    : "Completa los datos para registrar un nuevo paciente en el sistema"}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6 py-4">
                {/* Sección: Información Personal */}
                <div className="space-y-4 p-4 bg-muted/30 rounded-lg border border-border">
                  <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <User className="w-4 h-4 text-blue-600" />
                    Información Personal
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="nombre" className="text-sm font-medium">
                        Nombre <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="nombre"
                        placeholder="Ej: Juan Carlos"
                        value={formData.nombre}
                        onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                        className="h-11"
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
                      />
                    </div>
                  </div>
                </div>

                {/* Sección: Identificación */}
                <div className="space-y-4 p-4 bg-muted/30 rounded-lg border border-border">
                  <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <CreditCard className="w-4 h-4 text-green-600" />
                    Identificación
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dni" className="text-sm font-medium">
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
                </div>

                {/* Sección: Información de Contacto */}
                <div className="space-y-4 p-4 bg-muted/30 rounded-lg border border-border">
                  <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <Phone className="w-4 h-4 text-purple-600" />
                    Información de Contacto
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="telefono" className="text-sm font-medium">
                        Teléfono <span className="text-muted-foreground text-xs">(opcional)</span>
                      </Label>
                      <Input
                        id="telefono"
                        placeholder="Ej: 987654321"
                        value={formData.telefono}
                        onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium">
                        Correo Electrónico <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Ej: paciente@email.com"
                        value={formData.correo}
                        onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
                        className="h-11"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Sección: Credenciales - Solo para nuevos pacientes */}
                {!editingPaciente && (
                  <div className="space-y-4 p-4 bg-linear-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 rounded-lg border-2 border-blue-300 dark:border-blue-700">
                    <div className="flex items-center gap-2 text-sm font-semibold text-blue-900 dark:text-blue-100">
                      <Key className="w-5 h-5 text-blue-600" />
                      Credenciales de Acceso al Sistema
                    </div>
                    
                    <div className="space-y-3">
                      <div className="p-3 bg-white dark:bg-gray-900 rounded-md border border-blue-200 dark:border-blue-800">
                        <p className="text-xs text-muted-foreground mb-1">Usuario para inicio de sesión:</p>
                        <p className="text-sm font-bold text-blue-900 dark:text-blue-100">
                          DNI: <span className="font-mono text-lg">{formData.dni || "Ingrese el DNI arriba"}</span>
                        </p>
                      </div>
                      
                      <div className="p-3 bg-white dark:bg-gray-900 rounded-md border border-blue-200 dark:border-blue-800">
                        <p className="text-xs text-muted-foreground mb-1">Correo electrónico:</p>
                        <p className="text-sm font-bold text-blue-900 dark:text-blue-100 break-all">
                          <span className="font-mono">{formData.correo || "Ingrese el correo arriba"}</span>
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="password" className="text-sm font-medium flex items-center gap-2">
                          <span>Contraseña de Acceso</span>
                          <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="password"
                          type="text"
                          placeholder="Ingrese la contraseña"
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          className="h-11 font-mono text-base bg-white dark:bg-gray-900"
                        />
                        <div className="flex items-start gap-2 p-2 bg-amber-50 dark:bg-amber-950/30 rounded border border-amber-200 dark:border-amber-800">
                          <span className="text-amber-600 text-sm">💡</span>
                          <p className="text-xs text-amber-700 dark:text-amber-300">
                            Sugerencia: Si dejas vacío, se usará <strong className="font-mono">Paciente123!</strong>
                          </p>
                        </div>
                      </div>
                      
                      <div className="p-3 bg-green-50 dark:bg-green-950/30 rounded border border-green-200 dark:border-green-800">
                        <p className="text-xs font-semibold text-green-900 dark:text-green-100 mb-1">
                          ✅ Recuerda anotar estas credenciales
                        </p>
                        <p className="text-xs text-green-700 dark:text-green-300">
                          El paciente las necesitará para iniciar sesión en el sistema.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <Button 
                  onClick={handleSavePaciente} 
                  className="w-full h-11 shadow-md hover:shadow-lg transition-all"
                >
                  {editingPaciente ? "Actualizar Paciente" : "Registrar Paciente"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre, apellido, DNI o correo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-11"
          />
        </div>

        {loading ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Cargando pacientes...</p>
          </div>
        ) : filteredPacientes.length === 0 ? (
          <div className="text-center py-8">
            <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No se encontraron pacientes</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-semibold">DNI</th>
                  <th className="text-left py-3 px-4 font-semibold">Nombre Completo</th>
                  <th className="text-left py-3 px-4 font-semibold">Correo</th>
                  <th className="text-left py-3 px-4 font-semibold">Teléfono</th>
                  <th className="text-left py-3 px-4 font-semibold">Contraseña</th>
                  <th className="text-left py-3 px-4 font-semibold">Fecha Registro</th>
                  <th className="text-left py-3 px-4 font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredPacientes.map((paciente) => (
                  <tr key={paciente.id_paciente} className="border-b hover:bg-muted/50 transition-colors">
                    <td className="py-3 px-4 font-semibold">{paciente.dni}</td>
                    <td className="py-3 px-4">
                      {paciente.usuario?.nombre} {paciente.usuario?.apellido}
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">{paciente.usuario?.correo || "-"}</td>
                    <td className="py-3 px-4 text-muted-foreground">-</td>
                    <td className="py-3 px-4">
                      <code className="text-xs bg-muted px-2 py-1 rounded">{paciente.usuario?.password || "***"}</code>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">
                      {paciente.fecha_nacimiento ? new Date(paciente.fecha_nacimiento).toLocaleDateString("es-PE") : "-"}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditPaciente(paciente)}
                          className="gap-1 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 transition-colors"
                        >
                          <Edit2 className="w-3 h-3" />
                          Editar
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeletePaciente(paciente.id_paciente, paciente.usuario?.nombre || "", paciente.usuario?.apellido || "")}
                          className="gap-1 hover:shadow-md transition-all"
                        >
                          <Trash2 className="w-3 h-3" />
                          Eliminar
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
