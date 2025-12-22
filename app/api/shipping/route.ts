import { type NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/server-admin"
import { resend, FROM_EMAIL } from "@/lib/email/resend"
import { EmailConfirmacionCompleta } from "@/lib/email/templates"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      payment_id,
      nombre_apellido,
      email,
      telefono,
      dni,
      provincia,
      ciudad,
      direccion_completa,
      comentarios,
      comprobante_url,
    } = body

    console.log("[v0] Shipping form received for payment_id:", payment_id)

    // Validar campos requeridos
    if (
      !payment_id ||
      !nombre_apellido ||
      !email ||
      !telefono ||
      !dni ||
      !provincia ||
      !ciudad ||
      !direccion_completa
    ) {
      return NextResponse.json({ error: "Todos los campos son requeridos" }, { status: 400 })
    }

    const supabase = await createAdminClient()

    // Buscar el pedido por payment_id
    const { data: orderData, error: orderError } = await supabase
      .from("pedidos")
      .select("*")
      .eq("payment_id", payment_id)
      .eq("estado_pago", "pagado")
      .single()

    if (orderError || !orderData) {
      console.error("[shipping] Order not found:", orderError)
      return NextResponse.json({ error: "Pedido no encontrado o no pagado" }, { status: 404 })
    }

    console.log("[shipping] Order found:", orderData.id)

    // Verificar que el pedido no tenga ya un cliente asignado
    if (orderData.id_cliente) {
      return NextResponse.json({ error: "El formulario ya fue completado para este pedido" }, { status: 400 })
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

    // Crear el cliente con los datos del formulario
    const { data: clienteData, error: clienteError } = await supabase
      .from("clientes")
      .insert({
        nombre_apellido,
        email,
        telefono,
        dni,
        provincia,
        ciudad,
        direccion_completa,
      })
      .select()
      .single()

    if (clienteError) {
      console.error("[shipping] Error creating client:", clienteError)
      return NextResponse.json({ error: "Error al guardar los datos del cliente" }, { status: 500 })
    }

    console.log("[shipping] Client created:", clienteData.id)

    // Actualizar el pedido vinculándolo al cliente y agregando comentarios
    const { error: updateError } = await supabase
      .from("pedidos")
      .update({
        id_cliente: clienteData.id,
        comentarios: comentarios || null,
      })
      .eq("id", orderData.id)

    if (updateError) {
      console.error("[v0] Error updating shipping info:", updateError)
      return NextResponse.json({ error: "Error al guardar los datos de envío" }, { status: 500 })
    }

    console.log("[v0] Order updated successfully")

    // Enviar email de confirmación completo al cliente
    try {
      // Email unificado con toda la información de compra y envío
      const htmlEmail = EmailConfirmacionCompleta({
        nombreCliente: nombre_apellido,
        numeroPedido: orderData.id,
        numeroSerie: numeroSerie || undefined,
        monto: orderData.monto_final,
        zona: orderData.zona,
        fechaPago: orderData.fecha_pago || new Date().toISOString(),
        direccion: direccion_completa,
        ciudad: ciudad,
        provincia: provincia,
        telefono: telefono,
        dni: dni,
      })

      // Enviar un solo email con toda la información
      await resend.emails.send({
        from: FROM_EMAIL,
        to: email,
        subject: `🎉 ¡Compra Confirmada! Pedido #${String(orderData.id).padStart(4, '0')} - BUZZY × TEDDYTWIST`,
        html: htmlEmail,
      })

      console.log("[shipping] Confirmation email sent successfully to:", email)
    } catch (emailError) {
      console.error("[shipping] Error sending confirmation emails:", emailError)
      // No bloqueamos el proceso si falla el envío de email
    }

    // Enviar a Google Sheets
    let sheetsSuccess = false
    let sheetsError = null

    try {
      await sendToGoogleSheets({
        ...orderData,
        nombre_apellido,
        email,
        telefono,
        dni,
        provincia,
        ciudad,
        direccion_completa,
        comentarios,
        comprobante_url,
        numero_serie: numeroSerie,
      })
      sheetsSuccess = true
      console.log("[v0] Data sent to Google Sheets successfully")
    } catch (error) {
      sheetsError = error
      console.error("[v0] Error sending to Google Sheets:", error)
      // No bloqueamos el proceso si falla Google Sheets
    }

    return NextResponse.json({
      success: true,
      message: "Datos de envío guardados correctamente",
      pedido_id: orderData.id,
      cliente_id: clienteData.id,
      sheets_status: sheetsSuccess ? "sent" : "failed",
      sheets_error: sheetsError ? String(sheetsError) : null,
    })
  } catch (error) {
    console.error("[v0] Shipping form error:", error)
    return NextResponse.json({ error: "Error al procesar los datos de envío", details: String(error) }, { status: 500 })
  }
}

