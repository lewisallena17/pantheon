/**
 * Response Mode Router
 * 
 * Converts detected intents into structured responses
 * that can be consumed by UI components or API handlers.
 */

import { type IntentResult } from './intent-detector'

export type ResponseAction =
  | { type: 'create_task'; payload: { title: string; priority?: 'low' | 'medium' | 'high' | 'critical' } }
  | { type: 'search_tasks'; payload: { query: string; filters?: Record<string, string> } }
  | { type: 'control_agent'; payload: { agent: string; action: 'start' | 'stop' | 'restart' } }
  | { type: 'navigate_section'; payload: { section: string } }
  | { type: 'fetch_analytics'; payload: { metric: string } }
  | { type: 'clarify'; payload: { suggestion?: string } }

export interface RouterResponse {
  action: ResponseAction
  confidence: number
  message: string
  fallback?: ResponseAction // Alternative action if primary fails
}

/**
 * Map agent names to valid agent identifiers
 */
const AGENT_ALIASES: Record<string, string> = {
  god: 'god',
  pixel: 'pixel',
  ruflo: 'ruflo-agents',
  'ruflo-agents': 'ruflo-agents',
  revenue: 'revenue',
  all: 'all',
}

/**
 * Map section names to dashboard section IDs
 */
const SECTION_ALIASES: Record<string, string> = {
  inbox: 'section-inbox',
  'task inbox': 'section-inbox',
  tasks: 'section-todos',
  todos: 'section-todos',
  controls: 'section-controls',
  'agent controls': 'section-controls',
  agents: 'section-controls',
  god: 'section-god',
  'god view': 'section-god',
  feed: 'section-feed',
  'live feed': 'section-feed',
  analytics: 'section-analytics',
  cost: 'section-cost',
  'cost tracker': 'section-cost',
  revenue: 'section-revenue',
  'revenue tracker': 'section-revenue',
  pixel: 'section-pixel',
  'agent office': 'section-pixel',
  git: 'section-git',
  'git history': 'section-git',
  contrib: 'section-contrib',
  'contribution graph': 'section-contrib',
}

/**
 * Map metric names to analytics query types
 */
const METRIC_ALIASES: Record<string, string> = {
  cost: 'total_cost',
  costs: 'total_cost',
  spending: 'total_cost',
  spend: 'total_cost',
  revenue: 'total_revenue',
  earnings: 'total_revenue',
  budget: 'monthly_budget',
  performance: 'performance_score',
  stats: 'all_metrics',
}

/**
 * Route a detected intent to a concrete response
 */
export function routeIntent(intent: IntentResult): RouterResponse {
  switch (intent.mode) {
    case 'task_creation':
      return routeTaskCreation(intent)

    case 'task_search':
      return routeTaskSearch(intent)

    case 'agent_control':
      return routeAgentControl(intent)

    case 'navigation':
      return routeNavigation(intent)

    case 'analytics':
      return routeAnalytics(intent)

    case 'clarification':
    default:
      return routeClarification(intent)
  }
}

function routeTaskCreation(intent: IntentResult): RouterResponse {
  const title = intent.entity || 'New task from command'
  const priority = extractPriority(intent) || 'medium'

  return {
    action: {
      type: 'create_task',
      payload: {
        title,
        priority: priority as any,
      },
    },
    confidence: intent.confidence,
    message: `Creating task: "${title}" (${priority} priority)`,
    fallback: {
      type: 'clarify',
      payload: { suggestion: 'Tell me the task title and priority' },
    },
  }
}

function routeTaskSearch(intent: IntentResult): RouterResponse {
  const query = intent.entity || ''
  const filters = extractFilters(intent)

  return {
    action: {
      type: 'search_tasks',
      payload: {
        query,
        filters,
      },
    },
    confidence: intent.confidence,
    message: `Searching tasks${query ? ` for "${query}"` : ''}${Object.keys(filters ?? {}).length > 0 ? ` with filters` : ''}`,
    fallback: {
      type: 'navigate_section',
      payload: { section: 'section-todos' },
    },
  }
}

