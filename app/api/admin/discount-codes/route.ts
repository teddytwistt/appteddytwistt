import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    const {
      codigo,
      porcentaje_descuento,
      usos_maximos,
      descripcion,
      activo,
    } = body

    // Validaciones
    if (!codigo || !porcentaje_descuento) {
      return NextResponse.json(
        { error: "El código y el porcentaje de descuento son obligatorios" },
        { status: 400 }
      )
    }

    if (porcentaje_descuento < 1 || porcentaje_descuento > 100) {
      return NextResponse.json(
        { error: "El porcentaje de descuento debe estar entre 1 y 100" },
        { status: 400 }
      )
    }

    // Verificar si el código ya existe
    const { data: existingCode } = await supabase
      .from("codigos_descuento")
      .select("id")
      .eq("codigo", codigo.toUpperCase())
      .single()

    if (existingCode) {
      return NextResponse.json(
        { error: "Ya existe un código de descuento con ese nombre" },
        { status: 400 }
      )
    }

    // Crear el código de descuento
    const { data, error } = await supabase
      .from("codigos_descuento")
      .insert({
        codigo: codigo.toUpperCase(),
        porcentaje_descuento,
        activo: activo !== undefined ? activo : true,
        usos_maximos: usos_maximos || null,
        veces_usado: 0,
        descripcion: descripcion || null,
      })
      .select()
      .single()

    if (error) {
      console.error("[admin] Error creating discount code:", error)
      return NextResponse.json(
        { error: "Error al crear el código de descuento" },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, code: data })
  } catch (error) {
    console.error("[admin] Unexpected error:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
