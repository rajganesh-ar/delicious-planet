'use client'

import React from 'react'
import { Badge } from '../Badge'
import { ORDER_STATUS_META } from '../shared'

/**
 * Fulfilment status as a coloured pill.
 *
 * The default select cell renders the raw value, which makes a screen of orders
 * a wall of identical grey words. Scanning for the two rows that need packing
 * should not require reading.
 */
export default function StatusCell({ cellData }: { cellData?: string }) {
  if (!cellData) return <span className="dp-table__muted">—</span>
  const meta = ORDER_STATUS_META[cellData] ?? { label: cellData, tone: 'neutral' as const }
  return <Badge tone={meta.tone}>{meta.label}</Badge>
}
