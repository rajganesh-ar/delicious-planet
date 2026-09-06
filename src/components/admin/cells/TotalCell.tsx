'use client'

import React from 'react'
import { formatMoney } from '../shared'

/**
 * The order total, in the currency that order was charged in.
 *
 * The `totals` group cell would otherwise render `[object Object]`. Currency
 * comes off the row rather than a constant: a historic order has to show what
 * the customer actually paid, not what the same basket would cost today.
 */
export default function TotalCell({
  cellData,
  rowData,
}: {
  cellData?: { total?: number | null }
  rowData?: { currency?: string }
}) {
  const total = cellData?.total
  if (total == null) return <span className="dp-table__muted">—</span>
  return <span className="dp-cell-money">{formatMoney(total, rowData?.currency ?? 'AED')}</span>
}
