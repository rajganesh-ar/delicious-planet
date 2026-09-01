# Proposed Product Structure

Target model for the catalogue rebuild. Companion to [wireframe.md](wireframe.md), which
documents the model as it exists today.

Written on the assumption that **all products get deleted and re-imported**, so this
proposes breaking schema changes that would otherwise need a data migration.

> **Re-verified against the working tree on 2026-09-01** (Payload 3.80.0, Next 16.2.1).
> Corrections from that pass are marked ⟳ and listed in §10.

---

## 0. The principle

Today three taxonomies overlap and none of them owns a clear question. The fix is one
axis per question, and no axis doing two jobs:

| Question | Axis | Cardinality | Owner |
|---|---|---|---|
| What *is* it? | `category` | exactly 1 (leaf) | fixed tree, admin-managed |
| Where is it *from*? | `origin.country` → `origin.region` | 1 → derived | enum, hook-derived |
| Who *made* it? | `brand` / `supplier` | 0..1 each | CMS |
| How is it *sold* to me? | `collections` | 0..n | editorial, seasonal |
| What is it *like*? | `dietary`, `price`, `size` | facets | product fields |
| What do I *buy*? | `variants[]` | 1..n | the orderable unit |

Rule of thumb: **`category` is permanent and structural, `collections` are temporary and
editorial.** If it would ever need renaming for a campaign, it is a collection.

---

## 1. Category tree — fixed, two levels, no deeper

Two levels only. Depth 3 makes breadcrumbs, menus and filters disproportionately harder
for no merchandising gain.

```
Caviar & Roe                      Oils & Vinegars
├── Sturgeon Caviar               ├── Extra Virgin Olive Oil
├── Salmon & Trout Roe            ├── Speciality Oils
├── Caviar Gift Sets              ├── Balsamic Vinegar
└── Caviar Accessories            └── Wine & Fruit Vinegars

Chocolate & Confectionery         Pantry & Preserves
├── Chocolate Bars                ├── Honey
├── Boxes & Bonbons               ├── Jams & Spreads
├── Truffles & Pralines           ├── Olives & Antipasti
├── Chocolate Spreads             └── Sauces & Condiments
└── Novelty & Gifting
                                  Spices & Seasonings
Truffles & Mushrooms              ├── Whole Spices
├── Fresh Truffles                ├── Ground Spices
├── Preserved Truffles            ├── Blends & Rubs
└── Truffle Oils & Condiments     └── Salt & Pepper

Flour, Grains & Pasta             Cheese & Dairy
├── Flour                         ├── Hard & Aged
├── Rice & Grains                 ├── Soft & Fresh
├── Pasta                         └── Butter & Cream
└── Baking Essentials
                                  Coffee, Tea & Beverages
Bakery                            ├── Coffee
├── Breads                        ├── Tea & Infusions
├── Crackers & Crispbreads        └── Syrups & Mixers
└── Sweet Bakery
                                  Seeds, Nuts & Dried Fruit
Tableware & Accessories           ├── Nuts
├── Serveware                     ├── Seeds
├── Cutlery                       └── Dried Fruit
└── Gift Boxes
```

**Products attach to a leaf only.** Enforce it with a validate hook rather than trusting
the importer:

```ts
// Products.category
validate: async (value, { req }) => {
  if (!value) return 'Required.'
  const children = await req.payload.count({
    collection: 'categories',
    where: { parent: { equals: value } },
  })
  return children.totalDocs === 0 || 'Pick a sub-category, not a department.'
}
```

### Making department pages work

The current bug (`/categories/caviar` shows nothing) is fixed without denormalising onto
products. Add two hook-maintained fields to **Categories**:

| Field | Type | Maintained by | Purpose |
|---|---|---|---|
| `ancestors` | relationship → categories, `hasMany` | `beforeChange` hook | descendant lookup |
| `path` | text, indexed | `beforeChange` hook | `caviar-roe/sturgeon-caviar`, breadcrumbs |
| `isDepartment` | checkbox | derived from `parent == null` | menu grouping |

Department listing then becomes:

```ts
const descendants = await payload.find({
  collection: 'categories',
  // ⟳ `in`, not `contains` — `contains` is a text LIKE operator and is wrong
  //   for a hasMany relationship.
  where: { or: [{ id: { equals: cat.id } }, { ancestors: { in: [cat.id] } }] },
  depth: 0,
})
where: { category: { in: descendants.docs.map((d) => d.id) } }
```

---

## 2. Origin — stop storing free text

