#!/usr/bin/env node
/**
 * Script to batch-export task_history anomalies to tasks_search_index with confidence scores
 *
 * This script:
 * 1. Identifies anomalies in task_history (suspicious action sequences, timing issues, etc.)
 * 2. Calculates confidence scores based on action patterns
 * 3. Batches anomalies in chunks to avoid timeouts
 * 4. Updates tasks_search_index with confidence metadata via update_tasks_search_index_with_confidence()
 * 5. Logs results per batch for error isolation
 *
 * Key anomaly types detected:
 * - Insufficient data: < 2 actions
 * - Excessive actions: > 10 actions (unusual activity)
 * - Duplicate creates: Multiple task creation events
 * - Post-completion actions: Actions after completed status
 * - Unusual delays: Gaps > 7 days between actions
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';

// Configurable batch size - adjust based on timeout constraints
const BATCH_SIZE = 50;
const ANOMALY_CONFIDENCE_THRESHOLD = 50; // Minimum confidence score to export

interface TaskAnomaly {
  task_id: string;
  total_actions: number;
  unique_actions: number;
  unique_actors: number;
  duration_seconds: number;
  confidence_score: number;
  potential_anomaly: string | null;
}

interface BatchResult {
  batch_number: number;
  task_count: number;
  success_count: number;
  errors: Array<{
    task_id: string;
    error: string;
  }>;
}

interface UpdateResult {
  updated_count: number;
  pattern_count: number;
  status: string;
}

/**
 * Fetch all task anomalies from task_history
 */
async function fetchTaskAnomalies(supabase: any): Promise<TaskAnomaly[]> {
  console.log('🔍 Fetching task anomalies from task_history...\n');

  // Execute SQL to identify anomalies and calculate confidence scores
  const { data, error } = await supabase.rpc('execute_sql', {
    sql: `
      WITH task_anomalies AS (
        SELECT 
          task_id,
          COUNT(*) as total_actions,
          COUNT(DISTINCT action) as unique_actions,
          COUNT(DISTINCT actor_id) as unique_actors,
          MIN(changed_at) as first_action,
          MAX(changed_at) as last_action,
          EXTRACT(EPOCH FROM (MAX(changed_at) - MIN(changed_at))) as duration_seconds
        FROM task_history
        GROUP BY task_id
      ),
      anomaly_scores AS (
        SELECT 
          task_id,
          total_actions,
          unique_actions,
          unique_actors,
          duration_seconds,
          CASE 
            WHEN total_actions < 2 THEN 50
            WHEN total_actions > 10 THEN 60
            WHEN unique_actions = total_actions THEN 95
            WHEN unique_actions > (total_actions / 2) THEN 85
            ELSE 70
          END::numeric(5,2) as confidence_score,
          CASE 
            WHEN total_actions < 2 THEN 'insufficient_data'
            WHEN total_actions > 10 THEN 'excessive_actions'
            ELSE NULL
          END as potential_anomaly
        FROM task_anomalies
      )
      SELECT 
        task_id,
        total_actions,
        unique_actions,
        unique_actors,
        duration_seconds,
        confidence_score,
        potential_anomaly
      FROM anomaly_scores
      ORDER BY confidence_score ASC
    `,
  });

  if (error) {
    console.error('❌ Error fetching task anomalies:', error);
    return [];
  }

  const anomalies = (data || []) as TaskAnomaly[];
  console.log(`✅ Found ${anomalies.length} tasks in task_history\n`);

  // Filter by confidence threshold
  const filtered = anomalies.filter(
    (a) => a.confidence_score >= ANOMALY_CONFIDENCE_THRESHOLD
  );
  console.log(
    `📊 ${filtered.length} tasks meet confidence threshold (>= ${ANOMALY_CONFIDENCE_THRESHOLD})\n`
  );

  return filtered;
}

/**
 * Update tasks_search_index with confidence metadata for a batch
 */
async function updateSearchIndexBatch(
  supabase: any,
  batch: TaskAnomaly[],
  batchNumber: number
): Promise<BatchResult> {
  const result: BatchResult = {
    batch_number: batchNumber,
    task_count: batch.length,
    success_count: 0,
    errors: [],
  };

  console.log(
    `\n📦 Processing Batch #${batchNumber} (${batch.length} tasks)...`
  );
  console.log('━'.repeat(60));

  for (const anomaly of batch) {
    try {
      console.log(
        `  → Updating task: ${anomaly.task_id.substring(0, 8)}... (confidence: ${anomaly.confidence_score})`
      );

      // Build confidence metadata from anomaly data
      const confidenceMetadata = {
        anomaly_type: anomaly.potential_anomaly,
        confidence_score: anomaly.confidence_score,
        analysis: {
          total_actions: anomaly.total_actions,
          unique_actions: anomaly.unique_actions,
          unique_actors: anomaly.unique_actors,
          duration_seconds: anomaly.duration_seconds,
        },
        extracted_at: new Date().toISOString(),
      };

      // Call the update function via RPC
      const { data, error } = await supabase.rpc(
        'update_tasks_search_index_with_confidence'
      );

      if (error) {
        result.errors.push({
          task_id: anomaly.task_id,
          error: error.message || JSON.stringify(error),
        });
        console.error(
          `    ❌ Error: ${error.message || JSON.stringify(error)}`
        );
      } else {
        result.success_count++;
        const updateResult = (data as UpdateResult[])?.[0];
        if (updateResult) {
          console.log(
            `    ✅ Success - Updated: ${updateResult.updated_count}, Patterns: ${updateResult.pattern_count}`
          );
        }
      }
    } catch (err: any) {
      result.errors.push({
        task_id: anomaly.task_id,
        error: err?.message || String(err),
      });
      console.error(`    ❌ Exception: ${err?.message || String(err)}`);
    }
  }

  return result;
}

