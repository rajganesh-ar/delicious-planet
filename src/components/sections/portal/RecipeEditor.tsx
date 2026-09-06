'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { GUTTER } from '@/components/sections/editorial'
import { Alert } from './PortalForm'
import { PortalMasthead } from './PortalShell'
import { RecipeBuilder, type RecipeDraft } from './RecipeBuilder'
import type { PickedProduct } from './ProductPicker'
import { cn } from '@/lib/cn'

/**
 * Loads one existing recipe and hands it to the builder.
 *
 * Reads at `depth=1` so each ingredient's product comes back populated — the
 * builder shows the dish's photograph and the product behind every line, and
 * neither survives a depth-0 read. Access control does the rest: the Recipes
 * collection scopes a chef to their own rows, so a guessed id in the URL
 * returns a 404 rather than somebody else's draft.
 */

interface ProductDoc {
  id: number
  title: string
  slug: string
  sku?: string | null
  images?: { image?: { url?: string | null; sizes?: { thumbnail?: { url?: string | null } } } | null }[]
  variants?: { sku?: string | null; size?: string | null }[]
}

interface RecipeDoc {
  id: number
  title: string
  summary?: string | null
  course?: string | null
  cuisine?: string | null
  difficulty?: string | null
  servings?: number | null
  prepMinutes?: number | null
  cookMinutes?: number | null
  chefTips?: string | null
  pairing?: string | null
  allergens?: string | null
  status: string
  reviewFeedback?: string | null
  heroImage?: { id: number; url?: string | null; sizes?: { card?: { url?: string | null } } } | null
  ingredients?: {
    product?: ProductDoc | number | null
    quantity?: number | null
    unit?: string | null
    preparation?: string | null
    section?: string | null
    variantSku?: string | null
    optional?: boolean | null
  }[]
  method?: { instruction?: string | null; timerMinutes?: number | null }[]
}

function toPicked(product: ProductDoc): PickedProduct {
  const first = product.images?.[0]?.image
  return {
    id: product.id,
    title: product.title,
    slug: product.slug,
    sku: product.sku ?? null,
    image: first?.sizes?.thumbnail?.url ?? first?.url ?? null,
    variants: (product.variants ?? [])
      .filter((variant) => variant?.sku && variant?.size)
      .map((variant) => ({ sku: variant.sku as string, size: variant.size as string })),
  }
}

function toDraft(doc: RecipeDoc): RecipeDraft {
  return {
    id: doc.id,
    title: doc.title ?? '',
    summary: doc.summary ?? '',
    course: doc.course ?? '',
    cuisine: doc.cuisine ?? '',
    difficulty: doc.difficulty ?? 'intermediate',
    servings: doc.servings != null ? String(doc.servings) : '4',
    prepMinutes: doc.prepMinutes != null ? String(doc.prepMinutes) : '',
    cookMinutes: doc.cookMinutes != null ? String(doc.cookMinutes) : '',
    chefTips: doc.chefTips ?? '',
    pairing: doc.pairing ?? '',
    allergens: doc.allergens ?? '',
    heroImageId: doc.heroImage?.id ?? null,
    heroImageUrl: doc.heroImage?.sizes?.card?.url ?? doc.heroImage?.url ?? null,
    status: doc.status,
    reviewFeedback: doc.reviewFeedback ?? null,
    ingredients:
      doc.ingredients?.length
        ? doc.ingredients.map((row) => ({
            product:
              row.product && typeof row.product === 'object' ? toPicked(row.product) : null,
            quantity: row.quantity != null ? String(row.quantity) : '',
            unit: row.unit ?? 'g',
            preparation: row.preparation ?? '',
            section: row.section ?? '',
            variantSku: row.variantSku ?? '',
            optional: Boolean(row.optional),
          }))
        : [
            {
              product: null,
              quantity: '',
              unit: 'g',
              preparation: '',
              section: '',
              variantSku: '',
              optional: false,
            },
          ],
    method:
      doc.method?.length
        ? doc.method.map((step) => ({
            instruction: step.instruction ?? '',
            timerMinutes: step.timerMinutes != null ? String(step.timerMinutes) : '',
          }))
        : [{ instruction: '', timerMinutes: '' }],
  }
}

export function RecipeEditor({ id }: { id: string }) {
  const router = useRouter()
  const [draft, setDraft] = useState<RecipeDraft | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const meRes = await fetch('/api/users/me', { credentials: 'include' })
        const me = await meRes.json()
        if (!me?.user) {
          router.push(`/login?redirect=${encodeURIComponent(`/portal/chef/recipes/${id}`)}`)
          return
        }

        const res = await fetch(`/api/recipes/${encodeURIComponent(id)}?depth=1`, {
          credentials: 'include',
        })

        if (!res.ok) {
          if (!cancelled) {
            setError(
              res.status === 404 || res.status === 403
                ? 'That recipe is not one of yours, or it no longer exists.'
                : 'We could not open that recipe. Please try again.',
            )
          }
          return
        }

        const doc = (await res.json()) as RecipeDoc
        if (!cancelled) setDraft(toDraft(doc))
      } catch {
        if (!cancelled) setError('We could not open that recipe. Please try again.')
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [id, router])

  if (error) {
    return (
      <div className="bg-cream min-h-[70vh]">
        <PortalMasthead
          eyebrow="Chef portal"
          title="Recipe not found"
          back={{ href: '/portal/chef', label: 'Your recipes' }}
        />
        <div className={cn(GUTTER, 'py-8 md:py-10 max-w-2xl')}>
          <Alert>{error}</Alert>
        </div>
      </div>
    )
  }

  if (!draft) {
    return (
      <div className="bg-cream min-h-[70vh]">
        <PortalMasthead
          eyebrow="Chef portal"
          title="Opening…"
          back={{ href: '/portal/chef', label: 'Your recipes' }}
        />
      </div>
    )
  }

  return <RecipeBuilder initial={draft} />
}
