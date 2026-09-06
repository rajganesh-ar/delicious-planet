'use client'

import React from 'react'

/**
 * Who placed the order.
 *
 * There is no single field to point a column at: a signed-in shopper is a
 * `user` relationship, a guest is only a `guestEmail`. This reads whichever one
 * the row has, so the list never shows a blank "customer" for half its rows.
 *
 * `user` arrives populated or as a bare id depending on the list's depth, so
 * both shapes are handled.
 */
type UserRef = number | { email?: string | null; name?: string | null } | null

export default function CustomerCell({
  rowData,
}: {
  rowData?: { user?: UserRef; guestEmail?: string | null }
}) {
  const user = rowData?.user
  const account = typeof user === 'object' && user !== null ? user : null

  const name = account?.name?.trim() || null
  const email = account?.email?.trim() || rowData?.guestEmail?.trim() || null

  if (!name && !email) {
    return <span className="dp-table__muted">Guest</span>
  }

  return (
    <span className="dp-cell-customer">
      <span className="dp-cell-customer__name">{name ?? email}</span>
      {name && email ? <span className="dp-cell-customer__email">{email}</span> : null}
      {!account && email ? <span className="dp-cell-customer__email">Guest checkout</span> : null}
    </span>
  )
}
