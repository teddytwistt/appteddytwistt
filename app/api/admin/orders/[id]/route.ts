import { type NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/server-admin"
import { getArgentinaTimestamp } from "@/lib/utils/timezone"

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const { estado_envio } = body

    if (!estado_envio || !["pendiente", "enviado", "entregado"].includes(estado_envio)) {
      return NextResponse.json({ error: "Estado de envío inválido" }, { status: 400 })
    }

    const supabase = await createAdminClient()

    // Actualizar también las fechas según el estado
    const updateData: Record<string, unknown> = { estado_envio }

    if (estado_envio === "enviado") {
      updateData.fecha_envio = getArgentinaTimestamp()
    } else if (estado_envio === "entregado") {
      updateData.fecha_entrega = getArgentinaTimestamp()
    }

    const { data, error } = await supabase.from("pedidos").update(updateData).eq("id", id).select().single()

    if (error) {
      console.error("[admin-orders-update] Error updating order:", error)
      return NextResponse.json({ error: "Error al actualizar pedido" }, { status: 500 })
    }

    return NextResponse.json({ success: true, order: data })
  } catch (error) {
    console.error("[admin-orders-update] Update order error:", error)
    return NextResponse.json({ error: "Error al actualizar pedido" }, { status: 500 })
  }
}
