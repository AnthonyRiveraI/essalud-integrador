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
    telefono: "",
    email: "",
  })

  useEffect(() => {
    loadPacientes()
  }, [])

  const loadPacientes = async () => {
    setLoading(true)
    const supabase = createClient()
    const { data, error } = await supabase
      .from("usuarios")
      .select("*")
      .eq("rol", "paciente")
      .order("nombre", { ascending: true })

    if (!error && data) {
      setPacientes(data)
    }
    setLoading(false)
  }

  const generatePassword = (nombre: string, apellido: string) => {
    return "Paciente123!"
  }

  const handleSavePaciente = async () => {
    if (!formData.nombre || !formData.apellido || !formData.dni) {
      toast({
        title: "⚠️ Campos incompletos",
        description: "Por favor completa todos los campos requeridos (*)",
        variant: "destructive",
      })
      return
    }

    const supabase = createClient()
    const password = editingPaciente ? editingPaciente.password_hash : generatePassword(formData.nombre, formData.apellido)

    if (editingPaciente) {
      // Editar paciente existente
      const { error } = await supabase
        .from("usuarios")
        .update({
          nombre: formData.nombre,
          apellido: formData.apellido,
          dni: formData.dni,
          telefono: formData.telefono,
          email: formData.email || null,
        })
        .eq("id", editingPaciente.id)

      if (!error) {
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
      // Crear nuevo paciente
      const { error } = await supabase.from("usuarios").insert([
        {
          nombre: formData.nombre,
          apellido: formData.apellido,
          dni: formData.dni,
          telefono: formData.telefono,
          email: formData.email || null,
          password_hash: password,
          rol: "paciente",
        },
      ])

      if (!error) {
        toast({
          title: "✅ Paciente registrado",
          description: `${formData.nombre} ${formData.apellido} fue registrado con DNI: ${formData.dni}`,
        })
        loadPacientes()
        setOpenDialog(false)
        resetForm()
      } else {
        toast({
          title: "❌ Error al registrar",
          description: "No se pudo registrar el paciente. Verifica el DNI no esté duplicado.",
          variant: "destructive",
        })
      }
    }
  }

  const handleEditPaciente = (paciente: any) => {
    setEditingPaciente(paciente)
    setFormData({
      nombre: paciente.nombre,
      apellido: paciente.apellido,
      dni: paciente.dni,
      telefono: paciente.telefono || "",
      email: paciente.email || "",
    })
    setOpenDialog(true)
  }

  const handleDeletePaciente = async (id: string, nombre: string, apellido: string) => {
    const supabase = createClient()
    const { error } = await supabase.from("usuarios").delete().eq("id", id)

    if (!error) {
      toast({
        title: "✅ Paciente eliminado",
        description: `${nombre} ${apellido} fue eliminado del sistema`,
      })
      loadPacientes()
    } else {
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
      telefono: "",
      email: "",
    })
    setEditingPaciente(null)
  }

  const filteredPacientes = pacientes.filter((paciente) => {
    const matchSearch =
      paciente.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      paciente.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
      paciente.dni.includes(searchTerm) ||
      (paciente.email && paciente.email.toLowerCase().includes(searchTerm.toLowerCase()))

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
                        Teléfono
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
                        Correo Electrónico
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Ej: paciente@email.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="h-11"
                      />
                    </div>
                  </div>
                </div>

                {/* Sección: Credenciales - Solo para nuevos pacientes */}
                {!editingPaciente && (
                  <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-start gap-3">
                      <Key className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                          Credenciales de Acceso
                        </p>
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                          DNI: <span className="font-mono font-bold">{formData.dni || "________"}</span>
                        </p>
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                          Contraseña: <span className="font-mono font-bold">Paciente123!</span>
                        </p>
                        <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                          El paciente podrá cambiar su contraseña después del primer inicio de sesión.
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
                  <tr key={paciente.id} className="border-b hover:bg-muted/50 transition-colors">
                    <td className="py-3 px-4 font-semibold">{paciente.dni}</td>
                    <td className="py-3 px-4">
                      {paciente.nombre} {paciente.apellido}
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">{paciente.email || "-"}</td>
                    <td className="py-3 px-4 text-muted-foreground">{paciente.telefono || "-"}</td>
                    <td className="py-3 px-4">
                      <code className="text-xs bg-muted px-2 py-1 rounded">{paciente.password_hash}</code>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">
                      {new Date(paciente.created_at).toLocaleDateString("es-PE")}
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
                          onClick={() => handleDeletePaciente(paciente.id, paciente.nombre, paciente.apellido)}
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
