# Open Issues — Delicious Planet

First audit 2026-09-23. **Re-verified 2026-09-25** against the live database, R2,
DNS, the supplier feeds and the test suites.

> **Code-level findings** (security, payments, accessibility, performance) are in
> [`md/PRODUCTION-AUDIT.md`](PRODUCTION-AUDIT.md), from 2026-10-05. That
> document's §1 lists the launch decisions it found: the shipping charge, VAT,
> the 10% newsletter claim and the public repository. This file stays the
> record for data, supplier, DNS and content issues.

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

### 1.4 `master` was behind what's live: fixed
`feat/stripe-checkout` was 22 commits ahead of `master`. Those commits cover
Stripe checkout, R2 media, SEO, security headers, the partner portal, the
fulfilment console, transactional email and the admin sidebar. On 2026-09-26
`master` was fast-forwarded to it (no merge commit, since `master` had nothing
of its own), along with that day's fixes, and both were pushed to `origin`.

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

### 3.1 Intermex: products in their feed but not on our site
Their live feed has 202 products. We carried 174, and now carry 197.

- **The 24 left over from the interrupted import: 23 added on 2026-09-26.**
  They were imported with `pnpm import:intermex --only=<handles>`, so the other
  174 products weren't touched. All 23 are published with images, and their
  stock status matches Intermex (6 are sold out there). Two fixes to the
  importer went with it: it strips the new stock codes from titles, and it
  treats a SKU of `"0"` as missing (see 3.4).
- **1 of those 24 skipped: `el-fresno-whole-pasilla-chili-1`.** Intermex has two
  "Whole Pasilla Chili, El Fresno" listings: the one we already carry at
  96.00 AED, and this one at 16.00 AED. Neither gives a size, so we can't tell
  them apart. Ask Intermex which is which before adding it. Its image is media
  930 (3.3).
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

### 3.3 Three media files nothing uses
- 844, 845 (`la-costena-guacamole-salsa`): `pnpm fix:catalogue-2026-09-25`
  deletes them.
- 930 (`el-fresno-whole-pasilla-chili-1`): kept for when the duplicate listing
  is sorted out (3.1).

891/892 were reused when the hot sauce was imported, and 928/929 when Barritas
Fresa was.

### 3.4 Five products use Intermex's placeholder numbers as SKUs
Intermex fills some SKUs with small numbers. Five of our products carry them as
their SKU: `24`, `2` and `50` from the 2026-09-05 import, and `3` (La Meridana
sampler) and `8` (Pulparindo) from 2026-09-26. They're unique, so nothing
breaks, but they aren't real SKUs. Changing a live product's SKU is your call.
Only `"0"` is treated as missing, because several products share it.

### 3.5 Bad product photos: 76 fixed on 2026-10-04/05, 1 left
`pnpm images:audit` (read-only) measures each product's first photo the way the
product card frames it, as a square with `object-cover`, and flags four faults:
- **CUT:** part of the product falls outside the square.
- **TOUCH:** something runs into the edge of the square on a plain backdrop.
  This includes a product that already touches the edge of its own photo, which
  CUT can't see. TOUCH was added on 2026-10-05, after the owner spotted
  cut-off cards that CUT had missed.
- **TINY:** a small product in a big plain frame.
- **LOWRES:** narrower than 600px, so it goes soft on a 2× screen.

`pnpm images:fix` replaced 76 primary photos with exact 1200×1200 squares, so
Payload's `card` is exactly 800×800. Photos that were fine were left alone. The
plan is `md/scripts/product-image-fixes.json`.

**2026-10-04: 43 products**
- **9 La Costeña and Herdez cans (TINY):** re-cropped around the can, keeping
  Intermex's backdrop.
- **30 Intermex screenshots (225–480px) and bad shots:** replaced with the
  manufacturer's packshot, cut out and centred on the card's cream `#f5f4f1`.
  Two of the old ones had a fake transparency checkerboard baked in. Brand sites
  rarely publish packshots, so most new files come from big retailers' listings
  (Walmart MX, Chedraui, Amazon, HEB). Each media row's `sourceUrl` names the
  file. Some packs are a newer label design of the same product.
