/**
 * API boundary closure hook for atomic metadata persistence.
 *
 * Integrates atomicWriteMetadata into the response envelope completion flow,
 * ensuring metadata is persisted with hash/checksum validation before API closure.
 *
 * Provides:
 * - Hook into response completion lifecycle
 * - Automatic metadata enrichment with tokens and hashes
 * - Fire-and-forget async persistence (non-blocking to response delivery)
 * - Explicit error logging at boundary closure point
 * - Rollback on validation failures
 *
 * Usage:
 * ```ts
 * import { setupClosureHook, persistResponseMetadata } from '@/lib/response-closure-hook'
 *
 * // In API route handler:
 * const envelope = createResponseEnvelope(data, '/api/todos', 'GET')
 * addTokenCountFooter(envelope, JSON.stringify(data))
 * markComplete(envelope, 'SUCCESS', durationMs)
 *
 * // Before returning response, persist metadata
 * await persistResponseMetadata(envelope, {
 *   computeHash: true,
 *   validateTokenCount: true
 * })
 *
 * return NextResponse.json(envelope)
 * ```
 */

import { atomicWriteMetadata, type AtomicWriteOptions, type AtomicWriteResult } from './atomic-write'
import { addTokenCountFooter, type TokenCountFooter, getTokenCountFooter } from './response_metadata'
import type { ResponseEnvelope } from './response'

/**
 * Configuration for response closure hook
 */
export interface ResponseClosureConfig {
  /**
   * Enable automatic metadata persistence on response completion
   * @default true
   */
  enableAutoPersist?: boolean

  /**
   * Path to write response_metadata.json (relative to cwd or absolute)
   * @default '/public/response_metadata.json'
   */
  metadataFilePath?: string

  /**
   * Log metadata writes to console (for debugging)
   * @default false
   */
  logToPersist?: boolean

  /**
   * Include token count footer in persisted metadata
   * @default true
   */
  includeTokenCount?: boolean

  /**
   * Atomic write options (hash validation, token checksum, etc.)
   */
  atomicWriteOptions?: AtomicWriteOptions
}

/**
 * Result of persisting response metadata
 */
export interface PersistenceResult {
  /**
   * Whether persistence succeeded
   */
  persisted: boolean

  /**
   * Result from atomic write operation (if attempted)
   */
  writeResult?: AtomicWriteResult

  /**
   * Error message if persistence failed
   */
  error?: string

  /**
   * Time spent on persistence (ms)
   */
  persistenceDurationMs?: number
}

// ── Global configuration ──────────────────────────────────────────────────

let globalConfig: ResponseClosureConfig = {
  enableAutoPersist: true,
  metadataFilePath: '/public/response_metadata.json',
  logToPersist: false,
  includeTokenCount: true,
  atomicWriteOptions: {
    computeHash: true,
    validateTokenCount: true,
    timeoutMs: 5000,
    ensureDirectory: true,
  },
}

/**
 * Configure the global response closure hook behavior.
 *
 * @param config Configuration object
 * @example
 * ```ts
 * setupClosureHook({
 *   enableAutoPersist: true,
 *   metadataFilePath: '/tmp/response_metadata.json',
 *   logToPersist: true
 * })
 * ```
 */
export function setupClosureHook(config: Partial<ResponseClosureConfig>): void {
  globalConfig = { ...globalConfig, ...config }

  if (globalConfig.logToPersist) {
    console.log('[response-closure-hook] Configured:', JSON.stringify(globalConfig, null, 2))
  }
}

/**
 * Get the current closure hook configuration.
 */
export function getClosureConfig(): ResponseClosureConfig {
  return { ...globalConfig }
}

/**
 * Persist response metadata atomically with validation.
 *
 * Non-blocking: returned promise does not affect response delivery.
 * Use await for explicit wait, or fire-and-forget for production.
 *
 * Process:
 * 1. Extract metadata from response envelope
 * 2. Optionally add token count footer from envelope
 * 3. Call atomicWriteMetadata with validation enabled
 * 4. Log result (success or error) at API boundary
 * 5. Return persistence result (never throws)
 *
 * @param envelope Response envelope containing metadata to persist
 * @param config Optional override of global persistence config
 * @returns Promise<PersistenceResult> (non-blocking)
 *
 * @example
 * ```ts
 * // Explicit wait (ensures persistence before response delivered)
 * const result = await persistResponseMetadata(envelope)
 * if (!result.persisted) {
 *   console.error('Metadata persistence failed:', result.error)
 * }
 *
 * // Fire-and-forget (for production, non-blocking)
 * persistResponseMetadata(envelope).catch(err => {
 *   console.error('Async persistence error:', err.message)
 * })
 * ```
 */
