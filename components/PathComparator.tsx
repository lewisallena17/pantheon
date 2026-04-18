'use client'

import { X, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react'
import type { PathComparison, ExplorationPath } from '@/types/paths'

interface Props {
  comparison: PathComparison | null
  onClose: () => void
  onSelectPath: (pathId: string) => void
}

/**
 * Visual diff highlighting for path comparison
 * Renders two paths side-by-side with divergence point highlighted
 */
export default function PathComparator({
  comparison,
  onClose,
  onSelectPath,
}: Props) {
  if (!comparison) {
    return (
      <div className="text-xs text-slate-600 italic p-4 text-center">
        Select two paths to compare
      </div>
    )
  }

  const { path_a, path_b, divergence_node_id, divergence_depth, similarities, differences } = comparison

  const renderPathColumn = (path: ExplorationPath, isPathA: boolean) => {
    return (
      <div className="space-y-2 flex-1">
        <div className={`px-3 py-2 rounded-t border-b ${
          isPathA
            ? 'border-blue-700/50 bg-blue-950/30'
            : 'border-purple-700/50 bg-purple-950/30'
        }`}>
          <h3 className="text-sm font-semibold text-slate-100 truncate">
            Path {isPathA ? 'A' : 'B'}
          </h3>
          <p className="text-[10px] text-slate-500 mt-1">
            {path.path_nodes.length} nodes • {path.is_favorite && '⭐ Favorite'}
          </p>
        </div>

        {/* Node list with divergence highlighting */}
        <div className="space-y-1 px-3 pb-3">
          {path.path_nodes.map((node, idx) => {
            const isDivergence = node.id === divergence_node_id
            const afterDivergence = idx > divergence_depth
            const beforeDivergence = idx < divergence_depth

            return (
              <div
                key={node.id}
                className={`text-xs p-2 rounded transition-colors ${
                  isDivergence
                    ? isPathA
                      ? 'bg-blue-900/50 border border-blue-700'
                      : 'bg-purple-900/50 border border-purple-700'
                    : afterDivergence
                      ? 'bg-yellow-900/30 border-l-2 border-yellow-600'
                      : beforeDivergence
                        ? 'bg-slate-800/50'
                        : 'bg-slate-800/30'
                }`}
              >
                <div className="flex items-center gap-2">
                  {isDivergence && (
                    <AlertCircle size={12} className="text-yellow-400 flex-shrink-0" />
                  )}
                  {beforeDivergence && (
                    <CheckCircle size={12} className="text-emerald-400 flex-shrink-0" />
                  )}
                  {afterDivergence && (
                    <ArrowRight size={12} className="text-slate-500 flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-mono text-[9px] text-slate-500">D{idx}</p>
                    <p className="truncate text-slate-200">{node.title}</p>
                    {node.description && (
                      <p className="text-[10px] text-slate-400 mt-1 line-clamp-2">
                        {node.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="rounded border border-slate-700 bg-black/40 overflow-hidden flex flex-col max-h-96">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-700 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-100">
          Path Comparison
        </h2>
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
          title="Close comparison"
        >
          <X size={14} />
        </button>
      </div>

      {/* Main comparison area */}
      <div className="flex-1 overflow-y-auto flex gap-3 p-3">
        {renderPathColumn(path_a, true)}
        {renderPathColumn(path_b, false)}
      </div>

      {/* Metadata */}
      <div className="px-4 py-3 border-t border-slate-700 bg-slate-900/30 space-y-2">
        <div className="grid grid-cols-2 gap-3 text-[10px]">
          <div>
            <span className="text-slate-600">Divergence:</span>
            <span className="ml-2 text-slate-300 font-mono">D{divergence_depth}</span>
          </div>
          <div>
            <span className="text-slate-600">Common nodes:</span>
            <span className="ml-2 text-slate-300 font-mono">{divergence_depth + 1}</span>
          </div>
        </div>

        {/* Similarities */}
        {similarities.length > 0 && (
          <div>
            <p className="text-[11px] text-emerald-400 font-semibold mb-1">Similarities:</p>
            <div className="flex flex-wrap gap-1">
              {similarities.map((sim, idx) => (
                <span
                  key={idx}
                  className="text-[9px] bg-emerald-900/30 text-emerald-300 px-1.5 py-0.5 rounded"
                >
                  {sim}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Differences */}
        {differences.length > 0 && (
          <div>
            <p className="text-[11px] text-orange-400 font-semibold mb-1">Differences:</p>
            <div className="flex flex-wrap gap-1">
              {differences.map((diff, idx) => (
                <span
                  key={idx}
                  className="text-[9px] bg-orange-900/30 text-orange-300 px-1.5 py-0.5 rounded"
                >
                  {diff}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-2 mt-3 pt-2 border-t border-slate-700">
          <button
            onClick={() => onSelectPath(path_a.id)}
            className="flex-1 text-xs px-2 py-1.5 rounded bg-blue-900/40 text-blue-300 hover:bg-blue-900/60 transition-colors"
          >
            Select Path A
          </button>
          <button
            onClick={() => onSelectPath(path_b.id)}
            className="flex-1 text-xs px-2 py-1.5 rounded bg-purple-900/40 text-purple-300 hover:bg-purple-900/60 transition-colors"
          >
            Select Path B
          </button>
        </div>
      </div>
    </div>
  )
}
