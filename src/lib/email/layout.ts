import { CONTACT } from '../contact'

/**
 * The shared shell every transactional email renders through.
 *
 * Mail clients are not browsers. Gmail strips <style> blocks on some surfaces,
 * Outlook renders through Word's engine (no flexbox, no grid, no CSS variables,
 * unreliable padding on inline elements), and everything must survive being
 * forwarded. So this is tables and inline styles only — none of the storefront's
 * Tailwind classes or styles.css tokens can be reached from here, and the brand
 * hexes below are copied literally rather than referenced.
 *
 * Both halves of the message are built from the same `Block[]`, so the plain
 * text alternative cannot drift from the HTML. Sending both materially helps
 * deliverability, and text is what a watch or a screen reader actually reads.
 */

/* Brand values, from the @theme block in src/app/(frontend)/styles.css. */
const FOREST = '#1B512D'
const OLIVINE = '#ADC178'
const CREAM = '#FAFAFA'
const WHITE = '#FFFFFF'
const OBSIDIAN = '#111111'
const STONE = '#6b6b6b'
const RULE = '#e6e6e6'

/**
 * Merriweather and Lexend are webfonts; mail clients will not load them, so the
 * stacks below name only faces that already exist on the device. Georgia is the
 * closest widely-installed match for the site's serif display face.
 */
const SERIF = "Georgia, 'Times New Roman', Times, serif"
const SANS = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"

