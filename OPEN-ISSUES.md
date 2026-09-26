# Open Issues — Delicious Planet

First audit 2026-09-23. **Re-verified 2026-09-25** against the live database, R2,
DNS, the supplier feeds and the test suites.

Nothing on the site is broken. All 1,814 media files in R2 load, and every static
image path in the code exists in `public/`. What remains is supplier data that has
drifted since import, setup that was never finished, content that was never added,
and tooling debt.

---

## 1. Urgent

### 1.1 Intermex prices have changed since import
The catalogue copied Intermex's AED prices on 2026-09-05, and they matched
exactly at the time. Intermex has since changed prices on **31 of our 174**
products. Each of these has a single variant on both sides, so the differences
are real.

**Check what the listing is before copying a price across.** The largest
difference, banderilla (3.50 with us, 62.00 at Intermex), is *not* underpricing.
Our product is a single stick (`banderilla-tamaroca-tamarind-mexican-stick-1pcs`),
which was correct at 3.50 when imported. Intermex has since turned that same
listing into a 30-stick case ("CA 0026 Banderilla…", about 2.07 per stick).
Intermex has also added internal codes such as "SA 0020" to every title, so
they appear to have reworked their whole catalogue recently.

Largest real gaps:

| Product | Ours (AED) | Intermex (AED) |
|---|---|---|
| `nachos-jalapeno-2-8kg-costena` | 40.00 | 55.00 |
| `whole-green-tomatillo-2-8kg-san-marco` | 39.00 | 49.00 |
| `clemente-jacques-chipotle-peppers-in-adobo` | 59.00 | 69.00 |
| `la-costena-salsa-verde` | 6.00 | 12.00 |
| `la-conspiracion-chicharron-de-mezcla-de-chiles-secos` | 33.50 | 24.00 |
| `flour-tortillas-intermex-copy` | 22.00 | 19.00 |

The rest differ by 0.05 to 2 AED. Some are now higher at Intermex and some lower.
- **Decide:** should our prices follow Intermex's, or are they set independently?
  For the full current list, run `pnpm check:suppliers` (read-only).

### 1.2 Email SPF record doesn't include Google
- **Current record:** `v=spf1 include:spf.efwd.registrar-servers.com ~all`
- **Problem:** mail for `deliciousplanet.co` is sent through Google Workspace, but
  the SPF record only lists Namecheap forwarding. Every order confirmation fails
  SPF, which pushes it towards spam.
- **Fix (Namecheap DNS):**
  `v=spf1 include:_spf.google.com include:spf.efwd.registrar-servers.com ~all`
  Keep the `registrar-servers` include, because email forwarding still depends on it.
- **Verify:** `nslookup -type=TXT deliciousplanet.co 8.8.8.8`

### 1.3 No DMARC record
- `_dmarc.deliciousplanet.co` does not exist.
- **Fix:** add a TXT record at `_dmarc` with
  `v=DMARC1; p=none; rua=mailto:<reporting address>`. This only monitors at
  first; tighten it to `quarantine` once the reports look clean.

### 1.4 `master` is behind what's live
- `feat/stripe-checkout` is 22 commits ahead of `master` and `origin/master`.
  Those commits cover Stripe checkout, R2 media, SEO, security headers, the
  partner portal, the fulfilment console, transactional email and the admin
  sidebar.
- **Fix:** open a PR from `feat/stripe-checkout` into `master` and merge it, so
  `master` matches production.

---

## 2. Stock that doesn't match the supplier

"In stock" is set when a product is imported and isn't updated after that.

**Shown as in stock, but sold out at the supplier.** Customers can order these,
and the orders may not be fillable:
- Intermex: `la-costena-green-salsa`, `la-conspiracion-salsa-mojito-verde`,
  `rancheritos-original`, `marinela-barritas-pineapple`,
  `rice-morelo-1kg-valle-verde`, `dona-maria-mole-paste`, `ruffles-cheese`
- Caputo: `caputo-00-baking-flour`, `caputo-00-pasta-fresca-flour`

**Shown as out of stock, but available at the supplier:**
- Intermex: `queso-cotija-excelsior-mexican-aged-cheese`

**Still on sale with us, but removed from Intermex's store:**
- `corn-tortilla-6inch-intermex-500gm` (Intermex handle `intermex-corn-tortilla`).
  It is published and shown as in stock. Check with Intermex whether it has been
  discontinued.

**Fix ready, not yet applied.** `pnpm fix:catalogue-2026-09-25` corrects all 10
stock flags. It also sets the 4 category images (section 4) and deletes orphaned
media 844/845. Run it with `--dry-run` first to preview. It goes through
Payload, so the product-level `inStock` and version history update correctly,
and running it twice changes nothing. It hasn't been run because writing to the
live database needs your go-ahead.

There is no automatic stock sync, so this will keep drifting. Run
`pnpm check:suppliers` (read-only) to see the current differences for Intermex,
Velsoro, Caputo and García de la Cruz.

---

## 3. Catalogue gaps

