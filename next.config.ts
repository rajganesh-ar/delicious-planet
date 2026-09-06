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
  images: {
    localPatterns: [
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
