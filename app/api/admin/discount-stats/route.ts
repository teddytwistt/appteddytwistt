import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { checkAdminAuth } from "@/lib/auth/check-admin"

export async function GET() {
  // Verificar autenticación de administrador
  const auth = await checkAdminAuth()
  if (!auth.authorized) return auth.response

  try {
    const supabase = await createClient()

    // Fetch all discount codes with their basic info
    const { data: discountCodes, error: codesError } = await supabase
      .from("codigos_descuento")
      .select("*")
      .order("created_at", { ascending: false })

    if (codesError) {
      console.error("[admin] Error fetching discount codes:", codesError)
      return NextResponse.json({ error: "Error al obtener códigos de descuento" }, { status: 500 })
    }

    // Fetch usage statistics from paid orders
    const { data: usageStats, error: statsError } = await supabase
      .from("pedidos")
      .select(`
        id_codigo_descuento,
        monto_original,
        monto_descuento,
        monto_final,
        estado_pago,
        fecha_creacion
      `)
      .not("id_codigo_descuento", "is", null)

    if (statsError) {
      console.error("[admin] Error fetching usage stats:", statsError)
      return NextResponse.json({ error: "Error al obtener estadísticas" }, { status: 500 })
    }

    // Process statistics for each discount code
    const statistics = discountCodes.map((code) => {
      const orders = usageStats?.filter((order) => order.id_codigo_descuento === code.id) || []
      const paidOrders = orders.filter((order) => order.estado_pago === "pagado")

      const totalUses = orders.length
      const successfulUses = paidOrders.length
      const totalRevenue = paidOrders.reduce((sum, order) => sum + order.monto_final, 0)
      const totalDiscount = paidOrders.reduce((sum, order) => sum + order.monto_descuento, 0)

      return {
        id: code.id,
        codigo: code.codigo,
        porcentaje_descuento: code.porcentaje_descuento,
        activo: code.activo,
        usos_maximos: code.usos_maximos,
        veces_usado: code.veces_usado,
        valido_desde: code.valido_desde,
        valido_hasta: code.valido_hasta,
        descripcion: code.descripcion,
        created_at: code.created_at,
        // Calculated stats
        total_uses: totalUses,
        successful_uses: successfulUses,
        pending_uses: totalUses - successfulUses,
        total_revenue: totalRevenue,
        total_discount_given: totalDiscount,
        average_order_value: successfulUses > 0 ? totalRevenue / successfulUses : 0,
      }
    })

    // Calculate overall statistics
    const totalDiscountGiven = statistics.reduce((sum, stat) => sum + stat.total_discount_given, 0)
    const totalRevenueWithDiscounts = statistics.reduce((sum, stat) => sum + stat.total_revenue, 0)
    const totalSuccessfulUses = statistics.reduce((sum, stat) => sum + stat.successful_uses, 0)
    const activeCodes = statistics.filter((stat) => stat.activo).length

    return NextResponse.json({
      codes: statistics,
      summary: {
        total_codes: statistics.length,
        active_codes: activeCodes,
        total_discount_given: totalDiscountGiven,
        total_revenue_with_discounts: totalRevenueWithDiscounts,
        total_successful_uses: totalSuccessfulUses,
      },
    })
  } catch (error) {
    console.error("[admin] Unexpected error:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
