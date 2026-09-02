/**
 * Mapping decisions for the Velsoro import.
 *
 * This is the first import to create sub-categories. Velsoro's storefront
 * presents three product types — Chocolate Bars, Chocolate Boxes, Teddy Bear —
 * and they land beneath the existing "Grand Cru Cocoa & Chocolat" department
 * rather than as three more top-level departments beside it.
 *
 * That is the whole point of the two-level tree in `categories`, and this is
 * the first time it is used. Two consequences worth knowing:
 *
 *   · A department with children stops being a valid product target — the
 *     `Products.category` rule is "has no children". Grand Cru holds no
 *     products today, so nothing is orphaned, but nothing can be filed
 *     directly under it once these three exist.
 *
 *   · The storefront listings that show "the categories" had never had to tell
 *     a department from a child, because none existed. The header, homepage row
 *     and /categories index now filter to `parent: { exists: false }`; the
 *     department page already selected its whole subtree through `ancestors`.
 */

/** The department these three become children of. */
export const PARENT_DEPARTMENT_SLUG = 'grand-cru-cocoa-chocolat'

export interface SubCategorySpec {
  title: string
  slug: string
  description: string
  sortOrder: number
}

/**
 * Source collection handle → the sub-category it becomes.
 *
 * `nuts-coated-with-chocolate` ("Chocolate Truffles", 3 products) is
 * deliberately absent: it is a real collection but it is not one of the three
 * the site presents in its navigation. Adding a line here is all it would take.
 */
export const COLLECTION_TO_SUBCATEGORY: Record<string, SubCategorySpec> = {
  'our-bars-versoro-chocolate': {
    title: 'Chocolate Bars',
    slug: 'chocolate-bars',
    description:
      'Single-origin and filled bars — ruby, dark 70%, caramel and sugar-free — in 40g, 56g and 100g formats.',
    sortOrder: 1,
  },
  'chocolate-boxes': {
    title: 'Chocolate Boxes',
    slug: 'chocolate-boxes',
    description:
      'Handcrafted bonbon assortments and salted-caramel collections, boxed in 4, 12, 24 and 48 pieces.',
    sortOrder: 2,
  },
  'tidy-bear': {
    title: 'Teddy Bear',
    slug: 'teddy-bear',
    description:
      'Moulded chocolate bears in ruby, milk, dark and gold, each filled with four handcrafted truffles and bonbons.',
    sortOrder: 3,
  },
}

/**
 * Products the feed leaves out of every collection.
 *
 * "Custom Chocolate Box" belongs to no collection at all upstream, but it is a
 * chocolate box by name and by its 12/24/48-piece options, so it is filed with
 * the others rather than dropped.
 */
export const EXTRA_PRODUCTS: Record<string, string> = {
  'custom-chocolate-box': 'chocolate-boxes',
}

/**
 * Pack size where neither the title nor the copy states one.
 *
 * Only one product needs it, and it is left empty on purpose rather than
 * guessed: the size drives `weightGrams` and the variant label a customer picks,
 * and a made-up weight on a 55 AED bar is worse than an honest "One size" plus
 * a line in the run report.
 */
export const SIZE_OVERRIDES: Record<string, string> = {}

/** Written to `origin.country`. Velsoro is a Dubai chocolatier. */
export const ORIGIN_COUNTRY = 'AE'
