// Agent faction assignment. Each specialist pool belongs to one house.
// Faction XP = sum of completed-task XP for all its pools over the period.

export interface Faction {
  id:     string
  name:   string
  motto:  string
  pools:  string[]   // pool name prefix match (e.g. "db-specialist" matches "db-specialist-ca15a6")
  color:  string     // tailwind class family
  icon:   string
}

export const FACTIONS: Faction[] = [
  {
    id:    'scholars',
    name:  'The Scholars',
    motto: 'Knowledge is the sharpest blade.',
    pools: ['db-specialist', 'ruflo-low'],
    color: 'cyan',
    icon:  '📚',
  },
  {
    id:    'artisans',
    name:  'The Artisans',
    motto: 'Beauty, shipped.',
    pools: ['ui-specialist', 'ruflo-medium'],
    color: 'purple',
    icon:  '🎨',
  },
  {
    id:    'warriors',
    name:  'The Warriors',
    motto: 'Boss hunters. No mercy for bugs.',
    pools: ['ruflo-high', 'ruflo-critical'],
    color: 'red',
    icon:  '⚔️',
  },
]

export function factionForPool(poolOrAgent: string | null | undefined): Faction | null {
  if (!poolOrAgent) return null
  for (const f of FACTIONS) {
    if (f.pools.some(p => poolOrAgent.startsWith(p))) return f
  }
  return null
}

// Color classes per faction — referenced by className composition in UI
export const FACTION_STYLES: Record<string, { text: string; border: string; bg: string; fill: string }> = {
  scholars:  { text: 'text-cyan-300',    border: 'border-cyan-800/50',    bg: 'bg-cyan-950/30',    fill: 'bg-cyan-600'    },
  artisans:  { text: 'text-purple-300',  border: 'border-purple-800/50',  bg: 'bg-purple-950/30',  fill: 'bg-purple-600'  },
  warriors:  { text: 'text-red-300',     border: 'border-red-800/50',     bg: 'bg-red-950/30',     fill: 'bg-red-600'     },
}
