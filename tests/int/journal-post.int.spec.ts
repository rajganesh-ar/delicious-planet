import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import React from 'react'

import { JournalPostClient } from '@/components/sections/JournalPostClient'
import type { BlogPost } from '@/payload-types'

/**
 * The article body is Lexical JSON. The template used to flatten the whole
 * document into a single <p>, which silently dropped headings, lists, links
 * and inline formatting — these cover the node types an editor can actually
 * produce so that regression can't come back unnoticed.
 */

/** Lexical stores inline styling as a bitmask: bold = 1, italic = 2. */
const text = (value: string, format = 0) => ({ type: 'text', text: value, format, version: 1 })

const CONTENT = {
  root: {
    type: 'root',
    direction: 'ltr' as const,
    format: '' as const,
    indent: 0,
    version: 1,
    children: [
      { type: 'heading', tag: 'h2', version: 1, children: [text('Sourcing at origin')] },
      {
        type: 'paragraph',
        version: 1,
        children: [text('Plain copy with '), text('bold', 1), text(' and '), text('italic', 2)],
      },
      { type: 'paragraph', version: 1, children: [] },
      {
        type: 'quote',
        version: 1,
        children: [text('Continuity is a discipline.')],
      },
      {
        type: 'list',
        listType: 'bullet',
        version: 1,
        children: [
          { type: 'listitem', version: 1, children: [text('First point')] },
          { type: 'listitem', version: 1, children: [text('Second point')] },
        ],
      },
      {
        type: 'paragraph',
        version: 1,
        children: [
          {
            type: 'link',
            version: 1,
            fields: { url: '/sourcing', newTab: false },
            children: [text('How we source')],
          },
        ],
      },
      // A node type this renderer does not know about must still show its text.
      {
        type: 'someFutureBlock',
        version: 1,
        children: [text('Content from an unknown block')],
      },
    ],
  },
} as unknown as BlogPost['content']

const POST = {
  id: 1,
  title: 'A test article',
  slug: 'a-test-article',
  excerpt: 'The standfirst that sits above the body.',
  content: CONTENT,
  publishedAt: '2026-02-01T00:00:00.000Z',
  updatedAt: '2026-02-01T00:00:00.000Z',
  createdAt: '2026-02-01T00:00:00.000Z',
} as unknown as BlogPost

describe('JournalPostClient', () => {
  it('renders the article shell', () => {
    render(React.createElement(JournalPostClient, { post: POST, relatedPosts: [] }))

    expect(screen.getByRole('heading', { level: 1 }).textContent).toContain('A test article')
    expect(screen.getByText('The standfirst that sits above the body.')).toBeTruthy()
    expect(screen.getByRole('navigation', { name: 'Breadcrumb' })).toBeTruthy()
  })

  it('renders Lexical headings, lists, quotes and links as real elements', () => {
    render(React.createElement(JournalPostClient, { post: POST, relatedPosts: [] }))

    // Heading node -> <h2>, not swallowed into a paragraph.
    expect(screen.getByRole('heading', { level: 2, name: 'Sourcing at origin' })).toBeTruthy()

    // List node -> <ul> with one <li> per item.
    const list = screen.getByRole('list', { name: '' })
    const items = within(list).getAllByRole('listitem')
    expect(items.map((li) => li.textContent)).toEqual(['First point', 'Second point'])

    // Quote node -> <blockquote>.
    expect(document.querySelector('blockquote')?.textContent).toContain(
      'Continuity is a discipline.',
    )

    // Link node -> <a> pointing at the stored url.
    expect(screen.getByRole('link', { name: 'How we source' }).getAttribute('href')).toBe('/sourcing')
  })

  it('applies inline formatting bitmasks', () => {
    render(React.createElement(JournalPostClient, { post: POST, relatedPosts: [] }))

    expect(document.querySelector('strong')?.textContent).toBe('bold')
    expect(document.querySelector('em')?.textContent).toBe('italic')
  })

  it('keeps the text of unknown block types instead of dropping them', () => {
    render(React.createElement(JournalPostClient, { post: POST, relatedPosts: [] }))
    expect(screen.getByText('Content from an unknown block')).toBeTruthy()
  })

  it('renders without a body, image or excerpt', () => {
    const bare = {
      ...POST,
      excerpt: null,
      content: { root: { type: 'root', children: [] } },
    } as unknown as BlogPost

    expect(() =>
      render(React.createElement(JournalPostClient, { post: bare, relatedPosts: [] })),
    ).not.toThrow()
  })
})
