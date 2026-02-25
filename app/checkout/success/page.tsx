"use client"

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void
  }
}

import { useEffect, useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Loader2, XCircle, Clock } from "lucide-react"

const MAX_RETRIES = 10
const RETRY_INTERVAL_MS = 2000

function SuccessPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState<"loading" | "success" | "timeout" | "error">("loading")
  const [errorMessage, setErrorMessage] = useState("")
  const [orderData, setOrderData] = useState<any>(null)

  useEffect(() => {
    const paymentId = searchParams.get("payment_id")

    if (!paymentId) {
      setStatus("error")
      setErrorMessage("Faltan parámetros de pago")
      return
    }

    let attempt = 0

    const pollOrder = async () => {
      attempt++
      try {
        const response = await fetch(`/api/payment/validate?payment_id=${paymentId}`)
        const data = await response.json()

        if (data.success && data.pedido) {
          setStatus("success")
          setOrderData(data.pedido)

          if (typeof window !== "undefined" && typeof window.fbq === "function") {
            window.fbq("track", "Purchase", {
              value: data.pedido?.monto_final || 0,
              currency: "ARS",
            })
          }
          return
        }

        if (data.processing && attempt < MAX_RETRIES) {
          setTimeout(pollOrder, RETRY_INTERVAL_MS)
          return
        }

        if (data.processing && attempt >= MAX_RETRIES) {
          setStatus("timeout")
          return
        }

        setStatus("error")
        setErrorMessage(data.error || "El pago no pudo ser validado")
      } catch (error) {
        console.error("[success] Polling error:", error)
        if (attempt < MAX_RETRIES) {
          setTimeout(pollOrder, RETRY_INTERVAL_MS)
        } else {
          setStatus("error")
          setErrorMessage("Error al validar el pago")
        }
      }
    }

    pollOrder()
  }, [searchParams])

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-background">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
            <p className="text-lg font-semibold">Validando tu pago...</p>
            <p className="text-sm text-muted-foreground text-center">
              Por favor espera mientras verificamos tu compra
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (status === "timeout") {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-background">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <Clock className="w-16 h-16 text-yellow-500" />
            </div>
            <CardTitle className="text-center text-2xl">Pago recibido</CardTitle>
            <CardDescription className="text-center">
              Tu pago fue procesado correctamente. Estamos confirmando tu pedido, recibirás un
              correo con todos los detalles en unos minutos.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push("/")} className="w-full">
              Volver al inicio
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (status === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-background">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <XCircle className="w-16 h-16 text-red-500" />
            </div>
            <CardTitle className="text-center text-2xl">Error en el pago</CardTitle>
            <CardDescription className="text-center">{errorMessage}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push("/")} className="w-full">
              Volver al inicio
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <CheckCircle2 className="w-16 h-16 text-green-500" />
          </div>
          <CardTitle className="text-center text-2xl">¡Compra completada!</CardTitle>
          <CardDescription className="text-center">
            Tu pedido ha sido registrado exitosamente. Recibirás un correo con los detalles de tu
            compra.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 space-y-3">
            <div>
              <p className="text-sm font-semibold">Número de orden:</p>
              <p className="text-lg font-mono">#{orderData?.id}</p>
            </div>
            {orderData?.numero_serie && (
              <div>
                <p className="text-sm font-semibold">Número de serie:</p>
                <p className="text-lg font-mono">
                  {String(orderData.numero_serie).padStart(3, "0")}/900
                </p>
              </div>
            )}
            <div>
              <p className="text-sm font-semibold">Zona:</p>
              <p className="text-base">
                {orderData?.zona === "cba"
                  ? "Córdoba Capital - Envío gratuito"
                  : "Resto del país - Envío incluido"}
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold">Monto pagado:</p>
              <p className="text-lg font-bold text-primary">
                ${orderData?.monto_final?.toLocaleString("es-AR")}
              </p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground text-center">
            Recibirás tu Buzzy Twist en 3-5 días hábiles. ¡Gracias por tu compra!
          </p>
          <Button onClick={() => router.push("/")} className="w-full">
            Volver al inicio
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center p-6 bg-background">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6 flex flex-col items-center gap-4">
              <Loader2 className="w-12 h-12 animate-spin text-primary" />
              <p className="text-lg font-semibold">Cargando...</p>
            </CardContent>
          </Card>
        </div>
      }
    >
      <SuccessPageContent />
    </Suspense>
  )
}