### 3.1 Intermex: 29 products in their feed but not on our site
Their live feed has 202 products and we carry 174. The difference:

- **24 left over from the interrupted import.** The 2026-09-05 run stopped at
  `el-yucateco-habanero-y-pina-asada-hot-sauce`. That product and the 23 after
  it in the feed were never imported. **Fix:** add them by hand in the admin.
  Don't re-run the importer, because it would rewrite all 174 existing products.
- **1 excluded on purpose:** `la-costena-guacamole-salsa` is still priced 0.00
  in Intermex's feed. Ask Intermex to correct it; don't import it at 0.00.
- **4 added by Intermex since the import:**
  - `chihuahua-cheese-500g` (67.00)
  - `san-marcos-chipotle-peppers-in-adobo-sauce` (65.00)
  - `chipotle-sauce-220ml-la-costena-copy` (15.00). Probably a duplicate
    listing on their side, so check before adding.
  - `nixtamalized-omalli-corn-flour-1kg` (27.00). **Their listing has no
    images**, so it can't be added until they supply some.

### 3.2 Other suppliers
| Supplier | Prices | Stock | Products |
|---|---|---|---|
| Velsoro | All match | All match | We carry 30 of 33. The 3 missing (`berry-bloom`, `espresso-eclipse`, `citrus-ember`) are outside the collection we import from, so decide whether to add them. |
| Caputo | All match | 2 sold out (section 2) | All 14 carried |
| García de la Cruz | All match | All match | We carry 17 of 27. The other 10 are bundles, gift sets and a spray, all outside the olives, oils and vinegars collections we import. This is deliberate. |
| Casinetto | Not checked (their feed returns 403) | Not checked | 10 carried |
| Admiral Caviar | Not checked (imported by scraping, no feed) | Not checked | 11 carried |

### 3.3 Four media files nothing uses
Media IDs 844, 845 (`la-costena-guacamole-salsa`), 891 and 892
(`el-yucateco-habanero-y-pina-asada-hot-sauce`). Reuse 891/892 when that product
is added by hand (3.1). `pnpm fix:catalogue-2026-09-25` deletes 844/845.

### 3.4 40 low-resolution product images
40 images are narrower than 800px (38 WebP, 2 PNG), so Payload didn't create a
`card` size and the site shows the original. They display correctly but may look
soft on product cards. Replace them with larger files when possible.

### 3.5 One draft product
`e-gift-card` (Caputo) is the only draft; the other 255 are published. It's
probably drafted on purpose, since a gift card needs its own checkout handling.
Confirm that.

---

## 4. Missing images: admin content

All of these can be added in the Payload admin. No code changes are needed.

| Collection | Missing | Where it shows | What visitors see now |
|---|---|---|---|
| Categories | 10 of 25 | `/categories` tiles, category page hero | Dark gradient tile, no photo |
| Team | 5 of 5 photos | About page | Grey placeholder boxes |
| Banners | 5 of 5 | Homepage promo banners | Plain colour background |
| Suppliers | 3 of 3 logos | `/brands` supplier list | No logo |

`pnpm fix:catalogue-2026-09-25` sets product photos, chosen by eye from in-stock
products, on the four largest: `pantry-staples` (Nopal Foods jar),
`mexican-sauces` (La Meridana hot sauce basket), `mexican-candy` (Tomy candies)
and `chocolate-bars` (Velsoro ruby pistachio bar). These are stand-ins until
there is proper category art.

Also check the category filing: most of what's in `mexican-candy` is chips and
chicharrón (Ruffles, Churritos, Chicharron, Tortilla Chips), not candy.

### Categories with no image (largest first)

| Category | Type | Products |
|---|---|---|
| `pantry-staples` | leaf | 72 |
| `mexican-sauces` | leaf | 40 |
| `mexican-candy` | leaf | 24 |
| `chocolate-bars` | leaf | 18 |
| `chilis` | leaf | 10 |
| `flours` | department | 7 |
| `merchandise` | department | 7 |
| `chocolate-boxes` | leaf | 7 |
| `teddy-bear` | leaf | 5 |
| `mexican-pantry` | department | 0 (consider deleting) |

**Not an issue (corrected from the first audit):**
- **Product SEO images:** none of the 256 are set, but link previews fall back to
  the product's main photo (`src/app/(frontend)/products/[slug]/page.tsx:49-52`).
- **Testimonial, region and brand images:** all empty, but the site never
  displays these fields. Filling them in would change nothing.

---

## 5. Missing images: static page placeholders

Each static page declares its images in a `MEDIA` object at the top of its file.
A slot set to `src: null` shows the designed `<ImagePlaceholder>` instead of a
photo. There are 30 empty slots. To fill one, add the file under
`public/images/...` and set its `src`. The label gives the aspect ratio the image
needs.

