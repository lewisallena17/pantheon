/**
 * SELECT query validator using schema introspection.
 * 
 * Parses and validates SELECT queries against schema metadata
 * to detect:
 * - Non-existent tables
 * - Invalid columns
 * - Type mismatches
 * - RLS policy requirements
 */

import type { TableMetadata, ColumnMetadata } from './cache'

/**
 * Parsed SELECT query structure
 */
export interface ParsedSelectQuery {
  tableName: string
  selectedColumns: string[]
  whereColumns: string[]
  joinTables: string[]
  isValid: boolean
  parseError?: string
}

/**
 * Validation result
 */
export interface QueryValidationResult {
  isValid: boolean
  query: ParsedSelectQuery
  errors: ValidationError[]
  warnings: ValidationWarning[]
}

/**
 * Validation error
 */
export interface ValidationError {
  type: 'table_not_found' | 'column_not_found' | 'type_mismatch' | 'syntax_error'
  message: string
  element?: string
  table?: string
}

/**
 * Validation warning
 */
export interface ValidationWarning {
  type: 'rls_required' | 'performance' | 'deprecated_column' | 'null_column_filter'
  message: string
  element?: string
  table?: string
}

/**
 * Simple regex-based SELECT parser
 * Extracts table name, selected columns, and WHERE clause columns
 */
export function parseSelectQuery(query: string): ParsedSelectQuery {
  try {
    // Normalize query
    const normalized = query.trim()

    // Extract table name after FROM
    const fromMatch = normalized.match(/FROM\s+([a-zA-Z_][a-zA-Z0-9_]*)/i)
    if (!fromMatch) {
      return {
        tableName: '',
        selectedColumns: [],
        whereColumns: [],
        joinTables: [],
        isValid: false,
        parseError: 'No FROM clause found',
      }
    }

    const tableName = fromMatch[1]

    // Extract selected columns (simple approach)
    const selectMatch = normalized.match(/SELECT\s+(.+?)\s+FROM/i)
    let selectedColumns: string[] = []

    if (selectMatch) {
      const columnsPart = selectMatch[1]

      // Handle SELECT *
      if (columnsPart.trim() === '*') {
        selectedColumns = ['*']
      } else {
        // Split by comma and clean up
        selectedColumns = columnsPart
          .split(',')
          .map(col => {
            // Remove aliases and functions
            const match = col.match(/([a-zA-Z_][a-zA-Z0-9_.]*)/)
            return match ? match[1] : ''
          })
          .filter(col => col.length > 0)
      }
    }

    // Extract WHERE clause columns
    const whereMatch = normalized.match(/WHERE\s+(.+?)(?:ORDER|LIMIT|GROUP|$)/i)
    const whereColumns: string[] = []

    if (whereMatch) {
      const wherePart = whereMatch[1]
      // Extract identifiers from WHERE clause
      const identifiers = wherePart.match(/[a-zA-Z_][a-zA-Z0-9_.]*/g) || []
      whereColumns.push(...new Set(identifiers.filter(id => id !== 'AND' && id !== 'OR' && id !== 'NOT')))
    }

    // Extract JOIN tables
    const joinMatch = normalized.match(/JOIN\s+([a-zA-Z_][a-zA-Z0-9_]*)/gi)
    const joinTables = joinMatch
      ? joinMatch.map(j => j.replace(/JOIN\s+/i, ''))
      : []

    return {
      tableName,
      selectedColumns,
      whereColumns,
      joinTables,
      isValid: true,
    }
  } catch (error) {
    return {
      tableName: '',
      selectedColumns: [],
      whereColumns: [],
      joinTables: [],
      isValid: false,
      parseError: `Parse error: ${error instanceof Error ? error.message : String(error)}`,
    }
  }
}

/**
 * Validate a parsed SELECT query against schema metadata
 */
