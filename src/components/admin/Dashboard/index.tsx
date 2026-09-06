import React from 'react'
import type { Payload, TypedUser } from 'payload'
import { Badge } from '../Badge'
import {
  ORDER_STATUS_META,
  PAYMENT_STATUS_META,
  formatMoney,
  formatMoneyCompact,
  formatNumber,
  timeAgo,
} from '../shared'
import { RevenueChart } from './RevenueChart'
import {
  RANGES,
  getDashboardStats,
  parseRange,
  type Delta,
  type Queue,
  type RecentOrder,
} from './stats'
import '../admin.css'

/**
 * The trading dashboard, rendered above Payload's own collection cards.
 *
 * It is built around one question — *what needs doing right now* — with the
 * trend behind it as context, rather than as a wall of vanity metrics. Hence
 * the order of the page: money and volume at the top, the work queues next to
 * the chart, and the catalogue's own health last, because a product with no
 * price is a problem you fix today but not before you have shipped what is paid
 * for.
 *
 * A fulfilment user sees a cut-down version: the queues and the latest orders,
 * with no revenue, no averages and no catalogue. Turnover is not their job, and
 * the counts it is built from come from collections they cannot read anyway.
 *
 * Rendered entirely on the server. The range switch is three links rather than
 * a state hook, so the whole panel stays static HTML and the browser gets no
 * JavaScript for it.
 */

function DeltaLabel({ delta, range }: { delta: Delta; range: number }) {
  const sign = delta.percent !== null && delta.percent > 0 ? '+' : ''
  return (
    <div className="dp-kpi__foot">
      <span className={`dp-delta dp-delta--${delta.direction}`}>
        {delta.percent === null
          ? delta.direction === 'up'
            ? 'new'
            : '—'
          : `${sign}${delta.percent.toFixed(0)}%`}
      </span>
      <span>vs previous {range} days</span>
    </div>
  )
}

function Kpi({
  label,
  value,
  delta,
  range,
}: {
  label: string
  value: string
  delta: Delta
  range: number
}) {
  return (
    <div className="dp-kpi">
      <div className="dp-kpi__label">{label}</div>
      <div className="dp-kpi__value">{value}</div>
      <DeltaLabel delta={delta} range={range} />
    </div>
  )
}

