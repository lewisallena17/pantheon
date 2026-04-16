/**
 * spriteLoader.ts — Browser-based character sprite loader
 *
 * Loads character PNG files (char_0.png … char_N.png) using the browser
 * Canvas API and converts them into SpriteData format understood by the
 * pixel-agents rendering engine.
 *
 * PNG format: 112×96 (7 frames × 3 directions, each frame 16×32)
 *   Row 0 = DOWN  (frames 0-6: walk0, walk1, walk2, walk3, type0, type1, read0, read1)
 *   Wait — 7 frames: walk0,walk1,walk2,walk3 = 4 walk, then type0,type1 = 2 type, then read0 = 1 read?
 *   Actually: CHAR_FRAMES_PER_ROW = 7, 3 dirs
 *   Frames per row: 0,1,2,3 = walk (4), 4,5 = type (2), 6 = first read
 *   But spriteData uses 7 frames per row with indices 0-6 where:
 *     walk: [0,1,2,1]  type: [3,4]  reading: [5,6]
 */

import { setCharacterTemplates } from './sprites/spriteData'
import type { SpriteData } from './types'

const FRAME_W = 16
const FRAME_H = 32
const FRAMES_PER_ROW = 7
const DIRECTIONS = ['down', 'up', 'right'] as const

function rgbaToHex(r: number, g: number, b: number, a: number): string {
  if (a === 0) return ''
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}

async function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

function extractFrames(
  imageData: ImageData,
  imgWidth: number,
  dirIdx: number,
): SpriteData[] {
  const frames: SpriteData[] = []
  const rowOffsetY = dirIdx * FRAME_H

  for (let f = 0; f < FRAMES_PER_ROW; f++) {
    const sprite: SpriteData = []
    const frameOffsetX = f * FRAME_W

    for (let y = 0; y < FRAME_H; y++) {
      const row: string[] = []
      for (let x = 0; x < FRAME_W; x++) {
        const idx = ((rowOffsetY + y) * imgWidth + (frameOffsetX + x)) * 4
        const r = imageData.data[idx]
        const g = imageData.data[idx + 1]
        const b = imageData.data[idx + 2]
        const a = imageData.data[idx + 3]
        row.push(rgbaToHex(r, g, b, a))
      }
      sprite.push(row)
    }
    frames.push(sprite)
  }
  return frames
}

export async function loadCharacterSprites(basePath = '/pixel-agents/characters'): Promise<void> {
  // Find out how many character PNGs exist (char_0.png through char_N.png)
  const charData: Array<{ down: SpriteData[]; up: SpriteData[]; right: SpriteData[] }> = []

  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  let idx = 0
  while (true) {
    try {
      const img = await loadImage(`${basePath}/char_${idx}.png`)
      canvas.width  = img.naturalWidth
      canvas.height = img.naturalHeight
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0)

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)

      charData.push({
        down:  extractFrames(imageData, img.naturalWidth, 0),
        up:    extractFrames(imageData, img.naturalWidth, 1),
        right: extractFrames(imageData, img.naturalWidth, 2),
      })

      idx++
    } catch {
      // No more character PNGs
      break
    }
  }

  if (charData.length > 0) {
    setCharacterTemplates(charData)
    console.log(`[PixelAgents] Loaded ${charData.length} character sprite sheets`)
  } else {
    console.warn('[PixelAgents] No character sprites found — agents will be invisible')
  }
}
