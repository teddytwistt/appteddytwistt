import { type NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/server-admin"
import { getArgentinaTimestamp } from "@/lib/utils/timezone"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const paymentId = searchParams.get("payment_id")
    const preferenceId = searchParams.get("preference_id")

    if (!paymentId || !preferenceId) {
      return NextResponse.json({ error: "Parámetros faltantes" }, { status: 400 })
    }

    // Consultar la API de Mercado Pago
    const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN

    if (!accessToken) {
      return NextResponse.json({ error: "Configuración de pago no disponible" }, { status: 500 })
    }

    const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (!response.ok) {
      console.error("[v0] Mercado Pago validation error:", response.status)
      return NextResponse.json({ error: "Error al validar el pago" }, { status: 500 })
    }

    const paymentData = await response.json()

    // Verificar que el pago esté aprobado
    if (paymentData.status !== "approved") {
      return NextResponse.json(
        {
          success: false,
          message: "El pago no ha sido aprobado",
          status: paymentData.status,
        },
        { status: 200 },
      )
    }

    // Buscar el pedido en la base de datos
    const supabase = await createAdminClient()

    const { data: orderData, error: orderError } = await supabase
      .from("pedidos")
      .select("*")
      .eq("preference_id", preferenceId)
      .single()

    if (orderError || !orderData) {
      console.error("[payment-validate] Order not found:", orderError)
      return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 })
    }

    // Verificar que el monto coincida (usar monto_final)
    if (paymentData.transaction_amount !== orderData.monto_final) {
      console.error("[payment-validate] Amount mismatch:", {
        expected: orderData.monto_final,
        received: paymentData.transaction_amount,
      })
      return NextResponse.json({ error: "El monto del pago no coincide" }, { status: 400 })
    }

    // Actualizar el pedido con la información del pago
    const { error: updateError } = await supabase
      .from("pedidos")
      .update({
        estado_pago: "pagado",
        payment_id: paymentId,
        fecha_pago: getArgentinaTimestamp(),
        mp_response: paymentData,
      })
      .eq("id", orderData.id)

    if (updateError) {
      console.error("[payment-validate] Error updating order:", updateError)
      return NextResponse.json({ error: "Error al actualizar el pedido" }, { status: 500 })
    }

    // Marcar la unidad como vendida
    if (orderData.id_unidad) {
      const { error: unidadError } = await supabase.rpc("marcar_unidad_vendida", {
        p_id_unidad: orderData.id_unidad,
      })

      if (unidadError) {
        console.error("[payment-validate] Error marking unit as sold:", unidadError)
        // No fallar el proceso si esto falla, solo logear
      } else {
        console.log("[payment-validate] Unit marked as sold:", orderData.id_unidad)
      }
    }

    // Obtener el número de serie de la unidad
    let numeroSerie = null
    if (orderData.id_unidad) {
      const { data: unidad } = await supabase
        .from("unidades_producto")
        .select("numero_serie")
        .eq("id", orderData.id_unidad)
        .single()

      numeroSerie = unidad?.numero_serie
    }

    console.log("[payment-validate] Payment validated successfully for order:", orderData.id)

    return NextResponse.json({
      success: true,
      message: "Pago validado correctamente",
      pedido: {
        id: orderData.id,
        zona: orderData.zona,
        monto_final: orderData.monto_final,
        numero_serie: numeroSerie,
      },
    })
  } catch (error) {
    console.error("[v0] Payment validation error:", error)
    return NextResponse.json({ error: "Error al validar el pago" }, { status: 500 })
  }
}
