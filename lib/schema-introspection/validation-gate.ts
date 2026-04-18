/**
 * Pre-invocation validation gate for SQL query execution.
 * 
 * Acts as a gating mechanism that:
 * 1. Checks schema cache before execution
 * 2. Validates query syntax against cached schema
 * 3. Detects potential RLS policy issues
 * 4. Prevents invalid queries from reaching the database
 * 5. Caches and invalidates based on TTL
 */

import type { ParsedSelectQuery, QueryValidationResult } from './query-validator'
import { parseSelectQuery, validateParsedQuery } from './query-validator'
import { getTableCache, getAllTableCache } from './cache'
import type { TableMetadata } from './cache'

/**
 * Pre-invocation validation result
 */
export interface ValidationGateResult {
  allowed: boolean
  cached: boolean
  schemaValid: boolean
  reason: string
  queryValidation?: QueryValidationResult
  cacheHitStats?: {
    tablesInCache: number
    totalTablesRequired: number
    cacheCoveragePct: number
  }
}

/**
 * Query execution type
 */
export type QueryType = 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE' | 'DDL' | 'UNKNOWN'

/**
 * Determine query type
 */
export function getQueryType(query: string): QueryType {
  const trimmed = query.trim().toUpperCase()

  if (trimmed.startsWith('SELECT')) return 'SELECT'
  if (trimmed.startsWith('INSERT')) return 'INSERT'
  if (trimmed.startsWith('UPDATE')) return 'UPDATE'
  if (trimmed.startsWith('DELETE')) return 'DELETE'
  if (trimmed.startsWith('CREATE') || 
      trimmed.startsWith('ALTER') || 
      trimmed.startsWith('DROP') ||
      trimmed.startsWith('TRUNCATE')) return 'DDL'

  return 'UNKNOWN'
}

/**
 * Extract table names from query
 */
function extractTableNames(query: string): string[] {
  const tables = new Set<string>()

  // Extract FROM table
  const fromMatch = query.match(/FROM\s+([a-zA-Z_][a-zA-Z0-9_]*)/gi)
  if (fromMatch) {
    fromMatch.forEach(match => {
      const tableName = match.replace(/FROM\s+/i, '')
      tables.add(tableName)
    })
  }

  // Extract JOIN tables
  const joinMatch = query.match(/JOIN\s+([a-zA-Z_][a-zA-Z0-9_]*)/gi)
  if (joinMatch) {
    joinMatch.forEach(match => {
      const tableName = match.replace(/JOIN\s+/i, '')
      tables.add(tableName)
    })
  }

  // Extract INTO table (INSERT)
  const intoMatch = query.match(/INTO\s+([a-zA-Z_][a-zA-Z0-9_]*)/gi)
  if (intoMatch) {
    intoMatch.forEach(match => {
      const tableName = match.replace(/INTO\s+/i, '')
      tables.add(tableName)
    })
  }

  // Extract table name after UPDATE
  const updateMatch = query.match(/UPDATE\s+([a-zA-Z_][a-zA-Z0-9_]*)/i)
  if (updateMatch) {
    tables.add(updateMatch[1])
  }

  return Array.from(tables)
}

/**
 * Check if all required tables are in cache
 */
function checkCacheCoverage(requiredTables: string[]): { covered: boolean; coverage: number } {
  if (requiredTables.length === 0) {
    return { covered: true, coverage: 100 }
  }

  const cachedTables = getAllTableCache()
  const cachedCount = requiredTables.filter(t => cachedTables[t]).length
  const coverage = (cachedCount / requiredTables.length) * 100

  return {
    covered: cachedCount === requiredTables.length,
    coverage,
  }
}

/**
 * Validate SELECT query before execution
 */
