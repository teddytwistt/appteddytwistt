"use client"

import { useEffect } from "react"
import Lenis from "lenis"

export function SmoothScroll() {
  useEffect(() => {
    // Initialize Lenis
    const lenis = new Lenis({
      duration: 1.2, // Duration of scroll animation (in seconds)
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Custom easing function
      orientation: "vertical", // Scroll direction
      smoothWheel: true, // Enable smooth scrolling for mouse wheel events
      wheelMultiplier: 1, // Multiplier for wheel events
      touchMultiplier: 2, // Multiplier for touch events
      infinite: false, // Disable infinite scroll
    })

    // Animation frame loop
    function raf(time: number) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }

    requestAnimationFrame(raf)

    // Cleanup
    return () => {
      lenis.destroy()
    }
  }, [])

  return null
}
