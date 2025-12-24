"use client"

import { useRef } from "react"
import { Check } from "lucide-react"

export function ProductGallery() {
  const videoRef = useRef<HTMLVideoElement>(null)

  const features = [
    "Sticker de regalo de alta calidad con acabado brillante",
    "Packaging diseñado exclusivamente con patrones únicos",
    "Packaging y producto con certificado de autenticidad numerado",
    "Edición limitada a solo 900 unidades mundialmente",
    "Diseño exclusivo por artista 3D",
    "Garantía de un mes",
  ]

  return (
    <section className="py-12 sm:py-24 border-t border-border">
      <div className="w-full max-w-7xl mx-auto px-4">
        <div className="max-w-6xl mx-auto space-y-8 sm:space-y-12">
          <div className="text-center space-y-3 sm:space-y-4">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-balance bg-gradient-to-br from-yellow-400 via-amber-400 to-yellow-600 bg-clip-text text-transparent">
              EDICIÓN LIMITADA
            </h2>
            <p className="text-base sm:text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
              Cada Grinder es una pieza única numerada y producida a baja escala
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 items-start">
            {/* Video Section - Left */}
            <div className="space-y-3 sm:space-y-4">
              <div className="relative w-full bg-card border border-border rounded-lg overflow-hidden max-h-[60vh] sm:max-h-none">
                <video ref={videoRef} className="w-full h-auto object-contain" autoPlay loop muted playsInline>
                  <source src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/video_review_buzzy-Hu7QjQNz5Pz4uAq7mwU27MrAURcA05.mp4" type="video/mp4" />
                  Tu navegador no soporta el elemento de video.
                </video>
              </div>
              <p className="text-center text-sm sm:text-base md:text-lg text-muted-foreground">Review del producto</p>
            </div>

            {/* Product Information - Right */}
            <div className="space-y-5 sm:space-y-6">
              {/* Collection Piece Section */}
              <div className="space-y-4 sm:space-y-6">
                <div className="space-y-2 sm:space-y-3">
                  <h2 className="text-3xl sm:text-4xl font-black text-balance">
                    Una Pieza de <span className="text-primary">Colección</span>
                  </h2>
                  <p className="text-base sm:text-lg text-muted-foreground leading-relaxed text-pretty">
                    El concepto TeddyTwist fue creado y diseñado por un artista 3D con ardua experiencia y atención al
                    detalle.
                  </p>
                </div>

                <div className="space-y-3 sm:space-y-4">
                  {features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-2 sm:gap-3">
                      <div className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-primary/20 border border-primary flex items-center justify-center mt-0.5">
                        <Check className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                      </div>
                      <p className="text-sm sm:text-base text-foreground leading-relaxed">{feature}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* About the Artist Section */}
              <div className="bg-card border border-border rounded-lg p-4 sm:p-6 space-y-3 sm:space-y-4">
                <h3 className="text-xl sm:text-2xl font-black">Sobre el Artista</h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Gonzalo Quaino es un emprendedor y Environment artist, trabaja principalmente en la creación de mundos
                  inmersivos y activos 3D para videojuegos pero también tiene otros proyectos entre manos como
                  TEDDYTWIST.
                </p>
                <div className="flex items-center gap-3 sm:gap-4 pt-2">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden border-2 border-primary flex-shrink-0">
                    <img src="/images/perfil.webp" alt="Gonzalo Quaino" className="w-full h-full object-cover" loading="lazy" />
                  </div>
                  <div>
                    <p className="font-bold text-sm sm:text-base md:text-lg">TEDDYTWIST</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">Gonzalo Quaino</p>
                  </div>
                </div>
              </div>

              {/* Shipping Information Section */}
              <div className="bg-accent/20 border border-accent rounded-lg p-4 sm:p-6 space-y-2 sm:space-y-3">
                <h3 className="text-lg sm:text-xl font-black text-accent-foreground">Información de Envío</h3>
                <ul className="space-y-2 text-xs sm:text-sm text-accent-foreground/90">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>Envío asegurado incluido</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>Entrega entre 3-5 días hábiles</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>Garantía de 1 mes</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
