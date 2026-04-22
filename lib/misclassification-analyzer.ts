/**
 * Misclassification Analysis Module
 * 
 * Provides functions to:
 * 1. Sample 5% of misclassified tasks from task_misclassification_log
 * 2. Correlate misclassifications with failures in task_classification_failures
 * 3. Identify root-cause patterns before locking confidence scores
 * 
 * This is a prerequisite before locking task classification confidence scores
 * to ensure no systemic issues are masking underlying failure patterns.
 */

import { createClient } from '@supabase/supabase-js';

export interface MisclassificationRecord {
  id: string;
  task_id: string;
  expected_classification: string | null;
  actual_classification: string | null;
  confidence_score: number | null;
  error_reason: string | null;
  detected_at: string;
  created_at: string;
}

export interface MisclassificationFailureCorrelation {
  task_id: string;
  misclassification_count: number;
  failure_count: number;
  correlation_strength: number; // 0-1, where 1 is perfect correlation
  failure_pattern_type: string | null;
  root_cause_hypothesis: string | null;
  confidence_score_avg: number | null;
  error_reasons: string[];
}

export interface StratifiedSample {
  error_category: string;
  sample_size: number;
  total_in_category: number;
  sample_pct: number;
  records: MisclassificationRecord[];
}

export interface CorrelationAnalysisResult {
  total_misclassified: number;
  total_sampled: number;
  sample_pct: number;
  stratified_samples: StratifiedSample[];
  correlations: MisclassificationFailureCorrelation[];
  top_root_causes: Array<{
    pattern: string;
    frequency: number;
    confidence_impact: number;
  }>;
  analysis_timestamp: string;
  recommendation: 'SAFE_TO_LOCK' | 'REVIEW_REQUIRED' | 'BLOCK_LOCK';
}

/**
 * Fetch total count of misclassified tasks
 */
export async function getTotalMisclassificationCount(): Promise<number> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data, error } = await supabase
    .from('task_misclassification_log')
    .select('id', { count: 'exact', head: true });

  if (error) {
    throw new Error(
      `Failed to count misclassifications: ${error.message}`
    );
  }

  return data?.length || 0;
}

/**
 * Categorize misclassification records by error reason
 */
function categorizeByErrorReason(
  records: MisclassificationRecord[]
): Record<string, MisclassificationRecord[]> {
  const categories: Record<string, MisclassificationRecord[]> = {};

  records.forEach((record) => {
    const category = record.error_reason || 'UNCATEGORIZED';
    if (!categories[category]) {
      categories[category] = [];
    }
    categories[category].push(record);
  });

  return categories;
}

/**
 * Sample 5% of misclassified tasks using stratified random sampling
 * Stratification is by error_reason to ensure all error types are represented
 */
export async function sample5PercentMisclassified(): Promise<StratifiedSample[]> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Fetch ALL misclassification records (we'll sample from these in memory)
  const { data: allRecords, error } = await supabase
    .from('task_misclassification_log')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(
      `Failed to fetch misclassification log: ${error.message}`
    );
  }

  const records = (allRecords || []) as MisclassificationRecord[];
  
  if (records.length === 0) {
    return [];
  }

  // Categorize by error reason
  const categorized = categorizeByErrorReason(records);
  const stratifiedSamples: StratifiedSample[] = [];

  // Sample 5% from each category
  const SAMPLE_RATE = 0.05;

  for (const [errorCategory, categoryRecords] of Object.entries(categorized)) {
    const sampleSize = Math.max(1, Math.ceil(categoryRecords.length * SAMPLE_RATE));
    
    // Shuffle array and take first N items
    const shuffled = [...categoryRecords].sort(() => Math.random() - 0.5);
    const sample = shuffled.slice(0, sampleSize);

    stratifiedSamples.push({
      error_category: errorCategory,
      sample_size: sample.length,
      total_in_category: categoryRecords.length,
      sample_pct: (sample.length / categoryRecords.length) * 100,
      records: sample,
    });
  }

  return stratifiedSamples;
}

/**
 * Correlate misclassifications with failures
 * For each misclassified task, check if it also appears in task_classification_failures
 */
