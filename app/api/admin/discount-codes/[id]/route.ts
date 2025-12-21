import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id } = await params
    const body = await request.json()

    const { activo } = body

    if (activo === undefined) {
      return NextResponse.json(
        { error: "El campo 'activo' es requerido" },
        { status: 400 }
      )
    }

    // Actualizar el código de descuento
    const { data, error } = await supabase
      .from("codigos_descuento")
      .update({ activo })
      .eq("id", parseInt(id))
      .select()
      .single()

    if (error) {
      console.error("[admin] Error updating discount code:", error)
      return NextResponse.json(
        { error: "Error al actualizar el código de descuento" },
        { status: 500 }
      )
    }

    if (!data) {
      return NextResponse.json(
        { error: "Código de descuento no encontrado" },
        { status: 404 }
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
