# Required Images

AVIF format preferred. Each section lists its target directory.

---

# Sustainability Page

All images go in `public/images/sustainability/`.

## Already in place (reused)

| Filename | Where it appears |
|---|---|
| `sustainability-cover.avif` | Hero (parallax) |
| `sustainability-factory.avif` | Environmental deep-dive — Sustainable Sourcing tile |
| `sustainability-misc.avif` | Mid editorial banner (forest overlay) |
| `sustainabilty-logisitcs.avif` | Governance section faded backdrop |

## New images required (8)

| Filename | Where it appears | Suggested subject | Aspect |
|---|---|---|---|
| `sustainability-environmental.avif` | Priority card 01 | Wide aerial of farmland / crops / natural landscape | 4:3 |
| `sustainability-social.avif` | Priority card 02 | Producer/farmer hands at work, harvest scene | 4:3 |
| `sustainability-governance.avif` | Priority card 03 | Documentation / clipboard / audit / structured archive | 4:3 |
| `sustainability-climate.avif` | Env. deep-dive #1 (Climate & Emissions) | Open sky, distant transport/horizon, atmospheric | 5:4 |
| `sustainability-resource.avif` | Env. deep-dive #2 (Resource Efficiency) | Water/irrigation/drip systems, conscious resource use | 5:4 |
| `sustainability-fair.avif` | Social diptych — left (Fair & Ethical Practices) | Workers in safe, dignified environment | 16:10 |
| `sustainability-inclusive.avif` | Social diptych — right (Inclusive Supply Chains) | Small/medium producer, market/cooperative | 16:10 |
| `sustainability-roadmap.avif` | Closing "Looking Ahead" section | Path/road/forward-looking landscape (works dark with overlay) | Landscape, wide |

## Notes

- All images load through `next/image` with the paths above — drop files at the exact filenames and they wire up automatically.
- The closing "Looking Ahead" image gets a heavy `bg-obsidian/75` overlay, so darker/atmospheric sources work well there.
- The mid banner (`sustainability-misc.avif`) gets a `bg-forest/75` overlay — already handled.
- Governance backdrop is at `opacity-25` with gradient — texture-rich images render well there.

---

# Sourcing Page

All images go in `public/images/sourcing/`.

## Already in place (reused)

| Filename | Where it appears |
|---|---|
| `sourcing-lab.avif` | Supplier Standards — sticky-image column |

## New images required (10)

| Filename | Where it appears | Suggested subject | Aspect |
|---|---|---|---|
| `hero-sourcing.avif` | Hero (parallax) | Wide cinematic landscape — terraced fields, harvest, or global supply scene | Landscape, very wide |
| `pillar-quality.avif` | Three Pillars — card 01 (Quality & Safety) | Lab/QC, hands inspecting product, clean food-safety imagery | 4:5 portrait |
| `pillar-ethics.avif` | Three Pillars — card 02 (Responsible Procurement) | Workers/cooperative members, hands at work, dignified labour | 4:5 portrait |
| `pillar-resilience.avif` | Three Pillars — card 03 (Resilient Supply) | Logistics, pallets, port/warehouse, multi-region map feel | 4:5 portrait |
| `network-direct.avif` | Global Supply Network — col 1 (Direct) | Producer face-to-face, farmer + buyer | 5:3 landscape |
| `network-strategic.avif` | Global Supply Network — col 2 (Strategic) | Aerial farmland or regional production hub | 5:3 landscape |
| `network-phased.avif` | Global Supply Network — col 3 (Phased) | Detail shot — quality check, batch labels, paperwork | 5:3 landscape |
| `sustainability-environmental.avif` | Responsible Sourcing — left half (Environmental) | Soil, regenerative farming, water, sustainable agriculture | ~3:4 portrait |
| `sustainability-social.avif` | Responsible Sourcing — right half (Social) | Cooperative workers, community, training | ~3:4 portrait |
| `partnership.avif` | Supplier Partnerships block | Two people in conversation — supplier and buyer, handshake or meeting | 4:5 portrait |

## Notes

