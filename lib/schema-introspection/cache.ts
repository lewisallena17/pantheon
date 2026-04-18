/**
 * In-memory schema introspection cache with TTL and LRU eviction.
 * Stores table metadata, column definitions, and RLS policies.
 */

export interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
}

export interface ColumnMetadata {
  column_name: string
  data_type: string
  is_nullable: boolean
  column_default: string | null
  ordinal_position: number
  udt_name: string
}

export interface TableMetadata {
  table_name: string
  columns: ColumnMetadata[]
  has_rls: boolean
  row_count?: number
  last_updated: number
}

export interface SchemaCache {
  tables: Record<string, CacheEntry<TableMetadata>>
  columns: Record<string, CacheEntry<ColumnMetadata[]>>
  policies: Record<string, CacheEntry<string[]>>
}

const DEFAULT_TTL = 5 * 60 * 1000 // 5 minutes
const MAX_CACHE_SIZE = 100

let cache: SchemaCache = {
  tables: {},
  columns: {},
  policies: {},
}

let cacheHits = 0
let cacheMisses = 0

/**
 * Get cache statistics for debugging
 */
export function getCacheStats() {
  const hitRate = cacheHits + cacheMisses > 0
    ? (cacheHits / (cacheHits + cacheMisses) * 100).toFixed(2)
    : 'N/A'

  return {
    hits: cacheHits,
    misses: cacheMisses,
    hitRate: `${hitRate}%`,
    tables: Object.keys(cache.tables).length,
    columns: Object.keys(cache.columns).length,
    policies: Object.keys(cache.policies).length,
  }
}

/**
 * Check if a cache entry is still valid
 */
function isExpired<T>(entry: CacheEntry<T>): boolean {
  return Date.now() - entry.timestamp > entry.ttl
}

/**
 * Evict oldest entries when cache exceeds max size
 */
function evictOldest() {
  const allEntries = [
    ...Object.entries(cache.tables).map(([k, v]) => ({ key: k, type: 'tables' as const, timestamp: v.timestamp })),
    ...Object.entries(cache.columns).map(([k, v]) => ({ key: k, type: 'columns' as const, timestamp: v.timestamp })),
    ...Object.entries(cache.policies).map(([k, v]) => ({ key: k, type: 'policies' as const, timestamp: v.timestamp })),
  ]

  if (allEntries.length >= MAX_CACHE_SIZE) {
    // Sort by timestamp (oldest first)
    allEntries.sort((a, b) => a.timestamp - b.timestamp)

    // Remove oldest 10%
    const toRemove = Math.ceil(allEntries.length * 0.1)
    for (let i = 0; i < toRemove; i++) {
      const entry = allEntries[i]
      if (entry.type === 'tables') delete cache.tables[entry.key]
      if (entry.type === 'columns') delete cache.columns[entry.key]
      if (entry.type === 'policies') delete cache.policies[entry.key]
    }
  }
}

/**
 * Set a table in the cache
 */
export function setTableCache(table: TableMetadata, ttl: number = DEFAULT_TTL) {
  cache.tables[table.table_name] = {
    data: table,
    timestamp: Date.now(),
    ttl,
  }
  evictOldest()
}

/**
 * Get a table from the cache (null if expired or missing)
 */
export function getTableCache(tableName: string): TableMetadata | null {
  const entry = cache.tables[tableName]
  if (!entry) {
    cacheMisses++
    return null
  }

  if (isExpired(entry)) {
    delete cache.tables[tableName]
    cacheMisses++
    return null
  }

  cacheHits++
  return entry.data
}

/**
 * Get all tables from cache (excluding expired)
 */
export function getAllTableCache(): Record<string, TableMetadata> {
  const result: Record<string, TableMetadata> = {}

  for (const [name, entry] of Object.entries(cache.tables)) {
    if (!isExpired(entry)) {
      result[name] = entry.data
    } else {
      delete cache.tables[name]
    }
  }

  return result
}

/**
 * Set columns for a table
 */
export function setColumnsCache(tableName: string, columns: ColumnMetadata[], ttl: number = DEFAULT_TTL) {
  cache.columns[tableName] = {
    data: columns,
    timestamp: Date.now(),
    ttl,
  }
  evictOldest()
}

/**
 * Get columns for a table
 */
export function getColumnsCache(tableName: string): ColumnMetadata[] | null {
  const entry = cache.columns[tableName]
  if (!entry) {
    cacheMisses++
    return null
  }

  if (isExpired(entry)) {
    delete cache.columns[tableName]
    cacheMisses++
    return null
  }

  cacheHits++
  return entry.data
}

/**
 * Set RLS policies for a table
 */
export function setPoliciesCache(tableName: string, policies: string[], ttl: number = DEFAULT_TTL) {
  cache.policies[tableName] = {
    data: policies,
    timestamp: Date.now(),
    ttl,
  }
  evictOldest()
}

/**
 * Get RLS policies for a table
 */
export function getPoliciesCache(tableName: string): string[] | null {
  const entry = cache.policies[tableName]
  if (!entry) {
    cacheMisses++
    return null
  }

  if (isExpired(entry)) {
    delete cache.policies[tableName]
    cacheMisses++
    return null
  }

  cacheHits++
  return entry.data
}

/**
 * Clear all cache
 */
export function clearCache() {
  cache = {
    tables: {},
    columns: {},
    policies: {},
  }
  cacheHits = 0
  cacheMisses = 0
}

/**
 * Reset statistics (for testing)
 */
export function resetStats() {
  cacheHits = 0
  cacheMisses = 0
}
