import { type NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/server-admin"
import { checkAdminAuth } from "@/lib/auth/check-admin"

export async function GET(request: NextRequest) {
  // Verificar autenticación de administrador
  const auth = await checkAdminAuth()
  if (!auth.authorized) return auth.response

  try {
    const searchParams = request.nextUrl.searchParams
    const estadoPago = searchParams.get("estado_pago")
    const estadoEnvio = searchParams.get("estado_envio")

    const supabase = await createAdminClient()

    let query = supabase
      .from("pedidos")
      .select(
        `
        *,
        cliente:clientes(*),
        producto:productos(*),
        unidad:unidades_producto(*),
        codigo_descuento:codigos_descuento(*)
      `
      )
      .order("fecha_creacion", { ascending: false })

    // Apply filters
    if (estadoPago) {
      query = query.eq("estado_pago", estadoPago)
    }

    if (estadoEnvio) {
      query = query.eq("estado_envio", estadoEnvio)
    }

    const { data, error } = await query

    if (error) {
      console.error("[admin-orders] Error fetching orders:", error)
      return NextResponse.json({ error: "Error al obtener pedidos" }, { status: 500 })
    }

    return NextResponse.json({ orders: data || [] })
  } catch (error) {
    console.error("[admin-orders] Admin orders error:", error)
    return NextResponse.json({ error: "Error al obtener pedidos" }, { status: 500 })
  }
}