- All images load through `next/image` with the paths above — drop files at the exact filenames and they wire up automatically.
- Hero image gets a strong dark gradient (`from-obsidian via-obsidian/70`) — atmospheric or moody sources work well.
- Responsible Sourcing diptych sits on a forest-green section with a soft gradient on top — natural, mid-toned imagery reads best.
- Pillar cards get a subtle bottom-up dark gradient — any well-lit subject works.

---

# About Page

All images go in `public/images/about/`.

## Already in place (reused)

| Filename | Where it appears |
|---|---|
| `about-cover.avif` | (legacy hero — no longer referenced after redesign) |
| `about-retail.avif` | (legacy hero — no longer referenced after redesign) |
| `about-resturant.avif` | (legacy — no longer referenced after redesign) |
| `about-customer.avif` | (legacy — no longer referenced after redesign) |
| `about-timeline.avif` | (legacy — no longer referenced after redesign) |

> Note: the redesigned About page no longer reads the legacy filenames above. They can stay on disk for backup but are not wired into the new layout.

## New images required (24)

### Section 1 — Hero (cinematic feature + floating accent)
| Filename | Where it appears | Suggested subject | Aspect |
|---|---|---|---|
| `about-hero-feature.avif` | Hero — large right-side feature image | Editorial wide shot — golden hour over olive groves, terraced fields, or beekeepers at work; warm, atmospheric | 5:6 (portrait-leaning) |
| `about-hero-detail.avif` | Hero — small floating square top-right of feature | Tight macro — honeycomb, olive branch, hands holding produce; high-detail close-up | 1:1 square |

### Section 2 — Origin Story (Chapter One)
| Filename | Where it appears | Suggested subject | Aspect |
|---|---|---|---|
| `about-origin-honey.avif` | Origin — main vertical image | Honey jars, honey pour, raw honeycomb — amber, glowing | 4:5 portrait |
| `about-origin-grove.avif` | Origin — small square (left of pair) | Algerian olive grove or fig tree, soft natural light | 1:1 square |
| `about-origin-harvest.avif` | Origin — small square (right of pair) | Hands harvesting, basket of produce, traditional process | 1:1 square |

### Section 3 — Manifesto Banner
| Filename | Where it appears | Suggested subject | Aspect |
|---|---|---|---|
| `about-manifesto.avif` | Full-width 70vh cinematic banner (gets a heavy `obsidian/70` overlay + side gradient) | Wide, atmospheric landscape — sweeping farmland, distant horizon, dawn mist; works dark | Landscape, very wide (16:9 or wider) |

### Section 4 — International Structure (regional mosaic)
| Filename | Where it appears | Suggested subject | Aspect |
|---|---|---|---|
| `about-region-mena.avif` | Mosaic tile 01 — "5 Regional Offices" (portrait) | UAE / Middle East cityscape or trade hub, modern logistics | 4:5 portrait |
| `about-region-europe.avif` | Mosaic tile 02 — "4 Continents" (landscape) | European port, container terminal, or Mediterranean coastline | 16:10 landscape |
| `about-region-africa.avif` | Mosaic tile 03 — "Multi Region Capability" (very wide) | North African farmland panorama, or aerial of regional production | 21:8 ultra-wide panorama |

### Section 5 — Capabilities (bento)
| Filename | Where it appears | Suggested subject | Aspect |
|---|---|---|---|
| `about-capability-feature.avif` | Bento feature card — "From cultivation cycle to commercial shelf" | Warehouse / quality lab / pallet stack / hands inspecting product — operational and crafted | Portrait, ~3:4 (will be cropped tall) |

### Section 6 — Principles (subtle background)
| Filename | Where it appears | Suggested subject | Aspect |
|---|---|---|---|
| `about-principles-bg.avif` | Faded backdrop behind 6-card grid (renders at `opacity-[0.04]`) | Texture image — burlap, wood grain, soil, dried botanicals; dark and moody | Landscape, wide |

### Section 7 — Timeline (one image per milestone)
All 7 are `4:5` portrait, displayed in a horizontal scroll lane at ~340px wide. Each represents the milestone for that year.

