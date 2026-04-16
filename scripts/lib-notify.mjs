// Shared notification helper — fans out to any configured webhook
// Supports: Discord, Slack, Pushover, Telegram
// All optional; no-op if none configured.

export async function notify(level, title, body) {
  const discord  = process.env.DISCORD_WEBHOOK_URL
  const slack    = process.env.SLACK_WEBHOOK_URL
  const pushover = process.env.PUSHOVER_USER && process.env.PUSHOVER_TOKEN
    ? { user: process.env.PUSHOVER_USER, token: process.env.PUSHOVER_TOKEN } : null
  const telegram = process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID
    ? { token: process.env.TELEGRAM_BOT_TOKEN, chat: process.env.TELEGRAM_CHAT_ID } : null

  const icon = level === 'error' ? '🔴' : level === 'warn' ? '🟡' : level === 'success' ? '🟢' : '🔵'
  const text = `${icon} ${title}\n${body}`

  const tasks = []
  if (discord) tasks.push(
    fetch(discord, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ content: text }),
    }).catch(e => console.log('[NOTIFY-DISCORD]', e.message)),
  )
  if (slack) tasks.push(
    fetch(slack, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ text }),
    }).catch(e => console.log('[NOTIFY-SLACK]', e.message)),
  )
  if (pushover) tasks.push(
    fetch('https://api.pushover.net/1/messages.json', {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        token: pushover.token, user: pushover.user,
        title, message: body,
        priority: level === 'error' ? '1' : '0',
      }),
    }).catch(e => console.log('[NOTIFY-PUSHOVER]', e.message)),
  )
  if (telegram) tasks.push(
    fetch(`https://api.telegram.org/bot${telegram.token}/sendMessage`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ chat_id: telegram.chat, text }),
    }).catch(e => console.log('[NOTIFY-TELEGRAM]', e.message)),
  )

  if (tasks.length > 0) await Promise.allSettled(tasks)
}

// Rate-limit helper so we don't spam webhooks with duplicate alerts.
// Call `shouldNotify(key, minutes)` — returns true if enough time has passed.
const lastNotify = new Map()
export function shouldNotify(key, cooldownMin = 15) {
  const now = Date.now()
  const last = lastNotify.get(key) ?? 0
  if (now - last < cooldownMin * 60_000) return false
  lastNotify.set(key, now)
  return true
}
