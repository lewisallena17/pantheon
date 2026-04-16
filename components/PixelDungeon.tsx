'use client'

import { useEffect, useRef, useState } from 'react'
import type { Todo } from '@/types/todos'
import { OfficeState } from '@/lib/pixel-agents/engine/officeState'
import { startGameLoop } from '@/lib/pixel-agents/engine/gameLoop'
import { renderFrame } from '@/lib/pixel-agents/engine/renderer'
import { loadCharacterSprites } from '@/lib/pixel-agents/spriteLoader'
import { TILE_SIZE } from '@/lib/pixel-agents/constants'
import type { ColorValue } from '@/lib/pixel-agents/constants'
import { TileType } from '@/lib/pixel-agents/types'
import type { OfficeLayout } from '@/lib/pixel-agents/types'

interface Props { todos: Todo[] }

// ── Ecosystem grid ────────────────────────────────────────────────────────────
const ECO_COLS = 38
const ECO_ROWS = 16

// Zone column ranges (inclusive)
const ZONE_REVENUE = { start: 1,  end: 9  }
const ZONE_DEV     = { start: 11, end: 25 }
const ZONE_QC      = { start: 27, end: 36 }
// God corridor: rows 1–4, full width

// ── Agent definitions ─────────────────────────────────────────────────────────
const AGENT_MAP: Record<string, {
  id: number; palette: number; label: string
  zone: 'god' | 'revenue' | 'dev' | 'qc'
  startCol: number; startRow: number
}> = {
  'god':                { id: 1, palette: 0, label: 'GOD',      zone: 'god',     startCol: 19, startRow: 2  },
  'revenue':            { id: 2, palette: 1, label: 'REVENUE',  zone: 'revenue', startCol: 5,  startRow: 9  },
  'ruflo-critical':     { id: 3, palette: 2, label: 'CRITICAL', zone: 'dev',     startCol: 13, startRow: 8  },
  'ruflo-high':         { id: 4, palette: 3, label: 'HIGH',     zone: 'dev',     startCol: 16, startRow: 11 },
  'ruflo-medium':       { id: 5, palette: 4, label: 'MEDIUM',   zone: 'dev',     startCol: 19, startRow: 8  },
  'ruflo-orchestrator': { id: 6, palette: 5, label: 'ORCH',     zone: 'dev',     startCol: 22, startRow: 11 },
  'db-specialist':      { id: 7, palette: 0, label: 'DB',       zone: 'qc',      startCol: 29, startRow: 8  },
  'ui-specialist':      { id: 8, palette: 1, label: 'UI',       zone: 'qc',      startCol: 32, startRow: 11 },
}

// ── Custom ecosystem layout ───────────────────────────────────────────────────
function createEcosystemLayout(): OfficeLayout {
  const godColor:     ColorValue = { h: 45,  s: 65, b: 38, c: 0 }  // warm gold
  const revenueColor: ColorValue = { h: 115, s: 38, b: 26, c: 0 }  // green
  const devColor:     ColorValue = { h: 200, s: 42, b: 24, c: 0 }  // cyan
  const qcColor:      ColorValue = { h: 270, s: 42, b: 26, c: 0 }  // purple

  const tiles: number[] = []
  const tileColors: Array<ColorValue | null> = []

  for (let r = 0; r < ECO_ROWS; r++) {
    for (let c = 0; c < ECO_COLS; c++) {
      const isEdge = r === 0 || r === ECO_ROWS - 1 || c === 0 || c === ECO_COLS - 1

      // Zone wall separators — only below the god corridor (rows 5+)
      // Doorways left open at row 5 (transition row) so agents can enter rooms
      const isZoneWall = !isEdge && r >= 6 && (c === 10 || c === 26)

      if (isEdge || isZoneWall) {
        tiles.push(TileType.WALL as number)
        tileColors.push(null)
        continue
      }

      tiles.push(TileType.FLOOR_1 as number)

      if (r <= 4) {
        // God corridor
        tileColors.push(godColor)
      } else if (c >= ZONE_REVENUE.start && c <= ZONE_REVENUE.end) {
        tileColors.push(revenueColor)
      } else if (c >= ZONE_DEV.start && c <= ZONE_DEV.end) {
        tileColors.push(devColor)
      } else if (c >= ZONE_QC.start && c <= ZONE_QC.end) {
        tileColors.push(qcColor)
      } else {
        tileColors.push(godColor) // transition tiles get god color
      }
    }
  }

  return {
    version: 1,
    cols: ECO_COLS,
    rows: ECO_ROWS,
    tiles: tiles as TileType[],
    tileColors,
    furniture: [],
  }
}

