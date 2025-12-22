"use client"

import type React from "react"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CheckCircle2, Loader2, XCircle, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { getNombreProvincias, getLocalidadesByProvincia } from "@/lib/data/argentina-locations"

function SuccessPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [validationStatus, setValidationStatus] = useState<"loading" | "success" | "error">("loading")
  const [validationMessage, setValidationMessage] = useState("")
  const [orderData, setOrderData] = useState<any>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [emailDebugInfo, setEmailDebugInfo] = useState<any>(null)

  // Form data
  const [formData, setFormData] = useState({
    nombre_apellido: "",
    email: "",
    telefono: "",
    dni: "",
    provincia: "",
    ciudad: "",
    direccion_completa: "",
    comentarios: "",
  })

  // Localidades dinámicas según provincia seleccionada
  const [localidadesDisponibles, setLocalidadesDisponibles] = useState<string[]>([])

  // Si es zona Córdoba, setear valores por defecto
  useEffect(() => {
    if (orderData?.zona === "cba") {
      setFormData(prev => ({
        ...prev,
        provincia: "Córdoba",
        ciudad: "Córdoba"
      }))
    }
  }, [orderData?.zona])

  useEffect(() => {
    const validatePayment = async () => {
      const paymentId = searchParams.get("payment_id")
      const preferenceId = searchParams.get("preference_id")

      if (!paymentId || !preferenceId) {
        setValidationStatus("error")
        setValidationMessage("Faltan parámetros de pago")
        return
      }

      try {
        const response = await fetch(`/api/payment/validate?payment_id=${paymentId}&preference_id=${preferenceId}`)
        const data = await response.json()

        if (data.success) {
          setValidationStatus("success")
          setValidationMessage(data.message)
          setOrderData({ ...data.pedido, payment_id: paymentId })
        } else {
          setValidationStatus("error")
          setValidationMessage(data.message || "El pago no pudo ser validado")
        }
      } catch (error) {
        console.error("[v0] Validation error:", error)
        setValidationStatus("error")
        setValidationMessage("Error al validar el pago")
      }
    }

    validatePayment()
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const response = await fetch("/api/shipping", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          payment_id: orderData.payment_id,
          ...formData,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Error al enviar el formulario")
      }

      // Guardar info de debug del email
      setEmailDebugInfo(data)
      setSubmitSuccess(true)
    } catch (error) {
      console.error("[v0] Form submission error:", error)
      setSubmitError(error instanceof Error ? error.message : "Error al enviar el formulario")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))

    // Si cambió la provincia, actualizar las localidades disponibles y resetear ciudad
    if (field === "provincia") {
      const localidades = getLocalidadesByProvincia(value)
      setLocalidadesDisponibles(localidades)
      setFormData(prev => ({ ...prev, ciudad: "" }))
    }
  }

  if (validationStatus === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-background">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
            <p className="text-lg font-semibold">Validando tu pago...</p>
            <p className="text-sm text-muted-foreground text-center">Por favor espera mientras verificamos tu compra</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (validationStatus === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-background">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <XCircle className="w-16 h-16 text-red-500" />
            </div>
            <CardTitle className="text-center text-2xl">Error en el pago</CardTitle>
            <CardDescription className="text-center">{validationMessage}</CardDescription>
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

  if (submitSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-background">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <CheckCircle2 className="w-16 h-16 text-green-500" />
            </div>
            <CardTitle className="text-center text-2xl">¡Compra completada!</CardTitle>
            <CardDescription className="text-center">
              Tu pedido ha sido registrado exitosamente. Recibirás un correo con los detalles de tu compra.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 space-y-3">
              <div>
                <p className="text-sm font-semibold">Número de orden:</p>
                <p className="text-lg font-mono">#{orderData.id}</p>
              </div>
              {orderData.numero_serie && (
                <div>
                  <p className="text-sm font-semibold">Número de serie:</p>
                  <p className="text-lg font-mono">{String(orderData.numero_serie).padStart(3, "0")}/900</p>
                </div>
              )}
            </div>
            <p className="text-sm text-muted-foreground text-center">
              Recibirás tu Buzzy Twist en 3-5 días hábiles. ¡Gracias por tu compra!
            </p>

            {/* Debug info del email */}
            {emailDebugInfo && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-xs">
                <p className="font-bold mb-2">Estado del Email (DEBUG):</p>
                <p><strong>Status:</strong> {emailDebugInfo.email_status || 'no info'}</p>
                {emailDebugInfo.email_error && (
                  <p className="text-red-600"><strong>Error:</strong> {emailDebugInfo.email_error}</p>
                )}
              </div>
            )}

            <Button onClick={() => router.push("/")} className="w-full">
              Volver al inicio
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background py-12">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <CheckCircle2 className="w-16 h-16 text-green-500" />
          </div>
          <CardTitle className="text-center text-2xl">¡Pago aprobado!</CardTitle>
          <CardDescription className="text-center">
            Completa tus datos de envío para recibir tu Buzzy Twist
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="mb-6 bg-primary/10 border-primary/20">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <span className="font-semibold">Zona:</span>{" "}
              {orderData?.zona === "cba" ? "Córdoba Capital - Envío gratuito" : "Resto del país - Envío incluido"}
              <br />
              <span className="font-semibold">Monto pagado:</span> ${orderData?.monto_final?.toLocaleString("es-AR")}
            </AlertDescription>
          </Alert>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nombre_apellido">Nombre y apellido *</Label>
                <Input
                  id="nombre_apellido"
                  required
                  value={formData.nombre_apellido}
                  onChange={(e) => handleInputChange("nombre_apellido", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefono">Teléfono / WhatsApp *</Label>
                <Input
                  id="telefono"
                  type="tel"
                  required
                  value={formData.telefono}
                  onChange={(e) => handleInputChange("telefono", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dni">DNI *</Label>
                <Input
                  id="dni"
                  required
                  value={formData.dni}
                  onChange={(e) => handleInputChange("dni", e.target.value)}
                />
              </div>

              {/* Provincia - Bloqueado si es Córdoba */}
              <div className="space-y-2">
                <Label htmlFor="provincia">Provincia *</Label>
                {orderData?.zona === "cba" ? (
                  <Input
                    id="provincia"
                    required
                    value="Córdoba"
                    disabled
                    className="bg-muted"
                  />
                ) : (
                  <Select
                    value={formData.provincia}
                    onValueChange={(value) => handleInputChange("provincia", value)}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona tu provincia" />
                    </SelectTrigger>
                    <SelectContent>
                      {getNombreProvincias().map((prov) => (
                        <SelectItem key={prov} value={prov}>
                          {prov}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              {/* Ciudad/Localidad - Bloqueado si es Córdoba */}
              <div className="space-y-2">
                <Label htmlFor="ciudad">Ciudad / Localidad *</Label>
                {orderData?.zona === "cba" ? (
                  <Input
                    id="ciudad"
                    required
                    value="Córdoba"
                    disabled
                    className="bg-muted"
                  />
                ) : (
                  <Select
                    value={formData.ciudad}
                    onValueChange={(value) => handleInputChange("ciudad", value)}
                    required
                    disabled={!formData.provincia}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={formData.provincia ? "Selecciona tu localidad" : "Primero selecciona provincia"} />
                    </SelectTrigger>
                    <SelectContent>
                      {localidadesDisponibles.map((localidad) => (
                        <SelectItem key={localidad} value={localidad}>
                          {localidad}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="direccion_completa">
                Dirección completa (calle, número, piso/depto, código postal) *
              </Label>
              <Input
                id="direccion_completa"
                required
                value={formData.direccion_completa}
                onChange={(e) => handleInputChange("direccion_completa", e.target.value)}
                placeholder="Ej: Av. Colón 1234, Piso 5 Dto A, CP 5000"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="comentarios">Comentarios / notas de entrega (opcional)</Label>
              <Textarea
                id="comentarios"
                value={formData.comentarios}
                onChange={(e) => handleInputChange("comentarios", e.target.value)}
                placeholder="Información adicional sobre la entrega..."
                rows={3}
              />
            </div>

            {submitError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{submitError}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                "Confirmar datos de envío"
              )}
            </Button>
          </form>
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
