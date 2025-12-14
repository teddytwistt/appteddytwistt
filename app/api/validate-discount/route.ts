import { createAdminClient } from "@/lib/supabase/server-admin"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { code } = await request.json()
    console.log("[validate-discount] Validating discount code:", code)

    if (!code || typeof code !== "string") {
      console.log("[validate-discount] Invalid code format")
      return NextResponse.json({ error: "Código inválido" }, { status: 400 })
    }

    const supabase = await createAdminClient()

    // Usar la función de validación de la base de datos
    console.log("[validate-discount] Calling database validation function for:", code.toUpperCase())
    const { data, error } = await supabase.rpc("validar_codigo_descuento", {
      p_codigo: code.toUpperCase(),
    })

    console.log("[validate-discount] Validation result:", { data, error })

    if (error) {
      console.error("[validate-discount] Database error:", error)
      return NextResponse.json({ error: "Error al validar el código" }, { status: 500 })
    }

    // La función retorna un array con un objeto
    const resultado = Array.isArray(data) ? data[0] : data

    if (!resultado || !resultado.valido) {
      console.log("[validate-discount] Code validation failed:", resultado?.mensaje)
      return NextResponse.json(
        { error: resultado?.mensaje || "Código no válido" },
        { status: 400 }
      )
    }

    console.log("[validate-discount] Code validated successfully:", {
      id_descuento: resultado.id_descuento,
      porcentaje: resultado.porcentaje,
    })

    return NextResponse.json({
      valid: true,
      discount_percentage: resultado.porcentaje,
      id_descuento: resultado.id_descuento,
      code: code.toUpperCase(),
    })
  } catch (error) {
    console.error("[validate-discount] Error validating discount code:", error)
    return NextResponse.json({ error: "Error al validar el código" }, { status: 500 })
  }
}
