import * as React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { cn } from '@/lib/cn'
import type { Media } from '@/payload-types'

/**
 * Renders Payload's Lexical rich text.
 *
 * The nodes are typed loosely (`[k: string]: unknown` in payload-types), so
 * this walks them defensively and skips anything it doesn't recognise rather
 * than throwing on unexpected editor content.
 *
 * styles.css sets unlayered h1–h6 / p typography that outranks Tailwind's
 * layered utilities, so block styling lives on a child span where the element
 * has a base rule, and margins use an important override.
 */

type Node = Record<string, unknown>

/** Lexical text format bitmask. */
const FORMAT = {
  bold: 1,
  italic: 2,
  strikethrough: 4,
  underline: 8,
  code: 16,
  subscript: 32,
  superscript: 64,
} as const

function children(node: Node): Node[] {
  return Array.isArray(node.children) ? (node.children as Node[]) : []
}

function renderText(node: Node, key: React.Key): React.ReactNode {
  const text = typeof node.text === 'string' ? node.text : ''
  if (!text) return null
  const format = typeof node.format === 'number' ? node.format : 0

  let out: React.ReactNode = text
  if (format & FORMAT.code) {
    out = (
      <code className="font-mono text-[0.9em] bg-parchment border border-stone/15 rounded-sm px-1.5 py-0.5">
        {out}
      </code>
    )
  }
  if (format & FORMAT.bold) out = <strong className="font-semibold text-obsidian">{out}</strong>
  if (format & FORMAT.italic) out = <em>{out}</em>
  if (format & FORMAT.underline) out = <span className="underline underline-offset-2">{out}</span>
  if (format & FORMAT.strikethrough) out = <s>{out}</s>
  if (format & FORMAT.subscript) out = <sub>{out}</sub>
  if (format & FORMAT.superscript) out = <sup>{out}</sup>

  return <React.Fragment key={key}>{out}</React.Fragment>
}

function renderChildren(node: Node): React.ReactNode[] {
  return children(node)
    .map((child, i) => renderNode(child, i))
    .filter(Boolean)
}

const HEADING_CLASS: Record<string, string> = {
  h1: 'text-2xl md:text-3xl',
  h2: 'text-xl md:text-2xl',
  h3: 'text-lg md:text-xl',
  h4: 'text-base md:text-lg',
  h5: 'text-base',
  h6: 'text-[15px]',
}

function renderNode(node: Node, key: React.Key): React.ReactNode {
  const type = typeof node.type === 'string' ? node.type : ''

  switch (type) {
    case 'text':
      return renderText(node, key)

    case 'linebreak':
      return <br key={key} />

    case 'horizontalrule':
      return <hr key={key} className="my-6 border-0 border-t border-stone/15" />

    case 'paragraph': {
      const content = renderChildren(node)
      if (content.length === 0) return null
      return (
        <p key={key} className="m-0! mb-4! font-sans text-[14px] md:text-[15px] leading-[1.75] text-stone">
          {content}
        </p>
      )
    }

    case 'heading': {
      const tag = (typeof node.tag === 'string' ? node.tag : 'h2').toLowerCase()
      const Tag = (HEADING_CLASS[tag] ? tag : 'h2') as 'h2'
      return (
        <Tag key={key} className="m-0! mt-7! mb-3!">
          <span
            className={cn(
              'block font-luxury font-semibold text-obsidian leading-tight tracking-tight',
              HEADING_CLASS[tag] ?? HEADING_CLASS.h2,
            )}
          >
            {renderChildren(node)}
          </span>
        </Tag>
      )
    }

    case 'quote':
      return (
        <blockquote
          key={key}
          className="m-0! my-6! border-l-2 border-forest-green/40 pl-4 md:pl-5"
        >
          <span className="block font-luxury italic text-base md:text-lg text-obsidian/85 leading-relaxed">
            {renderChildren(node)}
          </span>
        </blockquote>
      )

    case 'list': {
      const ordered = node.listType === 'number' || node.tag === 'ol'
      const Tag = ordered ? 'ol' : 'ul'
      return (
        <Tag
          key={key}
          className={cn(
            'm-0! my-4! pl-5 flex flex-col gap-2',
            ordered ? 'list-decimal' : 'list-disc',
          )}
        >
          {renderChildren(node)}
        </Tag>
      )
    }

    case 'listitem':
      return (
        <li key={key} className="font-sans text-[14px] md:text-[15px] leading-[1.7] text-stone">
          {renderChildren(node)}
        </li>
      )

    case 'link':
    case 'autolink': {
      const fields = (node.fields ?? {}) as Record<string, unknown>
      const url =
        typeof fields.url === 'string' ? fields.url
        : typeof node.url === 'string' ? node.url
        : null
      if (!url) return <React.Fragment key={key}>{renderChildren(node)}</React.Fragment>

      const label = (
        <span className="text-forest-green underline underline-offset-2 hover:text-bud-green transition-colors">
          {renderChildren(node)}
        </span>
      )

      // Route-internal targets go through Link so navigation stays client-side.
      return url.startsWith('/') ? (
        <Link key={key} href={url} className="no-underline">
          {label}
        </Link>
      ) : (
        <a
          key={key}
          href={url}
          className="no-underline"
          {...(fields.newTab ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        >
          {label}
        </a>
      )
    }

    case 'upload': {
      const value = node.value as Media | number | null | undefined
      const media = typeof value === 'object' && value !== null ? value : null
      const url = media?.sizes?.card?.url ?? media?.url
      if (!url) return null
      return (
        <figure key={key} className="m-0! my-6!">
          <div className="relative aspect-video w-full overflow-hidden rounded-sm bg-mist">
            <Image
              src={url}
              alt={media?.alt ?? ''}
              fill
              sizes="(max-width: 768px) 100vw, 46rem"
              className="object-cover"
            />
          </div>
          {media?.alt ? (
            <figcaption className="font-sans text-[11.5px] text-stone/70 mt-2">
              {media.alt}
            </figcaption>
          ) : null}
        </figure>
      )
    }

    default: {
      // Unknown block (or a container like `listitem` nesting) — render whatever
      // children it has rather than dropping the content entirely.
      const content = renderChildren(node)
      return content.length > 0 ? <React.Fragment key={key}>{content}</React.Fragment> : null
    }
  }
}

export type RichTextProps = {
  /** Payload Lexical value — `post.content` and friends. */
  content?: { root?: { children?: unknown } } | null
  className?: string
}

export function RichText({ content, className }: RichTextProps) {
  const nodes = content?.root?.children
  if (!Array.isArray(nodes) || nodes.length === 0) return null

  return (
    <div className={className}>
      {(nodes as Node[]).map((node, i) => renderNode(node, i)).filter(Boolean)}
    </div>
  )
}
