/**
 * Response Grounding Logger
 * 
 * Logs verification of LLM responses against knowledge base (claim verification).
 * Tracks grounding checks to identify hallucinations and unverified claims.
 * 
 * Writes asynchronously to avoid blocking response delivery.
 * Includes timestamp, request_id, check type, claim data, and verification results.
 * 
 * Usage:
 * ```ts
 * const requestId = generateRequestId()
 * const claims = await extractClaims(responseText)
 * const results = await verifyClaimsAgainstKB(claims)
 * await logGroundingCheck(requestId, '/api/agents', claims, results)
 * ```
 */

import { createHash } from 'node:crypto'
import { mkdir, appendFile } from 'node:fs/promises'
import { join } from 'node:path'

const DEBUG_DIR = join(process.cwd(), 'debug')
const GROUNDING_LOG_PATH = join(DEBUG_DIR, 'grounding.log')

/**
 * Single claim extracted from response
 */
interface ExtractedClaim {
  text: string
  confidence: number // 0.0-1.0
  category?: string
  context?: string
}

/**
 * Verification result for a single claim
 */
interface ClaimVerification {
  claim_text: string
  verified: boolean // true if found in knowledge base with high confidence
  similarity_score?: number // 0.0-1.0
  match_type?: 'supported' | 'contradicted' | 'partial' | 'unrelated'
  kb_entry_id?: string
  confidence: number // 0.0-1.0 (verification confidence)
  flagged_for_review: boolean
}

/**
 * Grounding check log entry
 */
interface GroundingCheckLog {
  timestamp: string
  request_id: string
  route: string
  
  // Check metadata
  check_type: 'extraction' | 'verification' | 'summary'
  response_hash: string
  response_length: number
  
  // Claim data
  claims_extracted: number
  verified_claims: number
  unverified_claims: number
  flagged_claims: number
  
  // Summary metrics
  overall_grounding_score: number // 0.0-1.0 weighted average
  requires_human_review: boolean
  
  // Detail level - set via LOG_LEVEL env var
  level: 'error' | 'warn' | 'info' | 'debug'
  
  metadata?: {
    claims_detail?: ClaimVerification[]
    extraction_time_ms?: number
    verification_time_ms?: number
    memory_mb?: number
  }
}

/**
 * Log level configuration - filter what gets written to disk
 */
type LogLevel = 'error' | 'warn' | 'info' | 'debug'

interface GroundingLogConfig {
  level: LogLevel
  writeDetailToDisk: boolean
  filterSensitiveData: boolean
  maxClaimsLogged: number
}

/**
 * Default configuration
 */
const DEFAULT_CONFIG: GroundingLogConfig = {
  level: (process.env.LOG_LEVEL as LogLevel) || 'info',
  writeDetailToDisk: process.env.GROUNDING_LOG_DETAIL === 'true',
  filterSensitiveData: process.env.FILTER_SENSITIVE_DATA !== 'false',
  maxClaimsLogged: parseInt(process.env.GROUNDING_MAX_CLAIMS || '20', 10),
}

/**
 * Compute SHA256 hash of a string payload
 */
function computeHash(payload: string): string {
  return createHash('sha256').update(payload).digest('hex').substring(0, 16)
}

/**
 * Filter sensitive data from claim text (PII, tokens, API keys, etc.)
 */
function sanitizeClaimText(text: string, filter: boolean): string {
  if (!filter) return text

  let sanitized = text
  // Mask email addresses
  sanitized = sanitized.replace(/[^\s@]+@[^\s@]+\.[^\s@]+/g, '[EMAIL]')
  // Mask URLs
  sanitized = sanitized.replace(/https?:\/\/[^\s]+/g, '[URL]')
  // Mask API keys/tokens (common patterns)
  sanitized = sanitized.replace(/sk_[a-zA-Z0-9_]{20,}/g, '[API_KEY]')
  sanitized = sanitized.replace(/token_[a-zA-Z0-9_]{20,}/g, '[TOKEN]')

  return sanitized
}

/**
 * Ensure debug directory exists
 */
async function ensureDebugDir(): Promise<void> {
  try {
    await mkdir(DEBUG_DIR, { recursive: true })
  } catch (err) {
    console.error('[grounding] Failed to create debug dir:', err instanceof Error ? err.message : String(err))
  }
}

/**
 * Check if a log entry should be written based on configured level
 */
function shouldLog(entryLevel: LogLevel, configLevel: LogLevel): boolean {
  const levels: Record<LogLevel, number> = {
    error: 0,
    warn: 1,
    info: 2,
    debug: 3,
  }
  return levels[entryLevel] <= levels[configLevel]
}

/**
 * Log a grounding check to disk
 * Runs asynchronously — does NOT block response delivery
 *
 * @param requestId - Unique request identifier
 * @param route - API route path (e.g., '/api/agents/generate')
 * @param responseText - The LLM response that was grounded
 * @param claims - Extracted claims from the response
 * @param verifications - Verification results for each claim
 * @param options - Additional configuration and metadata
 */
