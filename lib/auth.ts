import { createClient } from "./supabase/client"

export interface LoginCredentials {
  identifier: string // DNI o email
  password: string
}

export interface RegisterData {
  dni: string
  email?: string
  password: string
  nombre: string
  apellido: string
  telefono?: string
  fechaNacimiento?: string
  direccion?: string
}

export async function loginUser(credentials: LoginCredentials) {
  const supabase = createClient()

  // Determinar si es DNI o email
  const isDNI = /^\d{8}$/.test(credentials.identifier)

  const { data: usuario, error } = await supabase
    .from("usuarios")
    .select("*")
    .eq(isDNI ? "dni" : "email", credentials.identifier)
    .eq("password_hash", credentials.password) // En producción, usar hash real
    .single()

  if (error || !usuario) {
    throw new Error("Credenciales incorrectas")
  }

  return usuario
}

export async function registerPaciente(data: RegisterData) {
  const supabase = createClient()

  const { data: usuario, error } = await supabase
    .from("usuarios")
    .insert({
      dni: data.dni,
      email: data.email,
      password_hash: data.password, // En producción, usar hash
      nombre: data.nombre,
      apellido: data.apellido,
      telefono: data.telefono,
      fecha_nacimiento: data.fechaNacimiento,
      direccion: data.direccion,
      rol: "paciente",
    })
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return usuario
}

export function validatePassword(password: string): { valid: boolean; message?: string } {
  if (password.length < 8) {
    return { valid: false, message: "La contraseña debe tener al menos 8 caracteres" }
  }

  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: "Debe contener al menos una mayúscula" }
  }

  if (!/[a-z]/.test(password)) {
    return { valid: false, message: "Debe contener al menos una minúscula" }
  }

  if (!/[0-9]/.test(password)) {
    return { valid: false, message: "Debe contener al menos un número" }
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return { valid: false, message: "Debe contener al menos un carácter especial (!@#$%^&*...)" }
  }

  return { valid: true }
}