function QueuePanel({ queues }: { queues: Queue[] }) {
  return (
    <div className="dp-panel">
      <div className="dp-panel__head">
        <h2 className="dp-panel__title">Needs doing</h2>
      </div>
      <div className="dp-panel__body dp-panel__body--flush">
        <div className="dp-queue">
          {queues.map((queue) => {
            const emphasis =
              queue.count === 0
                ? 'zero'
                : queue.tone === 'urgent'
                  ? 'urgent'
                  : queue.tone === 'attention'
                    ? 'attention'
                    : ''
            return (
              <a key={queue.key} className="dp-queue__item" href={queue.href}>
                <span className="dp-queue__label">
                  {queue.label}
                  <span className="dp-queue__hint">{queue.hint}</span>
                </span>
                <span
                  className={`dp-queue__count${emphasis ? ` dp-queue__count--${emphasis}` : ''}`}
                >
                  {queue.count}
                </span>
              </a>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function RecentOrders({
  recent,
  adminRoute,
  showTotals,
}: {
  recent: RecentOrder[]
  adminRoute: string
  showTotals: boolean
}) {
  return (
    <div className="dp-panel">
      <div className="dp-panel__head">
        <h2 className="dp-panel__title">Latest orders</h2>
        <a className="dp-panel__action" href={`${adminRoute}/collections/orders`}>
          All orders
        </a>
      </div>
      <div className="dp-panel__body dp-panel__body--flush">
        {recent.length === 0 ? (
          <div className="dp-empty">No orders yet.</div>
        ) : (
          <table className="dp-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Payment</th>
                <th>Status</th>
                {showTotals ? <th className="dp-table__num">Total</th> : null}
              </tr>
            </thead>
            <tbody>
              {recent.map((order) => {
                const status = ORDER_STATUS_META[order.status] ?? {
                  label: order.status,
                  tone: 'neutral' as const,
                }
                const payment = PAYMENT_STATUS_META[order.paymentStatus] ?? {
                  label: order.paymentStatus,
                  tone: 'neutral' as const,
                }
                return (
                  <tr key={order.id}>
                    <td>
                      <a href={`${adminRoute}/collections/orders/${order.id}`}>
                        {order.orderNumber}
                      </a>
                      <div className="dp-table__muted">{timeAgo(order.createdAt)}</div>
                    </td>
                    <td>
                      {order.customer}
                      {order.type === 'b2b' ? <div className="dp-table__muted">B2B</div> : null}
                    </td>
                    <td>
                      <Badge tone={payment.tone}>{payment.label}</Badge>
                    </td>
                    <td>
                      <Badge tone={status.tone}>{status.label}</Badge>
                    </td>
                    {showTotals ? (
                      <td className="dp-table__num">
                        {formatMoney(order.total, order.currency)}
                      </td>
                    ) : null}
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export default async function Dashboard({
  payload,
  searchParams,
  user,
}: {
  payload: Payload
  searchParams?: Record<string, string | string[] | undefined>
  user?: TypedUser
}) {
  const adminRoute = payload.config.routes.admin
  const isAdmin = Boolean((user as { roles?: string[] } | undefined)?.roles?.includes('admin'))
  const range = parseRange(searchParams?.range)
  const stats = await getDashboardStats({
    payload,
    range,
    scope: isAdmin ? 'full' : 'orders',
    user,
  })
  const greeting = user?.name?.trim()?.split(' ')[0] || 'there'

  if (stats.scope === 'orders') {
    const outstanding = stats.queues
      .filter((queue) => queue.key === 'fulfil' || queue.key === 'transit')
      .reduce((total, queue) => total + queue.count, 0)

    return (
      <section className="dp-dash">
        <header className="dp-dash__masthead">
          <div>
            <h1 className="dp-dash__greeting">Good day, {greeting}</h1>
            <p className="dp-dash__sub">
              {outstanding === 0
                ? 'Nothing waiting to go out. Nice.'
                : `${outstanding} ${outstanding === 1 ? 'order' : 'orders'} in hand`}
            </p>
          </div>
        </header>

        <div className="dp-dash__grid">
          <div className="dp-dash__col">
            <RecentOrders recent={stats.recent} adminRoute={adminRoute} showTotals={false} />
          </div>
          <div className="dp-dash__col">
            <QueuePanel queues={stats.queues} />
          </div>
        </div>
      </section>
    )
  }

  const currency = stats.currency
  const topUnits = Math.max(1, ...stats.topProducts.map((product) => product.units))
  const catalogueIssues = stats.catalogue.outOfStock + stats.catalogue.unpriced

  return (
    <section className="dp-dash">
      <header className="dp-dash__masthead">
        <div>
          <h1 className="dp-dash__greeting">Good day, {greeting}</h1>
          <p className="dp-dash__sub">Delicious Planet · trading over the last {range} days</p>
        </div>
        <nav className="dp-range" aria-label="Reporting period">
          {RANGES.map((option) => (
            <a
              key={option}
              className="dp-range__option"
              href={`${adminRoute}?range=${option}`}
              aria-current={option === range}
            >
              {option}d
            </a>
          ))}
        </nav>
      </header>

      <div className="dp-kpis">
        <Kpi
          label="Revenue"
          value={formatMoneyCompact(stats.revenue.current, currency)}
          delta={stats.revenue.delta}
          range={range}
        />
        <Kpi
          label="Paid orders"
          value={formatNumber(stats.orders.current)}
          delta={stats.orders.delta}
          range={range}
        />
        <Kpi
          label="Average order"
          value={formatMoneyCompact(stats.averageOrder.current, currency)}
          delta={stats.averageOrder.delta}
          range={range}
        />
        <Kpi
          label="New accounts"
          value={formatNumber(stats.newCustomers.current)}
          delta={stats.newCustomers.delta}
          range={range}
        />
      </div>

      <div className="dp-dash__grid">
        <div className="dp-dash__col">
          <div className="dp-panel">
            <div className="dp-panel__head">
              <h2 className="dp-panel__title">
                Revenue by {stats.bucketUnit === 'week' ? 'week' : 'day'}
              </h2>
              <span className="dp-table__muted">
                {formatMoney(stats.revenue.current, currency)} total
              </span>
            </div>
            <div className="dp-panel__body">
              <RevenueChart buckets={stats.buckets} currency={currency} unit={stats.bucketUnit} />
            </div>
          </div>

          <RecentOrders recent={stats.recent} adminRoute={adminRoute} showTotals />
        </div>

        <div className="dp-dash__col">
          <QueuePanel queues={stats.queues} />

          <div className="dp-panel">
            <div className="dp-panel__head">
              <h2 className="dp-panel__title">Best sellers</h2>
              <span className="dp-table__muted">{range}d, by units</span>
            </div>
            <div className="dp-panel__body dp-panel__body--flush">
              {stats.topProducts.length === 0 ? (
                <div className="dp-empty">Nothing sold in this window.</div>
              ) : (
                <table className="dp-table">
                  <tbody>
                    {stats.topProducts.map((product) => (
                      <tr key={product.key}>
                        <td>
                          <div>{product.title}</div>
                          <div className="dp-table__muted">
                            {product.size ? `${product.size} · ` : ''}
                            {formatMoney(product.revenue, currency)}
                          </div>
                          <span className="dp-rankbar">
                            <span
                              className="dp-rankbar__fill"
                              style={{ width: `${(product.units / topUnits) * 100}%` }}
                            />
                          </span>
                        </td>
                        <td className="dp-table__num">{product.units}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          <div className="dp-panel">
            <div className="dp-panel__head">
              <h2 className="dp-panel__title">Catalogue &amp; inbox</h2>
              {catalogueIssues > 0 ? (
                <Badge tone="warning">{catalogueIssues} to fix</Badge>
              ) : (
                <Badge tone="positive">All clear</Badge>
              )}
            </div>
            <div className="dp-panel__body dp-panel__body--flush">
              <div className="dp-queue">
                <a
                  className="dp-queue__item"
                  href={`${adminRoute}/collections/products?where[and][0][_status][equals]=published`}
                >
                  <span className="dp-queue__label">
                    Live products
                    <span className="dp-queue__hint">Published and shoppable</span>
                  </span>
                  <span className="dp-queue__count">{stats.catalogue.published}</span>
                </a>
                <a
                  className="dp-queue__item"
                  href={`${adminRoute}/collections/products?where[and][0][_status][equals]=draft`}
                >
                  <span className="dp-queue__label">
                    Drafts
                    <span className="dp-queue__hint">Not visible on the storefront</span>
                  </span>
                  <span className="dp-queue__count dp-queue__count--zero">
                    {stats.catalogue.drafts}
                  </span>
                </a>
                <a
                  className="dp-queue__item"
                  href={`${adminRoute}/collections/products?where[and][0][_status][equals]=published&where[and][1][inStock][equals]=false`}
                >
                  <span className="dp-queue__label">
                    Out of stock
                    <span className="dp-queue__hint">Live but unbuyable</span>
                  </span>
                  <span
                    className={`dp-queue__count${stats.catalogue.outOfStock > 0 ? ' dp-queue__count--attention' : ' dp-queue__count--zero'}`}
                  >
                    {stats.catalogue.outOfStock}
                  </span>
                </a>
                <a
                  className="dp-queue__item"
                  href={`${adminRoute}/collections/products?where[and][0][_status][equals]=published&where[and][1][basePrice][exists]=false`}
                >
                  <span className="dp-queue__label">
                    Missing a price
                    <span className="dp-queue__hint">Published with no variant priced</span>
                  </span>
                  <span
                    className={`dp-queue__count${stats.catalogue.unpriced > 0 ? ' dp-queue__count--urgent' : ' dp-queue__count--zero'}`}
                  >
                    {stats.catalogue.unpriced}
                  </span>
                </a>
                <a
                  className="dp-queue__item"
                  href={`${adminRoute}/collections/b2b-inquiries?where[and][0][status][equals]=new`}
                >
                  <span className="dp-queue__label">
                    New B2B enquiries
                    <span className="dp-queue__hint">Unanswered wholesale requests</span>
                  </span>
                  <span
                    className={`dp-queue__count${stats.inbox.newInquiries > 0 ? ' dp-queue__count--attention' : ' dp-queue__count--zero'}`}
                  >
                    {stats.inbox.newInquiries}
                  </span>
                </a>
                <a
                  className="dp-queue__item"
                  href={`${adminRoute}/collections/newsletter-subscribers`}
                >
                  <span className="dp-queue__label">
                    Newsletter list
                    <span className="dp-queue__hint">Total subscribers</span>
                  </span>
                  <span className="dp-queue__count">{stats.inbox.subscribers}</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
