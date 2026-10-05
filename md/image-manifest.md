# Image Manifest

Every image the site loads, the size to deliver it at, and the `alt` it should
carry. Generated from the code, not from the design deck — each row maps to a
real `src` in `src/`.

> Supersedes `md/archive/required-images.md`, which lists filenames (`hero-sourcing.avif`,
> `pillar-quality.avif`, …) that no longer match the code.

---

## 1 · Conventions

**Format** — AVIF for photography, SVG for the logo, WebP/PNG only for partner
logos supplied that way. Quality 55–65 on AVIF is indistinguishable at these
sizes.

**Sizing** — every editorial image renders through `<ImagePlaceholder>`, which
always uses `next/image` with `fill` + `object-cover`. The container crops, so
the *aspect ratio* below is what matters; deliver at the listed pixel size or
larger and Next resizes down. Sizes are 2× the widest CSS box at a 1920px
viewport, which also covers a 430px phone at 3×.

| Slot type | `sizes` in code | CSS px @1920 | Deliver |
|---|---|---|---|
| Full-bleed band | `100vw` | 1920 | **2560 × 1440** |
| Hero (wide) | `… 46vw` | 883 | **1800 × 1350** (4:3) |
| Hero (narrow) | `… 38vw` | 730 | **1500 × 1125** (4:3) |
| Feature, wide | `… 55vw` | 1056 | **2000 × 1125** (16:9) |
| Feature | `… 40vw` | 768 | **1600 × 900** (16:9) |
| Diptych half | `… 50vw` | 960 | **1920 × 1080** (16:9) |
| Card, 3-up | `… 33vw` | 634 | **1600 × 900** or **1600 × 1200** |
| Card, 4-up | `… 24vw` | 461 | **1200 × 675** (16:9) |
| Sticky column | `… 30vw` | 576 | **1200 × 1600** (3:4, fills height) |
| Portrait | ratio `4/5` | — | **1200 × 1500** |

**Weight budget** — ≤ 300 KB per full-bleed image, ≤ 150 KB per card. Colour
profile sRGB, strip EXIF.

**Alt text** — decorative backdrops (a photo behind a headline, a texture under
an overlay) take `alt=""` deliberately; a screen reader announcing them is
noise. Everything that carries information gets a real sentence. Both are
specified below — `alt=""` in a row means *intentionally empty*, not *missing*.

---

## 2 · Missing — 32 images to source

Live slots with no file. 31 render the designed hatch placeholder
(`src: null`); one is a **broken link**.

### 2.1 Broken reference — fix first

