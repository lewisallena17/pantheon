#!/usr/bin/env node
/**
 * Batch Dismiss Resolved Anomalies from alert_detections
 *
 * This script implements chunked pagination (1000 records per batch) to dismiss
 * resolved anomalies from the alert_detections table using the
 * execute_dismiss_resolved_anomalies_batch() function.
 *
 * Features:
 * - 1000-record chunking for efficient batch processing
 * - Retry logic for failed batches
 * - Detailed progress reporting
 * - Transaction-safe dismissal with logging
 * - Graceful error handling
 *
 * Usage:
 *   npx ts-node scripts/batch-dismiss-alert-detections.ts
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';

// Constants
const CHUNK_SIZE = 1000;
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

interface ExecuteDismissResult {
  batch_id: string;
  total_resolved: number;
  total_dismissed: number;
  message: string;
  execution_status: string;
  logged_at: string;
}

interface BatchProgress {
  batch_number: number;
  start_offset: number;
  chunk_size: number;
  total_records: number;
  status: 'pending' | 'success' | 'failed' | 'retry';
  attempt: number;
  result?: ExecuteDismissResult;
  error?: string;
}

/**
 * Delay helper for retry logic
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Fetch resolved anomalies from alert_detections with pagination
 */
async function fetchResolvedAnomalies(
  supabase: any,
  offset: number,
  limit: number
): Promise<{ ids: string[]; total_count: number; error?: string }> {
  try {
    // First, get the total count
    const countResult = await supabase
      .from('alert_detections')
      .select('*', { count: 'exact', head: true })
      .eq('resolved', true)
      .is('dismissed_at', null);

    if (countResult.error) {
      return {
        ids: [],
        total_count: 0,
        error: `Count query failed: ${countResult.error.message}`,
      };
    }

    const total_count = countResult.count || 0;

    // Then fetch the IDs with pagination
    const dataResult = await supabase
      .from('alert_detections')
      .select('id')
      .eq('resolved', true)
      .is('dismissed_at', null)
      .order('resolved_at', { ascending: true })
      .range(offset, offset + limit - 1);

    if (dataResult.error) {
      return {
        ids: [],
        total_count: 0,
        error: `Data query failed: ${dataResult.error.message}`,
      };
    }

    const ids = (dataResult.data || []).map((row: any) => row.id);
    return { ids, total_count };
  } catch (error) {
    return {
      ids: [],
      total_count: 0,
      error: `Fetch exception: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

/**
 * Execute dismiss for a single batch with retry logic
 */
async function executeBatchDismiss(
  supabase: ReturnType<typeof createClient>,
  batch: BatchProgress,
  agentName: string = 'BATCH_DISMISS_ALERT_DETECTIONS'
): Promise<BatchProgress> {
  let attempt = batch.attempt;
  let lastError: string | undefined;

  while (attempt <= MAX_RETRIES) {
    try {
      batch.attempt = attempt;
      batch.status = attempt > 1 ? 'retry' : 'pending';

      console.log(
        `\n📦 Batch ${batch.batch_number} (Attempt ${attempt}/${MAX_RETRIES})`
      );
      console.log(`   Offset: ${batch.start_offset}, Limit: ${batch.chunk_size}`);

      // Call the execute_dismiss_resolved_anomalies_batch function
      const { data, error } = await supabase.rpc(
        'execute_dismiss_resolved_anomalies_batch',
        { p_agent_name: agentName }
      );

      if (error) {
        lastError = `RPC error: ${error.message}`;
        console.log(`   ⚠️  ${lastError}`);
        attempt++;

        if (attempt <= MAX_RETRIES) {
          console.log(`   ⏳ Retrying in ${RETRY_DELAY_MS}ms...`);
          await delay(RETRY_DELAY_MS);
        }
        continue;
      }

      if (!data || data.length === 0) {
        lastError = 'No result returned from RPC';
        console.log(`   ⚠️  ${lastError}`);
        attempt++;

        if (attempt <= MAX_RETRIES) {
          console.log(`   ⏳ Retrying in ${RETRY_DELAY_MS}ms...`);
          await delay(RETRY_DELAY_MS);
        }
        continue;
      }

      const result = data[0] as ExecuteDismissResult;

      batch.status = 'success';
      batch.result = result;

      console.log(`   ✅ Success`);
      console.log(`      Batch ID: ${result.batch_id}`);
      console.log(`      Total resolved: ${result.total_resolved}`);
      console.log(`      Total dismissed: ${result.total_dismissed}`);
      console.log(`      Status: ${result.execution_status}`);
      console.log(`      Logged at: ${result.logged_at}`);

      return batch;
    } catch (error) {
      lastError = `Exception: ${error instanceof Error ? error.message : String(error)}`;
      console.log(`   ❌ ${lastError}`);
      attempt++;

      if (attempt <= MAX_RETRIES) {
        console.log(`   ⏳ Retrying in ${RETRY_DELAY_MS}ms...`);
        await delay(RETRY_DELAY_MS);
      }
    }
  }

  // All retries exhausted
  batch.status = 'failed';
  batch.error = lastError || 'Unknown error';
  console.log(`   ❌ Failed after ${MAX_RETRIES} attempts`);
  return batch;
}

/**
 * Main batch dismissal orchestrator
 */
async function batchDismissResolvedAnomalies(): Promise<void> {
  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║  Batch Dismiss Resolved Anomalies from alert_detections   ║');
  console.log('║  Chunk Size: 1000 | Max Retries: 3                        ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  // Step 1: Fetch total count of resolved anomalies
  console.log('🔍 Fetching resolved anomalies count...\n');

  const firstBatch = await fetchResolvedAnomalies(supabase, 0, 1);

  if (firstBatch.error) {
    console.error(`❌ Error fetching anomalies: ${firstBatch.error}`);
    process.exit(1);
  }

  const totalResolved = firstBatch.total_count;

  if (totalResolved === 0) {
    console.log('✅ No resolved anomalies found to dismiss.\n');
    return;
  }

  console.log(`Found ${totalResolved} resolved anomalies to dismiss.\n`);

  // Calculate number of batches
  const numBatches = Math.ceil(totalResolved / CHUNK_SIZE);
  console.log(
    `📊 Processing in ${numBatches} batch(es) of ${CHUNK_SIZE} records...\n`
  );

  const batches: BatchProgress[] = [];
  let totalDismissed = 0;
  let successCount = 0;
  let failureCount = 0;

  // Step 2: Process each batch
  for (let i = 0; i < numBatches; i++) {
    const offset = i * CHUNK_SIZE;
    const batch: BatchProgress = {
      batch_number: i + 1,
      start_offset: offset,
      chunk_size: Math.min(CHUNK_SIZE, totalResolved - offset),
      total_records: totalResolved,
      status: 'pending',
      attempt: 1,
    };

    const result = await executeBatchDismiss(supabase, batch);
    batches.push(result);

    if (result.status === 'success' && result.result) {
      totalDismissed += result.result.total_dismissed;
      successCount++;
    } else {
      failureCount++;
    }

    // Add delay between batches to avoid rate limiting
    if (i < numBatches - 1) {
      await delay(500);
    }
  }

  // Step 3: Summary report
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║                    EXECUTION SUMMARY                       ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  console.log(`📈 Results:`);
  console.log(`   Total resolved anomalies: ${totalResolved}`);
  console.log(`   Batches processed: ${numBatches}`);
  console.log(`   Successful batches: ${successCount}`);
  console.log(`   Failed batches: ${failureCount}`);
  console.log(`   Total dismissed: ${totalDismissed}\n`);

  // Detailed batch report
  if (batches.length > 1) {
    console.log('📋 Batch Details:');
    batches.forEach((batch, idx) => {
      const statusIcon =
        batch.status === 'success'
          ? '✅'
          : batch.status === 'failed'
            ? '❌'
            : batch.status === 'retry'
              ? '🔄'
              : '⏳';
      console.log(
        `   ${statusIcon} Batch ${batch.batch_number}: ${batch.status.toUpperCase()}`
      );
      if (batch.result) {
        console.log(
          `      Dismissed: ${batch.result.total_dismissed}/${batch.result.total_resolved}`
        );
      }
      if (batch.error) {
        console.log(`      Error: ${batch.error}`);
      }
    });
  }

  // Final status
  console.log();
  if (failureCount === 0) {
    console.log(
      '✅ All batches completed successfully! Resolved anomalies dismissed.\n'
    );
  } else {
    console.log(
      `⚠️  ${failureCount} batch(es) failed. Review errors above.\n`
    );
    process.exit(1);
  }
}

// Execute main function
batchDismissResolvedAnomalies().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
