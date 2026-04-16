/**
 * Utilities for exporting task_history data with actor_id grouping
 * Uses the /api/reports/task-history-export endpoint
 */

import type {
  TaskHistoryExportResponse,
  ActorActivityCount,
  ActorNameGroupCount,
  ActionTypeGroupCount,
  ExportOptions,
} from '@/types/task-history-export'

export interface FetchExportOptions extends ExportOptions {
  signal?: AbortSignal
}

/**
 * Fetch task_history export from the API endpoint
 * Default: groups by actor_id with JSON format
 */
export async function fetchTaskHistoryExport<T extends 'actor_id' | 'actor_name' | 'action' = 'actor_id'>(
  options: FetchExportOptions & { groupBy?: T } = {}
): Promise<TaskHistoryExportResponse> {
  const { format = 'json', groupBy = 'actor_id', signal } = options

  const searchParams = new URLSearchParams()
  searchParams.set('format', format)
  searchParams.set('group_by', groupBy as string)

  const response = await fetch(`/api/reports/task-history-export?${searchParams.toString()}`, {
    method: 'GET',
    headers: {
      'Accept': format === 'csv' ? 'text/csv' : 'application/json',
    },
    signal,
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to fetch task history export: ${response.statusText} - ${error}`)
  }

  if (format === 'csv') {
    const csv = await response.text()
    // Return CSV as a string wrapped in a response object
    return {
      group_by: groupBy as any,
      total_records: 0,
      data: csv as any,
      exported_at: new Date().toISOString(),
    }
  }

  return response.json()
}

/**
 * Fetch task_history grouped by actor_id
 */
export async function fetchActorActivityCounts(
  options?: Omit<FetchExportOptions, 'groupBy'>
): Promise<TaskHistoryExportResponse<ActorActivityCount>> {
  return fetchTaskHistoryExport({ ...options, groupBy: 'actor_id' })
}

/**
 * Fetch task_history grouped by actor_name
 */
export async function fetchActorNameGroups(
  options?: Omit<FetchExportOptions, 'groupBy'>
): Promise<TaskHistoryExportResponse<ActorNameGroupCount>> {
  return fetchTaskHistoryExport({ ...options, groupBy: 'actor_name' })
}

/**
 * Fetch task_history grouped by action type
 */
export async function fetchActionTypeGroups(
  options?: Omit<FetchExportOptions, 'groupBy'>
): Promise<TaskHistoryExportResponse<ActionTypeGroupCount>> {
  return fetchTaskHistoryExport({ ...options, groupBy: 'action' })
}

/**
 * Download task_history export as a file
 */
export async function downloadTaskHistoryExport(
  filename: string = 'task-history-export',
  options: FetchExportOptions = {}
): Promise<void> {
  const { format = 'json', groupBy = 'actor_id' } = options

  const searchParams = new URLSearchParams()
  searchParams.set('format', format)
  searchParams.set('group_by', groupBy as string)

  const response = await fetch(`/api/reports/task-history-export?${searchParams.toString()}`, {
    method: 'GET',
  })

  if (!response.ok) {
    throw new Error(`Failed to download export: ${response.statusText}`)
  }

  const blob = await response.blob()
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${filename}.${format === 'csv' ? 'csv' : 'json'}`
  document.body.appendChild(a)
  a.click()
  window.URL.revokeObjectURL(url)
  document.body.removeChild(a)
}

/**
 * Convert CSV string to array of objects
 */
export function parseCSV(csv: string): Record<string, string>[] {
  const lines = csv.trim().split('\n')
  if (lines.length < 1) return []

  const headers = parseCSVLine(lines[0])
  const data: Record<string, string>[] = []

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i])
    const obj: Record<string, string> = {}
    for (let j = 0; j < headers.length; j++) {
      obj[headers[j]] = values[j] ?? ''
    }
    data.push(obj)
  }

  return data
}

/**
 * Parse a single CSV line, handling quoted fields
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let insideQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    const nextChar = line[i + 1]

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        current += '"'
        i++ // Skip next quote
      } else {
        insideQuotes = !insideQuotes
      }
    } else if (char === ',' && !insideQuotes) {
      result.push(current)
      current = ''
    } else {
      current += char
    }
  }

  result.push(current)
  return result
}