- **3 Admiral Caviar sets:** the photos were promo graphics with headlines and
  prices baked in, cut mid-word by the card. Each set's own tin photos are now
  arranged on cream, and the promo graphic is kept as the second image.
- **Banderilla:** the official Tama-Roca single-stick render. The old photo
  showed 5 sticks for a 1-piece product. The mixed candy bag (yellow backdrop)
  was squared off with its own backdrop colour.

**2026-10-05: 33 products**
- **`apricot-in-syrup-820g`:** Intermex's listing said apricot in its title and
  description, but its only photo was a 288px screenshot of La Costeña sliced
  *peaches*. The owner confirmed apricots. It now shows La Costeña's official
  Chabacanos en Almíbar Mitades 820g can, which is only published at 488×550, so
  it is slightly soft when enlarged. The descriptions also said "Whole…
  (800g)"; they now say apricot halves, 820g. An Intermex re-import of this
  product would bring back their title, copy and photo.
- **11 Intermex packs with no better photo anywhere:** the card cropped each
  product, and its own photo was cut out and centred whole on cream. These are
  the Ancho chillies, Maseca Azul, the assorted candy bag, the five Pepe Crunch
  bags, both Japanese-style peanuts and the esquite pouch. Small sources are
  placed smaller rather than enlarged more than 3×, so they stay sharp in the
  card but are soft when zoomed. Better photos still need to come from Intermex
  or be taken in-house.
- **Milky Bear:** sat on the bottom edge. It is now centred with room, on white
  like its sibling bears.
- **15 Velsoro chocolate bars:** styled flat-lays where the centred crop cut the
  box and flowers behind. They are recropped around the bars, keeping
  Velsoro's look.
- **Bonbon boxes of 12 and 48, and the custom box:** the crop window was moved
  so the whole tray shows.
- **The two salted-caramel boxes:** tall open boxes on a plain grey sweep,
  squared off with the same grey so the whole box shows.

Each product's gallery before and after is in
`md/scripts/product-image-fixes.applied.json`. The replaced photos keep their
media rows, so a fix can be reverted. `pnpm media:cleanup --orphans` will list
those rows, and deleting them removes the way back. A targeted re-import
(`import:intermex --only=`) of one of these products resets its gallery to
Intermex's photos.

**Now** `pnpm images:audit` skips every fixed photo, plus six reviewed and kept
on purpose (`"action": "keep"` entries in the plan, matched on media id):
- the box of 24 (a close-up by design)
- the box of 4 (already whole)
- the mascarpone carton (only its board touches the edge)
- the snack-wheel shop scene
- two jars right at the 45% TINY line

**It flags one product:** `rice-morelo-1kg-valle-verde`. The title says 1kg,
but the photo is the 454g (1 lb) US bag. Decide which it is, then fix it the way
the apricot was fixed.

**Catalogue errors found on the way.** Raise these with Intermex, together with
confirming that the apricot listing ships apricots:
- The "chipotle" Pepe Crunch photo is a different product (Kronchito
  chorizo-chipotle).
- The "mango" bag reads 900g, not 500g.
- Valentina peanuts look like a pairing Intermex put together, not a
  manufacturer product.
- Maseca Azul's 1kg pack seems to have been replaced by 907g under the same
  barcode.

### 3.6 One draft product: resolved
`e-gift-card` (Caputo) was the only draft. It was deleted on 2026-10-04 with the
rest of the non-food products, so every remaining product is published.

### 3.7 Brands (re-verified 2026-10-04)
Caputo is a brand we carry, not a supplier. The `Caputo` supplier record (its
website was casinetto.com, and nothing linked to it) is deleted. The header's
"Shop by Brand" menu, `/brands` and the homepage brand strip now read the
Brands collection, listing only brands with published products. Before this
they read Suppliers, so every menu link opened an empty listing.

