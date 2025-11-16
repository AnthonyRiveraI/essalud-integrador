"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { Search, Plus, Edit2, Trash2, User, Mail, Phone } from "lucide-react"
import { FormularioUsuario } from "./formulario-usuario"

interface TablaUsuariosProps {
  rol: "Paciente" | "Medico" | "AsistenteEnfermeria"
}

export function TablaUsuarios({ rol }: TablaUsuariosProps) {
  const { toast } = useToast()
  const [usuarios, setUsuarios] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [openDialog, setOpenDialog] = useState(false)
  const [editingUsuario, setEditingUsuario] = useState<any>(null)

  useEffect(() => {
    loadUsuarios()
  }, [rol])

  const loadUsuarios = async () => {
    setLoading(true)
    const supabase = createClient()

    if (rol === "Paciente") {
      // Cargar pacientes
      const { data: pacientesData, error: pacientesError } = await supabase
        .from("paciente")
        .select("*")
        .order("id_paciente", { ascending: true })

      if (!pacientesError && pacientesData) {
        const usuariosConDatos = await Promise.all(
          pacientesData.map(async (paciente) => {
            const { data: usuarioData } = await supabase
              .from("usuario")
              .select("id_usuario, nombre, apellido, dni, correo, password, rol")
              .eq("id_usuario", paciente.id_paciente)
              .maybeSingle()

            return { ...paciente, usuario: usuarioData }
          })
        )
        setUsuarios(usuariosConDatos)
      }
    } else if (rol === "Medico") {
      // Cargar médicos
      const { data: medicosData, error: medicosError } = await supabase
        .from("medico")
        .select("*")
        .order("id_medico", { ascending: true })

      if (!medicosError && medicosData) {
        const usuariosConDatos = await Promise.all(
          medicosData.map(async (medico) => {
            const { data: usuarioData } = await supabase
              .from("usuario")
              .select("id_usuario, nombre, apellido, dni, correo, password, rol")
              .eq("id_usuario", medico.id_medico)
              .maybeSingle()

            return { ...medico, usuario: usuarioData }
          })
        )
        setUsuarios(usuariosConDatos)
      }
    } else if (rol === "AsistenteEnfermeria") {
      // Cargar asistentes
      const { data: usuariosData, error: usuariosError } = await supabase
        .from("usuario")
        .select("*")
        .eq("rol", "AsistenteEnfermeria")
        .order("id_usuario", { ascending: true })

      if (!usuariosError && usuariosData) {
        setUsuarios(usuariosData.map(u => ({ usuario: u, id_usuario: u.id_usuario })))
      }
    }

    setLoading(false)
  }

  const handleDelete = async (id: number, nombre: string, apellido: string) => {
    if (!confirm(`¿Estás seguro de eliminar a ${nombre} ${apellido}?`)) return

    const supabase = createClient()

    try {
      if (rol === "Paciente") {
        // Eliminar registros dependientes
        await supabase.from("historialclinico").delete().eq("id_paciente", id)
        await supabase.from("triaje").delete().eq("id_paciente", id)
        await supabase.from("cita").delete().eq("id_paciente", id)
        await supabase.from("paciente").delete().eq("id_paciente", id)
      } else if (rol === "Medico") {
        await supabase.from("medico").delete().eq("id_medico", id)
      }

      // Eliminar usuario
      await supabase.from("usuario").delete().eq("id_usuario", id)

      toast({
        title: "✅ Usuario eliminado",
        description: `${nombre} ${apellido} fue eliminado del sistema`,
      })
      
      loadUsuarios()
    } catch (error) {
      toast({
        title: "❌ Error al eliminar",
        description: "No se pudo eliminar el usuario",
        variant: "destructive",
      })
    }
  }

  const handleEdit = (usuario: any) => {
    setEditingUsuario(usuario)
    setOpenDialog(true)
  }

  const handleNuevo = () => {
    setEditingUsuario(null)
    setOpenDialog(true)
  }

  const filteredUsuarios = usuarios.filter((u) => {
    const nombre = u.usuario?.nombre?.toLowerCase() || ""
    const apellido = u.usuario?.apellido?.toLowerCase() || ""
    const dni = String(u.usuario?.dni || u.dni || "")
    const correo = u.usuario?.correo?.toLowerCase() || ""
    const search = searchTerm.toLowerCase()

    return nombre.includes(search) || apellido.includes(search) || dni.includes(search) || correo.includes(search)
  })

  const getRolLabel = () => {
    if (rol === "Paciente") return "Paciente"
    if (rol === "Medico") return "Médico"
    return "Asistente de Enfermería"
  }

  const getRolIcon = () => {
    if (rol === "Paciente") return <User className="w-4 h-4" />
    return <User className="w-4 h-4" />
  }

  return (
    <div className="space-y-4">
      {/* Header con búsqueda y botón nuevo */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={`Buscar ${getRolLabel().toLowerCase()}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-11"
          />
        </div>
        <Button onClick={handleNuevo} className="gap-2 h-11 shadow-md hover:shadow-lg transition-all">
          <Plus className="w-4 h-4" />
          Nuevo {getRolLabel()}
        </Button>
      </div>

      {/* Tabla */}
      {loading ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Cargando {getRolLabel().toLowerCase()}s...</p>
        </div>
      ) : filteredUsuarios.length === 0 ? (
        <div className="text-center py-12 bg-muted/20 rounded-lg border-2 border-dashed">
          <User className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">
            {searchTerm ? "No se encontraron resultados" : `No hay ${getRolLabel().toLowerCase()}s registrados`}
          </p>
        </div>
      ) : (
        <div className="rounded-lg border shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-4 font-semibold">Nombre Completo</th>
                <th className="text-left p-4 font-semibold">DNI</th>
                <th className="text-left p-4 font-semibold">Correo</th>
                {rol === "Medico" && <th className="text-left p-4 font-semibold">Especialidad</th>}
                <th className="text-left p-4 font-semibold">Rol</th>
                <th className="text-right p-4 font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredUsuarios.map((u) => (
                <tr key={u.usuario?.id_usuario || u.id_usuario} className="hover:bg-muted/30 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      {getRolIcon()}
                      <span className="font-medium">
                        {u.usuario?.nombre} {u.usuario?.apellido}
                      </span>
                    </div>
                  </td>
                  <td className="p-4 font-mono text-sm">{u.usuario?.dni || u.dni}</td>
                  <td className="p-4 text-sm">{u.usuario?.correo}</td>
                  {rol === "Medico" && (
                    <td className="p-4">
                      <Badge variant="outline">{u.especialidad || "General"}</Badge>
                    </td>
                  )}
                  <td className="p-4">
                    <Badge>{getRolLabel()}</Badge>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(u)}
                        className="gap-1 hover:shadow-md transition-all"
                      >
                        <Edit2 className="w-3 h-3" />
                        Editar
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(
                          u.id_paciente || u.id_medico || u.id_usuario,
                          u.usuario?.nombre || "",
                          u.usuario?.apellido || ""
                        )}
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

      {/* Contador */}
      <p className="text-sm text-muted-foreground text-center">
        Mostrando {filteredUsuarios.length} de {usuarios.length} {getRolLabel().toLowerCase()}(s)
      </p>

      {/* Formulario Modal */}
      <FormularioUsuario
        open={openDialog}
        onOpenChange={setOpenDialog}
        rol={rol}
        usuario={editingUsuario}
        onSuccess={loadUsuarios}
      />
    </div>
  )
}
