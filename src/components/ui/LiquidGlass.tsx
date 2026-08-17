'use client'

import { useEffect, useRef } from 'react'

export default function LiquidGlass() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number
    let time = 0

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    // 液态 blob 数据
    const blobs = Array.from({ length: 5 }, (_, i) => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: 150 + Math.random() * 200,
      vx: (Math.random() - 0.5) * 0.8,
      vy: (Math.random() - 0.5) * 0.8,
      hue: 260 + i * 15, // 紫色系电竞感
      phase: Math.random() * Math.PI * 2,
    }))

    const draw = () => {
      time += 0.008
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      blobs.forEach(blob => {
        // 运动
        blob.x += blob.vx + Math.sin(time + blob.phase) * 0.5
        blob.y += blob.vy + Math.cos(time * 0.7 + blob.phase) * 0.5

        // 边界弹跳
        if (blob.x < -blob.r) blob.x = canvas.width + blob.r
        if (blob.x > canvas.width + blob.r) blob.x = -blob.r
        if (blob.y < -blob.r) blob.y = canvas.height + blob.r
        if (blob.y > canvas.height + blob.r) blob.y = -blob.r

        // 液态变形绘制
        const sides = 8
        ctx.beginPath()
        for (let j = 0; j <= sides; j++) {
          const angle = (j / sides) * Math.PI * 2
          const wobble = Math.sin(time * 2 + j * 1.5 + blob.phase) * blob.r * 0.15
          const wobble2 = Math.cos(time * 1.3 + j * 2.1) * blob.r * 0.1
          const r = blob.r + wobble + wobble2
          const px = blob.x + Math.cos(angle) * r
          const py = blob.y + Math.sin(angle) * r

          if (j === 0) ctx.moveTo(px, py)
          else {
            // 用贝塞尔曲线让边缘更液态
            const prevAngle = ((j - 1) / sides) * Math.PI * 2
            const prevWobble = Math.sin(time * 2 + (j - 1) * 1.5 + blob.phase) * blob.r * 0.15
            const prevWobble2 = Math.cos(time * 1.3 + (j - 1) * 2.1) * blob.r * 0.1
            const prevR = blob.r + prevWobble + prevWobble2
            const cpx = blob.x + Math.cos((prevAngle + angle) / 2) * (r + prevR) * 0.55
            const cpy = blob.y + Math.sin((prevAngle + angle) / 2) * (r + prevR) * 0.55
            ctx.quadraticCurveTo(cpx, cpy, px, py)
          }
        }
        ctx.closePath()

        // 渐变填充
        const grad = ctx.createRadialGradient(blob.x, blob.y, 0, blob.x, blob.y, blob.r * 1.2)
        grad.addColorStop(0, `hsla(${blob.hue + Math.sin(time) * 10}, 80%, 60%, 0.12)`)
        grad.addColorStop(0.5, `hsla(${blob.hue + 20}, 70%, 50%, 0.06)`)
        grad.addColorStop(1, `hsla(${blob.hue}, 60%, 40%, 0)`)
        ctx.fillStyle = grad
        ctx.fill()
      })

      animId = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0, opacity: 0.6 }}
    />
  )
}
