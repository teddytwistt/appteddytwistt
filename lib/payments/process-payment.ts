import { createAdminClient } from "@/lib/supabase/server-admin"
import { getArgentinaTimestamp } from "@/lib/utils/timezone"
import { resend, FROM_EMAIL } from "@/lib/email/resend"
import { EmailConfirmacionCompleta } from "@/lib/email/templates"

type ProcessResult =
  | { alreadyProcessed: true; orderId: number }
  | { notApproved: true; status: string }
  | { success: true; orderId: number; numeroSerie: string; zona: string; montoFinal: number }

// preloadedData allows the webhook to pass already-fetched payment data and metadata,
// avoiding redundant API calls to MercadoPago.
export async function processApprovedPayment(
  paymentId: string,
  preferenceId: string | null,
  preloadedData?: { paymentData: any; metadata: any }
): Promise<ProcessResult> {
  const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN
  if (!accessToken) throw new Error("MP access token not configured")

  // Use pre-fetched data if provided, otherwise fetch from MP API
  let paymentData = preloadedData?.paymentData
  if (!paymentData) {
    const paymentResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    if (!paymentResponse.ok) throw new Error(`MP payment fetch error: ${paymentResponse.status}`)
    paymentData = await paymentResponse.json()
  }

  if (paymentData.status !== "approved") {
    return { notApproved: true, status: paymentData.status }
  }

  const supabase = await createAdminClient()

  // Idempotency: avoid duplicate orders
  const { data: existingOrder } = await supabase
    .from("pedidos")
    .select("id")
    .eq("payment_id", paymentId)
    .single()

  if (existingOrder) {
    console.log("[process-payment] Order already exists for payment:", paymentId)
    return { alreadyProcessed: true, orderId: existingOrder.id }
  }

  // Use pre-fetched metadata if provided, otherwise fetch from preference
  let metadata = preloadedData?.metadata
  if (!metadata) {
    if (!preferenceId) throw new Error("No preference_id and no preloaded metadata")
    const preferenceResponse = await fetch(
      `https://api.mercadopago.com/checkout/preferences/${preferenceId}`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    )
    if (!preferenceResponse.ok) throw new Error(`MP preference fetch error: ${preferenceResponse.status}`)
    const preferenceData = await preferenceResponse.json()
    metadata = preferenceData.metadata || {}
  }

  // Verify amount matches
  if (paymentData.transaction_amount !== metadata.monto_final) {
    throw new Error(
      `Amount mismatch: expected ${metadata.monto_final}, got ${paymentData.transaction_amount}`
    )
  }

  // Reserve a unit
  const { data: unidadReservada, error: unidadError } = await supabase.rpc(
    "reservar_unidad_disponible",
    { p_id_producto: metadata.id_producto }
  )
  if (unidadError || !unidadReservada || unidadReservada.length === 0) {
    console.error("[process-payment] No stock available after payment:", unidadError)
    // TODO: implement automatic refund
    throw new Error("No stock available after payment")
  }
  const unidad = unidadReservada[0]
  console.log("[process-payment] Unit reserved:", unidad.id_unidad, "Serial:", unidad.numero_serie)

  // Create client
  let idCliente = null
  if (metadata.shipping_data) {
    const sd = metadata.shipping_data
    const { data: clienteData, error: clienteError } = await supabase
      .from("clientes")
      .insert({
        nombre_apellido: sd.nombre_apellido,
        email: sd.email,
        telefono: sd.telefono,
        dni: sd.dni,
      })
      .select()
      .single()

    if (clienteError) {
      console.error("[process-payment] Error creating client:", clienteError)
      await supabase.rpc("liberar_unidad", { p_id_unidad: unidad.id_unidad })
      throw new Error("Error creating client")
    }
    idCliente = clienteData.id
    console.log("[process-payment] Client created:", idCliente)
  }

  // Create order
  const shippingData = metadata.shipping_data
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
      id_codigo_descuento: metadata.id_codigo_descuento || null,
      provincia: shippingData?.provincia || null,
      ciudad: shippingData?.ciudad || null,
      codigo_postal: shippingData?.codigo_postal || null,
      direccion_completa: shippingData?.direccion_completa || null,
      comentarios: shippingData?.comentarios || null,
      fecha_pago: getArgentinaTimestamp(),
      mp_response: paymentData,
    })
    .select()
    .single()

  if (orderError) {
    console.error("[process-payment] Error creating order:", orderError)
    await supabase.rpc("liberar_unidad", { p_id_unidad: unidad.id_unidad })
    throw new Error("Error creating order")
  }

  // Mark unit as sold
  const { error: markSoldError } = await supabase.rpc("marcar_unidad_vendida", {
    p_id_unidad: unidad.id_unidad,
  })
  if (markSoldError) {
    console.error("[process-payment] Error marking unit as sold:", markSoldError)
  } else {
    console.log("[process-payment] Unit marked as sold:", unidad.id_unidad)
  }

  console.log("[process-payment] Order created successfully:", orderData.id)

  // Send confirmation email
  if (metadata.shipping_data && idCliente) {
    try {
      const sd = metadata.shipping_data
      const htmlEmail = EmailConfirmacionCompleta({
        nombreCliente: sd.nombre_apellido,
        numeroPedido: orderData.id,
        numeroSerie: unidad.numero_serie,
        monto: orderData.monto_final,
        zona: orderData.zona,
        fechaPago: orderData.fecha_pago,
        direccion: sd.direccion_completa,
        ciudad: sd.ciudad,
        provincia: sd.provincia,
        codigoPostal: sd.codigo_postal,
        telefono: sd.telefono,
        dni: sd.dni,
      })

      const { error: emailError } = await resend.emails.send({
        from: FROM_EMAIL,
        to: sd.email,
        subject: `Compra Confirmada - Pedido #${String(orderData.id).padStart(4, "0")} - BUZZY × TEDDYTWIST`,
        html: htmlEmail,
      })

      if (emailError) {
        console.error("[process-payment] Error sending email:", emailError)
      } else {
        console.log("[process-payment] Confirmation email sent to:", sd.email)
      }
    } catch (emailError) {
      console.error("[process-payment] Exception sending email:", emailError)
    }
  }

  return {
    success: true,
    orderId: orderData.id,
    numeroSerie: unidad.numero_serie,
    zona: orderData.zona,
    montoFinal: orderData.monto_final,
  }
}
