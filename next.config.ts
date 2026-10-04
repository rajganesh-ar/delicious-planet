import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'

/**
 * The R2 bucket's public domain, read from the same variable payload.config.ts
 * builds media URLs from so the two cannot drift apart. It has to be set in the
 * build environment, not just at runtime: `remotePatterns` is baked in at build
 * time, and next/image rejects any host missing from it.
 */
const r2PublicUrl = process.env.R2_PUBLIC_URL ? new URL(process.env.R2_PUBLIC_URL) : null

const nextConfig: NextConfig = {
  // Static site images (src/lib/site-image.ts) are read in client components,
  // so the bucket's public URL has to be inlined into the browser bundle too.
  // Derived here rather than set as its own variable so it cannot disagree
  // with the server's R2_PUBLIC_URL.
  env: {
    NEXT_PUBLIC_MEDIA_URL: process.env.R2_PUBLIC_URL ?? '',
  },
  images: {
    localPatterns: [
      // Static site images live in R2 too (src/lib/site-image.ts); this only
      // covers the bare `/images/...` path siteImage() falls back to when
      // R2_PUBLIC_URL is unset, so a misconfigured checkout shows broken images
      // instead of next/image throwing.
      {
        pathname: '/images/**',
      },
      // Media does not normally come from here any more — payload.config.ts
      // sets disablePayloadAccessControl, so the storage plugin registers no
      // static handler and media URLs are absolute R2 ones. This entry covers
      // the development fallback that same file emits when R2_PUBLIC_URL is
      // unset: without it next/image rejects the path and throws instead of
      // just failing to load the image.
      {
        pathname: '/api/media/file/**',
      },
    ],
    remotePatterns: r2PublicUrl
      ? [
          {
            protocol: r2PublicUrl.protocol.replace(':', '') as 'http' | 'https',
            hostname: r2PublicUrl.hostname,
          },
        ]
      : [],
  },
  /**
   * Baseline hardening headers, applied to every route.
   *
   * The Content-Security-Policy here is deliberately narrow in scope: it locks
   * down framing, plugins, the base URI and form targets, but sets no
   * `script-src` or `style-src`. A meaningful script policy would need nonces
   * threaded through both the storefront and the Payload admin (which ships
   * inline bootstrap scripts), and a half-written `script-src` that has to name
   * 'unsafe-inline' to work buys nothing while looking like it does. The
   * directives below are the ones that hold without that machinery.
   */
  async headers() {
    const csp = [
      "frame-ancestors 'self'",
      "base-uri 'self'",
      "object-src 'none'",
      "form-action 'self'",
    ].join('; ')

    const headers = [
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      // The site asks for none of these; denying them stops an injected script
      // or embedded frame from prompting the visitor in the site's name.
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=()' },
      { key: 'Content-Security-Policy', value: csp },
    ]

    // Browsers ignore HSTS over plain http, so this is inert in local dev — but
    // it is gated anyway so a developer running a local TLS proxy doesn't end
    // up with a two-year pin on localhost.
    if (process.env.NODE_ENV === 'production') {
      headers.push({
        key: 'Strict-Transport-Security',
        value: 'max-age=63072000; includeSubDomains; preload',
      })
    }

    return [{ source: '/:path*', headers }]
  },
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    return webpackConfig
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
