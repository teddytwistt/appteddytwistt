import { type NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/server-admin"

const PRODUCTO_ID = 1 // ID del producto Buzzy Twist

export async function GET(request: NextRequest) {
  try {
    const supabase = await createAdminClient()

    const { data: producto, error } = await supabase
      .from("productos")
      .select("precio_cba, precio_interior")
      .eq("id", PRODUCTO_ID)
      .single()

    if (error) {
      console.error("[get-prices] Error fetching prices:", error)
      return NextResponse.json({ error: "Error al obtener los precios" }, { status: 500 })
    }

    if (!producto) {
      return NextResponse.json({ error: "No se encontraron datos del producto" }, { status: 404 })
    }

    return NextResponse.json({
      precio_cba: producto.precio_cba,
      precio_interior: producto.precio_interior,
    })
  } catch (error) {
    console.error("[get-prices] Price fetch error:", error)
    return NextResponse.json({ error: "Error al obtener los precios" }, { status: 500 })
  }
}
