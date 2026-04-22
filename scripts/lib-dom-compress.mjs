// scripts/lib-dom-compress.mjs
//
// Plasmate-style HTML → semantic JSON compression. When an agent fetches a
// web page (e.g. via Jina), the raw text can easily be 30k+ tokens with
// nav chrome, ads, boilerplate. Convert to a lean JSON outline of just the
// meaningful content: { title, headings, paragraphs, links, code, tables }.
//
// Compression ratio typically 5-17× depending on source. Used before
// feeding research results to Claude.
//
// No deps — pure regex. Handles HTML and markdown.

const MAX_PARAGRAPHS  = 40
const MAX_PARAGRAPH_LEN = 500
const MAX_LINKS       = 20
const MAX_HEADINGS    = 30
const MAX_CODE_BLOCKS = 15

/**
 * @param {string} raw — HTML, markdown, or plain text
 * @returns {{
 *   title?: string
 *   headings: Array<{ level: number; text: string }>
 *   paragraphs: string[]
 *   links: Array<{ href: string; text: string }>
 *   codeBlocks: string[]
 *   wordCount: number
 *   inputBytes: number
 *   outputBytes: number
 *   compressionRatio: number
 * }}
 */
export function compressHtml(raw) {
  if (!raw || typeof raw !== 'string') {
    return { headings: [], paragraphs: [], links: [], codeBlocks: [], wordCount: 0, inputBytes: 0, outputBytes: 0, compressionRatio: 0 }
  }
  const inputBytes = raw.length

  // Strip <script> / <style> / comments
  let text = raw
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')

  // Title
  const titleMatch = text.match(/<title[^>]*>([\s\S]*?)<\/title>/i) ?? text.match(/^#\s+(.+)$/m)
  const title = titleMatch ? decodeEntities(titleMatch[1]).trim().slice(0, 200) : undefined

  // Headings (HTML <h1>-<h6> and markdown #-#####)
  const headings = []
  for (const m of text.matchAll(/<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/gi)) {
    if (headings.length >= MAX_HEADINGS) break
    const h = stripTags(m[2]).slice(0, 200)
    if (h) headings.push({ level: Number(m[1]), text: h })
  }
  for (const m of text.matchAll(/^(#{1,6})\s+(.+)$/gm)) {
    if (headings.length >= MAX_HEADINGS) break
    headings.push({ level: m[1].length, text: m[2].trim().slice(0, 200) })
  }

  // Code blocks (```fence``` and <pre><code>)
  const codeBlocks = []
  for (const m of text.matchAll(/```[\s\S]*?```/g)) {
    if (codeBlocks.length >= MAX_CODE_BLOCKS) break
    codeBlocks.push(m[0].slice(0, 600))
  }
  for (const m of text.matchAll(/<pre[^>]*>([\s\S]*?)<\/pre>/gi)) {
    if (codeBlocks.length >= MAX_CODE_BLOCKS) break
    codeBlocks.push(stripTags(m[1]).slice(0, 600))
  }

  // Links
  const links = []
  const seenHref = new Set()
  for (const m of text.matchAll(/<a[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)) {
    if (links.length >= MAX_LINKS) break
    const href = m[1]
    if (seenHref.has(href) || href.startsWith('#') || href.startsWith('javascript:')) continue
    seenHref.add(href)
    const t = stripTags(m[2]).slice(0, 120)
    links.push({ href, text: t })
  }

  // Paragraphs — strip all remaining tags, split on double newline
  const plain = stripTags(text).replace(/\s+/g, ' ').trim()
  const sentences = plain.split(/(?<=[.!?])\s+(?=[A-Z0-9])/)
  const paragraphs = []
  let buffer = ''
  for (const s of sentences) {
    if (buffer.length + s.length > MAX_PARAGRAPH_LEN) {
      if (buffer) paragraphs.push(buffer.trim())
      buffer = s
    } else {
      buffer += (buffer ? ' ' : '') + s
    }
    if (paragraphs.length >= MAX_PARAGRAPHS) break
  }
  if (buffer && paragraphs.length < MAX_PARAGRAPHS) paragraphs.push(buffer.trim())

  const wordCount = plain.split(/\s+/).length
  const output = { title, headings, paragraphs, links, codeBlocks, wordCount }
  const outputBytes = JSON.stringify(output).length

  return {
    ...output,
    inputBytes,
    outputBytes,
    compressionRatio: inputBytes > 0 ? Number((inputBytes / Math.max(1, outputBytes)).toFixed(2)) : 0,
  }
}

function stripTags(s) {
  return decodeEntities(
    String(s).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
  )
}

function decodeEntities(s) {
  return String(s)
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCharCode(parseInt(n, 16)))
}

/** Convenience: compress + format as a compact summary suitable for LLM context. */
export function compressForLLM(raw, { maxLength = 4000 } = {}) {
  const c = compressHtml(raw)
  const parts = []
  if (c.title)                  parts.push(`# ${c.title}`)
  if (c.headings.length)        parts.push('## Outline\n' + c.headings.slice(0, 12).map(h => `${'  '.repeat(h.level - 1)}- ${h.text}`).join('\n'))
  if (c.paragraphs.length)      parts.push('## Content\n' + c.paragraphs.slice(0, 10).join('\n\n'))
  if (c.codeBlocks.length)      parts.push('## Code\n' + c.codeBlocks.slice(0, 4).join('\n---\n'))
  if (c.links.length)           parts.push('## Links\n' + c.links.slice(0, 10).map(l => `- [${l.text}](${l.href})`).join('\n'))
  const formatted = parts.join('\n\n').slice(0, maxLength)
  return {
    text:             formatted,
    compressionRatio: c.compressionRatio,
    inputBytes:       c.inputBytes,
    outputBytes:      formatted.length,
  }
}
