/**
 * API Configuration Types
 * Defines the shape of configuration preferences for API responses
 */

/**
 * Response format type — controls how API responses are structured
 * - 'json': Standard JSON response (default)
 * - 'markdown': Markdown-formatted response
 * - 'plain-text': Plain text response without formatting
 * - 'html': HTML-formatted response
 */
export type ResponseFormat = 'json' | 'markdown' | 'plain-text' | 'html'

/**
 * API Configuration interface
 * Defines all configurable parameters for API behaviour
 */
export interface ApiConfig {
  /** Format for API responses */
  responseFormat: ResponseFormat

  /** Include metadata in responses (e.g., timestamp, status, duration) */
  includeMetadata?: boolean

  /** Maximum length of response content in characters */
  maxResponseLength?: number

  /** Request timeout in milliseconds */
  timeout?: number
}

/**
 * API Configuration Request body type
 * Allows partial updates to configuration
 */
export type ConfigUpdateRequest = Partial<ApiConfig>

/**
 * API Configuration Response type
 * Wraps config with metadata about the request
 */
export interface ConfigResponse {
  config: ApiConfig
  success?: boolean
  message?: string
  timestamp: string
}
