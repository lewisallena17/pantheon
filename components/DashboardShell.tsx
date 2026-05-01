'use client'

import { useState, useCallback, useMemo, useEffect } from 'react'
import dynamic from 'next/dynamic'
import type { Todo } from '@/types/todos'

// ── Eager imports — used on Overview tab (the default) or as cross-cutting chrome ──
import { type RealtimeStatus } from './TodosTable'
import { type LogEntry } from './BattleLog'
import ConnectionStatus from './ConnectionStatus'
import StatsBar from './StatsBar'
import GodView from './GodView'
import CostTracker from './CostTracker'
import ActiveAgent from './ActiveAgent'
import DashboardHeader from './DashboardHeader'
import TaskInbox from './TaskInbox'
import CommandPalette, { SECTION_IDS } from './CommandPalette'
import LiveFeed from './LiveFeed'
import CIStatus from './CIStatus'
import Collapsible from './Collapsible'
import StickyHeader from './StickyHeader'
import NotificationStatus from './NotificationStatus'
import CriticalAlertBanner from './CriticalAlertBanner'
import FailedFastLane from './FailedFastLane'
import VictoryFlash from './VictoryFlash'
import UserProfile from './UserProfile'
import BootSplash from './BootSplash'
import DataTicker from './DataTicker'
import HouseCup from './HouseCup'
import TrophyNotifier, { TrophyCase } from './TrophyNotifier'
import JarvisBriefing from './JarvisBriefing'
import GoalGraph from './GoalGraph'
import JarvisVoiceOrb from './JarvisVoiceOrb'
import LastDayDigest from './LastDayDigest'
import KeyboardShortcuts from './KeyboardShortcuts'
import PanelShell from './PanelShell'
import MobileDisclosure from './MobileDisclosure'
import TimeWindowPicker from './TimeWindowPicker'
import { TimeWindowProvider } from '@/lib/useTimeWindow'
import TaskTraceDrawer from './TaskTraceDrawer'
import AgentDrilldown from './AgentDrilldown'
import AskGod from './AskGod'
import WeekHighlights from './WeekHighlights'
import AlertRules from './AlertRules'
import ForwardCalendar from './ForwardCalendar'
import SystemNews from './SystemNews'
import ForYouFeed from './ForYouFeed'
import MetricOverlayChart from './MetricOverlayChart'
import InvariantChip from './InvariantChip'
import ErrorBoundary from './ErrorBoundary'
import KeyboardShortcutsModal from './KeyboardShortcutsModal'

// ── Dynamic imports — only loaded when their tab is opened. Cuts initial JS by ~70%.
// Direct form (no generic wrapper) so next/dynamic preserves each component's prop types.

// Tasks tab
const TodosTable          = dynamic(() => import('./TodosTable'),          { ssr: false })
const TaskKanban          = dynamic(() => import('./TaskKanban'),          { ssr: false })
const HeatmapTimeline     = dynamic(() => import('./HeatmapTimeline'),     { ssr: false })
const PriorityRadar       = dynamic(() => import('./PriorityRadar'),       { ssr: false })
const QualityDistribution = dynamic(() => import('./QualityDistribution'), { ssr: false })
const AddTodoForm         = dynamic(() => import('./AddTodoForm'),         { ssr: false })
const RecentTasksStrip    = dynamic(() => import('./RecentTasksStrip'),    { ssr: false })

// Agents tab
const PixelDungeon         = dynamic(() => import('./PixelDungeon'),         { ssr: false })
const AgentRPGStats        = dynamic(() => import('./AgentRPGStats'),        { ssr: false })
const AgentConversations   = dynamic(() => import('./AgentConversations'),   { ssr: false })
const AgentComparisonTable = dynamic(() => import('./AgentComparisonTable'), { ssr: false })
const SkillCatalog         = dynamic(() => import('./SkillCatalog'),         { ssr: false })
const TrustScores          = dynamic(() => import('./TrustScores'),          { ssr: false })
const EavesdropFeed        = dynamic(() => import('./EavesdropFeed'),        { ssr: false })
const AgentXPBar           = dynamic(() => import('./AgentXPBar'),           { ssr: false })
const BattleLog            = dynamic(() => import('./BattleLog'),            { ssr: false })
const StreakCounter        = dynamic(() => import('./StreakCounter'),        { ssr: false })
const AgentControlPanel    = dynamic(() => import('./AgentControlPanel'),    { ssr: false })
const AgentPoolStrip       = dynamic(() => import('./AgentPoolStrip'),       { ssr: false })
const PanicButton          = dynamic(() => import('./PanicButton'),          { ssr: false })

