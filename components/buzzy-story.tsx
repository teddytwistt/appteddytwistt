export function BuzzyStory() {
  return (
    <section className="py-12 sm:py-24 border-t border-border">
      <div className="w-full max-w-7xl mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            {/* Decorative elements */}
            <div className="absolute -top-4 -left-4 w-20 h-20 bg-primary/10 rounded-full blur-2xl" />
            <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl" />

            {/* Content card */}
            <div className="relative bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm border border-border rounded-2xl p-6 sm:p-10 space-y-6">
              <div className="text-center space-y-3">
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-balance">
                  La Historia de <span className="text-primary">BUZZY</span>
                </h2>
                <div className="w-16 h-1 bg-gradient-to-r from-primary via-cyan-400 to-primary mx-auto rounded-full" />
              </div>

              <div className="space-y-4 text-center">
                <p className="text-base sm:text-lg lg:text-xl text-muted-foreground leading-relaxed text-pretty">
                  Dicen que los ositos de peluche viven de cariño, pero{" "}
                  <span className="text-primary font-bold">BUZZY</span> tuvo que aprender a vivir sin él. Fue
                  abandonado, obligado a hacerse fuerte en un mundo enorme para él.
                </p>

                <p className="text-base sm:text-lg lg:text-xl text-foreground leading-relaxed text-pretty font-medium">
                  Hoy, rescatado y renovado, regresa no solo como una pieza de colección, sino como un símbolo de
                  resistencia y ternura.
                </p>

                <p className="text-base sm:text-lg lg:text-xl text-muted-foreground leading-relaxed text-pretty">
                  <span className="text-primary font-bold">BUZZY</span> está listo para una nueva historia a tu lado… y
                  para demostrar su fuerza como Grinder.
                </p>
              </div>

              {/* Decorative stars */}
              <div className="flex justify-center gap-3 pt-4">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse delay-75" />
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse delay-150" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
