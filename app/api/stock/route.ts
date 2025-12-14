import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/server-admin"

const PRODUCTO_ID = 1 // ID del producto Buzzy Twist

export async function GET() {
  try {
    const supabase = await createAdminClient()

    // Obtener información del producto
    const { data: producto, error: errorProducto } = await supabase
      .from("productos")
      .select("*")
      .eq("id", PRODUCTO_ID)
      .single()

    if (errorProducto) {
      console.error("[stock] Error fetching product:", errorProducto)
      return NextResponse.json({ error: "Error al obtener producto" }, { status: 500 })
    }

    // Obtener stock usando la función
    const { data: stockData, error: errorStock } = await supabase.rpc("obtener_stock_disponible", {
      p_id_producto: PRODUCTO_ID,
    })

    if (errorStock || !stockData || stockData.length === 0) {
      console.error("[stock] Error fetching stock:", errorStock)
      return NextResponse.json({ error: "Error al obtener stock" }, { status: 500 })
    }

    const stock = stockData[0]

    return NextResponse.json({
      id: PRODUCTO_ID,
      nombre: producto.nombre,
      stock_inicial: stock.stock_inicial,
      vendidos: Number(stock.vendidos),
      disponibles: Number(stock.disponibles),
      activo: producto.activo,
    })
  } catch (error) {
    console.error("[stock] Stock error:", error)
    return NextResponse.json({ error: "Error al obtener stock" }, { status: 500 })
  }
}