| Filename | Year / Milestone | Suggested subject |
|---|---|---|
| `about-milestone-2020.avif` | 2020 — Foundation (honey, Algeria) | Beekeeper, hives, raw honeycomb, traditional Algerian setting |
| `about-milestone-2021.avif` | 2021 — Olive oil + dried fruit partnerships | Olive press, olive oil pour, dried figs in baskets |
| `about-milestone-2022.avif` | 2022 — Network expansion (N. Africa + S. Europe) | Map detail, Mediterranean port, regional farmland aerial |
| `about-milestone-2023.avif` | 2023 — Procurement framework | Documentation, structured archive, hands signing/inspecting |
| `about-milestone-2024.avif` | 2024 — Private label | Branded packaging, label detail, jar/bottle on neutral set |
| `about-milestone-2025.avif` | 2025 — Distribution (Middle East) | UAE/Dubai trade scene, containers, regional retail shelf |
| `about-milestone-2026.avif` | 2026 — International HQ | Modern office facade, UAE skyline, signing/handshake editorial |

### Section 9 — Founder
| Filename | Where it appears | Suggested subject | Aspect |
|---|---|---|---|
| `about-founder-portrait.avif` | Founder magazine spread — main portrait | Editorial portrait of Nabila Mellaz — warm, professional, natural light, looking thoughtful (not corporate stock) | 3:4 portrait |

### Section 10 — Team (4 portraits)
All 4 are `4:5` portrait, treated with a bottom-up dark gradient. Consistent lighting / palette across all four reads best.

| Filename | Role | Notes |
|---|---|---|
| `about-team-1.avif` | Founder & CEO | Can match `about-founder-portrait.avif` if it's the same person — or a different angle |
| `about-team-2.avif` | Head of Sourcing | Editorial workplace portrait |
| `about-team-3.avif` | Creative Director | Editorial workplace portrait |
| `about-team-4.avif` | Head of B2B | Editorial workplace portrait |

### Section 12 — CTA (full-bleed)
| Filename | Where it appears | Suggested subject | Aspect |
|---|---|---|---|
| `about-cta-bg.avif` | Full-bleed CTA background (gets a heavy `forest/85` + gradient overlay) | Sweeping farmland, sunlit field, or dignified agricultural scene; works very dark | Landscape, very wide |

## Notes

- All images load through `next/image` with the paths above — drop files at the exact filenames and they wire up automatically.
- The redesign trades the previous 4-image hero collage for a single feature image + small accent. If you only have one strong hero shot, prioritize `about-hero-feature.avif` and reuse a crop for `about-hero-detail.avif`.
- Manifesto banner, principles backdrop, and CTA background all sit under heavy overlays — darker, atmospheric, low-contrast sources work better than crisp marketing shots.
- Timeline images are the largest single batch (7). Visual consistency across them (palette, treatment, mood) matters more than perfect literal subject matches — they're meant to read as a unified series.
- Region mosaic uses three different aspect ratios (portrait → landscape → ultra-wide) so the tiles cascade. Don't try to use square crops — they'll get cropped hard.

---

# Retail Page

All images go in `public/images/retail/`.

> Note: the retail page was redesigned around the B2B retail-partner narrative in `md/retail.md` (working *with* retailers — supermarkets, specialty stores — not selling to consumers). The legacy consumer-facing category images (`retail-fresh.avif`, `retail-grocery.avif`, `retail-dairy.avif`, `retail-breads.avif`, `retail-organic.avif`, `retail-veg.avif`, `retail-cold.avif`, `retail-softdrinks.avif`) are no longer wired into the new layout. They can stay on disk but are unused.

## New images required (10)

### Section 1 — Hero (cinematic parallax)
| Filename | Where it appears | Suggested subject | Aspect |
|---|---|---|---|
| `hero-retail.avif` | Hero — full-bleed parallax background (gets a top-down obsidian gradient) | Wide cinematic shot — modern retail floor, distribution centre, port, or supermarket aisle at scale; atmospheric and architectural, works dark | Landscape, very wide (16:9 or wider) |

