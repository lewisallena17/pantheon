/**
 * Claim Verification System Types
 * Handles extraction, verification, and tracking of claims in conversations
 */

export interface KnowledgeBaseEntry {
  id: string
  category: 'technical' | 'process' | 'business' | 'policy' | 'other'
  claim: string
  description?: string
  source_url?: string
  source_title?: string
  confidence: number // 0.0-1.0
  verified_by?: string
  verified_at?: string
  keywords?: string[]
  related_entries?: string[]
  metadata?: Record<string, unknown>
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ExtractedClaim {
  id: string
  session_id: string
  turn_id: string
  user_id: string
  claim_text: string
  extracted_at: string
  verification_status: 'unverified' | 'verified' | 'disputed' | 'flagged_review'
  metadata?: Record<string, unknown>
  created_at: string
}

export interface VerificationResult {
  id: string
  claim_id: string
  kb_entry_id?: string
  similarity_score: number // 0.0-1.0
  match_type: 'supported' | 'contradicted' | 'partial' | 'unrelated'
  confidence: number // 0.0-1.0
  explanation?: string
  reviewer_notes?: string
  reviewed_at?: string
  reviewed_by?: string
  flagged_for_review: boolean
  created_at: string
  updated_at: string
}

export interface VerificationAuditLog {
  id: string
  claim_id: string
  operation: 'extracted' | 'verified' | 'disputed' | 'reviewed' | 'updated'
  actor_type: 'system' | 'user' | 'human_reviewer'
  actor_id?: string
  details?: Record<string, unknown>
  created_at: string
}

/**
 * Claim verification response sent to UI
 * Contains extracted claim with verification results
 */
export interface ClaimVerificationResponse {
  claim: ExtractedClaim
  results: VerificationResult[]
  topMatch?: VerificationResult & { kb_entry: KnowledgeBaseEntry }
  summary: {
    status: 'verified' | 'disputed' | 'unverified' | 'flagged'
    confidence: number
    matchCount: number
    requiresReview: boolean
  }
}

/**
 * Claim extraction request
 * Sent from conversation handler to extraction service
 */
export interface ClaimExtractionRequest {
  sessionId: string
  turnId: string
  userId: string
  messageText: string
  speaker: 'user' | 'assistant'
}

/**
 * Claim extraction result
 * Raw claims extracted from a message
 */
export interface ClaimExtractionResult {
  claims: Array<{
    text: string
    confidence: number
    category?: string
    context?: string
  }>
  metadata?: {
    extractionModel?: string
    processingTime?: number
  }
}

/**
 * Semantic search request for knowledge base
 */
export interface KnowledgeBaseSearchRequest {
  query: string
  category?: string
  limit?: number
  threshold?: number
}

/**
 * Semantic search result
 */
export interface KnowledgeBaseSearchResult {
  entries: Array<KnowledgeBaseEntry & { similarity: number }>
  totalMatches: number
  processingTime: number
}

/**
 * Verification config for tuning sensitivity
 */
export interface VerificationConfig {
  extractionConfidenceThreshold: number // 0.5-1.0, default 0.6
  similarityScoreThreshold: number // 0.5-1.0, default 0.7
  verificationConfidenceThreshold: number // 0.5-1.0, default 0.65
  flagForReviewThreshold: number // 0.4-0.8, default 0.5
  autoVerifyThreshold: number // 0.8-1.0, default 0.85
  enableSemanticSearch: boolean
  enableClaimExtraction: boolean
}
