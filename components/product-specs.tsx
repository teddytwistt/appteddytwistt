"use client"

import { Button } from "@/components/ui/button"
import { Instagram, MessageCircle } from "lucide-react"
import { useRef, useState, useEffect } from "react"

interface ProductSpecsProps {
  onAdoptClick?: () => void
}

export function ProductSpecs({ onAdoptClick }: ProductSpecsProps) {
  const imageRef = useRef<HTMLDivElement>(null)
  const [transform, setTransform] = useState({ rotateX: 0, rotateY: 0, scale: 1 })
  const [isMobile, setIsMobile] = useState(false)

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 768 || "ontouchstart" in window
      setIsMobile(mobile)
    }
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // Mouse effect for desktop
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isMobile) return // Don't use mouse effect on mobile

    if (!imageRef.current) return

    const rect = imageRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const centerX = rect.width / 2
    const centerY = rect.height / 2

    const rotateX = ((y - centerY) / centerY) * -15
    const rotateY = ((x - centerX) / centerX) * 15

    setTransform({ rotateX, rotateY, scale: 1.05 })
  }

  const handleMouseLeave = () => {
    if (isMobile) return // Don't reset on mobile
    setTransform({ rotateX: 0, rotateY: 0, scale: 1 })
  }

  const specs = [
    { label: "Material", value: "Plástico" },
    { label: "Dimensiones", value: "80x80mm" },
    { label: "Color", value: "Turquesa, rosa y blanco" },
    { label: "Sistema", value: "Imantado con neodimio y cierre hermético" },
    { label: "Packaging", value: "Caja de colección con diseño exclusivo" },
    { label: "Fabricación", value: "Impresión 3D" },
  ]

  return (
    <section className="py-24 bg-black">
      <div className="container px-4">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="text-left space-y-2 max-w-2xl">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white">Especificaciones</h2>
            <p className="text-lg sm:text-xl text-gray-400">
              Diseñado y fabricado con los más altos estándares de calidad.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {specs.map((spec, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-br from-zinc-900/80 to-zinc-900/40 border border-cyan-500/30 rounded-lg p-6 space-y-2 hover:border-cyan-400 hover:shadow-lg hover:shadow-cyan-500/20 transition-all duration-300"
                >
                  <p className="text-xs text-cyan-400 font-bold uppercase tracking-wider">{spec.label}</p>
                  <p className="text-white font-medium text-base">{spec.value}</p>
                </div>
              ))}
            </div>

            <div className="relative flex justify-center lg:justify-end items-center perspective-1000">
              <div
                ref={imageRef}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                className={isMobile ? "animate-float-gentle" : "cursor-pointer"}
                style={
                  isMobile
                    ? {
                        transformStyle: "preserve-3d",
                      }
                    : {
                        transform: `perspective(1000px) rotateX(${transform.rotateX}deg) rotateY(${transform.rotateY}deg) scale(${transform.scale})`,
                        transition: "transform 0.2s ease-out",
                        transformStyle: "preserve-3d",
                      }
                }
              >
                <img
                  src="/images/recurso-207depiece.webp"
                  alt="Despiece del producto TeddyTwist mostrando componentes"
                  className="w-full max-w-md h-auto object-contain select-none"
                  draggable="false"
                  style={{
                    filter: `drop-shadow(0 ${isMobile || transform.scale === 1.05 ? "30px" : "20px"} ${isMobile || transform.scale === 1.05 ? "40px" : "30px"} rgba(6, 182, 212, ${isMobile || transform.scale === 1.05 ? "0.4" : "0.2"}))`,
                    transition: "filter 0.2s ease-out",
                  }}
                />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-cyan-900/30 via-purple-900/20 to-pink-900/30 border border-cyan-500/20 rounded-2xl p-8 sm:p-12 lg:p-16 text-center space-y-8">
            <div className="space-y-4">
              <h3 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white">Solo 900 Unidades</h3>
              <p className="text-base sm:text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed">
                Esta es tu oportunidad de poseer una pieza única de arte coleccionable. Una vez vendidas, nunca volverán
                a estar disponibles.
              </p>
            </div>

            <div className="flex flex-col items-center gap-6 pt-4">
              <Button
                size="lg"
                className="text-lg font-bold h-14 bg-cyan-400 hover:bg-cyan-500 text-black min-w-72 rounded-md"
                onClick={onAdoptClick}
              >
                ADOPTAR A BUZZY
              </Button>

              <p className="text-sm sm:text-base text-gray-300">
                Envío gratuito dentro de Córdoba capital • Garantía de un mes
              </p>

              <div className="flex items-center justify-center gap-4 pt-2">
                <Button
                  variant="outline"
                  size="lg"
                  className="gap-2 bg-transparent border-none hover:bg-white/10"
                  asChild
                >
                  <a href="https://www.instagram.com/teddytwist_/" target="_blank" rel="noopener noreferrer">
                    <Instagram className="w-5 h-5" />
                    Síguenos en Instagram
                  </a>
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  className="gap-2 bg-transparent border-none hover:bg-white/10"
                  asChild
                >
                  <a
                    href="https://wa.me/5493516353296?text=Hola%2C%20me%20gustaria%20adoptar%20un%20osito%20de%20peluche%F0%9F%A7%B8"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MessageCircle className="w-5 h-5" />
                    Consultas
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer className="mt-24 border-t border-zinc-800 py-12">
        <div className="container px-4">
          <div className="max-w-4xl mx-auto text-center space-y-4">
            <div className="flex items-center justify-center gap-3">
              <img src="/images/logo-alpha.webp" alt="TeddyTwist Logo" className="w-12 h-12 object-contain" />
              <span className="text-2xl font-black text-white">TEDDYTWIST</span>
            </div>
            <p className="text-sm text-gray-400">© 2025 TeddyTwist. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </section>
  )
}
