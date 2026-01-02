import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/server-admin"
import { checkAdminAuth } from "@/lib/auth/check-admin"

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // Verificar autenticación de administrador
  const auth = await checkAdminAuth()
  if (!auth.authorized) return auth.response

  try {
    const supabase = await createAdminClient()
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

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // Verificar autenticación de administrador
  const auth = await checkAdminAuth()
  if (!auth.authorized) return auth.response

  try {
    const supabase = await createAdminClient()
    const { id } = await params

    // Check if the code has been used in any orders
    const { data: orders, error: ordersError } = await supabase
      .from("pedidos")
      .select("id")
      .eq("id_codigo_descuento", parseInt(id))
      .limit(1)

    if (ordersError) {
      console.error("[admin] Error checking discount code usage:", ordersError)
      return NextResponse.json(
        { error: "Error al verificar uso del código" },
        { status: 500 }
      )
    }

    if (orders && orders.length > 0) {
      return NextResponse.json(
        { error: "No se puede eliminar un código que ya ha sido usado en pedidos" },
        { status: 400 }
      )
    }

    // Delete the code
    const { error } = await supabase
      .from("codigos_descuento")
      .delete()
      .eq("id", parseInt(id))

    if (error) {
      console.error("[admin] Error deleting discount code:", error)
      return NextResponse.json(
        { error: "Error al eliminar el código de descuento" },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[admin] Unexpected error:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
