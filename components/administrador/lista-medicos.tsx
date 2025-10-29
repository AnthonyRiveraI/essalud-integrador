"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { Users, Search, Stethoscope, Mail, Phone, Plus, Edit2, Trash2 } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

export function ListaMedicos() {
  const { toast } = useToast()
  const [medicos, setMedicos] = useState<any[]>([])
  const [especialidades, setEspecialidades] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [openDialog, setOpenDialog] = useState(false)
  const [editingMedico, setEditingMedico] = useState<any>(null)
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    dni: "",
    email: "",
    telefono: "",
    especialidad_id: "",
    numero_colegiatura: "",
  })

  useEffect(() => {
    loadMedicos()
    loadEspecialidades()
  }, [])

  const loadMedicos = async () => {
    setLoading(true)
    const supabase = createClient()
    const { data, error } = await supabase
      .from("medicos")
      .select(
        `
        *,
        usuario:usuarios!medicos_usuario_id_fkey(nombre, apellido, email, telefono, dni, password_hash),
        especialidad:especialidades!medicos_especialidad_id_fkey(nombre)
      `,
      )
      .order("created_at", { ascending: false })

    if (!error && data) {
      setMedicos(data)
    }
    setLoading(false)
  }

  const loadEspecialidades = async () => {
    const supabase = createClient()
    const { data } = await supabase.from("especialidades").select("*").order("nombre")
    if (data) setEspecialidades(data)
  }

  const generatePassword = (nombre: string, apellido: string) => {
    return "Medico123!"
  }

  const handleSaveMedico = async () => {
    if (!formData.nombre || !formData.apellido || !formData.dni || !formData.email || !formData.especialidad_id) {
      toast({
        title: "Campos Incompletos",
        description: "Por favor completa todos los campos requeridos",
        variant: "destructive",
      })
      return
    }

    const supabase = createClient()
    const password = editingMedico
      ? editingMedico.usuario.password_hash
      : generatePassword(formData.nombre, formData.apellido)

    if (editingMedico) {
      // Editar médico existente
      const { error: updateError } = await supabase
        .from("usuarios")
        .update({
          nombre: formData.nombre,
          apellido: formData.apellido,
          dni: formData.dni,
          email: formData.email,
          telefono: formData.telefono,
        })
        .eq("id", editingMedico.usuario_id)

      const { error: medicoError } = await supabase
        .from("medicos")
        .update({
          especialidad_id: formData.especialidad_id,
          numero_colegiatura: formData.numero_colegiatura,
        })
        .eq("id", editingMedico.id)

      if (!updateError && !medicoError) {
        toast({
          title: "✅ Médico Actualizado",
          description: `Los datos de ${formData.nombre} ${formData.apellido} han sido actualizados`,
        })
        loadMedicos()
        setOpenDialog(false)
        resetForm()
      } else {
        toast({
          title: "Error",
          description: "No se pudo actualizar el médico",
          variant: "destructive",
        })
      }
    } else {
      // Crear nuevo médico
      const { data: userData, error: userError } = await supabase
        .from("usuarios")
        .insert([
          {
            nombre: formData.nombre,
            apellido: formData.apellido,
            dni: formData.dni,
            email: formData.email,
            telefono: formData.telefono,
            password_hash: password,
            rol: "medico",
          },
        ])
        .select()

      if (!userError && userData) {
        const { error: medicoError } = await supabase.from("medicos").insert([
          {
            usuario_id: userData[0].id,
            especialidad_id: parseInt(formData.especialidad_id),
            numero_colegiatura: formData.numero_colegiatura,
            max_citas_dia: 20,
            minutos_por_cita: 30,
          },
        ])

        if (!medicoError) {
          toast({
            title: "✅ Médico Registrado",
            description: `${formData.nombre} ${formData.apellido} ha sido registrado exitosamente. Contraseña: ${password}`,
            duration: 8000,
          })
          loadMedicos()
          setOpenDialog(false)
          resetForm()
        } else {
          toast({
            title: "Error",
            description: "No se pudo completar el registro del médico",
            variant: "destructive",
          })
        }
      } else {
        toast({
          title: "Error",
          description: userError?.message || "No se pudo crear el usuario médico",
          variant: "destructive",
        })
      }
    }
  }

  const handleEditMedico = (medico: any) => {
    setEditingMedico(medico)
    setFormData({
      nombre: medico.usuario.nombre,
      apellido: medico.usuario.apellido,
      dni: medico.usuario.dni,
      email: medico.usuario.email,
      telefono: medico.usuario.telefono || "",
      especialidad_id: medico.especialidad_id,
      numero_colegiatura: medico.numero_colegiatura,
    })
    setOpenDialog(true)
  }

  const handleDeleteMedico = async (medicoId: string, usuarioId: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este médico? Esta acción no se puede deshacer.")) return

    const supabase = createClient()
    const { error: medicoError } = await supabase.from("medicos").delete().eq("id", medicoId)
    const { error: userError } = await supabase.from("usuarios").delete().eq("id", usuarioId)

    if (!medicoError && !userError) {
      toast({
        title: "✅ Médico Eliminado",
        description: "El médico ha sido eliminado del sistema",
      })
      loadMedicos()
    } else {
      toast({
        title: "Error",
        description: "No se pudo eliminar el médico",
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
      especialidad_id: "",
      numero_colegiatura: "",
    })
    setEditingMedico(null)
  }

  const filteredMedicos = medicos.filter(
    (m) =>
      m.usuario.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.usuario.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.usuario.dni.includes(searchTerm) ||
      m.especialidad.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.numero_colegiatura.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">Cargando médicos...</p>
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
              <Users className="w-5 h-5" />
              Lista de Médicos
            </CardTitle>
            <CardDescription>Gestione y consulte la información de todos los médicos del sistema</CardDescription>
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
                Agregar Médico
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl flex items-center gap-2">
                  <Stethoscope className="w-6 h-6 text-primary" />
                  {editingMedico ? "Editar Médico" : "Registrar Nuevo Médico"}
                </DialogTitle>
                <DialogDescription className="text-base">
                  {editingMedico
                    ? "Actualiza los datos del médico seleccionado"
                    : "Completa todos los campos requeridos para registrar un nuevo médico"}
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
                        placeholder="Ej: Juan Carlos"
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
                      placeholder="Ej: jperez@essalud.gob.pe"
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

                {/* Información Profesional */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    Información Profesional
                  </h3>
                  <div className="space-y-2">
                    <Label htmlFor="especialidad" className="text-sm font-medium">
                      Especialidad <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={formData.especialidad_id}
                      onValueChange={(value) => setFormData({ ...formData, especialidad_id: value })}
                    >
                      <SelectTrigger id="especialidad" className="h-11">
                        <SelectValue placeholder="Selecciona una especialidad" />
                      </SelectTrigger>
                      <SelectContent>
                        {especialidades.map((esp) => (
                          <SelectItem key={esp.id} value={esp.id.toString()}>
                            {esp.nombre}
                          </SelectItem>
                        ))}
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
                      value={formData.numero_colegiatura}
                      onChange={(e) => setFormData({ ...formData, numero_colegiatura: e.target.value })}
                      className="h-11"
                      required
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
                  <Button onClick={handleSaveMedico} className="flex-1 h-11 gap-2">
                    <Stethoscope className="w-4 h-4" />
                    {editingMedico ? "Actualizar Médico" : "Registrar Médico"}
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
              placeholder="Buscar por nombre, DNI, especialidad o colegiatura..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {filteredMedicos.length === 0 ? (
          <div className="text-center py-8">
            <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No se encontraron médicos</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Médico</TableHead>
                    <TableHead>DNI</TableHead>
                    <TableHead>Especialidad</TableHead>
                    <TableHead>Colegiatura</TableHead>
                    <TableHead>Contraseña</TableHead>
                    <TableHead>Contacto</TableHead>
                    <TableHead>Citas/Día</TableHead>
                    <TableHead>Min/Cita</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMedicos.map((medico) => (
                    <TableRow key={medico.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                            <Stethoscope className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">
                              Dr(a). {medico.usuario.nombre} {medico.usuario.apellido}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{medico.usuario.dni}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{medico.especialidad.nombre}</Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{medico.numero_colegiatura}</TableCell>
                      <TableCell className="font-mono text-sm bg-muted/50 rounded px-2 py-1">
                        {medico.usuario.password_hash}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1 text-sm">
                          {medico.usuario.email && (
                            <div className="flex items-center gap-1">
                              <Mail className="w-3 h-3 text-muted-foreground" />
                              <span className="text-muted-foreground">{medico.usuario.email}</span>
                            </div>
                          )}
                          {medico.usuario.telefono && (
                            <div className="flex items-center gap-1">
                              <Phone className="w-3 h-3 text-muted-foreground" />
                              <span className="text-muted-foreground">{medico.usuario.telefono}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{medico.max_citas_dia}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{medico.minutos_por_cita} min</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditMedico(medico)}
                            className="gap-1 hover:bg-primary hover:text-primary-foreground transition-colors"
                          >
                            <Edit2 className="w-3 h-3" />
                            <span className="hidden sm:inline">Editar</span>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteMedico(medico.id, medico.usuario_id)}
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
