'use client'

import React from 'react'

/**
 * How much there is to pick: total units, and how many distinct lines.
 *
 * A single "3" is ambiguous — three of one thing packs very differently from
 * one each of three. Both numbers are cheap to show and the packer needs both.
 */
export default function ItemCountCell({
  rowData,
}: {
  rowData?: { items?: { quantity?: number | null }[] | null }
}) {
  const items = rowData?.items
  if (!Array.isArray(items) || items.length === 0) {
    return <span className="dp-table__muted">—</span>
  }

  const units = items.reduce((sum, item) => sum + (Number(item?.quantity) || 0), 0)
  const lines = items.length

  return (
    <span className="dp-cell-count">
      {units} {units === 1 ? 'unit' : 'units'}
      {lines !== units ? ` · ${lines} ${lines === 1 ? 'line' : 'lines'}` : ''}
    </span>
  )
}
