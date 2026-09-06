import React from 'react'
import type { Payload, TypedUser } from 'payload'
import { ORDER_QUEUES, queueHref } from './queues'
import '../admin.css'

/**
 * Work queues pinned above the orders list.
 *
 * The default list opens on "every order ever placed", which is the one view
 * nobody needs first thing in the morning. These four tabs are the real
 * starting points, and each carries its own count so the size of the day's work
 * is visible before a single row is read.
 *
 * A server component: the counts are four cheap indexed queries and shipping
 * them as rendered HTML beats shipping a fetch and a spinner.
 */
export default async function OrderQueues({
  payload,
  searchParams,
  user,
}: {
  payload: Payload
  searchParams?: Record<string, string | string[] | undefined>
  user?: TypedUser
}) {
  const adminRoute = payload.config.routes.admin

  const counts = await Promise.all(
    ORDER_QUEUES.map(async (queue) => {
      if (!queue.where) return 0
      const { totalDocs } = await payload.count({
        collection: 'orders',
        where: queue.where,
        overrideAccess: false,
        user,
      })
      return totalDocs
    }),
  )

  const active = typeof searchParams?.queue === 'string' ? searchParams.queue : null

  return (
    <nav className="dp-queues" aria-label="Order queues">
      {ORDER_QUEUES.map((queue, i) => (
        <a
          key={queue.key}
          className="dp-queues__tab"
          href={queueHref(adminRoute, queue)}
          aria-current={active === queue.key}
          title={queue.hint}
        >
          {queue.label}
          <span className="dp-queues__n">{counts[i]}</span>
        </a>
      ))}
      <a
        className="dp-queues__tab"
        href={`${adminRoute}/collections/orders`}
        aria-current={active === null}
      >
        All orders
      </a>
    </nav>
  )
}
