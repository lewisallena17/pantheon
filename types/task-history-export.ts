/**
 * Types for task_history export functionality
 */

export interface ActorActivityCount {
  actor_id: string
  actor_name: string | null
  total_actions: number
  status_changes: number
  created_actions: number
  updated_actions: number
  completed_actions: number
  failed_actions: number
  other_actions: number
  first_action_at: string | null
  last_action_at: string | null
}

export interface ActorNameGroupCount {
  actor_name: string
  unique_actors: number
  total_actions: number
  status_changes: number
  created_actions: number
  updated_actions: number
  completed_actions: number
  failed_actions: number
  other_actions: number
  first_action_at: string | null
  last_action_at: string | null
}

export interface ActionTypeGroupCount {
  action: string
  unique_actors: number
  total_count: number
  first_occurrence: string | null
  last_occurrence: string | null
  unique_tasks: number
}

export type TaskHistoryGroupCount = ActorActivityCount | ActorNameGroupCount | ActionTypeGroupCount

export interface TaskHistoryExportResponse<T extends TaskHistoryGroupCount = TaskHistoryGroupCount> {
  group_by: 'actor_id' | 'actor_name' | 'action'
  total_records: number
  data: T[]
  exported_at: string
}

export interface ExportOptions {
  format?: 'json' | 'csv'
  groupBy?: 'actor_id' | 'actor_name' | 'action'
  detailed?: boolean
}
