// temp: find the TASK_BLOCKLIST_PATTERNS block
import { readFileSync } from 'node:fs'
const src = readFileSync('./god-agent.mjs', 'utf8')
const idx = src.indexOf('TASK_BLOCKLIST_PATTERNS')
console.log('Found at index:', idx)
console.log(src.slice(idx, idx + 3000))
