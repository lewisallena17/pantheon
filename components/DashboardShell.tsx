'use client'

import { useState, useCallback, useMemo, useEffect } from 'react'
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
import DevToLiveStats from './DevToLiveStats'
import RevenueAutomation from './RevenueAutomation'
import Collapsible from './Collapsible'
import StickyHeader from './StickyHeader'
import NotificationStatus from './NotificationStatus'

interface Props {
  initialTodos: Todo[]
}

type TabKey = 'overview' | 'tasks' | 'agents' | 'revenue' | 'code'

const TABS: Array<{ key: TabKey; label: string; icon: string }> = [
  { key: 'overview', label: 'Overview', icon: '◈' },
  { key: 'tasks',    label: 'Tasks',    icon: '◆' },
  { key: 'agents',   label: 'Agents',   icon: '⚡' },
  { key: 'revenue',  label: 'Revenue',  icon: '💰' },
  { key: 'code',     label: 'Code',     icon: '⎇' },
]

export default function DashboardShell({ initialTodos }: Props) {
  const [status, setStatus]   = useState<RealtimeStatus>('CONNECTING')
  const [todos, setTodos]     = useState<Todo[]>(initialTodos)
  const [log, setLog]         = useState<LogEntry[]>([])
  const [tab, setTab]         = useState<TabKey>('overview')
  const [compact, setCompact] = useState(false)

  // Hydrate saved tab + density from localStorage
  useEffect(() => {
    try {
      const savedTab = localStorage.getItem('dash:tab') as TabKey | null
      if (savedTab && TABS.some(t => t.key === savedTab)) setTab(savedTab)
      const savedCompact = localStorage.getItem('dash:compact')
      if (savedCompact === '1') setCompact(true)
    } catch {}
  }, [])

  useEffect(() => { try { localStorage.setItem('dash:tab', tab) } catch {} }, [tab])
  useEffect(() => { try { localStorage.setItem('dash:compact', compact ? '1' : '0') } catch {} }, [compact])

  // Keyboard: 1-5 switch tabs (ignoring typing contexts)
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement
      if (target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA' || target?.isContentEditable) return
      if (e.ctrlKey || e.metaKey || e.altKey) return
      const n = Number(e.key)
      if (n >= 1 && n <= TABS.length) setTab(TABS[n - 1].key)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const addLog = useCallback((entry: LogEntry) => {
    setLog(prev => [...prev.slice(-99), entry])
  }, [])

  const liveStats = useMemo(() => ({
    total:     todos.length,
    completed: todos.filter(t => t.status === 'completed').length,
    failed:    todos.filter(t => t.status === 'failed').length,
    active:    todos.filter(t => t.status === 'in_progress').length,
  }), [todos])

  const proposedCount = useMemo(
    () => todos.filter(t => t.status === 'proposed').length,
    [todos],
  )

  const tabsWithBadges = useMemo(() =>
    TABS.map(t => t.key === 'tasks' ? { ...t, badge: proposedCount } : t),
    [proposedCount],
  )

  const gap = compact ? 'space-y-2' : 'space-y-4'

  return (
    <div className="space-y-2">
      <VictoryFlash todos={todos} />
      <CommandPalette todos={todos} />

      <DashboardHeader stats={liveStats} />

      <StickyHeader
        todos={todos}
        activeTab={tab}
        onTab={(k) => setTab(k as TabKey)}
        tabs={tabsWithBadges}
        compact={compact}
        onToggleCompact={() => setCompact(v => !v)}
      />

      {/* ── OVERVIEW TAB ─────────────────────────────────────────────── */}
      {tab === 'overview' && (
        <div className={gap}>
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

          <div id={SECTION_IDS.god}>
            <GodView todos={todos} />
          </div>

          <div id={SECTION_IDS.active}>
            <ActiveAgent todos={todos} />
          </div>

          <div id={SECTION_IDS.cost}>
            <CostTracker />
          </div>

          <NotificationStatus />

          <Collapsible id="overview-feed" title="Live Feed" defaultOpen={!compact}>
            <div id={SECTION_IDS.feed}>
              <LiveFeed />
            </div>
          </Collapsible>
        </div>
      )}

      {/* ── TASKS TAB ────────────────────────────────────────────────── */}
      {tab === 'tasks' && (
        <div className={gap}>
          <div id={SECTION_IDS.inbox}>
            <TaskInbox todos={todos} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <HeatmapTimeline todos={todos} />
            </div>
            <PriorityRadar todos={todos} />
          </div>

          <AddTodoForm />
          <div id={SECTION_IDS.todos}>
            <TodosTable
              todos={todos}
              setTodos={setTodos}
              onStatusChange={setStatus}
              onLogEntry={addLog}
            />
          </div>
        </div>
      )}

      {/* ── AGENTS TAB ───────────────────────────────────────────────── */}
      {tab === 'agents' && (
        <div className={gap}>
          <div id={SECTION_IDS.controls}>
            <AgentControlPanel />
          </div>

          <div id={SECTION_IDS.pixel}>
            <PixelDungeon todos={todos} />
          </div>

          <Collapsible id="agents-xp" title="XP Leaderboard" defaultOpen={true}>
            <AgentXPBar todos={todos} />
          </Collapsible>

          <Collapsible id="agents-comparison" title="Agent Comparison">
            <AgentComparisonTable todos={todos} />
          </Collapsible>

          <Collapsible id="agents-feed" title="Live Log Feed">
            <div id={SECTION_IDS.feed}>
              <LiveFeed />
            </div>
          </Collapsible>

          <Collapsible id="agents-streak" title="Streak + Battle Log" defaultOpen={false}>
            <div className="space-y-3">
              <StreakCounter todos={todos} />
              <BattleLog entries={log} />
            </div>
          </Collapsible>
        </div>
      )}

      {/* ── REVENUE TAB ──────────────────────────────────────────────── */}
      {tab === 'revenue' && (
        <div id={SECTION_IDS.revenue} className={gap}>
          <RevenueTracker />
          <DevToLiveStats />
          <RevenueAutomation />
        </div>
      )}

      {/* ── CODE TAB ─────────────────────────────────────────────────── */}
      {tab === 'code' && (
        <div className={gap}>
          <GitHistory />
          <ContributionGraph />
          <CIStatus />
        </div>
      )}

      <div className="flex items-center gap-3 pt-2">
        <div className="h-px flex-1 bg-gradient-to-r from-cyan-900/30 to-transparent" />
        <span className="text-[9px] font-mono text-slate-700 tracking-widest">
          SYS.UPLINK · ⌘K commands · 1-5 switch tabs
        </span>
        <div className="h-px flex-1 bg-gradient-to-l from-cyan-900/30 to-transparent" />
      </div>
    </div>
  )
}