Intermex products are now filed under the maker on the pack: 113 changed, 44
brands added. The list is `BRANDS` in `md/seed/intermex-catalogue.ts`, and the
previous values are in `md/scripts/fixed-brands-2026-10-04.json`. Still to decide:
- **15 products with no brand,** because neither the title nor Intermex's
  description names a maker: the esquite, both candy bags, both popsicle packs,
  both Japanese-style peanuts, the snack wheel, Botanera sauce, cactus in brine,
  corn husks, whole guajillo chili, Paleta Payaso and Rancheritos.
- **`De la Rosa Coronado Butter Rum Hard Candies`** names two makers. Check the
  pack.
- **Filed from what the brand makes, not from the text:** Chocorroles under
  Marinela, Pulparindo under De la Rosa.
- **`/brands` copy** still says "a short list, kept deliberately short", but it
  now lists 55 brands, including Jarritos and Ruffles.
- **Cebon** has a brand record and a bundled logo but no products, so it is no
  longer shown.

---

## 4. Missing images: admin content

All of these can be added in the Payload admin. No code changes are needed.

| Collection | Missing | Where it shows | What visitors see now |
|---|---|---|---|
| Categories | 0 of 32 (the 9 North African Pantry categories got art 2026-10-06) | `/categories` tiles, category page hero | Photos throughout |
| Team | 5 of 5 photos | About page | Grey placeholder boxes. These must be the real people, so no stock photos were used |
| Brands | 17 of 85 stocked brands have no logo (fixed 64 on 2026-10-05/06) | `/brands` register, homepage "Brands We Carry", the /brands marque board | The brand name set as text |

The two banners without an image are `strip` banners, which are text-only by
design (`PromoBanner.tsx`), so they are not gaps.

On 2026-10-04 `chilis`, `chocolate-boxes`, `flours`, `mexican-pantry` and
`teddy-bear` got Unsplash/Pexels photos, with each media row's `sourceUrl` set to
the photo's page (`md/scripts/set-cms-images-2026-10-04.ts`). The flours photo
is strong as a tile, but in the wide category-page hero its flour heap sits low
and mostly the sack shows.

On 2026-10-05 the last four categories that used one of their own products'
photos as their banner got Unsplash/Pexels art (`md/scripts/set-cms-images-2026-10-05.ts`):
`chocolate-bars` (snapped milk and dark bars), `mexican-sauces` (salsas with
chips), `pantry-staples` (a sack of pinto beans) and `mexican-candy` (loose candy
at a Mexico City market). Before, the banner repeated a photo from the grid
below it. No label-free photo of tamarind or chili candy exists, so the candy
banner is mostly gummies.

**Brand logos (2026-10-05):** 42 logos were uploaded from Wikimedia Commons or
the brand's own site, each media row's `sourceUrl` naming the file. Every one is
stored as a trimmed PNG (SVGs are rendered, never served). The `/brands` marque
board sits on obsidian, where most marks are dark ink and vanished (Admiral and
García de la Cruz already did), so each logo there now sits on a white tile.
Still text only:
- **No logo published anywhere:** Fit Panda (an Inzi product line), Nopal Foods,
  Azteca, B Sweet (bsweet.ae is an unrelated bakery), Coronado (the brand moved to
  Mondelez and its site is gone) and Pelon Pelo Rico.
- **Only unusable files:** Naturelo (99px), Nopal Tenochtitlan (white ink only,
  invisible on the white cells) and Maizena (only a third-party redraw in black;
  the Mexican box prints it red-brown).

- **North African brands with no findable logo (2026-10-06):** Boukhari, Facto
  (only a pink campaign avatar), Safinet E’Sahraa (a Chinese exporter’s private
  label), Izdihar, CAB, El Raki, Salha and Oum Walid. Their sites are gone or
  are placeholders.

Ask these brands, Intermex or Fennec for a logo file. Nine Algerian logos come from
the brand’s official Facebook avatar; El Sanoubar, Aroma Café, Dreamy and El
Fawaha are a badge on a coloured square, and Moula (168px, from a job-board
profile) is small.

Several logos are small originals (Maseca 136px, Omalli 113px, El Fresno 222px,
Inzi 239px, Abuelita 286px, Cholula 294px, Vero 304px): they read fine at their
40–72px cell height but are soft on a 2× screen. Maruchan and Mayamel only exist
on white, which is fine because every logo cell is white now.

