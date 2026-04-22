/**
 * Text formatting utilities for response wrapping and display.
 * Handles line-wrapping to maintain consistent output width.
 */

/**
 * Wraps text to a maximum line width by breaking at word boundaries.
 * 
 * @param text - The text to wrap
 * @param maxWidth - Maximum characters per line (default: 80)
 * @returns Text with newlines inserted at appropriate word boundaries
 * 
 * @example
 * ```ts
 * const wrapped = wrapText("This is a long line of text...", 20);
 * // "This is a long line\nof text..."
 * ```
 */
export function wrapText(text: string, maxWidth: number = 80): string {
  if (!text || maxWidth <= 0) {
    return text;
  }

  const words = text.split(/\s+/).filter(word => word.length > 0);
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    // If the word itself is longer than maxWidth, add it on its own line
    if (word.length > maxWidth) {
      if (currentLine) {
        lines.push(currentLine);
        currentLine = '';
      }
      lines.push(word);
      continue;
    }

    // If adding the word would exceed maxWidth, start a new line
    if (currentLine && currentLine.length + 1 + word.length > maxWidth) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      // Add word to current line
      currentLine = currentLine ? `${currentLine} ${word}` : word;
    }
  }

  // Add any remaining text
  if (currentLine) {
    lines.push(currentLine);
  }

  return lines.join('\n');
}

/**
 * Formats a response object for display, applying text wrapping if needed.
 * 
 * @param response - The response text to format
 * @param maxWidth - Maximum characters per line (default: 80)
 * @returns Formatted response with wrapped lines
 */
export function formatResponse(
  response: string,
  maxWidth: number = 80
): string {
  return wrapText(response, maxWidth);
}

/**
 * Strips leading/trailing whitespace and normalizes internal whitespace,
 * then applies text wrapping.
 * 
 * @param text - The text to normalize and wrap
 * @param maxWidth - Maximum characters per line (default: 80)
 * @returns Normalized and wrapped text
 */
export function normalizeAndWrapText(
  text: string,
  maxWidth: number = 80
): string {
  const normalized = text.trim().replace(/\s+/g, ' ');
  return wrapText(normalized, maxWidth);
}
