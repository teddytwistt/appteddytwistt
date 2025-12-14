import { type NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/server-admin"

const PRODUCTO_ID = 1 // ID del producto Buzzy Twist

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { zona, discountCode, discountPercentage, idDescuento } = body

    if (!zona || (zona !== "cba" && zona !== "interior")) {
      return NextResponse.json({ error: "Zona inválida" }, { status: 400 })
    }

    const supabase = await createAdminClient()

    // Obtener precios del producto desde la base de datos
    const { data: producto, error: productoError } = await supabase
      .from("productos")
      .select("precio_cba, precio_interior")
      .eq("id", PRODUCTO_ID)
      .single()

    if (productoError || !producto) {
      console.error("[checkout] Error fetching product prices:", productoError)
      return NextResponse.json({ error: "Error al obtener precios del producto" }, { status: 500 })
    }

    // Verificar stock disponible usando la función obtener_stock_disponible
    const { data: stockData, error: stockError } = await supabase
      .rpc("obtener_stock_disponible", {
        p_id_producto: PRODUCTO_ID,
      })

    if (stockError) {
      console.error("[checkout] Error checking stock:", stockError)
      return NextResponse.json({ error: "Error al verificar stock" }, { status: 500 })
    }

    if (!stockData || stockData.length === 0 || stockData[0].disponibles <= 0) {
      return NextResponse.json({ error: "Producto agotado" }, { status: 400 })
    }

    // Calcular montos usando los precios de la base de datos
    const montoOriginal = zona === "cba" ? producto.precio_cba : producto.precio_interior
    let montoDescuento = 0
    let montoFinal = montoOriginal

    if (discountPercentage && discountPercentage > 0) {
      montoDescuento = Math.round((montoOriginal * discountPercentage) / 100)
      montoFinal = montoOriginal - montoDescuento
      console.log(
        `[checkout] Discount applied: ${discountPercentage}% - Original: $${montoOriginal}, Descuento: $${montoDescuento}, Final: $${montoFinal}`
      )
    }

    const preference = await createMercadoPagoPreference(
      zona,
      montoFinal,
      montoOriginal,
      discountCode,
      discountPercentage
    )

    if (!preference.id || !preference.init_point) {
      return NextResponse.json({ error: "Error al crear preferencia de pago" }, { status: 500 })
    }

    // Reservar una unidad disponible
    const { data: unidadReservada, error: unidadError } = await supabase.rpc("reservar_unidad_disponible", {
      p_id_producto: PRODUCTO_ID,
    })

    if (unidadError || !unidadReservada || unidadReservada.length === 0) {
      console.error("[checkout] Error reserving unit:", unidadError)
      return NextResponse.json({ error: "No hay stock disponible" }, { status: 400 })
    }

    const unidad = unidadReservada[0]
    console.log("[checkout] Unit reserved:", unidad.id_unidad, "Serial:", unidad.numero_serie)

    // Crear el pedido con la unidad reservada
    const { data: orderData, error: orderError } = await supabase
      .from("pedidos")
      .insert({
        preference_id: preference.id,
        id_producto: PRODUCTO_ID,
        id_unidad: unidad.id_unidad,
        zona,
        monto_original: montoOriginal,
        porcentaje_descuento: discountPercentage || 0,
        monto_descuento: montoDescuento,
        monto_final: montoFinal,
        estado_pago: "pendiente",
        estado_envio: "pendiente",
        id_codigo_descuento: idDescuento || null,
      })
      .select()
      .single()

    if (orderError) {
      console.error("[checkout] Error creating order:", orderError)
      // Liberar la unidad si falla la creación del pedido
      await supabase.rpc("liberar_unidad", { p_id_unidad: unidad.id_unidad })
      return NextResponse.json({ error: "Error al crear pedido" }, { status: 500 })
    }

    console.log("[checkout] Order created successfully:", orderData.id, "Unit:", unidad.id_unidad)

    return NextResponse.json({
      init_point: preference.init_point,
      preference_id: preference.id,
      pedido_id: orderData.id,
    })
  } catch (error) {
    console.error("[checkout] Checkout error:", error)
    return NextResponse.json({ error: "Error en el proceso de checkout" }, { status: 500 })
  }
}

async function createMercadoPagoPreference(
  zona: string,
  monto: number,
  montoOriginal: number,
  discountCode: string | null,
  discountPercentage: number | null,
) {
  const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN

  if (!accessToken) {
    throw new Error("Mercado Pago access token not configured")
  }

  const formUrl = process.env.NEXT_PUBLIC_FORM_URL

  if (!formUrl) {
    console.error("[v0] NEXT_PUBLIC_FORM_URL not configured")
    throw new Error("NEXT_PUBLIC_FORM_URL environment variable is required")
  }

  console.log("[v0] Creating preference with form URL:", formUrl)

  let description = zona === "cba" ? "Envío gratis - Córdoba Capital" : "Incluye envío - Resto del país"
  if (discountCode && discountPercentage) {
    description += ` | Descuento ${discountPercentage}% aplicado (${discountCode})`
  }

  const preferenceData = {
    items: [
      {
        title: "Buzzy Twist - Edición Limitada",
        description,
        quantity: 1,
        unit_price: monto, // Use discounted price
        currency_id: "ARS",
      },
    ],
    back_urls: {
      success: `${formUrl}/checkout/success`,
      failure: `${formUrl}/checkout/failure`,
      pending: `${formUrl}/checkout/pending`,
    },
    auto_return: "approved",
    external_reference: zona,
    statement_descriptor: "BUZZY TWIST",
    payment_methods: {
      excluded_payment_methods: [],
      excluded_payment_types: [],
      installments: 1,
    },
    additional_info: `Completá tus datos de envío en: ${formUrl}`,
  }

  console.log("[v0] Preference data:", JSON.stringify(preferenceData, null, 2))

  const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(preferenceData),
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error("[v0] Mercado Pago error:", errorText)
    throw new Error(`Mercado Pago API error: ${response.status} - ${errorText}`)
  }

  const result = await response.json()
  console.log("[v0] Preference created:", result.id)

  return result
}
