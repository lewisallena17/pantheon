// lib/extract-first-claim.ts
// Extract the first claim/sentence from text for analysis

export function extractFirstClaim(text: string): string | null {
  if (!text?.trim()) return null;
  
  const sentences = text.match(/[^.!?]+[.!?]+/);
  if (!sentences) return null;
  
  const claim = sentences[0].trim();
  return claim.length > 0 ? claim : null;
}
