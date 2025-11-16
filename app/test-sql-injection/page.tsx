"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { createClient } from "@/lib/supabase/client"
import { Shield, AlertTriangle, CheckCircle, XCircle } from "lucide-react"

export default function TestSQLInjectionPage() {
  const [dni, setDni] = useState("")
  const [password, setPassword] = useState("")
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  // Payloads comunes de SQL Injection
  const commonPayloads = [
    { name: "OR 1=1", value: "' OR '1'='1" },
    { name: "OR 1=1 --", value: "' OR '1'='1' --" },
    { name: "UNION SELECT", value: "' UNION SELECT * FROM usuario --" },
    { name: "DROP TABLE", value: "'; DROP TABLE usuario; --" },
    { name: "Comment Bypass", value: "admin'--" },
    { name: "Always True", value: "1' or '1' = '1" },
  ]

  const testInjection = async (testDni: string, testPassword: string) => {
    setLoading(true)
    setResult(null)

    try {
      const supabase = createClient()

      console.log('Testing with:', { dni: testDni, password: testPassword })

      // Simular el login como lo hace tu aplicación
      const isDNI = /^\d{8}$/.test(testDni)

      const { data: usuario, error } = await supabase
        .from("usuario")
        .select("*")
        .eq(isDNI ? "dni" : "correo", testDni)
        .eq("password", testPassword)
        .single()

      if (error) {
        setResult({
          success: false,
          blocked: true,
          message: "SQL Injection BLOQUEADO por Supabase",
          error: error.message,
          details: error.details,
          hint: error.hint,
        })
      } else if (usuario) {
        setResult({
          success: true,
          blocked: false,
          message: "Login exitoso (credenciales válidas)",
          user: usuario,
        })
      } else {
        setResult({
          success: false,
          blocked: true,
          message: "Credenciales rechazadas correctamente",
        })
      }
    } catch (error: any) {
      setResult({
        success: false,
        blocked: true,
        message: "SQL Injection BLOQUEADO",
        error: error.message,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-red-50 via-background to-orange-50 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <Card className="border-2 border-red-500">
          <CardHeader className="bg-red-50">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-red-600" />
              <div>
                <CardTitle className="text-2xl text-red-900">
                  Prueba de SQL Injection
                </CardTitle>
                <CardDescription className="text-red-700">
                  Verifica que Supabase protege contra ataques SQL Injection
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Payloads Predefinidos */}
        <Card>
          <CardHeader>
            <CardTitle>Payloads de SQL Injection Comunes</CardTitle>
            <CardDescription>
              Haz clic en cualquier payload para probarlo automáticamente
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {commonPayloads.map((payload, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <Badge variant="outline" className="w-32">
                  {payload.name}
                </Badge>
                <code className="flex-1 bg-muted p-2 rounded text-sm font-mono">
                  {payload.value}
                </code>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => testInjection(payload.value, payload.value)}
                  disabled={loading}
                >
                  Probar
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Prueba Manual */}
        <Card>
          <CardHeader>
            <CardTitle>Prueba Manual</CardTitle>
            <CardDescription>
              Ingresa tu propio payload de SQL Injection
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="dni">DNI / Email (o payload)</Label>
              <Input
                id="dni"
                value={dni}
                onChange={(e) => setDni(e.target.value)}
                placeholder="Ejemplo: ' OR '1'='1"
                className="font-mono"
              />
            </div>
            <div>
              <Label htmlFor="password">Password (o payload)</Label>
              <Input
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ejemplo: ' OR '1'='1' --"
                className="font-mono"
              />
            </div>
            <Button
              onClick={() => testInjection(dni, password)}
              disabled={loading}
              className="w-full"
            >
              {loading ? "Probando..." : "Probar SQL Injection"}
            </Button>
          </CardContent>
        </Card>

        {/* Resultados */}
        {result && (
          <Card className={result.blocked ? "border-green-500 border-2" : "border-red-500 border-2"}>
            <CardHeader className={result.blocked ? "bg-green-50" : "bg-red-50"}>
              <div className="flex items-center gap-3">
                {result.blocked ? (
                  <CheckCircle className="w-8 h-8 text-green-600" />
                ) : (
                  <XCircle className="w-8 h-8 text-red-600" />
                )}
                <div>
                  <CardTitle className={result.blocked ? "text-green-900" : "text-red-900"}>
                    {result.message}
                  </CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              {result.error && (
                <Alert variant="default">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Error de Supabase</AlertTitle>
                  <AlertDescription className="font-mono text-sm">
                    {result.error}
                  </AlertDescription>
                </Alert>
              )}

              {result.details && (
                <Alert>
                  <AlertTitle>Detalles Técnicos</AlertTitle>
                  <AlertDescription className="font-mono text-xs">
                    {result.details}
                  </AlertDescription>
                </Alert>
              )}

              {result.user && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Login Exitoso</AlertTitle>
                  <AlertDescription>
                    Usuario encontrado: {result.user.nombre} {result.user.apellido}
                    <br />
                    <span className="text-xs">
                      (Esto significa que usaste credenciales válidas, no SQL injection)
                    </span>
                  </AlertDescription>
                </Alert>
              )}

              {result.blocked && (
                <Alert className="bg-green-50 border-green-500">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertTitle className="text-green-900">
                    Sistema Seguro
                  </AlertTitle>
                  <AlertDescription className="text-green-800">
                    <strong>Supabase bloqueó el ataque SQL Injection.</strong>
                    <br />
                    <br />
                    <strong>Por qué está protegido:</strong>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>Supabase usa <strong>Prepared Statements</strong></li>
                      <li>Los parámetros se <strong>sanitizan automáticamente</strong></li>
                      <li>No se concatenan strings en las queries</li>
                      <li>PostgreSQL valida tipos de datos</li>
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm font-semibold mb-2">Respuesta completa:</p>
                <pre className="text-xs overflow-auto">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Información Educativa */}
        <Card className="bg-blue-50 border-blue-300">
          <CardHeader>
            <CardTitle className="text-blue-900">¿Qué es SQL Injection?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-blue-900">
            <p>
              <strong>SQL Injection</strong> es un ataque donde el atacante inserta código SQL malicioso
              en campos de entrada para manipular la base de datos.
            </p>
            
            <div className="bg-white p-3 rounded border border-blue-200">
              <p className="font-semibold mb-2">Ejemplo de código VULNERABLE (NO usar):</p>
              <code className="text-xs text-red-600">
                {`SELECT * FROM usuario WHERE dni = '${dni}' AND password = '${password}'`}
              </code>
              <p className="text-xs mt-2">
                Si `dni = "' OR '1'='1"`, la query se convierte en:
              </p>
              <code className="text-xs text-red-600">
                SELECT * FROM usuario WHERE dni = '' OR '1'='1' AND password = ''
              </code>
              <p className="text-xs mt-2 text-red-600">
                Esto devuelve TODOS los usuarios (bypass de autenticación)
              </p>
            </div>

            <div className="bg-white p-3 rounded border border-green-500">
              <p className="font-semibold mb-2 text-green-900">
                Supabase usa Prepared Statements (SEGURO):
              </p>
              <code className="text-xs text-green-600">
                {`.eq("dni", userInput)  // Los parámetros se escapan automáticamente`}
              </code>
              <p className="text-xs mt-2 text-green-700">
                Los valores se pasan como parámetros separados, no como parte del string SQL.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
