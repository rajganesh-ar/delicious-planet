'use client'

import { useEffect } from 'react'

/**
 * Last-resort boundary for a throw in the root layout itself.
 *
 * When this renders, the layout that normally supplies <html>, <body> and
 * styles.css never ran — so this file has to provide all three, and its styling
 * is inline rather than Tailwind because the stylesheet is exactly what may be
 * missing. Everything here is deliberately self-contained: no imports from the
 * component library, no fonts, no images.
 *
 * In practice this fires when the database or the Payload config is
 * unreachable, since the root layout queries both on every render.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Root layout error', { digest: error.digest, message: error.message })
  }, [error])

  return (
    <html lang="en">
      <body style={{ margin: 0, background: '#faf7f2', color: '#1a1a1a' }}>
        <main
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            fontFamily: 'system-ui, -apple-system, Segoe UI, sans-serif',
          }}
        >
          <div style={{ maxWidth: '32rem' }}>
            <p
              style={{
                margin: 0,
                fontSize: '0.6875rem',
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: '#7a7268',
              }}
            >
              Delicious Planet
            </p>
            <h1
              style={{
                margin: '0.75rem 0 0',
                fontSize: 'clamp(1.6rem, 4vw, 2.4rem)',
                fontWeight: 600,
                lineHeight: 1.15,
              }}
            >
              The site is temporarily unavailable
            </h1>
            <p
              style={{
                margin: '1rem 0 0',
                fontSize: '0.9375rem',
                lineHeight: 1.6,
                color: '#5c564e',
              }}
            >
              We hit an error we couldn&rsquo;t recover from. Please try again in a moment, and
              contact us if it keeps happening.
            </p>
            {error.digest && (
              <p
                style={{
                  margin: '0.75rem 0 0',
                  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                  fontSize: '0.75rem',
                  color: '#9a938a',
                }}
              >
                Reference: {error.digest}
              </p>
            )}
            <button
              type="button"
              onClick={reset}
              style={{
                marginTop: '2rem',
                padding: '0.85rem 1.6rem',
                background: '#1a1a1a',
                color: '#faf7f2',
                border: 0,
                borderRadius: '2px',
                fontSize: '0.8125rem',
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                cursor: 'pointer',
              }}
            >
              Try again
            </button>
          </div>
        </main>
      </body>
    </html>
  )
}
