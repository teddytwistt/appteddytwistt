import { type NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/server-admin"
import { getArgentinaTimestamp } from "@/lib/utils/timezone"
import { resend, FROM_EMAIL } from "@/lib/email/resend"
import { EmailConfirmacionCompleta } from "@/lib/email/templates"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const paymentId = searchParams.get("payment_id")
    const preferenceId = searchParams.get("preference_id")

    if (!paymentId || !preferenceId) {
      return NextResponse.json({ error: "Parámetros faltantes" }, { status: 400 })
    }

    // Consultar la API de Mercado Pago para validar el pago
    const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN

    if (!accessToken) {
      return NextResponse.json({ error: "Configuración de pago no disponible" }, { status: 500 })
    }

    const paymentResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (!paymentResponse.ok) {
      console.error("[payment-validate] Mercado Pago validation error:", paymentResponse.status)
      return NextResponse.json({ error: "Error al validar el pago" }, { status: 500 })
    }

    const paymentData = await paymentResponse.json()

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

    const supabase = await createAdminClient()

    // Verificar si ya existe un pedido para este pago (evitar duplicados)
    const { data: existingOrder } = await supabase
      .from("pedidos")
      .select("id, numero_serie:unidades_producto(numero_serie)")
      .eq("payment_id", paymentId)
      .single()

    if (existingOrder) {
      console.log("[payment-validate] Order already exists for payment:", paymentId)
      return NextResponse.json({
        success: true,
        message: "Pago ya procesado",
        pedido: {
          id: existingOrder.id,
          numero_serie: existingOrder.numero_serie?.[0]?.numero_serie,
        },
      })
    }

    // Obtener el preference para sacar los metadata
    const preferenceResponse = await fetch(
      `https://api.mercadopago.com/checkout/preferences/${preferenceId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    )

    if (!preferenceResponse.ok) {
      console.error("[payment-validate] Error fetching preference:", preferenceResponse.status)
      return NextResponse.json({ error: "Error al obtener información del pedido" }, { status: 500 })
    }

    const preferenceData = await preferenceResponse.json()
    const metadata = preferenceData.metadata || {}

    console.log("[payment-validate] Preference metadata:", metadata)

    // Verificar que el monto coincida
    if (paymentData.transaction_amount !== metadata.monto_final) {
      console.error("[payment-validate] Amount mismatch:", {
        expected: metadata.monto_final,
        received: paymentData.transaction_amount,
      })
      return NextResponse.json({ error: "El monto del pago no coincide" }, { status: 400 })
    }

    // Reservar una unidad disponible
    const { data: unidadReservada, error: unidadError } = await supabase.rpc("reservar_unidad_disponible", {
      p_id_producto: metadata.id_producto,
    })

    if (unidadError || !unidadReservada || unidadReservada.length === 0) {
      console.error("[payment-validate] No stock available after payment:", unidadError)
      // TODO: Implementar reembolso automático si no hay stock
      return NextResponse.json(
        { error: "No hay stock disponible. Contactar soporte para reembolso." },
        { status: 400 }
      )
    }

    const unidad = unidadReservada[0]
    console.log("[payment-validate] Unit reserved:", unidad.id_unidad, "Serial:", unidad.numero_serie)

    // Crear el cliente si hay datos de envío en el metadata
    let idCliente = null
    if (metadata.shipping_data) {
      const shippingData = metadata.shipping_data
      const { data: clienteData, error: clienteError } = await supabase
        .from("clientes")
        .insert({
          nombre_apellido: shippingData.nombre_apellido,
          email: shippingData.email,
          telefono: shippingData.telefono,
          dni: shippingData.dni,
          provincia: shippingData.provincia,
          ciudad: shippingData.ciudad,
          direccion_completa: shippingData.direccion_completa,
        })
        .select()
        .single()

      if (clienteError) {
        console.error("[payment-validate] Error creating client:", clienteError)
        // Liberar la unidad si falla la creación del cliente
        await supabase.rpc("liberar_unidad", { p_id_unidad: unidad.id_unidad })
        return NextResponse.json({ error: "Error al guardar los datos del cliente" }, { status: 500 })
      }

      idCliente = clienteData.id
      console.log("[payment-validate] Client created:", idCliente)
    }

    // Crear el pedido con el pago ya aprobado
    const { data: orderData, error: orderError } = await supabase
      .from("pedidos")
      .insert({
        preference_id: preferenceId,
        payment_id: paymentId,
        id_producto: metadata.id_producto,
        id_unidad: unidad.id_unidad,
        id_cliente: idCliente,
        zona: metadata.zona,
        monto_original: metadata.monto_original,
        porcentaje_descuento: metadata.porcentaje_descuento,
        monto_descuento: metadata.monto_descuento,
        monto_final: metadata.monto_final,
        estado_pago: "pagado",
        estado_envio: "pendiente",
        id_codigo_descuento: metadata.id_codigo_descuento,
        comentarios: metadata.shipping_data?.comentarios || null,
        fecha_pago: getArgentinaTimestamp(),
        mp_response: paymentData,
      })
      .select()
      .single()

    if (orderError) {
      console.error("[payment-validate] Error creating order:", orderError)
      // Liberar la unidad si falla la creación del pedido
      await supabase.rpc("liberar_unidad", { p_id_unidad: unidad.id_unidad })
      return NextResponse.json({ error: "Error al crear pedido" }, { status: 500 })
    }

    // Marcar la unidad como vendida
    const { error: markSoldError } = await supabase.rpc("marcar_unidad_vendida", {
      p_id_unidad: unidad.id_unidad,
    })

    if (markSoldError) {
      console.error("[payment-validate] Error marking unit as sold:", markSoldError)
      // No fallar el proceso si esto falla, solo logear
    } else {
      console.log("[payment-validate] Unit marked as sold:", unidad.id_unidad)
    }

    console.log("[payment-validate] Order created successfully:", orderData.id)

    // Enviar email de confirmación si hay datos del cliente
    if (metadata.shipping_data && idCliente) {
      try {
        const shippingData = metadata.shipping_data
        console.log("[payment-validate] Sending confirmation email to:", shippingData.email)

        const htmlEmail = EmailConfirmacionCompleta({
          nombreCliente: shippingData.nombre_apellido,
          numeroPedido: orderData.id,
          numeroSerie: unidad.numero_serie,
          monto: orderData.monto_final,
          zona: orderData.zona,
          fechaPago: orderData.fecha_pago,
          direccion: shippingData.direccion_completa,
          ciudad: shippingData.ciudad,
          provincia: shippingData.provincia,
          telefono: shippingData.telefono,
          dni: shippingData.dni,
        })

        const { data, error } = await resend.emails.send({
          from: FROM_EMAIL,
          to: shippingData.email,
          subject: `Compra Confirmada - Pedido #${String(orderData.id).padStart(4, '0')} - BUZZY × TEDDYTWIST`,
          html: htmlEmail,
        })

        if (error) {
          console.error("[payment-validate] Error sending email:", error)
          // No bloqueamos el proceso si falla el email
        } else {
          console.log("[payment-validate] Confirmation email sent successfully. Email ID:", data?.id)
        }
      } catch (emailError) {
        console.error("[payment-validate] Error sending confirmation email:", emailError)
        // No bloqueamos el proceso si falla el email
      }
    }

    return NextResponse.json({
      success: true,
      message: "Pago validado correctamente",
      pedido: {
        id: orderData.id,
        zona: orderData.zona,
        monto_final: orderData.monto_final,
        numero_serie: unidad.numero_serie,
      },
    })
  } catch (error) {
    console.error("[payment-validate] Payment validation error:", error)
    return NextResponse.json({ error: "Error al validar el pago" }, { status: 500 })
  }
}