### Section 3 — Product Portfolio (bento mosaic)
Four category tiles in an asymmetric bento grid (wide → narrow → narrow → wide). Each gets a bottom-up dark gradient with the title overlaid in cream.

| Filename | Where it appears | Suggested subject | Aspect |
|---|---|---|---|
| `category-fresh.avif` | Tile 01 — Fresh & Perishable (wide) | Crates of fresh produce, refrigerated pallets, dairy crates moving through a controlled environment | 16:10 landscape |
| `category-shelfstable.avif` | Tile 02 — Packaged & Shelf-Stable (narrow) | Pantry/ambient packaged goods, structured shelf or warehouse rack | 4:3 |
| `category-specialty.avif` | Tile 03 — Specialty & Regional (narrow) | Origin-specific items — olive oil, honey, dried fruit, regional produce in a curated set | 4:3 |
| `category-privatelabel.avif` | Tile 04 — Private Label–Ready (wide) | Branded packaging detail, label-up jars/bottles on a clean neutral set | 16:10 landscape |

### Section 5 — Quality & Compliance (sticky image column)
| Filename | Where it appears | Suggested subject | Aspect |
|---|---|---|---|
| `retail-quality.avif` | Sticky portrait image in left column (paired with three numbered standards blocks) | Quality control / lab inspection — hands inspecting product, clipboard, structured documentation, audit-ready scene | 4:5 portrait |

### Section 6 — Private Label & Customisation (full-bleed split, forest-green)
| Filename | Where it appears | Suggested subject | Aspect |
|---|---|---|---|
| `retail-privatelabel.avif` | Left half of full-bleed forest-green section (gets soft side gradient) | Private-label packaging in production — labels, jars, branded pack format being finished or boxed; editorial product still | 4:5 portrait → tall (will min-h-170 on lg) |

### Section 8 — Partnership Model (editorial pull-quote)
| Filename | Where it appears | Suggested subject | Aspect |
|---|---|---|---|
| `retail-partnership.avif` | Image paired with the partnership pull-quote | Two people in conversation — buyer-side and supply-side meeting, a structured working scene (not a stock handshake) | 4:5 portrait |

### Section 9 — Geographic Expansion (region mosaic)
Three landscape tiles in an equal-thirds grid.

| Filename | Where it appears | Suggested subject | Aspect |
|---|---|---|---|
| `region-mature.avif` | Tile 01 — Mature Retail Markets | Modern trade chain interior, organised retail floor, or mature-market specialty store | 5:3 landscape |
| `region-growth.avif` | Tile 02 — Growth Markets | Emerging-market retail or trade scene — modern but evolving, regional context | 5:3 landscape |
| `region-local.avif` | Tile 03 — Local Assortment | Locally calibrated product mix on shelf, regional specialty, market detail | 5:3 landscape |

## Notes

- All images load through `next/image` with the paths above — drop files at the exact filenames and they wire up automatically.
- The hero gets a heavy top-down obsidian gradient — moody, architectural, low-contrast sources work better than bright marketing shots.
- The Private Label section sits on a forest-green background with a soft side gradient — natural, mid-toned product imagery reads best.
- Bento portfolio tiles all get a bottom-up obsidian gradient for the overlaid title — well-lit subjects with quiet upper portions work best.
- Region mosaic uses identical 5:3 aspect ratios across all three tiles — keep visual treatment consistent so the row reads as a single composition.

---

# B2B Solutions Page

All images go in `public/images/b2b/`.

> Note: the B2B page was redesigned around the institutional-buyer narrative in `md/b2b.md` (foodservice, manufacturers, institutional buyers, wholesale — operations + reliability + volume). The legacy generic commercial images (`commercial-cafe.avif`, `commercial-factory.avif`, `commercial-farm.avif`, `commercial-logistics.avif`, `commercial-resturant.avif`) are no longer wired into the new layout. They can stay on disk but are unused.

## New images required (10)

