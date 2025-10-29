import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

const supabase = createClient(supabaseUrl, supabaseKey)

interface TestResult {
  name: string
  passed: boolean
  error?: string
  duration: number
}

const results: TestResult[] = []

async function runTest(name: string, testFn: () => Promise<void>) {
  const start = Date.now()
  try {
    await testFn()
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
  console.log("Starting ESSALUD System Tests...\n")

  // Test 1: Database Connection
  await runTest("Database Connection", async () => {
    const { data, error } = await supabase.from("usuarios").select("count", { count: "exact" })
    if (error) throw error
  })

  // Test 2: Fetch Users
  await runTest("Fetch Users", async () => {
    const { data, error } = await supabase.from("usuarios").select("*").limit(1)
    if (error) throw error
    if (!data || data.length === 0) throw new Error("No users found")
  })

  // Test 3: Fetch Doctors
  await runTest("Fetch Doctors", async () => {
    const { data, error } = await supabase.from("medicos").select("*").limit(1)
    if (error) throw error
  })

  // Test 4: Fetch Specialties
  await runTest("Fetch Specialties", async () => {
    const { data, error } = await supabase.from("especialidades").select("*")
    if (error) throw error
    if (!data || data.length === 0) throw new Error("No specialties found")
  })

  // Test 5: Fetch Appointments
  await runTest("Fetch Appointments", async () => {
    const { data, error } = await supabase.from("citas").select("*").limit(10)
    if (error) throw error
  })

  // Test 6: Fetch Medical History
  await runTest("Fetch Medical History", async () => {
    const { data, error } = await supabase.from("historial_clinico").select("*").limit(10)
    if (error) throw error
  })

  // Test 7: Fetch Triage Records
  await runTest("Fetch Triage Records", async () => {
    const { data, error } = await supabase.from("triaje").select("*").limit(10)
    if (error) throw error
  })

  // Test 8: Fetch Emergency Beds
  await runTest("Fetch Emergency Beds", async () => {
    const { data, error } = await supabase.from("camas_emergencia").select("*")
    if (error) throw error
    if (!data || data.length === 0) throw new Error("No emergency beds found")
  })

  // Test 9: Fetch Doctor Schedules
  await runTest("Fetch Doctor Schedules", async () => {
    const { data, error } = await supabase.from("horarios_medicos").select("*").limit(10)
    if (error) throw error
  })

  // Test 10: Count Patients by Role
  await runTest("Count Patients by Role", async () => {
    const { count, error } = await supabase.from("usuarios").select("*", { count: "exact" }).eq("rol", "paciente")
    if (error) throw error
    if (count === null) throw new Error("Could not count patients")
  })

  // Test 11: Count Doctors
  await runTest("Count Doctors", async () => {
    const { count, error } = await supabase.from("medicos").select("*", { count: "exact" })
    if (error) throw error
    if (count === null) throw new Error("Could not count doctors")
  })

  // Test 12: Count Today's Appointments
  await runTest("Count Today's Appointments", async () => {
    const today = new Date().toISOString().split("T")[0]
    const { count, error } = await supabase.from("citas").select("*", { count: "exact" }).eq("fecha", today)
    if (error) throw error
  })

  // Test 13: Count Active Emergencies
  await runTest("Count Active Emergencies", async () => {
    const { count, error } = await supabase.from("triaje").select("*", { count: "exact" }).eq("estado", "en_atencion")
    if (error) throw error
  })

  // Test 14: Count Available Emergency Beds
  await runTest("Count Available Emergency Beds", async () => {
    const { count, error } = await supabase
      .from("camas_emergencia")
      .select("*", { count: "exact" })
      .eq("estado", "disponible")
    if (error) throw error
  })

  // Test 15: Verify Relationships
  await runTest("Verify Relationships", async () => {
    const { data, error } = await supabase
      .from("citas")
      .select(
        `
        *,
        paciente:usuarios!citas_paciente_id_fkey(nombre),
        medico:medicos!citas_medico_id_fkey(usuario:usuarios!medicos_usuario_id_fkey(nombre)),
        especialidad:especialidades!citas_especialidad_id_fkey(nombre)
      `,
      )
      .limit(1)
    if (error) throw error
    if (data && data.length > 0) {
      if (!data[0].paciente || !data[0].medico || !data[0].especialidad) {
        throw new Error("Relationship data missing")
      }
    }
  })

  // Print Summary
  console.log("\n" + "=".repeat(50))
  console.log("TEST SUMMARY")
  console.log("=".repeat(50))

  const passed = results.filter((r) => r.passed).length
  const failed = results.filter((r) => !r.passed).length
  const totalTime = results.reduce((sum, r) => sum + r.duration, 0)

  console.log(`Total Tests: ${results.length}`)
  console.log(`Passed: ${passed}`)
  console.log(`Failed: ${failed}`)
  console.log(`Total Time: ${totalTime}ms`)
  console.log(`Success Rate: ${((passed / results.length) * 100).toFixed(2)}%`)

  if (failed > 0) {
    console.log("\nFailed Tests:")
    results
      .filter((r) => !r.passed)
      .forEach((r) => {
        console.log(`  - ${r.name}: ${r.error}`)
      })
  }

  console.log("=".repeat(50))
}

main().catch(console.error)
