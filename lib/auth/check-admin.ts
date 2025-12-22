import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

/**
 * Verifica que el usuario actual esté autenticado y tenga rol de administrador
 *
 * @returns {Promise<{authorized: boolean, response?: NextResponse, user?: any}>}
 * - Si authorized es false, retorna una response de error que debe ser devuelta inmediatamente
 * - Si authorized es true, retorna el usuario autenticado
 *
 * @example
 * export async function GET(request: NextRequest) {
 *   const auth = await checkAdminAuth()
 *   if (!auth.authorized) return auth.response
 *
 *   // El usuario está autenticado y es admin
 *   // ... resto del código
 * }
 */
export async function checkAdminAuth() {
  try {
    const supabase = await createClient()

    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
      console.warn("[auth] Unauthorized access attempt - no user")
      return {
        authorized: false,
        response: NextResponse.json(
          { error: "No autorizado. Debes iniciar sesión." },
          { status: 401 }
        )
      }
    }

    // Verificar que el usuario tenga rol de admin
    if (user.user_metadata?.role !== "admin") {
      console.warn("[auth] Forbidden access attempt - user is not admin:", user.email)
      return {
        authorized: false,
        response: NextResponse.json(
          { error: "Acceso denegado. No tienes permisos de administrador." },
          { status: 403 }
        )
      }
    }

    return { authorized: true, user }
  } catch (error) {
    console.error("[auth] Error checking admin auth:", error)
    return {
      authorized: false,
      response: NextResponse.json(
        { error: "Error de autenticación" },
        { status: 500 }
      )
    }
  }
}
