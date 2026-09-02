# Product Data Model — Map

How a **product** connects to categories, collections, brands, suppliers, regions,
warehouses and import sources — and how each turns into a URL.

**This describes the schema as implemented**, not a proposal. The rationale behind each
decision is in [structure.md](structure.md).

---

## 1. Entity map

```
                          ┌──────────────────────┐
                          │      categories      │  two-level tree
                          │  parent / ancestors  │  products attach to LEAVES only
                          │  path / isDepartment │  REQUIRED, validated on save
                          └──────────┬───────────┘
                                     │ category  (exactly 1)
                                     ▼
┌───────────────┐ collections  ┌─────────────────┐  brand   ┌──────────────┐
│ product-      │◄─────────────┤                 ├─────────►│   brands     │
│ collections   │   (0..n)     │                 │  (0..1)  └──────────────┘
│ editorial,    │   hasMany    │                 │
│ campaign-aware│              │    PRODUCTS     │ supplier ┌──────────────┐
└───────────────┘              │                 ├─────────►│  suppliers   │
                               │  title / slug   │  (0..1)  └──────────────┘
┌───────────────┐  images[]    │  sku            │
│    media      │◄─────────────┤  origin{}       │  source  ┌──────────────┐
│  minRows: 1   │   (1..n)     │  dietary{}      ├─────────►│import-sources│
└───────────────┘              │  basePrice   ⟐  │  (0..1)  │ feed config, │
                               │  inStock     ⟐  │          │ category map │
┌───────────────┐              │  publishedAt    │          └──────────────┘
│   REGIONS     │   derived    │                 │
│ presentation  │◄─────────────┤  variants[]  ───┼──┐
│ only          │  origin.     │  1..n, REQUIRED │  │
│ lib/regions   │  region ⟐    └─────────────────┘  │
└───────────────┘                     ▲             │ inventory[]
                                      │             ▼
        orders.items[]                │       ┌──────────────┐
        ├─ product      (nullable) ───┘       │  warehouses  │
        ├─ variantSku   ← the durable key     │  stock/size  │
        ├─ titleSnapshot                      └──────────────┘
        └─ sizeSnapshot
```

`⟐` = derived on save by a hook, never authored.

---

## 2. The variant is the unit of sale

This is the biggest change from the old model. A product is a container; a **variant** is
what has a price, stock and a barcode, and what an order records.

```
product  "Siberian Sturgeon Caviar"
│   sku          ADM-STURG
│   basePrice    240      ⟐ min(variants.price)
│   inStock      true     ⟐ any variant in stock
│
├── variant  ADM-STURG-30   30g    240 AED   inStock ✓  isDefault ✓
│   └── inventory → Dubai DC: 40, Jebel Ali: 12
├── variant  ADM-STURG-50   50g    380 AED   inStock ✓
└── variant  ADM-STURG-125  125g   870 AED   inStock ✗
```

- Listing cards show `basePrice` — a *from* price.
- The product page preselects `isDefault` and re-prices as the buyer switches size.
- Quick-add from a card adds the **cheapest** variant, so the amount charged is always the
  amount the card displayed.
- The cart keys lines on `productId + variantSku`. Two sizes are two lines.
- `/api/checkout/session` re-prices every line from the variant record. The browser never
  sends an amount.

---

## 3. The three axes

```
┌──────────────┬──────────────────────┬───────────────────────┬────────────────────┐
│              │  categories          │  product-collections  │  origin.region     │
├──────────────┼──────────────────────┼───────────────────────┼────────────────────┤
│ Answers      │ what IS it           │ how is it SOLD        │ where is it FROM   │
│ Lives in     │ Postgres (CMS)       │ Postgres (CMS)        │ derived column     │
│ Shape        │ 2-level tree         │ flat, campaign-aware  │ 7 fixed buckets    │
│ On a product │ `category`  1, req.  │ `collections`  0..n   │ from origin.country│
│ Permanence   │ structural           │ seasonal              │ fixed              │
│ Route        │ /categories/[slug]   │ /products?collection= │ /products?region=  │
└──────────────┴──────────────────────┴───────────────────────┴────────────────────┘
```

**The rule:** if it would ever be renamed for a campaign, it is a collection, not a
category.

### 3a. Categories — departments and leaves

```
Caviar & Roe                    ← department: parent=null, isDepartment=true
├── Sturgeon Caviar             ← leaf: products attach HERE
├── Salmon & Trout Roe             ancestors=[Caviar & Roe]
├── Caviar Gift Sets               path="caviar-and-roe/sturgeon-caviar"
└── Caviar Accessories
```