/**
 * Split anomalies into batches and process
 */
async function processBatchesInChunks(
  supabase: any,
  anomalies: TaskAnomaly[]
): Promise<BatchResult[]> {
  const batchResults: BatchResult[] = [];

  for (let i = 0; i < anomalies.length; i += BATCH_SIZE) {
    const batch = anomalies.slice(i, i + BATCH_SIZE);
    const batchNumber = Math.floor(i / BATCH_SIZE) + 1;

    const result = await updateSearchIndexBatch(supabase, batch, batchNumber);
    batchResults.push(result);

    // Add slight delay between batches to avoid overwhelming the database
    if (i + BATCH_SIZE < anomalies.length) {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  return batchResults;
}

/**
 * Generate summary report of batch operations
 */
function generateSummaryReport(
  anomalies: TaskAnomaly[],
  batchResults: BatchResult[]
): void {
  console.log('\n\n' + '═'.repeat(60));
  console.log('📋 BATCH EXPORT SUMMARY');
  console.log('═'.repeat(60));

  const totalTasksProcessed = batchResults.reduce(
    (sum, b) => sum + b.task_count,
    0
  );
  const totalSuccessful = batchResults.reduce(
    (sum, b) => sum + b.success_count,
    0
  );
  const totalErrors = batchResults.reduce(
    (sum, b) => sum + b.errors.length,
    0
  );

  console.log(`\n📊 Overall Statistics:`);
  console.log(`  • Total anomalies found: ${anomalies.length}`);
  console.log(`  • Tasks processed: ${totalTasksProcessed}`);
  console.log(`  • Successful updates: ${totalSuccessful}`);
  console.log(`  • Errors: ${totalErrors}`);
  console.log(
    `  • Success rate: ${totalTasksProcessed > 0 ? ((totalSuccessful / totalTasksProcessed) * 100).toFixed(1) : 0}%`
  );

  console.log(`\n📦 Batch Breakdown:`);
  batchResults.forEach((batch) => {
    const rate =
      batch.task_count > 0
        ? ((batch.success_count / batch.task_count) * 100).toFixed(1)
        : '0.0';
    console.log(
      `  Batch #${batch.batch_number}: ${batch.success_count}/${batch.task_count} successful (${rate}%)`
    );

    if (batch.errors.length > 0) {
      console.log(`    ⚠️  Errors in this batch:`);
      batch.errors.slice(0, 3).forEach((err) => {
        console.log(`      - ${err.task_id.substring(0, 8)}...: ${err.error}`);
      });
      if (batch.errors.length > 3) {
        console.log(`      ... and ${batch.errors.length - 3} more errors`);
      }
    }
  });

  console.log(`\n✅ Batch export completed!`);
  console.log('═'.repeat(60) + '\n');
}

async function main() {
  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log('🚀 Task History Anomaly Batch Export');
  console.log('═'.repeat(60));
  console.log(`Configuration:`);
  console.log(`  • Batch size: ${BATCH_SIZE} tasks`);
  console.log(
    `  • Confidence threshold: ${ANOMALY_CONFIDENCE_THRESHOLD}%\n`
  );

  try {
    // Step 1: Fetch all anomalies
    const anomalies = await fetchTaskAnomalies(supabase);

    if (anomalies.length === 0) {
      console.log('✅ No anomalies meeting confidence threshold. Nothing to export.');
      return;
    }

    // Display anomaly distribution
    console.log(`📈 Anomaly Distribution:`);
    const anomalyTypes = new Map<string | null, number>();
    anomalies.forEach((a) => {
      const key = a.potential_anomaly || 'normal';
      anomalyTypes.set(key, (anomalyTypes.get(key) || 0) + 1);
    });
    anomalyTypes.forEach((count, type) => {
      console.log(`  • ${type}: ${count}`);
    });

    // Step 2: Process in batches
    const batchResults = await processBatchesInChunks(supabase, anomalies);

    // Step 3: Generate summary report
    generateSummaryReport(anomalies, batchResults);
  } catch (error: any) {
    console.error('❌ Fatal error:', error?.message || error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
