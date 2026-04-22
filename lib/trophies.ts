// Declarative trophy definitions. Each trophy is a pure function over the
// current todos/state — if its `earned(state)` returns true, the user has
// unlocked it. Client-side derivation; localStorage tracks which ones the
// user has already seen (so pop-ups don't repeat on every refresh).

import type { Todo } from '@/types/todos'
import { factionForPool } from './factions'

export interface TrophyState {
  todos: Todo[]
  now?:  number
}

export interface Trophy {
  id:          string
  icon:        string
  title:       string
  description: string
  earned:      (s: TrophyState) => boolean
  tier:        'bronze' | 'silver' | 'gold' | 'legendary'
}

function completed(s: TrophyState) {
  return s.todos.filter(t => t.status === 'completed')
}

function failed(s: TrophyState) {
  return s.todos.filter(t => t.status === 'failed')
}

export const TROPHIES: Trophy[] = [
  {
    id:          'first-blood',
    icon:        '🩸',
    title:       'First Blood',
    description: 'First task completed autonomously.',
    tier:        'bronze',
    earned:      s => completed(s).length >= 1,
  },
  {
    id:          'decathlon',
    icon:        '🏃',
    title:       'Decathlon',
    description: '10 tasks completed.',
    tier:        'bronze',
    earned:      s => completed(s).length >= 10,
  },
  {
    id:          'centurion',
    icon:        '🛡️',
    title:       'Centurion',
    description: '100 autonomous completions.',
    tier:        'silver',
    earned:      s => completed(s).length >= 100,
  },
  {
    id:          'thousand-club',
    icon:        '👑',
    title:       'Thousand Club',
    description: '1,000 tasks shipped. Hall of Fame.',
    tier:        'legendary',
    earned:      s => completed(s).length >= 1000,
  },
  {
    id:          'boss-slayer',
    icon:        '⚔️',
    title:       'Boss Slayer',
    description: 'Defeated your first boss task.',
    tier:        'silver',
    earned:      s => completed(s).some(t => t.is_boss),
  },
  {
    id:          'boss-hunter',
    icon:        '🗡️',
    title:       'Boss Hunter',
    description: '10 boss tasks down.',
    tier:        'gold',
    earned:      s => completed(s).filter(t => t.is_boss).length >= 10,
  },
  {
    id:          'night-owl',
    icon:        '🌙',
    title:       'Night Owl',
    description: '24 consecutive hours of autonomous activity.',
    tier:        'silver',
    earned:      s => {
      const now = s.now ?? Date.now()
      const dayAgo = now - 24 * 3600_000
      const recent = completed(s).filter(t => new Date(t.updated_at).getTime() >= dayAgo)
      return recent.length >= 10
    },
  },
  {
    id:          'iron-will',
    icon:        '💪',
    title:       'Iron Will',
    description: '95%+ success rate on last 20 closed tasks.',
    tier:        'gold',
    earned:      s => {
      const closed = s.todos
        .filter(t => t.status === 'completed' || t.status === 'failed')
        .sort((a, b) => (b.updated_at ?? '').localeCompare(a.updated_at ?? ''))
        .slice(0, 20)
      if (closed.length < 20) return false
      const done = closed.filter(t => t.status === 'completed').length
      return done / closed.length >= 0.95
    },
  },
  {
    id:          'phoenix',
    icon:        '🔥',
    title:       'Phoenix',
    description: '10 failures survived without pausing autonomy.',
    tier:        'bronze',
    earned:      s => failed(s).length >= 10,
  },
  {
    id:          'all-houses-active',
    icon:        '🏰',
    title:       'Three Houses',
    description: 'At least one task completed by each faction.',
    tier:        'silver',
    earned:      s => {
      const seen = new Set<string>()
      for (const t of completed(s)) {
        const f = factionForPool(t.assigned_agent ?? '')
        if (f) seen.add(f.id)
      }
      return seen.size >= 3
    },
  },
  {
    id:          'spartan',
    icon:        '🛡️',
    title:       'Spartan',
    description: '300 vetoed tasks — strong immune system.',
    tier:        'silver',
    earned:      s => s.todos.filter(t => t.status === 'vetoed').length >= 300,
  },
  {
    id:          'profit',
    icon:        '💰',
    title:       'Profit',
    description: 'First dollar earned (set ANTHROPIC_CREDITS or revenue log).',
    tier:        'gold',
    // Placeholder — can be tied to revenue-log.json when that's set up
    earned:      () => false,
  },
]

/** Computes which trophies are currently earned given the state. */
export function earnedTrophies(state: TrophyState): Trophy[] {
  return TROPHIES.filter(t => {
    try { return t.earned(state) } catch { return false }
  })
}