12 departments, 43 leaves — seeded by
[seed-taxonomy.ts](src/seed/seed-taxonomy.ts).

A department page finds its products through `ancestors`, which is why it is no longer
empty:

```ts
const descendants = await payload.find({
  collection: 'categories',
  where: { or: [{ id: { equals: cat.id } }, { ancestors: { in: [cat.id] } }] },
})
where: { category: { in: descendants.docs.map((d) => d.id) } }
```

Filing a product on a department is rejected by a `validate` hook, and again by
`verify-catalogue`.

### 3b. Region — derived, never authored

```
origin.country = 'IT'                    ← ISO-3166 enum, required
        │
        ▼  field hook, on save
origin.region  = 'europe'                ← indexed column
        │
        ▼
/products?region=europe  →  { 'origin.region': { equals: 'europe' } }
```

One indexed lookup, where it used to be `countryOfOrigin: { in: [20 strings] }` against
free text. Both halves come from one table in
[countries.ts](src/lib/countries.ts), so they cannot drift.
[regions.ts](src/lib/regions.ts) is now presentation only — label, eyebrow, blurb, card
art.

Importers accept `IT`, `Italy`, or a known alias (`UAE`, `Holland`, `Türkiye`) via
`resolveCountryCode`; anything else is **reported, never guessed**.

---

## 4. Multi-site imports

Every supplier catalogue is a row in `import-sources` plus a CSV. Adding a site means
adding a CMS record, not another bespoke script.

```
┌─ import-sources ───────────────────────────────────────────┐
│  slug              admiral-caviar                          │
│  defaultCurrency   AED     defaultCountry  CN              │
│  defaultBrand      Admiral defaultSupplier Admiral FZE     │
│  categoryMap[]     "Black Caviar"  → Sturgeon Caviar       │
│                    "Gift Boxes"    → Caviar Gift Sets      │
└────────────────────────────────────────────────────────────┘
            │
            ▼
    import-catalogue.ts --source=admiral-caviar --file=admiral.csv
            │
            ├─ group CSV rows by product_slug   (1 row per VARIANT)
            ├─ map category label → leaf        unmapped → REPORTED
            ├─ resolve country → ISO            unknown  → REPORTED
            ├─ hash the row                     unchanged → SKIPPED
            └─ upsert on (source, externalId)   ← NOT sku
```

**The import key is `(source, externalId)`, not SKU.** Two suppliers routinely use the
same SKU string for different products; keying on SKU would let one feed overwrite
another's rows.

Imported products land as **drafts** — images are attached and reviewed before publish.

```
pnpm import:catalogue --source=<slug> --file=<csv>            # dry run, writes nothing
pnpm import:catalogue --source=<slug> --file=<csv> --write    # apply
```

The dry run prints `create / update / skip / error` plus every unmapped category and
unrecognised country, so corrections happen in the sheet rather than the database.

---

## 5. URL → filter → where-clause

All of these funnel into
[products/page.tsx](src/app/(frontend)/products/page.tsx), which ANDs each present param
into one `Where`.

```
URL                                   RESOLVED VIA          WHERE CLAUSE
──────────────────────────────────────────────────────────────────────────────────────
/products?category=sturgeon-caviar    slug → id             category: { equals: id }
/products?collection=truffle-treasury slug → id             collections: { in: [id] }
/products?supplier=<slug>             slug → id             supplier: { equals: id }
/products?region=europe               REGION_SLUGS          origin.region: { equals }
/products?originCountry=Italy         resolveCountryCode    origin.country: { equals:'IT'}
/products?dietary=halal               DIETARY_FACETS        dietary.isHalal: true
/products?price=50-100                PRICE_BANDS           basePrice: gte / lt
/products?featured=true               —                     isFeatured: true
/products?inStock=true                —                     inStock: true   ⟐
/products?search=<term>               —                     OR title | shortDesc | sku
/products?sort=-publishedAt&page=2    —                     sort / page (limit 24)
──────────────────────────────────────────────────────────────────────────────────────
always                                                      _status: 'published'
```

Dedicated routes:

```
/categories            → departments and their leaves
/categories/[slug]     → category + ALL descendants' products
/products/[slug]       → product, variant selector, related by category
/brands                → brand index
```

---

## 6. Product-internal structure

