/**
 * Validated SQL execution wrapper with schema introspection cache layer.
 * 
 * This module provides a decorator pattern for SQL query execution that:
 * 1. Checks schema cache for table/column metadata
 * 2. Validates query against cached schema before execution
 * 3. Rejects invalid queries before reaching the database
 * 4. Maintains cache freshness with TTL-based invalidation
 * 5. Provides detailed execution metrics and diagnostics
 * 
 * Usage:
 *   const result = await executeValidatedQuery(query, { context: 'api-handler' });
 *   if (!result.allowed) {
 *     console.error('Query blocked:', result.reason);
 *     return { error: result.reason };
 *   }
 *   // proceed with execution
 */

import { createAdminClient } from '@/lib/supabase/admin'
import {
  validateQueryExecution,
  getQueryType,
  type ValidationGateResult,
} from './validation-gate'
import {
  introspectAllTables,
  introspectColumns,
  getTableMetadata,
} from './introspect'
import { getCacheStats, clearCache } from './cache'

/**
 * Execution context for audit logging
 */
export interface ExecutionContext {
  context?: string // 'api-handler', 'server-action', 'webhook', etc.
  userId?: string
  requestId?: string
  source?: string // origin of the request
}

/**
 * Execution result with metadata
 */
export interface ValidatedExecutionResult<T = any> {
  allowed: boolean
  reason: string
  queryType: string
  validation: ValidationGateResult
  cached: boolean
  cacheCoverage?: {
    tablesInCache: number
    totalTablesRequired: number
    cacheCoveragePct: number
  }
  cacheStats?: {
    hits: number
    misses: number
    hitRate: string
    tables: number
    columns: number
    policies: number
  }
  context?: ExecutionContext
  timestamp: number
  executionTimeMs?: number
  data?: T
  error?: string
}

/**
 * Configuration for execution validation
 */
export interface ValidatedExecutionConfig {
  /**
   * Auto-introspect missing schemas before validation
   * @default true
   */
  autoIntrospect?: boolean

  /**
   * Reject queries with partial cache coverage
   * @default false
   */
  requireFullCacheHit?: boolean

  /**
   * Maximum time to wait for introspection (ms)
   * @default 5000
   */
  introspectTimeoutMs?: number

  /**
   * Log validation results (for debugging)
   * @default false
   */
  logValidation?: boolean

  /**
   * Audit execution attempts (for security)
   * @default true
   */
  auditEnabled?: boolean
}

const DEFAULT_CONFIG: ValidatedExecutionConfig = {
  autoIntrospect: true,
  requireFullCacheHit: false,
  introspectTimeoutMs: 5000,
  logValidation: false,
  auditEnabled: true,
}

// Audit log for validation attempts
const auditLog: ValidatedExecutionResult[] = []
const MAX_AUDIT_LOG_SIZE = 1000

/**
 * Pre-execution validation gate
 * 
 * Validates query against schema cache and rejects invalid queries
 * before they reach the database.
 */
export async function validateQueryPreExecution(
  query: string,
  config: ValidatedExecutionConfig = DEFAULT_CONFIG
): Promise<ValidatedExecutionResult> {
  const startTime = Date.now()

  try {
    const queryType = getQueryType(query)

    // Get baseline validation
    let validation = validateQueryExecution(query)

    // If cache coverage is partial and auto-introspect is enabled, refresh
    if (
      config.autoIntrospect &&
      !validation.cached &&
      validation.allowed &&
      (validation.cacheHitStats?.cacheCoveragePct ?? 100) < 100
    ) {
      try {
        // Introspect missing schemas with timeout
        await Promise.race([
          introspectAllTables(),
          new Promise((_, reject) =>
            setTimeout(
              () => reject(new Error('Introspection timeout')),
              config.introspectTimeoutMs
            )
          ),
        ])

        // Re-validate with fresh schema
        validation = validateQueryExecution(query)
      } catch (introspectError) {
        if (config.logValidation) {
          console.warn('[validation] Introspection failed, proceeding with partial cache:', {
            error: introspectError instanceof Error ? introspectError.message : String(introspectError),
          })
        }
      }
    }

    const result: ValidatedExecutionResult = {
      allowed: validation.allowed,
      reason: validation.reason,
      queryType,
      validation,
      cached: validation.cached,
      cacheCoverage: validation.cacheHitStats,
      cacheStats: getCacheStats(),
      timestamp: Date.now(),
      executionTimeMs: Date.now() - startTime,
    }

    if (config.logValidation) {
      console.log('[validation-gate] Query validation result:', {
        allowed: result.allowed,
        queryType: result.queryType,
        cached: result.cached,
        reason: result.reason,
      })
    }

    // Add to audit log
    if (config.auditEnabled) {
      auditLog.push(result)
      if (auditLog.length > MAX_AUDIT_LOG_SIZE) {
        auditLog.shift()
      }
    }

    return result
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)

    const result: ValidatedExecutionResult = {
      allowed: false,
      reason: `Validation gate error: ${errorMsg}`,
      queryType: 'UNKNOWN',
      validation: {
        allowed: false,
        cached: false,
        schemaValid: false,
        reason: errorMsg,
      },
      cached: false,
      cacheStats: getCacheStats(),
      timestamp: Date.now(),
      executionTimeMs: Date.now() - startTime,
      error: errorMsg,
    }

    if (config.auditEnabled) {
      auditLog.push(result)
      if (auditLog.length > MAX_AUDIT_LOG_SIZE) {
        auditLog.shift()
      }
    }

    return result
  }
}

