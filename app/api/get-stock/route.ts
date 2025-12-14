import { type NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/server-admin"

const PRODUCTO_ID = 1 // ID del producto Buzzy Twist

export async function GET(request: NextRequest) {
  try {
    const supabase = await createAdminClient()

    // Usar la función SQL para obtener el stock
    const { data: stockData, error } = await supabase.rpc("obtener_stock_disponible", {
      p_id_producto: PRODUCTO_ID,
    })

    if (error) {
      console.error("[get-stock] Error fetching stock:", error)
      return NextResponse.json({ error: "Error al obtener el stock" }, { status: 500 })
    }

    if (!stockData || stockData.length === 0) {
      return NextResponse.json({ error: "No se encontraron datos de stock" }, { status: 404 })
    }

    const stock = stockData[0]
    const totalUnits = stock.stock_inicial || 900
    const soldUnits = Number(stock.vendidos) || 0
    const availableUnits = Number(stock.disponibles) || totalUnits

    return NextResponse.json({
      total: totalUnits,
      sold: soldUnits,
      available: availableUnits,
      stockDisplay: `${availableUnits}/${totalUnits}`,
    })
  } catch (error) {
    console.error("[get-stock] Stock fetch error:", error)
    return NextResponse.json({ error: "Error al obtener el stock" }, { status: 500 })
  }
}
