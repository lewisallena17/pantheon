'use client'

import { Component, type ReactNode } from 'react'

interface Props {
  /** Optional label rendered in the error state ("Failed to load: <label>") */
  label?: string
  /** Optional reset key — when this changes, the boundary clears its error */
  resetKey?: string | number
  children: ReactNode
}

interface State { error: Error | null }

/**
 * Per-panel error boundary. Wrap any panel that fetches / parses data so
 * one runtime error doesn't whitescreen the whole dashboard. Renders a
 * tiny dismissable chip that shows the error and a "retry" button.
 *
 * NB: needs to be a class — React's hook-based error handling doesn't
 * cover render-phase errors of children.
 */
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State { return { error } }

  componentDidUpdate(prev: Props) {
    if (prev.resetKey !== this.props.resetKey && this.state.error) {
      this.setState({ error: null })
    }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error(`[panel error${this.props.label ? ` — ${this.props.label}` : ''}]`, error, info.componentStack?.slice(0, 200))

    // Optional Sentry forwarding — env-gated. Only fires when the user has
    // actually configured a DSN, so this is zero-cost-by-default. We post
    // to Sentry's HTTP endpoint directly to avoid pulling the @sentry/nextjs
    // dependency (~50KB) into every bundle for a feature that's off by default.
    const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN
    if (!dsn) return
    try {
      const m = dsn.match(/https:\/\/([^@]+)@([^/]+)\/(\d+)/)
      if (!m) return
      const [, key, host, projectId] = m
      const url = `https://${host}/api/${projectId}/store/?sentry_key=${key}&sentry_version=7`
      void fetch(url, {
        method:  'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          message:  `Panel error: ${this.props.label ?? 'unlabeled'} — ${error.message}`,
          level:    'error',
          platform: 'javascript',
          timestamp: Math.floor(Date.now() / 1000),
          tags:     { panel: this.props.label ?? 'unknown' },
          extra:    { componentStack: info.componentStack?.slice(0, 1000) },
        }),
        keepalive: true,
      }).catch(() => {})
    } catch {}
  }

  reset = () => this.setState({ error: null })

  render() {
    if (this.state.error) {
      return (
        <div className="rounded border border-red-800/50 bg-red-950/20 px-3 py-2 text-[11px] font-mono">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-red-400 flex-shrink-0">⚠</span>
              <span className="text-red-300 truncate">
                {this.props.label ? `Panel "${this.props.label}" failed: ` : 'Panel failed: '}
                <span className="text-slate-400">{this.state.error.message?.slice(0, 80) || 'unknown error'}</span>
              </span>
            </div>
            <button
              onClick={this.reset}
              className="flex-shrink-0 text-[10px] tracking-widest text-cyan-500 hover:text-cyan-300 uppercase"
            >retry</button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
