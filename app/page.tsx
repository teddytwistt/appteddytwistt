"use client"

import { ProductHero } from "@/components/product-hero"
import { useRef } from "react"
import dynamic from "next/dynamic"

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
    <main className="min-h-screen bg-background">
      <ProductHero ref={heroRef} />
      <BuzzyStory />
      <ProductGallery />
      <ProductSpecs onAdoptClick={handleAdoptClick} />
    </main>
  )
}
