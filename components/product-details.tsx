import { Check } from "lucide-react"

export function ProductDetails() {
  const features = [
    "Figura de vinilo de alta calidad con acabado brillante",
    "Dos tamaños incluidos: Grande (20cm) y Mini (10cm)",
    "Packaging diseñado exclusivamente con patrones únicos",
    "Caja con certificado de autenticidad numerado",
    "Edición limitada a solo 900 unidades mundialmente",
    "Diseño exclusivo por artistas urbanos reconocidos",
  ]

  return (
    <section className="py-24 bg-card/30 border-y border-border">
      <div className="container px-4">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-start">
            <div className="space-y-6">
              <div className="space-y-3">
                <h2 className="text-4xl font-black text-balance">
                  Una Pieza de <span className="text-primary">Colección</span>
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed text-pretty">
                  BUZZY × TEDDYTWIST representa la fusión perfecta entre el arte urbano y el diseño de colección. Cada
                  figura es fabricada con precisión excepcional y atención meticulosa al detalle.
                </p>
              </div>

              <div className="space-y-4">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 border border-primary flex items-center justify-center mt-0.5">
                      <Check className="w-4 h-4 text-primary" />
                    </div>
                    <p className="text-foreground leading-relaxed">{feature}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-card border border-border rounded-lg p-6 space-y-4">
                <h3 className="text-2xl font-black">Sobre el Artista</h3>
                <p className="text-muted-foreground leading-relaxed">
                  TeddyTwist es un colectivo de artistas reconocidos en la escena del street art y designer toys. Su
                  trabajo ha sido exhibido en galerías de Nueva York, Tokio y Londres.
                </p>
                <div className="flex items-center gap-3 pt-2">
                  <div className="w-12 h-12 rounded-full bg-primary/20 border-2 border-primary" />
                  <div>
                    <p className="font-bold">TeddyTwist Collective</p>
                    <p className="text-sm text-muted-foreground">Designer Toys • Street Art</p>
                  </div>
                </div>
              </div>

              <div className="bg-accent/20 border border-accent rounded-lg p-6 space-y-3">
                <h3 className="text-xl font-black text-accent-foreground">Información de Envío</h3>
                <ul className="space-y-2 text-sm text-accent-foreground/90">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>Envío asegurado incluido</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>Entrega en 3-5 días hábiles</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>Packaging premium anti-daños</span>
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
