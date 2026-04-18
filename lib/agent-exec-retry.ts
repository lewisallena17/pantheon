/**
 * Autonomous Recovery Wrapper for agent_exec_sql
 * 
 * Provides exponential backoff retry logic with:
 * - Automatic LIMIT 10 injection on SELECT failures
 * - Transient vs permanent failure classification
 * - Comprehensive observability and logging
 * - Configurable retry strategy
 */

export interface RetryConfig {
  /** Maximum number of retry attempts (not counting initial attempt) */
  maxRetries: number;
  /** Initial backoff delay in milliseconds */
  initialDelayMs: number;
  /** Maximum backoff delay in milliseconds */
  maxDelayMs: number;
  /** Backoff multiplier (exponential) */
  backoffMultiplier: number;
  /** Add jitter to prevent thundering herd */
  jitterFactor: number;
  /** Auto-inject LIMIT 10 on SELECT failures */
  autoLimitOnFailure: boolean;
  /** Enable detailed logging */
  verbose: boolean;
}

export interface RetryMetrics {
  /** Total attempts made (including retries) */
  totalAttempts: number;
  /** Number of retries that occurred */
  retryCount: number;
  /** Total time spent retrying (ms) */
  totalRetryTimeMs: number;
  /** Individual attempt delays (ms) */
  delaysBetweenAttempts: number[];
  /** Whether the final attempt succeeded */
  succeeded: boolean;
  /** Error on final failure (if any) */
  finalError?: Error | null;
  /** Whether LIMIT was injected during retry */
  limitInjected: boolean;
  /** Original query if LIMIT was injected */
  originalQuery?: string;
}

export interface ExecutionResult<T> {
  data: T | null;
  error: Error | null;
  metrics: RetryMetrics;
  isTransient: boolean;
}

/**
 * Classify error as transient (retriable) or permanent
 * 
 * Transient errors:
 * - Connection timeouts
 * - Rate limits (429, 503)
 * - Temporary database unavailability
 * - Lock timeout
 * 
 * Permanent errors:
 * - Syntax errors
 * - Permission denied
 * - Table/column not found
 * - Invalid data type
 */
function classifyError(error: any): boolean {
  if (!error) return false;

  const message = (error.message || error.toString()).toLowerCase();
  const code = error.code || error.status || '';

  // Transient indicators
  const transientPatterns = [
    /timeout/i,
    /deadlock/i,
    /lock\s+timeout/i,
    /unavailable/i,
    /temporarily/i,
    /try\s+again/i,
    /connection\s+(reset|refused|closed)/i,
    /econnreset/i,
    /econnrefused/i,
    /etimedout/i,
    /rate.*limit/i,
    /too.*many.*requests/i,
    /service.*unavailable/i,
    /gateway\s+timeout/i,
  ];

  const transientCodes = ['429', '503', '504', 'ECONNRESET', 'ETIMEDOUT'];

  for (const pattern of transientPatterns) {
    if (pattern.test(message)) return true;
  }

  if (transientCodes.includes(String(code))) return true;

  // Permanent error indicators (early exit)
  const permanentPatterns = [
    /syntax\s+error/i,
    /permission\s+denied/i,
    /not\s+authorized/i,
    /does\s+not\s+exist/i,
    /undefined\s+(column|table|function)/i,
    /invalid\s+(data\s+)?type/i,
    /constraint\s+violation/i,
    /duplicate\s+key/i,
    /foreign\s+key/i,
  ];

  for (const pattern of permanentPatterns) {
    if (pattern.test(message)) return false;
  }

  // If SQLSTATE is in error, check against PostgreSQL error codes
  const sqlstate = error.sqlstate || error.code?.toString() || '';
  
  // Permanent error codes (28xxx = auth, 42xxx = syntax, etc.)
  if (/^(28|42|44|45)/.test(sqlstate)) {
    return false;
  }

  // Transient error codes (58xxx = I/O, 57xxx = op timeout, etc.)
  if (/^(57|58)/.test(sqlstate)) {
    return true;
  }

  // Default to transient for unknown errors
  return true;
}

/**
 * Inject LIMIT clause into SELECT query
 * Returns original query if already has LIMIT or is not a SELECT
 */
