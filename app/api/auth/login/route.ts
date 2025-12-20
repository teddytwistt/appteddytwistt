import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json(
        { error: "Usuario y contraseña son requeridos" },
        { status: 400 }
      )
    }

    // Convertir username a email para Supabase
    const email = `${username.toLowerCase()}@admin.com`

    const supabase = await createClient()

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return NextResponse.json(
        { error: "Credenciales incorrectas" },
        { status: 401 }
      )
    }

    if (!data.user) {
      return NextResponse.json(
        { error: "Error al iniciar sesión" },
        { status: 500 }
      )
    }

    // Verificar que el usuario tenga rol de admin
    if (data.user.user_metadata?.role !== "admin") {
      await supabase.auth.signOut()
      return NextResponse.json(
        { error: "Acceso no autorizado" },
        { status: 403 }
      )
    }

    return NextResponse.json({
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email,
        role: data.user.user_metadata?.role,
      },
    })
  } catch (error) {
    console.error("[auth/login] Error:", error)
    return NextResponse.json(
      { error: "Error del servidor" },
      { status: 500 }
    )
  }
}