async function sendToGoogleSheets(orderData: any) {
  const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL

  if (!webhookUrl) {
    const errorMsg = "Google Sheets webhook URL not configured (GOOGLE_SHEETS_WEBHOOK_URL)"
    console.error("[v0]", errorMsg)
    throw new Error(errorMsg)
  }

  console.log("[v0] 📤 Sending to Google Sheets webhook...")
  console.log("[v0] Webhook URL:", webhookUrl)

  const payload = {
    fecha_hora: new Date().toISOString(),
    pedido_id: orderData.id || "",
    payment_id: orderData.payment_id || "",
    preference_id: orderData.preference_id || "",
    zona: orderData.zona === "cba" ? "Córdoba Capital" : "Interior",
    monto_original: orderData.monto_original || 0,
    monto_descuento: orderData.monto_descuento || 0,
    monto_final: orderData.monto_final || 0,
    porcentaje_descuento: orderData.porcentaje_descuento || 0,
    numero_serie: orderData.numero_serie || "",
    estado_pago: orderData.estado_pago || "",
    nombre_apellido: orderData.nombre_apellido || "",
    email: orderData.email || "",
    telefono: orderData.telefono || "",
    dni: orderData.dni || "",
    provincia: orderData.provincia || "",
    ciudad: orderData.ciudad || "",
    direccion_completa: orderData.direccion_completa || "",
    comentarios: orderData.comentarios || "",
    estado_envio: orderData.estado_envio || "pendiente",
  }

  console.log("[v0] 📦 Payload:", JSON.stringify(payload, null, 2))

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      redirect: "follow", // Follow redirects from Google
    })

    console.log("[v0] 📊 Response status:", response.status)
    console.log("[v0] 📊 Response headers:", Object.fromEntries(response.headers.entries()))

    const responseText = await response.text()
    console.log("[v0] 📊 Response body:", responseText)

    if (!response.ok) {
      throw new Error(`Google Sheets webhook returned ${response.status}: ${responseText}`)
    }

    // Try to parse JSON response
    try {
      const jsonResponse = JSON.parse(responseText)
      console.log("[v0] 📋 Parsed JSON:", jsonResponse)

      if (!jsonResponse.success) {
        throw new Error(`Google Sheets returned success=false: ${jsonResponse.error || "Unknown error"}`)
      }
    } catch (parseError) {
      // If it's not JSON, check if it's HTML (common error from Google)
      if (responseText.includes("<!DOCTYPE html>") || responseText.includes("<html")) {
        console.error("[v0] ⚠️ Received HTML instead of JSON - Script may not be properly deployed")
        throw new Error("Google Sheets script not properly deployed as Web App. Please check deployment settings.")
      }
      // If status is 200 and it's not HTML, accept it
      console.log("[v0] ℹ️ Response is not JSON but status is OK")
    }

    console.log("[v0] ✅ Successfully sent to Google Sheets")
    return true
  } catch (error) {
    console.error("[v0] ❌ Failed to send to Google Sheets:", error)
    if (error instanceof Error) {
      console.error("[v0] Error message:", error.message)
      console.error("[v0] Error stack:", error.stack)
    }
    throw error
  }
}
