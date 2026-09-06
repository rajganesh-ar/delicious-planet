/**
 * The vocabulary the admin panel speaks about orders.
 *
 * Labels and tones live here rather than in each component because a status
 * pill in the list, the same pill in the dashboard queue, and the button that
 * sets it must never disagree — an order shown amber in one place and green in
 * another is worse than no colour at all.
 *
 * Deliberately free of server imports so client cells and server panels can
 * share it.
 */

export type Tone = 'critical' | 'info' | 'neutral' | 'positive' | 'warning'

export interface StatusMeta {
  label: string
  tone: Tone
}

export const ORDER_STATUS_META: Record<string, StatusMeta> = {
  pending: { label: 'Pending', tone: 'warning' },
  processing: { label: 'Processing', tone: 'info' },
  shipped: { label: 'Shipped', tone: 'info' },
  delivered: { label: 'Delivered', tone: 'positive' },
  cancelled: { label: 'Cancelled', tone: 'neutral' },
  refunded: { label: 'Refunded', tone: 'critical' },
}

export const PAYMENT_STATUS_META: Record<string, StatusMeta> = {
  unpaid: { label: 'Unpaid', tone: 'warning' },
  paid: { label: 'Paid', tone: 'positive' },
  failed: { label: 'Failed', tone: 'critical' },
  refunded: { label: 'Refunded', tone: 'critical' },
  invoice: { label: 'Invoiced', tone: 'info' },
}

export const CARRIER_META: Record<string, { label: string; track?: (n: string) => string }> = {
  dhl: {
    label: 'DHL',
    track: (n) => `https://www.dhl.com/en/express/tracking.html?AWB=${encodeURIComponent(n)}`,
  },
  fedex: {
    label: 'FedEx',
    track: (n) => `https://www.fedex.com/fedextrack/?trknbr=${encodeURIComponent(n)}`,
  },
  ups: {
    label: 'UPS',
    track: (n) => `https://www.ups.com/track?tracknum=${encodeURIComponent(n)}`,
  },
  aramex: {
    label: 'Aramex',
    track: (n) => `https://www.aramex.com/track/results?ShipmentNumber=${encodeURIComponent(n)}`,
  },
  'emirates-post': {
    label: 'Emirates Post',
    track: (n) => `https://www.emiratespost.ae/track?trackingNumber=${encodeURIComponent(n)}`,
  },
  'local-courier': { label: 'Local courier' },
  pickup: { label: 'Customer pickup' },
  other: { label: 'Other' },
}

/**
 * Only carriers we have a real tracking URL for get a link. A dead link on an
 * order the customer is chasing costs more than a plain string.
 */
export function trackingUrl(carrier?: string | null, number?: string | null): string | null {
  if (!carrier || !number) return null
  const build = CARRIER_META[carrier]?.track
  return build ? build(number) : null
}

/**
 * The catalogue prices in AED, so that is the default. Orders still carry their
 * own currency because a historic order must render in what was charged.
 */
export function formatMoney(amount: number | null | undefined, currency = 'AED'): string {
  const value = Number(amount)
  if (!Number.isFinite(value)) return '—'
  return new Intl.NumberFormat('en-AE', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(value)
}

/** KPI tiles have no room for six digits and two decimals. */
export function formatMoneyCompact(amount: number | null | undefined, currency = 'AED'): string {
  const value = Number(amount)
  if (!Number.isFinite(value)) return '—'
  if (Math.abs(value) < 10_000) return formatMoney(value, currency)
  return new Intl.NumberFormat('en-AE', {
    style: 'currency',
    currency,
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value)
}

export function formatNumber(value: number | null | undefined): string {
  const n = Number(value)
  return Number.isFinite(n) ? new Intl.NumberFormat('en-AE').format(n) : '—'
}

export function formatDate(iso?: string | null): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(d)
}

export function formatDateTime(iso?: string | null): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d)
}

/**
 * "3 days ago" beats a date when the question is "has this been sitting too
 * long?", which is the only question the order queue is ever asked.
 */
export function timeAgo(iso?: string | null): string {
  if (!iso) return '—'
  const then = new Date(iso).getTime()
  if (Number.isNaN(then)) return '—'
  const seconds = Math.round((Date.now() - then) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.round(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.round(hours / 24)
  if (days < 31) return `${days}d ago`
  return formatDate(iso)
}

/** Days an order has been waiting, used to flag the ones going stale. */
export function ageInDays(iso?: string | null): number {
  if (!iso) return 0
  const then = new Date(iso).getTime()
  if (Number.isNaN(then)) return 0
  return Math.floor((Date.now() - then) / 86_400_000)
}
