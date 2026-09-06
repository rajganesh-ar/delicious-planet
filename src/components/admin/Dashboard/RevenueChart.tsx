import React from 'react'
import type { Bucket } from './stats'
import { formatMoney, formatMoneyCompact } from '../shared'
import '../admin.css'

/**
 * Revenue over the selected window, as inline SVG.
 *
 * No charting library: this is a bar per bucket with two gridlines, and pulling
 * in a runtime for it would cost more than the whole rest of the dashboard.
 * Being plain SVG also means it renders on the server with the numbers already
 * in it — no flash of an empty chart, and it prints.
 *
 * Every bar carries a <title>, so hovering gives the exact figure without any
 * JavaScript at all.
 */

const WIDTH = 640
const HEIGHT = 150
const PAD_TOP = 14
const PAD_BOTTOM = 4

export function RevenueChart({
  buckets,
  currency,
  unit,
}: {
  buckets: Bucket[]
  currency: string
  unit: 'day' | 'week'
}) {
  if (buckets.length === 0) {
    return <div className="dp-empty">No orders in this window.</div>
  }

  const peak = Math.max(...buckets.map((bucket) => bucket.value))
  const plotHeight = HEIGHT - PAD_TOP - PAD_BOTTOM
  const slot = WIDTH / buckets.length
  // Bars keep a hairline gap at any bucket count, and never vanish entirely on
  // a 90-day window.
  const barWidth = Math.max(slot - Math.min(4, slot * 0.25), 1)

  const total = buckets.reduce((sum, bucket) => sum + bucket.value, 0)

  return (
    <div>
      <svg
        className="dp-chart"
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        role="img"
        aria-label={`Revenue by ${unit} — ${formatMoney(total, currency)} across ${buckets.length} ${unit}s, peaking at ${formatMoney(peak, currency)}`}
      >
        <line className="dp-chart__grid" x1="0" y1={PAD_TOP} x2={WIDTH} y2={PAD_TOP} />
        <line
          className="dp-chart__grid"
          x1="0"
          y1={PAD_TOP + plotHeight / 2}
          x2={WIDTH}
          y2={PAD_TOP + plotHeight / 2}
        />
        <line
          className="dp-chart__grid"
          x1="0"
          y1={HEIGHT - PAD_BOTTOM}
          x2={WIDTH}
          y2={HEIGHT - PAD_BOTTOM}
        />

        {buckets.map((bucket, i) => {
          // An empty bucket still draws a 2px stub, so a run of zero days reads
          // as "no sales" rather than as a gap in the data.
          const height = peak > 0 ? Math.max((bucket.value / peak) * plotHeight, bucket.value > 0 ? 2 : 0) : 0
          const y = HEIGHT - PAD_BOTTOM - height
          return (
            <rect
              key={i}
              className={bucket.value > 0 ? 'dp-chart__bar' : 'dp-chart__bar dp-chart__bar--empty'}
              x={i * slot + (slot - barWidth) / 2}
              y={bucket.value > 0 ? y : HEIGHT - PAD_BOTTOM - 2}
              width={barWidth}
              height={bucket.value > 0 ? height : 2}
              rx="1"
            >
              <title>{`${bucket.label}: ${formatMoney(bucket.value, currency)}`}</title>
            </rect>
          )
        })}
      </svg>

      <div className="dp-chart__caption">
        <span>{buckets[0]?.label}</span>
        <span>Peak {formatMoneyCompact(peak, currency)}</span>
        <span>{buckets[buckets.length - 1]?.label}</span>
      </div>
    </div>
  )
}