function routeAgentControl(intent: IntentResult): RouterResponse {
  const agent = intent.entity ? AGENT_ALIASES[intent.entity] || intent.entity : 'god'
  const action = (intent.action || 'start') as 'start' | 'stop' | 'restart'

  // Validate action for agents
  const validActions: ('start' | 'stop' | 'restart')[] = ['start', 'stop', 'restart']
  const safeAction = validActions.includes(action) ? action : 'restart'

  return {
    action: {
      type: 'control_agent',
      payload: {
        agent,
        action: safeAction,
      },
    },
    confidence: intent.confidence,
    message: `${safeAction.charAt(0).toUpperCase() + safeAction.slice(1)}ing agent: ${agent}`,
    fallback: {
      type: 'clarify',
      payload: { suggestion: 'Which agent? (god, pixel, ruflo, revenue, all)' },
    },
  }
}

function routeNavigation(intent: IntentResult): RouterResponse {
  const sectionName = intent.entity || 'section-inbox'
  const section = SECTION_ALIASES[sectionName] || `section-${sectionName}`

  return {
    action: {
      type: 'navigate_section',
      payload: { section },
    },
    confidence: intent.confidence,
    message: `Navigating to ${intent.entity || 'inbox'}`,
    fallback: {
      type: 'navigate_section',
      payload: { section: 'section-inbox' },
    },
  }
}

function routeAnalytics(intent: IntentResult): RouterResponse {
  const metricName = intent.entity || 'cost'
  const metric = METRIC_ALIASES[metricName] || metricName

  return {
    action: {
      type: 'fetch_analytics',
      payload: { metric },
    },
    confidence: intent.confidence,
    message: `Fetching ${intent.entity || 'cost'} metrics`,
    fallback: {
      type: 'navigate_section',
      payload: { section: 'section-analytics' },
    },
  }
}

function routeClarification(intent: IntentResult): RouterResponse {
  const suggestions = [
    'Try: "Create [task name]"',
    'Try: "Find [task name]"',
    'Try: "Start [agent name]"',
    'Try: "Go to [section]"',
    'Try: "Show cost metrics"',
  ]
  const suggestion = suggestions[Math.floor(Math.random() * suggestions.length)]

  return {
    action: {
      type: 'clarify',
      payload: { suggestion },
    },
    confidence: 0,
    message: 'I didn\'t understand that query. ' + suggestion,
  }
}

/**
 * Extract priority from intent keywords
 * Looks for "critical", "high", "medium", "low"
 */
function extractPriority(intent: IntentResult): string | null {
  const query = (intent.entity || '').toLowerCase()
  const priorities = ['critical', 'high', 'medium', 'low']

  for (const p of priorities) {
    if (query.includes(p)) return p
  }

  return null
}

/**
 * Extract filters from intent keywords
 * Looks for "status:", "priority:", "assigned:", etc.
 */
function extractFilters(intent: IntentResult): Record<string, string> {
  const query = (intent.entity || '').toLowerCase()
  const filters: Record<string, string> = {}

  // status: pending, in_progress, completed, failed, blocked, vetoed
  const statusMatch = query.match(/(status|state)[:=\s]+(\w+)/i)
  if (statusMatch) filters.status = statusMatch[2]

  // priority: low, medium, high, critical
  const priorityMatch = query.match(/(priority)[:=\s]+(\w+)/i)
  if (priorityMatch) filters.priority = priorityMatch[2]

  // assigned: [agent name]
  const assignedMatch = query.match(/(assigned|agent)[:=\s]+(\w+)/i)
  if (assignedMatch) filters.assigned_agent = assignedMatch[2]

  return filters
}

/**
 * Convert a response action back to a human-friendly string
 */
export function describeResponse(response: RouterResponse): string {
  return response.message
}

/**
 * Batch process intents and routes
 */
export function routeIntentsBatch(
  intents: IntentResult[],
): RouterResponse[] {
  return intents.map(routeIntent)
}
