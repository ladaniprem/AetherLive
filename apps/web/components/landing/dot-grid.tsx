"use client"

import { useEffect, useRef } from "react"

export function DotGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animationId: number

    const resize = () => {
      const dpr = window.devicePixelRatio || 1
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      ctx.scale(dpr, dpr)
    }

    const DOT_SIZE = 1.5
    const SPACING = 32
    const dots: { x: number; y: number; phase: number }[] = []

    const initDots = () => {
      dots.length = 0
      const w = canvas.getBoundingClientRect().width
      const h = canvas.getBoundingClientRect().height
      for (let x = SPACING; x < w; x += SPACING) {
        for (let y = SPACING; y < h; y += SPACING) {
          dots.push({ x, y, phase: Math.random() * Math.PI * 2 })
        }
      }
    }

    const draw = (time: number) => {
      const w = canvas.getBoundingClientRect().width
      const h = canvas.getBoundingClientRect().height
      ctx.clearRect(0, 0, w, h)

      for (const dot of dots) {
        const pulse = 0.15 + 0.12 * Math.sin(time * 0.0008 + dot.phase)
        ctx.fillStyle = `rgba(59, 130, 246, ${pulse})`
        ctx.beginPath()
        ctx.arc(dot.x, dot.y, DOT_SIZE, 0, Math.PI * 2)
        ctx.fill()
      }

      animationId = requestAnimationFrame(draw)
    }

    const handleResize = () => {
      resize()
      initDots()
    }

    const start = () => {
      resize()
      initDots()
      animationId = requestAnimationFrame(draw)
      window.addEventListener("resize", handleResize)
    }

    let idleId: number | undefined
    let timeoutId: ReturnType<typeof setTimeout> | undefined
    if (typeof window.requestIdleCallback === "function") {
      idleId = window.requestIdleCallback(start, { timeout: 2000 })
    } else {
      timeoutId = setTimeout(start, 200)
    }

    return () => {
      cancelAnimationFrame(animationId)
      if (idleId !== undefined) window.cancelIdleCallback(idleId)
      if (timeoutId !== undefined) clearTimeout(timeoutId)
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 h-full w-full will-change-transform"
      style={{ maskImage: "linear-gradient(to bottom, black 50%, transparent 90%)" }}
    />
  )
}