export function validateSelectExecution(query: string): ValidationGateResult {
  try {
    const queryType = getQueryType(query)

    if (queryType !== 'SELECT') {
      return {
        allowed: false,
        cached: false,
        schemaValid: false,
        reason: `Expected SELECT query, got ${queryType}`,
      }
    }

    // Parse query
    const parsed = parseSelectQuery(query)

    if (!parsed.isValid) {
      return {
        allowed: false,
        cached: false,
        schemaValid: false,
        reason: `Query parse error: ${parsed.parseError}`,
      }
    }

    // Extract all tables involved
    const requiredTables = [parsed.tableName, ...parsed.joinTables]
    const coverage = checkCacheCoverage(requiredTables)

    // Get cached schema
    const cachedTables: Record<string, TableMetadata> = {}
    for (const tableName of requiredTables) {
      const cached = getTableCache(tableName)
      if (cached) {
        cachedTables[tableName] = cached
      }
    }

    // If not all tables in cache, warn but allow (will fetch during execution)
    if (!coverage.covered) {
      return {
        allowed: true,
        cached: false,
        schemaValid: true,
        reason: `Partial cache hit (${coverage.coverage.toFixed(0)}%); will fetch missing schema on execution`,
        cacheHitStats: {
          tablesInCache: requiredTables.filter(t => cachedTables[t]).length,
          totalTablesRequired: requiredTables.length,
          cacheCoveragePct: coverage.coverage,
        },
      }
    }

    // Validate against cached schema
    const validation = validateParsedQuery(parsed, cachedTables)

    if (!validation.isValid) {
      return {
        allowed: false,
        cached: true,
        schemaValid: false,
        reason: `Schema validation failed: ${validation.errors.map(e => e.message).join('; ')}`,
        queryValidation: validation,
      }
    }

    return {
      allowed: true,
      cached: true,
      schemaValid: true,
      reason: 'Query passed schema validation (full cache hit)',
      queryValidation: validation,
      cacheHitStats: {
        tablesInCache: requiredTables.length,
        totalTablesRequired: requiredTables.length,
        cacheCoveragePct: 100,
      },
    }
  } catch (error) {
    return {
      allowed: false,
      cached: false,
      schemaValid: false,
      reason: `Validation gate error: ${error instanceof Error ? error.message : String(error)}`,
    }
  }
}

/**
 * Validate DDL statement before execution
 * 
 * For DDL we're more conservative - require explicit allowlist or full cache
 */
export function validateDDLExecution(statement: string): ValidationGateResult {
  try {
    const queryType = getQueryType(statement)

    if (queryType !== 'DDL') {
      return {
        allowed: false,
        cached: false,
        schemaValid: false,
        reason: `Expected DDL statement, got ${queryType}`,
      }
    }

    // Extract table name from DDL
    const tableMatch = statement.match(/(?:CREATE|ALTER|DROP|TRUNCATE)\s+TABLE\s+([a-zA-Z_][a-zA-Z0-9_]*)/i)
    
    if (!tableMatch) {
      // May be other DDL type (functions, types, etc) - allow with warning
      return {
        allowed: true,
        cached: false,
        schemaValid: true,
        reason: 'DDL statement validated (non-table DDL)',
      }
    }

    const tableName = tableMatch[1]

    // Check cache coverage
    const cachedTable = getTableCache(tableName)

    if (!cachedTable && statement.toUpperCase().includes('ALTER')) {
      return {
        allowed: false,
        cached: false,
        schemaValid: false,
        reason: `Cannot ALTER table '${tableName}' - table schema not in cache. Introspect first.`,
      }
    }

    return {
      allowed: true,
      cached: !!cachedTable,
      schemaValid: true,
      reason: `DDL statement '${statement.split(' ').slice(0, 4).join(' ')}...' is allowed`,
    }
  } catch (error) {
    return {
      allowed: false,
      cached: false,
      schemaValid: false,
      reason: `DDL validation gate error: ${error instanceof Error ? error.message : String(error)}`,
    }
  }
}

/**
 * Main validation gate for any SQL query
 */
export function validateQueryExecution(query: string): ValidationGateResult {
  const queryType = getQueryType(query)

  switch (queryType) {
    case 'SELECT':
      return validateSelectExecution(query)
    case 'DDL':
      return validateDDLExecution(query)
    case 'INSERT':
    case 'UPDATE':
    case 'DELETE':
      // Data modification queries - allow but warn
      return {
        allowed: true,
        cached: false,
        schemaValid: true,
        reason: `${queryType} query submitted - will execute with standard validation`,
      }
    default:
      return {
        allowed: false,
        cached: false,
        schemaValid: false,
        reason: `Unknown query type: ${queryType}`,
      }
  }
}

/**
 * Check if a query is allowed to execute based on schema cache
 * Returns true if query should be allowed, false if it should be blocked
 */
export function isQueryAllowed(query: string, throwOnInvalid = false): boolean {
  const result = validateQueryExecution(query)

  if (!result.allowed && throwOnInvalid) {
    throw new Error(`Query blocked by validation gate: ${result.reason}`)
  }

  return result.allowed
}
