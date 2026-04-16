'use client'

import { useEffect, useRef } from 'react'
import type { Todo } from '@/types/todos'

interface Props { todos: Todo[] }

export default function PriorityRadar({ todos }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const frameRef  = useRef<number>(0)
  const phaseRef  = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const W = canvas.width
    const H = canvas.height
    const cx = W / 2
    const cy = H / 2
    const R  = Math.min(W, H) / 2 - 18

    const counts = {
      critical: todos.filter(t => t.priority === 'critical').length,
      high:     todos.filter(t => t.priority === 'high').length,
      medium:   todos.filter(t => t.priority === 'medium').length,
      low:      todos.filter(t => t.priority === 'low').length,
    }
    const maxVal = Math.max(1, ...Object.values(counts))

    // Axes: top=critical, right=high, bottom=medium, left=low
    const axes = [
      { label: 'CRIT',  angle: -Math.PI/2, val: counts.critical, color: [255, 51,  102] as const },
      { label: 'HIGH',  angle: 0,           val: counts.high,     color: [255, 140, 0  ] as const },
      { label: 'MED',   angle: Math.PI/2,   val: counts.medium,   color: [0,   212, 255] as const },
      { label: 'LOW',   angle: Math.PI,     val: counts.low,      color: [100, 200, 100] as const },
    ]

    function draw() {
      phaseRef.current += 0.012
      const p = phaseRef.current
      ctx.clearRect(0, 0, W, H)

      // Grid rings
      for (let r = 1; r <= 4; r++) {
        const rr = (r / 4) * R
        ctx.beginPath()
        ctx.arc(cx, cy, rr, 0, Math.PI * 2)
        ctx.strokeStyle = 'rgba(0,212,255,0.08)'
        ctx.lineWidth = 1
        ctx.stroke()
      }

      // Axis lines
      for (const ax of axes) {
        ctx.beginPath()
        ctx.moveTo(cx, cy)
        ctx.lineTo(cx + Math.cos(ax.angle) * R, cy + Math.sin(ax.angle) * R)
        ctx.strokeStyle = 'rgba(0,212,255,0.12)'
        ctx.lineWidth = 1
        ctx.stroke()
      }

      // Radar polygon
      const pts = axes.map(ax => {
        const ratio = ax.val / maxVal
        return {
          x: cx + Math.cos(ax.angle) * R * ratio,
          y: cy + Math.sin(ax.angle) * R * ratio,
          color: ax.color,
          ratio,
        }
      })

      // Fill
      ctx.beginPath()
      ctx.moveTo(pts[0].x, pts[0].y)
      for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y)
      ctx.closePath()
      const pulse = 0.08 + Math.sin(p) * 0.03
      ctx.fillStyle = `rgba(0,212,255,${pulse})`
      ctx.fill()

      // Stroke
      ctx.beginPath()
      ctx.moveTo(pts[0].x, pts[0].y)
      for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y)
      ctx.closePath()
      ctx.strokeStyle = `rgba(0,212,255,${0.5 + Math.sin(p) * 0.2})`
      ctx.lineWidth = 1.5
      ctx.stroke()

      // Dots at vertices
      for (const pt of pts) {
        const [r, g, b] = pt.color
        ctx.beginPath()
        ctx.arc(pt.x, pt.y, 3 + Math.sin(p + pt.ratio) * 1, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${r},${g},${b},0.9)`
        ctx.fill()
        ctx.strokeStyle = `rgba(${r},${g},${b},0.3)`
        ctx.lineWidth = 4
        ctx.stroke()
      }

      // Sweep line
      const sweepAngle = p % (Math.PI * 2) - Math.PI / 2
      ctx.beginPath()
      ctx.moveTo(cx, cy)
      ctx.lineTo(cx + Math.cos(sweepAngle) * R, cy + Math.sin(sweepAngle) * R)
      ctx.strokeStyle = 'rgba(0,212,255,0.15)'
      ctx.lineWidth = 1
      ctx.stroke()

      // Labels
      ctx.font = '9px Share Tech Mono, monospace'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      for (const ax of axes) {
        const lx = cx + Math.cos(ax.angle) * (R + 12)
        const ly = cy + Math.sin(ax.angle) * (R + 12)
        const [r, g, b] = ax.color
        ctx.fillStyle = `rgba(${r},${g},${b},0.7)`
        ctx.fillText(ax.label, lx, ly)
      }

      // Center dot
      ctx.beginPath()
      ctx.arc(cx, cy, 2, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(0,212,255,0.6)'
      ctx.fill()

      frameRef.current = requestAnimationFrame(draw)
    }

    frameRef.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(frameRef.current)
  }, [todos])

  return (
    <div className="rounded border border-cyan-900/40 bg-black/40 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-cyan-900/40 bg-black/60">
        <span className="text-xs font-mono tracking-[0.2em] text-cyan-700 uppercase">◈ Priority Radar</span>
      </div>
      <div className="flex items-center justify-center p-2">
        <canvas ref={canvasRef} width={140} height={140} />
      </div>
    </div>
  )
}
