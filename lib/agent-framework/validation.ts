/**
 * Tool Result Validation Layer
 * Ensures tool_result blocks have valid structure before processing
 * Provides detailed error context for recovery logic
 */

export interface ValidationResult {
  valid: boolean
  errors: ValidationError[]
  warnings: string[]
  corrected?: unknown
}

export interface ValidationError {
  code: string
  message: string
  path?: string
  expected?: unknown
  actual?: unknown
}

/**
 * Validate that a tool_use_id has the correct format
 * Expected: alphanumeric, underscores, hyphens, 1-128 chars
 */
export function validateToolUseId(toolUseId: unknown): ValidationResult {
  const errors: ValidationError[] = []
  const warnings: string[] = []

  if (!toolUseId) {
    errors.push({
      code: 'TOOL_USE_ID_MISSING',
      message: 'tool_use_id is required',
    })
    return { valid: false, errors, warnings }
  }

  if (typeof toolUseId !== 'string') {
    errors.push({
      code: 'TOOL_USE_ID_TYPE_INVALID',
      message: `tool_use_id must be string, got ${typeof toolUseId}`,
      expected: 'string',
      actual: typeof toolUseId,
    })
    return { valid: false, errors, warnings }
  }

  if (toolUseId.length === 0) {
    errors.push({
      code: 'TOOL_USE_ID_EMPTY',
      message: 'tool_use_id cannot be empty',
    })
    return { valid: false, errors, warnings }
  }

  if (toolUseId.length > 128) {
    errors.push({
      code: 'TOOL_USE_ID_TOO_LONG',
      message: `tool_use_id exceeds 128 chars (got ${toolUseId.length})`,
    })
  }

  // Valid format: alphanumeric, underscore, hyphen
  const validFormat = /^[a-zA-Z0-9_-]+$/.test(toolUseId)
  if (!validFormat) {
    errors.push({
      code: 'TOOL_USE_ID_INVALID_FORMAT',
      message: 'tool_use_id contains invalid characters (only alphanumeric, _, - allowed)',
      actual: toolUseId,
    })
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  }
}

/**
 * Validate a tool_result block has required fields
 */
export function validateToolResultBlock(block: unknown): ValidationResult {
  const errors: ValidationError[] = []
  const warnings: string[] = []

  if (!block || typeof block !== 'object') {
    errors.push({
      code: 'BLOCK_STRUCTURE_INVALID',
      message: 'tool_result must be an object',
      actual: typeof block,
    })
    return { valid: false, errors, warnings }
  }

  const result = block as Record<string, unknown>

  // Check type
  if (result.type !== 'tool_result') {
    errors.push({
      code: 'BLOCK_TYPE_INVALID',
      message: `type must be 'tool_result', got '${result.type}'`,
      expected: 'tool_result',
      actual: result.type,
    })
  }

  // Check tool_use_id
  const idValidation = validateToolUseId(result.tool_use_id)
  if (!idValidation.valid) {
    errors.push(...idValidation.errors)
  }
  errors.push(...idValidation.warnings.map(w => ({
    code: 'TOOL_USE_ID_WARNING',
    message: w,
  })))

  // Check content (optional but warn if missing)
  if (result.content === undefined || result.content === null) {
    warnings.push('tool_result.content is empty or null')
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  }
}

/**
 * Validate that tool_use_ids match between tool_use and tool_result
 */
export function validateToolResultCorrelation(
  toolUseId: string,
  resultBlock: unknown
): ValidationResult {
  const errors: ValidationError[] = []
  const warnings: string[] = []

  if (!resultBlock || typeof resultBlock !== 'object') {
    errors.push({
      code: 'RESULT_BLOCK_MISSING',
      message: 'tool_result block is missing or invalid',
    })
    return { valid: false, errors, warnings }
  }

  const result = resultBlock as Record<string, unknown>

  if (result.tool_use_id !== toolUseId) {
    errors.push({
      code: 'TOOL_USE_ID_MISMATCH',
      message: `tool_use_id mismatch: tool_use='${toolUseId}' vs tool_result='${result.tool_use_id}'`,
      expected: toolUseId,
      actual: result.tool_use_id,
    })
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  }
}

/**
 * Comprehensive validation for a complete message sequence
 * Ensures tool_use and tool_result blocks are paired correctly
 */
export function validateMessageSequence(messages: unknown[]): ValidationResult {
  const errors: ValidationError[] = []
  const warnings: string[] = []

  if (!Array.isArray(messages)) {
    errors.push({
      code: 'MESSAGES_NOT_ARRAY',
      message: 'messages must be an array',
    })
    return { valid: false, errors, warnings }
  }

  const pendingToolUses = new Map<string, number>()

  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i]
    if (!msg || typeof msg !== 'object') {
      errors.push({
        code: 'MESSAGE_INVALID',
        message: `message at index ${i} is not a valid object`,
        path: `messages[${i}]`,
      })
      continue
    }

    const msgObj = msg as Record<string, unknown>
    const role = msgObj.role

    if (role === 'assistant') {
      const content = msgObj.content
      if (Array.isArray(content)) {
        for (let j = 0; j < content.length; j++) {
          const block = content[j]
          if (!block || typeof block !== 'object') continue

          const blockObj = block as Record<string, unknown>
          if (blockObj.type === 'tool_use') {
            const toolUseId = blockObj.id as string
            if (toolUseId) {
              pendingToolUses.set(toolUseId, i)
            }
          }
        }
      }
    } else if (role === 'user') {
      const content = msgObj.content
      if (Array.isArray(content)) {
        for (let j = 0; j < content.length; j++) {
          const block = content[j]
          if (!block || typeof block !== 'object') continue

          const blockObj = block as Record<string, unknown>
          if (blockObj.type === 'tool_result') {
            const toolUseId = blockObj.tool_use_id as string
            if (!toolUseId) {
              errors.push({
                code: 'TOOL_RESULT_NO_ID',
                message: 'tool_result block missing tool_use_id',
                path: `messages[${i}].content[${j}]`,
              })
            } else if (!pendingToolUses.has(toolUseId)) {
              errors.push({
                code: 'TOOL_RESULT_NO_MATCHING_USE',
                message: `tool_result references unknown tool_use_id: ${toolUseId}`,
                path: `messages[${i}].content[${j}]`,
                actual: toolUseId,
              })
            } else {
              pendingToolUses.delete(toolUseId)
            }
          }
        }
      }
    }
  }

  // Any remaining tool_uses without results
  for (const [toolUseId, msgIndex] of pendingToolUses.entries()) {
    warnings.push(`tool_use '${toolUseId}' at message ${msgIndex} has no corresponding tool_result`)
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  }
}

/**
 * Get human-readable error summary
 */
export function formatValidationErrors(result: ValidationResult): string {
  if (result.valid) return 'Validation passed ✓'

  const parts: string[] = []
  if (result.errors.length > 0) {
    parts.push(`Errors (${result.errors.length}):`)
    for (const err of result.errors) {
      parts.push(`  - [${err.code}] ${err.message}`)
      if (err.path) parts.push(`    at: ${err.path}`)
      if (err.expected !== undefined) parts.push(`    expected: ${JSON.stringify(err.expected)}`)
      if (err.actual !== undefined) parts.push(`    actual: ${JSON.stringify(err.actual)}`)
    }
  }

  if (result.warnings.length > 0) {
    parts.push(`Warnings (${result.warnings.length}):`)
    for (const w of result.warnings) {
      parts.push(`  - ${w}`)
    }
  }

  return parts.join('\n')
}
