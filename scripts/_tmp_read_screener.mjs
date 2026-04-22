// temp helper — delete after reading
import { REJECT_RULES, screenTask } from './task-screener.mjs'
console.log('RULES COUNT:', REJECT_RULES.length)
console.log('LAST 5 RULES:', JSON.stringify(REJECT_RULES.slice(-5), null, 2))
