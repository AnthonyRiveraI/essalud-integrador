import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("[v0] Missing Supabase environment variables")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

const testUsers = [
  {
    email: "juan.perez@example.com",
    password: "password123",
    nombre: "Juan",
    apellido: "Pérez",
    dni: "12345678",
    telefono: "987654321",
    direccion: "Calle Principal 123, Lima",
    rol: "paciente",
    fecha_nacimiento: "1990-05-15",
    tipo_asegurado: "SIS",
  },
  {
    email: "dr.garcia@example.com",
    password: "password123",
    nombre: "Carlos",
    apellido: "García",
    dni: "87654321",
    telefono: "987654322",
    direccion: "Calle Médica 456, Lima",
    rol: "medico",
    fecha_nacimiento: "1985-03-20",
    tipo_asegurado: "PRIVADO",
  },
  {
    email: "admin@example.com",
    password: "password123",
    nombre: "María",
    apellido: "López",
    dni: "11111111",
    telefono: "987654323",
    direccion: "Calle Administrativa 789, Lima",
    rol: "administrador",
    fecha_nacimiento: "1988-07-10",
    tipo_asegurado: "PRIVADO",
  },
  {
    email: "asistente@example.com",
    password: "password123",
    nombre: "Roberto",
    apellido: "Martínez",
    dni: "22222222",
    telefono: "987654324",
    direccion: "Calle Asistencia 321, Lima",
    rol: "asistente",
    fecha_nacimiento: "1992-11-25",
    tipo_asegurado: "PRIVADO",
  },
]

async function insertUsers() {
  console.log("[v0] Starting user insertion...")

  for (const user of testUsers) {
    try {
      console.log(`[v0] Inserting user: ${user.email}`)

      const { data, error } = await supabase
        .from("usuarios")
        .insert([
          {
            email: user.email,
            password_hash: user.password,
            nombre: user.nombre,
            apellido: user.apellido,
            dni: user.dni,
            telefono: user.telefono,
            direccion: user.direccion,
            rol: user.rol,
            fecha_nacimiento: user.fecha_nacimiento,
            tipo_asegurado: user.tipo_asegurado,
          },
        ])
        .select()

      if (error) {
        console.error(`[v0] Error inserting ${user.email}:`, error.message)
      } else {
        console.log(`[v0] Successfully inserted ${user.email}`)
      }
    } catch (err) {
      console.error(`[v0] Exception inserting ${user.email}:`, err)
    }
  }

  // Verify insertion
  console.log("[v0] Verifying inserted users...")
  const { data, error } = await supabase
    .from("usuarios")
    .select("id, email, nombre, apellido, rol")
    .in(
      "email",
      testUsers.map((u) => u.email),
    )

  if (error) {
    console.error("[v0] Error verifying users:", error.message)
  } else {
    console.log("[v0] Inserted users:")
    console.table(data)
  }

  console.log("[v0] User insertion complete!")
}

insertUsers().catch(console.error)
