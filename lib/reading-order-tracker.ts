/**
 * Reading order tracking utility.
 * 
 * Segments multi-paragraph responses into sentences and tracks
 * which sentence position gets read/focused first.
 */

export interface Sentence {
  text: string;
  paragraphIndex: number;
  sentenceIndex: number;
  elementId: string;
}

export interface ReadingOrderEvent {
  sentenceIndex: number;
  paragraphIndex: number;
  sentenceText: string;
  interactionType: 'click' | 'focus' | 'scroll' | 'hover';
  timestamp: number;
  readFirstPosition?: number; // 1-indexed position among all sentences
}

/**
 * Splits text into paragraphs (separated by double newlines or block structure).
 * Handles both explicit newlines and DOM paragraph elements.
 */
export function extractParagraphs(text: string): string[] {
  return text
    .split(/\n\n+/)
    .map(p => p.trim())
    .filter(p => p.length > 0);
}

/**
 * Splits a paragraph into sentences using common sentence delimiters.
 * Handles abbreviations (Dr., Mr., etc.) by not breaking on period+capital letter pairs.
 */
export function extractSentences(paragraph: string): string[] {
  // Replace common abbreviations temporarily to avoid false splits
  const withPlaceholders = paragraph
    .replace(/\bDr\./g, '__DR__')
    .replace(/\bMr\./g, '__MR__')
    .replace(/\bMs\./g, '__MS__')
    .replace(/\bMrs\./g, '__MRS__')
    .replace(/\be\.g\./g, '__EG__')
    .replace(/\bi\.e\./g, '__IE__')
    .replace(/\bvs\./g, '__VS__');

  // Split on sentence boundaries: . ! ? followed by space and capital letter
  const sentences = withPlaceholders
    .split(/(?<=[.!?])\s+(?=[A-Z])/g)
    .map(s =>
      s
        .replace(/__DR__/g, 'Dr.')
        .replace(/__MR__/g, 'Mr.')
        .replace(/__MS__/g, 'Ms.')
        .replace(/__MRS__/g, 'Mrs.')
        .replace(/__EG__/g, 'e.g.')
        .replace(/__IE__/g, 'i.e.')
        .replace(/__VS__/g, 'vs.')
    )
    .map(s => s.trim())
    .filter(s => s.length > 0);

  return sentences;
}

/**
 * Segments a multi-paragraph response into structured Sentence objects.
 * Returns flat list with paragraph and sentence indices.
 */
export function segmentResponse(text: string): Sentence[] {
  const paragraphs = extractParagraphs(text);
  const sentences: Sentence[] = [];

  paragraphs.forEach((paragraph, paragraphIndex) => {
    const sentenceTexts = extractSentences(paragraph);
    sentenceTexts.forEach((sentenceText, sentenceIndex) => {
      sentences.push({
        text: sentenceText,
        paragraphIndex,
        sentenceIndex,
        elementId: `sentence-p${paragraphIndex}-s${sentenceIndex}`,
      });
    });
  });

  return sentences;
}

/**
 * Generates a unique session ID for tracking reading behavior across page loads.
 */
export function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Logs a reading order event to the backend.
 */
export async function logReadingOrderEvent(
  sessionId: string,
  paragraphIndex: number,
  sentenceIndex: number,
  sentenceText: string,
  interactionType: 'click' | 'focus' | 'scroll' | 'hover',
  responseId?: string,
  readFirstPosition?: number
): Promise<void> {
  try {
    const payload = {
      session_id: sessionId,
      response_id: responseId,
      paragraph_index: paragraphIndex,
      sentence_index: sentenceIndex,
      sentence_text: sentenceText,
      read_first_position: readFirstPosition,
      interaction_type: interactionType,
      user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
    };

    const response = await fetch('/api/reading-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.warn(
        '[reading-order-tracker] Failed to log event:',
        response.status,
        response.statusText
      );
    }
  } catch (error) {
    console.warn('[reading-order-tracker] Error logging event:', error);
  }
}

/**
 * Tracks which sentence gets interacted with first.
 * Returns a function that can be called to mark a sentence as "read first".
 */
export function createReadingOrderTracker(sessionId: string, responseId?: string) {
  let firstInteractionLogged = false;
  let interactionOrder = 0;

  return async (
    paragraphIndex: number,
    sentenceIndex: number,
    sentenceText: string,
    interactionType: 'click' | 'focus' | 'scroll' | 'hover'
  ) => {
    interactionOrder++;

    // Log all interactions, but mark the first one
    const readFirstPosition = !firstInteractionLogged ? 1 : interactionOrder;
    if (!firstInteractionLogged) {
      firstInteractionLogged = true;
    }

    await logReadingOrderEvent(
      sessionId,
      paragraphIndex,
      sentenceIndex,
      sentenceText,
      interactionType,
      responseId,
      readFirstPosition === 1 ? readFirstPosition : undefined
    );
  };
}