| Page | File | Empty slots |
|---|---|---|
| Vendors | `src/components/sections/VendorsPageClient.tsx` | **8 of 8.** Hero (4:3), Producers (16:9), Fisheries & aquaculture (16:9), Processors (16:9), Aggregators & export (16:9), Cold chain & logistics (16:9), Partnership philosophy, Supplier development |
| Sustainability | `src/components/sections/SustainabilityPageClient.tsx` | **6.** Environmental (4:3), Social (4:3), Resource efficiency (16:9), Quote backdrop, Fair & ethical practices (16:9), Inclusive supply chains (16:9) |
| Sourcing | `src/components/sections/SourcingPageClient.tsx` | **5.** Measured expansion (16:9), Quality verification (4:5), Environmental responsibility (16:9), Social impact (16:9), Supplier partnership (4:3) |
| Experience | `src/components/sections/ExperiencePageClient.tsx` | **4.** Cultivation (4:3), Harvest (4:3), Vineyards & estates (16:9), Processing & cold chain (16:9) |
| About | `src/components/sections/AboutPageClient.tsx` | **2.** Apiary (4:3), Harvest (4:3). The 5 team photos come from the Team collection (section 4). |
| B2B Solutions | `src/components/sections/B2BSolutionsPageClient.tsx` | **2.** Quality verification, Contract supply (16:9) |
| Retail | `src/components/sections/RetailPageClient.tsx` | **2.** Mature markets (16:9), Growth markets (16:9) |
| Contact | `src/components/sections/ContactPageClient.tsx` | **1.** Operating regions |

The Shipping, Policies, Recipes and Brands pages have all their images.

---

## 6. Tooling and technical debt

### 6.1 Node version is below what the project requires
Local Node is `20.9.0`, but `package.json` requires `^20.19.0 || ^22.12.0 || >=24.0.0`.
On 20.9, `pnpm test:e2e` fails before any spec loads, and
`tests/int/journal-post.int.spec.ts` can't start.

**Confirmed on 2026-09-26 with a portable Node 22** (your system Node wasn't
changed): all 25 end-to-end specs load, and the integration suite passes 104 of
104 tests. Getting there also fixed two test-setup bugs the load error had been
hiding, both in `vitest.setup.ts`:
- `jsdom` has no `IntersectionObserver`, which the scroll-in animations use.
  Added a no-op stub.
- Testing Library wasn't unmounting between tests (vitest `globals` is off), so
  renders piled up and queries found duplicates. Added `cleanup()` after each test.

- **Still to do:** install Node 22 LTS on this machine.
- **Note:** `tests/int/api.int.spec.ts` sometimes times out (1 run in 3). It
  queries the live Railway database with vitest's default 5-second limit, so
  it's network latency, not a code fault.
- The end-to-end suite was listed but not run, because it creates a test admin
  user in the database and that database is production. Give the tests their
  own database before running them.

### 6.2 `pnpm migrate`: fixed
The leftover `dev` row is gone. `pnpm migrate:status` now answers normally and
lists all 11 migrations as applied (the latest is
`20260906_230000_partner_portal`). `pnpm migrate:apply` still works too.

### 6.3 Global CSS overrides Tailwind classes: fixed
The element rules in `src/app/(frontend)/styles.css` (`*`, `html`, `body`, `img`,
`h1`–`h6`, `p`, `a`, `svg`) are now inside `@layer base`, so Tailwind classes on
those elements take effect.

**How it was checked:** full-page screenshots of 31 routes at 1440px and 390px,
before and after the change, compared pixel by pixel. A second baseline run
separated normal noise (the homepage carousel) from real changes. Most pages
move by 1–6px. The noticeable changes are all classes that were written but
never took effect:
- `/categories` tile titles now fit at their intended size, where they had been
  overflowing onto 3 lines.
- The `/categories` and `/categories/directory` heroes are tighter.
- The `/products` header block is tighter.
- Product page titles and the related-product images use their intended sizes.
- Paragraphs with `m-0` or `mt-*` classes lose the default 16px margin that had
  been overriding them.

Nothing broke. The child-`<span>` and `h-11!` workarounds already in the code
still work, and new code no longer needs them.

### 6.4 Stale branch
`copilot/vscode-mnmtnn44-cy9s` holds one "Checkpoint from VS Code" commit and
can probably be deleted (local and remote).

### 6.5 New scripts
- `pnpm check:suppliers`: a read-only report of price, stock and listing
  differences against each supplier's store.
- `pnpm fix:catalogue-2026-09-25`: the stock, category-image and orphaned-media
  fixes from sections 2–4. Supports `--dry-run` and is safe to run twice.

---

## Suggested order

1. Run `pnpm fix:catalogue-2026-09-25 --dry-run`, then run it for real (section 2).
2. Decide whether our prices follow Intermex's (1.1).
3. DNS: SPF and DMARC (1.2, 1.3). About five minutes at Namecheap.
4. Merge `feat/stripe-checkout` into `master` (1.4).
5. Add the 24 Intermex products by hand, plus the new ones worth carrying (3.1).
6. Photos for the Vendors page, which currently has none (section 5).
7. Install Node 22 LTS (6.1).
8. Everything else as time allows.