// ── Zone label rendering ──────────────────────────────────────────────────────
function drawZoneLabels(
  ctx: CanvasRenderingContext2D,
  zoom: number,
  oX: number,
  oY: number,
  activeZones: Record<string, boolean>,
) {
  const ts = TILE_SIZE * zoom
  ctx.textBaseline = 'top'
  ctx.textAlign = 'center'

  // God chamber label
  const godActive = activeZones.god
  const fontSize = Math.max(6, Math.floor(zoom * 3.5))
  ctx.font = `bold ${fontSize}px monospace`
  ctx.fillStyle = godActive ? 'rgba(255,210,50,0.95)' : 'rgba(255,200,80,0.45)'
  ctx.fillText('◈ GOD CHAMBER', oX + (19 * ts), oY + (ts * 0.4))

  // Zone labels (below god corridor)
  const labelRow = 6
  const zoneLabels = [
    { label: '💰 REVENUE',     col: 5,  color: activeZones.revenue ? 'rgba(100,255,120,0.95)' : 'rgba(100,220,80,0.4)'  },
    { label: '⚡ DEVELOPMENT', col: 18, color: activeZones.dev     ? 'rgba(0,220,255,0.95)'   : 'rgba(0,180,220,0.4)'   },
    { label: '🔬 QUALITY',     col: 31, color: activeZones.qc      ? 'rgba(200,100,255,0.95)' : 'rgba(160,80,220,0.4)'  },
  ]

  for (const z of zoneLabels) {
    ctx.fillStyle = z.color
    ctx.fillText(z.label, oX + (z.col * ts), oY + (labelRow * ts) + ts * 0.25)
  }

  // Zone divider labels (wall decorations)
  ctx.font = `${Math.max(5, Math.floor(zoom * 2.5))}px monospace`
  ctx.fillStyle = 'rgba(255,255,255,0.12)'
  ctx.textAlign = 'center'
  // Optional: no text on wall tiles
}

