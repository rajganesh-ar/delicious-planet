import type { Payload, TypedUser } from 'payload'
import type { Order } from '@/payload-types'
import { ORDER_QUEUES, queueHref } from '../orders/queues'

/**
 * Everything the dashboard shows, gathered in one place.
 *
 * Kept out of the component so the definitions are auditable in isolation —
 * "revenue" in particular is a judgement call, and a number on a home screen
 * that nobody can trace the definition of is worse than no number.
 *
 * There are two shapes, because there are two audiences. An admin gets the
 * trading picture; a fulfilment user gets the work queues and nothing about
 * money. That is enforced here rather than by hiding panels in the component:
 * several of the counts below are on collections a fulfilment user has no read
 * access to at all, so asking for them would fail rather than merely leak.
 */

/** Windows offered by the range switch. 90 days is bucketed weekly; see below. */
export const RANGES = [7, 30, 90] as const
export type Range = (typeof RANGES)[number]

export function parseRange(raw: string | string[] | undefined): Range {
  const value = Number(Array.isArray(raw) ? raw[0] : raw)
  return (RANGES as readonly number[]).includes(value) ? (value as Range) : 30
}

/**
 * Money actually taken.
 *
 * `paid` and `invoice` both count — a B2B order on invoice terms is revenue the
 * business has earned, and leaving it out would make the B2B side of the shop
 * look like it does nothing. `failed`, `unpaid` and `refunded` do not count, and
 * neither does a cancelled order that happened to be paid before it was pulled.
 */
const isRevenue = (order: Pick<Order, 'paymentStatus' | 'status'>): boolean =>
  (order.paymentStatus === 'paid' || order.paymentStatus === 'invoice') &&
  order.status !== 'cancelled'

export interface Bucket {
  label: string
  value: number
}

export interface Delta {
  /** Percent change against the previous window of the same length. */
  percent: number | null
  direction: 'down' | 'flat' | 'up'
}

export interface TopProduct {
  key: string
  title: string
  size: string | null
  units: number
  revenue: number
}

export type Queue = {
  key: string
  label: string
  hint: string
  tone: string
  count: number
  href: string
}

/**
 * A row in the "latest orders" table, already resolved.
 *
 * Flattened rather than passing the `Order` through, because the customer's name
 * cannot come from the relationship: a fulfilment user has no read access to
 * `users`, so at their access level `order.user` never populates. Resolving it
 * here — deliberately, with access overridden, for the single purpose of showing
 * who an order belongs to — keeps the role locked out of the customer list while
 * still letting them see whose parcel they are packing.
 */
export interface RecentOrder {
  id: number
  orderNumber: string
  createdAt: string
  status: string
  paymentStatus: string
  type: string | null
  total: number | null
  currency: string
  customer: string
}

/** What a fulfilment user gets: the work, and nothing about the money. */
export interface QueueStats {
  scope: 'orders'
  queues: Queue[]
  recent: RecentOrder[]
}

export interface FullStats {
  scope: 'full'
  range: Range
  currency: string
  revenue: { current: number; delta: Delta }
  orders: { current: number; delta: Delta }
  averageOrder: { current: number; delta: Delta }
  newCustomers: { current: number; delta: Delta }
  buckets: Bucket[]
  bucketUnit: 'day' | 'week'
  queues: Queue[]
  recent: RecentOrder[]
  topProducts: TopProduct[]
  catalogue: {
    published: number
    drafts: number
    outOfStock: number
    unpriced: number
  }
  inbox: { newInquiries: number; subscribers: number }
}

export type DashboardStats = FullStats | QueueStats

function delta(current: number, previous: number): Delta {
  // A jump from zero has no meaningful percentage — "+∞%" on the first sale of
  // the month is noise, so it reads as flat and the raw numbers speak.
  if (previous === 0) return { percent: null, direction: current > 0 ? 'up' : 'flat' }
  const percent = ((current - previous) / previous) * 100
  if (Math.abs(percent) < 0.5) return { percent: 0, direction: 'flat' }
  return { percent, direction: percent > 0 ? 'up' : 'down' }
}

/**
 * Bucket revenue for the chart.
 *
 * Ninety daily bars in a panel this wide are one pixel each and say nothing, so
 * a quarter is shown as thirteen weeks instead.
 */
