// scripts/lib-translator.mjs
//
// Translates a generated topic-page content object to Spanish / German /
// French via a single Haiku call per language. Used by seo-topic-generator
// to spawn localised versions of every new English page — expanding the
// traffic substrate by ~2× without proportionally more generation cost.
//
// Output shape matches the English generator: { metaTitle, metaDescription,
// intro, sections: [{ h2, paragraphs, code?, list? }], takeaway }.

export const TARGET_LANGS = [
  { code: 'es', name: 'Spanish'  },
  { code: 'de', name: 'German'   },
  { code: 'fr', name: 'French'   },
]

/**
 * @param {object} anthropic — Anthropic SDK client
 * @param {object} content   — English content object (from generatePage())
 * @param {string} langCode  — 'es' | 'de' | 'fr'
 * @returns {Promise<object|null>} translated content in same shape, or null
 */
export async function translateContent(anthropic, content, langCode) {
  const langName = TARGET_LANGS.find(l => l.code === langCode)?.name ?? langCode
  if (!content || !content.sections) return null

  const prompt = `Translate this technical article into ${langName}. Preserve:
- Technical terms like API names, function names, code identifiers (keep in English)
- Code blocks exactly — do not translate code
- Proper nouns (company names, product names like Claude, Supabase, Vercel)
- Markdown formatting

Input (JSON):
${JSON.stringify({
  metaTitle:       content.metaTitle,
  metaDescription: content.metaDescription,
  intro:           content.intro,
  sections:        content.sections.map(s => ({
    heading:        s.heading,
    bodyParagraphs: s.bodyParagraphs,
    code:           s.code,
  })),
  takeaway:        content.takeaway,
}, null, 2)}

Output the same JSON structure with all translatable text in ${langName}. ONLY the JSON, no explanation, no code fence.`

  try {
    const msg = await anthropic.messages.create({
      model:      'claude-haiku-4-5-20251001',
      max_tokens: 3500,
      messages:   [{ role: 'user', content: prompt }],
    })
    const text = msg.content.find(b => b.type === 'text')?.text ?? ''
    // Strip accidental code fences
    const cleaned = text.replace(/^```(?:json)?\s*|\s*```$/g, '').trim()
    const match = cleaned.match(/\{[\s\S]*\}/)
    if (!match) return null
    const parsed = JSON.parse(match[0])

    if (!parsed.sections || !Array.isArray(parsed.sections)) return null

    return {
      metaTitle:       String(parsed.metaTitle ?? content.metaTitle).slice(0, 80),
      metaDescription: String(parsed.metaDescription ?? content.metaDescription).slice(0, 160),
      intro:           String(parsed.intro ?? content.intro),
      sections:        parsed.sections.slice(0, content.sections.length).map((s, i) => ({
        heading:        String(s.heading ?? content.sections[i].heading),
        bodyParagraphs: Array.isArray(s.bodyParagraphs) ? s.bodyParagraphs.map(String) : content.sections[i].bodyParagraphs,
        code:           s.code ?? content.sections[i].code,
      })),
      takeaway:        String(parsed.takeaway ?? content.takeaway),
    }
  } catch {
    return null
  }
}
