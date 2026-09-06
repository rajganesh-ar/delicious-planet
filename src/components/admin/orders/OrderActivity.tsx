import React from 'react'
import type { Payload } from 'payload'
import { formatDateTime, timeAgo } from '../shared'
import '../admin.css'

/**
 * The order's audit trail, newest first.
 *
 * Rendered from the hidden `timeline` array rather than shown as an editable
 * array field, because an audit trail you can retype is not an audit trail. The
 * rows are written by the beforeChange hook on every status, payment and
 * tracking change.
 *
 * An entry with no author was written by a machine — in practice the Stripe
 * webhook, which has no user attached. Saying so plainly is more useful than
 * leaving the column blank.
 */

interface TimelineRow {
  event?: string | null
  note?: string | null
  at?: string | null
  by?: number | { id?: number; email?: string | null; name?: string | null } | null
}

export default async function OrderActivity({
  data,
  payload,
}: {
  data?: { timeline?: TimelineRow[] | null }
  payload: Payload
}) {
  const rows = Array.isArray(data?.timeline) ? data.timeline : []

  if (rows.length === 0) {
    return (
      <div className="dp-panel">
        <div className="dp-panel__body dp-empty">
          Nothing recorded yet. The next status or payment change will appear here.
        </div>
      </div>
    )
  }

  // `by` comes back as a bare id at the depth the edit view builds form state
  // with, so the names are resolved in one query rather than one per row.
  const ids = Array.from(
    new Set(
      rows
        .map((row) => (typeof row.by === 'number' ? row.by : row.by?.id))
        .filter((id): id is number => typeof id === 'number'),
    ),
  )

  const names = new Map<number, string>()
  rows.forEach((row) => {
    if (typeof row.by === 'object' && row.by?.id) {
      const label = row.by.name?.trim() || row.by.email?.trim()
      if (label) names.set(row.by.id, label)
    }
  })

  const unresolved = ids.filter((id) => !names.has(id))
  if (unresolved.length > 0) {
    const { docs } = await payload.find({
      collection: 'users',
      where: { id: { in: unresolved } },
      limit: unresolved.length,
      depth: 0,
      overrideAccess: true,
    })
    docs.forEach((user) => {
      names.set(user.id, user.name?.trim() || user.email)
    })
  }

  return (
    <div className="dp-panel">
      <div className="dp-panel__head">
        <h3 className="dp-panel__title">Activity</h3>
        <span className="dp-table__muted">{rows.length} recorded</span>
      </div>
      <div className="dp-panel__body">
        <ol className="dp-timeline">
          {rows.map((row, i) => {
            const id = typeof row.by === 'number' ? row.by : row.by?.id
            const author = typeof id === 'number' ? (names.get(id) ?? `User ${id}`) : 'System'
            return (
              <li
                key={`${row.at ?? i}-${i}`}
                className={`dp-timeline__item${i === 0 ? ' dp-timeline__item--latest' : ''}`}
              >
                <div className="dp-timeline__event">{row.event ?? 'Changed'}</div>
                <div className="dp-timeline__meta">
                  {row.note ? `${row.note} · ` : ''}
                  {author} · {timeAgo(row.at)} ({formatDateTime(row.at)})
                </div>
              </li>
            )
          })}
        </ol>
      </div>
    </div>
  )
}
