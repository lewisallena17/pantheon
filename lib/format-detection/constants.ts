/**
 * Format detection constants
 */

import type { FormatDetectionConfig } from '@/types/format-detection'

/**
 * Default configuration for format detection
 */
export const DEFAULT_DETECTION_CONFIG: FormatDetectionConfig = {
  enableExplicitDetection: true,
  enableImplicitDetection: true,
  enableContextDetection: true,
  enableHabitDetection: true,
  enableSemanticDetection: true,
  weights: {
    explicit: 0.3,
    implicit: 0.25,
    context: 0.2,
    habit: 0.15,
    semantic: 0.1,
  },
  minConfidenceToSuggest: 0.4,
  minSuggestionsToShow: 2,
  maxSuggestionsToShow: 4,
  trackUserHistory: true,
  historyWindow: 10,
}