// Revenue tab
const RevenueChart        = dynamic(() => import('./RevenueChart'),        { ssr: false })
const RevenueTracker      = dynamic(() => import('./RevenueTracker'),      { ssr: false })
const RevenueAutomation   = dynamic(() => import('./RevenueAutomation'),   { ssr: false })
const MarketplaceListings = dynamic(() => import('./MarketplaceListings'), { ssr: false })
const MarketIntel         = dynamic(() => import('./MarketIntel'),         { ssr: false })
const SubscribersPanel    = dynamic(() => import('./SubscribersPanel'),    { ssr: false })
const NewsletterComposer  = dynamic(() => import('./NewsletterComposer'),  { ssr: false })
const PassiveIncomeStatus = dynamic(() => import('./PassiveIncomeStatus'), { ssr: false })

// Code tab
const GitHistory          = dynamic(() => import('./GitHistory'),          { ssr: false })
const ContributionGraph   = dynamic(() => import('./ContributionGraph'),   { ssr: false })
const DevToLiveStats      = dynamic(() => import('./DevToLiveStats'),      { ssr: false })
const VerificationPanel   = dynamic(() => import('./VerificationPanel'),   { ssr: false })
const LatencyDistribution = dynamic(() => import('./LatencyDistribution'), { ssr: false })

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

  // Shared cost data (drives WeekHighlights, AlertRules, MetricOverlayChart)
  const [costByAgent, setCostByAgent]   = useState<Record<string, number>>({})
  const [costSessions, setCostSessions] = useState<Array<{ at: string; cost: number; agent: string }>>([])

  // Drawer state — opened from anywhere via the handlers below
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null)
  const [selectedPool, setSelectedPool] = useState<string | null>(null)

  useEffect(() => {
    async function loadCost() {
      try {
        const r = await fetch('/api/cost', { cache: 'no-store' })
        if (r.ok) {
          const j = await r.json() as { byAgent?: Record<string, number>; sessions?: Array<{ at: string; cost: number; agent: string }> }
          setCostByAgent(j.byAgent ?? {})
          setCostSessions(j.sessions ?? [])
        }
      } catch {}
    }
    loadCost()
    const id = setInterval(loadCost, 30_000)
    return () => clearInterval(id)
  }, [])

  const todaySpend = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10)
    return costSessions.filter(s => s.at?.startsWith(today)).reduce((sum, s) => sum + (s.cost ?? 0), 0)
  }, [costSessions])

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

  // Optimistic removal: mark retried tasks as pending in local state so the
  // FailedFastLane collapses immediately without waiting for a Realtime event.
  const handleRetried = useCallback((ids: string[]) => {
    const idSet = new Set(ids)
    setTodos(prev => prev.map(t => idSet.has(t.id) ? { ...t, status: 'pending' } : t))
  }, [])

  const gap = compact ? 'space-y-2' : 'space-y-4'

  return (
    <TimeWindowProvider>
    <div className="space-y-2 pb-10">
      <BootSplash />
      <DataTicker todos={todos} />
      <TrophyNotifier todos={todos} />
      <JarvisVoiceOrb />

      {/* ── Critical failure banner — renders only when fail rate ≥ 60% ── */}
      <CriticalAlertBanner todos={todos} />

      <VictoryFlash todos={todos} />
      <CommandPalette todos={todos} />

      <KeyboardShortcutsModal />

      <ErrorBoundary label="invariants"><InvariantChip /></ErrorBoundary>

      <DashboardHeader stats={liveStats} todos={todos} />

      <StickyHeader
        todos={todos}
        activeTab={tab}
        onTab={(k) => setTab(k as TabKey)}
        tabs={tabsWithBadges}
        compact={compact}
        onToggleCompact={() => setCompact(v => !v)}
      />

      {/* ── OVERVIEW TAB — three zones: top (always), middle (collapsed), bottom ── */}
      {tab === 'overview' && (
        <ErrorBoundary label="overview tab"><div className={gap}>
          {/* Global time window picker — respected by panels that opt in */}
          <div className="flex items-center justify-end gap-2 px-1">
            <span className="text-[9px] font-mono text-slate-700 tracking-widest uppercase">window:</span>
            <TimeWindowPicker />
          </div>

          {/* ZONE 1 — always visible. The "what do I need to know" layer. */}
          <LastDayDigest todos={todos} />

          <WeekHighlights todos={todos} costByAgent={costByAgent} />

          <ForYouFeed todos={todos} />

          <AlertRules todos={todos} todaySpend={todaySpend} />

          <GoalGraph todos={todos} />

          <ForwardCalendar todos={todos} />

          <div id={SECTION_IDS.god}>
            <GodView todos={todos} />
          </div>

          <AskGod />

          {/* Failed Fast-Lane auto-hides when empty, so it's here if needed */}
          <FailedFastLane todos={todos} onRetried={handleRetried} />

          {/* ZONE 2 — collapsed by default. The "everything else" layer. */}
          <PanelShell
            id="overview-more"
            title="More Panels"
            icon="▾"
            collapsible
            defaultOpen={false}
            chipRight={<span className="text-[10px] font-mono text-slate-600">briefings · trophies · houses · inbox · cost · profile</span>}
          >
            <div className={`p-3 ${gap}`}>
              <JarvisBriefing />

              <HouseCup todos={todos} />

              <TrophyCase todos={todos} />

              <UserProfile />

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

              <div id={SECTION_IDS.active}>
                <ActiveAgent todos={todos} />
              </div>

              <div id={SECTION_IDS.cost}>
                <CostTracker />
              </div>

              <NotificationStatus />

              <SystemNews />

              <MetricOverlayChart todos={todos} costSessions={costSessions} />
            </div>
          </PanelShell>

          {/* ZONE 3 — always-open streaming feed at the bottom */}
          <Collapsible id="overview-feed" title="Live Feed" defaultOpen={!compact}>
            <div id={SECTION_IDS.feed}>
              <LiveFeed />
            </div>
          </Collapsible>
        </div></ErrorBoundary>
      )}

      {/* ── TASKS TAB ────────────────────────────────────────────────── */}
      {tab === 'tasks' && (
        <ErrorBoundary label="tasks tab"><div className={gap}>
          <RecentTasksStrip todos={todos} onPick={setSelectedTodo} />

          {/* ── Failed Fast-Lane: pinned above everything on Tasks tab too ── */}
          <FailedFastLane todos={todos} onRetried={handleRetried} />

          <div id={SECTION_IDS.inbox}>
            <TaskInbox todos={todos} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <HeatmapTimeline todos={todos} />
            </div>
            <PriorityRadar todos={todos} />
          </div>

          <TaskKanban todos={todos} />

          <QualityDistribution todos={todos} />

          <AddTodoForm />
          <div id={SECTION_IDS.todos}>
            <TodosTable
              todos={todos}
              setTodos={setTodos}
              onStatusChange={setStatus}
              onLogEntry={addLog}
            />
          </div>
        </div></ErrorBoundary>
      )}

      {/* ── AGENTS TAB ───────────────────────────────────────────────── */}
      {tab === 'agents' && (
        <ErrorBoundary label="agents tab"><div className={gap}>
          <div id={SECTION_IDS.controls}>
            <AgentControlPanel />
          </div>

          <AgentPoolStrip todos={todos} onPick={setSelectedPool} />

          <PanicButton />

          <div id={SECTION_IDS.pixel}>
            <PixelDungeon todos={todos} />
          </div>

          <AgentRPGStats todos={todos} />

          <AgentConversations />

          <MobileDisclosure id="trust-scores" label="Trust scores">
            <TrustScores todos={todos} />
          </MobileDisclosure>

          <MobileDisclosure id="skill-catalog" label="Skill catalog">
            <SkillCatalog />
          </MobileDisclosure>

          <EavesdropFeed />

          <Collapsible id="agents-xp" title="XP Leaderboard" defaultOpen={true}>
            <AgentXPBar todos={todos} />
          </Collapsible>

          <MobileDisclosure id="agent-comparison" label="Agent comparison">
            <Collapsible id="agents-comparison" title="Agent Comparison">
              <AgentComparisonTable todos={todos} />
            </Collapsible>
          </MobileDisclosure>

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
        </div></ErrorBoundary>
      )}

      {/* ── REVENUE TAB ──────────────────────────────────────────────── */}
      {tab === 'revenue' && (
        <ErrorBoundary label="revenue tab"><div className={gap}>
          <PassiveIncomeStatus />
          <RevenueChart />
          <MarketIntel />
          <RevenueTracker />
          <RevenueAutomation />
          <MarketplaceListings />

          <Collapsible id="revenue-subscribers" title="Subscribers" defaultOpen={true}>
            <SubscribersPanel />
          </Collapsible>

          <Collapsible id="revenue-newsletter" title="Newsletter Composer" defaultOpen={false}>
            <NewsletterComposer />
          </Collapsible>
        </div></ErrorBoundary>
      )}

      {/* ── CODE TAB ─────────────────────────────────────────────────── */}
      {tab === 'code' && (
        <ErrorBoundary label="code tab"><div className={gap}>
          <CIStatus />

          <LatencyDistribution todos={todos} />

          <Collapsible id="code-git" title="Git History" defaultOpen={true}>
            <GitHistory />
          </Collapsible>

          <Collapsible id="code-contrib" title="Contribution Graph" defaultOpen={true}>
            <ContributionGraph />
          </Collapsible>

          <Collapsible id="code-devlive" title="Dev → Live Pipeline" defaultOpen={false}>
            <DevToLiveStats />
          </Collapsible>

          <VerificationPanel />
        </div></ErrorBoundary>
      )}

      {/* ── Drawers (portals) ──────────────────────────────────────────── */}
      <TaskTraceDrawer todo={selectedTodo} onClose={() => setSelectedTodo(null)} />
      <AgentDrilldown  pool={selectedPool} todos={todos} costByAgent={costByAgent} onClose={() => setSelectedPool(null)} />
    </div>
    </TimeWindowProvider>
  )
}