**Brand title:** the logo for `valle-verde` reads "Verde Valle", which is the
brand's real name, as the bag and Intermex's current listing say. The title
(set from `md/seed/intermex-catalogue.ts`) has the words swapped.

Also check the category filing: most of what's in `mexican-candy` is chips and
chicharrón (Ruffles, Churritos, Chicharron, Tortilla Chips), not candy. And
`mexican-pantry` has no products of its own (consider deleting it).

**Not an issue (corrected from the first audit):**
- **Product SEO images:** none of the 256 are set, but link previews fall back to
  the product's main photo (`src/app/(frontend)/products/[slug]/page.tsx:49-52`).
- **Testimonial and region images:** all empty, but the site never displays
  these fields. Filling them in would change nothing. (Brand logos *are* shown:
  see the Brands row above.)

---

## 5. Static page images: all 30 empty slots filled on 2026-10-04

Each static page declares its images in a `MEDIA` object at the top of its file.
The 30 slots that showed the hatched `<ImagePlaceholder>` all have photos now,
in the Vendors (8), Sustainability (6), Sourcing (5), Experience (4), About (2),
B2B (2), Retail (2) and Contact (1) pages. Sources: 13 Unsplash, 14 Pexels and
3 from the April branch (6.4). Each photo's source page and photographer are in
`md/site-image-sources.json`. Neither licence requires a credit.

Slots with a fixed `ratio` were cropped to it at the size in
`md/image-manifest.md` §2. Slots whose height comes from the layout, such as
the full-width bands and the sticky side columns, kept the photo's shape at
2560px, because they render at different ratios on phone and desktop. Every new
slot has alt text, except the three decorative backdrops under text.

Worth a look:
- **Four photos drift from the doc's brief, because no clean match existed:**
  - Vendors marine shows a fish auction hall, not boats at a quay.
  - Aggregators shows sacks, not palletised cartons.
  - Inclusive supply chains shows a field, not a market.
  - Retail mature markets shows a deli, not a supermarket aisle. Every aisle
    photo showed legible brands.
- **Vendors processors** is the April branch's `sourcing-factory-a.avif`. Its
  source isn't recorded, so check it before relying on it.
- **Stale labels:** the Experience origin pair renders at 4:5, although the doc
  and the old labels said 4:3. The labels are corrected.
- **Not slots:** `about-founder` in the doc is a Team photo (section 4), and
  the doc's broken `pasta.avif` reference no longer exists in the code.

### 5.1 Placeholders and repeated photos: fixed on 2026-10-05

An audit compared every image the site shows by a visual fingerprint and checked
each match by eye. Two kinds of problem were fixed with 27 new Unsplash/Pexels
photos, uploaded with `pnpm images:site` and recorded in
`md/site-image-sources.json`:

- **About → Development timeline:** the seven year cards had `src={null}`
  hard-coded, so they always showed the hatched placeholder. Each now has its
  own 4:3 photo and alt text, under `images/about/timeline-<year>.avif`.
- **One photo in several places:**
  - The homepage hero repeated the About manifesto, the Sourcing hero and the
    oils category tile on the same page.
  - The "Delicious Experience" carousel repeated the Experience page.
  - The six Recipes plates were the category tiles, and their journal band
    repeated `experience-dish` a third time.
  - The four sign-in pages borrowed About and Sourcing photos. The farmer photo
    was used four times.
  - The `/brands` masthead repeated Sourcing.
  - The restaurant photo appeared three times, including twice on the homepage
    (sidebar tile and Shop menu card).

  New homes: `images/home/`, `images/recipes/`, `images/auth/`,
  `images/brands/` and `images/nav/`. The originals stay on their own pages.

Choices worth knowing:
- No ham, charcuterie, wine or other alcohol is visible: a hero with cured ham
  and a timeline card of wine bottles were swapped out.
- The candy and coffee-cupping shots are the closest free matches, not exact
  briefs.

