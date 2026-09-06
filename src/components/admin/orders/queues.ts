import type { Where } from 'payload'

/**
 * The four questions anyone opening the orders list is actually asking.
 *
 * Defined once and shared by the dashboard queue panel and the tabs above the
 * orders list, so a count on the home screen and the rows you land on after
 * clicking it can never disagree. Each queue owns both its `where` (used for the
 * count) and the URL that reproduces it (used for the link).
 */

export type QueueTone = 'attention' | 'neutral' | 'urgent'

export interface OrderQueue {
  key: string
  label: string
  hint: string
  tone: QueueTone
  where: Where | null
}

export const ORDER_QUEUES: OrderQueue[] = [
  {
    key: 'fulfil',
    label: 'To fulfil',
    hint: 'Paid, not yet shipped',
    tone: 'attention',
    where: {
      and: [
        { paymentStatus: { in: ['paid', 'invoice'] } },
        { status: { in: ['pending', 'processing'] } },
      ],
    },
  },
  {
    key: 'unpaid',
    label: 'Awaiting payment',
    hint: 'Checkout started, money not taken',
    tone: 'neutral',
    where: {
      and: [{ paymentStatus: { equals: 'unpaid' } }, { status: { not_in: ['cancelled'] } }],
    },
  },
  {
    key: 'transit',
    label: 'In transit',
    hint: 'Shipped, not yet delivered',
    tone: 'neutral',
    where: { and: [{ status: { equals: 'shipped' } }] },
  },
  {
    key: 'failed',
    label: 'Needs attention',
    hint: 'Payment failed or refunded',
    tone: 'urgent',
    where: { and: [{ paymentStatus: { in: ['failed', 'refunded'] } }] },
  },
]

type Condition = Record<string, Record<string, unknown>>

/**
 * Serialise a `where` into the query string Payload's list view parses.
 *
 * Hand-rolled rather than pulled from `qs` because the shapes here are fixed and
 * few: an `and` array of single-operator conditions. Payload hoists a bare
 * `and` into its internal `or`/`and` form on read, so the filter builder shows
 * these as real, editable conditions rather than as an opaque URL.
 */
export function whereToQuery(where: Where | null): string {
  if (!where) return ''
  const conditions = (where.and ?? []) as Condition[]
  const parts: string[] = []

  conditions.forEach((condition, i) => {
    Object.entries(condition).forEach(([field, operators]) => {
      Object.entries(operators).forEach(([operator, value]) => {
        const base = `where[and][${i}][${field}][${operator}]`
        if (Array.isArray(value)) {
          value.forEach((entry, j) => {
            parts.push(`${base}[${j}]=${encodeURIComponent(String(entry))}`)
          })
        } else {
          parts.push(`${base}=${encodeURIComponent(String(value))}`)
        }
      })
    })
  })

  return parts.join('&')
}

/** The admin URL that opens the orders list already filtered to this queue. */
export function queueHref(adminRoute: string, queue: OrderQueue): string {
  const base = `${adminRoute}/collections/orders`
  const query = whereToQuery(queue.where)
  // `queue` is carried alongside the filter purely so the tabs can tell which
  // one is active without having to parse and compare the encoded `where`.
  return query ? `${base}?queue=${queue.key}&${query}` : base
}