export async function correlateWithFailures(
  sampledTaskIds: string[]
): Promise<MisclassificationFailureCorrelation[]> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  if (sampledTaskIds.length === 0) {
    return [];
  }

  // Fetch failure records for sampled tasks
  const { data: failureRecords, error } = await supabase
    .from('task_classification_failures')
    .select('*')
    .in('task_id', sampledTaskIds);

  if (error) {
    throw new Error(`Failed to fetch failure records: ${error.message}`);
  }

  // Fetch misclassification records for sampled tasks
  const { data: misclassRecords, error: misclassError } = await supabase
    .from('task_misclassification_log')
    .select('*')
    .in('task_id', sampledTaskIds);

  if (misclassError) {
    throw new Error(`Failed to fetch misclassification records: ${misclassError.message}`);
  }

  // Group by task_id
  const failuresByTask = new Map<string, any[]>();
  (failureRecords || []).forEach((f) => {
    if (!failuresByTask.has(f.task_id)) {
      failuresByTask.set(f.task_id, []);
    }
    failuresByTask.get(f.task_id)!.push(f);
  });

  const misclassByTask = new Map<string, MisclassificationRecord[]>();
  (misclassRecords || []).forEach((m) => {
    if (!misclassByTask.has(m.task_id)) {
      misclassByTask.set(m.task_id, []);
    }
    misclassByTask.get(m.task_id)!.push(m);
  });

  // Correlate: for each task in samples, compute correlation strength
  const correlations: MisclassificationFailureCorrelation[] = [];

  for (const taskId of sampledTaskIds) {
    const failures = failuresByTask.get(taskId) || [];
    const misclassifications = misclassByTask.get(taskId) || [];

    if (misclassifications.length === 0) continue; // Only track if misclassified

    // Correlation strength: higher if failures co-occur with misclassifications
    // Simple metric: (co-occurring events) / (total events)
    const correlationStrength =
      failures.length > 0
        ? Math.min(1.0, failures.length / (failures.length + misclassifications.length))
        : 0;

    // Extract error reasons and failure patterns
    const errorReasons = misclassifications
      .filter((m) => m.error_reason)
      .map((m) => m.error_reason!);

    const failurePatterns = failures.map((f) => f.failure_pattern_type).filter(Boolean);

    // Hypothesis: if correlation is high, misclassification may be causing failures
    let rootCauseHypothesis = null;
    if (correlationStrength > 0.7) {
      rootCauseHypothesis = `High correlation (${(correlationStrength * 100).toFixed(1)}%) suggests misclassification may trigger failures`;
    } else if (correlationStrength > 0.3) {
      rootCauseHypothesis = `Moderate correlation (${(correlationStrength * 100).toFixed(1)}%) warrants investigation`;
    }

    correlations.push({
      task_id: taskId,
      misclassification_count: misclassifications.length,
      failure_count: failures.length,
      correlation_strength: correlationStrength,
      failure_pattern_type: failurePatterns[0] || null,
      root_cause_hypothesis: rootCauseHypothesis,
      confidence_score_avg:
        misclassifications.length > 0
          ? (misclassifications.reduce((sum, m) => sum + (m.confidence_score || 0), 0) /
              misclassifications.length)
          : null,
      error_reasons: [...new Set(errorReasons)],
    });
  }

  return correlations;
}

/**
 * Analyze all root causes and generate recommendation
 */
export async function analyzeRootCauses(
  correlations: MisclassificationFailureCorrelation[]
): Promise<{
  topCauses: Array<{ pattern: string; frequency: number; confidenceImpact: number; confidence_impact: number }>;
  recommendation: 'SAFE_TO_LOCK' | 'REVIEW_REQUIRED' | 'BLOCK_LOCK';
}> {
  // Aggregate error reasons
  const errorFrequency: Record<string, number> = {};
  let highCorrelationCount = 0;
  let averageConfidence = 0;

  correlations.forEach((corr) => {
    if (corr.correlation_strength > 0.7) {
      highCorrelationCount++;
    }
    
    corr.error_reasons.forEach((reason) => {
      errorFrequency[reason] = (errorFrequency[reason] || 0) + 1;
    });

    if (corr.confidence_score_avg) {
      averageConfidence += corr.confidence_score_avg;
    }
  });

  if (correlations.length > 0) {
    averageConfidence /= correlations.length;
  }

  // Sort error reasons by frequency
  const topCauses = Object.entries(errorFrequency)
    .map(([pattern, frequency]) => ({
      pattern,
      frequency,
      confidenceImpact: frequency * (100 - averageConfidence) / 100,
      confidence_impact: frequency * (100 - averageConfidence) / 100,
    }))
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, 5); // Top 5 causes

  // Recommendation logic
  const highCorrelationRatio = highCorrelationCount / Math.max(1, correlations.length);

  let recommendation: 'SAFE_TO_LOCK' | 'REVIEW_REQUIRED' | 'BLOCK_LOCK' = 'SAFE_TO_LOCK';
  
  if (highCorrelationRatio > 0.5) {
    recommendation = 'BLOCK_LOCK'; // >50% of sampled tasks show high correlation
  } else if (highCorrelationRatio > 0.2 || averageConfidence < 70) {
    recommendation = 'REVIEW_REQUIRED';
  }

  return { topCauses, recommendation };
}

/**
 * Execute full correlation analysis pipeline
 * 1. Sample 5% of misclassified tasks (stratified by error reason)
 * 2. Correlate with failures
 * 3. Identify root-cause patterns
 * 4. Generate recommendation before locking confidence scores
 */
export async function executeCorrelationAnalysis(): Promise<CorrelationAnalysisResult> {
  const startTime = new Date();

  // Step 1: Get total count
  const totalMisclassified = await getTotalMisclassificationCount();

  // Step 2: Sample 5%
  const stratifiedSamples = await sample5PercentMisclassified();
  const sampledTaskIds = stratifiedSamples
    .flatMap((s) => s.records.map((r) => r.task_id))
    .filter((id, idx, arr) => arr.indexOf(id) === idx); // deduplicate

  // Step 3: Correlate with failures
  const correlations = await correlateWithFailures(sampledTaskIds);

  // Step 4: Analyze root causes
  const { topCauses, recommendation } = await analyzeRootCauses(correlations);

  return {
    total_misclassified: totalMisclassified,
    total_sampled: sampledTaskIds.length,
    sample_pct: totalMisclassified > 0 ? (sampledTaskIds.length / totalMisclassified) * 100 : 0,
    stratified_samples: stratifiedSamples,
    correlations,
    top_root_causes: topCauses,
    analysis_timestamp: startTime.toISOString(),
    recommendation,
  };
}
