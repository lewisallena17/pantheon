/**
 * Latency Correlation Analysis Runner
 *
 * Analyzes the correlation between task types and API response latency outliers
 * by cross-referencing:
 * - tasks_search_index (task classifications)
 * - agent_sql_execution_log (execution times)
 * - agent_exec_sql_metrics (optional health metrics)
 *
 * Usage: npx ts-node scripts/analyze-latency-correlation.ts
 */

import { createClient } from '@supabase/supabase-js'
import { analyzeLatencyCorrelations, formatAnalysisReport } from '../lib/latency-correlation-analyzer'
import fs from 'fs'
import path from 'path'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

async function main() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error('❌ Missing Supabase credentials in environment variables')
    process.exit(1)
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

  console.log('🔍 Analyzing latency correlations with task classifications...\n')

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const analysis = await analyzeLatencyCorrelations(supabase as any)

    // Print summary
    console.log('📊 GLOBAL STATISTICS')
    console.log('─'.repeat(60))
    console.log(`Total Executions: ${analysis.global_stats.total_executions}`)
    console.log(`Total Tasks: ${analysis.global_stats.total_tasks}`)
    console.log(`P95 Latency: ${analysis.global_stats.global_p95_ms}ms`)
    console.log(`P99 Latency: ${analysis.global_stats.global_p99_ms}ms`)
    console.log(`Outlier Threshold (IQR): ${analysis.global_stats.outlier_threshold_ms}ms`)
    console.log()

    console.log('📈 TASK TYPE LATENCY PROFILES')
    console.log('─'.repeat(60))
    for (const profile of analysis.task_profiles) {
      console.log(
        `${profile.task_type.padEnd(20)} | Tasks: ${profile.task_count}, Execs: ${profile.total_executions}, Avg: ${profile.avg_latency_ms}ms, P95: ${profile.p95_latency_ms}ms, Outliers: ${profile.outlier_ratio.toFixed(2)}%`
      )
    }
    console.log()

    if (analysis.high_risk_tasks.length > 0) {
      console.log('⚠️  HIGH-RISK TASKS (outliers >20% or max >2x P99)')
      console.log('─'.repeat(60))
      for (const task of analysis.high_risk_tasks) {
        console.log(
          `${task.task_id} [${task.classification || 'unknown'}] | Outliers: ${task.outlier_ratio.toFixed(2)}%, Max: ${task.max_latency_ms}ms`
        )
      }
      console.log()
    }

    console.log('📉 STATISTICAL INSIGHTS')
    console.log('─'.repeat(60))
    console.log(`Mean Latency: ${analysis.statistical_insights.mean_latency_all_tasks_ms}ms`)
    console.log(`Std Dev: ${analysis.statistical_insights.std_dev_latency_ms}ms`)
    console.log(`Low-Latency Tasks: ${analysis.statistical_insights.low_latency_tasks.length}`)
    console.log(`High-Latency Tasks: ${analysis.statistical_insights.high_latency_tasks.length}`)
    console.log()

    // Save detailed report
    const reportPath = path.join(process.cwd(), 'latency-correlation-report.json')
    fs.writeFileSync(reportPath, formatAnalysisReport(analysis))
    console.log(`✅ Full report saved to: ${reportPath}`)

    // Return analysis for further processing if needed
    console.log('\n✅ Analysis complete!')
    process.exit(0)
  } catch (error) {
    console.error('❌ Analysis failed:', error instanceof Error ? error.message : String(error))
    process.exit(1)
  }
}

main()
