import { createAdminClient } from "@/lib/supabase/server-admin"
import { NextResponse } from "next/server"

const PRODUCTO_ID = 1 // ID del producto Buzzy Twist

export async function GET() {
  try {
    const supabase = await createAdminClient()

    // Obtener la primera unidad disponible (para preview)
    const { data: unidad, error: unidadError } = await supabase
      .from("unidades_producto")
      .select("numero_serie")
      .eq("id_producto", PRODUCTO_ID)
      .eq("estado", "disponible")
      .order("numero_serie")
      .limit(1)
      .single()

    if (unidadError || !unidad) {
      console.error("[get-next-serial] Error fetching next unit:", unidadError)
      return NextResponse.json({ error: "No hay unidades disponibles" }, { status: 404 })
    }

    // Obtener stock total
    const { data: producto, error: productoError } = await supabase
      .from("productos")
      .select("stock_inicial")
      .eq("id", PRODUCTO_ID)
      .single()

    if (productoError) {
      console.error("[get-next-serial] Error fetching product:", productoError)
      return NextResponse.json({ error: "Error fetching product data" }, { status: 500 })
    }

    const totalStock = producto?.stock_inicial || 900
    const nextSerial = unidad.numero_serie
    const formattedSerial = String(nextSerial).padStart(3, "0")
    const serialNumber = `${formattedSerial}/${totalStock}`

    return NextResponse.json({
      serialNumber: serialNumber,
      nextSerial: nextSerial,
      totalStock: totalStock,
    })
  } catch (error) {
    console.error("[get-next-serial] Error in get-next-serial:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}
