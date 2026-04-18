'use client'

import { ChevronRight, Archive, Bookmark } from 'lucide-react'
import type { PathBreadcrumb, ExplorationPath } from '@/types/paths'

interface Props {
  path: ExplorationPath | null
  onNodeClick: (nodeId: string) => void
  onFavoriteToggle: (pathId: string) => void
  isFavorite: boolean
}

export default function PathBreadcrumb({
  path,
  onNodeClick,
  onFavoriteToggle,
  isFavorite,
}: Props) {
  if (!path || path.path_nodes.length === 0) {
    return (
      <div className="text-xs text-slate-600 italic">
        No path selected
      </div>
    )
  }

  const breadcrumbs: PathBreadcrumb[] = path.path_nodes.map((node, idx) => ({
    node_id: node.id,
    node_title: node.title,
    depth: idx,
    is_current: idx === path.path_nodes.length - 1,
  }))

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {/* Favorite toggle */}
      <button
        onClick={() => onFavoriteToggle(path.id)}
        className={`p-1 rounded transition-colors ${
          isFavorite
            ? 'text-yellow-500 hover:text-yellow-400 bg-yellow-500/10'
            : 'text-slate-600 hover:text-slate-400'
        }`}
        title={isFavorite ? 'Unfavorite path' : 'Favorite path'}
      >
        <Bookmark size={14} fill={isFavorite ? 'currentColor' : 'none'} />
      </button>

      {/* Breadcrumb trail */}
      {breadcrumbs.map((breadcrumb, idx) => (
        <div key={breadcrumb.node_id} className="flex items-center gap-1">
          {idx > 0 && (
            <ChevronRight size={12} className="text-slate-600" />
          )}
          <button
            onClick={() => onNodeClick(breadcrumb.node_id)}
            className={`text-xs px-2 py-1 rounded transition-colors truncate ${
              breadcrumb.is_current
                ? 'bg-slate-700 text-slate-100 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
            title={breadcrumb.node_title}
          >
            {breadcrumb.node_title}
          </button>
        </div>
      ))}

      {/* Path stats */}
      <div className="ml-auto flex items-center gap-2 text-[11px] text-slate-600">
        <span>Depth: {breadcrumbs.length}</span>
        {path.score !== undefined && (
          <span>Score: {path.score.toFixed(2)}</span>
        )}
      </div>
    </div>
  )
}
