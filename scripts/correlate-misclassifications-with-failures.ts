#!/usr/bin/env node
/**
 * Correlate Misclassifications with Failures
 * 
 * This script:
 * 1. Samples 5% of misclassified tasks from task_misclassification_log (stratified by error reason)
 * 2. Correlates them with failure records in task_classification_failures
 * 3. Identifies root-cause patterns
 * 4. Generates a recommendation before locking confidence scores
 * 
 * Usage: npx ts-node scripts/correlate-misclassifications-with-failures.ts
 * 
 * Exit codes:
 * - 0: SAFE_TO_LOCK - No systemic issues found
 * - 1: REVIEW_REQUIRED - Moderate issues found, manual review needed
 * - 2: BLOCK_LOCK - Critical issues found, lock must be blocked
 */

import { executeCorrelationAnalysis } from '../lib/misclassification-analyzer';

const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[34m';
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';

function formatHeader(title: string): void {
  console.log(`\n${BOLD}${'═'.repeat(70)}${RESET}`);
  console.log(`${BLUE}${title}${RESET}`);
  console.log(`${BOLD}${'═'.repeat(70)}${RESET}\n`);
}

function formatSection(title: string): void {
  console.log(`\n${BOLD}${title}${RESET}`);
  console.log(`${'-'.repeat(70)}`);
}

function getRecommendationColor(rec: string): string {
  switch (rec) {
    case 'SAFE_TO_LOCK':
      return GREEN;
    case 'REVIEW_REQUIRED':
      return YELLOW;
    case 'BLOCK_LOCK':
      return RED;
    default:
      return RESET;
  }
}

async function main(): Promise<void> {
  try {
    formatHeader('🔍 MISCLASSIFICATION CORRELATION ANALYSIS');

    console.log(`Starting analysis at ${new Date().toISOString()}`);
    console.log(
      'Sampling 5% of misclassified tasks and correlating with failures...\n'
    );

    const result = await executeCorrelationAnalysis();

    // Report: Overview
    formatSection('📊 Analysis Overview');
    console.log(`  Total misclassified tasks: ${result.total_misclassified}`);
    console.log(`  Total sampled: ${result.total_sampled}`);
    console.log(`  Sample rate: ${result.sample_pct.toFixed(2)}%`);
    console.log(`  Analysis timestamp: ${result.analysis_timestamp}`);

    // Report: Stratified Samples
    if (result.stratified_samples.length > 0) {
      formatSection('📈 Stratified Sampling by Error Category');
      console.log(`  Found ${result.stratified_samples.length} error categories:\n`);

      result.stratified_samples.forEach((sample) => {
        const pct = sample.sample_pct.toFixed(1);
        console.log(
          `  • ${sample.error_category || 'UNCATEGORIZED'}`
        );
        console.log(
          `    - Total in category: ${sample.total_in_category}`
        );
        console.log(
          `    - Sampled: ${sample.sample_size} (${pct}%)`
        );
      });
    } else {
      console.log(`  ${YELLOW}⚠️  No misclassified records found in database${RESET}`);
    }

    // Report: Correlations
    if (result.correlations.length > 0) {
      formatSection('🔗 Misclassification-Failure Correlations');
      console.log(
        `  Analyzed ${result.correlations.length} task(s) for co-occurrence patterns:\n`
      );

      // Show high-correlation tasks (>0.5)
      const highCorr = result.correlations.filter((c) => c.correlation_strength > 0.5);
      if (highCorr.length > 0) {
        console.log(`  ${RED}🚨 HIGH CORRELATION (>50%):${RESET}`);
        highCorr.slice(0, 5).forEach((corr) => {
          console.log(
            `    • Task ${corr.task_id.substring(0, 8)}: ${(corr.correlation_strength * 100).toFixed(1)}% correlation`
          );
          console.log(
            `      - Misclassifications: ${corr.misclassification_count}, Failures: ${corr.failure_count}`
          );
          if (corr.root_cause_hypothesis) {
            console.log(`      - Hypothesis: ${corr.root_cause_hypothesis}`);
          }
        });
      }

      // Show medium-correlation tasks (0.3-0.5)
      const mediumCorr = result.correlations.filter(
        (c) => c.correlation_strength > 0.3 && c.correlation_strength <= 0.5
      );
      if (mediumCorr.length > 0) {
        console.log(`\n  ${YELLOW}⚠️  MODERATE CORRELATION (30-50%):${RESET}`);
        mediumCorr.slice(0, 3).forEach((corr) => {
          console.log(
            `    • Task ${corr.task_id.substring(0, 8)}: ${(corr.correlation_strength * 100).toFixed(1)}% correlation`
          );
        });
      }

      // Summary stats
      const avgConfidence = result.correlations.reduce((sum, c) => sum + (c.confidence_score_avg || 0), 0) / result.correlations.length;
      console.log(`\n  ${BOLD}Summary:${RESET}`);
      console.log(
        `    - Average confidence score: ${avgConfidence.toFixed(2)}%`
      );
      console.log(
        `    - Tasks with failures: ${result.correlations.filter((c) => c.failure_count > 0).length}/${result.correlations.length}`
      );
    } else {
      console.log(`  ${GREEN}✅ No correlations found (likely no failures in sampled set)${RESET}`);
    }

    // Report: Root Causes
    if (result.top_root_causes.length > 0) {
      formatSection('🔥 Top Root-Cause Patterns');
      result.top_root_causes.forEach((cause, idx) => {
        console.log(
          `  ${idx + 1}. "${cause.pattern}":`
        );
        console.log(
          `     - Frequency: ${cause.frequency} occurrence(s)`
        );
        console.log(
          `     - Confidence impact: ${cause.confidence_impact.toFixed(2)}`
        );
      });
    }

    // Report: Recommendation
    formatSection('📋 Recommendation');
    const recColor = getRecommendationColor(result.recommendation);
    console.log(
      `  ${recColor}${BOLD}${result.recommendation}${RESET}`
    );
    console.log();

    if (result.recommendation === 'SAFE_TO_LOCK') {
      console.log(
        `  ${GREEN}✅ No systemic issues detected. Safe to proceed with locking confidence scores.${RESET}`
      );
    } else if (result.recommendation === 'REVIEW_REQUIRED') {
      console.log(
        `  ${YELLOW}⚠️  Moderate correlation detected. Manual review recommended before locking.${RESET}`
      );
      console.log(
        `     Please verify top root-cause patterns before proceeding.`
      );
    } else if (result.recommendation === 'BLOCK_LOCK') {
      console.log(
        `  ${RED}🚫 High correlation detected (>50% of sampled tasks show issues).${RESET}`
      );
      console.log(
        `     Lock must be blocked until root causes are resolved.`
      );
    }

    formatHeader('✅ Analysis Complete');

    // Exit with appropriate code
    const exitCode =
      result.recommendation === 'SAFE_TO_LOCK'
        ? 0
        : result.recommendation === 'REVIEW_REQUIRED'
          ? 1
          : 2;

    process.exit(exitCode);
  } catch (error) {
    console.error(`${RED}❌ Analysis failed:${RESET}`);
    console.error(error);
    process.exit(2);
  }
}

main();
