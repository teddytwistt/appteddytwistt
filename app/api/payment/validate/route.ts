import { type NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/server-admin"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const paymentId = searchParams.get("payment_id")

    if (!paymentId) {
      return NextResponse.json({ error: "Parámetro payment_id faltante" }, { status: 400 })
    }

    const supabase = await createAdminClient()

    const { data: order } = await supabase
      .from("pedidos")
      .select("id, zona, monto_final, unidades_producto(numero_serie)")
      .eq("payment_id", paymentId)
      .single()

    if (!order) {
      // Webhook may still be processing — tell the client to retry
      return NextResponse.json({ processing: true }, { status: 202 })
    }

    return NextResponse.json({
      success: true,
      pedido: {
        id: order.id,
        zona: order.zona,
        monto_final: order.monto_final,
        numero_serie: (order.unidades_producto as any)?.[0]?.numero_serie,
      },
    })
  } catch (error) {
    console.error("[payment-validate] Error:", error)
    return NextResponse.json({ error: "Error al consultar el pedido" }, { status: 500 })
  }
}
