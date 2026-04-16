#!/usr/bin/env node
/**
 * Script to dismiss resolved anomalies from connection_quality_events
 *
 * This script demonstrates how to use the dismiss_anomaly() and related
 * functions to manage resolved connection quality anomalies.
 *
 * Key functions:
 * - dismiss_anomaly(p_event_id, p_resolution_notes): Dismiss a single anomaly
 * - dismiss_resolved_anomaly(p_event_id, p_resolved_at, p_resolution_notes): Mark as resolved and dismiss
 * - dismiss_resolved_anomalies_batch(): Batch dismiss all resolved anomalies
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';

interface DismissResult {
  success: boolean;
  message: string;
  dismissed_at: string;
  event_id: string;
}

interface BatchDismissResult {
  total_resolved: number;
  total_dismissed: number;
  message: string;
}

async function main() {
  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log('🔍 Checking for resolved anomalies...\n');

  // Find all anomalies with resolved_at IS NOT NULL that haven't been dismissed yet
  const { data: resolvedAnomalies, error: fetchError } = await supabase
    .from('connection_quality_events')
    .select('id, event_type, created_at, resolved_at, dismissed_at')
    .not('resolved_at', 'is', null)
    .is('dismissed_at', null)
    .order('resolved_at', { ascending: true });

  if (fetchError) {
    console.error('❌ Error fetching resolved anomalies:', fetchError);
    process.exit(1);
  }

  if (!resolvedAnomalies || resolvedAnomalies.length === 0) {
    console.log('✅ No resolved anomalies found to dismiss.');
    return;
  }

  console.log(`Found ${resolvedAnomalies.length} resolved anomalies to dismiss:\n`);

  resolvedAnomalies.forEach((anomaly, index) => {
    console.log(
      `${index + 1}. ${anomaly.event_type} (${anomaly.id.substring(0, 8)}...)`
    );
    console.log(
      `   Created: ${new Date(anomaly.created_at).toLocaleString()}`
    );
    console.log(
      `   Resolved: ${new Date(anomaly.resolved_at).toLocaleString()}`
    );
  });

  console.log('\n📋 Method 1: Dismiss individual anomalies');
  console.log('━'.repeat(50));

  // Method 1: Dismiss each anomaly individually using dismiss_anomaly()
  for (const anomaly of resolvedAnomalies.slice(0, 1)) {
    console.log(`\nDismissing anomaly: ${anomaly.id}`);

    const { data, error } = await supabase.rpc('dismiss_anomaly', {
      p_event_id: anomaly.id,
      p_resolution_notes: 'Resolved and dismissed via batch script',
    });

    if (error) {
      console.error(`  ❌ Error dismissing ${anomaly.id}:`, error);
    } else {
      const result = (data as DismissResult[])?.[0];
      if (result?.success) {
        console.log(`  ✅ Successfully dismissed at ${result.dismissed_at}`);
      } else {
        console.log(`  ⚠️  ${result?.message}`);
      }
    }
  }

  console.log('\n📋 Method 2: Batch dismiss all resolved anomalies');
  console.log('━'.repeat(50));

  // Method 2: Use batch function to dismiss all in one call
  const { data: batchResult, error: batchError } = await supabase.rpc(
    'dismiss_resolved_anomalies_batch'
  );

  if (batchError) {
    console.error('❌ Error in batch dismiss:', batchError);
  } else {
    const result = (batchResult as BatchDismissResult[])?.[0];
    console.log(`\n${result.message}`);
    console.log(`Total resolved: ${result.total_resolved}`);
    console.log(`Total dismissed: ${result.total_dismissed}`);
  }

  console.log('\n✅ Resolved anomaly dismissal completed!');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
