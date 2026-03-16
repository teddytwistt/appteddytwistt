"use client"

import { useRef, useEffect, useState } from "react"
import dynamic from "next/dynamic"

const AnimationCanvas = dynamic(
  () => import("./animation-canvas").then(mod => ({ default: mod.AnimationCanvas })),
  { ssr: false }
)

export function BuzzyStory() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const [isDesktop, setIsDesktop] = useState(false)

  useEffect(() => {
    setIsDesktop(window.innerWidth >= 1024)
  }, [])

  if (!isDesktop) return null

  return (
    <section
      ref={sectionRef}
      style={{ minHeight: "300vh" }}
      className="relative border-t border-border"
    >
      <div className="sticky top-0 h-screen flex items-center overflow-visible">
        <div className="w-full max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">

            {/* Story — left */}
            <div className="relative space-y-6 order-2 lg:order-1">
              <div className="absolute -top-4 -left-4 w-20 h-20 bg-primary/10 rounded-full blur-2xl" />
              <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl" />
              <div className="relative space-y-6">
                <div className="space-y-3">
                  <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-balance">
                    La Historia de <span className="text-primary">BUZZY</span>
                  </h2>
                  <div className="w-16 h-1 bg-gradient-to-r from-primary via-cyan-400 to-primary rounded-full" />
                </div>
                <div className="space-y-4">
                  <p className="text-base sm:text-lg text-muted-foreground leading-relaxed text-pretty">
                    Dicen que los ositos de peluche viven de cariño, pero{" "}
                    <span className="text-primary font-bold">BUZZY</span> tuvo que aprender a vivir sin él. Fue
                    abandonado, obligado a hacerse fuerte en un mundo enorme para él.
                  </p>
                  <p className="text-base sm:text-lg text-foreground leading-relaxed text-pretty font-medium">
                    Hoy, rescatado y renovado, regresa no solo como una pieza de colección, sino como un símbolo de
                    resistencia y ternura.
                  </p>
                  <p className="text-base sm:text-lg text-muted-foreground leading-relaxed text-pretty">
                    <span className="text-primary font-bold">BUZZY</span> está listo para una nueva historia a tu
                    lado… y para demostrar su fuerza como Grinder.
                  </p>
                </div>
                <div className="flex gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse delay-75" />
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse delay-150" />
                </div>
              </div>
            </div>

            {/* Animation — right */}
            <div className="order-1 lg:order-2 flex justify-center overflow-visible">
              <AnimationCanvas containerRef={sectionRef} />
            </div>

          </div>
        </div>
      </div>
    </section>
  )
}