export function validateParsedQuery(
  parsed: ParsedSelectQuery,
  tables: Record<string, TableMetadata>
): QueryValidationResult {
  const errors: ValidationError[] = []
  const warnings: ValidationWarning[] = []

  // Check if parsing failed
  if (!parsed.isValid) {
    errors.push({
      type: 'syntax_error',
      message: parsed.parseError || 'Failed to parse query',
    })
    return { isValid: false, query: parsed, errors, warnings }
  }

  // Check table existence
  if (!tables[parsed.tableName]) {
    errors.push({
      type: 'table_not_found',
      message: `Table '${parsed.tableName}' not found`,
      table: parsed.tableName,
    })
  } else {
    const tableMetadata = tables[parsed.tableName]

    // Check selected columns
    if (parsed.selectedColumns.length > 0 && !parsed.selectedColumns.includes('*')) {
      for (const col of parsed.selectedColumns) {
        if (!columnExists(tableMetadata, col)) {
          errors.push({
            type: 'column_not_found',
            message: `Column '${col}' not found in table '${parsed.tableName}'`,
            element: col,
            table: parsed.tableName,
          })
        }
      }
    }

    // Check WHERE clause columns
    for (const col of parsed.whereColumns) {
      const colMeta = findColumn(tableMetadata, col)

      if (!colMeta) {
        errors.push({
          type: 'column_not_found',
          message: `Column '${col}' in WHERE clause not found in table '${parsed.tableName}'`,
          element: col,
          table: parsed.tableName,
        })
      } else if (!colMeta.is_nullable && !colMeta.column_default) {
        // Warn if filtering on required column
        warnings.push({
          type: 'null_column_filter',
          message: `Filtering on required column '${col}' without default`,
          element: col,
          table: parsed.tableName,
        })
      }
    }

    // Check for RLS
    if (tableMetadata.has_rls) {
      warnings.push({
        type: 'rls_required',
        message: `Table '${parsed.tableName}' has RLS policies; ensure proper authorization context`,
        table: parsed.tableName,
      })
    }
  }

  // Check JOIN tables
  for (const joinTable of parsed.joinTables) {
    if (!tables[joinTable]) {
      errors.push({
        type: 'table_not_found',
        message: `Joined table '${joinTable}' not found`,
        table: joinTable,
      })
    }
  }

  return {
    isValid: errors.length === 0,
    query: parsed,
    errors,
    warnings,
  }
}

/**
 * Validate a raw SELECT query string
 */
export function validateSelectQuery(
  query: string,
  tables: Record<string, TableMetadata>
): QueryValidationResult {
  const parsed = parseSelectQuery(query)
  return validateParsedQuery(parsed, tables)
}

/**
 * Check if a column exists in a table
 */
function columnExists(table: TableMetadata, columnName: string): boolean {
  return table.columns.some(col => col.column_name === columnName)
}

/**
 * Find column metadata by name
 */
function findColumn(table: TableMetadata, columnName: string): ColumnMetadata | null {
  return table.columns.find(col => col.column_name === columnName) || null
}

/**
 * Get column type for type checking
 */
export function getColumnType(
  tables: Record<string, TableMetadata>,
  tableName: string,
  columnName: string
): string | null {
  const table = tables[tableName]
  if (!table) return null

  const col = findColumn(table, columnName)
  return col ? col.data_type : null
}

/**
 * Check if a value type is compatible with column type
 */
export function isTypeCompatible(columnType: string, valueType: string): boolean {
  // Simple type compatibility checks
  const compatibility: Record<string, string[]> = {
    'text': ['text', 'varchar', 'character varying', 'string'],
    'varchar': ['text', 'varchar', 'character varying', 'string'],
    'character varying': ['text', 'varchar', 'character varying', 'string'],
    'integer': ['integer', 'int', 'int4', 'number'],
    'bigint': ['bigint', 'int8', 'integer', 'number'],
    'uuid': ['uuid', 'text', 'varchar'],
    'timestamp': ['timestamp', 'timestamptz', 'date', 'datetime'],
    'boolean': ['boolean', 'bool', 'true', 'false'],
    'json': ['json', 'jsonb', 'object', 'any'],
    'jsonb': ['json', 'jsonb', 'object', 'any'],
  }

  const normalized = columnType.toLowerCase()
  const compatible = compatibility[normalized] || [normalized]

  return compatible.includes(valueType.toLowerCase())
}

/**
 * Format validation result for logging
 */
export function formatValidationResult(result: QueryValidationResult): string {
  let output = `Query Validation: ${result.isValid ? '✓ VALID' : '✗ INVALID'}\n`

  if (result.errors.length > 0) {
    output += `\nErrors (${result.errors.length}):\n`
    for (const error of result.errors) {
      output += `  - [${error.type}] ${error.message}\n`
    }
  }

  if (result.warnings.length > 0) {
    output += `\nWarnings (${result.warnings.length}):\n`
    for (const warning of result.warnings) {
      output += `  - [${warning.type}] ${warning.message}\n`
    }
  }

  return output
}
