"use client"

import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Clock } from "lucide-react"

export default function PendingPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <Clock className="w-16 h-16 text-yellow-500" />
          </div>
          <CardTitle className="text-center text-2xl">Pago pendiente</CardTitle>
          <CardDescription className="text-center">
            Tu pago está siendo procesado. Te notificaremos por email cuando se confirme.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button onClick={() => router.push("/")} className="w-full" size="lg">
            Volver al inicio
          </Button>
          <p className="text-sm text-muted-foreground text-center">
            Esto puede tomar unos minutos. Recibirás un correo con la confirmación.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
