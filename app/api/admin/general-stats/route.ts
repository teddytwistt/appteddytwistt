import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { checkAdminAuth } from "@/lib/auth/check-admin"

export async function GET(request: Request) {
  // Verificar autenticación de administrador
  const auth = await checkAdminAuth()
  if (!auth.authorized) return auth.response

  try {
    const supabase = await createClient()

    // Get days parameter from query string (default to 30)
    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get("days") || "30")

    // Fetch all orders with necessary details
    const { data: orders, error: ordersError } = await supabase
      .from("pedidos")
      .select("*")
      .order("fecha_creacion", { ascending: true })

    if (ordersError) {
      console.error("[admin] Error fetching orders:", ordersError)
      return NextResponse.json({ error: "Error al obtener pedidos" }, { status: 500 })
    }

    // Calculate stats by zone
    const cbaOrders = orders.filter((o) => o.zona === "cba")
    const interiorOrders = orders.filter((o) => o.zona === "interior")

    const cbaPaidOrders = cbaOrders.filter((o) => o.estado_pago === "pagado")
    const interiorPaidOrders = interiorOrders.filter((o) => o.estado_pago === "pagado")

    const cbaRevenue = cbaPaidOrders.reduce((sum, o) => sum + o.monto_final, 0)
    const interiorRevenue = interiorPaidOrders.reduce((sum, o) => sum + o.monto_final, 0)

    // Calculate stats by payment status
    const paymentStatusStats = {
      pagado: orders.filter((o) => o.estado_pago === "pagado").length,
      pendiente: orders.filter((o) => o.estado_pago === "pendiente").length,
      fallido: orders.filter((o) => o.estado_pago === "fallido").length,
      reembolsado: orders.filter((o) => o.estado_pago === "reembolsado").length,
    }

    // Calculate stats by shipping status (only for paid orders)
    const paidOrders = orders.filter((o) => o.estado_pago === "pagado")
    const shippingStatusStats = {
      pendiente: paidOrders.filter((o) => o.estado_envio === "pendiente").length,
      enviado: paidOrders.filter((o) => o.estado_envio === "enviado").length,
      entregado: paidOrders.filter((o) => o.estado_envio === "entregado").length,
    }

    // Calculate daily sales for the last N days
    const now = new Date()
    const daysAgo = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)

    const recentPaidOrders = paidOrders.filter((o) => {
      const orderDate = new Date(o.fecha_creacion)
      return orderDate >= daysAgo
    })

    // Group by date
    const salesByDate = new Map<string, { count: number; revenue: number }>()

    recentPaidOrders.forEach((order) => {
      const date = new Date(order.fecha_creacion).toISOString().split("T")[0]
      const existing = salesByDate.get(date) || { count: 0, revenue: 0 }
      salesByDate.set(date, {
        count: existing.count + 1,
        revenue: existing.revenue + order.monto_final,
      })
    })

    // Convert to array and fill missing dates
    const dailySales = []
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      const dateStr = date.toISOString().split("T")[0]
      const stats = salesByDate.get(dateStr) || { count: 0, revenue: 0 }
      dailySales.push({
        date: dateStr,
        count: stats.count,
        revenue: stats.revenue,
      })
    }

    return NextResponse.json({
      geography: {
        cba: {
          total_orders: cbaOrders.length,
          paid_orders: cbaPaidOrders.length,
          revenue: cbaRevenue,
        },
        interior: {
          total_orders: interiorOrders.length,
          paid_orders: interiorPaidOrders.length,
          revenue: interiorRevenue,
        },
      },
      payment_status: paymentStatusStats,
      shipping_status: shippingStatusStats,
      daily_sales: dailySales,
      summary: {
        total_orders: orders.length,
        paid_orders: paidOrders.length,
        total_revenue: paidOrders.reduce((sum, o) => sum + o.monto_final, 0),
        average_order_value: paidOrders.length > 0
          ? paidOrders.reduce((sum, o) => sum + o.monto_final, 0) / paidOrders.length
          : 0,
      },
    })
  } catch (error) {
    console.error("[admin] Unexpected error:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