**Product repeats left alone, because they are the supplier's own photos:**
- `mexican-chicken-chorizo-intermex` and `mexican-beef-chorizo-intermex` show the
  same photo. Intermex's store uses one byte-identical file for both.
- `corn-tortilla-4-5-1kg` shows the same pack as the 6" 500g, which is the
  photo Intermex has for it.
- `a-trio-of-perfection-90g` and `the-grand-caviar-journey-150g` share a main
  photo. Both sets hold the same three caviars, in different tin sizes.
- `corn-tortilla-intermex-6inch-500g` / `corn-tortilla-6inch-intermex-500gm`
  (same size and price) and `flour-tortillas-pre-cook-intermex-500gm` /
  `flour-tortilla-500g` share every photo. They look like one product listed
  twice, from Intermex's `-copy` listings. Whether to unpublish one of each is
  your call.


### 5.2 Branded and off-brief photos replaced: 2026-10-06

A second review of every page photo replaced 12 that showed a third-party brand
or a setting at odds with the business (founded in Algeria, sourcing across
North Africa). New files are under new names, with sources in
`md/site-image-sources.json`:
- **Brands on show:** the About origin photo (a Thai market with a GrabFood apron),
  the About regional-operations card and three Retail cards (shelves of readable
  brands, a store sign in Chinese).
- **Indian and South-East Asian scenes:** Sourcing social and quality, the three
  Sustainability social/inclusive/quote photos, and the Experience dish
  (chopsticks). All now Moroccan, Tunisian or Algerian, except the
  quality-verification shot (rice sorting in Nigeria).
- **Repeat:** Vendors processors was the same photo as the B2B factory card; it is
  now a date-sorting line (US, the closest unbranded match).
- **CMS:** the Curated Fine Beverages tile showed cocktails and labelled bottles;
  it is now an iced hibiscus drink. `chocolate-bars` had been given the same
  photo as the Velsoro banner on 2026-10-05; it now has its own.

The Asia region card (Taj Mahal) stays: region cards show one landmark per region.
The old files are still in R2 and `public/images`, unreferenced.
---

## 6. Tooling and technical debt

### 6.1 Node version: fixed
Node was `20.9.0`, below the `^20.19.0 || ^22.12.0 || >=24.0.0` that
`package.json` requires. On it, `pnpm test:e2e` failed before any spec loaded,
and `tests/int/journal-post.int.spec.ts` couldn't start.

**Node 22.23.2 was installed on 2026-09-26** (`winget`, `OpenJS.NodeJS.22`,
replacing `OpenJS.NodeJS.20`; global `pnpm` unaffected). `pnpm test:int` now
passes 104 of 104 tests and `pnpm test:e2e --list` loads all 25 specs. Getting
there also fixed two test-setup bugs the load error had been
hiding, both in `vitest.setup.ts`:
- `jsdom` has no `IntersectionObserver`, which the scroll-in animations use.
  Added a no-op stub.
- Testing Library wasn't unmounting between tests (vitest `globals` is off), so
  renders piled up and queries found duplicates. Added `cleanup()` after each test.

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

### 6.4 Unmerged April work on `copilot/vscode-mnmtnn44-cy9s`: don't delete
This looked like a stray VS Code checkpoint, but its last commit (2026-04-06)
changes 146 files and adds about 22,000 lines that exist nowhere else:
- translations for Arabic, English, Spanish and French (`messages/*.json`,
  `src/i18n/LocaleContext.tsx`)
- a currency context
- a `/commercial` page and a `/vendors/apply` page
- a `ShopProductCard` and loading skeletons
- a testimonials seed
- 64 photos. All were checked on 2026-10-04: most are already live under new
  names, 3 more now fill page slots (section 5), and the rest were rejected for
  legible third-party brands

It branched off `master` in March, before the Stripe work, so it will conflict
heavily with the current code. Decide what to salvage from it: at minimum the
photos, and the translations if the site is meant to be multilingual. Deleting
it would lose all of this for good.

### 6.5 New scripts
- `pnpm check:suppliers`: a read-only report of price, stock and listing
  differences against each supplier's store.
