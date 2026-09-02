import type {
  CollectionAfterChangeHook,
  CollectionBeforeChangeHook,
  CollectionBeforeValidateHook,
} from 'payload'
import { slugify } from './productHooks'

export const ensureCategorySlug: CollectionBeforeValidateHook = ({ data }) => {
  if (!data) return data
  const source = typeof data.slug === 'string' && data.slug.trim() ? data.slug : data.title
  if (typeof source === 'string' && source.trim()) {
    data.slug = slugify(source)
  }
  return data
}

function idOf(value: unknown): number | null {
  if (typeof value === 'number') return value
  if (typeof value === 'object' && value !== null && 'id' in value) {
    const id = (value as { id: unknown }).id
    return typeof id === 'number' ? id : null
  }
  return null
}

/**
 * Maintain `ancestors` and `path` so a department listing can find everything
 * beneath it in one query.
 *
 * Products attach to leaf categories, so `/categories/caviar-roe` has no
 * products of its own — it has to select its descendants. Storing the ancestor
 * chain on the category (rather than denormalising onto every product) keeps
 * that a single indexed lookup and means moving a category re-points its
 * products for free.
 */
export const deriveCategoryLineage: CollectionBeforeChangeHook = async ({ data, req }) => {
  if (!data) return data

  const ancestorIds: number[] = []
  const ancestorSlugs: string[] = []

  let parentId = idOf(data.parent)
  // The tree is meant to be two levels; the guard stops a cycle from hanging a save.
  for (let depth = 0; parentId !== null && depth < 8; depth += 1) {
    let parent
    try {
      parent = await req.payload.findByID({
        collection: 'categories',
        id: parentId,
        depth: 0,
        overrideAccess: true,
      })
    } catch {
      break
    }
    if (!parent) break

    ancestorIds.unshift(parent.id as number)
    if (typeof parent.slug === 'string') ancestorSlugs.unshift(parent.slug)
    parentId = idOf(parent.parent)
  }

  data.ancestors = ancestorIds
  data.isDepartment = ancestorIds.length === 0
  data.path = [...ancestorSlugs, data.slug].filter(Boolean).join('/')

  return data
}

/**
 * A category's own path is derived on save, but its children's paths embed the
 * parent slug — so renaming a parent leaves them stale. Re-saving the direct
 * children refreshes them, which is complete coverage for a two-level tree.
 */
export const refreshChildLineage: CollectionAfterChangeHook = async ({
  doc,
  previousDoc,
  req,
  context,
}) => {
  // Guard against the child updates recursing back into this hook.
  if (context?.skipLineageRefresh) return doc
  if (previousDoc?.slug === doc.slug) return doc

  const children = await req.payload.find({
    collection: 'categories',
    where: { parent: { equals: doc.id } },
    limit: 200,
    depth: 0,
    overrideAccess: true,
  })

  for (const child of children.docs) {
    await req.payload.update({
      collection: 'categories',
      id: child.id,
      data: {},
      overrideAccess: true,
      context: { skipLineageRefresh: true },
    })
  }

  return doc
}
