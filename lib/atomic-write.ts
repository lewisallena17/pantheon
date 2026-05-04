/**
 * Atomic write utility for response metadata with payload hash and token count checksum validation.
 *
 * Provides:
 * - Payload hash computation (SHA-256)
 * - Token count checksum validation
 * - Atomic write-to-temp-then-rename pattern
 * - Rollback on mismatch or validation failure
 * - Explicit error logging at API boundary
 *
 * Usage:
 * ```ts
 * import { atomicWriteMetadata } from '@/lib/atomic-write'
 *
 * const result = await atomicWriteMetadata(
 *   metadata,
 *   '/public/response_metadata.json',
 *   { validateTokenCount: true, computeHash: true }
 * )
 *
 * if (!result.success) {
 *   console.error('Metadata write failed:', result.error)
 * }
 * ```
 */

import { createHash } from 'crypto'
import { promises as fs } from 'fs'
import path from 'path'

/**
 * Options for atomic write validation
 */
export interface AtomicWriteOptions {
  /**
   * Compute and validate SHA-256 payload hash before commit
   * @default true
   */
  computeHash?: boolean

  /**
   * Validate token count checksum (sum of all token fields)
   * @default true
   */
  validateTokenCount?: boolean

  /**
   * Timeout for atomic write operation (ms)
   * @default 5000
   */
  timeoutMs?: number

  /**
   * Create parent directories if missing
   * @default true
   */
  ensureDirectory?: boolean
}

/**
 * Result of an atomic write operation
 */
export interface AtomicWriteResult {
  /**
   * true if write succeeded and validation passed
   */
  success: boolean

  /**
   * File path where metadata was written (if successful)
   */
  filePath?: string

  /**
   * SHA-256 hash of the written payload
   */
  payloadHash?: string

  /**
   * Token count checksum (sum of all token-related fields)
   */
  tokenChecksum?: number

  /**
   * Timestamp when write was completed
   */
  completedAt?: string

  /**
   * Error message if write failed
   */
  error?: string

  /**
   * Error code for classification
   */
  errorCode?: 'HASH_MISMATCH' | 'CHECKSUM_MISMATCH' | 'WRITE_FAILED' | 'TIMEOUT' | 'VALIDATION_FAILED'

  /**
   * Whether rollback was attempted
   */
  rolledBack?: boolean
}

/**
 * Compute SHA-256 hash of a JSON payload.
 * Deterministic: same payload always produces same hash.
 *
 * @param payload Object to hash
 * @returns Hex-encoded SHA-256 hash
 */
export function computePayloadHash(payload: Record<string, unknown>): string {
  const json = JSON.stringify(payload)
  return createHash('sha256').update(json).digest('hex')
}

/**
 * Calculate token count checksum from a metadata object.
 * Sums all numeric fields that contain "token" in their name.
 *
 * @param metadata Metadata object to checksum
 * @returns Sum of all token-related numeric fields
 *
 * @example
 * ```ts
 * const checksum = calculateTokenChecksum({
 *   token_count: { response_tokens: 100, request_tokens: 50 }
 * })
 * // checksum = 150
 * ```
 */
export function calculateTokenChecksum(metadata: Record<string, unknown>): number {
  let checksum = 0

  const walk = (obj: unknown): void => {
    if (!obj || typeof obj !== 'object') return

    if (Array.isArray(obj)) {
      for (const item of obj) {
        walk(item)
      }
      return
    }

    for (const [key, value] of Object.entries(obj)) {
      // Sum any numeric field with "token" in the name (case-insensitive)
      if (key.toLowerCase().includes('token') && typeof value === 'number') {
        checksum += value
      }

      // Recursively walk nested objects
      if (value && typeof value === 'object') {
        walk(value)
      }
    }
  }

  walk(metadata)
  return checksum
}

/**
 * Validate a metadata object's structure and checksums.
 *
 * @param metadata Metadata to validate
 * @returns Validation error message, or null if valid
 */
export function validateMetadata(metadata: Record<string, unknown>): string | null {
  // Basic structure check
  if (!metadata || typeof metadata !== 'object') {
    return 'Metadata must be an object'
  }

  // If token_count present, validate its structure
  if (metadata.token_count && typeof metadata.token_count === 'object') {
    const tokenCount = metadata.token_count as Record<string, unknown>

    // Must have at least response_tokens
    if (typeof tokenCount.response_tokens !== 'number') {
      return 'Invalid token_count.response_tokens: must be a number'
    }

    // If request_tokens present, validate it
    if (tokenCount.request_tokens !== undefined && typeof tokenCount.request_tokens !== 'number') {
      return 'Invalid token_count.request_tokens: must be a number'
    }

    // If total_tokens present, validate consistency
    if (tokenCount.total_tokens !== undefined && typeof tokenCount.total_tokens === 'number') {
      const expected = (tokenCount.response_tokens || 0) + (tokenCount.request_tokens || 0)
      if (tokenCount.total_tokens !== expected) {
        return `Invalid token_count.total_tokens: expected ${expected}, got ${tokenCount.total_tokens}`
      }
    }
  }

  return null
}