export default function PixelDungeon({ todos }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef    = useRef<HTMLCanvasElement>(null)
  const stateRef     = useRef<OfficeState | null>(null)
  const panRef       = useRef({ x: 0, y: 0 })
  const zoomRef      = useRef(2)
  const panActiveRef = useRef(false)
  const panStartRef  = useRef({ mx: 0, my: 0, px: 0, py: 0 })
  const [spritesLoaded, setSpritesLoaded] = useState(false)
  const [hoveredAgent,  setHoveredAgent]  = useState<string | null>(null)
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null)
  const [canvasH, setCanvasH] = useState(380)

  // ── Init office state with ecosystem layout + sprites ─────────────────────
  useEffect(() => {
    const layout = createEcosystemLayout()
    stateRef.current = new OfficeState(layout)
    loadCharacterSprites('/pixel-agents/characters')
      .then(() => setSpritesLoaded(true))
      .catch(() => setSpritesLoaded(true))
    return () => { stateRef.current = null }
  }, [])

  // ── Sync agents from todos + position in zones ────────────────────────────
  useEffect(() => {
    const office = stateRef.current
    if (!office || !spritesLoaded) return

    for (const [poolName, info] of Object.entries(AGENT_MAP)) {
      if (!office.characters.has(info.id)) {
        office.addAgent(info.id, info.palette, 0, undefined, true)

        // Teleport agent to their zone starting position
        const ch = office.characters.get(info.id)
        if (ch) {
          ch.tileCol = info.startCol
          ch.tileRow = info.startRow
          ch.x = info.startCol * TILE_SIZE + TILE_SIZE / 2
          ch.y = info.startRow * TILE_SIZE + TILE_SIZE / 2
          ch.path = []
          ch.moveProgress = 0
        }
      }

      const inProgress = poolName === 'revenue'
        ? true  // revenue agent is always running
        : todos.some(t => t.assigned_agent === poolName && t.status === 'in_progress')
      office.setAgentActive(info.id, inProgress)
      office.setAgentTool(info.id, inProgress ? 'Write' : null)
    }
  }, [todos, spritesLoaded])

  // ── Canvas render loop ────────────────────────────────────────────────────
  useEffect(() => {
    const canvas    = canvasRef.current
    const container = containerRef.current
    const office    = stateRef.current
    if (!canvas || !container || !office) return

    function resize() {
      if (!canvas || !container) return
      const rect = container.getBoundingClientRect()
      const dpr  = window.devicePixelRatio || 1

      const rawZoom = (rect.width * dpr) / (ECO_COLS * TILE_SIZE)
      const zoom    = Math.max(1, Math.floor(rawZoom))
      zoomRef.current = zoom

      const mapCssH = Math.ceil((ECO_ROWS * TILE_SIZE * zoom) / dpr)
      setCanvasH(mapCssH)

      canvas.width  = Math.round(rect.width * dpr)
      canvas.height = Math.round(mapCssH * dpr)
      canvas.style.width  = `${rect.width}px`
      canvas.style.height = `${mapCssH}px`
    }

    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(container)

    const stop = startGameLoop(canvas, {
      update: (dt) => office.update(dt),
      render: (ctx) => {
        const w    = canvas.width
        const h    = canvas.height
        const zoom = zoomRef.current
        const layout = office.getLayout()

        renderFrame(
          ctx, w, h,
          office.tileMap,
          office.furniture,
          office.getCharacters(),
          zoom,
          panRef.current.x,
          panRef.current.y,
          {
            selectedAgentId: null,
            hoveredAgentId:  null,
            hoveredTile:     null,
            seats:           office.seats,
            characters:      office.characters,
          },
          undefined,
          layout.tileColors,
          layout.cols,
          layout.rows,
        )

        // Compute map offset for label positioning
        const mapW = layout.cols * TILE_SIZE * zoom
        const mapH = layout.rows * TILE_SIZE * zoom
        const oX = Math.floor((w - mapW) / 2) + Math.round(panRef.current.x)
        const oY = Math.floor((h - mapH) / 2) + Math.round(panRef.current.y)

        // Determine which zones have active agents
        const activeZones = {
          god:     todos.some(t => t.assigned_agent === 'god' && t.status === 'in_progress'),
          revenue: true,
          dev:     todos.some(t => ['ruflo-critical','ruflo-high','ruflo-medium','ruflo-orchestrator'].includes(t.assigned_agent ?? '') && t.status === 'in_progress'),
          qc:      todos.some(t => ['db-specialist','ui-specialist'].includes(t.assigned_agent ?? '') && t.status === 'in_progress'),
        }

        drawZoneLabels(ctx, zoom, oX, oY, activeZones)
      },
    })

    return () => { stop(); ro.disconnect() }
  }, [spritesLoaded, todos])

  // ── Mouse helpers ─────────────────────────────────────────────────────────
  function getWorldPos(e: React.MouseEvent) {
    const canvas = canvasRef.current
    const office = stateRef.current
    if (!canvas || !office) return null
    const rect   = canvas.getBoundingClientRect()
    const dpr    = window.devicePixelRatio || 1
    const zoom   = zoomRef.current
    const layout = office.getLayout()
    const mapW   = layout.cols * TILE_SIZE * zoom
    const mapH   = layout.rows * TILE_SIZE * zoom
    const oX = Math.floor((canvas.width  - mapW) / 2) + Math.round(panRef.current.x)
    const oY = Math.floor((canvas.height - mapH) / 2) + Math.round(panRef.current.y)
    const dX = (e.clientX - rect.left) * dpr
    const dY = (e.clientY - rect.top)  * dpr
    return { worldX: (dX - oX) / zoom, worldY: (dY - oY) / zoom }
  }

  function handleMouseMove(e: React.MouseEvent) {
    if (panActiveRef.current) {
      const dpr = window.devicePixelRatio || 1
      panRef.current = {
        x: panStartRef.current.px + (e.clientX - panStartRef.current.mx) * dpr,
        y: panStartRef.current.py + (e.clientY - panStartRef.current.my) * dpr,
      }
      return
    }
    const pos    = getWorldPos(e)
    const office = stateRef.current
    if (!pos || !office) { setHoveredAgent(null); return }
    const hitId    = office.getCharacterAt(pos.worldX, pos.worldY)
    const poolName = hitId !== null
      ? Object.entries(AGENT_MAP).find(([, v]) => v.id === hitId)?.[0] ?? null
      : null
    setHoveredAgent(poolName)
  }

  function handleMouseDown(e: React.MouseEvent) {
    if (e.button === 1) {
      e.preventDefault()
      panActiveRef.current = true
      panStartRef.current  = { mx: e.clientX, my: e.clientY, px: panRef.current.x, py: panRef.current.y }
    }
  }

  function handleMouseUp(e: React.MouseEvent) {
    if (e.button === 1) panActiveRef.current = false
  }

  function handleCanvasClick(e: React.MouseEvent) {
    const pos    = getWorldPos(e)
    const office = stateRef.current
    if (!pos || !office) return
    const hitId    = office.getCharacterAt(pos.worldX, pos.worldY)
    const poolName = hitId !== null
      ? Object.entries(AGENT_MAP).find(([, v]) => v.id === hitId)?.[0] ?? null
      : null
    setSelectedAgent(prev => prev === poolName ? null : poolName)
  }

  const focusPool  = selectedAgent ?? hoveredAgent
  const focusTodos = focusPool
    ? todos.filter(t => t.assigned_agent === focusPool && t.status === 'in_progress')
    : []
  const focusInfo  = focusPool ? AGENT_MAP[focusPool] : null

  // Zone stats
  const zoneStats = {
    revenue: { active: 1, label: '💰 REVENUE',     agents: ['revenue'],                                              color: 'text-yellow-400',  border: 'border-yellow-900/40', bg: 'bg-yellow-950/20' },
    dev:     { active: todos.filter(t => ['ruflo-critical','ruflo-high','ruflo-medium','ruflo-orchestrator'].includes(t.assigned_agent ?? '') && t.status === 'in_progress').length,
               label: '⚡ DEV',          agents: ['ruflo-critical','ruflo-high','ruflo-medium','ruflo-orchestrator'], color: 'text-cyan-400',    border: 'border-cyan-900/40',   bg: 'bg-cyan-950/20'   },
    qc:      { active: todos.filter(t => ['db-specialist','ui-specialist'].includes(t.assigned_agent ?? '') && t.status === 'in_progress').length,
               label: '🔬 QUALITY',      agents: ['db-specialist','ui-specialist'],                                  color: 'text-purple-400',  border: 'border-purple-900/40', bg: 'bg-purple-950/20' },
  }

  return (
    <div className="rounded border border-slate-800/60 bg-black/40 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800/60 bg-black/60">
        <span className="text-xs font-mono tracking-[0.2em] text-slate-500 uppercase">◈ Agent Ecosystem</span>
        <div className="flex items-center gap-3">
          {!spritesLoaded && (
            <span className="text-[10px] font-mono text-slate-700 animate-pulse">loading sprites…</span>
          )}
          <span className="text-[10px] font-mono text-slate-700">click agent to inspect · middle-drag to pan</span>
        </div>
      </div>

      {/* Canvas */}
      <div
        ref={containerRef}
        className="relative w-full"
        style={{ height: canvasH, background: '#150f0a' }}
      >
        <canvas
          ref={canvasRef}
          onMouseMove={handleMouseMove}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onClick={handleCanvasClick}
          onContextMenu={e => e.preventDefault()}
          onMouseLeave={() => { panActiveRef.current = false; setHoveredAgent(null) }}
          className="block"
          style={{ cursor: hoveredAgent ? 'pointer' : 'default', display: 'block' }}
        />

        {/* Agent tooltip */}
        {focusInfo && (
          <div className="absolute bottom-2 left-2 rounded border border-slate-700/60 bg-black/80 px-3 py-1.5 pointer-events-none">
            <div className={`text-xs font-mono font-bold ${
              focusInfo.zone === 'revenue' ? 'text-yellow-400' :
              focusInfo.zone === 'dev'     ? 'text-cyan-400' :
              focusInfo.zone === 'qc'      ? 'text-purple-400' : 'text-amber-400'
            }`}>{focusInfo.label}</div>
            {focusTodos.length > 0 ? (
              focusTodos.slice(0, 2).map((t, i) => (
                <div key={i} className="text-[10px] font-mono text-slate-400 truncate max-w-52 mt-0.5">
                  ◈ {t.title}
                </div>
              ))
            ) : (
              <div className="text-[10px] font-mono text-slate-600 mt-0.5">idle</div>
            )}
          </div>
        )}
      </div>

      {/* Zone status panels */}
      <div className="grid grid-cols-3 border-t border-slate-800/40">
        {Object.entries(zoneStats).map(([zone, z]) => {
          const activePools = z.agents.filter(a =>
            a === 'revenue'
              ? true
              : todos.some(t => t.assigned_agent === a && t.status === 'in_progress')
          )
          return (
            <div key={zone} className={`px-3 py-2 ${z.bg} ${zone !== 'qc' ? 'border-r border-slate-800/40' : ''}`}>
              <div className={`text-[10px] font-mono font-bold ${z.color} tracking-widest mb-1.5`}>{z.label}</div>
              <div className="flex flex-wrap gap-1.5">
                {z.agents.map(pool => {
                  const info = AGENT_MAP[pool]
                  const active = pool === 'revenue'
                    ? true
                    : todos.some(t => t.assigned_agent === pool && t.status === 'in_progress')
                  return (
                    <button
                      key={pool}
                      onClick={() => setSelectedAgent(p => p === pool ? null : pool)}
                      className="flex items-center gap-1 hover:opacity-80"
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${active ? `${z.color.replace('text-','bg-')} animate-pulse` : 'bg-slate-700'}`} />
                      <span className={`text-[9px] font-mono ${active ? z.color : 'text-slate-600'}`}>{info?.label}</span>
                    </button>
                  )
                })}
              </div>
              {activePools.length > 0 && (
                <div className={`text-[9px] font-mono mt-1 ${z.color} opacity-60`}>
                  {activePools.length} active
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
