'use client'

import React from 'react'
import { Badge } from '../Badge'
import { PAYMENT_STATUS_META } from '../shared'

/** Payment state as a coloured pill. See StatusCell for why. */
export default function PaymentCell({ cellData }: { cellData?: string }) {
  if (!cellData) return <span className="dp-table__muted">—</span>
  const meta = PAYMENT_STATUS_META[cellData] ?? { label: cellData, tone: 'neutral' as const }
  return <Badge tone={meta.tone}>{meta.label}</Badge>
}
