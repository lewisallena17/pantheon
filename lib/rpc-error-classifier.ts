/**
 * RPC Error Classifier
 * 
 * Classifies RPC errors into standardized categories for analysis and monitoring.
 * Used by export and reporting systems.
 */

export enum ErrorType {
  CONNECTION = 'CONNECTION',
  RATE_LIMIT = 'RATE_LIMIT',
  SYNTAX = 'SYNTAX',
  CONSTRAINT = 'CONSTRAINT',
  PARSE_ERROR = 'PARSE_ERROR',
  UNKNOWN = 'UNKNOWN',
}

export interface ErrorTypeMetadata {
  type: ErrorType;
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  suggestedAction: string;
}

const ERROR_TYPE_METADATA: Record<ErrorType, ErrorTypeMetadata> = {
  [ErrorType.CONNECTION]: {
    type: ErrorType.CONNECTION,
    severity: 'high',
    description: 'Network connectivity or timeout issues with RPC endpoint',
    suggestedAction: 'Check network connectivity, increase timeout limits, verify RPC endpoint health',
  },
  [ErrorType.RATE_LIMIT]: {
    type: ErrorType.RATE_LIMIT,
    severity: 'high',
    description: 'RPC endpoint rate limit exceeded',
    suggestedAction: 'Implement exponential backoff, reduce request frequency, upgrade RPC plan',
  },
  [ErrorType.SYNTAX]: {
    type: ErrorType.SYNTAX,
    severity: 'critical',
    description: 'SQL or JSON syntax error in RPC request/response',
    suggestedAction: 'Review RPC function definition and input validation logic',
  },
  [ErrorType.CONSTRAINT]: {
    type: ErrorType.CONSTRAINT,
    severity: 'critical',
    description: 'Database constraint violation (NOT NULL, UNIQUE, FOREIGN KEY, etc.)',
    suggestedAction: 'Verify data integrity, check constraint definitions, validate input data',
  },
  [ErrorType.PARSE_ERROR]: {
    type: ErrorType.PARSE_ERROR,
    severity: 'high',
    description: 'Failed to parse JSON or structured data in RPC response',
    suggestedAction: 'Validate JSON response format, check RPC function return type definition',
  },
  [ErrorType.UNKNOWN]: {
    type: ErrorType.UNKNOWN,
    severity: 'medium',
    description: 'Unclassified error',
    suggestedAction: 'Inspect error code and message for root cause analysis',
  },
};

/**
 * Classify an RPC error based on error code and message
 */
export function classifyRpcError(
  errorCode: string | null | undefined,
  errorMessage: string | null | undefined
): ErrorType {
  const code = (errorCode || '').toUpperCase();
  const message = (errorMessage || '').toLowerCase();

  // Connection/timeout errors
  if (code.includes('PGRST001') || message.includes('timeout') || message.includes('connection')) {
    return ErrorType.CONNECTION;
  }

  // Rate limit errors
  if (code.includes('PGRST003') || message.includes('rate limit')) {
    return ErrorType.RATE_LIMIT;
  }

  // SQL syntax errors (PostgreSQL error code 42601)
  if (code === '42601' || message.includes('syntax error')) {
    return ErrorType.SYNTAX;
  }

  // Constraint violations
  if (
    code === 'NULL_CONSTRAINT' ||
    code.includes('UNIQUE') ||
    code.includes('FK') ||
    message.includes('constraint') ||
    message.includes('violation')
  ) {
    return ErrorType.CONSTRAINT;
  }

  // JSON/parse errors
  if (code?.includes('PGRST002') || message.includes('parse') || message.includes('json')) {
    return ErrorType.PARSE_ERROR;
  }

  return ErrorType.UNKNOWN;
}

/**
 * Get metadata for an error type
 */
export function getErrorTypeMetadata(errorType: ErrorType): ErrorTypeMetadata {
  return ERROR_TYPE_METADATA[errorType];
}

/**
 * Get all error type metadata
 */
export function getAllErrorTypeMetadata(): Record<ErrorType, ErrorTypeMetadata> {
  return ERROR_TYPE_METADATA;
}

/**
 * Format error type for display
 */
export function formatErrorType(errorType: ErrorType): string {
  return errorType.replace(/_/g, ' ').toLowerCase();
}

/**
 * Get severity color for UI rendering
 */
export function getSeverityColor(
  severity: 'critical' | 'high' | 'medium' | 'low'
): string {
  switch (severity) {
    case 'critical':
      return 'bg-red-100 text-red-800';
    case 'high':
      return 'bg-orange-100 text-orange-800';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800';
    case 'low':
      return 'bg-blue-100 text-blue-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

/**
 * Calculate resolution time in human-readable format
 */
export function formatResolutionTime(resolutionTimeMs: number | null): string {
  if (!resolutionTimeMs) return 'N/A';

  const seconds = Math.floor(resolutionTimeMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
}
