"use client"

import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { XCircle } from "lucide-react"

export default function FailurePage() {
  const router = useRouter()

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <XCircle className="w-16 h-16 text-red-500" />
          </div>
          <CardTitle className="text-center text-2xl">Pago rechazado</CardTitle>
          <CardDescription className="text-center">
            Tu pago no pudo ser procesado. Por favor, intenta nuevamente con otro método de pago.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button onClick={() => router.push("/")} className="w-full" size="lg">
            Volver a intentar
          </Button>
          <p className="text-sm text-muted-foreground text-center">
            Si el problema persiste, contacta con nuestro soporte.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
