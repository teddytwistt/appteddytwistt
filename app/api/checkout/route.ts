import { type NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/server-admin"

const PRODUCTO_ID = 1 // ID del producto Buzzy Twist

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { zona, discountCode, discountPercentage, idDescuento, shippingData } = body

    if (!zona || (zona !== "cba" && zona !== "interior")) {
      return NextResponse.json({ error: "Zona inválida" }, { status: 400 })
    }

    // Validate shipping data if provided
    if (shippingData) {
      const requiredFields = ["nombre_apellido", "email", "telefono", "dni", "provincia", "ciudad", "codigo_postal", "direccion_completa"]
      const missingFields = requiredFields.filter(field => !shippingData[field])

      if (missingFields.length > 0) {
        return NextResponse.json(
          { error: `Faltan campos requeridos: ${missingFields.join(", ")}` },
          { status: 400 }
        )
      }
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

    // Crear preferencia de Mercado Pago con metadata para crear el pedido después del pago
    const preference = await createMercadoPagoPreference(
      zona,
      montoFinal,
      montoOriginal,
      discountCode,
      discountPercentage,
      idDescuento,
      shippingData
    )

    if (!preference.id || !preference.init_point) {
      return NextResponse.json({ error: "Error al crear preferencia de pago" }, { status: 500 })
    }

    console.log("[checkout] Preference created. No unit reserved, no order created. Waiting for payment confirmation.")

    return NextResponse.json({
      init_point: preference.init_point,
      preference_id: preference.id,
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
  idDescuento: number | null,
  shippingData: any | null,
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

  // Guardar información en metadata para crear el pedido después del pago
  const metadata = {
    id_producto: PRODUCTO_ID,
    zona,
    monto_original: montoOriginal,
    porcentaje_descuento: discountPercentage || 0,
    monto_descuento: montoOriginal - monto,
    monto_final: monto,
    discount_code: discountCode || null,
    id_codigo_descuento: idDescuento || null,
    shipping_data: shippingData || null,
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
    metadata,
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