### Section 1 — Hero (cinematic parallax)
| Filename | Where it appears | Suggested subject | Aspect |
|---|---|---|---|
| `hero-b2b.avif` | Hero — full-bleed parallax background (gets a top-down obsidian gradient) | Wide cinematic shot — port at scale, container terminal, distribution centre, or industrial-scale food production floor; atmospheric and architectural, works dark | Landscape, very wide (16:9 or wider) |

### Section 3 — Customer Segments (bento mosaic)
Four segment tiles in an asymmetric bento grid (wide → narrow → narrow → wide). Each gets a bottom-up dark gradient with the title overlaid in cream.

| Filename | Where it appears | Suggested subject | Aspect |
|---|---|---|---|
| `b2b-segment-horeca.avif` | Tile 01 — Foodservice Operators (wide) | Professional restaurant pass / hotel kitchen / chef line at scale; busy, controlled environment | 16:10 landscape |
| `b2b-segment-manufacturer.avif` | Tile 02 — Food Manufacturers (narrow) | Industrial food processing line, conveyor / packaging plant, ingredient-grade volume | 4:3 |
| `b2b-segment-institutional.avif` | Tile 03 — Institutional Buyers (narrow) | Large-scale catering kitchen / corporate canteen / hospital or campus foodservice | 4:3 |
| `b2b-segment-wholesale.avif` | Tile 04 — Wholesale Distributors (wide) | Wholesale warehouse, pallet stacks, forklift / cash-and-carry floor | 16:10 landscape |

### Section 4 — Product & Category Coverage (sticky portrait + numbered list)
| Filename | Where it appears | Suggested subject | Aspect |
|---|---|---|---|
| `b2b-categories.avif` | Left-column portrait paired with the four numbered category blocks | Editorial composite — bulk crates, sacks, or category mix in a controlled warehouse / handling environment; institutional in feel | 4:5 portrait |

### Section 5 — Supply Chain & Fulfilment (faded backdrop, dark section)
| Filename | Where it appears | Suggested subject | Aspect |
|---|---|---|---|
| `b2b-supply-chain.avif` | Faded backdrop behind the dark Supply Chain section (renders at `opacity-25` with a heavy obsidian overlay) | Texture-rich, atmospheric — port lights at night, container yard from above, distribution hub at dusk; dark and moody | Landscape, wide |

### Section 6 — Quality & Compliance (sticky image column)
| Filename | Where it appears | Suggested subject | Aspect |
|---|---|---|---|
| `b2b-quality.avif` | Sticky portrait image in left column (paired with three numbered standards blocks) | QC inspector with clipboard, structured documentation, lab/audit scene; institutional, audit-ready feel | 4:5 portrait |

### Section 7 — Customisation & Contract Supply (full-bleed split, forest-green)
| Filename | Where it appears | Suggested subject | Aspect |
|---|---|---|---|
| `b2b-customisation.avif` | Left half of full-bleed forest-green section (gets soft side gradient) | Custom packaging / private-spec labelling in production, branded jars or sacks being finished, contract pack format | 4:5 portrait → tall (will min-h-170 on lg) |

### Section 10 — Partnership Model (editorial pull-quote)
| Filename | Where it appears | Suggested subject | Aspect |
|---|---|---|---|
| `b2b-partnership.avif` | Image paired with the partnership pull-quote | Procurement / supply-chain meeting — two people reviewing a spec sheet or contract, structured working scene (not a stock handshake) | 4:5 portrait |

## Notes

- All images load through `next/image` with the paths above — drop files at the exact filenames and they wire up automatically.
- The hero gets a heavy top-down obsidian gradient — moody, architectural, low-contrast sources work better than bright marketing shots.
- The Customisation section sits on a forest-green background with a soft side gradient — natural, mid-toned product imagery reads best.
- Bento segment tiles all get a bottom-up obsidian gradient for the overlaid title — well-lit subjects with quiet upper portions work best.
- The Supply Chain backdrop renders at `opacity-25` under heavy obsidian overlay — texture-rich, atmospheric sources work well; literal subject matters less than mood.
- B2B imagery should skew **operational and institutional** — not the editorial / origin-story palette of About or Sustainability. Volume, structure, and discipline read better than artisan craft here.
