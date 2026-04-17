export type TodoStatus   = 'proposed' | 'pending' | 'in_progress' | 'completed' | 'failed' | 'blocked' | 'vetoed'
export type TodoPriority = 'low' | 'medium' | 'high' | 'critical'
export type TaskCategory = 'db' | 'ui' | 'infra' | 'analysis' | 'other'

export interface TodoComment {
  agent: string
  text: string
  at: string
}

export interface Todo {
  id: string
  title: string
  status: TodoStatus
  priority: TodoPriority
  assigned_agent: string | null
  updated_at: string
  created_at: string
  is_boss: boolean
  deadline: string | null
  comments: TodoComment[]
  retry_count: number
  parent_task_id: string | null
  task_category: TaskCategory
}

// Permissive Database type — strongly types `todos`, relaxes everything else
// so api routes that touch auxiliary tables (cost_log, god_status, traces, etc.)
// type-check without requiring every table to be enumerated here.
// For full type safety across all tables, replace with:
//   npx supabase gen types typescript --project-id <id> > types/supabase.ts
type PermissiveTable = {
  Row:      Record<string, unknown>
  Insert:   Record<string, unknown>
  Update:   Record<string, unknown>
  Relationships: []
}

export interface Database {
  public: {
    Tables: {
      todos: {
        Row:    Todo
        Insert: Omit<Todo, 'id' | 'created_at' | 'updated_at' | 'comments' | 'retry_count' | 'parent_task_id' | 'is_boss' | 'deadline' | 'task_category'> & {
          id?:             string
          comments?:       TodoComment[]
          retry_count?:    number
          parent_task_id?: string | null
          is_boss?:        boolean
          deadline?:       string | null
          task_category?:  TaskCategory
        }
        Update: Partial<Omit<Todo, 'id' | 'created_at'>>
        Relationships: []
      }
    } & Record<string, PermissiveTable>
    Views:     Record<string, PermissiveTable>
    Functions: Record<string, { Args: Record<string, unknown>; Returns: unknown }>
    Enums:     Record<string, string>
    CompositeTypes: Record<string, Record<string, unknown>>
  }
}
