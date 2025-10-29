"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { loginUser } from "@/lib/auth"
import { ArrowLeft, User } from "lucide-react"
import Link from "next/link"

export default function PacienteLoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    dni: "",
    password: "",
  })

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const usuario = await loginUser({
        identifier: formData.dni,
        password: formData.password,
      })

      if (usuario.rol !== "paciente") {
        toast({
          title: "Usuario no registrado",
          description: "Las credenciales ingresadas no corresponden a un paciente registrado",
          variant: "destructive",
        })
        setLoading(false)
        return
      }

      if (usuario.tipo_asegurado === "no_asegurado") {
        toast({
          title: "Usuario no registrado",
          description: "Este usuario no está registrado en el sistema. Contacte al administrador.",
          variant: "destructive",
        })
        setLoading(false)
        return
      }

      localStorage.setItem("usuario", JSON.stringify(usuario))
      toast({
        title: "Bienvenido",
        description: `Hola ${usuario.nombre} ${usuario.apellido}`,
      })
      router.push("/paciente/dashboard")
    } catch (error) {
      toast({
        title: "Usuario no registrado",
        description: "Las credenciales ingresadas no son válidas",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-primary/5 via-background to-primary/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link href="/">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al inicio
          </Button>
        </Link>

        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Acceso de Paciente</CardTitle>
            <CardDescription>Ingrese con su DNI y contraseña</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="dni">DNI</Label>
                <Input
                  id="dni"
                  placeholder="12345678"
                  maxLength={8}
                  value={formData.dni}
                  onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Ingresando..." : "Ingresar"}
              </Button>

              <p className="text-xs text-center text-muted-foreground mt-4">
                Sistema de hospital público - Solo personal autorizado
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
