import { getPayload } from 'payload'
import Link from 'next/link'
import type { Metadata } from 'next'
import config from '@/payload.config'
import { FadeIn } from '@/components/animations/FadeIn'
import type { Category } from '@/payload-types'

export const metadata: Metadata = {
  title: 'Category Directory · Delicious Planet',
  description:
    'Every department and sub-category in the Delicious Planet catalogue, listed A to Z.',
}

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

/** Bucket for departments whose title starts with a digit or symbol. */
const OTHER = '#'

/**
 * Product counts come from a single pass over the catalogue rather than one
 * `count` query per category — this caps that scan. Raise it if the catalogue
 * ever outgrows it; the page then under-reports counts rather than failing.
 */
const PRODUCT_SCAN_LIMIT = 5000

/** A relationship field arrives as a bare id at depth 0, or as the document. */
function relationId(value: unknown): number | null {
  if (typeof value === 'number') return value
  if (value && typeof value === 'object' && 'id' in value) {
    const id = (value as { id: unknown }).id
    return typeof id === 'number' ? id : null
  }
  return null
}

function firstLetter(title: string): string {
  const ch = title.trim().charAt(0).toUpperCase()
  return LETTERS.includes(ch) ? ch : OTHER
}

interface Department {
  category: Category
  children: Category[]
  /** The department's own products plus everything under its children. */
  total: number
}