function bucketise(
  orders: Order[],
  days: number,
  since: Date,
): { buckets: Bucket[]; unit: 'day' | 'week' } {
  const unit: 'day' | 'week' = days > 31 ? 'week' : 'day'
  const size = unit === 'week' ? 7 : 1
  const count = Math.ceil(days / size)
  const buckets: Bucket[] = Array.from({ length: count }, (_, i) => {
    const start = new Date(since.getTime() + i * size * 86_400_000)
    return {
      label: start.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
      value: 0,
    }
  })

  for (const order of orders) {
    if (!isRevenue(order)) continue
    const at = new Date(order.createdAt).getTime()
    const index = Math.floor((at - since.getTime()) / (size * 86_400_000))
    if (index >= 0 && index < buckets.length) {
      buckets[index]!.value += Number(order.totals?.total) || 0
    }
  }

  return { buckets, unit }
}

function rollUpProducts(orders: Order[]): TopProduct[] {
  const totals = new Map<string, TopProduct>()

  for (const order of orders) {
    if (!isRevenue(order)) continue
    for (const item of order.items ?? []) {
      // The variant SKU is the durable identifier the collection is built
      // around; the title is only a fallback for pre-variant history.
      const key = item.variantSku || item.titleSnapshot || 'unknown'
      const existing = totals.get(key) ?? {
        key,
        title: item.titleSnapshot || key,
        size: item.sizeSnapshot ?? null,
        units: 0,
        revenue: 0,
      }
      existing.units += Number(item.quantity) || 0
      existing.revenue += (Number(item.unitAmount) || 0) * (Number(item.quantity) || 0)
      totals.set(key, existing)
    }
  }

  return [...totals.values()].sort((a, b) => b.units - a.units).slice(0, 5)
}

/** Turns raw orders into table rows, resolving customer names in one query. */
async function toRecentRows(payload: Payload, orders: Order[]): Promise<RecentOrder[]> {
  const ids = Array.from(
    new Set(
      orders
        .map((order) => (typeof order.user === 'number' ? order.user : order.user?.id))
        .filter((id): id is number => typeof id === 'number'),
    ),
  )

  const names = new Map<number, string>()
  if (ids.length > 0) {
    const { docs } = await payload.find({
      collection: 'users',
      where: { id: { in: ids } },
      limit: ids.length,
      depth: 0,
      // See RecentOrder: a fulfilment user cannot read `users`, and this narrow
      // lookup is the whole of what they are allowed to learn from it.
      overrideAccess: true,
      select: { name: true, email: true },
    })
    docs.forEach((user) => names.set(user.id, user.name?.trim() || user.email))
  }

  return orders.map((order) => {
    const id = typeof order.user === 'number' ? order.user : order.user?.id
    return {
      id: order.id,
      orderNumber: order.orderNumber,
      createdAt: order.createdAt,
      status: order.status,
      paymentStatus: order.paymentStatus,
      type: order.type ?? null,
      total: order.totals?.total ?? null,
      currency: order.currency,
      customer:
        (typeof id === 'number' ? names.get(id) : null) ?? order.guestEmail?.trim() ?? 'Guest',
    }
  })
}

async function getQueues(
  payload: Payload,
  access: { overrideAccess: false; user?: TypedUser },
): Promise<Queue[]> {
  const adminRoute = payload.config.routes.admin
  const counts = await Promise.all(
    ORDER_QUEUES.map(async (queue) =>
      queue.where
        ? (await payload.count({ collection: 'orders', where: queue.where, ...access })).totalDocs
        : 0,
    ),
  )
  return ORDER_QUEUES.map((queue, i) => ({
    key: queue.key,
    label: queue.label,
    hint: queue.hint,
    tone: queue.tone,
    count: counts[i] ?? 0,
    href: queueHref(adminRoute, queue),
  }))
}

