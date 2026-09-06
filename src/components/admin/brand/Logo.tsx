import React from 'react'
import Icon from './Icon'
import './brand.css'

/**
 * The lockup on the login screen.
 *
 * Typographic rather than the storefront's exported wordmark, for the reason
 * given in Icon.tsx — the export is a single fixed dark green and vanishes on a
 * dark login page. Naming the surface ("Merchant back office") is worth the
 * line: this login sits at the same domain as the shop, and staff arriving at it
 * from a bookmark should be able to tell in one glance which one they landed on.
 */
export default function Logo() {
  return (
    <div className="dp-logo">
      <span className="dp-logo__mark">
        <Icon />
      </span>
      <span className="dp-logo__text">
        <span className="dp-logo__word">Delicious Planet</span>
        <span className="dp-logo__sub">Merchant back office</span>
      </span>
    </div>
  )
}