export default async function CategoryDirectoryPage() {
  const payload = await getPayload({ config: await config })

  // The tree is only two levels deep — departments and their leaves — so one
  // unfiltered read beats walking it. See src/collections/Categories.ts.
  const [categoriesRes, productsRes] = await Promise.all([
    payload.find({ collection: 'categories', limit: 500, depth: 0, sort: 'title' }),
    payload.find({
      collection: 'products',
      where: { _status: { equals: 'published' } },
      limit: PRODUCT_SCAN_LIMIT,
      depth: 0,
      select: { category: true },
    }),
  ])

  const countByCategory = new Map<number, number>()
  for (const product of productsRes.docs) {
    const id = relationId(product.category)
    if (id !== null) countByCategory.set(id, (countByCategory.get(id) ?? 0) + 1)
  }

  const all = categoriesRes.docs
  const childrenByParent = new Map<number, Category[]>()
  for (const cat of all) {
    const parentId = relationId(cat.parent)
    if (parentId === null) continue
    const siblings = childrenByParent.get(parentId) ?? []
    siblings.push(cat)
    childrenByParent.set(parentId, siblings)
  }

  const departments: Department[] = all
    .filter((cat) => relationId(cat.parent) === null)
    .map((cat) => {
      const children = (childrenByParent.get(cat.id) ?? []).sort((a, b) =>
        a.title.localeCompare(b.title),
      )
      // Products attach to leaves, so a department's own tally is normally 0 —
      // it is added for departments that have no children yet.
      const total = children.reduce(
        (sum, child) => sum + (countByCategory.get(child.id) ?? 0),
        countByCategory.get(cat.id) ?? 0,
      )
      return { category: cat, children, total }
    })
    .sort((a, b) => a.category.title.localeCompare(b.category.title))

  const byLetter = new Map<string, Department[]>()
  for (const dept of departments) {
    const letter = firstLetter(dept.category.title)
    const group = byLetter.get(letter) ?? []
    group.push(dept)
    byLetter.set(letter, group)
  }
  // Letters with no department stay in the bar, dimmed, so the alphabet never
  // reflows as the catalogue grows.
  const usedLetters = [...LETTERS, OTHER].filter((l) => byLetter.has(l))

  const subCategoryCount = departments.reduce((sum, d) => sum + d.children.length, 0)
  // The tree is allowed to be flat. When nothing anywhere has children, the
  // per-department "no sub-categories" note is 16 identical lines of noise, so
  // it only earns its place once some department does have them.
  const hasSubCategories = subCategoryCount > 0

  return (
    <div className="bg-white min-h-screen">
      {/* ── Hero ──────────────────────────────────────────────── */}
      <div className="relative bg-obsidian overflow-hidden pt-20">
        <div className="absolute inset-0 bg-linear-to-br from-obsidian via-charcoal to-obsidian opacity-90" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, rgba(201,168,76,0.4) 1px, transparent 0)',
            backgroundSize: '40px 40px',
          }}
        />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-gold to-transparent opacity-40" />
        <div className="relative max-w-[1600px] mx-auto px-5 sm:px-6 md:px-8 lg:px-12 py-12 sm:py-16 md:py-20">
          <FadeIn>
            <p className="text-[10px] uppercase tracking-[0.22em] text-gold/80 font-heading font-medium m-0 mb-4 flex items-center gap-3">
              <span className="inline-block w-6 md:w-8 h-px bg-gold/40" />
              {/* Colour sits on the span: styles.css sets an unlayered
                  `a { color: currentColor }` that outranks text utilities. */}
              <Link href="/categories" className="no-underline">
                <span className="text-gold/80 hover:text-gold transition-colors">Categories</span>
              </Link>
              <span className="text-gold/40">/</span>
              Directory
            </p>
          </FadeIn>
          <FadeIn delay={0.1}>
            <h1 className="font-luxury text-[28px] sm:text-[32px] md:text-[40px] lg:text-[48px] xl:text-[56px] font-medium m-0 text-cream tracking-[-0.03em] leading-[1.08]">
              Category Directory
            </h1>
          </FadeIn>
          <FadeIn delay={0.2}>
            <p className="text-cream/60 text-[15px] sm:text-[16px] mt-4 mb-0 max-w-lg leading-relaxed">
              Every department and sub-category we carry, listed A to Z.
            </p>
          </FadeIn>
          <FadeIn delay={0.3}>
            <p className="text-stone/50 text-xs mt-6 mb-0 uppercase tracking-[0.2em]">
              {departments.length} department{departments.length !== 1 ? 's' : ''}
              {hasSubCategories
                ? ` · ${subCategoryCount} sub-categor${subCategoryCount !== 1 ? 'ies' : 'y'}`
                : ''}
            </p>
          </FadeIn>
        </div>
      </div>

      {departments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 px-6">
          <p className="text-obsidian text-base font-luxury m-0 mb-2">No categories yet</p>
          <p className="text-stone text-sm m-0">Please check back soon.</p>
        </div>
      ) : (
        <>
          {/* ── A–Z jump bar ────────────────────────────────────── */}
          <div className="sticky top-(--header-h) z-30 bg-white/95 backdrop-blur-sm border-b border-stone/15">
            <div className="max-w-[1600px] mx-auto px-5 sm:px-6 md:px-8 lg:px-12 py-3 flex flex-wrap gap-1">
              {[...LETTERS, OTHER].map((letter) =>
                byLetter.has(letter) ? (
                  <a key={letter} href={`#letter-${letter}`} className="no-underline">
                    <span className="inline-flex items-center justify-center w-7 h-7 text-[11px] font-heading font-semibold uppercase text-obsidian hover:bg-obsidian hover:text-cream transition-colors">
                      {letter}
                    </span>
                  </a>
                ) : (
                  <span
                    key={letter}
                    className="inline-flex items-center justify-center w-7 h-7 text-[11px] font-heading uppercase text-stone/30 select-none"
                  >
                    {letter}
                  </span>
                ),
              )}
            </div>
          </div>

          {/* ── Letter sections ─────────────────────────────────── */}
          <div className="max-w-[1600px] mx-auto px-5 sm:px-6 md:px-8 lg:px-12 py-10 md:py-14">
            {usedLetters.map((letter) => (
              <section
                key={letter}
                id={`letter-${letter}`}
                /* Clears the stuck header (--header-h, republished by Header.tsx)
                   plus the jump bar sitting under it. */
                className="scroll-mt-[calc(var(--header-h)+5rem)] pt-8 first:pt-0"
              >
                <div className="flex items-center gap-4 mb-6">
                  {/* styles.css styles h1–h3 unlayered, so the visual treatment
                      lives on the span and only the margin needs overriding. */}
                  <h2 className="m-0!">
                    <span className="block font-luxury text-2xl md:text-3xl font-medium text-obsidian tracking-tight">
                      {letter}
                    </span>
                  </h2>
                  <span className="flex-1 h-px bg-stone/20" />
                </div>

                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-x-10 gap-y-8">
                  {byLetter.get(letter)!.map((dept, i) => (
                    <FadeIn key={dept.category.id} delay={i * 0.03}>
                      <div className="border-t border-stone/20 pt-4">
                        <Link
                          href={`/categories/${dept.category.slug}`}
                          className="group no-underline inline-flex items-baseline gap-2"
                        >
                          <h3 className="m-0!">
                            <span className="block font-luxury text-lg md:text-xl font-medium text-obsidian group-hover:text-forest-green transition-colors tracking-tight">
                              {dept.category.title}
                            </span>
                          </h3>
                          <span className="text-[11px] font-sans text-stone shrink-0">
                            {dept.total}
                          </span>
                        </Link>

                        {dept.children.length > 0 ? (
                          <ul className="list-none p-0 m-0 mt-2.5 flex flex-wrap gap-x-3 gap-y-1.5">
                            {dept.children.map((child) => (
                              <li key={child.id} className="m-0">
                                <Link
                                  href={`/categories/${child.slug}`}
                                  className="group no-underline"
                                >
                                  <span className="text-[13px] font-sans text-charcoal group-hover:text-forest-green transition-colors">
                                    {child.title}
                                  </span>
                                  <span className="text-[11px] font-sans text-stone/60 ml-1">
                                    ({countByCategory.get(child.id) ?? 0})
                                  </span>
                                </Link>
                              </li>
                            ))}
                          </ul>
                        ) : hasSubCategories ? (
                          <p className="m-0 mt-2.5 text-[13px] font-sans text-stone/70">
                            No sub-categories yet
                          </p>
                        ) : null}
                      </div>
                    </FadeIn>
                  ))}
                </div>
              </section>
            ))}
          </div>

          {/* ── Back to the visual index ────────────────────────── */}
          <div className="border-t border-stone/15">
            <div className="max-w-[1600px] mx-auto px-5 sm:px-6 md:px-8 lg:px-12 py-10 flex flex-wrap items-center justify-between gap-4">
              <p className="m-0 text-sm font-sans text-stone">Prefer to browse by picture?</p>
              <Link href="/categories" className="group no-underline">
                <span className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] font-heading font-semibold text-obsidian group-hover:text-forest-green transition-colors">
                  View the category grid
                  <span className="inline-block w-4 h-px bg-obsidian/60 group-hover:w-6 transition-all duration-300" />
                </span>
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
