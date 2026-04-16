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

// Minimal Database type used by createBrowserClient / createServerClient generics.
// For production, replace with the output of: npx supabase gen types typescript
export interface Database {
  public: {
    Tables: {
      todos: {
        Row: Todo
        Insert: Omit<Todo, 'id' | 'created_at' | 'updated_at'> & { id?: string }
        Update: Partial<Omit<Todo, 'id' | 'created_at'>>
      }
    }
  }
}
