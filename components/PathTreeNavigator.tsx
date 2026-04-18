'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight, GitBranch, CheckCircle, XCircle, Pause } from 'lucide-react'
import type { PathTreeNode, PathStatus, PathDecision } from '@/types/paths'

interface Props {
  root: PathTreeNode | null
  activePathId: string
  onNodeClick: (nodeId: string) => void
  onCreateFork: (parentNodeId: string) => void
}

const DECISION_COLORS: Record<PathDecision, string> = {
  approach: 'text-blue-400',
  constraint: 'text-orange-400',
  experiment: 'text-purple-400',
  rollback: 'text-red-400',
}

const STATUS_ICONS: Record<PathStatus, JSX.Element> = {
  active: <GitBranch size={12} className="text-green-400" />,
  abandoned: <XCircle size={12} className="text-slate-500" />,
  completed: <CheckCircle size={12} className="text-emerald-400" />,
  paused: <Pause size={12} className="text-yellow-400" />,
}

interface NodeProps {
  node: PathTreeNode
  isActive: boolean
  onNodeClick: (nodeId: string) => void
  onCreateFork: (parentNodeId: string) => void
  level: number
}

function TreeNode({
  node,
  isActive,
  onNodeClick,
  onCreateFork,
  level,
}: NodeProps) {
  const [expanded, setExpanded] = useState(isActive || level < 2)

  const hasChildren = node.children.length > 0
  const indent = level * 16

  return (
    <div>
      <div
        className={`flex items-center gap-2 px-2 py-1.5 rounded transition-colors cursor-pointer ${
          isActive
            ? 'bg-slate-700 font-semibold'
            : 'hover:bg-slate-800/50'
        }`}
        onClick={() => onNodeClick(node.id)}
        style={{ marginLeft: `${indent}px` }}
      >
        {/* Expand/collapse toggle */}
        {hasChildren ? (
          <button
            onClick={(e) => {
              e.stopPropagation()
              setExpanded(!expanded)
            }}
            className="p-0 hover:text-slate-300"
            title={expanded ? 'Collapse' : 'Expand'}
          >
            {expanded ? (
              <ChevronDown size={14} />
            ) : (
              <ChevronRight size={14} />
            )}
          </button>
        ) : (
          <div className="w-3" />
        )}

        {/* Status icon */}
        {STATUS_ICONS[node.status]}

        {/* Decision type color */}
        <span className={`text-[10px] font-mono uppercase tracking-[0.1em] ${DECISION_COLORS[node.decision_type]}`}>
          {node.decision_type.slice(0, 3)}
        </span>

        {/* Node title */}
        <span className={`text-sm flex-1 truncate ${isActive ? 'text-slate-100' : 'text-slate-300'}`}>
          {node.title}
        </span>

        {/* Branch count badge */}
        {node.branch_count > 0 && (
          <span className="text-[10px] bg-slate-700 px-1.5 py-0.5 rounded text-slate-300">
            {node.branch_count} branch{node.branch_count !== 1 ? 'es' : ''}
          </span>
        )}

        {/* Create fork button */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            onCreateFork(node.id)
          }}
          className="p-1 rounded hover:bg-slate-700 hover:text-slate-100 transition-colors text-slate-500"
          title="Create fork from this node"
        >
          <GitBranch size={12} />
        </button>
      </div>

      {/* Children */}
      {expanded && hasChildren && (
        <div className="space-y-0">
          {node.children.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              isActive={isActive}
              onNodeClick={onNodeClick}
              onCreateFork={onCreateFork}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default function PathTreeNavigator({
  root,
  activePathId,
  onNodeClick,
  onCreateFork,
}: Props) {
  if (!root) {
    return (
      <div className="text-xs text-slate-600 italic p-3">
        No paths available. Create your first fork to begin exploring.
      </div>
    )
  }

  return (
    <div className="space-y-1 text-xs">
      <TreeNode
        node={root}
        isActive={activePathId === root.id}
        onNodeClick={onNodeClick}
        onCreateFork={onCreateFork}
        level={0}
      />
    </div>
  )
}
