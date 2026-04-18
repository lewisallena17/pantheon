/**
 * Schema introspection utilities using PostgreSQL information_schema.
 * Queries table structure, columns, and RLS policies.
 */

import { createAdminClient } from '@/lib/supabase/admin'
import type { ColumnMetadata, TableMetadata } from './cache'
import {
  setTableCache,
  setColumnsCache,
  setPoliciesCache,
  getTableCache,
  getColumnsCache,
  getPoliciesCache,
} from './cache'

const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

/**
 * Query all tables in the public schema
 */
export async function introspectAllTables(): Promise<Record<string, TableMetadata>> {
  const supabase = createAdminClient()

  // Query information_schema for tables and RLS status
  const { data, error } = await supabase.rpc('schema_introspect_tables' as never, {} as never).then(
    result => result,
    err => ({ data: null, error: err })
  )

  if (error || !data) {
    // Fallback: return empty if RPC doesn't exist
    console.warn('[introspect] schema_introspect_tables RPC not available, using fallback')
    return {}
  }

  const result: Record<string, TableMetadata> = {}

  // Cache each table
  for (const table of data as any[]) {
    const metadata: TableMetadata = {
      table_name: table.table_name,
      columns: [],
      has_rls: table.has_rls || false,
      last_updated: Date.now(),
    }
    result[table.table_name] = metadata
    setTableCache(metadata, CACHE_TTL)
  }

  return result
}

/**
 * Introspect columns for a specific table
 */
export async function introspectColumns(tableName: string): Promise<ColumnMetadata[]> {
  // Check cache first
  const cached = getColumnsCache(tableName)
  if (cached) return cached

  const supabase = createAdminClient()

  // Query information_schema.columns
  const { data, error } = await supabase
    .from('information_schema.columns')
    .select('column_name, data_type, is_nullable, column_default, ordinal_position, udt_name')
    .eq('table_name', tableName)
    .eq('table_schema', 'public')
    .order('ordinal_position', { ascending: true })
    .then(
      result => result,
      err => ({ data: null, error: err })
    )

  if (error || !data) {
    console.warn(`[introspect] Failed to query columns for ${tableName}:`, error?.message)
    return []
  }

  const columns = (data as any[]).map(col => ({
    column_name: col.column_name,
    data_type: col.data_type,
    is_nullable: col.is_nullable === 'YES',
    column_default: col.column_default,
    ordinal_position: col.ordinal_position,
    udt_name: col.udt_name,
  }))

  setColumnsCache(tableName, columns, CACHE_TTL)
  return columns
}

/**
 * Check if a column exists in a table
 */
export async function columnExists(tableName: string, columnName: string): Promise<boolean> {
  const columns = await introspectColumns(tableName)
  return columns.some(c => c.column_name === columnName)
}

/**
 * Introspect RLS policies for a table
 */
export async function introspectPolicies(tableName: string): Promise<string[]> {
  // Check cache first
  const cached = getPoliciesCache(tableName)
  if (cached) return cached

  const supabase = createAdminClient()

  // Query pg_policies
  const { data, error } = await supabase
    .rpc('schema_introspect_policies' as never, { p_table_name: tableName } as never)
    .then(
      result => result,
      err => ({ data: null, error: err })
    )

  if (error || !data) {
    console.warn(`[introspect] Failed to query policies for ${tableName}:`, error?.message)
    return []
  }

  const policies = (data as any[]).map(p => p.policyname)
  setPoliciesCache(tableName, policies, CACHE_TTL)
  return policies
}

/**
 * Validate that a table exists before operating on it
 */
export async function tableExists(tableName: string): Promise<boolean> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('information_schema.tables')
    .select('table_name')
    .eq('table_name', tableName)
    .eq('table_schema', 'public')
    .single()
    .then(
      result => result,
      err => ({ data: null, error: err })
    )

  return !error && !!data
}

/**
 * Get table metadata (with cache hit)
 */
export async function getTableMetadata(tableName: string): Promise<TableMetadata | null> {
  // Check cache
  const cached = getTableCache(tableName)
  if (cached) return cached

  // Query existence
  const exists = await tableExists(tableName)
  if (!exists) return null

  // Introspect columns
  const columns = await introspectColumns(tableName)

  // Introspect policies
  const policies = await introspectPolicies(tableName)

  const metadata: TableMetadata = {
    table_name: tableName,
    columns,
    has_rls: policies.length > 0,
    last_updated: Date.now(),
  }

  setTableCache(metadata, CACHE_TTL)
  return metadata
}
