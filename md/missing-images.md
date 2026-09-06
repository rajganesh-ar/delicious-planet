# Missing Images — Page by Page

Every image slot that is **live in the code but has no picture behind it**. There
are two separate kinds, and they are fixed in two different places:

- **Part A — static slots (37 files).** Declared in each page client's `MEDIA`
  map as `src: null`. Fixed by dropping an AVIF into `public/images/…` and
  pointing the slot at it.
- **Part B — CMS-backed slots (22 records).** The code is finished; the Payload
  record simply has no upload, so the placeholder renders at runtime. Fixed in
  the admin panel, not in the repo.

Both classes show a placeholder to the visitor. Part A is the same hatched box on
every visit; Part B changes the moment someone uploads a file.

**Total visible gaps: 59.**

- **Generated:** 2 September 2026, from `src/` on `feat/stripe-checkout`.
- **Re-verified:** 6 September 2026 — Part A re-counted against `src/`, Part B
  re-queried live against the database. See
  [Revision 2](#revision-2--6-september-2026).
- **Broken references:** none. All 59 hard-coded `/images/…` paths in `src/`
  resolve to a file on disk, so nothing 404s today.
- **Revision history** — see [Revision 1](#revision-1--2-september-2026) for the
  CMS move and two corrections to the first draft.

> Supersedes the "Missing" section of [image-manifest.md](image-manifest.md) and
> the filename lists in [required-images.md](required-images.md), both of which
> predate the current page clients.

---

## Revision 2 — 6 September 2026

Re-verified end to end: Part A re-counted from `src/`, Part B re-queried against
the live database. **Part A is unchanged at 37.** Part B moved, because catalogue
work has landed since the first pass.

| What changed | Then (2 Sep) | Now (6 Sep) |
|---|---|---|
| `categories` rows | 20, 5 missing, 4 visible gaps | **25, 10 missing, 9 visible gaps** |
| `brands` rows | 9, 4 hidden | **12, 7 hidden** |
| `products` | 70, all with art | **256, all with art** |
| Part B visible total | 17 | **22** |
| Unused files on disk | 6 | **5** — `public/videos/chef-hero.mp4` was deleted in `9551469` |

Unchanged: `office-locations` still has **zero rows**; banners 5/5, team 5/5 and
suppliers 3/3 are all still empty.

**New in this revision:** [Image reuse](#image-reuse--which-files-do-double-duty),
prompted by the question of whether the region images are shared with anything
else. They are — all seven of them. That section maps every file used in more
than one place.

---

## Revision 1 — 2 September 2026

### What moved

The About "Our people" section and both brand logo strips were rewired to the
CMS. Nothing changed on screen; what changed is who can edit it.

| Change | Effect on this document |
|---|---|
| New `team` collection (`role`, `name`, `photo`, `isFounder`, `quote`, `active`, `sortOrder`), seeded with the 5 people who were hard-coded | The founder portrait and 4 team portraits left **Part A §2.3** and became **Part B §B5**. Part A: 42 → **37**. |
| Both logo strips now read `brands` via [resolveBrandMarks](src/lib/brand-marks.ts), with the 5 bundled files in `public/images/partner-logo/` as fallback; a `cebon` brand row was added so that mark keeps rendering | New **Part B §B6**. `brands.logo` is no longer a dead field, so it moved out of the "never rendered" list. |

### Two corrections

Recorded rather than quietly overwritten, so anyone working from a copy of the
first draft — or from the proposal that led to this work — knows what changed.

**1 · The CMS move was scoped as removing 11 static files. It removes 5.**
That figure came from the proposal, not from this document, and it conflated two
separate things: the 4 team portraits *and* the 7-slot timeline rail. Only the
founder (1) and the team grid (4) became CMS records. The **timeline rail is
still hard-coded** and still needs a code change — it is the last literal
`src={null}` on the About page. See §2.2 and Wiring note 2. Part A went 42 → 37,
not 42 → 31.

**2 · §B3 said 5 categories show a gap. Only 4 do.**
*(Superseded by Revision 2 — the catalogue has grown since. It is now 10 missing,
9 of which show a gap. The reasoning below still holds; only the numbers moved.)*
This one was wrong in the first draft of this file. Five category records lack an
upload, but [getCategoryImage](src/lib/images.ts) checks a bundled
`CATEGORY_IMAGES` table by slug *before* falling back to CMS media, and
`chocolate-bars` is covered there — it renders art today. The corrected
breakdown, including two near-miss slugs fixable by renaming a key rather than
shooting anything, is in §B3.

---

## How to read this

**Slot** — the key in the page's `MEDIA` map (top of each page client), or the
inline call site where the slot is hard-coded.

**Placeholder** — the `label` string rendered inside the hatch today. This is
what a visitor sees in that box right now.

**Alt** — every **Part A** slot currently resolves to `alt=""`. Those `MEDIA`
entries carry only `{ src, label }` and are spread as `{...MEDIA.x}`, so
`ImagePlaceholder`'s `alt` default of `''` wins. **Shipping a real photo into a
Part A slot without also adding `alt` leaves it unlabelled to screen readers.**
The recommended string is in the table; `""` in that column means *intentionally
decorative* (a backdrop behind its own headline) and should stay empty.

Part B slots do not have this problem — they build `alt` from the record
(`cat.title`, `supplier.name`, `"{city}, {country}"`, `"{name}, {role}"`), so an
upload is labelled the moment it lands.

**Deliver** — pixel size to hand over, at 2x the widest CSS box on a 1920px
viewport. AVIF, sRGB, EXIF stripped. Under 300 KB full-bleed, under 150 KB per
card. Every slot uses `next/image` with `fill` + `object-cover`, so the **ratio**
is what matters — the container crops the rest.

---

# Part A — Static slots (37 files)

Declared as `src: null` in a page client's `MEDIA` map, or hard-coded `src={null}`
in JSX. These never change until a file lands in `public/images/`.

## Summary

| Page | Route | Client | Missing |
|---|---|---|---|
| Vendors | `/vendors` | [VendorsPageClient.tsx](src/components/sections/VendorsPageClient.tsx) | **8** — every slot on the page |
| About | `/about` | [AboutPageClient.tsx](src/components/sections/AboutPageClient.tsx) | **9** (2 editorial + 7 timeline) |
| Sustainability | `/sustainability` | [SustainabilityPageClient.tsx](src/components/sections/SustainabilityPageClient.tsx) | **6** |
| Sourcing | `/sourcing` | [SourcingPageClient.tsx](src/components/sections/SourcingPageClient.tsx) | **5** |
| Experiences | `/experiences` | [ExperiencePageClient.tsx](src/components/sections/ExperiencePageClient.tsx) | **4** |
| B2B | `/b2b` | [B2BSolutionsPageClient.tsx](src/components/sections/B2BSolutionsPageClient.tsx) | **2** |
| Retail | `/retail` | [RetailPageClient.tsx](src/components/sections/RetailPageClient.tsx) | **2** |
| Contact | `/contact` | [ContactPageClient.tsx](src/components/sections/ContactPageClient.tsx) | **1** |
| | | **Total** | **37** |

No **static** gaps on: home, categories, products, journal, recipes, brands,
policies, shipping, cart, checkout, account, login, register, forgot-password —
but several of those carry **CMS-backed** gaps instead. See Part B.

---

## 1 · Vendors — `/vendors`

The only page where **nothing** is shot. All 8 slots hatch, including the hero,
so the page reads as unfinished above the fold. Highest priority.

New folder: `public/images/vendors/`.

| # | Filename | Slot | Placeholder | Alt (recommended) | Ratio | Deliver | Tone | Renders at | Subject brief |
|---|---|---|---|---|---|---|---|---|---|
| 1 | `vendors-hero.avif` | `hero` | Vendors hero — 4:3 | Producers and buyers reviewing goods at a supplier site | 4:3 | 1800 × 1350 | dark | [1 · Hero, L281](src/components/sections/VendorsPageClient.tsx#L281) | Wide, cinematic supplier scene. Sits on obsidian — mid-to-dark exposure holds up best. |
| 2 | `vendors-producers.avif` | `producers` | Producers — 16:9 | Farm producer working a field crop | 16:9 | 1600 × 900 | light | [3 · Who we work with, L354](src/components/sections/VendorsPageClient.tsx#L354) | Primary agriculture — hands in soil, orchard, or smallholding. |
| 3 | `vendors-marine.avif` | `marine` | Fisheries & aquaculture — 16:9 | Fishing vessel and catch being landed at a working port | 16:9 | 1600 × 900 | light | [3 · Who we work with, L354](src/components/sections/VendorsPageClient.tsx#L354) | Boats, nets, or aquaculture pens. Working port, not tourist harbour. |
| 4 | `vendors-processors.avif` | `processors` | Processors — 16:9 | Food processing line in a production facility | 16:9 | 1600 × 900 | light | [3 · Who we work with, L354](src/components/sections/VendorsPageClient.tsx#L354) | Clean processing floor, stainless steel, staff in PPE. |
| 5 | `vendors-aggregators.avif` | `aggregators` | Aggregators & export — 16:9 | Palletised export cargo staged in a warehouse | 16:9 | 1600 × 900 | light | [3 · Who we work with, L354](src/components/sections/VendorsPageClient.tsx#L354) | Consolidation, pallets, export documentation feel. |
| 6 | `vendors-logistics.avif` | `logistics` | Cold chain & logistics — 16:9 | Refrigerated storage with palletised stock | 16:9 | 1600 × 900 | light | [3 · Who we work with, L354](src/components/sections/VendorsPageClient.tsx#L354) | Cold room, reefer container, or temperature-controlled dock. |
| 7 | `vendors-philosophy.avif` | `philosophy` | Partnership philosophy | `""` — decorative | wide band | 2560 × 1440 | dark | [7 · Philosophy, L496](src/components/sections/VendorsPageClient.tsx#L496) | Full-bleed backdrop behind a pull-quote; `glyph={false}` and an obsidian wash sit over it. Atmospheric and low-contrast — a busy frame fights the type. |
| 8 | `vendors-development.avif` | `development` | Supplier development | Buyer and supplier reviewing production standards together | fills height (approx 4:3) | 1600 × 1200 | light | [8 · Supplier development, L530](src/components/sections/VendorsPageClient.tsx#L530) | Column is `h-full min-h-55` — deliver tall enough to crop without softening. |

---

## 2 · About — `/about`

Two editorial gaps, plus the **timeline rail** (7 years), which is hard-coded to
`src={null}` in JSX rather than declared in `MEDIA` and so needs a code change as
well as files.

The founder portrait and the four team portraits **used to be here**. They are now
records in the `team` collection — see Part B, §B5.

Folder: `public/images/about/`.

### 2.1 · Editorial slots

| # | Filename | Slot | Placeholder | Alt (recommended) | Ratio | Deliver | Tone | Renders at | Subject brief |
|---|---|---|---|---|---|---|---|---|---|
| 1 | `about-apiary.avif` | `originB` | Apiary — 4:3 | Beekeeper tending hives at an apiary | 4:3 | 1200 × 900 | light | [2 · Origin, L259](src/components/sections/AboutPageClient.tsx#L259) | Ties to the founder quote about honey production. Hives, smoker, frames. |
| 2 | `about-harvest.avif` | `originC` | Harvest — 4:3 | Freshly harvested produce being sorted at origin | 4:3 | 1200 × 900 | light | [2 · Origin, L259](src/components/sections/AboutPageClient.tsx#L259) | Crates, sorting tables, hands at work. Pairs beside the apiary tile. |

### 2.2 · Timeline rail — 7 slots

Hard-coded at [AboutPageClient.tsx:466](src/components/sections/AboutPageClient.tsx#L466) as
`src={null}` inside `timeline.map(...)`. The `label` is bound to `item.year`, so
each card shows its year in the hatch today. To wire these up, add an `image`
field to the `timeline` array and pass `src={item.image}`.

Fixed size for all seven: **4:3, deliver 640 × 480**, light tone, `sizes="256px"`
(the rail is a fixed `w-56 md:w-64` horizontal scroller).

| # | Filename | Year | Placeholder | Alt (recommended) | Subject brief |
|---|---|---|---|---|---|
| 3 | `about-timeline-2020.avif` | 2020 | `2020` | Foundation, 2020 | Company origin — first workspace, first product, early sourcing. |
| 4 | `about-timeline-2021.avif` | 2021 | `2021` | Initial partnerships, 2021 | First supplier handshake, contract signing, early producer visit. |
| 5 | `about-timeline-2022.avif` | 2022 | `2022` | Network expansion, 2022 | Multiple origins — map, travel, a wider producer base. |
| 6 | `about-timeline-2023.avif` | 2023 | `2023` | Procurement framework, 2023 | Documentation, QC checklists, structured process. |
| 7 | `about-timeline-2024.avif` | 2024 | `2024` | Private label, 2024 | Own-label packaging, label proofs, branded cartons. |
| 8 | `about-timeline-2025.avif` | 2025 | `2025` | Distribution growth, 2025 | Logistics scale — loading, transit, warehouse. |
| 9 | `about-timeline-2026.avif` | 2026 | `2026` | International structure, 2026 | Multi-region operations, offices, forward-looking. |

### 2.3 · Team portraits — moved to the CMS

The founder portrait and the four team portraits are no longer static slots.
They are the `photo` field on five `team` records — upload them in the admin
panel. Sizes and briefs are in **Part B, §B5**.

---

## 3 · Sustainability — `/sustainability`

Folder: `public/images/sustainability/`.

Two of these are annotated in the code as *deliberately* empty — `resource` (the
only spare asset is an unrelated yellow texture) and `quote` (the only spare is a
24MP portrait that would cost a 3840px fetch for a decorative backdrop). They
still need real files; the comments explain why nothing was substituted meanwhile.

| # | Filename | Slot | Placeholder | Alt (recommended) | Ratio | Deliver | Tone | Renders at | Subject brief |
|---|---|---|---|---|---|---|---|---|---|
| 1 | `sustainability-environmental.avif` | `environmental` | Environmental — 4:3 | Farmland and crops under open sky | 4:3 | 1600 × 1200 | light | [2 · Priorities, L288](src/components/sections/SustainabilityPageClient.tsx#L288) | ESG priority card 01. Wide aerial of cultivated land. Carries a `01` chip top-left — keep that corner uncluttered. |
| 2 | `sustainability-social.avif` | `social` | Social — 4:3 | Producers at work in a harvest setting | 4:3 | 1600 × 1200 | light | [2 · Priorities, L288](src/components/sections/SustainabilityPageClient.tsx#L288) | ESG priority card 02. Hands at work, dignified labour. `02` chip top-left. |
| 3 | `sustainability-resource.avif` | `resource` | Resource efficiency — 16:9 | Drip irrigation running through a planted field | 16:9 | 1600 × 900 | light | [3 · Environmental focus, L324](src/components/sections/SustainabilityPageClient.tsx#L324) | Water, energy or waste — irrigation lines, solar, closed-loop packaging. |
| 4 | `sustainability-quote.avif` | `quote` | Quote backdrop | `""` — decorative | wide band | 2560 × 1440 | forest | [4 · Quote, L352](src/components/sections/SustainabilityPageClient.tsx#L352) | Full-bleed band under a `bg-forest-green/85` wash with `glyph={false}`. Landscape, low detail — quote type sits directly on it. |
| 5 | `sustainability-fair.avif` | `fair` | Fair & ethical practices — 16:9 | Workers in a safe, well-equipped production environment | 16:9 | 1920 × 1080 | light | [5 · Social responsibility, L385](src/components/sections/SustainabilityPageClient.tsx#L385) | Half of a 2-up diptych. PPE, proper equipment, daylight. |
| 6 | `sustainability-inclusive.avif` | `inclusive` | Inclusive supply chains — 16:9 | Small-scale producers at a cooperative market | 16:9 | 1920 × 1080 | light | [5 · Social responsibility, L385](src/components/sections/SustainabilityPageClient.tsx#L385) | Other half of the diptych — match its light and grade. |

---

## 4 · Sourcing — `/sourcing`

Folder: `public/images/sourcing/`.

| # | Filename | Slot | Placeholder | Alt (recommended) | Ratio | Deliver | Tone | Renders at | Subject brief |
|---|---|---|---|---|---|---|---|---|---|
| 1 | `sourcing-phased.avif` | `networkPhased` | Measured expansion — 16:9 | New sourcing region being assessed on site | 16:9 | 1600 × 900 | light | [3 · Network, L326](src/components/sections/SourcingPageClient.tsx#L326) | Third of a 3-up beside `sourcing-1.avif` (Direct) and `sourcing-agriculture.avif` (Strategic) — match those two in grade. |
| 2 | `sourcing-standards.avif` | `standards` | Quality verification — 4:5 | Product samples being inspected against quality standards | 3:4 tall | 1200 × 1600 | **dark** | [4 · Supplier standards, L358](src/components/sections/SourcingPageClient.tsx#L358) | Sticky column on an **obsidian** section, `h-full min-h-55` — deliver tall. QC bench, callipers, sample trays. |
| 3 | `sourcing-environmental.avif` | `environmental` | Environmental responsibility — 16:9 | Sustainable cultivation on a partner farm | 16:9 | 1920 × 1080 | light | [5 · Commitments, L405](src/components/sections/SourcingPageClient.tsx#L405) | Half of a 2-up diptych. Must differ from the Sustainability page's environmental frame — do not reuse the same shot. |
| 4 | `sourcing-social.avif` | `social` | Social impact — 16:9 | Cooperative members at work in a producer community | 16:9 | 1920 × 1080 | light | [5 · Commitments, L405](src/components/sections/SourcingPageClient.tsx#L405) | Other half of the diptych. |
| 5 | `sourcing-partnership.avif` | `partnership` | Supplier partnership — 4:3 | Buyer and producer inspecting harvest together | fills height (approx 4:3) | 1600 × 1200 | light | [7 · Partnerships, L486](src/components/sections/SourcingPageClient.tsx#L486) | `h-full min-h-55` column. Two people, collaborative not transactional — that is the section's whole argument. |

---

## 5 · Experiences — `/experiences`

Folder: `public/images/experience/` (singular — matches the existing files).

Mismatch worth fixing while you are in there: `originA` and `originB` carry
labels ending "— 4:3" but the render site passes `ratio="4/5"`. **Shoot and
deliver 4:5**; the labels are stale.

| # | Filename | Slot | Placeholder | Alt (recommended) | Ratio | Deliver | Tone | Renders at | Subject brief |
|---|---|---|---|---|---|---|---|---|---|
| 1 | `experience-cultivation.avif` | `originA` | Cultivation — 4:3 *(label stale)* | Crops under cultivation on a partner farm | **4:5** | 1200 × 1500 | light | [2 · At the source, L151](src/components/sections/ExperiencePageClient.tsx#L151) | Left half of a 2-up portrait pair. Growing, not harvested. |
| 2 | `experience-harvest.avif` | `originB` | Harvest — 4:3 *(label stale)* | Harvest being gathered at origin | **4:5** | 1200 × 1500 | light | [2 · At the source, L159](src/components/sections/ExperiencePageClient.tsx#L159) | Right half of the pair — same lens and grade as `originA`. |
| 3 | `experience-vineyard.avif` | `specialty` | Vineyards & estates — 16:9 | Estate vineyard in production | 16:9 | 1600 × 900 | light | [3 · Rest of the chain, L198](src/components/sections/ExperiencePageClient.tsx#L198) | Card `02 · Specialty`. Vine rows, estate buildings, terroir. |
| 4 | `experience-processing.avif` | `processing` | Processing & cold chain — 16:9 | Cold chain handling in a processing facility | 16:9 | 1600 × 900 | light | [3 · Rest of the chain, L198](src/components/sections/ExperiencePageClient.tsx#L198) | Card `03 · Handling`. Cold room or QC station — product integrity in transit. |

---

## 6 · B2B — `/b2b`

Folder: `public/images/b2b/` (existing files use the `commercial-` prefix).

| # | Filename | Slot | Placeholder | Alt (recommended) | Ratio | Deliver | Tone | Renders at | Subject brief |
|---|---|---|---|---|---|---|---|---|---|
| 1 | `commercial-quality.avif` | `quality` | Quality verification | Product batch being checked against compliance specifications | 3:4 tall | 1200 × 1600 | light | [6 · Quality & compliance, L436](src/components/sections/B2BSolutionsPageClient.tsx#L436) | `h-full min-h-55` column — deliver tall. Documentation, certificates, lab or QC bench. |
| 2 | `commercial-contract.avif` | `customisation` | Contract supply — 16:9 | Private label packaging prepared for a contract order | fills height (approx 4:3) | 1600 × 1200 | light | [7 · Customisation, L479](src/components/sections/B2BSolutionsPageClient.tsx#L479) | `h-full min-h-55`, so despite the "16:9" label deliver closer to 4:3. Own-label cartons, spec sheets, bulk formats. |

---

## 7 · Retail — `/retail`

Folder: `public/images/retail/`.

Both sit in a 3-up beside `retail-softdrinks.avif` (Local assortment) — match
that tile's grade so the row reads as one set.

| # | Filename | Slot | Placeholder | Alt (recommended) | Ratio | Deliver | Tone | Renders at | Subject brief |
|---|---|---|---|---|---|---|---|---|---|
| 1 | `retail-mature-markets.avif` | `regionMature` | Mature markets — 16:9 | Modern trade supermarket aisle in an established market | 16:9 | 1600 × 900 | light | [8 · Geographic reach, L519](src/components/sections/RetailPageClient.tsx#L519) | Card "Established" — organised modern-trade chain or specialty retailer. |
| 2 | `retail-growth-markets.avif` | `regionGrowth` | Growth markets — 16:9 | Retail store in an emerging growth market | 16:9 | 1600 × 900 | light | [8 · Geographic reach, L519](src/components/sections/RetailPageClient.tsx#L519) | Card "Emerging" — newer-format retail, visibly a different market from tile 1. |

---

## 8 · Contact — `/contact`

Folder: `public/images/contact/`.

| # | Filename | Slot | Placeholder | Alt (recommended) | Ratio | Deliver | Tone | Renders at | Subject brief |
|---|---|---|---|---|---|---|---|---|---|
| 1 | `contact-regions.avif` | `locations` | Operating regions | `""` — decorative | wide band | 2560 × 1440 | dark | [5 · Locations, L714](src/components/sections/ContactPageClient.tsx#L714) | Fallback band shown when no office records exist. `glyph={false}` with an obsidian gradient over it and a 4-up region grid on top — keep it dark and uncluttered so the region labels stay readable. |

**This slot is showing right now.** It is the `else` branch of
`offices.length > 0`, and there are zero office records in the database — so the
band is on screen *and* empty. Creating office records (Part B, §B1) replaces it
with the office grid entirely, which may be the better fix than shooting for it.

---

# Part B — CMS-backed slots (22 records)

These slots are **finished in code**. They read an upload off a Payload record and
show a placeholder when the field is empty — so the fix is uploading in the admin
panel, not adding files to the repo. Counts below are a live query against the
database on **6 September 2026**.

**Where 22 comes from** — only the records that leave a visible gap:
5 banners + 5 team portraits + 9 categories + 3 supplier logos. The other empty
fields in the table below either fall back to bundled artwork or are never
rendered, and are listed so nobody re-audits them. The missing
`office-locations` records are counted separately: there are none at all, so
there is no record to attach an image to yet.

## Summary

| Collection · field | Missing | Renders as | Visible? |
|---|---|---|---|
| `office-locations` · `image` | **no rows at all** (0 records) | see below — the whole section is affected | **Yes — worst of the set** |
| `banners` · `image` | 5 / 5 | Flat colour bar, no photography | **Yes** |
| `team` · `photo` | 5 / 5 | Hatched placeholder, labelled with the person's name | **Yes** |
| `categories` · `image` | 10 / 25, of which **9** show a gap | Flat charcoal tile / gradient hero | **Yes — 9 of them** |
| `suppliers` · `logo` | 3 / 3 | Monogram initial in a bordered box | **Yes** |
| `blog-posts` · `featuredImage` | 0 / 0 (no posts yet) | "Article image" hatch | Only once posts exist |
| `brands` · `logo` | 12 / 12 | 5 fall back to bundled art; 7 are hidden | **No** — but see §B6 |
| `regions` · `image` | 7 / 7 | — falls back to bundled art | **No** — but see [Image reuse](#image-reuse--which-files-do-double-duty) |
| `testimonials` · `image` | 5 / 5 | — field is never rendered | **No** |
| `products` · `images` | 0 / 256 | — all products have gallery art | **No** |

## B1 · Office locations — affects **Contact** and **About**

**There are zero `office-locations` records in the database.** This is the gap you
spotted on Contact, and it is not one missing image but a missing section:

| Page | Render site | What happens with 0 records |
|---|---|---|
| Contact | [ContactPageClient.tsx:659](src/components/sections/ContactPageClient.tsx#L659) | The office-card grid is skipped and the page falls through to the `MEDIA.locations` band — **which is itself an empty slot** (Part A, §8). So Contact currently shows a hatched box where the offices should be, *and* the office picker in the B2B form has no options to select. |
| About | [AboutPageClient.tsx:548](src/components/sections/AboutPageClient.tsx#L548) | The entire "Global presence / Our offices" section is guarded by `offices.length > 0` and **does not render at all**. |

Once records are created, each card needs an upload on the `image` field. The slot
is already wired with a real `alt` (`"{city}, {country}"`) and falls back to a hatch
labelled with the city name.

| Field | Value |
|---|---|
| Collection | `office-locations` → `image` (upload → media) |
| Ratio | 4:3 |
| Deliver | 1200 × 900 |
| Tone | light |
| `sizes` | `(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 24vw` |
| Placeholder | The office's `city` value |
| Alt | Already handled in code — `"{city}, {country}"` |
| Subject | Exterior or interior of the actual office. Consistent framing across all locations; they render as a 4-up row. |

> To be precise about wording: **neither Contact nor About has a "team" grid apart
> from the one on About (Part A, §2.3).** The people-shaped cards on Contact are
> these office locations. Contact's one team-flavoured image, `formAside`
> ("Team at work"), already has a file behind it.

## B2 · Banners — affects **home**

All 5 banner records lack an image. [PromoBanner.tsx](src/components/sections/home/PromoBanner.tsx)
renders a solid `SURFACE[theme]` colour instead of photography, and switches its
whole text palette on `hasImage` — so these currently read as flat colour bars.

| # | Record | Deliver | Notes |
|---|---|---|---|
| 1 | Authentic gourmet, sourced direct from origin | 2560 × 1440 | Full-bleed hero banner; text overlays it. |
| 2 | Halal Range | 2560 × 1440 | |
| 3 | Under AED 50 | 2560 × 1440 | |
| 4 | The Italian Pantry | 2560 × 1440 | |
| 5 | Pricing for restaurants and retailers | 2560 × 1440 | |

Uses `sizes="100vw"` and gets a `bg-obsidian/70` wash on the `strip` variant —
deliver dark-tolerant, low-detail frames. Note the `strip` variant is a slim text
bar, so an image there is optional by design.

## B3 · Categories — affects **home**, **/categories**, **/categories/[slug]**

10 of 25 categories have no upload, but **only 9 actually show a gap**.
[getCategoryImage](src/lib/images.ts) checks a bundled `CATEGORY_IMAGES` table by
slug before falling back to CMS media, and one of the ten is covered there.

| # | Category | Slug | Parent | Bundled art? | Shows a gap? |
|---|---|---|---|---|---|
| 1 | Flours | `flours` | — | no (the table has `flour-baking`) | **Yes** |
| 2 | Merchandise | `merchandise` | — | no | **Yes** |
| 3 | Mexican Pantry | `mexican-pantry` | — | no | **Yes** |
| 4 | Chocolate Boxes | `chocolate-boxes` | Grand Cru Cocoa | no (the table has `chocolate-boxes-bonbons`) | **Yes** |
| 5 | Teddy Bear | `teddy-bear` | Grand Cru Cocoa | no (the table has `teddy-bears`, plural) | **Yes** |
| 6 | Chilis | `chilis` | Mexican Pantry | no | **Yes** |
| 7 | Mexican Candy | `mexican-candy` | Mexican Pantry | no | **Yes** |
| 8 | Mexican Sauces | `mexican-sauces` | Mexican Pantry | no | **Yes** |
| 9 | Pantry Staples | `pantry-staples` | Mexican Pantry | no | **Yes** |
| 10 | Chocolate Bars | `chocolate-bars` | Grand Cru Cocoa | **yes** → `coco.avif` | No |

### The bundled table has drifted from the catalogue

`CATEGORY_IMAGES` holds **26 keys, 10 of which match no category that exists**,
while **9 real categories have no key**. The two lists nearly touch in three
places, so a rename closes the gap with no photography at all:

| Dead key in the table | Real category with no art | Fix |
|---|---|---|
| `chocolate-boxes-bonbons` | `chocolate-boxes` | rename the key |
| `teddy-bears` | `teddy-bear` | rename the key |
| `flour-baking`, `caputo-flour-baking` | `flours` | rename one, drop the other — **confirm the intent first**, `breads.avif` may not suit a flour department |

The remaining 7 dead keys — `caviar`, `caviar-gift-sets`, `caviar-accessories`,
`chocolate`, `chocolate-truffles`, `velterra-collection` — are leftovers from a
sub-category tree that was never built. They cost nothing but are dead weight;
delete them when convenient.

That leaves **6 categories genuinely needing artwork**: `merchandise`,
`mexican-pantry`, `chilis`, `mexican-candy`, `mexican-sauces`, `pantry-staples`.

Affected surfaces for a real gap: [CategoryTiles](src/components/sections/home/CategoryTiles.tsx#L31),
[FeaturedCategories](src/components/sections/home/FeaturedCategories.tsx#L30),
[CategoryCards](src/components/sections/CategoryCards.tsx#L95),
[/categories](src/app/(frontend)/categories/page.tsx#L91) and the
[category hero](src/components/sections/CategoryPageClient.tsx#L41). They render as a
flat charcoal tile in the grids and a `from-forest to-obsidian` gradient on the hero.

Deliver **1200 × 1800 (2:3)** — `CategoryCards` uses the tallest crop
(`aspect-2/3`), and the square and hero crops both take from it. `alt` is already
bound to `cat.title` at every site.

## B4 · Supplier logos — affects **/brands**

All 3 supplier records lack a `logo`. [BrandsPageClient.tsx:350](src/components/sections/BrandsPageClient.tsx#L350)
falls back to a monogram initial in a bordered box.

| # | Supplier | Deliver |
|---|---|---|
| 1 | Admiral Caviar | ~800 × 400, transparent PNG or SVG |
| 2 | Velsoro Chocolate | same |
| 3 | Caputo | same |

Rendered `object-contain` in a white box at `h-16 md:h-18`, so supply a
transparent-background mark with its own padding. `alt` is bound to `supplier.name`.

Note the logo strip higher up the same page uses the five **static** files in
`public/images/partner-logo/` — those are fine and unrelated to this gap.

## B5 · Team portraits — affects **/about**

The five people in "Our people" are now `team` records. None has a `photo`, so
every card shows the hatched placeholder — labelled with the person's name rather
than the old generic `"Portrait"`.

`alt` is generated in code: `"{name}, {role}"`, or just the role for a vacancy,
since there is no person in that frame to name.

| # | Record | Role | Card | Ratio | Deliver | Subject brief |
|---|---|---|---|---|---|---|
| 1 | Nabila Mellaz | Founder & CEO | Founder (wide, with quote) | 4:5 | 1200 × 1500 | Renders in a narrow 2-of-5 column — frame with headroom so the crop is safe. |
| 2 | Muzn Salih | Sales Director | Grid | 1:1 | 800 × 800 | Square headshot; keep lighting consistent across all four grid cards. |
| 3 | Raj Ganesh | Business Development | Grid | 1:1 | 800 × 800 | Same treatment as above. |
| 4 | *(vacancy)* | Head of Sourcing | Grid | 1:1 | 800 × 800 | **Open role** — the card reads "Open role". Leave the placeholder until it is filled. |
| 5 | *(vacancy)* | Creative Director | Grid | 1:1 | 800 × 800 | **Open role** — same as above. |

Adding, removing or reordering people is admin-panel work now: `sortOrder` sets
the order, `active` hides someone without deleting them, and a row with a `role`
but no `name` publishes a vacancy. Checking **Show as founder** moves a person
into the wide card and reveals the `quote` field. With no rows at all, the whole
section hides — the same behaviour as the office section.

## B6 · Brand marks — affects **home** and **/brands**

The two logo strips now read the `brands` collection through
[resolveBrandMarks](src/lib/brand-marks.ts). Nothing is *broken* on screen: 5 of
the 12 brands fall back to bundled artwork in `public/images/partner-logo/`,
which is the same 5 marks that were hard-coded before. **No brand has an
uploaded logo — all 12 `logo` fields are empty.**

| Brand | Slug | Mark today | On upload |
|---|---|---|---|
| Admiral Caviar | `admiral-caviar` | bundled `admiral.webp` | upload wins |
| Caputo | `caputo` | bundled `caputo.avif` | upload wins |
| Cebon | `cebon` | bundled `cebon.png` | upload wins |
| García de la Cruz | `garcia-de-la-cruz` | bundled `garcia.webp` | upload wins |
| Velsoro | `velsoro` | bundled `velsoro.avif` | upload wins |
| Castello | `castello` | **none — hidden** | appears in the strip |
| Intermex | `intermex` | **none — hidden** | appears in the strip |
| Kolios | `kolios` | **none — hidden** | appears in the strip |
| La Costeña | `la-costena` | **none — hidden** | appears in the strip |
| La Meridana | `la-meridana` | **none — hidden** | appears in the strip |
| Olympus | `olympus` | **none — hidden** | appears in the strip |
| Sterilgarda | `sterilgarda` | **none — hidden** | appears in the strip |

A brand with neither an upload nor bundled art is dropped rather than rendered as
an empty cell, so those **seven are simply absent** — not broken, but not
represented either. This is a silent omission rather than a visible gap, which is
why it sits outside the count of 22.

Uploading a logo to any of them adds it to both strips, though the strips cap at
5 (the homepage row is 5 across; the /brands marque board reserves its 6th cell
for the masthead), so a 6th logo needs that cap raised. **With 12 brands and a
cap of 5, most of the catalogue's brands cannot appear on either strip regardless
of uploads** — worth deciding whether the strips should page, scroll, or stay a
curated five.

Deliver logos as **transparent PNG or SVG, roughly 800 × 400**, with their own
padding — they render `object-contain` in a fixed box.

## B7 · No action needed

Recorded so nobody re-audits them:

- **`regions` · `image` — 7/7 empty, but invisible.** [resolveRegions](src/lib/regions.ts#L123)
  merges CMS rows over a bundled table and falls back to `base?.image`, so all
  seven region cards already show art from `public/images/`. Uploading is
  optional — but **every one of those seven files is borrowed from somewhere
  else on the site**, so this is the one "no action needed" entry with a real
  editorial cost. See [Image reuse](#image-reuse--which-files-do-double-duty).
- **`testimonials` · `image` — 5/5 empty, never rendered.** `TestimonialStrip`
  does not read the field. Uploading here changes nothing until the component is
  rewired.
- **`products` — 0/256 missing.** Every product has gallery art (621 media rows
  in total).
- **`blog-posts` — 0 records.** The journal is empty; the `featuredImage` slot is
  wired and will hatch with "Article image" once posts are written.

---

## Image reuse — which files do double duty

Separate from "missing". These slots are **full**, but the file behind them is
also behind something else. 22 of the 59 files in `public/images/` are referenced
from more than one place. Most of that is harmless; some of it is the same
photograph carrying two different meanings on the same page.

### Regions borrow all seven of their images

Not one region has its own photograph. [REGIONS](src/lib/regions.ts#L36) is a
bundled presentation table, and every `image` in it points at a file that already
belongs to a category tile or an editorial page.

| Region | Bundled image | Also used as |
|---|---|---|
| Europe | `collections/olives.avif` | `mediterranean-olive-reserve` category tile, Recipes |
| Middle East | `collections/spices.avif` | `single-origin-spices` category tile, Recipes |
| Africa | `sourcing/sourcing-agriculture.avif` | Sourcing §3 `networkStrategic`, Brands page |
| Latin America | `collections/coffee.avif` | `specialty-coffee-reserve` category tile |
| North America | `collections/pantry.avif` | `truffle-treasury` tile, nav, Recipes |
| Asia | `collections/seeds.avif` | `botanical-seed-selection` category tile |
| Oceania | `collections/honey.avif` | `rare-estate-honey` category tile |

**Why it matters.** Region cards and category cards appear on the same surfaces —
the homepage, `/categories`, the shop facets. A visitor can see one photograph
labelled *Europe* in one row and *Mediterranean Olive Reserve* in the next. The
association is also loose in places: Africa gets a generic agriculture frame,
North America gets the truffle/pantry shot, Asia gets seeds.

This is deliberate — the comment at the top of `regions.ts` says the table exists
so "the storefront looks finished before anything is authored". It is working as
designed. But it means **7 region uploads are the cheapest editorial win
available**: no code change, no new slot, and each one breaks a duplicate.

### Everything else shared, for reference

| File | Uses | Where |
|---|---|---|
| `collections/coco.avif` | 5 | 5 chocolate slugs in `CATEGORY_IMAGES` (4 of them dead keys) |
| `collections/pantry.avif` | 5 | 2 category slugs, `nav.ts`, regions, Recipes |
| `collections/breads.avif` | 4 | 3 category slugs, Recipes |
| `collections/caviar.avif` | 4 | 3 category slugs, Recipes |
| `logo/logo.svg` | 4 | layout, Header, Footer, MobileDrawer — correct, it is the masthead |
| `sourcing/sourcing-farmer.avif` | 4 | Sourcing hero, HomeHero, **forgot-password**, **reset-password** |
| `b2b/commercial-resturant.avif` | 3 | B2B `horeca`, HomeSidebar, `nav.ts` |
| `collections/oils.avif` | 3 | category tile, HomeHero, Recipes |
| `collections/olives.avif` | 3 | category tile, regions, Recipes |
| `collections/spices.avif` | 3 | category tile, regions, Recipes |
| `experience/experience-dish.avif` | 3 | Experience page, home carousel, Recipes |
| `sourcing/sourcing-agriculture.avif` | 3 | Sourcing, Brands, regions |
| `about/about-cover.avif` | 2 | About manifesto, HomeHero |
| `about/about-customer.avif` | 2 | About `originA`, **register page** |
| `about/about-retail.avif` | 2 | About `reach`, **login page** |
| `collections/coffee.avif` | 2 | category tile, regions |
| `collections/cutlery.avif` | 2 | 2 category slugs |
| `collections/honey.avif` | 2 | category tile, regions |
| `collections/seeds.avif` | 2 | category tile, regions |
| `collections/spreads.avif` | 2 | 2 category slugs |
| `experience/experience-chef.avif` | 2 | Experience page, home carousel |
| `experience/experience-experts.avif` | 2 | Experience page, home carousel |

**Worth a look, in rough priority:**

1. **The 7 region images** — above. The only reuse a visitor can catch on a
   single screen.
2. **`sourcing-farmer.avif` on four surfaces**, two of which are the auth pages.
   The homepage hero and the Sourcing hero being the same frame is the visible
   one: a visitor landing on home and then clicking through to Sourcing sees the
   identical picture twice.
3. **`about-customer.avif` / `about-retail.avif` on the auth pages.** Register
   and login reuse About's editorial frames. Low stakes — different journeys,
   unlikely to be seen back to back.
4. **The Experience trio on both the page and the home carousel.** Same three
   frames in both places; the carousel is a teaser for the page, so this reads as
   intentional.
5. **Category slugs sharing one file** (`coco.avif` across chocolate,
   `breads.avif` across breads and flours, `caviar.avif` across caviar). Sibling
   categories under one parent showing the same tile is defensible; four
   *chocolate* keys pointing at one cocoa shot is the weakest case, though 4 of
   those 5 keys are dead anyway.

Nothing here is a bug. It is recorded so that a future "why does this photo look
familiar" question has an answer, and so region uploads can be prioritised for
what they actually buy.

---

## Editability — what can be changed without a deploy

| Surface | Source | Editable in admin? |
|---|---|---|
| About — "Our people" (founder + team) | `team` collection | **Yes** |
| About / Contact — office cards | `office-locations` | **Yes** (no rows yet) |
| Home + /brands — logo strips | `brands` collection, bundled art as fallback | **Yes** |
| /brands — supplier rows | `suppliers` collection | **Yes** |
| Home — promo banners | `banners` | **Yes** |
| Category and region cards | `categories`, `regions` | **Yes** |
| About — timeline rail (7 years) | hard-coded `timeline` array | **No** — code change |
| Every Part A slot | page-client `MEDIA` maps | **No** — code change |

---

## Suggested order of work

1. **Create the `office-locations` records** (B1). Zero-cost in the admin panel,
   and it fixes a hatched box on Contact, an entire missing section on About, and
   an empty dropdown in the B2B inquiry form.
2. **Shoot the Vendors page** (A§1). Eight slots, hero included — the only page
   with nothing at all behind it.
3. **Rename two `CATEGORY_IMAGES` keys** (B3) — `chocolate-boxes` and
   `teddy-bear` are near-miss slugs, so two of the nine category gaps close with
   a one-line edit and no photography. Check `flour-baking` → `flours` while you
   are there.
4. **Point `MEDIA.hero` on Vendors at `misc/become-a-vendor.avif`.** The file is
   already in the repo and referenced by nothing; it was orphaned when
   `BecomeVendorCTA.tsx` was removed. Gets the worst page off a hatched hero
   before the shoot happens.
5. **Upload the 5 banner images and the 6 remaining category images** (B2, B3).
   Admin-panel work, visible on the home page.
6. **Team portraits** (B5). Admin-panel work now — 5 uploads.
7. **Region images** (B7 / Image reuse). 7 uploads, no code change; each one
   breaks a duplicate with a category tile.
8. **About timeline rail** (A§2.2). Still needs the code change below.
9. Everything else in Part A, page by page.

---

## Wiring notes

These apply to **Part A only** — Part B needs no code changes.

**Adding a file is not enough for two of these.** The timeline rail and the `alt`
handling need small code changes:

1. **`alt` is empty on every editorial slot.** `MEDIA` entries are
   `{ src, label }` and are spread as `{...MEDIA.x}`, so
   [ImagePlaceholder](src/components/ui/ImagePlaceholder.tsx)'s `alt = ''`
   default applies. Add `alt` to each `MEDIA` entry (widening the
   `satisfies Record<...>` type to
   `{ src: string | null; label: string; alt?: string }`), or pass `alt=` at the
   call site. Decorative backdrops keep `alt=""`.
   *The team and founder cards no longer have this problem — they build `alt`
   from the record's name and role.*
2. **About timeline** — [AboutPageClient.tsx](src/components/sections/AboutPageClient.tsx)
   still has a literal `src={null}` inside `timeline.map(...)`. Add `image` to
   the `timeline` array and pass `src={item.image}`. This is the last hard-coded
   `src={null}` on the page.

**Unused assets already on disk.** Five files in `public/` that nothing in `src/`
references, in TSX or CSS — about **12.9 MB** in total. Worth checking before
commissioning new work, in case one fits a slot above:

| File | Size | Note |
|---|---|---|
| `public/images/misc/become-a-vendor.avif` | 385 KB | Orphaned when `BecomeVendorCTA.tsx` was removed. **Candidate for `vendors-hero.avif`** — see step 4 above. |
| `public/images/misc/newsletter-leaves.png` | **9.98 MB** | Unreferenced. By far the largest asset in the repo; delete or compress. |
| `public/images/misc/newsletter.avif` | 1.58 MB | Unreferenced. |
| `public/images/policy/policy.avif` | 227 KB | Unreferenced (`policy-cover.avif` is the one in use). |
| `public/images/sustainability/sustainability-misc.avif` | 732 KB | Abstract yellow texture — the code comment rules it out for the `resource` slot. |

`public/videos/chef-hero.mp4` was listed here in Revision 1 and has since been
deleted (commit `9551469`); `public/videos/` no longer exists.