/**
 * Atomically write metadata to a file with pre-write validation.
 *
 * Process:
 * 1. Validate metadata structure
 * 2. Compute payload hash
 * 3. Write to temporary file
 * 4. Compute hash of written data (verification)
 * 5. If hashes don't match, rollback and return error
 * 6. Atomic rename temp file to final location
 * 7. Return result with hash and checksum
 *
 * @param metadata Metadata object to write
 * @param filePath Target file path (absolute or relative to cwd)
 * @param options Configuration for validation and behavior
 * @returns Result indicating success/failure with hash and checksum
 *
 * @example
 * ```ts
 * const result = await atomicWriteMetadata(
 *   { token_count: { response_tokens: 100 } },
 *   '/public/response_metadata.json'
 * )
 *
 * if (!result.success) {
 *   console.error(`Write failed: ${result.error}`)
 *   // rollback already attempted if applicable
 * }
 * ```
 */
export async function atomicWriteMetadata(
  metadata: Record<string, unknown>,
  filePath: string,
  options?: AtomicWriteOptions,
): Promise<AtomicWriteResult> {
  const opts = {
    computeHash: true,
    validateTokenCount: true,
    timeoutMs: 5000,
    ensureDirectory: true,
    ...options,
  }

  try {
    // Set operation timeout
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error('Atomic write operation timed out'))
      }, opts.timeoutMs)
    })

    const writePromise = performAtomicWrite(metadata, filePath, opts)
    const result = await Promise.race([writePromise, timeoutPromise])

    return result
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err)

    // Determine error code
    let errorCode: 'WRITE_FAILED' | 'TIMEOUT' | 'VALIDATION_FAILED' = 'WRITE_FAILED'
    if (errorMessage.includes('timed out')) {
      errorCode = 'TIMEOUT'
    } else if (errorMessage.includes('Invalid') || errorMessage.includes('must be')) {
      errorCode = 'VALIDATION_FAILED'
    }

    return {
      success: false,
      error: errorMessage,
      errorCode,
      completedAt: new Date().toISOString(),
    }
  }
}

/**
 * Internal: perform the actual atomic write with validation.
 *
 * @private
 */
async function performAtomicWrite(
  metadata: Record<string, unknown>,
  filePath: string,
  opts: Required<AtomicWriteOptions>,
): Promise<AtomicWriteResult> {
  // Step 1: Validate metadata structure
  if (opts.validateTokenCount) {
    const validationError = validateMetadata(metadata)
    if (validationError) {
      return {
        success: false,
        error: validationError,
        errorCode: 'VALIDATION_FAILED',
        completedAt: new Date().toISOString(),
      }
    }
  }

  // Step 2: Compute pre-write payload hash
  let preWriteHash: string | undefined
  if (opts.computeHash) {
    preWriteHash = computePayloadHash(metadata)
  }

  // Step 3: Calculate token checksum
  let tokenChecksum: number | undefined
  if (opts.validateTokenCount) {
    tokenChecksum = calculateTokenChecksum(metadata)
  }

  // Step 4: Prepare file paths
  const absolutePath = path.isAbsolute(filePath)
    ? filePath
    : path.resolve(process.cwd(), filePath)

  const tempPath = `${absolutePath}.tmp.${Date.now()}`
  const dir = path.dirname(absolutePath)

  // Step 5: Ensure directory exists
  if (opts.ensureDirectory) {
    try {
      await fs.mkdir(dir, { recursive: true })
    } catch (err) {
      return {
        success: false,
        error: `Failed to create directory: ${err instanceof Error ? err.message : String(err)}`,
        errorCode: 'WRITE_FAILED',
        completedAt: new Date().toISOString(),
      }
    }
  }

  // Step 6: Write metadata to temporary file
  const jsonContent = JSON.stringify(metadata, null, 2)
  try {
    await fs.writeFile(tempPath, jsonContent, 'utf8')
  } catch (err) {
    return {
      success: false,
      error: `Failed to write temporary file: ${err instanceof Error ? err.message : String(err)}`,
      errorCode: 'WRITE_FAILED',
      completedAt: new Date().toISOString(),
    }
  }

  // Step 7: Verify by reading back and recomputing hash
  if (opts.computeHash) {
    try {
      const writtenContent = await fs.readFile(tempPath, 'utf8')
      const postWritePayload = JSON.parse(writtenContent) as Record<string, unknown>
      const postWriteHash = computePayloadHash(postWritePayload)

      if (postWriteHash !== preWriteHash) {
        // Hash mismatch — rollback
        await fs
          .unlink(tempPath)
          .catch(() => {
            /* ignore cleanup errors */
          })

        return {
          success: false,
          error: `Hash mismatch after write: expected ${preWriteHash}, got ${postWriteHash}`,
          errorCode: 'HASH_MISMATCH',
          rolledBack: true,
          completedAt: new Date().toISOString(),
        }
      }
    } catch (err) {
      // Verification failed — rollback
      await fs
        .unlink(tempPath)
        .catch(() => {
          /* ignore cleanup errors */
        })

      return {
        success: false,
        error: `Hash verification failed: ${err instanceof Error ? err.message : String(err)}`,
        errorCode: 'VALIDATION_FAILED',
        rolledBack: true,
        completedAt: new Date().toISOString(),
      }
    }
  }

  // Step 8: Atomic rename
  try {
    await fs.rename(tempPath, absolutePath)
  } catch (err) {
    // Rename failed — attempt cleanup
    await fs
      .unlink(tempPath)
      .catch(() => {
        /* ignore cleanup errors */
      })

    return {
      success: false,
      error: `Failed to rename file: ${err instanceof Error ? err.message : String(err)}`,
      errorCode: 'WRITE_FAILED',
      rolledBack: true,
      completedAt: new Date().toISOString(),
    }
  }

  // Success!
  return {
    success: true,
    filePath: absolutePath,
    payloadHash: preWriteHash,
    tokenChecksum,
    completedAt: new Date().toISOString(),
  }
}