export async function getDashboardStats({
  payload,
  range,
  scope,
  user,
}: {
  payload: Payload
  range: Range
  scope: 'full' | 'orders'
  user?: TypedUser
}): Promise<DashboardStats> {
  const access = { overrideAccess: false as const, user }

  if (scope === 'orders') {
    const [queues, recent] = await Promise.all([
      getQueues(payload, access),
      payload.find({ collection: 'orders', limit: 8, depth: 0, sort: '-createdAt', ...access }),
    ])
    return { scope: 'orders', queues, recent: await toRecentRows(payload, recent.docs) }
  }

  const now = new Date()
  const since = new Date(now.getTime() - range * 86_400_000)
  const previousSince = new Date(now.getTime() - range * 2 * 86_400_000)

  const [window, recent, queues, catalogue, inbox, customers] = await Promise.all([
    // Two windows in one query: the current period and the one before it, so
    // every delta comes from the same read rather than from six more.
    payload.find({
      collection: 'orders',
      where: { createdAt: { greater_than_equal: previousSince.toISOString() } },
      pagination: false,
      depth: 0,
      sort: '-createdAt',
      ...access,
    }),
    payload.find({ collection: 'orders', limit: 8, depth: 0, sort: '-createdAt', ...access }),
    getQueues(payload, access),
    Promise.all([
      payload.count({
        collection: 'products',
        where: { _status: { equals: 'published' } },
        ...access,
      }),
      payload.count({ collection: 'products', where: { _status: { equals: 'draft' } }, ...access }),
      payload.count({
        collection: 'products',
        where: { and: [{ _status: { equals: 'published' } }, { inStock: { equals: false } }] },
        ...access,
      }),
      payload.count({
        collection: 'products',
        where: { and: [{ _status: { equals: 'published' } }, { basePrice: { exists: false } }] },
        ...access,
      }),
    ]),
    Promise.all([
      payload.count({
        collection: 'b2b-inquiries',
        where: { status: { equals: 'new' } },
        ...access,
      }),
      payload.count({ collection: 'newsletter-subscribers', ...access }),
    ]),
    Promise.all([
      payload.count({
        collection: 'users',
        where: { createdAt: { greater_than_equal: since.toISOString() } },
        ...access,
      }),
      payload.count({
        collection: 'users',
        where: {
          and: [
            { createdAt: { greater_than_equal: previousSince.toISOString() } },
            { createdAt: { less_than: since.toISOString() } },
          ],
        },
        ...access,
      }),
    ]),
  ])

  const inWindow = (order: Order, from: Date, to: Date) => {
    const at = new Date(order.createdAt).getTime()
    return at >= from.getTime() && at < to.getTime()
  }

  const current = window.docs.filter((order) => inWindow(order, since, now))
  const previous = window.docs.filter((order) => inWindow(order, previousSince, since))

  const sum = (orders: Order[]) =>
    orders.filter(isRevenue).reduce((total, order) => total + (Number(order.totals?.total) || 0), 0)

  const currentRevenue = sum(current)
  const previousRevenue = sum(previous)
  const currentPaid = current.filter(isRevenue).length
  const previousPaid = previous.filter(isRevenue).length
  const currentAov = currentPaid > 0 ? currentRevenue / currentPaid : 0
  const previousAov = previousPaid > 0 ? previousRevenue / previousPaid : 0

  const { buckets, unit } = bucketise(current, range, since)

  // Orders are priced in AED, so the first order's currency is the shop's — but
  // read it rather than assume it, in case a currency is ever added.
  const currency = current[0]?.currency ?? recent.docs[0]?.currency ?? 'AED'

  return {
    scope: 'full',
    range,
    currency,
    revenue: { current: currentRevenue, delta: delta(currentRevenue, previousRevenue) },
    orders: { current: currentPaid, delta: delta(currentPaid, previousPaid) },
    averageOrder: { current: currentAov, delta: delta(currentAov, previousAov) },
    newCustomers: {
      current: customers[0].totalDocs,
      delta: delta(customers[0].totalDocs, customers[1].totalDocs),
    },
    buckets,
    bucketUnit: unit,
    queues,
    recent: await toRecentRows(payload, recent.docs),
    topProducts: rollUpProducts(current),
    catalogue: {
      published: catalogue[0].totalDocs,
      drafts: catalogue[1].totalDocs,
      outOfStock: catalogue[2].totalDocs,
      unpriced: catalogue[3].totalDocs,
    },
    inbox: {
      newInquiries: inbox[0].totalDocs,
      subscribers: inbox[1].totalDocs,
    },
  }
}