```
product
├── origin{}              country (ISO enum, req) · region ⟐ · producerRegion · appellation
├── variants[]  1..n      sku · size · price · compareAt · barcode · weightGrams
│   │                     inStock · isDefault · image
│   └── inventory[]       → warehouse · quantity · reserved · lowStockThreshold
├── basePrice ⟐           AED. min(variants.price) — what cards show and bands filter
├── inStock   ⟐           any variant in stock
├── images[]  1..n        → media (card on tiles, thumbnail in cart, hero on PDP)
├── dietary{}             isHalal isLactoseFree isOrganic isVegetarian isVegan isGlutenFree
├── nutritionPer100g{}    energyKJ energyKcal protein carbs sugars fat satFat salt fibre
├── shipping{}            dimensionsCm{} · shippingClass · freeShipping · handlingDays
├── source{}              source → import-sources · externalId · sourceUrl
│                         importedAt · contentHash          ← the import key + skip check
├── publishedAt           stamped once; survives re-import so New Arrivals stays honest
├── specifications[]      { label, value }
└── meta{}                SEO title / description / image
```

---

## 7. Order lines are self-describing

```
orders.items[]
├── product        → products   NULLABLE — a wiped catalogue must not break history
├── variantSku     "ADM-STURG-125"     ← the durable identifier
├── titleSnapshot  "Siberian Sturgeon Caviar"
├── sizeSnapshot   "125g"
├── quantity  ·  unitAmount  ·  currency
```

Written by [checkout/session/route.ts](src/app/api/checkout/session/route.ts) from
server-side prices. Backfill existing orders **before** deleting any product:

```
pnpm backfill:orders           # dry run
pnpm backfill:orders --write
```

---

## 8. Runbook

Current state of the live DB (checked 2026-09-01): 62 products, 61 of them with **no
category**; 6 categories, all region-named leftovers; 2 orders, both unpaid/pending;
217 media; schema still the old one, no migrations directory.

```
0.  node scripts/export-legacy-catalogue.cjs > data/legacy-catalogue.csv
                                     ← FIRST. Raw SQL, reads the OLD columns.
                                       Must run before the migration drops them.
                                       Done: 62 products → 86 variant rows.

1.  fill in category_slug in that CSV — 62 decisions, nothing imports without it

2.  payload migrate:create && payload migrate
                                     ← adds the new columns, including the order
                                       snapshot fields step 3 writes into

3.  pnpm backfill:orders --write     ← after the migration (the columns must exist),
                                       before deleting products (titles must resolve)

4.  wipe products → orphaned media → old category tree

5.  pnpm seed:base                   warehouses · suppliers · brands · import-sources
6.  pnpm seed:taxonomy               12 departments + 43 leaves
7.  pnpm seed:collections            product-collections + their tile art

8.  fill in each source's categoryMap in the admin  (Imports → the source)

9.  pnpm import:catalogue --source=<slug> --file=<csv>          (dry run, per source)
10. pnpm import:catalogue --source=<slug> --file=<csv> --write
11. pnpm verify:catalogue            ← exits non-zero if anything below fails
```

**Step 2 must precede step 3**, not follow it: the backfill writes `titleSnapshot` /
`variantSku` / `sizeSnapshot`, and those columns do not exist until the migration runs.
It must still precede step 4, because it reads titles through the product relationship.

There is no migrations directory, so the project has been running on Payload's dev
auto-push. Do not boot Payload against this database with the new config until you mean
to apply the schema change — `export-legacy-catalogue.cjs` uses raw SQL for exactly that
reason.

Each collection has exactly one writer, so no two scripts fight over the same rows:
`seed-base-data` owns reference data, `seed-taxonomy` owns categories,
`seed-collections` owns product-collections, `import-catalogue` owns products.

`verify-catalogue` checks: no product on a department · every product resolves to a
region · no variant priced zero · no empty active collection · no duplicate variant SKU ·
every published product has an image.

---

## 9. Gaps closed

| Old gap | Now |
|---|---|
| `collection` populated by no importer | `collections` hasMany, set from `collection_slugs` |
| region not a field | `origin.region`, derived + indexed |
| categories mixed regions with product types | regions left the tree entirely |
| department pages empty | `ancestors` + `in:` query |
| free-text country | ISO enum + alias resolution, unknowns reported |
| price band crossed currencies | single AED `basePrice` |
| variants unbuyable | variants are the unit of sale |
| order history breaks on wipe | snapshot fields + backfill |
| cart merged two sizes into one line | composite `productId::variantSku` key |
| catalogue writable by any logged-in user | `catalogueAccess` on every catalogue collection |
