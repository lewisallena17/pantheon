// Standalone Edge TTS worker — runs as a child process spawned from
// /api/tts/edge. Exists because Next.js webpack mangles the `ws`
// package's native bufferutil addon in RSC bundling, which breaks
// WebSocket frames. Running msedge-tts as plain Node bypasses that.
//
// Usage: node scripts/tts-edge-worker.mjs "<voice-id>" <<< "text to speak"
// Outputs: MP3 bytes to stdout. Exit 0 on success, non-zero on error.

import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts'

const voice = process.argv[2] || 'en-GB-RyanNeural'

let text = ''
process.stdin.setEncoding('utf8')
for await (const chunk of process.stdin) text += chunk
text = text.slice(0, 400).trim()

if (!text) {
  console.error('empty-text')
  process.exit(2)
}

const tts = new MsEdgeTTS()
try {
  await tts.setMetadata(voice, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3)
  const { audioStream } = tts.toStream(text)
  const done = new Promise((resolve, reject) => {
    const kill = setTimeout(() => reject(new Error('stream-timeout')), 12_000)
    audioStream.on('data',  (c) => process.stdout.write(c))
    audioStream.on('end',   () => { clearTimeout(kill); resolve() })
    audioStream.on('close', () => { clearTimeout(kill); resolve() })
    audioStream.on('error', (e) => { clearTimeout(kill); reject(e) })
  })
  await done
  tts.close?.()
  process.exit(0)
} catch (e) {
  console.error(e?.message || 'tts-failed')
  try { tts.close?.() } catch {}
  process.exit(1)
}
