"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, Instagram, ChevronDown, MessageCircle, Tag, X } from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { useState, useEffect, forwardRef, useImperativeHandle } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import Image from "next/image"
import { useRealtimeStock } from "@/hooks/useRealtimeStock"

export const ProductHero = forwardRef<{ openModal: () => void }>(function ProductHero(props, ref) {
  const [mounted, setMounted] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [isHovering, setIsHovering] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isShippingDialogOpen, setIsShippingDialogOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [serialNumber, setSerialNumber] = useState("001/900")
  const [discountCode, setDiscountCode] = useState("")
  const [appliedDiscount, setAppliedDiscount] = useState<{
    code: string
    percentage: number
    id_descuento: number
  } | null>(null)
  const [discountError, setDiscountError] = useState<string | null>(null)
  const [isValidatingDiscount, setIsValidatingDiscount] = useState(false)
  const [basePrice, setBasePrice] = useState<number | null>(null)
  const [outsidePrice, setOutsidePrice] = useState<number | null>(null)
  const [pricesLoaded, setPricesLoaded] = useState(false)
  const [serialLoaded, setSerialLoaded] = useState(false)

  // Hook para obtener stock en tiempo real
  const { stockData } = useRealtimeStock()

  const discountMultiplier = appliedDiscount ? (100 - appliedDiscount.percentage) / 100 : 1
  const discountedBasePrice = basePrice ? Math.round(basePrice * discountMultiplier) : 0
  const discountedOutsidePrice = outsidePrice ? Math.round(outsidePrice * discountMultiplier) : 0

  // Usar los valores del hook de tiempo real
  const stockDisplay = stockData.stockDisplay
  const availableUnits = stockData.available

  useEffect(() => {
    setMounted(true)
    // Detectar si es un dispositivo móvil
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024) // lg breakpoint
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // El stock ahora se actualiza en tiempo real via useRealtimeStock hook
  // Ya no necesitamos polling manual con setInterval

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const response = await fetch("/api/get-prices")
        const data = await response.json()
        if (data.precio_cba && data.precio_interior) {
          setBasePrice(data.precio_cba)
          setOutsidePrice(data.precio_interior)
          setPricesLoaded(true)
        }
      } catch (err) {
        console.error("[v0] Error fetching prices:", err)
        // Set default prices on error
        setBasePrice(27000)
        setOutsidePrice(32000)
        setPricesLoaded(true)
      }
    }

    fetchPrices()
  }, [])

  // Bloquear scroll del body cuando el modal está abierto
  useEffect(() => {
    if (isShippingDialogOpen) {
      document.body.style.overflow = 'hidden'
      document.body.style.paddingRight = 'var(--scrollbar-width, 0px)'
    } else {
      document.body.style.overflow = ''
      document.body.style.paddingRight = ''
    }

    return () => {
      document.body.style.overflow = ''
      document.body.style.paddingRight = ''
    }
  }, [isShippingDialogOpen])

  useEffect(() => {
    if (isShippingDialogOpen) {
      setSerialLoaded(false)
      fetch("/api/get-next-serial")
        .then((res) => res.json())
        .then((data) => {
          if (data.serialNumber) {
            setSerialNumber(data.serialNumber)
            // Trigger animation after a small delay
            setTimeout(() => setSerialLoaded(true), 100)
          }
        })
        .catch((err) => {
          console.error("[v0] Error fetching serial number:", err)
          setSerialLoaded(true)
        })
    } else {
      setSerialLoaded(false)
    }
  }, [isShippingDialogOpen])

  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) {
      setDiscountError("Por favor ingresa un código")
      return
    }

    console.log("[v0] Applying discount code:", discountCode)
    setIsValidatingDiscount(true)
    setDiscountError(null)

    try {
      console.log("[v0] Sending request to /api/validate-discount")
      const response = await fetch("/api/validate-discount", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code: discountCode }),
      })

      console.log("[v0] Response status:", response.status)
      const data = await response.json()
      console.log("[v0] Response data:", data)

      if (!response.ok) {
        console.log("[v0] Discount validation failed:", data.error)
        setDiscountError(data.error || "Código inválido")
        setAppliedDiscount(null)
      } else {
        console.log("[v0] Discount applied successfully:", data)
        setAppliedDiscount({
          code: data.code,
          percentage: data.discount_percentage,
          id_descuento: data.id_descuento,
        })
        setDiscountError(null)
      }
    } catch (err) {
      console.error("[v0] Error validating discount:", err)
      setDiscountError("Error al validar el código")
      setAppliedDiscount(null)
    } finally {
      setIsValidatingDiscount(false)
    }
  }

  const handleRemoveDiscount = () => {
    setAppliedDiscount(null)
    setDiscountCode("")
    setDiscountError(null)
  }

  const handleShippingSelection = async (location: "cordoba" | "outside") => {
    setIsProcessing(true)
    setError(null)

    try {
      const zona = location === "cordoba" ? "cba" : "interior"

      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          zona,
          discountCode: appliedDiscount?.code || null,
          discountPercentage: appliedDiscount?.percentage || null,
          idDescuento: appliedDiscount?.id_descuento || null,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Error al procesar el pago")
      }

      window.location.href = data.init_point
    } catch (err) {
      console.error("[v0] Checkout error:", err)
      setError(err instanceof Error ? err.message : "Error al procesar el pago")
      setIsProcessing(false)
    }
  }

  useImperativeHandle(ref, () => ({
    openModal: () => setIsShippingDialogOpen(true),
  }))

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `repeating-linear-gradient(
            45deg,
            transparent,
            transparent 35px,
            oklch(0.68 0.19 200) 35px,
            oklch(0.68 0.19 200) 37px
          )`,
          }}
        />
      </div>

      <div className="w-full max-w-7xl mx-auto relative z-10 px-4 py-12 md:py-24">
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2 items-center">
          <div className="relative">
            <div className="absolute -inset-4 bg-primary/20 blur-3xl rounded-full" />
            <div
              className="relative bg-card/50 backdrop-blur-sm border border-border rounded-lg p-2 sm:p-4 md:p-8 cursor-pointer"
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
            >
              {isMobile ? (
                <video
                  src="/videos/video_principal_web.mp4"
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-auto max-h-[60vh] sm:max-h-none object-contain"
                />
              ) : isHovering ? (
                <video
                  src="/videos/animation_teddytwist.mp4"
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-auto max-h-[60vh] sm:max-h-none object-contain"
                />
              ) : (
                <img
                  src="/images/screenshot001.png"
                  alt="BUZZY × TEDDYTWIST Limited Edition"
                  className="w-full h-auto max-h-[60vh] sm:max-h-none object-contain"
                />
              )}
            </div>
          </div>

          <div className="space-y-4 sm:space-y-6">
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <Badge className="bg-accent text-accent-foreground border-0 text-sm sm:text-lg font-black px-3 sm:px-6 py-1 sm:py-2">
                EDICIÓN LIMITADA
              </Badge>
              <div className="flex flex-col items-start gap-1">
                <Badge className="bg-gradient-to-br from-yellow-400 to-yellow-600 text-black border-0 text-sm sm:text-lg font-black px-3 sm:px-6 py-1 sm:py-2 shadow-lg">
                  {mounted ? stockDisplay : "900/900"}
                </Badge>
                <span className="text-xs text-muted-foreground font-medium pl-1">Unidades disponibles</span>
              </div>
            </div>

            <div className="space-y-2">
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black tracking-tight text-balance">
                BUZZY
                <span className="block text-primary">× TEDDYTWIST</span>
              </h1>
              <p className="text-base sm:text-xl text-muted-foreground">
                "Rescatamos ositos de peluche que a menudo son abandonados y los convertimos en pieza de colección"
              </p>
            </div>

            <div className="flex items-baseline gap-3 sm:gap-4">
              {pricesLoaded && basePrice ? (
                <span className="text-3xl sm:text-5xl font-black text-primary">${basePrice.toLocaleString()}</span>
              ) : (
                <div className="h-12 w-32 bg-muted animate-pulse rounded"></div>
              )}
            </div>

            <div className="flex items-start gap-2 bg-accent/20 border border-accent rounded-lg p-3 sm:p-4">
              <AlertCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
              <p className="text-xs sm:text-sm text-accent-foreground leading-relaxed">
                <strong>{availableUnits} unidades en el mundo.</strong> Una vez agotado, nunca volverá a estar
                disponible.
              </p>
            </div>

            <div className="space-y-2 sm:space-y-3 pt-2 sm:pt-4">
              <Dialog open={isShippingDialogOpen} onOpenChange={setIsShippingDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    size="lg"
                    className="w-full text-base sm:text-lg font-bold h-12 sm:h-14 bg-primary hover:bg-primary/90 text-primary-foreground"
                    disabled={isProcessing}
                  >
                    {isProcessing ? "PROCESANDO..." : "ADOPTAR A BUZZY"}
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
                  <div className="grid md:grid-cols-2 gap-4 md:gap-6 items-start">
                    <div className="flex flex-col justify-center order-2 md:order-1">
                      <DialogHeader>
                        <DialogTitle className="text-lg sm:text-xl md:text-2xl font-bold text-left">
                          Selecciona tu ubicación
                        </DialogTitle>
                        <DialogDescription className="text-sm sm:text-base text-left pt-2">
                          ¿El envío es dentro de Córdoba capital o fuera de Córdoba?
                        </DialogDescription>
                      </DialogHeader>
                      {error && (
                        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm mt-4">
                          {error}
                        </div>
                      )}
                      <div className="grid gap-4 py-4">
                        <Button
                          onClick={() => handleShippingSelection("cordoba")}
                          size="lg"
                          className="w-full text-base font-bold bg-primary hover:bg-primary/90 h-auto py-4"
                          disabled={isProcessing}
                        >
                          <div className="flex flex-col items-center justify-center gap-1.5 w-full">
                            <span className="text-base">Córdoba Capital</span>
                            <span className="text-sm font-normal opacity-90">
                              {basePrice ? (
                                appliedDiscount ? (
                                  <>
                                    <span className="line-through mr-2">${basePrice.toLocaleString()}</span>
                                    <span className="font-bold">${discountedBasePrice.toLocaleString()}</span>
                                  </>
                                ) : (
                                  `$${basePrice.toLocaleString()}`
                                )
                              ) : (
                                "Cargando..."
                              )}{" "}
                              - Envío gratuito
                            </span>
                          </div>
                        </Button>
                        <Button
                          onClick={() => handleShippingSelection("outside")}
                          size="lg"
                          variant="outline"
                          className="w-full text-base font-bold h-auto py-4"
                          disabled={isProcessing}
                        >
                          <div className="flex flex-col items-center justify-center gap-1.5 w-full">
                            <span className="text-base">Fuera de Córdoba</span>
                            <span className="text-sm font-normal opacity-70">
                              {outsidePrice ? (
                                appliedDiscount ? (
                                  <>
                                    <span className="line-through mr-2">${outsidePrice.toLocaleString()}</span>
                                    <span className="font-bold">${discountedOutsidePrice.toLocaleString()}</span>
                                  </>
                                ) : (
                                  `$${outsidePrice.toLocaleString()}`
                                )
                              ) : (
                                "Cargando..."
                              )}{" "}
                              - Envío incluido
                            </span>
                          </div>
                        </Button>
                      </div>

                      <div className="space-y-2 pt-2 border-t">
                        <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                          <Tag className="w-4 h-4" />
                          ¿Tenés un código de descuento?
                        </label>
                        {!appliedDiscount ? (
                          <div className="flex gap-2">
                            <Input
                              placeholder="Ingresa tu código"
                              value={discountCode}
                              onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  handleApplyDiscount()
                                }
                              }}
                              disabled={isValidatingDiscount}
                              className="uppercase"
                            />
                            <Button
                              onClick={handleApplyDiscount}
                              disabled={isValidatingDiscount || !discountCode.trim()}
                              variant="outline"
                              size="sm"
                            >
                              {isValidatingDiscount ? "..." : "Aplicar"}
                            </Button>
                          </div>
                        ) : (
                          <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center justify-between">
                            <div>
                              <p className="font-bold text-sm">Código aplicado: {appliedDiscount.code}</p>
                              <p className="text-xs">Descuento del {appliedDiscount.percentage}% aplicado</p>
                            </div>
                            <Button onClick={handleRemoveDiscount} variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                        {discountError && <p className="text-xs text-red-600">{discountError}</p>}
                      </div>
                    </div>

                    <div className="flex flex-col items-center justify-start order-1 md:order-2">
                      <div className="relative w-full max-w-[280px] sm:max-w-sm mx-auto">
                        <Image
                          src="/images/sin-20numero.webp"
                          alt="Buzzy con tarjeta"
                          width={400}
                          height={600}
                          className="w-full h-auto object-contain"
                        />
                        <div className="absolute left-1/2 -translate-x-1/2 bottom-[20%]">
                          <p
                            className={`text-black font-black text-base sm:text-lg md:text-xl text-center leading-none whitespace-nowrap ${
                              serialLoaded ? 'animate-serial-appear' : 'opacity-0'
                            }`}
                          >
                            {mounted ? serialNumber : "001/900"}
                          </p>
                        </div>
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground text-center mt-1">Numero de serie que adquirirás</p>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <p className="text-center text-xs sm:text-sm text-muted-foreground">
                Envío gratuito dentro de Córdoba capital • Garantía de un mes
              </p>

              <Collapsible open={isOpen} onOpenChange={setIsOpen} className="space-y-2">
                <p className="text-center text-xs sm:text-sm text-muted-foreground">
                  Con adoptar a BUZZY, ya estás participando por más de 3000 USD en efectivo.{" "}
                  <CollapsibleTrigger asChild>
                    <button className="text-primary hover:underline font-semibold inline-flex items-center">
                      Revisar las reglas del sorteo
                      <ChevronDown className={`w-4 h-4 ml-1 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                    </button>
                  </CollapsibleTrigger>
                </p>
                <CollapsibleContent className="bg-card/50 backdrop-blur-sm border border-border rounded-lg p-4 sm:p-6 space-y-3 sm:space-y-4 text-xs sm:text-sm leading-relaxed">
                  <h3 className="font-bold text-lg sm:text-xl text-primary">Más de $3000 USD en premios!!</h3>

                  <div>
                    <h4 className="font-bold text-sm sm:text-base mb-2">¿Cómo participar del sorteo?</h4>
                    <p className="mb-4">
                      ¡Es muy fácil! Con la compra de un TeddyTwist, automáticamente estás participando en todos los
                      sorteos. El número de serie de "edición limitada" del 001 al 900 que sale en el packaging del
                      producto, será tu número con el que participarás en los sorteos. Cuantas más unidades se vendan,
                      mayores serán los premios.
                    </p>
                    <p>
                      Si no ganas el primer premio, ¡no te preocupes! Tenés más oportunidades en los siguientes sorteos.
                      La suma total de los premios es de $3,150 USD.
                    </p>
                  </div>

                  <div className="space-y-1 border-l-4 border-primary pl-4">
                    <p className="font-semibold">Sorteo de $150 USD al vender 150 unidades</p>
                    <p className="font-semibold">Sorteo de $300 USD al vender 300 unidades</p>
                    <p className="font-semibold">Sorteo de $450 USD al vender 450 unidades</p>
                    <p className="font-semibold">Sorteo de $600 USD al vender 600 unidades</p>
                    <p className="font-semibold">Sorteo de $750 USD al vender 750 unidades</p>
                    <p className="font-semibold">Sorteo de $900 USD al vender 900 unidades</p>
                  </div>

                  <p className="text-left text-xs sm:text-sm">Hasta que no se cumplan dichas ventas no habrá sorteo.</p>

                  <p className="font-bold text-center text-base sm:text-lg text-primary">
                    ¡No te quedes sin tu TeddyTwist y participa por increíbles premios!
                  </p>
                </CollapsibleContent>
              </Collapsible>

              <div className="flex gap-3 justify-center pt-4">
                <Button
                  asChild
                  variant="ghost"
                  size="lg"
                  className="text-sm sm:text-base font-semibold h-10 sm:h-12 bg-transparent hover:bg-accent/50"
                >
                  <a href="https://www.instagram.com/teddytwist_/" target="_blank" rel="noopener noreferrer">
                    <Instagram className="w-5 h-5 mr-2" />
                    Seguinos en Instagram
                  </a>
                </Button>

                <Button
                  asChild
                  variant="ghost"
                  size="lg"
                  className="text-sm sm:text-base font-semibold h-10 sm:h-12 bg-transparent hover:bg-accent/50"
                >
                  <a
                    href="https://wa.me/5493516353296?text=Hola%2C%20me%20gustaria%20adoptar%20un%20osito%20de%20peluche%F0%9F%A7%B8"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MessageCircle className="w-5 h-5 mr-2" />
                    Consultas
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  )
})