/**
 * Execute a query with schema validation gate
 * 
 * Returns validation result without executing the query.
 * Call this before actual execution to gate access.
 */
export async function gateQueryExecution(
  query: string,
  context?: ExecutionContext,
  config: ValidatedExecutionConfig = DEFAULT_CONFIG
): Promise<ValidatedExecutionResult> {
  const result = await validateQueryPreExecution(query, config)
  result.context = context
  return result
}

/**
 * Execute SELECT query with validation and return data
 */
export async function executeValidatedSelect<T = any>(
  query: string,
  context?: ExecutionContext,
  config: ValidatedExecutionConfig = DEFAULT_CONFIG
): Promise<ValidatedExecutionResult<T>> {
  const startTime = Date.now()

  try {
    // Pre-validation gate
    const validation = await validateQueryPreExecution(query, config)

    if (!validation.allowed) {
      const result: ValidatedExecutionResult<T> = {
        allowed: false,
        reason: validation.reason,
        queryType: validation.queryType,
        validation: validation.validation,
        cached: validation.cached,
        cacheCoverage: validation.cacheCoverage,
        cacheStats: validation.cacheStats,
        context,
        timestamp: Date.now(),
        executionTimeMs: Date.now() - startTime,
        error: `Query rejected by validation gate: ${validation.reason}`,
      }

      if (config.logValidation) {
        console.warn('[validated-execution] SELECT query rejected:', {
          reason: result.reason,
          queryType: result.queryType,
        })
      }

      return result
    }

    // Query passed validation - execute
    const supabase = createAdminClient()
    const { data, error } = await supabase.rpc('execute_sql' as never, {
      query,
    } as never)

    if (error) {
      return {
        allowed: true,
        reason: 'Query passed validation but execution failed',
        queryType: validation.queryType,
        validation: validation.validation,
        cached: validation.cached,
        cacheCoverage: validation.cacheCoverage,
        cacheStats: validation.cacheStats,
        context,
        timestamp: Date.now(),
        executionTimeMs: Date.now() - startTime,
        error: error.message,
      }
    }

    return {
      allowed: true,
      reason: 'Query executed successfully',
      queryType: validation.queryType,
      validation: validation.validation,
      cached: validation.cached,
      cacheCoverage: validation.cacheCoverage,
      cacheStats: validation.cacheStats,
      context,
      timestamp: Date.now(),
      executionTimeMs: Date.now() - startTime,
      data: data as T,
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)

    return {
      allowed: false,
      reason: 'Unexpected execution error',
      queryType: 'SELECT',
      validation: {
        allowed: false,
        cached: false,
        schemaValid: false,
        reason: errorMsg,
      },
      cached: false,
      cacheStats: getCacheStats(),
      context,
      timestamp: Date.now(),
      executionTimeMs: Date.now() - startTime,
      error: errorMsg,
    }
  }
}

/**
 * Warm up the schema cache by introspecting all tables
 */
export async function warmCacheAllTables(): Promise<{ tables: number; error?: string }> {
  try {
    const tables = await introspectAllTables()
    return {
      tables: Object.keys(tables).length,
    }
  } catch (error) {
    return {
      tables: 0,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

/**
 * Warm up cache for specific table
 */
export async function warmCacheTable(tableName: string): Promise<{ success: boolean; error?: string }> {
  try {
    const metadata = await getTableMetadata(tableName)
    if (!metadata) {
      return {
        success: false,
        error: `Table '${tableName}' not found`,
      }
    }

    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

/**
 * Get cache performance statistics
 */
export function getCacheMetrics() {
  return {
    cache: getCacheStats(),
    auditLogSize: auditLog.length,
    recentValidations: auditLog.slice(-10),
  }
}

/**
 * Clear cache and reset statistics
 */
export function resetCache() {
  clearCache()
  auditLog.length = 0
}

/**
 * Export audit log for analysis
 */
export function exportAuditLog(): ValidatedExecutionResult[] {
  return [...auditLog]
}
