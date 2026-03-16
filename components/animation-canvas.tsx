"use client"

import { useEffect, useRef, useState } from "react"

const TOTAL_FRAMES = 76
const FRAME_W = 1440
const FRAME_H = 1800

export function AnimationCanvas({ containerRef }: { containerRef: React.RefObject<HTMLDivElement | null> }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const framesRef = useRef<(HTMLImageElement | null)[]>(new Array(TOTAL_FRAMES).fill(null))
  const currentFrameRef = useRef(-1)
  const rafRef = useRef<number | null>(null)
  const cssSizeRef = useRef(400) // canvas is square; image is letterboxed inside

  const [loadProgress, setLoadProgress] = useState(0)
  const [loaded, setLoaded] = useState(false)

  const drawFrame = (index: number) => {
    const canvas = canvasRef.current
    const frame = framesRef.current[index]
    if (!canvas || !frame) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    const size = cssSizeRef.current
    ctx.clearRect(0, 0, size, size)
    // Contain the 1440×1800 image inside the square canvas (letterbox)
    const scale = Math.min(size / FRAME_W, size / FRAME_H)
    const dw = FRAME_W * scale
    const dh = FRAME_H * scale
    const dx = (size - dw) / 2
    const dy = (size - dh) / 2
    ctx.drawImage(frame, 0, 0, FRAME_W, FRAME_H, dx, dy, dw, dh)
  }

  // Canvas sizing
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const resize = () => {
      const dpr = window.devicePixelRatio || 1
      const isMobile = window.innerWidth < 1024
      const size = Math.min(
        window.innerWidth * (isMobile ? 0.85 : 0.42),
        window.innerHeight * 0.75,
        520
      )
      cssSizeRef.current = size
      canvas.style.width = `${size}px`
      canvas.style.height = `${size}px`
      canvas.width = Math.round(size * dpr)
      canvas.height = Math.round(size * dpr)
      const ctx = canvas.getContext("2d")
      if (ctx) {
        ctx.scale(dpr, dpr)
        if (currentFrameRef.current >= 0) drawFrame(currentFrameRef.current)
      }
    }
    resize()
    window.addEventListener("resize", resize)
    return () => window.removeEventListener("resize", resize)
  }, [])

  // Preload frames
  useEffect(() => {
    let loadedCount = 0
    const images = new Array(TOTAL_FRAMES).fill(null) as (HTMLImageElement | null)[]
    for (let i = 0; i < TOTAL_FRAMES; i++) {
      const img = new Image()
      img.src = `/_next/image?url=%2Fvideos%2Fframes%2Fframe_${String(i + 1).padStart(4, "0")}.png&w=1080&q=85`
      const onDone = () => {
        loadedCount++
        setLoadProgress(Math.round((loadedCount / TOTAL_FRAMES) * 100))
        if (loadedCount === TOTAL_FRAMES) {
          framesRef.current = images
          setLoaded(true)
        }
      }
      img.onload = onDone
      img.onerror = onDone
      images[i] = img
    }
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [])

  // First frame
  useEffect(() => {
    if (loaded) { currentFrameRef.current = 0; drawFrame(0) }
  }, [loaded])

  // Scroll → frame
  useEffect(() => {
    if (!loaded) return
    const handleScroll = () => {
      const container = containerRef.current
      if (!container) return
      const rect = container.getBoundingClientRect()
      const scrollableHeight = container.offsetHeight - window.innerHeight
      if (scrollableHeight <= 0) return
      const progress = Math.min(1, Math.max(0, -rect.top) / scrollableHeight)
      const frameIndex = Math.min(Math.floor(progress * TOTAL_FRAMES), TOTAL_FRAMES - 1)
      if (frameIndex !== currentFrameRef.current) {
        currentFrameRef.current = frameIndex
        if (rafRef.current) cancelAnimationFrame(rafRef.current)
        rafRef.current = requestAnimationFrame(() => drawFrame(frameIndex))
      }
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    handleScroll()
    return () => {
      window.removeEventListener("scroll", handleScroll)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [loaded, containerRef])

  return (
    <div className="relative flex items-center justify-center">
      {!loaded && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
          <div className="w-32 h-px bg-border overflow-hidden">
            <div className="h-full bg-foreground/40 transition-all duration-100" style={{ width: `${loadProgress}%` }} />
          </div>
          <p className="text-[10px] text-muted-foreground tracking-[0.3em] uppercase">{loadProgress}%</p>
        </div>
      )}
      <canvas ref={canvasRef} style={{ opacity: loaded ? 1 : 0, transition: "opacity 0.5s ease" }} />
    </div>
  )
}