| File | Referenced by | Ratio | Deliver | Alt |
|---|---|---|---|---|
| `public/images/collections/pasta.avif` | [RecipesPageClient.tsx:15](src/components/sections/RecipesPageClient.tsx#L15) | 16:9 crop | 1600 × 900 | `Italian Cuisine` (bound to `cuisine.label`) |

The path is hard-coded but the file does not exist — that tile 404s today.

### 2.2 Vendors — all 8 slots empty

`public/images/vendor/` does not exist yet; the whole page renders placeholders.

| File | Slot | Ratio | Deliver | Suggested subject | Alt |
|---|---|---|---|---|---|
| `vendor/vendor-hero.avif` | Hero | 4:3 | 1800 × 1350 | Producer and buyer at a farm gate | `A supplier and a buyer inspecting produce together at origin` |
| `vendor/vendor-producers.avif` | Partner type 01 | 16:9 | 1600 × 900 | Growers in field, crates of harvest | `Growers loading crates of freshly harvested produce` |
| `vendor/vendor-marine.avif` | Partner type 02 | 16:9 | 1600 × 900 | Coastal fishery, boats, iced catch | `Fishing boats unloading iced catch at a coastal quay` |
| `vendor/vendor-processors.avif` | Partner type 03 | 16:9 | 1600 × 900 | Clean processing line, stainless steel | `Workers on a food processing line in a stainless-steel facility` |
| `vendor/vendor-aggregators.avif` | Partner type 04 | 16:9 | 1600 × 900 | Palletised export cartons, forklift | `Palletised export cartons staged in a consolidation warehouse` |
| `vendor/vendor-logistics.avif` | Partner type 05 | 16:9 | 1600 × 900 | Refrigerated trailer, cold store doors | `A refrigerated trailer docked at a cold storage facility` |
| `vendor/vendor-philosophy.avif` | Full-bleed band | wide, min-h 320px | 2560 × 1440 | Landscape dark enough to carry white text | `""` — decorative, headline sits on top |
| `vendor/vendor-development.avif` | Feature, 40vw | 16:9 | 1600 × 900 | Training session, agronomist with farmer | `An agronomist walking a farmer through quality standards` |

### 2.3 Sustainability — 6 slots

`public/images/sustainability/`

| File | Slot | Ratio | Deliver | Suggested subject | Alt |
|---|---|---|---|---|---|
| `sustainability-environmental.avif` | Priority card 01 | 4:3 | 1600 × 1200 | Farmland aerial, hedgerows, open sky | `Aerial view of cultivated farmland bordered by hedgerows` |
| `sustainability-social.avif` | Priority card 02 | 4:3 | 1600 × 1200 | Cooperative workers, dignified labour | `Cooperative members sorting harvest under shade` |
| `sustainability-resource.avif` | Environmental deep-dive 02 | 16:9 | 1600 × 900 | Drip irrigation, water reuse | `Drip irrigation lines running between rows of crops` |
| `sustainability-quote.avif` | Pull-quote band | wide | 2560 × 1440 | Calm landscape; takes a `forest-green/85` overlay | `""` — decorative, quote sits on top |
| `sustainability-fair.avif` | Social diptych, left | 16:9 | 1920 × 1080 | Safe, well-lit working environment | `Workers in protective clothing on a well-lit packing floor` |
| `sustainability-inclusive.avif` | Social diptych, right | 16:9 | 1920 × 1080 | Smallholder at a market or cooperative | `A smallholder producer at a regional cooperative market` |

> The code already rejects `sustainability-misc.avif` for the `resource` slot —
> it is an abstract yellow texture, unrelated to water, energy or waste.

### 2.4 Sourcing — 5 slots

`public/images/sourcing/`

| File | Slot | Ratio | Deliver | Suggested subject | Alt |
|---|---|---|---|---|---|
| `sourcing-network-phased.avif` | Network card 03 | 16:9 | 1600 × 900 | New region entry, map-like landscape | `A newly established sourcing region seen from above` |
| `sourcing-standards.avif` | Standards sticky column | 4:5 | 1200 × 1500 | QC inspection, sample testing | `A technician testing a product sample against quality specifications` |
| `sourcing-environmental.avif` | Commitments 01 | 16:9 | 1920 × 1080 | Soil, cover crop, regenerative practice | `Cover crops growing between rows on a regenerative farm` |
| `sourcing-social.avif` | Commitments 02 | 16:9 | 1920 × 1080 | Producer community, fair-trade context | `Producers meeting with a buyer to agree seasonal terms` |
| `sourcing-partnership.avif` | Closing feature | 4:3 | 1600 × 1200 | Long-term relationship at origin | `A long-standing supplier and buyer walking a harvest field` |

### 2.5 Experience — 4 slots

`public/images/experience/`

| File | Slot | Ratio | Deliver | Suggested subject | Alt |
|---|---|---|---|---|---|
| `experience-cultivation.avif` | Origin, left | 4:5 | 1200 × 1500 | Crop close-up, growing stage | `A close view of ripening produce on the plant` |
| `experience-harvest.avif` | Origin, right | 4:5 | 1200 × 1500 | Hands harvesting | `Hands picking produce at harvest` |
| `experience-specialty.avif` | Stage 02 card | 16:9 | 1600 × 900 | Vineyard, olive grove, estate | `Terraced vineyards on an estate hillside` |
| `experience-processing.avif` | Stage 03 card | 16:9 | 1600 × 900 | Cold chain, packing, grading | `Produce being graded and packed in a temperature-controlled room` |

### 2.6 About — 3 slots

`public/images/about/`

| File | Slot | Ratio | Deliver | Suggested subject | Alt |
|---|---|---|---|---|---|
| `about-apiary.avif` | Origin pair, left | 4:3 | 1200 × 900 | Beekeeper, hives | `A beekeeper lifting a frame from a hive` |
| `about-harvest.avif` | Origin pair, right | 4:3 | 1200 × 900 | Harvest scene | `Freshly harvested produce being crated in the field` |
| `about-founder.avif` | Founder portrait | 4:5 | 800 × 1000 | Environmental portrait, natural light | `Portrait of the founder of Delicious Planet` |

### 2.7 B2B — 2 slots

`public/images/b2b/`

| File | Slot | Ratio | Deliver | Suggested subject | Alt |
|---|---|---|---|---|---|
| `commercial-quality.avif` | Compliance sticky column | 3:4, fills height | 1200 × 1600 | Lab/QC, certificates, documentation | `A quality inspector recording checks against product documentation` |
| `commercial-contract.avif` | Contract supply feature | 16:9, fills height | 1600 × 900 | Bulk and private-label pack formats | `Bulk and private-label pack formats staged for a contract order` |

### 2.8 Retail — 2 slots

`public/images/retail/`

| File | Slot | Ratio | Deliver | Suggested subject | Alt |
|---|---|---|---|---|---|
| `retail-mature.avif` | Region card — mature markets | 16:9 | 1600 × 900 | Modern supermarket aisle | `A well-stocked aisle in a modern supermarket` |
| `retail-growth.avif` | Region card — growth markets | 16:9 | 1600 × 900 | Emerging-market grocery, busy trade | `Shoppers at a busy grocery store in a growth market` |

### 2.9 Contact — 1 slot

`public/images/contact/`

| File | Slot | Ratio | Deliver | Suggested subject | Alt |
|---|---|---|---|---|---|
| `contact-locations.avif` | Operating-regions band | wide, full-bleed | 2560 × 1440 | World/logistics scene, dark under text | `""` — decorative, region labels sit on top |

---

## 3 · In place — 62 files in use

Actual source dimensions and weight, measured from `public/`. **Re-export**
flags a file whose source is far larger than any rendered size.

### 3.1 Brand marks

| File | Current | Weight | Used by | Rendered | Alt |
|---|---|---|---|---|---|
| `logo/logo.svg` | 1010 × 343 | 17 KB | Header, Footer, MobileDrawer | 295×100 / 240×60 / 236×80 | `Delicious Planet` |
| `partner-logo/admiral.webp` | 871 × 426 | 39 KB | BrandStrip, PartnersMarquee, Brands | 160 × 80 | `Admiral Caviar` |
| `partner-logo/caputo.avif` | 192 × 192 | 16 KB | same | 120 × 50 | `Caputo` |
| `partner-logo/velsoro.avif` | 190 × 65 | 2 KB | same | 120 × 50 | `Velsoro` |
| `partner-logo/garcia.webp` | 600 × 266 | 28 KB | same | 150 × 70 | `García de la Cruz` |
| `partner-logo/cebon.png` | 139 × 51 | 7 KB | same | 110 × 40 | `Cebon` |

`cebon.png` at 139 × 51 is **below** its 110 × 40 render box at 2× — it will
look soft on retina. Ask the brand for a vector or a 440 × 160 mark.

### 3.2 Home

| File | Current | Weight | Slot | Alt today | Alt it should have |
|---|---|---|---|---|---|
| `about/about-cover.avif` | 6000 × 4000 | 2.0 MB | Hero slide 1, `100vw` | `""` | `""` — headline overlays it |
| `sourcing/sourcing-farmer.avif` | 3130 × 2075 | 1.3 MB | Hero slide 2 | `""` | `""` |
| `collections/oils.avif` | 4000 × 6000 | 2.4 MB | Hero slide 3 | `""` | `""` |
| `misc/philosophy.avif` | 4129 × 2385 | 173 KB | StoryBanner, `100vw` | `""` | `""` |
| `b2b/commercial-resturant.avif` | 4000 × 6000 | 1.2 MB | HomeSidebar tile (3:4, 240px) · MegaPanel card | `""` | `Partner with us — a restaurant kitchen at service` |
| `experience/experience-experts.avif` | 5855 × 3904 | 2.5 MB | ExperienceCarousel 1 | `Curated by Experts` | keep |
| `experience/experience-dish.avif` | 6699 × 5359 | 2.1 MB | ExperienceCarousel 2 | `From Source to Table` | keep |
| `experience/experience-chef.avif` | 6000 × 4000 | 4.4 MB | ExperienceCarousel 3 · **Re-export** | `For Chefs & Home Cooks` | keep |
| `misc/newsletter.avif` | 4000 × 2667 | 1.5 MB | Newsletter CSS background | n/a | n/a (CSS) |
| `misc/newsletter-leaves.png` | 4480 × 6720 | **9.7 MB** | Newsletter overlay at 480px · **Re-export urgently** | `""` | `""` |
| `misc/faq.avif` | 4850 × 7271 | 927 KB | FAQ aside, `30vw` | `""` | `""` |
| `misc/become-a-vendor.avif` | 5616 × 3744 | 376 KB | Vendor CTA band, `100vw` | `""` | `""` |
| `misc/footer.avif` | 5248 × 3499 | 2.1 MB | Footer backdrop | `""` | `""` |

`newsletter-leaves.png` is a 9.7 MB PNG rendered into a 480 px box. Re-export at
**960 × 1440 AVIF** with alpha (≈60 KB) and delete the `.webp` twin.

### 3.3 Collections — 15 region/collection tiles

Mapped by slug in [images.ts](src/lib/images.ts). Rendered in `CollectionCards`
at `aspect-2/3`, `sizes="(max-width: 1024px) 43vw, 19vw"` → **deliver 800 × 1200**.
All 15 are currently 3–7 K px originals, 230 KB – 4.1 MB. `alt={col.title}`
already, which is correct.

| File | Current | Weight | Collection |
|---|---|---|---|
| `collections/caviar.avif` | 2999 × 5331 | 987 KB | Caviar Selection |
| `collections/pantry.avif` | 3485 × 5228 | 2.1 MB | Truffle Treasury |
| `collections/coco.avif` | 2760 × 4140 | 262 KB | Grand Cru Cocoa |
| `collections/oils.avif` | 4000 × 6000 | 2.4 MB | Heritage Extra Virgin Oils |
| `collections/honey.avif` | 2667 × 4000 | 1.9 MB | Rare Estate Honey |
| `collections/vinegar.avif` | 4480 × 6720 | 493 KB | Aged Balsamic Vinegars |
| `collections/olives.avif` | 4122 × 6183 | 2.5 MB | Mediterranean Olive Reserve |
| `collections/spices.avif` | 4912 × 7360 | **4.1 MB** | Single-Origin Spices · **Re-export** |
| `collections/spreads.avif` | 3086 × 4683 | 962 KB | Signature Gourmet Spreads |
| `collections/Fromagerie.avif` | 4016 × 6016 | 1.0 MB | Fromagerie Selection |
| `collections/breads.avif` | 3744 × 5616 | 1.8 MB | Artisan Heritage Breads |
| `collections/coffee.avif` | 3673 × 5509 | 2.1 MB | Specialty Coffee Reserve |
| `collections/seeds.avif` | 4000 × 6000 | 2.4 MB | Botanical Seed Selection |
| `collections/beverages.avif` | 3917 × 5876 | 1.6 MB | Curated Fine Beverages |
| `collections/cutlery.avif` | 2832 × 4256 | 232 KB | Bespoke Tableware |

`Fromagerie.avif` is the only capitalised filename in the tree — rename to
`fromagerie.avif` and update [images.ts](src/lib/images.ts) before any deploy to
a case-sensitive filesystem.

Five double as region art in [regions.ts](src/lib/regions.ts):
`olives` → Europe, `spices` → Middle East, `sourcing-agriculture` → Africa,
`coffee` → Latin America, `seeds` → Asia. Alt there should be
`{region.label}`, e.g. `Europe`.

### 3.4 About

| File | Current | Weight | Slot | Ratio | Alt |
|---|---|---|---|---|---|
| `about/about-timeline.avif` | 1725 × 3936 | 1.3 MB | Hero, 46vw | 4:3 | `""` → should be `Delicious Planet sourcing partners at work` |
| `about/about-customer.avif` | 7952 × 5304 | 2.7 MB | Origin, 38vw · Register panel | 16:10 | `A producer preparing goods for shipment` |
| `about/about-cover.avif` | 6000 × 4000 | 2.0 MB | Manifesto band | full-bleed | `""` |
| `about/about-retail.avif` | 4896 × 2529 | 2.6 MB | Reach, 55vw · Login panel | 16:9 | `Regional retail operations` |
| `about/about-resturant.avif` | 6000 × 4000 | 1.8 MB | Capability tile, 33vw | fills height | `""` — caption overlays it |

`about-timeline.avif` is a **1725 × 3936 portrait** cropped into a 4:3 hero — the
subject is almost certainly cut. Re-shoot or re-crop to 1800 × 1350.

### 3.5 B2B, Retail, Sourcing, Sustainability, Experience, Contact, Policy

| File | Current | Weight | Slot | Ratio | Alt |
|---|---|---|---|---|---|
| `b2b/commercial-logistics.avif` | 3853 × 4816 | 2.7 MB | B2B hero, 46vw | 4:3 | `Freight being prepared for international dispatch` |
| `b2b/commercial-resturant.avif` | 4000 × 6000 | 1.2 MB | Foodservice card | 16:9 | `A restaurant kitchen during service` |
| `b2b/commercial-factory.avif` | 5922 × 3948 | 1.5 MB | Manufacturing card | 16:9 | `A food manufacturing line in operation` |
| `b2b/commercial-cafe.avif` | 3215 × 4827 | 1.8 MB | Institutional card | 16:9 | `A cafe counter served by wholesale supply` |
| `b2b/commercial-farm.avif` | 3992 × 2992 | 1.5 MB | Wholesale card | 16:9 | `Bulk produce staged for wholesale distribution` |
| `retail/retail-grocery.avif` | 4000 × 4000 | 1.6 MB | Retail hero, 46vw | 4:3 | `A grocery retail floor stocked with imported goods` |
| `retail/retail-fresh.avif` | 8192 × 5464 | 1.5 MB | Fresh card · **Re-export** | 16:9 | `Fresh produce on chilled retail display` |
| `retail/retail-breads.avif` | 4667 × 4000 | 1.2 MB | Shelf-stable card | 16:9 | `Packaged bakery goods on a retail shelf` |
| `retail/retail-organic.avif` | 4200 × 2824 | 1.4 MB | Specialty card | 16:9 | `Organic and specialty goods in a dedicated aisle` |
| `retail/retail-dairy.avif` | 4000 × 5000 | **3.1 MB** | Private label card · **Re-export** | 16:9 | `Private-label dairy products in a chilled cabinet` |
| `retail/retail-cold.avif` | 3537 × 5306 | 2.1 MB | Quality column, 30vw | fills height | `Cold chain storage maintaining product integrity` |
| `retail/retail-veg.avif` | 3957 × 2968 | 1.5 MB | Private-label feature, 40vw | fills height | `Fresh vegetables packed under a private-label programme` |
| `retail/retail-softdrinks.avif` | 4240 × 2832 | 1.4 MB | Local assortment card | 16:9 | `Locally assorted beverages on a retail shelf` |
| `sourcing/sourcing-farmer.avif` | 3130 × 2075 | 1.3 MB | Sourcing hero · Forgot-password panel | 4:3 | `A farmer inspecting a crop at origin` |
| `sourcing/sourcing-lab.avif` | 7943 × 5298 | 2.3 MB | Quality pillar · **Re-export** | 4:3 | `Laboratory testing of an incoming product sample` |
| `sourcing/sourcing-farmer-2.avif` | 3000 × 2000 | 703 KB | Ethics pillar | 4:3 | `A grower working their own land` |
| `sourcing/sourcing-farm-2.avif` | 4936 × 3290 | 1.4 MB | Resilience pillar | 4:3 | `A farm operating across multiple growing plots` |
| `sourcing/sourcing-1.avif` | 6240 × 4160 | **3.8 MB** | Direct network card · **Re-export** | 16:9 | `A buyer meeting a producer at their farm` |
| `sourcing/sourcing-agriculture.avif` | 10648 × 5990 | **6.1 MB** | Strategic network · Brands masthead · Africa region · **Re-export** | 16:9 | `Large-scale agricultural land under cultivation` |
| `sustainability/sustainability-cover.avif` | 3600 × 2700 | **3.5 MB** | Sustainability hero · **Re-export** | 4:3 | `Cultivated landscape managed for long-term yield` |
| `sustainability/sustainability-lab.avif` | 5228 × 7838 | 2.8 MB | Governance card | 4:3 | `Documentation and audit records under review` |
| `sustainability/sustainabilty-logisitcs.avif` | 5989 × 3993 | 1.7 MB | Climate card | 16:9 | `Freight transport across a long-distance route` |
| `sustainability/sustainability-factory.avif` | 4608 × 3072 | 2.3 MB | Sustainable sourcing card | 16:9 | `A processing facility operating to sustainability standards` |
| `experience/experience-experts.avif` | 5855 × 3904 | 2.5 MB | Experience hero | 4:3 | `Specialists selecting products at origin` |
| `experience/experience-chef.avif` | 6000 × 4000 | **4.4 MB** | Foodservice diptych · **Re-export** | 16:9 | `A chef plating a dish in a professional kitchen` |
| `experience/experience-dish.avif` | 6699 × 5359 | 2.1 MB | Retail diptych | 16:9 | `A finished dish presented at the table` |
| `contact/contact-cover.avif` | 5092 × 3819 | 925 KB | Contact hero, 38vw | 4:3 | `The Delicious Planet team at their offices` |
| `contact/contact-misc.avif` | 5304 × 7952 | 1.5 MB | Form aside, 30vw | 4:3 | `Team members coordinating an order` |
| `policy/policy-cover.avif` | 5464 × 3640 | 2.7 MB | Policies hero, 38vw | 4:3 | `Documentation covering trading policies` |
| `policy/shipping-policy.avif` | 3648 × 4560 | 187 KB | Shipping hero, 38vw | 4:3 | `Parcels prepared for outbound shipping` |

**`sustainability-cover.avif` is 3.5 MB at only 3600 × 2700** — the worst
bytes-per-pixel ratio in the tree. Re-encode at quality 60.

`sourcing-agriculture.avif` at 10648 px wide is used in three places, including
a 15vw logo-scale slot. One 2560 px master serves all three.

---

## 4 · Alt-text gaps

`ImagePlaceholder` defaults `alt=""`, and no editorial page overrides it — so
**every image on About, B2B, Retail, Sourcing, Sustainability, Experience,
Vendors, Contact, Policies and Shipping is currently announced as decorative.**
Backdrops behind headlines should stay that way; the hero and card images should
not. Section 3 gives the intended string for each.

Correct today, leave alone:

| Component | Alt | Why |
|---|---|---|
| [Header.tsx:312](src/components/layout/Header.tsx#L312), [Footer.tsx:285](src/components/layout/Footer.tsx#L285), [MobileDrawer.tsx:59](src/components/layout/MobileDrawer.tsx#L59) | `Delicious Planet` | Logo is a link to home |
| [ProductCard.tsx:95](src/components/ui/ProductCard.tsx#L95) | `{product.title}` | CMS-driven |
| [JournalCard.tsx:73](src/components/sections/JournalCard.tsx#L73) | `{post.title}` | CMS-driven |
| [CollectionCards.tsx:96](src/components/sections/CollectionCards.tsx#L96) | `{col.title}` | CMS-driven |
| [ElegantCarousel.tsx:176](src/components/sections/ElegantCarousel.tsx#L176) | `{slide.title}` | Editorial |
| [PartnersMarquee.tsx:48](src/components/sections/PartnersMarquee.tsx#L48), [BrandStrip.tsx:33](src/components/sections/home/BrandStrip.tsx#L33) | `{logo.name}` | Brand names |
| [AboutPageClient.tsx:563](src/components/sections/AboutPageClient.tsx#L563), [ContactPageClient.tsx:615](src/components/sections/ContactPageClient.tsx#L615) | `{city}, {country}` | Office cards |
| [RecipesPageClient.tsx:173](src/components/sections/RecipesPageClient.tsx#L173) | `{cuisine.label}` | Cuisine tiles |

Genuinely decorative, `alt=""` is right: Footer backdrop, StoryBanner,
BecomeVendorCTA, FAQ aside, newsletter leaves, HomeHero slides (headline carries
the meaning), MobileDrawer mega cards, HomeSidebar tile.

---

## 5 · Uploaded through the CMS

Not files to hand over — Payload generates every size on upload. `alt` is a
**required** field on the media collection, so whoever uploads writes it.

Derivatives generated by [Media.ts](src/collections/Media.ts):

| Name | Size | Format | Used for |
|---|---|---|---|
| `thumbnail` | 400 × 400 centre-crop | WebP q80 | Admin list |
| `card` | 800 wide | WebP q82 | Product and journal cards |
| `hero` | 1920 wide | WebP q85 | Page heroes |
| `og` | 1200 × 630 centre-crop | WebP q90 | Social sharing |

Accepted on upload: JPEG, PNG, WebP, GIF, SVG, AVIF.

| Collection | Field | Upload at | Alt guidance |
|---|---|---|---|
| Products | `images[].image` | 2000 × 2000 square, product on plain ground | Product name plus what is visible |
| Product Collections | `image` | 1600 × 2400 (2:3) | Collection title |
| Categories | `image` | 1600 × 1200 | Region or category name |
| Blog Posts | `featuredImage` | 2000 × 1125 (16:9) | Describe the scene, not the headline |
| Blog Posts | `blocks[].image` | 1600 wide | Per image |
| Brands / Suppliers | `logo` | 800 wide, transparent PNG or SVG | Brand name |
| Banners | `image` | 2560 × 1440 wide · 1600 × 1200 split | `""` if the banner has its own heading |
| Office Locations | `image` | 1200 × 900 | `City, Country` |
| Testimonials | `image` | 600 × 600 square | Name of the person quoted |
| Pages | `blocks[].image` | 1600 wide | Per image |

Product photography imported by the seed scripts
([import-admiral-caviar.ts](src/seed/import-admiral-caviar.ts),
[import-casinetto-caputo.ts](src/seed/import-casinetto-caputo.ts),
[import-velsoro.ts](src/seed/import-velsoro.ts)) is fetched from supplier CDNs
at run time and lands in the media collection — nothing to source by hand.

---

## 6 · On disk but unused — 10 files

Nothing references these. Delete, or wire them into a slot from section 2.

| File | Size | Weight | Note |
|---|---|---|---|
| `mega-menu/mega-menu-chef.avif` | 6720 × 4480 | 2.0 MB | Orphaned when `MegaMenu.tsx` became `MegaPanel.tsx` |
| `mega-menu/mega-menu-dish.avif` | 4402 × 2935 | 1.2 MB | same |
| `mega-menu/mega-menu-resturant.avif` | 8256 × 5108 | 328 KB | same |
| `misc/subscribe.avif` | 5788 × 3826 | 3.9 MB | Largest dead file |
| `misc/get-in-touch.avif` | 3856 × 2515 | 1.8 MB | Candidate for `contact-locations` |
| `misc/newsletter-leaves.webp` | 4480 × 6720 | 4.7 MB | PNG twin is the one in use |
| `sustainability/sustainability-misc.avif` | 4024 × 6048 | 715 KB | Abstract texture, rejected in code |
| `policy/policy.avif` | 4000 × 6016 | 221 KB | |
| `logo/logo.png` | 4500 × 4500 | 273 KB | SVG is used everywhere |
| `logo/mobile_logo.svg` | 1080 × 1080 | 14 KB | MobileDrawer uses `logo.svg` |

Removing all ten frees **≈15 MB**.

---

## 7 · Totals

| | Count | Weight |
|---|---|---|
| In use | 62 | ≈ 111 MB |
| Missing | 32 | — |
| Unused | 10 | ≈ 15 MB |
| **On disk** | **72** | **≈ 126 MB** |

Every source file is a full-resolution original. `next/image` never serves them
raw, but they are carried in the repo and re-optimised on every cold cache. A
pass capping sources at **2560 px** and AVIF quality 60 takes `public/images/`
from ~126 MB to roughly 12 MB with no visible change.
