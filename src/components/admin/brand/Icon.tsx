import React from 'react'

/**
 * The mark shown in the admin nav header.
 *
 * Drawn inline rather than pointing at /images/logo/logo.svg, which is a fixed
 * #002f00 wordmark: on Payload's dark theme it disappears into the background,
 * and it is a 17 KB Illustrator export sized for a 295px storefront header. This
 * is a globe and a leaf in `currentColor`, so it inherits the panel's text
 * colour and is legible in both themes at 20px.
 */
export default function Icon() {
  return (
    <svg
      width="26"
      height="26"
      viewBox="0 0 32 32"
      fill="none"
      role="img"
      aria-label="Delicious Planet"
    >
      <circle cx="16" cy="16" r="13" stroke="currentColor" strokeWidth="1.6" opacity="0.55" />
      <path
        d="M3.6 12.4h24.8M3.6 19.6h24.8"
        stroke="currentColor"
        strokeWidth="1.1"
        opacity="0.3"
      />
      <path
        d="M16 7.4c5.2 4 5.2 13.2 0 17.2-5.2-4-5.2-13.2 0-17.2Z"
        fill="currentColor"
        opacity="0.85"
      />
      <path d="M16 8.6v14.8" stroke="var(--theme-elevation-0)" strokeWidth="1.1" opacity="0.7" />
    </svg>
  )
}