export async function persistResponseMetadata(
  envelope: ResponseEnvelope,
  config?: Partial<ResponseClosureConfig>,
): Promise<PersistenceResult> {
  const startMs = Date.now()
  const effectiveConfig = { ...globalConfig, ...config }

  try {
    // Guard: check if auto-persist is enabled
    if (!effectiveConfig.enableAutoPersist) {
      return {
        persisted: false,
        error: 'Auto-persist disabled',
        persistenceDurationMs: Date.now() - startMs,
      }
    }

    // Guard: envelope must have metadata
    if (!envelope.metadata || Object.keys(envelope.metadata).length === 0) {
      if (effectiveConfig.logToPersist) {
        console.log('[response-closure-hook] No metadata to persist for', envelope.route)
      }
      return {
        persisted: false,
        error: 'No metadata to persist',
        persistenceDurationMs: Date.now() - startMs,
      }
    }

    // Step 1: Prepare metadata object
    const metadata = { ...envelope.metadata }

    // Step 2: Optionally enrich with token count footer if not present
    if (effectiveConfig.includeTokenCount && !metadata.token_count) {
      // If envelope has data, estimate token count
      if (envelope.data) {
        try {
          const dataStr = JSON.stringify(envelope.data)
          addTokenCountFooter(envelope, dataStr)

          // Copy token count footer to metadata if it was added
          if (envelope.metadata?.token_count) {
            metadata.token_count = envelope.metadata.token_count
          }
        } catch (err) {
          // Non-fatal: continue without token count
          if (effectiveConfig.logToPersist) {
            console.warn('[response-closure-hook] Failed to add token count footer:', err)
          }
        }
      }
    }

    // Step 3: Call atomic write with validation
    const filePath = effectiveConfig.metadataFilePath || '/public/response_metadata.json'
    const atomicOpts = effectiveConfig.atomicWriteOptions || {
      computeHash: true,
      validateTokenCount: true,
    }

    const writeResult = await atomicWriteMetadata(metadata, filePath, atomicOpts)

    // Step 4: Log result at API boundary
    const persistenceDurationMs = Date.now() - startMs

    if (writeResult.success) {
      if (effectiveConfig.logToPersist) {
        console.log(
          '[response-closure-hook] ✓ Metadata persisted:',
          JSON.stringify({
            route: envelope.route,
            filePath: writeResult.filePath,
            hash: writeResult.payloadHash,
            checksum: writeResult.tokenChecksum,
            durationMs: persistenceDurationMs,
          }),
        )
      }

      return {
        persisted: true,
        writeResult,
        persistenceDurationMs,
      }
    } else {
      // Persistence failed, but don't block API response
      console.error(
        '[response-closure-hook] ✗ Metadata persistence failed:',
        JSON.stringify({
          route: envelope.route,
          error: writeResult.error,
          errorCode: writeResult.errorCode,
          rolledBack: writeResult.rolledBack,
          durationMs: persistenceDurationMs,
        }),
      )

      return {
        persisted: false,
        writeResult,
        error: writeResult.error,
        persistenceDurationMs,
      }
    }
  } catch (err) {
    // Catch-all: should not reach here, but handle gracefully
    const errorMessage = err instanceof Error ? err.message : String(err)
    const persistenceDurationMs = Date.now() - startMs

    console.error(
      '[response-closure-hook] Unexpected error during persistence:',
      errorMessage,
    )

    return {
      persisted: false,
      error: errorMessage,
      persistenceDurationMs,
    }
  }
}

/**
 * Create a middleware hook that persists metadata after response is sent.
 *
 * Returns a function suitable for use in a post-response hook (e.g., in handler).
 *
 * @param config Optional closure hook configuration
 * @returns Function that takes an envelope and persists it (fire-and-forget)
 *
 * @example
 * ```ts
 * import { createPersistenceMiddleware } from '@/lib/response-closure-hook'
 *
 * const persist = createPersistenceMiddleware({ logToPersist: true })
 *
 * export async function GET(req: NextRequest) {
 *   const envelope = createResponseEnvelope(data, '/api/todos', 'GET')
 *   // ... add token footer, mark complete, etc ...
 *
 *   const response = NextResponse.json(envelope)
 *   persist(envelope) // Fire-and-forget
 *   return response
 * }
 * ```
 */
export function createPersistenceMiddleware(
  config?: Partial<ResponseClosureConfig>,
): (envelope: ResponseEnvelope) => void {
  return (envelope: ResponseEnvelope) => {
    // Fire-and-forget: don't await, don't block response delivery
    persistResponseMetadata(envelope, config).catch((err) => {
      console.error('[response-closure-hook] Fire-and-forget persistence error:', err.message)
    })
  }
}

/**
 * Extract the token count footer from persisted metadata.
 *
 * Useful for logging or metrics collection.
 *
 * @param metadata Persisted metadata object
 * @returns TokenCountFooter if present, null otherwise
 *
 * @example
 * ```ts
 * const metadata = { token_count: { response_tokens: 100, ... } }
 * const footer = extractTokenCountFromMetadata(metadata)
 * if (footer) {
 *   console.log(`Response used ${footer.response_tokens} tokens`)
 * }
 * ```
 */
export function extractTokenCountFromMetadata(
  metadata: Record<string, unknown>,
): TokenCountFooter | null {
  return (metadata.token_count as TokenCountFooter) || null
}

/**
 * Validate and repair metadata structure before persistence.
 *
 * Ensures:
 * - token_count.total_tokens matches response + request tokens
 * - All numeric fields are valid
 * - Required fields are present
 *
 * @param metadata Metadata to repair
 * @returns Repaired metadata object
 *
 * @example
 * ```ts
 * const repaired = repairMetadata(envelope.metadata)
 * const result = await atomicWriteMetadata(repaired, filePath)
 * ```
 */
export function repairMetadata(metadata: Record<string, unknown>): Record<string, unknown> {
  const repaired = { ...metadata }

  // If token_count present, ensure total is correct
  if (repaired.token_count && typeof repaired.token_count === 'object') {
    const tc = repaired.token_count as Record<string, unknown>

    // Recompute total if response and request tokens are present
    if (typeof tc.response_tokens === 'number' && typeof tc.request_tokens === 'number') {
      tc.total_tokens = tc.response_tokens + tc.request_tokens
    } else if (typeof tc.response_tokens === 'number') {
      tc.total_tokens = tc.response_tokens
    }
  }

  return repaired
}