/** HTML-escapes a value. Every interpolation below goes through this. */
export function esc(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export interface LineItemRow {
  title: string
  /** Variant size, or any secondary line under the title. */
  meta?: string | null
  quantity: number
  /** Pre-formatted — callers use formatPrice() so currency handling stays in one place. */
  amount: string
}

export interface TotalRow {
  label: string
  value: string
  strong?: boolean
}

export type Block =
  | { type: 'paragraph'; text: string }
  /** Label/value pairs — order meta, customer details. */
  | { type: 'facts'; title?: string; rows: { label: string; value: string }[] }
  | { type: 'items'; title?: string; rows: LineItemRow[]; totals?: TotalRow[] }
  /** Free-form lines, e.g. a postal address or a quoted message. */
  | { type: 'lines'; title?: string; lines: string[] }
  | { type: 'button'; label: string; href: string }
  /** Quiet aside on a tinted panel. */
  | { type: 'note'; text: string }

export interface RenderEmailOptions {
  /** The grey line after the subject in an inbox list. Keep it under ~90 chars. */
  preheader: string
  heading: string
  intro?: string
  blocks?: Block[]
  /** Small print above the address block, e.g. why this email was sent. */
  footerNote?: string
}

const cell = (extra = '') =>
  `font-family:${SANS};font-size:14px;line-height:1.6;color:${OBSIDIAN};${extra}`

function sectionTitle(title?: string): string {
  if (!title) return ''
  return `<p style="margin:0 0 10px;font-family:${SANS};font-size:10px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:${STONE};">${esc(title)}</p>`
}

function renderBlock(block: Block): string {
  switch (block.type) {
    case 'paragraph':
      return `<p style="margin:0 0 16px;${cell()}">${esc(block.text)}</p>`

    case 'facts':
      return `
        ${sectionTitle(block.title)}
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 20px;">
          ${block.rows
            .map(
              (row) => `
          <tr>
            <td style="${cell(`color:${STONE};padding:5px 12px 5px 0;vertical-align:top;`)}">${esc(row.label)}</td>
            <td align="right" style="${cell('padding:5px 0;vertical-align:top;font-weight:600;')}">${esc(row.value)}</td>
          </tr>`,
            )
            .join('')}
        </table>`

    case 'items':
      return `
        ${sectionTitle(block.title)}
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 20px;border-collapse:collapse;">
          ${block.rows
            .map(
              (row) => `
          <tr>
            <td style="${cell(`padding:12px 12px 12px 0;border-bottom:1px solid ${RULE};vertical-align:top;`)}">
              <span style="font-weight:600;">${esc(row.title)}</span>
              ${row.meta ? `<br /><span style="color:${STONE};font-size:13px;">${esc(row.meta)}</span>` : ''}
              <br /><span style="color:${STONE};font-size:13px;">Qty ${esc(row.quantity)}</span>
            </td>
            <td align="right" style="${cell(`padding:12px 0;border-bottom:1px solid ${RULE};vertical-align:top;white-space:nowrap;`)}">${esc(row.amount)}</td>
          </tr>`,
            )
            .join('')}
          ${(block.totals ?? [])
            .map((total) => {
              const pad = total.strong ? '12px' : '6px'
              const emphasis = total.strong
                ? `font-weight:700;border-top:2px solid ${FOREST};`
                : `color:${STONE};`
              return `
          <tr>
            <td style="${cell(`padding:${pad} 12px 6px 0;${emphasis}`)}">${esc(total.label)}</td>
            <td align="right" style="${cell(`padding:${pad} 0 6px;white-space:nowrap;${emphasis}`)}">${esc(total.value)}</td>
          </tr>`
            })
            .join('')}
        </table>`

    case 'lines':
      return `
        ${sectionTitle(block.title)}
        <p style="margin:0 0 20px;${cell()}">${block.lines.map((line) => esc(line)).join('<br />')}</p>`

    case 'button':
      // Padding sits on the <td>, not the <a> — Outlook's Word engine ignores
      // padding on inline elements, which would collapse the button to bare text.
      return `
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:4px 0 20px;">
          <tr>
            <td bgcolor="${FOREST}" style="border-radius:2px;">
              <a href="${esc(block.href)}" style="display:inline-block;padding:13px 26px;font-family:${SANS};font-size:12px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:${CREAM};text-decoration:none;">${esc(block.label)}</a>
            </td>
          </tr>
        </table>`

    case 'note':
      return `
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 20px;">
          <tr>
            <td style="${cell(`background-color:${CREAM};border-left:3px solid ${OLIVINE};padding:12px 14px;color:${STONE};font-size:13px;`)}">${esc(block.text)}</td>
          </tr>
        </table>`
  }
}

function blockToText(block: Block): string {
  switch (block.type) {
    case 'paragraph':
      return block.text
    case 'facts':
      return [block.title?.toUpperCase(), ...block.rows.map((r) => `${r.label}: ${r.value}`)]
        .filter(Boolean)
        .join('\n')
    case 'items':
      return [
        block.title?.toUpperCase(),
        ...block.rows.map(
          (r) => `${r.quantity} x ${r.title}${r.meta ? ` (${r.meta})` : ''} — ${r.amount}`,
        ),
        ...(block.totals ?? []).map((t) => `${t.label}: ${t.value}`),
      ]
        .filter(Boolean)
        .join('\n')
    case 'lines':
      return [block.title?.toUpperCase(), ...block.lines].filter(Boolean).join('\n')
    case 'button':
      return `${block.label}: ${block.href}`
    case 'note':
      return block.text
  }
}

/** Builds the HTML and plain-text halves of one message from the same blocks. */
export function renderEmail({
  preheader,
  heading,
  intro,
  blocks = [],
  footerNote,
}: RenderEmailOptions): { html: string; text: string } {
  const body = blocks.map(renderBlock).join('\n')

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<meta name="x-apple-disable-message-reformatting" />
<title>${esc(heading)}</title>
</head>
<body style="margin:0;padding:0;background-color:${CREAM};">
<!-- Shown in the inbox preview line, never on the page itself. -->
<div style="display:none;max-height:0;overflow:hidden;opacity:0;mso-hide:all;">${esc(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${CREAM};">
  <tr>
    <td align="center" style="padding:24px 12px;">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;">

        <!-- Wordmark. The only logo asset is an SVG, which most mail clients
             refuse to render, so the mark is set as text instead. -->
        <tr>
          <td bgcolor="${FOREST}" align="center" style="padding:22px 24px;border-radius:2px 2px 0 0;">
            <span style="font-family:${SERIF};font-size:19px;letter-spacing:0.18em;text-transform:uppercase;color:${CREAM};">Delicious Planet</span>
          </td>
        </tr>
        <tr><td style="height:3px;background-color:${OLIVINE};line-height:3px;font-size:0;">&nbsp;</td></tr>

        <tr>
          <td bgcolor="${WHITE}" style="padding:32px 28px 28px;">
            <h1 style="margin:0 0 14px;font-family:${SERIF};font-size:25px;line-height:1.25;font-weight:normal;color:${FOREST};">${esc(heading)}</h1>
            ${intro ? `<p style="margin:0 0 22px;${cell(`color:${STONE};font-size:15px;`)}">${esc(intro)}</p>` : ''}
            ${body}
          </td>
        </tr>

        <tr>
          <td style="padding:20px 28px 32px;">
            ${footerNote ? `<p style="margin:0 0 14px;font-family:${SANS};font-size:12px;line-height:1.6;color:${STONE};">${esc(footerNote)}</p>` : ''}
            <p style="margin:0 0 6px;font-family:${SANS};font-size:12px;line-height:1.6;color:${STONE};">
              <span style="color:${OBSIDIAN};font-weight:600;">Delicious Planet</span><br />
              ${CONTACT.address.lines.map((line) => esc(line)).join('<br />')}
            </p>
            <p style="margin:0;font-family:${SANS};font-size:12px;line-height:1.6;color:${STONE};">
              <a href="mailto:${esc(CONTACT.email)}" style="color:${FOREST};text-decoration:none;">${esc(CONTACT.email)}</a>
              &nbsp;&middot;&nbsp; ${esc(CONTACT.phoneLabel)} &nbsp;&middot;&nbsp; ${esc(CONTACT.hours)}
            </p>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
</body>
</html>`

  const text = [
    'DELICIOUS PLANET',
    '',
    heading,
    intro,
    '',
    // Joined here rather than spread, so consecutive blocks keep a blank line
    // between them instead of running into one another.
    blocks.map(blockToText).join('\n\n'),
    '',
    '—',
    footerNote,
    CONTACT.address.lines.join(', '),
    `${CONTACT.email} · ${CONTACT.phoneLabel} · ${CONTACT.hours}`,
  ]
    .filter((part) => part !== undefined)
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()

  return { html, text }
}
