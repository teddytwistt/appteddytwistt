import { type NextRequest, NextResponse } from "next/server"
import { processApprovedPayment } from "@/lib/payments/process-payment"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Only process payment events
    if (body.type !== "payment") {
      return NextResponse.json({ received: true })
    }

    const paymentId = String(body?.data?.id ?? "")
    if (!paymentId) {
      return NextResponse.json({ error: "No payment ID in notification" }, { status: 400 })
    }

    console.log("[webhook-mp] Received payment notification:", paymentId)

    const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN
    if (!accessToken) {
      return NextResponse.json({ error: "MP access token not configured" }, { status: 500 })
    }

    // Fetch payment data from MP
    const paymentResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    if (!paymentResponse.ok) {
      console.error("[webhook-mp] Error fetching payment:", paymentResponse.status)
      return NextResponse.json({ error: "Error fetching payment" }, { status: 500 })
    }
    const paymentData = await paymentResponse.json()

    if (paymentData.status !== "approved") {
      console.log("[webhook-mp] Payment not approved, status:", paymentData.status)
      return NextResponse.json({ received: true, status: paymentData.status })
    }

    // Use metadata from payment directly (MP copies it from the preference)
    const metadata = paymentData.metadata
    if (!metadata || !metadata.id_producto) {
      console.error("[webhook-mp] No usable metadata in payment data")
      return NextResponse.json({ error: "No metadata in payment" }, { status: 400 })
    }

    const preferenceId = paymentData.preference_id || null

    const result = await processApprovedPayment(
      paymentId,
      preferenceId,
      { paymentData, metadata }
    )
    console.log("[webhook-mp] Result:", result)

    return NextResponse.json({ received: true, result })
  } catch (error) {
    console.error("[webhook-mp] Unhandled error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
