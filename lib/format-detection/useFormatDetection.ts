/**
 * React hook for format detection and suggestion
 * Manages context, tracks user preferences, and provides format suggestions
 */

'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type {
  OutputFormat,
  UserContext,
  FormatDetectionResult,
  FormatDetectionConfig,
  FormatPreference,
} from '@/types/format-detection'
import { detectFormatSuggestions } from './detector'
import { DEFAULT_DETECTION_CONFIG } from './constants'

const SESSION_STORAGE_KEY = 'format-detection-context'
const PREFERENCES_STORAGE_KEY = 'format-preferences'

/**
 * Load user context from session storage
 */
function loadSessionContext(sessionId: string): UserContext {
  try {
    if (typeof window === 'undefined') {
      return createEmptyContext(sessionId)
    }
    const stored = sessionStorage.getItem(SESSION_STORAGE_KEY)
    return stored ? JSON.parse(stored) as UserContext : createEmptyContext(sessionId)
  } catch {
    return createEmptyContext(sessionId)
  }
}

/**
 * Save user context to session storage
 */
function saveSessionContext(context: UserContext): void {
  try {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(context))
    }
  } catch {
    // Storage quota or other error — fail silently
  }
}

/**
 * Load user preferences from localStorage
 */
function loadUserPreferences(userId?: string): FormatPreference[] {
  try {
    if (typeof window === 'undefined' || !userId) return []
    const stored = localStorage.getItem(`${PREFERENCES_STORAGE_KEY}-${userId}`)
    return stored ? JSON.parse(stored) as FormatPreference[] : []
  } catch {
    return []
  }
}

/**
 * Save user preferences to localStorage
 */
function saveUserPreference(userId: string | undefined, preference: FormatPreference): void {
  try {
    if (typeof window === 'undefined' || !userId) return
    const prefs = loadUserPreferences(userId)
    prefs.push(preference)
    // Keep last 50 preferences
    localStorage.setItem(`${PREFERENCES_STORAGE_KEY}-${userId}`, JSON.stringify(prefs.slice(-50)))
  } catch {
    // Fail silently
  }
}

/**
 * Create empty user context
 */
function createEmptyContext(sessionId: string): UserContext {
  return {
    sessionId,
    messageCount: 0,
    previousFormats: [],
    avgMessageLength: 0,
    recentKeywords: [],
    isFirstMessage: true,
    conversationAge: 0,
  }
}

interface UseFormatDetectionOptions {
  userId?: string
  sessionId?: string
  config?: Partial<FormatDetectionConfig>
  autoTrack?: boolean // Auto-track format selection
}

interface UseFormatDetectionReturn {
  // State
  detectionResult: FormatDetectionResult | null
  isLoading: boolean
  context: UserContext
  
  // Actions
  analyze: (message: string) => FormatDetectionResult
  selectFormat: (format: OutputFormat, feedback?: 'liked' | 'disliked') => void
  recordMessage: (message: string, format?: OutputFormat) => void
  resetContext: () => void
  
  // Utilities
  getSuggestedFormat: () => OutputFormat | undefined
  getSuggestionReasons: () => string[]
}

/**
 * Hook for format detection
 */
export function useFormatDetection({
  userId,
  sessionId: initialSessionId,
  config,
  autoTrack = true,
}: UseFormatDetectionOptions = {}): UseFormatDetectionReturn {
  const sessionId = useRef(initialSessionId || `session-${Date.now()}`).current
  
  const [context, setContext] = useState<UserContext>(() => loadSessionContext(sessionId))
  const [detectionResult, setDetectionResult] = useState<FormatDetectionResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  
  const mergedConfig = { ...DEFAULT_DETECTION_CONFIG, ...config }
  const startTimeRef = useRef(Date.now())

  // Update context every time it changes
  useEffect(() => {
    saveSessionContext(context)
  }, [context])

  /**
   * Analyze a message and get format suggestions
   */
  const analyze = useCallback(
    (message: string): FormatDetectionResult => {
      setIsLoading(true)
      
      const updatedContext: UserContext = {
        ...context,
        messageCount: context.messageCount + 1,
        conversationAge: Math.round((Date.now() - startTimeRef.current) / 1000),
      }

      const result = detectFormatSuggestions(message, updatedContext, mergedConfig)
      setDetectionResult(result)
      setIsLoading(false)

      return result
    },
    [context, mergedConfig],
  )

  /**
   * Record that user selected a format
   */
  const selectFormat = useCallback(
    (format: OutputFormat, feedback?: 'liked' | 'disliked') => {
      setContext(prev => ({
        ...prev,
        previousFormats: [...prev.previousFormats.slice(-20), format],
        preferredFormat: format,
      }))

      // Save preference
      if (userId) {
        const score = feedback === 'liked' ? 1 : feedback === 'disliked' ? -0.5 : 0
        saveUserPreference(userId, {
          userId,
          format,
          score,
          context: detectionResult?.messageCharacteristics.complexity ?? 'moderate',
          timestamp: new Date().toISOString(),
        })
      }
    },
    [userId, detectionResult],
  )

  /**
   * Record a message (with optional format feedback)
   */
  const recordMessage = useCallback(
    (message: string, selectedFormat?: OutputFormat) => {
      analyze(message)
      if (selectedFormat) {
        selectFormat(selectedFormat)
      }
    },
    [analyze, selectFormat],
  )

  /**
   * Reset session context
   */
  const resetContext = useCallback(() => {
    const newContext = createEmptyContext(sessionId)
    setContext(newContext)
    setDetectionResult(null)
    saveSessionContext(newContext)
  }, [sessionId])

  /**
   * Get the top-ranked suggestion
   */
  const getSuggestedFormat = useCallback((): OutputFormat | undefined => {
    return detectionResult?.topSuggestions[0]?.format
  }, [detectionResult])

  /**
   * Get reasons for top suggestion
   */
  const getSuggestionReasons = useCallback((): string[] => {
    return detectionResult?.topSuggestions[0]?.reasons ?? []
  }, [detectionResult])

  return {
    detectionResult,
    isLoading,
    context,
    analyze,
    selectFormat,
    recordMessage,
    resetContext,
    getSuggestedFormat,
    getSuggestionReasons,
  }
}

export default useFormatDetection
