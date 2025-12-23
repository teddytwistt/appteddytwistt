import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { checkAdminAuth } from "@/lib/auth/check-admin"

export async function GET(request: Request) {
  // Verificar autenticación de administrador
  const auth = await checkAdminAuth()
  if (!auth.authorized) return auth.response

  try {
    const supabase = await createClient()

    // Get view mode and offset from query parameters
    const { searchParams } = new URL(request.url)
    const viewMode = searchParams.get("viewMode") || "days"
    const offset = parseInt(searchParams.get("offset") || "0")

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

    // Calculate daily sales based on view mode
    let dailySales = []

    if (viewMode === "days") {
      // Daily view: Show last 7 days with daily detail
      dailySales = getDailySales(paidOrders, 7, offset)
    } else if (viewMode === "weeks") {
      // Weekly view: Show last 8 weeks for comparison
      dailySales = getWeeklySales(paidOrders, 8, offset)
    } else if (viewMode === "months") {
      // Monthly view: Show last 12 months for comparison
      dailySales = getMonthlySales(paidOrders, 12, offset)
    } else if (viewMode === "years") {
      // Yearly view: Show years for comparison
      dailySales = getYearlySales(paidOrders, 5, offset)
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

function getDailySales(paidOrders: any[], days: number, offset: number) {
  const now = new Date()
  now.setHours(23, 59, 59, 999) // End of today

  // Calculate the start date based on offset
  const offsetDays = offset * days
  const endDate = new Date(now.getTime() - offsetDays * 24 * 60 * 60 * 1000)
  const startDate = new Date(endDate.getTime() - (days - 1) * 24 * 60 * 60 * 1000)
  startDate.setHours(0, 0, 0, 0)

  // Filter orders in this range
  const relevantOrders = paidOrders.filter((o) => {
    const orderDate = new Date(o.fecha_creacion)
    return orderDate >= startDate && orderDate <= endDate
  })

  // Group by date
  const salesByDate = new Map<string, { count: number; revenue: number }>()
  relevantOrders.forEach((order) => {
    const date = new Date(order.fecha_creacion).toISOString().split("T")[0]
    const existing = salesByDate.get(date) || { count: 0, revenue: 0 }
    salesByDate.set(date, {
      count: existing.count + 1,
      revenue: existing.revenue + order.monto_final,
    })
  })

  // Create array with all days
  const result = []
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(endDate.getTime() - i * 24 * 60 * 60 * 1000)
    const dateStr = date.toISOString().split("T")[0]
    const stats = salesByDate.get(dateStr) || { count: 0, revenue: 0 }
    result.push({
      date: dateStr,
      count: stats.count,
      revenue: stats.revenue,
    })
  }

  return result
}

function getWeeklySales(paidOrders: any[], weeks: number, offset: number) {
  const now = new Date()
  now.setHours(23, 59, 59, 999)

  // Get current week start (Monday)
  const currentWeekStart = new Date(now)
  currentWeekStart.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1))
  currentWeekStart.setHours(0, 0, 0, 0)

  const result = []

  for (let i = 0; i < weeks; i++) {
    const weekOffset = i + (offset * weeks)
    const weekStart = new Date(currentWeekStart)
    weekStart.setDate(currentWeekStart.getDate() - (weekOffset * 7))

    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() + 6)
    weekEnd.setHours(23, 59, 59, 999)

    // Filter orders in this week
    const weekOrders = paidOrders.filter((o) => {
      const orderDate = new Date(o.fecha_creacion)
      return orderDate >= weekStart && orderDate <= weekEnd
    })

    const revenue = weekOrders.reduce((sum, o) => sum + o.monto_final, 0)

    result.unshift({
      date: `Sem ${formatWeekLabel(weekStart)}`,
      count: weekOrders.length,
      revenue: revenue,
    })
  }

  return result
}

function getMonthlySales(paidOrders: any[], months: number, offset: number) {
  const now = new Date()
  const result = []

  for (let i = 0; i < months; i++) {
    const monthOffset = i + (offset * months)
    const targetDate = new Date(now.getFullYear(), now.getMonth() - monthOffset, 1)

    const monthStart = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1)
    monthStart.setHours(0, 0, 0, 0)

    const monthEnd = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0)
    monthEnd.setHours(23, 59, 59, 999)

    // Filter orders in this month
    const monthOrders = paidOrders.filter((o) => {
      const orderDate = new Date(o.fecha_creacion)
      return orderDate >= monthStart && orderDate <= monthEnd
    })

    const revenue = monthOrders.reduce((sum, o) => sum + o.monto_final, 0)

    result.unshift({
      date: formatMonthLabel(monthStart),
      count: monthOrders.length,
      revenue: revenue,
    })
  }

  return result
}

function getYearlySales(paidOrders: any[], years: number, offset: number) {
  const now = new Date()
  const currentYear = now.getFullYear()
  const result = []

  for (let i = 0; i < years; i++) {
    const yearOffset = i + (offset * years)
    const targetYear = currentYear - yearOffset

    const yearStart = new Date(targetYear, 0, 1)
    yearStart.setHours(0, 0, 0, 0)

    const yearEnd = new Date(targetYear, 11, 31)
    yearEnd.setHours(23, 59, 59, 999)

    // Filter orders in this year
    const yearOrders = paidOrders.filter((o) => {
      const orderDate = new Date(o.fecha_creacion)
      return orderDate >= yearStart && orderDate <= yearEnd
    })

    const revenue = yearOrders.reduce((sum, o) => sum + o.monto_final, 0)

    result.unshift({
      date: targetYear.toString(),
      count: yearOrders.length,
      revenue: revenue,
    })
  }

  return result
}

function formatWeekLabel(date: Date): string {
  const day = date.getDate().toString().padStart(2, '0')
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  return `${day}/${month}`
}

function formatMonthLabel(date: Date): string {
  const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]
  const year = date.getFullYear().toString().substring(2)
  return `${monthNames[date.getMonth()]} ${year}`
}
