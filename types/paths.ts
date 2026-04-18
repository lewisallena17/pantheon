/**
 * Fork-and-Compare Path Exploration Types
 * Lightweight types for multi-path decision trees with visual branching and comparison
 */

export type PathDecision = 'approach' | 'constraint' | 'experiment' | 'rollback'
export type PathStatus = 'active' | 'abandoned' | 'completed' | 'paused'

/**
 * A single decision node in the exploration tree
 */
export interface PathNode {
  id: string
  parent_id: string | null
  title: string
  description?: string
  decision_type: PathDecision
  decision_rationale?: string
  status: PathStatus
  depth: number
  created_at: string
  updated_at: string
  metadata?: Record<string, unknown>
}

/**
 * A complete path from root to leaf (or current node)
 */
export interface ExplorationPath {
  id: string
  root_id: string
  current_node_id: string
  path_nodes: PathNode[]
  score?: number  // for ranking/sorting paths
  is_favorite: boolean
  created_at: string
  last_traversed_at: string
  metadata?: Record<string, unknown>
}

/**
 * Comparison between two paths (for side-by-side view)
 */
export interface PathComparison {
  path_a_id: string
  path_b_id: string
  path_a: ExplorationPath
  path_b: ExplorationPath
  divergence_node_id: string  // first node where paths differ
  divergence_depth: number
  similarities: string[]
  differences: string[]
  outcome_difference?: string
}

/**
 * Breadcrumb entry for path navigation
 */
export interface PathBreadcrumb {
  node_id: string
  node_title: string
  depth: number
  is_current: boolean
}

/**
 * History of path traversals for undo/redo
 */
export interface PathHistoryEntry {
  id: string
  timestamp: string
  action: 'create_node' | 'switch_path' | 'compare_paths' | 'mark_abandoned' | 'favorite_path'
  node_id?: string
  path_id?: string
  details?: Record<string, unknown>
}

/**
 * User's path exploration state
 */
export interface PathExplorationState {
  current_path_id: string
  all_paths: ExplorationPath[]
  active_comparisons: PathComparison[]
  history: PathHistoryEntry[]
  favorites: string[]
  view_mode: 'tree' | 'compare' | 'timeline'
  last_action: PathHistoryEntry | null
}

/**
 * Request to create a new fork
 */
export interface CreatePathForkRequest {
  parent_node_id: string
  title: string
  description?: string
  decision_type: PathDecision
  decision_rationale?: string
}

/**
 * Request to compare two paths
 */
export interface ComparePathsRequest {
  path_a_id: string
  path_b_id: string
}

/**
 * Lightweight tree node for UI rendering
 */
export interface PathTreeNode {
  id: string
  title: string
  status: PathStatus
  decision_type: PathDecision
  depth: number
  children: PathTreeNode[]
  is_active_path: boolean
  branch_count: number
}
