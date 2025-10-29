#!/usr/bin/env node

/**
 * ESSALUD System End-to-End Test Script
 * Prueba todos los flujos principales del sistema
 */

import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

if (!supabaseUrl || !supabaseKey) {
  console.error("Error: NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY no están configuradas")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

interface TestResult {
  name: string
  passed: boolean
  error?: string
  duration: number
}

const results: TestResult[] = []

async function test(name: string, fn: () => Promise<void>) {
  const start = Date.now()
  try {
    await fn()
    results.push({ name, passed: true, duration: Date.now() - start })
    console.log(`✓ ${name}`)
  } catch (error) {
    results.push({
      name,
      passed: false,
      error: error instanceof Error ? error.message : String(error),
      duration: Date.now() - start,
    })
    console.log(`✗ ${name}: ${error instanceof Error ? error.message : String(error)}`)
  }
}

async function main() {
  console.log("\n" + "=".repeat(60))
  console.log("ESSALUD - PRUEBAS DE FLUJO COMPLETO")
  console.log("=".repeat(60) + "\n")

  // ============ PRUEBAS DE DATOS BÁSICOS ============
  console.log("1. PRUEBAS DE DATOS BÁSICOS\n")

  await test("Conexión a base de datos", async () => {
    const { data, error } = await supabase.from("usuarios").select("count", { count: "exact" })
    if (error) throw error
  })

  await test("Obtener especialidades", async () => {
    const { data, error } = await supabase.from("especialidades").select("*")
    if (error) throw error
    if (!data || data.length === 0) throw new Error("No hay especialidades")
  })

  await test("Obtener usuarios de prueba", async () => {
    const { data, error } = await supabase.from("usuarios").select("*").limit(5)
    if (error) throw error
    if (!data || data.length === 0) throw new Error("No hay usuarios")
  })

  // ============ PRUEBAS DE PACIENTES ============
  console.log("\n2. PRUEBAS DE PACIENTES\n")

  let pacienteId = ""

  await test("Obtener paciente de prueba", async () => {
    const { data, error } = await supabase.from("usuarios").select("*").eq("rol", "paciente").limit(1).single()
    if (error) throw error
    if (!data) throw new Error("No hay pacientes")
    pacienteId = data.id
  })

  await test("Obtener citas del paciente", async () => {
    const { data, error } = await supabase.from("citas").select("*").eq("paciente_id", pacienteId).limit(10)
    if (error) throw error
  })

  await test("Obtener historial clínico del paciente", async () => {
    const { data, error } = await supabase.from("historial_clinico").select("*").eq("paciente_id", pacienteId).limit(10)
    if (error) throw error
  })

  // ============ PRUEBAS DE MÉDICOS ============
  console.log("\n3. PRUEBAS DE MÉDICOS\n")

  let medicoId = ""

  await test("Obtener médico de prueba", async () => {
    const { data, error } = await supabase.from("medicos").select("*").limit(1).single()
    if (error) throw error
    if (!data) throw new Error("No hay médicos")
    medicoId = data.id
  })

  await test("Obtener citas del médico", async () => {
    const { data, error } = await supabase.from("citas").select("*").eq("medico_id", medicoId).limit(10)
    if (error) throw error
  })

  await test("Obtener citas de hoy del médico", async () => {
    const today = new Date().toISOString().split("T")[0]
    const { data, error } = await supabase.from("citas").select("*").eq("medico_id", medicoId).eq("fecha", today)
    if (error) throw error
  })

  // ============ PRUEBAS DE CITAS ============
  console.log("\n4. PRUEBAS DE CITAS\n")

  let citaId = ""

  await test("Obtener cita de prueba", async () => {
    const { data, error } = await supabase.from("citas").select("*").limit(1).single()
    if (error) throw error
    if (!data) throw new Error("No hay citas")
    citaId = data.id
  })

  await test("Obtener cita con relaciones", async () => {
    const { data, error } = await supabase
      .from("citas")
      .select(
        `
        *,
        paciente:usuarios!citas_paciente_id_fkey(nombre, apellido),
        medico:medicos!citas_medico_id_fkey(usuario:usuarios!medicos_usuario_id_fkey(nombre, apellido)),
        especialidad:especialidades!citas_especialidad_id_fkey(nombre)
      `,
      )
      .eq("id", citaId)
      .single()
    if (error) throw error
    if (!data) throw new Error("Cita no encontrada")
    if (!data.paciente || !data.medico || !data.especialidad) throw new Error("Relaciones incompletas")
  })

  // ============ PRUEBAS DE HISTORIAL CLÍNICO ============
  console.log("\n5. PRUEBAS DE HISTORIAL CLÍNICO\n")

  await test("Obtener historial clínico", async () => {
    const { data, error } = await supabase.from("historial_clinico").select("*").limit(10)
    if (error) throw error
  })

  await test("Obtener historial con relaciones", async () => {
    const { data, error } = await supabase
      .from("historial_clinico")
      .select(
        `
        *,
        paciente:usuarios!historial_clinico_paciente_id_fkey(nombre, apellido),
        medico:medicos!historial_clinico_medico_id_fkey(usuario:usuarios!medicos_usuario_id_fkey(nombre, apellido)),
        especialidad:especialidades!historial_clinico_especialidad_id_fkey(nombre)
      `,
      )
      .limit(1)
    if (error) throw error
  })

  // ============ PRUEBAS DE TRIAJE ============
  console.log("\n6. PRUEBAS DE TRIAJE\n")

  await test("Obtener registros de triaje", async () => {
    const { data, error } = await supabase.from("triaje").select("*").limit(10)
    if (error) throw error
  })

  await test("Obtener triajes activos", async () => {
    const { data, error } = await supabase.from("triaje").select("*").eq("estado", "en_atencion")
    if (error) throw error
  })

  await test("Obtener camas de emergencia", async () => {
    const { data, error } = await supabase.from("camas_emergencia").select("*")
    if (error) throw error
    if (!data || data.length === 0) throw new Error("No hay camas de emergencia")
  })

  // ============ PRUEBAS DE ESTADÍSTICAS ============
  console.log("\n7. PRUEBAS DE ESTADÍSTICAS\n")

  await test("Contar total de pacientes", async () => {
    const { count, error } = await supabase.from("usuarios").select("*", { count: "exact" }).eq("rol", "paciente")
    if (error) throw error
    if (count === null) throw new Error("No se pudo contar")
  })

  await test("Contar total de médicos", async () => {
    const { count, error } = await supabase.from("medicos").select("*", { count: "exact" })
    if (error) throw error
    if (count === null) throw new Error("No se pudo contar")
  })

  await test("Contar citas de hoy", async () => {
    const today = new Date().toISOString().split("T")[0]
    const { count, error } = await supabase.from("citas").select("*", { count: "exact" }).eq("fecha", today)
    if (error) throw error
  })

  await test("Contar emergencias activas", async () => {
    const { count, error } = await supabase.from("triaje").select("*", { count: "exact" }).eq("estado", "en_atencion")
    if (error) throw error
  })

  await test("Contar camas disponibles", async () => {
    const { count, error } = await supabase
      .from("camas_emergencia")
      .select("*", { count: "exact" })
      .eq("estado", "disponible")
    if (error) throw error
  })

  // ============ PRUEBAS DE HORARIOS ============
  console.log("\n8. PRUEBAS DE HORARIOS\n")

  await test("Obtener horarios de médicos", async () => {
    const { data, error } = await supabase.from("horarios_medicos").select("*").limit(10)
    if (error) throw error
  })

  // ============ RESUMEN ============
  console.log("\n" + "=".repeat(60))
  console.log("RESUMEN DE PRUEBAS")
  console.log("=".repeat(60))

  const passed = results.filter((r) => r.passed).length
  const failed = results.filter((r) => !r.passed).length
  const totalTime = results.reduce((sum, r) => sum + r.duration, 0)

  console.log(`\nTotal de pruebas: ${results.length}`)
  console.log(`Pasadas: ${passed}`)
  console.log(`Fallidas: ${failed}`)
  console.log(`Tiempo total: ${totalTime}ms`)
  console.log(`Tasa de éxito: ${((passed / results.length) * 100).toFixed(2)}%`)

  if (failed > 0) {
    console.log("\nPruebas fallidas:")
    results
      .filter((r) => !r.passed)
      .forEach((r) => {
        console.log(`  ✗ ${r.name}: ${r.error}`)
      })
  }

  console.log("\n" + "=".repeat(60))

  if (failed === 0) {
    console.log("RESULTADO: TODAS LAS PRUEBAS PASARON")
    console.log("=".repeat(60) + "\n")
    process.exit(0)
  } else {
    console.log(`RESULTADO: ${failed} PRUEBA(S) FALLARON`)
    console.log("=".repeat(60) + "\n")
    process.exit(1)
  }
}

main().catch((error) => {
  console.error("Error fatal:", error)
  process.exit(1)
})
