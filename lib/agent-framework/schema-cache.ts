/**
 * Schema Introspection Cache Layer
 *
 * Provides intelligent caching of PostgreSQL/Supabase schema metadata
 * with validation checks before DB tool invocations.
 *
 * Features:
 * - In-memory cache with TTL-based expiration
 * - Lightweight validation queries to detect schema drift
 * - Event-triggered cache invalidation
 * - Decorator pattern for DB tool wrapping
 * - Comprehensive logging and error recovery
 */

export interface ColumnMetadata {
  name: string
  type: string
  nullable: boolean
  defaultValue: string | null
  isPrimary: boolean
  isForeign: boolean
}

export interface TableMetadata {
  name: string
  schema: string
  columns: ColumnMetadata[]
  rowCount: number
  lastUpdated: number
}

export interface SchemaMetadata {
  tables: Map<string, TableMetadata>
  timestamp: number
  version: number
}

export interface CacheConfig {
  ttlMs: number
  validationQueryIntervalMs: number
  enableLogging: boolean
  maxCacheSize: number
}

export interface SchemaDriftDetection {
  isDrift: boolean
  addedTables: string[]
  removedTables: string[]
  modifiedTables: string[]
  addedColumns: Map<string, string[]>
  removedColumns: Map<string, string[]>
}

export interface CacheValidationResult {
  valid: boolean
  drift: SchemaDriftDetection
  lastValidatedAt: number
  errors: string[]
}

/**
 * Default cache configuration
 * - 10 minute TTL (schema changes are typically infrequent)
 * - Validation query every 5 minutes
 * - Max 100 tables cached
 */
export const DEFAULT_CACHE_CONFIG: CacheConfig = {
  ttlMs: 10 * 60 * 1000, // 10 minutes
  validationQueryIntervalMs: 5 * 60 * 1000, // 5 minutes
  enableLogging: true,
  maxCacheSize: 100,
}

/**
 * Schema cache error codes
 */
export enum SchemaCacheErrorCode {
  CACHE_EXPIRED = 'SCHEMA_CACHE_EXPIRED',
  VALIDATION_FAILED = 'SCHEMA_VALIDATION_FAILED',
  DRIFT_DETECTED = 'SCHEMA_DRIFT_DETECTED',
  TABLE_NOT_FOUND = 'TABLE_NOT_FOUND',
  COLUMN_NOT_FOUND = 'COLUMN_NOT_FOUND',
  FETCH_ERROR = 'SCHEMA_FETCH_ERROR',
  INVALIDATION_ERROR = 'SCHEMA_INVALIDATION_ERROR',
}

export class SchemaCacheError extends Error {
  constructor(
    public code: SchemaCacheErrorCode,
    public details: Record<string, unknown> = {}
  ) {
    super(`[${code}] ${JSON.stringify(details)}`)
    this.name = 'SchemaCacheError'
  }
}

/**
 * In-memory schema cache with TTL and validation
 */
export class SchemaCache {
  private cache: SchemaMetadata | null = null
  private lastFetchTime: number = 0
  private lastValidationTime: number = 0
  private config: CacheConfig
  private cacheVersion: number = 0
  private invalidationCallbacks: Set<(reason: string) => void> = new Set()

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = { ...DEFAULT_CACHE_CONFIG, ...config }
  }

  /**
   * Check if cache is valid and fresh
   */
  isValid(): boolean {
    if (!this.cache) return false
    const age = Date.now() - this.lastFetchTime
    return age < this.config.ttlMs
  }

  /**
   * Check if validation check is due
   */
  isValidationDue(): boolean {
    const timeSinceValidation = Date.now() - this.lastValidationTime
    return timeSinceValidation > this.config.validationQueryIntervalMs
  }

  /**
   * Get cached schema metadata if valid
   */
  get(): SchemaMetadata | null {
    if (!this.isValid()) return null
    return this.cache
  }

  /**
   * Set cached schema metadata
   */
  set(metadata: SchemaMetadata): void {
    if (metadata.tables.size > this.config.maxCacheSize) {
      const truncated = new Map(
        Array.from(metadata.tables.entries()).slice(0, this.config.maxCacheSize)
      )
      this.log(`Cache size exceeds ${this.config.maxCacheSize}, truncating to top tables`)
      metadata.tables = truncated
    }

    this.cache = metadata
    this.lastFetchTime = Date.now()
    this.cacheVersion++
  }

  /**
   * Get a specific table's metadata
   */
  getTable(tableName: string): TableMetadata | null {
    const schema = this.get()
    if (!schema) return null
    return schema.tables.get(tableName) ?? null
  }

  /**
   * Validate that a table exists in cache
   */
  hasTable(tableName: string): boolean {
    const schema = this.get()
    return schema ? schema.tables.has(tableName) : false
  }

  /**
   * Validate that a column exists in a table
   */
  hasColumn(tableName: string, columnName: string): boolean {
    const table = this.getTable(tableName)
    if (!table) return false
    return table.columns.some(col => col.name === columnName)
  }

  /**
   * Get column metadata
   */
  getColumn(tableName: string, columnName: string): ColumnMetadata | null {
    const table = this.getTable(tableName)
    if (!table) return null
    return table.columns.find(col => col.name === columnName) ?? null
  }

  /**
   * List all tables in cache
   */
  listTables(): string[] {
    const schema = this.get()
    if (!schema) return []
    return Array.from(schema.tables.keys())
  }

  /**
   * Invalidate cache (force refresh on next check)
   */
  invalidate(reason: string = 'manual_invalidation'): void {
    const wasValid = this.isValid()
    this.lastFetchTime = 0
    this.cache = null
    this.log(`Cache invalidated: ${reason}`)

    // Trigger callbacks
    for (const callback of this.invalidationCallbacks) {
      try {
        callback(reason)
      } catch (err) {
        this.log(`Error in invalidation callback: ${err}`)
      }
    }
  }

  /**
   * Register callback for cache invalidation events
   */
  onInvalidate(callback: (reason: string) => void): () => void {
    this.invalidationCallbacks.add(callback)
    return () => {
      this.invalidationCallbacks.delete(callback)
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    valid: boolean
    cached: boolean
    ageMs: number
    tableCount: number
    cacheVersion: number
  } {
    const ageMs = this.lastFetchTime ? Date.now() - this.lastFetchTime : -1
    const tableCount = this.cache?.tables.size ?? 0

    return {
      valid: this.isValid(),
      cached: this.cache !== null,
      ageMs,
      tableCount,
      cacheVersion: this.cacheVersion,
    }
  }

  /**
   * Update validation timestamp
   */
  recordValidation(): void {
    this.lastValidationTime = Date.now()
  }

  /**
   * Clear cache completely
   */
  clear(): void {
    this.cache = null
    this.lastFetchTime = 0
    this.lastValidationTime = 0
    this.log('Cache cleared')
  }

  /**
   * Get time since last validation
   */
  timeSinceValidation(): number {
    return Date.now() - this.lastValidationTime
  }

  private log(message: string): void {
    if (this.config.enableLogging) {
      console.log(`[SchemaCache] ${message}`)
    }
  }
}

/**
 * Singleton instance of schema cache
 */
let globalSchemaCache: SchemaCache | null = null

export function getGlobalSchemaCache(): SchemaCache {
  if (!globalSchemaCache) {
    globalSchemaCache = new SchemaCache()
  }
  return globalSchemaCache
}

export function setGlobalSchemaCache(cache: SchemaCache): void {
  globalSchemaCache = cache
}
