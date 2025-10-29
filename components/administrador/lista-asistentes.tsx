"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { UserCog, Search, Mail, Phone, Calendar, Plus, Edit2, Trash2 } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"

export function ListaAsistentes() {
  const { toast } = useToast()
  const [asistentes, setAsistentes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [openDialog, setOpenDialog] = useState(false)
  const [editingAsistente, setEditingAsistente] = useState<any>(null)
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    dni: "",
    email: "",
    telefono: "",
  })

  useEffect(() => {
    loadAsistentes()
  }, [])

  const loadAsistentes = async () => {
    setLoading(true)
    const supabase = createClient()
    const { data, error } = await supabase
      .from("usuarios")
      .select("*")
      .eq("rol", "asistente_enfermeria")
      .order("created_at", { ascending: false })

    if (!error && data) {
      setAsistentes(data)
    }
    setLoading(false)
  }

  const generatePassword = (nombre: string, apellido: string) => {
    return "Enfermera123!"
  }

  const handleSaveAsistente = async () => {
    if (!formData.nombre || !formData.apellido || !formData.dni || !formData.email) {
      toast({
        title: "Campos Incompletos",
        description: "Por favor completa todos los campos requeridos",
        variant: "destructive",
      })
      return
    }

    const supabase = createClient()
    const password = editingAsistente ? editingAsistente.password_hash : generatePassword(formData.nombre, formData.apellido)

    if (editingAsistente) {
      // Editar asistente existente
      const { error } = await supabase
        .from("usuarios")
        .update({
          nombre: formData.nombre,
          apellido: formData.apellido,
          dni: formData.dni,
          email: formData.email,
          telefono: formData.telefono,
        })
        .eq("id", editingAsistente.id)

      if (!error) {
        toast({
          title: "✅ Asistente Actualizado",
          description: `Los datos de ${formData.nombre} ${formData.apellido} han sido actualizados`,
        })
        loadAsistentes()
        setOpenDialog(false)
        resetForm()
      } else {
        toast({
          title: "Error",
          description: "No se pudo actualizar el asistente",
          variant: "destructive",
        })
      }
    } else {
      // Crear nuevo asistente
      const { error } = await supabase.from("usuarios").insert([
        {
          nombre: formData.nombre,
          apellido: formData.apellido,
          dni: formData.dni,
          email: formData.email,
          telefono: formData.telefono,
          password_hash: password,
          rol: "asistente_enfermeria",
        },
      ])

      if (!error) {
        toast({
          title: "✅ Asistente Registrado",
          description: `${formData.nombre} ${formData.apellido} ha sido registrado exitosamente. Contraseña: ${password}`,
          duration: 8000,
        })
        loadAsistentes()
        setOpenDialog(false)
        resetForm()
      } else {
        toast({
          title: "Error",
          description: "No se pudo registrar el asistente",
          variant: "destructive",
        })
      }
    }
  }

  const handleEditAsistente = (asistente: any) => {
    setEditingAsistente(asistente)
    setFormData({
      nombre: asistente.nombre,
      apellido: asistente.apellido,
      dni: asistente.dni,
      email: asistente.email,
      telefono: asistente.telefono || "",
    })
    setOpenDialog(true)
  }

  const handleDeleteAsistente = async (id: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este asistente? Esta acción no se puede deshacer.")) return

    const supabase = createClient()
    const { error } = await supabase.from("usuarios").delete().eq("id", id)

    if (!error) {
      toast({
        title: "✅ Asistente Eliminado",
        description: "El asistente ha sido eliminado del sistema",
      })
      loadAsistentes()
    } else {
      toast({
        title: "Error",
        description: "No se pudo eliminar el asistente",
        variant: "destructive",
      })
    }
  }

  const resetForm = () => {
    setFormData({
      nombre: "",
      apellido: "",
      dni: "",
      email: "",
      telefono: "",
    })
    setEditingAsistente(null)
  }

  const filteredAsistentes = asistentes.filter(
    (a) =>
      a.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.dni.includes(searchTerm) ||
      (a.email && a.email.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">Cargando asistentes...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <UserCog className="w-5 h-5" />
              Lista de Asistentes de Enfermería
            </CardTitle>
            <CardDescription>Gestione y consulte la información de todos los asistentes de enfermería</CardDescription>
          </div>
          <Dialog open={openDialog} onOpenChange={setOpenDialog}>
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  resetForm()
                  setOpenDialog(true)
                }}
                size="lg"
                className="gap-2 shadow-md hover:shadow-lg transition-all"
              >
                <Plus className="w-5 h-5" />
                Agregar Asistente
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl flex items-center gap-2">
                  <UserCog className="w-6 h-6 text-primary" />
                  {editingAsistente ? "Editar Asistente de Enfermería" : "Registrar Nuevo Asistente de Enfermería"}
                </DialogTitle>
                <DialogDescription className="text-base">
                  {editingAsistente
                    ? "Actualiza los datos del asistente seleccionado"
                    : "Completa todos los campos requeridos para registrar un nuevo asistente"}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6 py-4">
                {/* Información Personal */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    Información Personal
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="nombre" className="text-sm font-medium">
                        Nombre <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="nombre"
                        placeholder="Ej: Ana María"
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
                        placeholder="Ej: Flores Quispe"
                        value={formData.apellido}
                        onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                        className="h-11"
                        required
                      />
                    </div>
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

                {/* Información de Contacto */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    Información de Contacto
                  </h3>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">
                      Correo Electrónico <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Ej: asistente@essalud.gob.pe"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="h-11"
                      required
                    />
                  </div>
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
                </div>

                {/* Botones de Acción */}
                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setOpenDialog(false)
                      resetForm()
                    }}
                    className="flex-1 h-11"
                  >
                    Cancelar
                  </Button>
                  <Button onClick={handleSaveAsistente} className="flex-1 h-11 gap-2">
                    <UserCog className="w-4 h-4" />
                    {editingAsistente ? "Actualizar Asistente" : "Registrar Asistente"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre, DNI o correo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {filteredAsistentes.length === 0 ? (
          <div className="text-center py-8">
            <UserCog className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No se encontraron asistentes de enfermería</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre Completo</TableHead>
                    <TableHead>DNI</TableHead>
                    <TableHead>Correo Electrónico</TableHead>
                    <TableHead>Contraseña</TableHead>
                    <TableHead>Teléfono</TableHead>
                    <TableHead>Fecha de Registro</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAsistentes.map((asistente) => (
                    <TableRow key={asistente.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                            <UserCog className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">
                              {asistente.nombre} {asistente.apellido}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{asistente.dni}</TableCell>
                      <TableCell>
                        {asistente.email ? (
                          <div className="flex items-center gap-1">
                            <Mail className="w-3 h-3 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">{asistente.email}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="font-mono text-sm bg-muted/50 rounded px-2 py-1">
                        {asistente.password_hash}
                      </TableCell>
                      <TableCell>
                        {asistente.telefono ? (
                          <div className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">{asistente.telefono}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            {new Date(asistente.created_at).toLocaleDateString("es-PE")}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">Activo</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditAsistente(asistente)}
                            className="gap-1 hover:bg-primary hover:text-primary-foreground transition-colors"
                          >
                            <Edit2 className="w-3 h-3" />
                            <span className="hidden sm:inline">Editar</span>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteAsistente(asistente.id)}
                            className="gap-1 text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span className="hidden sm:inline">Eliminar</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