- `pnpm fix:catalogue-2026-09-25`: the stock, category-image and orphaned-media
  fixes from sections 2–4. Supports `--dry-run` and is safe to run twice.
- `pnpm tsx md/scripts/fix-brands-2026-10-04.ts [--apply]`: the brand fixes in
  3.7. A dry run by default. Running it again changes nothing.
- `pnpm images:audit`: a read-only list of products whose first photo looks bad
  in the product card (3.5). Run it after any import.
- `pnpm images:fix [--dry-run --preview=<dir>] --dir=<sources>`: applies
  `md/scripts/product-image-fixes.json`, creating exact 1200×1200 squares
  (re-crop around the product, a chosen crop window, padding with the photo's
  own backdrop, cut-out on cream, or a ready-made file). It skips anything already
  done, and logs each gallery's before and after.
- `pnpm images:site <file> images/<path> [--ratio=16:9 --width=1600]`: uploads a
  static site image to R2 (6.6), cropped and sized on the way. `--manifest=` does
  many at once, and `--dry-run` previews.
- `md/scripts/set-cms-images-2026-10-04.ts`: the category art and supplier logos
  from section 4. Running it again changes nothing.
- `md/scripts/set-cms-images-2026-10-05.ts --dir=<files> [--dry-run]
  [--only=categories|brands]`: the four category banners and the 42 brand logos
  in section 4, from the plan `md/scripts/cms-images-2026-10-05.json`. A brand
  that already has a logo is skipped. The source files were in a session
  scratch folder, so running it again needs the files fetched again from each
  `sourceUrl`.

### 6.6 Static images load from R2 (2026-10-04)
Every `/images/...` path in `src/` now goes through `siteImage()`
(`src/lib/site-image.ts`), which points it at `<R2_PUBLIC_URL>/site/images/...`.
`next.config.ts` passes the bucket URL to client code as `NEXT_PUBLIC_MEDIA_URL`,
copied from `R2_PUBLIC_URL`, so nothing new needs setting in Vercel. The 71
existing files were uploaded scaled to at most 2560px, which cut them from
112 MB to 20 MB with no visible loss at 100%.
- **`public/images/` is still in the repo but the site no longer reads it.**
  Deleting it takes 112 MB out of every deploy. One old one-off script reads it,
  `md/scripts/recover-media.ts`. The other, `seed:collection-images`, targeted a
  deleted collection and was retired to `md/unused/` on 2026-10-05. Git holds the
  only full-resolution originals. Moving the folder into `md/` (not deleting it)
  is written up in `md/unused/README.md`.
- **New page art goes to R2:** `pnpm images:site <file> images/<path>`. A file
  dropped into `public/images/` won't show.
- **`pnpm media:cleanup` skips the `site/` prefix.** It used to report
  everything that wasn't a media row as a stray, and with `--strays` it would
  have deleted these files.
- **The bucket is served from its `r2.dev` URL,** which Cloudflare rate-limits
  and doesn't recommend for production. Most images go through next/image, so
  R2 sees few requests. The logo SVG and favicon load straight from it, though.
  Connecting a custom domain (for example `media.deliciousplanet.co`) and
  pointing `R2_PUBLIC_URL` at it fixes this, but needs the domain's DNS on
  Cloudflare.

---

## Suggested order

1. Run `pnpm fix:catalogue-2026-09-25 --dry-run`, then run it for real (section 2).
2. Decide whether our prices follow Intermex's (1.1).
3. DNS: SPF and DMARC (1.2, 1.3). About five minutes at Namecheap.
4. Decide what to salvage from the April branch: the translations, pages and
   components. Its photos have been dealt with (6.4).
5. Ask Intermex about the two Pasilla listings, the 0.00 guacamole price, the
   discontinued tortilla (3.1, section 2), and the product photos in 3.5: the
   rice title, that the apricot listing really ships apricots, and photos of
   their own packs.
6. Team photos for the About page (section 4). They must be the real people.
   Also ask for logo files from the nine brands still shown as text (section 4),
   and decide on the two duplicate tortilla listings (5.1).
7. Everything else as time allows.