export async function logGroundingCheck(
  requestId: string,
  route: string,
  responseText: string,
  claims: ExtractedClaim[],
  verifications: ClaimVerification[],
  options?: {
    level?: LogLevel
    extractionTimeMs?: number
    verificationTimeMs?: number
    metadata?: Record<string, unknown>
  },
): Promise<void> {
  try {
    const config = { ...DEFAULT_CONFIG, level: options?.level || DEFAULT_CONFIG.level }

    const responseHash = computeHash(responseText)
    const responseLength = responseText.length

    // Calculate grounding metrics
    const verifiedCount = verifications.filter((v) => v.verified).length
    const flaggedCount = verifications.filter((v) => v.flagged_for_review).length
    const unverifiedCount = verifications.length - verifiedCount

    // Compute weighted grounding score
    // Formula: (verified_claims * 1.0 + partial_claims * 0.5 + unverified * 0.0) / total_claims
    const partialCount = verifications.filter((v) => v.match_type === 'partial').length
    const totalScore =
      verifiedCount * 1.0 +
      partialCount * 0.5 +
      unverifiedCount * 0.0
    const groundingScore = verifications.length > 0 ? totalScore / verifications.length : 1.0

    const requiresReview = flaggedCount > 0 || groundingScore < 0.5

    // Build log entry
    const logEntry: GroundingCheckLog = {
      timestamp: new Date().toISOString(),
      request_id: requestId,
      route,
      check_type: 'verification',
      response_hash: responseHash,
      response_length: responseLength,
      claims_extracted: claims.length,
      verified_claims: verifiedCount,
      unverified_claims: unverifiedCount,
      flagged_claims: flaggedCount,
      overall_grounding_score: parseFloat(groundingScore.toFixed(3)),
      requires_human_review: requiresReview,
      level: config.level,
    }

    // Add metadata if detailed logging is enabled
    if (config.writeDetailToDisk && verifications.length > 0) {
      const sanitizedVerifications = verifications
        .slice(0, config.maxClaimsLogged)
        .map((v) => ({
          ...v,
          claim_text: sanitizeClaimText(v.claim_text, config.filterSensitiveData),
        }))

      logEntry.metadata = {
        claims_detail: sanitizedVerifications,
        extraction_time_ms: options?.extractionTimeMs,
        verification_time_ms: options?.verificationTimeMs,
        memory_mb: process.memoryUsage ? Math.round(process.memoryUsage().heapUsed / 1024 / 1024) : undefined,
      }
    }

    // Check if this entry should be logged
    if (!shouldLog(logEntry.level, config.level)) {
      return
    }

    // Ensure debug directory exists
    await ensureDebugDir()

    const logLine = JSON.stringify(logEntry)

    // Fire-and-forget: append to log without awaiting
    appendFile(GROUNDING_LOG_PATH, logLine + '\n').catch((err) => {
      console.error('[grounding] Failed to write log:', err instanceof Error ? err.message : String(err))
    })

    // Also log to console if error or warn level
    if (logEntry.level === 'error' || (logEntry.level === 'warn' && requiresReview)) {
      console.warn(
        `[grounding] ${requestId} | route=${route} | grounding=${groundingScore.toFixed(2)} | flagged=${flaggedCount}/${verifications.length}`,
      )
    }
  } catch (err) {
    console.error(
      '[grounding] Error in logGroundingCheck:',
      err instanceof Error ? err.message : String(err),
    )
  }
}

/**
 * Log a grounding check failure (when verification process fails)
 * Logs error-level entry for investigation
 *
 * @param requestId - Unique request identifier
 * @param route - API route path
 * @param errorMessage - What went wrong
 * @param context - Additional error context
 */
export async function logGroundingError(
  requestId: string,
  route: string,
  errorMessage: string,
  context?: Record<string, unknown>,
): Promise<void> {
  try {
    await ensureDebugDir()

    const logEntry = {
      timestamp: new Date().toISOString(),
      request_id: requestId,
      route,
      check_type: 'error' as const,
      level: 'error' as const,
      error_message: errorMessage,
      context,
    }

    const logLine = JSON.stringify(logEntry)

    appendFile(GROUNDING_LOG_PATH, logLine + '\n').catch((err) => {
      console.error('[grounding] Failed to write error log:', err instanceof Error ? err.message : String(err))
    })

    // Always log errors to console
    console.error(`[grounding] ERROR ${requestId} at ${route}: ${errorMessage}`)
  } catch (err) {
    console.error('[grounding] Error in logGroundingError:', err instanceof Error ? err.message : String(err))
  }
}

/**
 * Generate a request ID for tracing
 * Uses timestamp + random suffix for uniqueness
 *
 * @returns Request ID string (e.g., "ground-1234567890-abc123")
 */
export function generateGroundingRequestId(): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `ground-${timestamp}-${random}`
}

/**
 * Configuration interface exported for testing/extension
 */
export function getGroundingLogConfig(): GroundingLogConfig {
  return { ...DEFAULT_CONFIG }
}

/**
 * Update grounding log configuration at runtime
 */
export function setGroundingLogConfig(config: Partial<GroundingLogConfig>): void {
  Object.assign(DEFAULT_CONFIG, config)
}

/**
 * Type exports for use in other modules
 */
export type { GroundingCheckLog, ClaimVerification, ExtractedClaim, GroundingLogConfig }
