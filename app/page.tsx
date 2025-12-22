"use client"

import { ProductHero } from "@/components/product-hero"
import { useRef } from "react"
import dynamic from "next/dynamic"
import Script from "next/script"

// Lazy load de componentes que están debajo del fold
const BuzzyStory = dynamic(() => import("@/components/buzzy-story").then(mod => ({ default: mod.BuzzyStory })), {
  loading: () => <div className="min-h-screen" />,
})

const ProductGallery = dynamic(() => import("@/components/product-gallery").then(mod => ({ default: mod.ProductGallery })), {
  loading: () => <div className="min-h-screen" />,
})

const ProductSpecs = dynamic(() => import("@/components/product-specs").then(mod => ({ default: mod.ProductSpecs })), {
  loading: () => <div className="min-h-screen" />,
})

export default function HomePage() {
  const heroRef = useRef<{ openModal: () => void }>(null)

  const handleAdoptClick = () => {
    heroRef.current?.openModal()
    // Scroll to top where the hero section is
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <>
      {/* Schema.org structured data for Google */}
      <Script
        id="schema-org"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "Organization",
                "@id": "https://www.teddytwist.com/#organization",
                name: "TeddyTwist",
                url: "https://www.teddytwist.com",
                logo: {
                  "@type": "ImageObject",
                  url: "https://www.teddytwist.com/images/logo-alpha.webp",
                  width: 1200,
                  height: 630
                },
                sameAs: [
                  "https://www.instagram.com/teddytwist_"
                ]
              },
              {
                "@type": "Product",
                "@id": "https://www.teddytwist.com/#product",
                name: "BUZZY × TEDDYTWIST - Edición Limitada 001/900",
                description: "Figura de colección edición limitada. Picador de cannabis premium con diseño exclusivo de TeddyTwist. Solo 900 unidades disponibles.",
                brand: {
                  "@type": "Brand",
                  name: "TeddyTwist"
                },
                image: [
                  "https://www.teddytwist.com/images/logo-alpha.webp",
                  "https://www.teddytwist.com/images/buzzy-front.webp"
                ],
                offers: {
                  "@type": "Offer",
                  url: "https://www.teddytwist.com",
                  priceCurrency: "ARS",
                  price: "35800",
                  availability: "https://schema.org/LimitedAvailability",
                  seller: {
                    "@id": "https://www.teddytwist.com/#organization"
                  }
                },
                category: "Collectibles",
                itemCondition: "https://schema.org/NewCondition"
              }
            ]
          })
        }}
      />

      <main className="min-h-screen bg-background">
        <ProductHero ref={heroRef} />
        <BuzzyStory />
        <ProductGallery />
        <ProductSpecs onAdoptClick={handleAdoptClick} />
      </main>
    </>
  )
}
