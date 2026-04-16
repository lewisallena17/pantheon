'use client'

import { useState, useCallback, useMemo } from 'react'
import type { Todo } from '@/types/todos'
import TodosTable, { type RealtimeStatus } from './TodosTable'
import ConnectionStatus from './ConnectionStatus'
import AddTodoForm from './AddTodoForm'
import StatsBar from './StatsBar'
import BattleLog, { type LogEntry } from './BattleLog'
import HeatmapTimeline from './HeatmapTimeline'
import PriorityRadar from './PriorityRadar'
import StreakCounter from './StreakCounter'
import AgentXPBar from './AgentXPBar'
import VictoryFlash from './VictoryFlash'
import GodView from './GodView'
import PixelDungeon from './PixelDungeon'
import CostTracker from './CostTracker'
import RevenueTracker from './RevenueTracker'
import ActiveAgent from './ActiveAgent'
import AgentComparisonTable from './AgentComparisonTable'
import DashboardHeader from './DashboardHeader'
import AgentControlPanel from './AgentControlPanel'
import TaskInbox from './TaskInbox'
import CommandPalette, { SECTION_IDS } from './CommandPalette'
import LiveFeed from './LiveFeed'
import GitHistory from './GitHistory'
import CIStatus from './CIStatus'
import ContributionGraph from './ContributionGraph'

interface Props {
  initialTodos: Todo[]
}

export default function DashboardShell({ initialTodos }: Props) {
  const [status, setStatus]   = useState<RealtimeStatus>('CONNECTING')
  const [todos, setTodos]     = useState<Todo[]>(initialTodos)
  const [log, setLog]         = useState<LogEntry[]>([])

  const addLog = useCallback((entry: LogEntry) => {
    setLog(prev => [...prev.slice(-99), entry])
  }, [])

  const liveStats = useMemo(() => ({
    total:     todos.length,
    completed: todos.filter(t => t.status === 'completed').length,
    failed:    todos.filter(t => t.status === 'failed').length,
    active:    todos.filter(t => t.status === 'in_progress').length,
  }), [todos])

  return (
    <div className="space-y-4">
      <VictoryFlash todos={todos} />
      <CommandPalette todos={todos} />

      <DashboardHeader stats={liveStats} />

      <div className="rounded border border-slate-800/50 bg-black/30 px-4 py-3 space-y-2">
        <div className="flex items-center justify-between gap-3">
          <span className="text-[10px] font-mono text-slate-700 tracking-[0.25em] uppercase select-none">
            ◈ System Status
          </span>
          <ConnectionStatus status={status} />
        </div>
        <StatsBar todos={todos} />
      </div>

      <div id={SECTION_IDS.inbox}>
        <TaskInbox todos={todos} />
      </div>

      <CIStatus />

      <div id={SECTION_IDS.controls}>
        <AgentControlPanel />
      </div>

      <GitHistory />

      <div id={SECTION_IDS.god}>
        <GodView todos={todos} />
      </div>

      <div id={SECTION_IDS.active}>
        <ActiveAgent todos={todos} />
      </div>

      <div id={SECTION_IDS.cost}>
        <CostTracker />
      </div>

      <div id={SECTION_IDS.revenue}>
        <RevenueTracker />
      </div>

      <StreakCounter todos={todos} />

      <div id={SECTION_IDS.pixel}>
        <PixelDungeon todos={todos} />
      </div>

      <div id={SECTION_IDS.analytics} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <HeatmapTimeline todos={todos} />
        </div>
        <PriorityRadar todos={todos} />
      </div>

      <ContributionGraph />

      <AgentXPBar todos={todos} />
      <AgentComparisonTable todos={todos} />

      <div id={SECTION_IDS.feed}>
        <LiveFeed />
      </div>

      <BattleLog entries={log} />

      <AddTodoForm />
      <div id={SECTION_IDS.todos}>
        <TodosTable
          todos={todos}
          setTodos={setTodos}
          onStatusChange={setStatus}
          onLogEntry={addLog}
        />
      </div>

      <div className="flex items-center gap-3 pt-2">
        <div className="h-px flex-1 bg-gradient-to-r from-cyan-900/30 to-transparent" />
        <span className="text-xs font-mono text-slate-700 tracking-widest">
          SYS.UPLINK // SUPABASE REALTIME // WS ACTIVE · ⌘K FOR COMMANDS
        </span>
        <div className="h-px flex-1 bg-gradient-to-l from-cyan-900/30 to-transparent" />
      </div>
    </div>
  )
}