function injectLimitClause(query: string, limit: number = 10): string {
  const trimmed = query.trim();
  const upper = trimmed.toUpperCase();

  // Check if it's a SELECT query
  if (!upper.startsWith('SELECT') && !upper.startsWith('WITH')) {
    return query;
  }

  // Check if already has LIMIT clause
  if (/\sLIMIT\s+(\d+|[a-zA-Z_][a-zA-Z0-9_]*|ALL)\s*(?:OFFSET|;)?$/i.test(trimmed)) {
    return query;
  }

  // Remove trailing semicolon if present
  const withoutSemicolon = trimmed.endsWith(';')
    ? trimmed.slice(0, -1)
    : trimmed;

  return `${withoutSemicolon} LIMIT ${limit}`;
}

/**
 * Calculate delay with exponential backoff and optional jitter
 */
function calculateBackoffDelay(
  attemptNumber: number,
  config: RetryConfig
): number {
  const exponentialDelay = Math.min(
    config.initialDelayMs * Math.pow(config.backoffMultiplier, attemptNumber),
    config.maxDelayMs
  );

  // Add jitter to prevent thundering herd
  const jitter = exponentialDelay * config.jitterFactor * Math.random();
  return Math.floor(exponentialDelay + jitter);
}

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Log message with optional verbosity control
 */
function log(config: RetryConfig, message: string, data?: any): void {
  if (!config.verbose) return;

  const timestamp = new Date().toISOString();
  if (data) {
    console.log(`[${timestamp}] agent-exec-retry: ${message}`, data);
  } else {
    console.log(`[${timestamp}] agent-exec-retry: ${message}`);
  }
}

/**
 * Wrap agent_exec_sql with exponential backoff retry logic
 * 
 * This wrapper:
 * 1. Executes the query
 * 2. On failure, classifies error as transient or permanent
 * 3. For transient errors, retries with exponential backoff
 * 4. On retry, auto-injects LIMIT 10 for SELECT queries
 * 5. Returns comprehensive metrics about all attempts
 * 
 * @param query - SQL SELECT query
 * @param executeFn - Function that executes the query (typically agent_exec_sql)
 * @param config - Retry configuration
 * @returns Execution result with data, error, and metrics
 */
export async function withRetry<T>(
  query: string,
  executeFn: (sql: string) => Promise<T>,
  config?: Partial<RetryConfig>
): Promise<ExecutionResult<T>> {
  // Merge with defaults
  const finalConfig: RetryConfig = {
    maxRetries: 3,
    initialDelayMs: 100,
    maxDelayMs: 5000,
    backoffMultiplier: 2,
    jitterFactor: 0.1,
    autoLimitOnFailure: true,
    verbose: false,
    ...config,
  };

  const metrics: RetryMetrics = {
    totalAttempts: 0,
    retryCount: 0,
    totalRetryTimeMs: 0,
    delaysBetweenAttempts: [],
    succeeded: false,
    finalError: null,
    limitInjected: false,
  };

  let lastError: Error | null = null;
  let isTransient = false;
  let currentQuery = query;

  log(finalConfig, `Starting query execution with max ${finalConfig.maxRetries} retries`, {
    queryPreview: query.substring(0, 100),
  });

  // Initial attempt + retries
  for (let attempt = 0; attempt <= finalConfig.maxRetries; attempt++) {
    metrics.totalAttempts++;

    try {
      log(finalConfig, `Attempt ${attempt + 1}/${finalConfig.maxRetries + 1}`);

      const result = await executeFn(currentQuery);

      metrics.succeeded = true;
      log(finalConfig, `Query succeeded on attempt ${attempt + 1}`);

      return {
        data: result,
        error: null,
        metrics,
        isTransient: false,
      };
    } catch (error: any) {
      lastError = error instanceof Error ? error : new Error(String(error));
      isTransient = classifyError(error);

      log(finalConfig, `Attempt ${attempt + 1} failed (transient: ${isTransient})`, {
        error: lastError.message,
        sqlstate: error.sqlstate || 'unknown',
      });

      // If permanent error or no more retries, give up
      if (!isTransient || attempt === finalConfig.maxRetries) {
        metrics.finalError = lastError;
        return {
          data: null,
          error: lastError,
          metrics,
          isTransient,
        };
      }

      // Schedule retry with exponential backoff
      metrics.retryCount++;
      const delay = calculateBackoffDelay(attempt, finalConfig);
      metrics.delaysBetweenAttempts.push(delay);
      metrics.totalRetryTimeMs += delay;

      log(finalConfig, `Scheduling retry after ${delay}ms (attempt ${attempt + 2})`);

      // On first retry, inject LIMIT if configured
      if (attempt === 0 && finalConfig.autoLimitOnFailure) {
        const injected = injectLimitClause(currentQuery, 10);
        if (injected !== currentQuery) {
          metrics.limitInjected = true;
          metrics.originalQuery = currentQuery;
          currentQuery = injected;

          log(finalConfig, `Injected LIMIT 10 for retry`, {
            originalLength: query.length,
            injectedLength: injected.length,
          });
        }
      }

      await sleep(delay);
    }
  }

  // Should not reach here, but return error if we do
  metrics.finalError = lastError;
  return {
    data: null,
    error: lastError,
    metrics,
    isTransient,
  };
}

