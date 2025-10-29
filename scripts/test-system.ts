/**
 * Script de Pruebas del Sistema ESSALUD
 * Verifica la funcionalidad básica del sistema
 */

import { createClient } from "@supabase/supabase-js"

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

interface TestResult {
  name: string
  passed: boolean
  message: string
  duration: number
}

const results: TestResult[] = []

async function runTest(name: string, testFn: () => Promise<void>) {
  const startTime = Date.now()
  try {
    await testFn()
    const duration = Date.now() - startTime
    results.push({ name, passed: true, message: "✓ Pasó", duration })
    console.log(`✓ ${name} (${duration}ms)`)
  } catch (error) {
    const duration = Date.now() - startTime
    const message = error instanceof Error ? error.message : String(error)
    results.push({ name, passed: false, message, duration })
    console.log(`✗ ${name} - ${message} (${duration}ms)`)
  }
}

async function main() {
  console.log("🧪 Iniciando pruebas del sistema ESSALUD...\n")

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

  // Test 1: Conexión a Supabase
  await runTest("Conexión a Supabase", async () => {
    const { data, error } = await supabase.from("usuarios").select("count", { count: "exact" })
    if (error) throw new Error(error.message)
  })

  // Test 2: Verificar tabla usuarios
  await runTest("Tabla usuarios existe", async () => {
    const { data, error } = await supabase.from("usuarios").select("id").limit(1)
    if (error) throw new Error(error.message)
  })

  // Test 3: Verificar tabla medicos
  await runTest("Tabla medicos existe", async () => {
    const { data, error } = await supabase.from("medicos").select("id").limit(1)
    if (error) throw new Error(error.message)
  })

  // Test 4: Verificar tabla especialidades
  await runTest("Tabla especialidades existe", async () => {
    const { data, error } = await supabase.from("especialidades").select("id").limit(1)
    if (error) throw new Error(error.message)
  })

  // Test 5: Verificar tabla citas
  await runTest("Tabla citas existe", async () => {
    const { data, error } = await supabase.from("citas").select("id").limit(1)
    if (error) throw new Error(error.message)
  })

  // Test 6: Verificar tabla historial_clinico
  await runTest("Tabla historial_clinico existe", async () => {
    const { data, error } = await supabase.from("historial_clinico").select("id").limit(1)
    if (error) throw new Error(error.message)
  })

  // Test 7: Verificar tabla triaje
  await runTest("Tabla triaje existe", async () => {
    const { data, error } = await supabase.from("triaje").select("id").limit(1)
    if (error) throw new Error(error.message)
  })

  // Test 8: Verificar tabla camas_emergencia
  await runTest("Tabla camas_emergencia existe", async () => {
    const { data, error } = await supabase.from("camas_emergencia").select("id").limit(1)
    if (error) throw new Error(error.message)
  })

  // Test 9: Verificar tabla horarios_medicos
  await runTest("Tabla horarios_medicos existe", async () => {
    const { data, error } = await supabase.from("horarios_medicos").select("id").limit(1)
    if (error) throw new Error(error.message)
  })

  // Test 10: Verificar usuarios de prueba - Paciente
  await runTest("Usuario paciente existe (DNI: 78901234)", async () => {
    const { data, error } = await supabase
      .from("usuarios")
      .select("*")
      .eq("dni", "78901234")
      .eq("rol", "paciente")
      .single()

    if (error) throw new Error("Paciente no encontrado")
    if (!data) throw new Error("Datos vacíos")
  })

  // Test 11: Verificar usuarios de prueba - Médico
  await runTest("Usuario médico existe (Email: jperez@essalud.gob.pe)", async () => {
    const { data, error } = await supabase
      .from("usuarios")
      .select("*")
      .eq("email", "jperez@essalud.gob.pe")
      .eq("rol", "medico")
      .single()

    if (error) throw new Error("Médico no encontrado")
    if (!data) throw new Error("Datos vacíos")
  })

  // Test 12: Verificar usuarios de prueba - Asistente
  await runTest("Usuario asistente existe (Email: asistente@essalud.gob.pe)", async () => {
    const { data, error } = await supabase
      .from("usuarios")
      .select("*")
      .eq("email", "asistente@essalud.gob.pe")
      .eq("rol", "asistente_enfermeria")
      .single()

    if (error) throw new Error("Asistente no encontrado")
    if (!data) throw new Error("Datos vacíos")
  })

  // Test 13: Verificar usuarios de prueba - Administrador
  await runTest("Usuario administrador existe (Email: admin@essalud.gob.pe)", async () => {
    const { data, error } = await supabase
      .from("usuarios")
      .select("*")
      .eq("email", "admin@essalud.gob.pe")
      .eq("rol", "administrador")
      .single()

    if (error) throw new Error("Administrador no encontrado")
    if (!data) throw new Error("Datos vacíos")
  })

  // Test 14: Verificar especialidades
  await runTest("Especialidades registradas", async () => {
    const { data, error, count } = await supabase.from("especialidades").select("*", { count: "exact" })

    if (error) throw new Error(error.message)
    if (!count || count === 0) throw new Error("No hay especialidades registradas")
  })

  // Test 15: Verificar médicos con especialidades
  await runTest("Médicos con especialidades asignadas", async () => {
    const { data, error } = await supabase.from("medicos").select("*, especialidades(nombre)").limit(1)

    if (error) throw new Error(error.message)
    if (!data || data.length === 0) throw new Error("No hay médicos registrados")
  })

  // Test 16: Verificar horarios de médicos
  await runTest("Horarios de médicos configurados", async () => {
    const { data, error, count } = await supabase.from("horarios_medicos").select("*", { count: "exact" })

    if (error) throw new Error(error.message)
    if (!count || count === 0) throw new Error("No hay horarios configurados")
  })

  // Test 17: Verificar camas de emergencia
  await runTest("Camas de emergencia disponibles", async () => {
    const { data, error, count } = await supabase.from("camas_emergencia").select("*", { count: "exact" })

    if (error) throw new Error(error.message)
    if (!count || count === 0) throw new Error("No hay camas registradas")
  })

  // Test 18: Verificar estructura de datos de usuarios
  await runTest("Estructura de datos de usuarios correcta", async () => {
    const { data, error } = await supabase.from("usuarios").select("*").limit(1)

    if (error) throw new Error(error.message)
    if (!data || data.length === 0) throw new Error("No hay usuarios")

    const usuario = data[0]
    const requiredFields = ["id", "nombre", "apellido", "email", "dni", "rol"]
    const missingFields = requiredFields.filter((field) => !(field in usuario))

    if (missingFields.length > 0) {
      throw new Error(`Campos faltantes: ${missingFields.join(", ")}`)
    }
  })

  // Test 19: Verificar estructura de datos de citas
  await runTest("Estructura de datos de citas correcta", async () => {
    const { data, error } = await supabase.from("citas").select("*").limit(1)

    if (error && error.code !== "PGRST116") throw new Error(error.message)
    // PGRST116 es error de tabla vacía, que es aceptable

    if (data && data.length > 0) {
      const cita = data[0]
      const requiredFields = ["id", "paciente_id", "medico_id", "fecha", "hora", "estado"]
      const missingFields = requiredFields.filter((field) => !(field in cita))

      if (missingFields.length > 0) {
        throw new Error(`Campos faltantes: ${missingFields.join(", ")}`)
      }
    }
  })

  // Test 20: Verificar estructura de datos de triaje
  await runTest("Estructura de datos de triaje correcta", async () => {
    const { data, error } = await supabase.from("triaje").select("*").limit(1)

    if (error && error.code !== "PGRST116") throw new Error(error.message)

    if (data && data.length > 0) {
      const triaje = data[0]
      const requiredFields = ["id", "paciente_id", "nivel_urgencia", "estado"]
      const missingFields = requiredFields.filter((field) => !(field in triaje))

      if (missingFields.length > 0) {
        throw new Error(`Campos faltantes: ${missingFields.join(", ")}`)
      }
    }
  })

  // Resumen
  console.log("\n" + "=".repeat(60))
  console.log("📊 RESUMEN DE PRUEBAS")
  console.log("=".repeat(60))

  const passed = results.filter((r) => r.passed).length
  const failed = results.filter((r) => !r.passed).length
  const total = results.length
  const totalDuration = results.reduce((sum, r) => sum + r.duration, 0)

  console.log(`\nTotal: ${total} pruebas`)
  console.log(`✓ Pasadas: ${passed}`)
  console.log(`✗ Fallidas: ${failed}`)
  console.log(`⏱️  Tiempo total: ${totalDuration}ms`)

  if (failed > 0) {
    console.log("\n❌ Pruebas fallidas:")
    results
      .filter((r) => !r.passed)
      .forEach((r) => {
        console.log(`  - ${r.name}: ${r.message}`)
      })
  }

  console.log("\n" + "=".repeat(60))

  if (failed === 0) {
    console.log("✅ ¡TODAS LAS PRUEBAS PASARON!")
  } else {
    console.log(`⚠️  ${failed} prueba(s) fallida(s)`)
  }

  console.log("=".repeat(60) + "\n")

  process.exit(failed > 0 ? 1 : 0)
}

main().catch((error) => {
  console.error("Error fatal:", error)
  process.exit(1)
})
