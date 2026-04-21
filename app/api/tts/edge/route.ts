import { NextResponse } from 'next/server'
import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts'

export const dynamic = 'force-dynamic'

// Microsoft Edge neural voice (British male). Free, no API key needed —
// uses the same service Edge browser uses when you click "Read aloud".
const DEFAULT_VOICE  = process.env.EDGE_TTS_VOICE || 'en-GB-RyanNeural'
const MAX_CHARS      = 400

// Escapes SSML-unsafe characters + wraps the text in a prosody element so we
// can nudge pace and pitch closer to a measured Jarvis delivery.
function buildSSML(text: string, voice: string) {
  const safe = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
  return `<speak version="1.0" xml:lang="en-GB">
    <voice name="${voice}">
      <prosody rate="-5%" pitch="-5%">${safe}</prosody>
    </voice>
  </speak>`
}

export async function POST(req: Request) {
  let text: string
  try {
    const body = await req.json()
    text = String(body?.text ?? '').slice(0, MAX_CHARS).trim()
  } catch {
    return NextResponse.json({ error: 'bad-body' }, { status: 400 })
  }
  if (!text) return NextResponse.json({ error: 'empty-text' }, { status: 400 })

  try {
    const tts = new MsEdgeTTS()
    await tts.setMetadata(DEFAULT_VOICE, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3)

    // Try SSML prosody first; fall back to plain text if the package version
    // doesn't accept SSML via toStream.
    let stream
    try {
      stream = tts.toStream(buildSSML(text, DEFAULT_VOICE))
    } catch {
      stream = tts.toStream(text)
    }

    const chunks: Buffer[] = []
    for await (const chunk of stream.audioStream) chunks.push(chunk as Buffer)
    const audio = Buffer.concat(chunks)

    return new Response(audio, {
      status: 200,
      headers: {
        'Content-Type':  'audio/mpeg',
        'Cache-Control': 'no-store',
        'X-TTS-Chars':   String(text.length),
        'X-TTS-Voice':   DEFAULT_VOICE,
      },
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'unknown'
    return NextResponse.json({ error: 'tts-failed', detail: msg.slice(0, 200) }, { status: 502 })
  }
}

export async function GET() {
  return NextResponse.json({
    enabled:   true, // always free, no key
    voice:     DEFAULT_VOICE,
    service:   'microsoft-edge-tts',
  })
}