/**
 * Higher-order function wrapper for agent_exec_sql
 * Transparently adds retry logic to any async query function
 * 
 * Usage:
 *   const retryWrappedExec = withRetryWrapper(agentExecSql);
 *   const result = await retryWrappedExec(query);
 */
export function withRetryWrapper<T>(
  executeFn: (query: string) => Promise<T>,
  config?: Partial<RetryConfig>
) {
  return async (query: string): Promise<ExecutionResult<T>> => {
    return withRetry(query, executeFn, config);
  };
}

/**
 * Batch execute multiple queries with retry logic
 * Returns array of results in same order, with unified metrics
 */
export async function withRetryBatch<T>(
  queries: string[],
  executeFn: (sql: string) => Promise<T>,
  config?: Partial<RetryConfig>
): Promise<{
  results: ExecutionResult<T>[];
  totalAttempts: number;
  totalRetries: number;
  successCount: number;
  failureCount: number;
  totalTimeMs: number;
}> {
  const startTime = Date.now();
  const results: ExecutionResult<T>[] = [];
  let totalAttempts = 0;
  let totalRetries = 0;
  let successCount = 0;
  let failureCount = 0;

  for (const query of queries) {
    const result = await withRetry(query, executeFn, config);
    results.push(result);

    totalAttempts += result.metrics.totalAttempts;
    totalRetries += result.metrics.retryCount;

    if (result.metrics.succeeded) {
      successCount++;
    } else {
      failureCount++;
    }
  }

  return {
    results,
    totalAttempts,
    totalRetries,
    successCount,
    failureCount,
    totalTimeMs: Date.now() - startTime,
  };
}

/**
 * Export commonly-used configuration presets
 */
export const RetryPresets = {
  /**
   * Conservative: minimal retries, fast-fail
   * Good for user-facing API requests where latency matters
   */
  conservative: {
    maxRetries: 1,
    initialDelayMs: 50,
    maxDelayMs: 1000,
    backoffMultiplier: 2,
    jitterFactor: 0.1,
    autoLimitOnFailure: false,
    verbose: false,
  } as Partial<RetryConfig>,

  /**
   * Balanced: moderate retries, reasonable delays
   * Good for background jobs and server-to-server calls
   */
  balanced: {
    maxRetries: 3,
    initialDelayMs: 100,
    maxDelayMs: 5000,
    backoffMultiplier: 2,
    jitterFactor: 0.1,
    autoLimitOnFailure: true,
    verbose: false,
  } as Partial<RetryConfig>,

  /**
   * Aggressive: maximum retries, long delays
   * Good for critical background operations, ETL jobs
   */
  aggressive: {
    maxRetries: 5,
    initialDelayMs: 200,
    maxDelayMs: 30000,
    backoffMultiplier: 1.5,
    jitterFactor: 0.2,
    autoLimitOnFailure: true,
    verbose: true,
  } as Partial<RetryConfig>,

  /**
   * Debug: verbose logging, helpful for troubleshooting
   */
  debug: {
    maxRetries: 3,
    initialDelayMs: 100,
    maxDelayMs: 5000,
    backoffMultiplier: 2,
    jitterFactor: 0.1,
    autoLimitOnFailure: true,
    verbose: true,
  } as Partial<RetryConfig>,
};

export default withRetry;