`countryOfOrigin: text` ([Products.ts:130](src/collections/Products.ts#L130)) is the most
fragile field in the schema: one variant spelling drops a product out of its region
silently. Replace with a group of enums.

```ts
{
  name: 'origin',
  type: 'group',
  fields: [
    {
      name: 'country',
      type: 'select',                    // canonical ISO-3166 list in src/lib/countries.ts
      required: true,
      index: true,
      options: COUNTRY_OPTIONS,          // { label: 'Italy', value: 'IT' }
    },
    {
      name: 'region',
      type: 'select',
      index: true,
      admin: { readOnly: true, description: 'Derived from country.' },
      options: ['europe','middle-east','africa','latin-america','asia','north-america','oceania'],
      hooks: {
        beforeChange: [({ siblingData }) => REGION_BY_COUNTRY[siblingData?.country] ?? null],
      },
    },
    { name: 'producerRegion', type: 'text' },   // free text is fine here: "Piedmont", "Kalamata"
    { name: 'appellation',    type: 'text' },   // DOP / PDO / IGP designation
  ],
}
```

What this buys:

- `/products?region=europe` becomes `origin.region: { equals: 'europe' }` — one indexed
  column instead of the current `countryOfOrigin: { in: [20 strings] }`
  ([products/page.tsx:58](src/app/(frontend)/products/page.tsx#L58)).
- Region becomes a **first-class filter**, combinable and countable for facet counts.
- `REGIONS` in [src/lib/regions.ts](src/lib/regions.ts) shrinks to presentation only
  (label, eyebrow, blurb, card image). The country buckets become a one-way
  `country → region` map used by the hook.
- The region-titled records ("Bite Into Europe") come **out** of `categories` entirely.

---

## 3. Collections — many-to-many, editorial

```ts
{
  name: 'collections',
  type: 'relationship',
  relationTo: 'product-collections',
  hasMany: true,          // ← was 0..1
  index: true,
}
```

A product is realistically in several at once: *Truffle Treasury* **and** *Ramadan
Gifting* **and** *Chef's Picks*. Single-value forces a choice with no right answer, which
is part of why the field ended up unused.

Add to **ProductCollections** so they can carry a campaign:

| Field | Type | Purpose |
|---|---|---|
| `isActive` | checkbox | hide a finished campaign without deleting it |
| `startsAt` / `endsAt` | date | seasonal windows |
| `badge` | text | "New", "Limited", overlaid on the card |
| `heroImage` | upload | landing-page banner, distinct from the tile image |

And give them a real route — `/collections/[slug]` — rather than existing only as a
`?collection=` query param.

---

## 4. Pricing — one model, one currency

Today there are **two competing price models**: `prices[]` (5 currencies, only `[0]` ever
read) and `sizeVariants[]` (AED only). Pick one.

**Recommendation: AED is the base currency. Store one number. Convert at display time.**

Stored FX rates go stale and turn every price edit into five edits. Unless you are
legally settling in five currencies, a `<CurrencySwitcher>` reading a rates table is
strictly better.

```ts
// Products — remove `prices[]`
{ name: 'basePrice',     type: 'number', min: 0, index: true },  // AED, hook-derived
{ name: 'baseCompareAt', type: 'number', min: 0 },
```

`basePrice` is **derived by hook** as `min(variants[].price)` so listing cards and price
band filters read one indexed number. This kills gap #6 in wireframe.md — a price band can
no longer be satisfied by a USD row.

⟳ **Blast radius is six files, and one of them handles money.** `prices[0]` is read by:

```
src/lib/product.ts:31            getPrice()          → ProductCard, HomeSidebar
src/components/sections/ProductDetail.tsx:89
src/lib/cart-pricing.ts:27       canonicalPrice()    → /api/checkout/session  ← money path
src/app/(frontend)/products/page.tsx:67              → price band filter
```

[cart-pricing.ts](src/lib/cart-pricing.ts) is the server-side re-pricing used by the live
Stripe checkout. Change it in the same commit as the schema, not after.

---

## 5. Variants become the orderable unit

The size buttons at
[ProductDetail.tsx:406](src/components/sections/ProductDetail.tsx#L406) have no click
handler, no selected state and no price effect, and `orders.items`
([Orders.ts:57](src/collections/Orders.ts#L57)) stores only `product` + `unitAmount`. A
30g and a 125g tin are indistinguishable in an order.

```ts
{
  name: 'variants',
  type: 'array',
  required: true,
  minRows: 1,              // ← single-size products get one variant
  fields: [
    // ⟳ NOT `unique: true` — Payload's unique constraint is not dependable on
    //   fields nested inside an array. Enforce with a collection beforeValidate
    //   hook that scans for SKU collisions across products.
    { name: 'sku',         type: 'text',   required: true, index: true },
    { name: 'size',        type: 'text',   required: true },   // "30g", "1kg", "6 × 750ml"
    { name: 'price',       type: 'number', required: true, min: 0 },   // AED
    { name: 'compareAt',   type: 'number', min: 0 },
    { name: 'barcode',     type: 'text' },
    { name: 'weightGrams', type: 'number', min: 0 },
    { name: 'inStock',     type: 'checkbox', defaultValue: true },
    { name: 'isDefault',   type: 'checkbox', defaultValue: false },
    { name: 'image',       type: 'upload', relationTo: 'media' },
  ],
}
```

Inventory moves off the product and onto the variant — 30g and 1kg stock separately:

```
product
└── variants[]
    └── inventory[] → { warehouse, quantity, reserved, lowStockThreshold }
```

⟳ This move is **free right now**: `inventoryLevels` is read by zero UI components.

### Two dependencies I missed first time round

**a. `orders.items` must snapshot, not just reference.**

```ts
{ name: 'product',       type: 'relationship', relationTo: 'products' },  // nullable
{ name: 'variantSku',    type: 'text',   required: true },
{ name: 'titleSnapshot', type: 'text',   required: true },   // survives catalogue deletion
{ name: 'sizeSnapshot',  type: 'text' },
{ name: 'quantity',      type: 'number', required: true, min: 1 },
{ name: 'unitAmount',    type: 'number', required: true, min: 0 },
```

**b. ⟳ The cart is keyed on `productId` alone.**
[CartContext.tsx:80](src/components/layout/CartContext.tsx#L80) dedupes lines with
`i.productId === item.productId`. The moment variants become orderable, adding a 30g and
a 125g tin **silently merges them into one line at one price**. The cart key has to become
`productId + variantSku` — in `addItem`, `updateQuantity` and `removeItem` alike.

---

## 6. Field-level summary of changes

| Field | Now | Proposed | Why |
|---|---|---|---|
| `slug` | required, manual | auto from `title`, `beforeValidate` hook | import typos become 404s |
| `sku` | optional | **required** (product) + per variant | it is the import idempotency key |
| `category` | any node | **leaf only**, validated | department pages currently empty |
| `collection` | 0..1, unused | `collections` **hasMany** | products belong to several |
| `countryOfOrigin` | free text | `origin.country` **enum** | silent region drop-outs |
| — | — | `origin.region` **derived enum** | makes region a real filter |
| `prices[]` | 5 currencies | **removed** → `basePrice` (AED) | only `[0]` was ever read |
| `sizeVariants[]` | decorative | `variants[]`, `minRows: 1`, orderable | cannot currently be bought |
| `inventoryLevels[]` | on product | on **variant** | sizes stock separately |
| `images[]` | optional | **`minRows: 1`** | empty tiles on listing grids |
| `isFeatured` | checkbox | keep, add `featuredRank` number | "best sellers" has no ordering |
| — | — | `publishedAt` date | see below |

⟳ `images[].alt` was on this list and should not have been —
[Media.ts:12](src/collections/Media.ts#L12) already has `alt: required: true`.

`publishedAt` matters: New Arrivals sorts on `createdAt`
([nav.ts](src/lib/nav.ts), `?sort=-createdAt`), so the re-upload makes the entire
catalogue "new" on the same day. ⟳ The pattern already exists in this codebase —
[BlogPosts.ts:52](src/collections/BlogPosts.ts#L52).

---

## 7. Import contract

One CSV, **one row per variant**, grouped by `product_slug`. Product-level columns repeat
across a group; the importer takes the first non-empty value.

```
product_slug, title, category_slug, brand_slug, supplier_slug,
origin_country, producer_region, appellation,
short_description, description, ingredients, allergens, storage,
dietary_halal, dietary_vegan, dietary_vegetarian, dietary_gluten_free,
  dietary_lactose_free, dietary_organic,
collection_slugs,          ← pipe-separated: "truffle-treasury|chefs-picks"
variant_sku, variant_size, variant_price_aed, variant_compare_at_aed,
  variant_barcode, variant_weight_g, variant_is_default,
image_files,               ← pipe-separated filenames, first = primary
meta_title, meta_description
```

Importer rules:

1. **Upsert products by `product_slug`**, variants by `variant_sku`. Re-running must be a
   no-op, not a duplicate.
2. **Fail loudly on unknown FK slugs.** A missing `category_slug` aborts the row with a
   clear message — never fall back to a default category. That is how the current
   catalogue ended up with everything under three departments.
3. **Validate `origin_country` against the enum before writing.** Report every
   unrecognised spelling as a batch at the end, so they get fixed in the sheet.
4. **Dry-run flag** printing the diff (`create 412 / update 18 / skip 0 / error 3`).
5. Media dedupe by filename — the `uploadLocalImage` helper in
   [seed-collections.ts](src/seed/seed-collections.ts) already does this correctly.

---

## 8. Migration sequence

Order matters — this is the part that is easy to get wrong.

```
1. SNAPSHOT ORDERS        ⟳ BLOCKING, and more urgent than first assessed.
                          Stripe is live (src/app/api/stripe/webhook + checkout/session),
                          so these are real paid orders, not test data.
                          Add titleSnapshot / variantSku / sizeSnapshot to orders.items
                          and backfill while the relationships still resolve.
                          Deleting products before this loses order history.

2. SCHEMA                 apply the Products / Categories / Collections changes,
                          generate + review the Postgres migration.

3. ACCESS CONTROL         ⟳ Products, Categories, Suppliers, Warehouses, Brands and
                          ProductCollections still have no `access` block, so any
                          logged-in customer can PATCH the catalogue. (AUDIT.md's
                          separate "forgeable orders" item is now STALE — checkout
                          re-prices server-side via priceCart.)

4. WIPE PRODUCTS          delete products (orders now self-describing),
                          then orphaned media, then the old category tree.

5. RESEED TAXONOMY        countries → categories (departments before leaves, so `parent`
                          and `ancestors` resolve) → product-collections.

6. IMPORT — DRY RUN       full CSV, no writes. Fix every reported error in the sheet.

7. IMPORT — LIVE          then verify: zero products on a department node, zero products
                          with null origin.region, zero variants priced 0, every
                          collection non-empty.

8. CODE                   product.ts helpers, cart-pricing.ts, CartContext key,
                          ProductDetail variant selector, products/page.tsx where-clause,
                          nav.ts, categories/[slug].
```

Step 7's four checks are the ones that would have caught every gap in wireframe.md §6.
Worth writing as a `verify-catalogue.ts` that exits non-zero.

---

## 9. What this fixes

| wireframe.md gap | Fixed by |
|---|---|
| 1 — `collection` never populated | §3 hasMany + import column `collection_slugs` |
| 2 — region not a field | §2 `origin.region` derived enum |
| 3 — categories mixes regions and types | §2, region records leave the tree |
| 4 — department pages empty | §1 `ancestors` + `in:` query |
| 5 — free-text country | §2 enum + import validation |
| 6 — price band crosses currencies | §4 single AED `basePrice` |
| *(new)* variants unbuyable | §5 variants as the orderable unit |
| *(new)* order history breaks on wipe | §5a snapshot fields, §8 step 1 |
| *(new)* cart merges two sizes into one line | §5b composite cart key |

---

## 10. Re-check log — 2026-09-01

Verified against the working tree; six corrections to the first draft.

| ⟳ | Was | Now | Evidence |
|---|---|---|---|
| 1 | `ancestors: { contains: id }` | `{ in: [id] }` | `contains` is a text LIKE operator (`payload/dist/types/constants.js`) |
| 2 | `unique: true` on `variants[].sku` | hook-enforced uniqueness | unique inside an array is not dependable; hook is correct regardless of adapter |
| 3 | "make `alt` required" | already required | [Media.ts:12](src/collections/Media.ts#L12) |
| 4 | order snapshot = hygiene | **blocking** | Stripe checkout + webhook are live; `orders.items` stores only a product ref |
| 5 | — (missed) | cart key must include variant SKU | [CartContext.tsx:80](src/components/layout/CartContext.tsx#L80) dedupes on `productId` |
| 6 | — (missed) | removing `prices[]` touches the money path | [cart-pricing.ts:27](src/lib/cart-pricing.ts#L27) reads `prices[0]` |

Confirmed unchanged: `collection` is still set by **no** importer; `sizeVariants` are
still decorative; `inventoryLevels` is still read by no UI; the seeded tree is still only
Caviar / Chocolate / Flour & Baking.

Also noted: **AUDIT.md (dated 2026-08-08) is stale in one place** — its P0 §3 "forgeable
orders" is fixed. [CheckoutClient.tsx:161](src/components/sections/CheckoutClient.tsx#L161)
now posts to `/api/checkout/session`, which re-prices every line from the database. Its
P0 §2 (missing `access` blocks) still stands for the catalogue collections.
