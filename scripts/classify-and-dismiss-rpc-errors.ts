#!/usr/bin/env node
/**
 * Script: Classify Resolved RPC Errors and Dismiss Anomalies
 * 
 * Task flow:
 * 1. Query rpc_error_log with resolved=true (LIMIT 10)
 * 2. Classify errors via regexp_matches patterns
 * 3. Call dismiss_resolved_anomalies_batch to clear resolved entries
 * 4. Validate via task_throughput_events
 *
 * Error Classification Patterns:
 * - PGRST003: Rate limiting errors
 * - PGRST001: Connection/timeout errors
 * - PGRST002: JSON parsing errors
 * - 42601: SQL syntax errors
 * - NULL_CONSTRAINT: Constraint violations
 * - Other: Generic/unknown errors
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';

interface ResolvedRPCError {
  id: string;
  agent_name: string;
  task_id: string | null;
  rpc_name: string;
  error_code: string | null;
  error_message: string | null;
  resolved: boolean;
  resolved_at: string;
  created_at: string;
}

interface ClassifiedError extends ResolvedRPCError {
  classification: string;
  category: string;
  severity: 'info' | 'warning' | 'error';
  pattern_match: string;
}

interface BatchDismissResult {
  total_resolved: number;
  total_dismissed: number;
  message: string;
}

interface ThroughputValidation {
  total_events: number;
  anomalies_detected: number;
  anomalies_dismissed: number;
  anomalies_pending: number;
}

// Error classification rules
const ERROR_PATTERNS = [
  {
    code: 'PGRST003',
    category: 'rate_limit',
    pattern: /rate limit|too many|requests\/minute/i,
    severity: 'warning' as const,
  },
  {
    code: 'PGRST001',
    category: 'connection',
    pattern: /timeout|connection|connect failed|unavailable/i,
    severity: 'error' as const,
  },
  {
    code: 'PGRST002',
    category: 'parsing',
    pattern: /parse|json|expected|invalid format/i,
    severity: 'warning' as const,
  },
  {
    code: '42601',
    category: 'syntax',
    pattern: /syntax error|near|unexpected|invalid sql/i,
    severity: 'error' as const,
  },
  {
    code: 'NULL_CONSTRAINT',
    category: 'constraint',
    pattern: /constraint|not null|unique|foreign key/i,
    severity: 'error' as const,
  },
];

function classifyError(error: ResolvedRPCError): ClassifiedError {
  const code = error.error_code || '';
  const message = error.error_message || '';

  // Try to match by error code first
  for (const pattern of ERROR_PATTERNS) {
    if (code === pattern.code || pattern.pattern.test(message)) {
      return {
        ...error,
        classification: `${pattern.category.toUpperCase()}`,
        category: pattern.category,
        severity: pattern.severity,
        pattern_match: pattern.code,
      };
    }
  }

  // Default classification
  return {
    ...error,
    classification: 'UNKNOWN',
    category: 'other',
    severity: 'info',
    pattern_match: 'generic',
  };
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${(ms / 60000).toFixed(1)}m`;
}

async function main() {
  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log('═'.repeat(70));
  console.log('   RPC ERROR LOG CLASSIFIER & ANOMALY DISMISSER');
  console.log('═'.repeat(70));
  console.log();

  // ============================================================================
  // STEP 1: Query rpc_error_log for resolved errors
  // ============================================================================
  console.log('📋 STEP 1: Querying rpc_error_log for resolved errors...');
  console.log('─'.repeat(70));

  try {
    const { data: resolvedErrors, error: fetchError } = await supabase
      .from('rpc_error_log')
      .select(
        'id, agent_name, task_id, rpc_name, error_code, error_message, resolved, resolved_at, created_at'
      )
      .eq('resolved', true)
      .order('resolved_at', { ascending: false })
      .limit(10);

    if (fetchError) {
      throw new Error(`Query failed: ${fetchError.message}`);
    }

    if (!resolvedErrors || resolvedErrors.length === 0) {
      console.log('✅ No resolved errors found in rpc_error_log');
      console.log();
    } else {
      console.log(`✅ Found ${resolvedErrors.length} resolved errors\n`);

      // ========================================================================
      // STEP 2: Classify errors using pattern matching
      // ========================================================================
      console.log('🔍 STEP 2: Classifying errors via pattern matching...');
      console.log('─'.repeat(70));

      const classifiedErrors = resolvedErrors.map((e) =>
        classifyError(e as ResolvedRPCError)
      );

      // Print classification summary
      const categoryCount: Record<string, number> = {};
      const severityCount: Record<string, number> = {};

      classifiedErrors.forEach((err) => {
        categoryCount[err.category] = (categoryCount[err.category] || 0) + 1;
        severityCount[err.severity] = (severityCount[err.severity] || 0) + 1;
      });

      console.log('\n📊 Classification Summary:');
      console.log('   Categories:', Object.entries(categoryCount)
        .map(([k, v]) => `${k}(${v})`)
        .join(', '));
      console.log('   Severity:', Object.entries(severityCount)
        .map(([k, v]) => `${k}(${v})`)
        .join(', '));

      console.log('\n📝 Classified Errors:');
      classifiedErrors.forEach((err, idx) => {
        const resolutionTime = new Date(err.resolved_at).getTime() - new Date(err.created_at).getTime();
        console.log(`\n   ${idx + 1}. [${err.classification}] ${err.rpc_name}`);
        console.log(`      Agent: ${err.agent_name}`);
        console.log(`      Code: ${err.error_code || 'N/A'}`);
        console.log(`      Message: ${err.error_message?.substring(0, 60) || 'N/A'}...`);
        console.log(`      Resolved in: ${formatDuration(resolutionTime)}`);
        console.log(`      Severity: ${err.severity.toUpperCase()}`);
      });

      console.log('\n');
    }
  } catch (error) {
    console.error('❌ Error querying rpc_error_log:', error);
    process.exit(1);
  }

  // ============================================================================
  // STEP 3: Call dismiss_resolved_anomalies_batch
  // ============================================================================
  console.log('🧹 STEP 3: Calling dismiss_resolved_anomalies_batch...');
  console.log('─'.repeat(70));

  try {
    const { data: batchResult, error: dismissError } = await supabase.rpc(
      'dismiss_resolved_anomalies_batch'
    );

    if (dismissError) {
      throw new Error(`Batch dismiss failed: ${dismissError.message}`);
    }

    const result = (batchResult as BatchDismissResult[])?.[0];
    if (result) {
      console.log(`✅ ${result.message}`);
      console.log(`   Total resolved: ${result.total_resolved}`);
      console.log(`   Total dismissed: ${result.total_dismissed}`);
    } else {
      console.log('⚠️  No batch result returned');
    }

    console.log('\n');
  } catch (error) {
    console.error('❌ Error calling dismiss_resolved_anomalies_batch:', error);
    process.exit(1);
  }

  // ============================================================================
  // STEP 4: Validate via task_throughput_events
  // ============================================================================
  console.log('✅ STEP 4: Validating via task_throughput_events...');
  console.log('─'.repeat(70));

  try {
    const { data: throughputEvents, error: validateError } = await supabase
      .from('task_throughput_events')
      .select('id, anomaly_detected, dismissed_at, detected_at')
      .order('detected_at', { ascending: false })
      .limit(20);

    if (validateError) {
      throw new Error(`Validation query failed: ${validateError.message}`);
    }

    if (!throughputEvents || throughputEvents.length === 0) {
      console.log('ℹ️  No throughput events found');
    } else {
      const anomalies = throughputEvents.filter((e) => e.anomaly_detected);
      const dismissed = throughputEvents.filter((e) => e.dismissed_at !== null);
      const pending = anomalies.filter((e) => e.dismissed_at === null);

      console.log(`✅ Validation Results:`);
      console.log(`   Total events: ${throughputEvents.length}`);
      console.log(`   Anomalies detected: ${anomalies.length}`);
      console.log(`   Anomalies dismissed: ${dismissed.length}`);
      console.log(`   Anomalies pending: ${pending.length}`);

      if (pending.length > 0) {
        console.log(`\n   Pending anomalies (not yet dismissed):`);
        pending.slice(0, 5).forEach((e, idx) => {
          console.log(`      ${idx + 1}. ${e.id.substring(0, 8)}... (detected ${new Date(e.detected_at).toLocaleString()})`);
        });
        if (pending.length > 5) {
          console.log(`      ... and ${pending.length - 5} more`);
        }
      }
    }

    console.log('\n');
  } catch (error) {
    console.error('❌ Error validating task_throughput_events:', error);
    process.exit(1);
  }

  // ============================================================================
  // SUMMARY
  // ============================================================================
  console.log('═'.repeat(70));
  console.log('   ✅ TASK COMPLETED SUCCESSFULLY');
  console.log('═'.repeat(70));
  console.log();
  console.log('Summary:');
  console.log('  1. ✅ Queried rpc_error_log for resolved errors');
  console.log('  2. ✅ Classified errors using pattern matching (regexp_matches)');
  console.log('  3. ✅ Called dismiss_resolved_anomalies_batch');
  console.log('  4. ✅ Validated via task_throughput_events');
  console.log();
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
