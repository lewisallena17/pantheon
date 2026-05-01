// Tiny IndexNow helper. Free, no auth — Bing/Yandex/Seznam (and indirectly
// Google) treat IndexNow pings as crawl hints, dropping discovery from days
// to hours. https://www.indexnow.org/documentation
//
// Setup:
//   1. A random 32-char key lives at public/<key>.txt
//   2. The same key is sent in the ping payload — IndexNow validates by
//      fetching the .txt file and matching the contents.

const KEY      = 'b0e2f0fb720b656e7d408838ac6e3f3a'
const KEY_HOST = 'task-dashboard-sigma-three.vercel.app'  // domain that owns the key
const ENDPOINT = 'https://api.indexnow.org/indexnow'

/**
 * Submit one or more URLs (must all share the same host).
 * Returns true on accepted / OK, false otherwise. Errors are swallowed —
 * IndexNow is best-effort; nothing else should fail because a ping flopped.
 */
export async function pingIndexNow(urls) {
  const list = Array.isArray(urls) ? urls : [urls]
  if (list.length === 0) return false

  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'content-type': 'application/json; charset=utf-8' },
      body: JSON.stringify({
        host:        KEY_HOST,
        key:         KEY,
        keyLocation: `https://${KEY_HOST}/${KEY}.txt`,
        urlList:     list,
      }),
      signal: AbortSignal.timeout(10_000),
    })
    // 200 = accepted+queued. 202 = accepted but unverified key (still OK).
    // Anything else means we should have a look at the spec.
    if (res.ok || res.status === 202) {
      console.log(`[INDEXNOW] ✓ submitted ${list.length} URL${list.length === 1 ? '' : 's'} (${res.status})`)
      return true
    }
    const text = await res.text().catch(() => '')
    console.log(`[INDEXNOW] ✗ ${res.status} ${text.slice(0, 120)}`)
    return false
  } catch (e) {
    console.log(`[INDEXNOW] ✗ ${e.message?.slice(0, 80)}`)
    return false
  }
}
