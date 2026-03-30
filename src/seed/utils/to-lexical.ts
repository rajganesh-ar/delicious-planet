type LexicalNode = Record<string, unknown>

function buildLexicalRoot(text: string): LexicalNode {
  return {
    root: {
      type: 'root',
      children: [
        {
          type: 'paragraph',
          version: 1,
          children: [
            {
              type: 'text',
              text,
              version: 1,
              detail: 0,
              format: 0,
              mode: 'normal',
              style: '',
            },
          ],
          direction: 'ltr',
          format: '',
          indent: 0,
          textFormat: 0,
        },
      ],
      direction: 'ltr',
      format: '',
      indent: 0,
      version: 1,
    },
  }
}

/**
 * Convert plain text to Payload Lexical richText JSON.
 */
export function textToLexical(text: string): LexicalNode {
  return buildLexicalRoot(text.trim())
}

/**
 * Strip HTML tags from a string and convert to Payload Lexical richText JSON.
 * Handles <p>, <li>, <br>, <ul>, <ol> by converting to newlines.
 */
export function htmlToLexical(html: string): LexicalNode {
  const stripped = html
    .replace(/<\/(p|li|br|div|h[1-6])>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/\u003c/g, '<')
    .replace(/\u003e/g, '>')
    .replace(/\u0026/g, '&')
    .replace(/\n{3,}/g, '\n\n')
    .trim()

  return buildLexicalRoot(stripped)
}

/**
 * Extract the first sentence from an HTML string (≤200 chars), plain text.
 */
export function htmlToShortDescription(html: string): string {
  const stripped = html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/\u003c/g, '<')
    .replace(/\u003e/g, '>')
    .replace(/\u0026/g, '&')
    .replace(/\s+/g, ' ')
    .trim()

  const sentence = stripped.split(/(?<=[.!?])\s/)[0] ?? stripped
  return sentence.length > 200 ? sentence.slice(0, 197) + '...' : sentence
}
