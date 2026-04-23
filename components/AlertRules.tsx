'use client'

import { useEffect, useMemo, useState } from 'react'
import type { Todo } from '@/types/todos'
import PanelShell from './PanelShell'

type Metric   = 'daily_cost' | 'success_rate' | 'failed_count' | 'active_count'
type Operator = 'gt' | 'lt'

interface Rule {
  id:       string
  metric:   Metric
  op:       Operator
  value:    number
  label:    string
  enabled:  boolean
}

const METRICS: Record<Metric, { label: string; unit: string; default: number; defaultOp: Operator }> = {
  daily_cost:   { label: 'Daily cost (USD)',      unit: '$',  default: 1.5, defaultOp: 'gt' },
  success_rate: { label: 'Success rate (7d, %)',  unit: '%',  default: 60,  defaultOp: 'lt' },
  failed_count: { label: 'Failed tasks today',    unit: '',   default: 5,   defaultOp: 'gt' },
  active_count: { label: 'Active tasks now',      unit: '',   default: 10,  defaultOp: 'gt' },
}

function mkId() { return Math.random().toString(36).slice(2, 8) }

/**
 * User-defined alerts. Pure client-side for now — evaluates against live
 * props each render and shows a tripped-chip on matching rules. No push
 * notifications yet; later we can wire to the existing NotificationStatus
 * server-sent events.
 */
export default function AlertRules({ todos, todaySpend }: { todos: Todo[]; todaySpend: number }) {
  const [rules, setRules] = useState<Rule[]>([])
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem('alert-rules')
      if (raw) setRules(JSON.parse(raw))
    } catch {}
  }, [])

  useEffect(() => {
    try { localStorage.setItem('alert-rules', JSON.stringify(rules)) } catch {}
  }, [rules])

  const values = useMemo(() => {
    const d7      = Date.now() - 7 * 86_400_000
    const today   = new Date().toISOString().slice(0, 10)
    const last7   = todos.filter(t => new Date(t.updated_at).getTime() >= d7)
    const c       = last7.filter(t => t.status === 'completed').length
    const f       = last7.filter(t => t.status === 'failed').length
    const rate    = c + f > 0 ? Math.round(c / (c + f) * 100) : 100
    const failedToday = todos.filter(t => t.status === 'failed' && t.updated_at?.startsWith(today)).length
    const active      = todos.filter(t => t.status === 'in_progress').length
    return {
      daily_cost:   todaySpend,
      success_rate: rate,
      failed_count: failedToday,
      active_count: active,
    }
  }, [todos, todaySpend])

  function tripped(r: Rule): boolean {
    const v = values[r.metric]
    return r.op === 'gt' ? v > r.value : v < r.value
  }

  function addRule(metric: Metric, op: Operator, value: number) {
    const meta = METRICS[metric]
    const label = `${meta.label} ${op === 'gt' ? '>' : '<'} ${meta.unit}${value}`
    setRules(prev => [...prev, { id: mkId(), metric, op, value, label, enabled: true }])
    setAdding(false)
  }

  const trippedCount = rules.filter(r => r.enabled && tripped(r)).length

  return (
    <PanelShell
      title="Alerts"
      icon="◬"
      tone={trippedCount > 0 ? 'red' : 'default'}
      collapsible
      id="alerts"
      defaultOpen={trippedCount > 0}
      chipRight={
        <span className={`text-[10px] font-mono ${trippedCount > 0 ? 'text-red-400 animate-pulse' : 'text-slate-600'}`}>
          {trippedCount > 0 ? `⛔ ${trippedCount} TRIPPED` : `${rules.length} rules`}
        </span>
      }
    >
      <div className="px-4 py-3 space-y-2">
        {rules.length === 0 && !adding && (
          <div className="text-[11px] font-mono text-slate-600">No rules yet. Add one below.</div>
        )}
        {rules.map(r => {
          const trip = r.enabled && tripped(r)
          const cur  = values[r.metric]
          return (
            <div key={r.id} className={`flex items-center gap-2 text-[11px] font-mono p-2 rounded border ${trip ? 'border-red-800/60 bg-red-950/20' : 'border-slate-800/40 bg-black/30'}`}>
              <input
                type="checkbox"
                checked={r.enabled}
                onChange={e => setRules(prev => prev.map(x => x.id === r.id ? { ...x, enabled: e.target.checked } : x))}
                className="flex-shrink-0 accent-cyan-600"
              />
              <span className={`flex-1 truncate ${trip ? 'text-red-300' : 'text-slate-400'}`}>{r.label}</span>
              <span className={`tabular-nums ${trip ? 'text-red-400' : 'text-slate-600'}`}>now: {cur}</span>
              {trip && <span className="text-red-500 animate-pulse">⛔</span>}
              <button
                onClick={() => setRules(prev => prev.filter(x => x.id !== r.id))}
                className="text-slate-700 hover:text-red-400"
                aria-label="Delete rule"
              >×</button>
            </div>
          )
        })}

        {adding ? (
          <AlertForm onSubmit={addRule} onCancel={() => setAdding(false)} />
        ) : (
          <button
            onClick={() => setAdding(true)}
            className="w-full text-[10px] font-mono text-cyan-600 hover:text-cyan-300 tracking-widest uppercase py-1 border border-dashed border-slate-800/60 rounded"
          >
            + add rule
          </button>
        )}
      </div>
    </PanelShell>
  )
}

function AlertForm({ onSubmit, onCancel }: { onSubmit: (m: Metric, op: Operator, v: number) => void; onCancel: () => void }) {
  const [metric, setMetric] = useState<Metric>('daily_cost')
  const [op, setOp]         = useState<Operator>(METRICS.daily_cost.defaultOp)
  const [value, setValue]   = useState(METRICS.daily_cost.default)

  function pick(m: Metric) {
    setMetric(m)
    setOp(METRICS[m].defaultOp)
    setValue(METRICS[m].default)
  }

  return (
    <div className="p-2 border border-slate-800/60 rounded bg-black/50 space-y-2">
      <select value={metric} onChange={e => pick(e.target.value as Metric)} className="w-full bg-black/60 text-[11px] font-mono text-slate-300 border border-slate-800 rounded px-2 py-1">
        {(Object.keys(METRICS) as Metric[]).map(m => <option key={m} value={m}>{METRICS[m].label}</option>)}
      </select>
      <div className="flex gap-2">
        <select value={op} onChange={e => setOp(e.target.value as Operator)} className="bg-black/60 text-[11px] font-mono text-slate-300 border border-slate-800 rounded px-2 py-1">
          <option value="gt">&gt;</option>
          <option value="lt">&lt;</option>
        </select>
        <input
          type="number"
          step="0.01"
          value={value}
          onChange={e => setValue(parseFloat(e.target.value) || 0)}
          className="flex-1 bg-black/60 text-[11px] font-mono text-slate-300 border border-slate-800 rounded px-2 py-1"
        />
        <button onClick={() => onSubmit(metric, op, value)} className="text-[10px] font-mono text-cyan-400 tracking-widest uppercase px-2">save</button>
        <button onClick={onCancel} className="text-[10px] font-mono text-slate-600 tracking-widest uppercase px-2">cancel</button>
      </div>
    </div>
  )
}
