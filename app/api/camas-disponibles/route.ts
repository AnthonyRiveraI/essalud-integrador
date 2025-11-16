import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Crear cliente con service_role_key (solo en servidor)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const { data, error, count } = await supabase
      .from('camas_emergencia')
      .select('*', { count: 'exact' })
      .eq('estado', 'disponible')

    if (error) {
      console.error('Error al consultar camas:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ 
      count: count || 0,
      camas: data 
    })
  } catch (error) {
    console.error('Error inesperado:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
