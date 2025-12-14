import { type NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/server-admin"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const clienteId = parseInt(id)

    if (isNaN(clienteId)) {
      return NextResponse.json({ error: "ID de cliente inválido" }, { status: 400 })
    }

    const supabase = await createAdminClient()

    // Obtener información del cliente
    const { data: cliente, error: clienteError } = await supabase
      .from("clientes")
      .select("*")
      .eq("id", clienteId)
      .single()

    if (clienteError || !cliente) {
      console.error("[admin-clientes] Error fetching cliente:", clienteError)
      return NextResponse.json({ error: "Cliente no encontrado" }, { status: 404 })
    }

    // Obtener todos los pedidos del cliente
    const { data: pedidos, error: pedidosError } = await supabase
      .from("pedidos")
      .select(
        `
        *,
        unidad:unidades_producto(*),
        codigo_descuento:codigos_descuento(*)
      `
      )
      .eq("id_cliente", clienteId)
      .order("fecha_creacion", { ascending: false })

    if (pedidosError) {
      console.error("[admin-clientes] Error fetching pedidos:", pedidosError)
    }

    return NextResponse.json({
      cliente,
      pedidos: pedidos || [],
    })
  } catch (error) {
    console.error("[admin-clientes] Error:", error)
    return NextResponse.json({ error: "Error al obtener cliente" }, { status: 500 })
  }
}
