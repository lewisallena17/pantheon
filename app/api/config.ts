import { NextRequest, NextResponse } from 'next/server'

/**
 * Allowed response format types for API responses
 */
export type ResponseFormat = 'json' | 'markdown' | 'plain-text' | 'html'

/**
 * API Configuration interface — defines the shape of configuration data
 */
export interface ApiConfig {
  responseFormat: ResponseFormat
  includeMetadata?: boolean
  maxResponseLength?: number
  timeout?: number
}

/**
 * Default configuration values
 */
export const DEFAULT_CONFIG: ApiConfig = {
  responseFormat: 'json',
  includeMetadata: true,
  maxResponseLength: 8000,
  timeout: 30000,
}

/**
 * Validate response format — whitelist check
 */
function isValidResponseFormat(value: unknown): value is ResponseFormat {
  return typeof value === 'string' && ['json', 'markdown', 'plain-text', 'html'].includes(value)
}

/**
 * Validate and merge user config with defaults
 */
export function validateConfig(userConfig: unknown): ApiConfig {
  if (!userConfig || typeof userConfig !== 'object') {
    return DEFAULT_CONFIG
  }

  const config = userConfig as Record<string, unknown>

  // Validate responseFormat
  const responseFormat: ResponseFormat = isValidResponseFormat(config.responseFormat)
    ? config.responseFormat
    : DEFAULT_CONFIG.responseFormat

  // Validate optional fields
  const includeMetadata = typeof config.includeMetadata === 'boolean'
    ? config.includeMetadata
    : DEFAULT_CONFIG.includeMetadata

  const maxResponseLength = typeof config.maxResponseLength === 'number' && config.maxResponseLength > 0
    ? config.maxResponseLength
    : DEFAULT_CONFIG.maxResponseLength

  const timeout = typeof config.timeout === 'number' && config.timeout > 0
    ? config.timeout
    : DEFAULT_CONFIG.timeout

  return {
    responseFormat,
    includeMetadata,
    maxResponseLength,
    timeout,
  }
}

/**
 * GET /api/config — retrieve current configuration (read-only or with user overrides from query params)
 */
export async function GET(req: NextRequest) {
  try {
    // Allow reading config with optional query params for testing
    const format = req.nextUrl.searchParams.get('response-format')
    const metadata = req.nextUrl.searchParams.get('include-metadata')

    const userConfig = {
      ...(format && { responseFormat: format }),
      ...(metadata !== null && { includeMetadata: metadata === 'true' }),
    }

    const config = validateConfig(userConfig)

    return NextResponse.json({
      config,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message ?? 'Failed to retrieve config' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/config — set user configuration preferences
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null)

    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { error: 'Request body must be a valid JSON object' },
        { status: 400 }
      )
    }

    const config = validateConfig(body)

    // In a real implementation, you might persist this to Supabase or localStorage
    // For now, we return the validated config
    return NextResponse.json({
      success: true,
      config,
      message: 'Configuration updated successfully',
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message ?? 'Failed to update config' },
      { status: 500 }
    )
  }
}
