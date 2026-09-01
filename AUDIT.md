# Delicious Planet — Full Site Audit & Completion Roadmap

_Audit date: 2026-08-08 · Branch `master` @ `032f675`_

## Context

`delicious-planet` is a Next.js 16 + Payload CMS 3.80 (Postgres) premium food-ingredients
site, built against the 10-phase spec in [md/plan-deliciousPlanet.prompt.md](md/plan-deliciousPlanet.prompt.md).
Phases 1–5b landed; the site has 26 routes, ~93 components and a 16-collection CMS.

This audit answers: what is broken, what contradicts itself, and what is still missing.

**Headline:** the codebase is well-structured and typechecks clean, but it is **not
deployable as-is**. Three classes of problem block launch — (1) exploitable access-control
holes, (2) ~86 missing image files that visually break 7 of the marketing pages, and
(3) several features that are wired to look like they work but silently do nothing.

Verification performed: `npx tsc --noEmit` passes clean; `npx eslint .` crashes; asset
references cross-checked against `public/` on disk; Payload's `defaultAccess` read directly
from `node_modules` to confirm the access-control conclusions.

**Assumptions made** (flagged rather than blocking):
- The inquiry-style checkout is intentional, so Stripe is treated as *unwired*, not *broken*.
- The ~86 missing images are pending photography, not lost files.
- Marketing pages stay hardcoded; the orphaned CMS page-builder is treated as dead weight.

---

## P0 — Security (exploitable today)

### 1. Committed admin password — FIXED
[scripts/reset-admin.ts](scripts/reset-admin.ts) hardcoded a shared password (redacted here; see
git history of that file) for three real admin accounts (`admin@`, `raj@`,
`nabila@deliciousplanet.co`), printed it to stdout, and `scripts/` is **not** in
[.gitignore](.gitignore) — a `git add -A` would have committed it to a public repo.

→ The script now requires `ADMIN_RESET_PASSWORD` from the environment and refuses to run without
it. **Still outstanding: rotate the password on all three accounts**, since it was in plaintext on
disk and may have been used.

### 2. Missing collection access control → privilege escalation
Payload's default is `({ req: { user } }) => Boolean(user)` (verified in
`payload/dist/auth/defaultAccess.js`), and REST runs with `overrideAccess: false`.
Ten collections define **no** `access` block: `Users`, `Products`, `Categories`,
`Suppliers`, `Warehouses`, `Brands`, `ProductCollections`, `Testimonials`,
`OfficeLocations`, `BlogCategories`.

Consequences:
- **Any logged-in customer can PATCH any other user** — including `password` → account takeover.
- Any logged-in customer can create/edit/delete products, categories, media, brands.
- **Public registration is broken**: anonymous `POST /api/users` from
  [src/app/(frontend)/register/page.tsx](src/app/(frontend)/register/page.tsx) line 36 returns 403.
- [src/collections/Users.ts](src/collections/Users.ts) line 30 guards `roles` on *update* only —
  no `create` guard, so once registration is opened a client can self-assign `roles: ['admin']`.

→ Add explicit `access` to every collection. `Users`: `create: () => true`, read/update scoped
to `id === user.id` or admin, plus a `create` guard on the `roles` field.
Catalogue collections: `read: () => true`, writes admin-only.

### 3. Forgeable orders
[src/collections/Orders.ts](src/collections/Orders.ts) line 16 is `create: () => true`, and
[src/components/sections/CheckoutClient.tsx](src/components/sections/CheckoutClient.tsx)
lines 150–174 send `unitAmount`, `totals`, `status` **and** `user` id entirely from the client.
There is no `beforeChange` re-pricing hook.

→ Anyone can POST an order with `total: 0`, arbitrary items, `status: 'shipped'`, or another
user's id. Add a `beforeChange` hook that re-reads prices from `products`, recomputes totals,
forces `status: 'pending'`, and derives `user` from `req.user` (never the body).

### 4. Test helper seeds an admin against whatever DB `.env` points at
[tests/helpers/seedUser.ts](tests/helpers/seedUser.ts) lines 4–8 delete-then-create
`dev@payloadcms.com` / `test` with `roles: ['admin']`, with no test-DB guard.

---

## P0 — Visually broken

### 5. 86 of ~131 referenced images do not exist
Every `/images/...` reference in `src/` was cross-checked against `public/`.
[md/required-images.md](md/required-images.md) is the unfulfilled spec.

| Page client | Missing / referenced |
|---|---|
| `AboutPageClient.tsx` | **20 / 20** (incl. 7 timeline, 4 team) |
| `ExperiencePageClient.tsx` | **13 / 13** |
| `RetailPageClient.tsx` | **11 / 11** |
| `B2BSolutionsPageClient.tsx` | **10 / 10** |
| `SourcingPageClient.tsx` | 10 / 11 |
| `VendorsPageClient.tsx` | **9 / 9** (`public/images/vendor/` doesn't exist) |
| `SustainabilityPageClient.tsx` | 8 / 12 |
| `RecipesPageClient.tsx` | 1 / 6 |

Meanwhile **29 images on disk are referenced nowhere** — the old `retail-fresh/grocery/dairy…`
and `commercial-*` sets the redesign abandoned. Home, contact, policies, collections,
partner-logos and mega-menu resolve correctly.

→ Two-part fix: a `SafeImage` wrapper with a branded gradient fallback so pages degrade
gracefully, plus dropping the real AVIFs at the exact `required-images.md` filenames.
Delete the 29 orphaned files.

---

## P1 — Features that look like they work but don't

| # | Issue | Location |
|---|---|---|
| 6 | **Homepage contact form is a no-op.** `handleContactSubmit` only calls `setContactSubmitted(true)` — no fetch. User is told "Message sent." | `src/components/sections/NewsletterSection.tsx:17-21` |
| 7 | **No email adapter configured at all.** Password reset delivers nothing, yet the UI always shows success. Order-confirmation email promised on the success page is never sent. | `src/payload.config.ts`, `forgot-password/page.tsx:29-33` |
| 8 | **No `/reset-password` route** — Payload's emailed reset link lands in `/admin`. | — |
| 9 | `?redirect=` is written by `src/proxy.ts:17` but never read; login always pushes `/account`. | `login/page.tsx:34` |
| 10 | Six recipe tiles link to `/journal?category=…`; the journal page only reads `?page` and filters via local state. All six land unfiltered. | `RecipesPageClient.tsx:14-49` |
| 11 | `/contact?type=b2b` is linked from product and B2B pages, but `ContactPageClient` hardcodes `useState('general')`. | `ContactPageClient.tsx` |
| 12 | Footer newsletter treats HTTP 400/409 as success. | `Footer.tsx:167` |
| 13 | **Size variants are display-only** — rendered, but no selection state; cart always uses `prices[0]`, so variant SKU/price never reach the order. | `ProductDetail.tsx:401-412` |
| 14 | **Inventory is dead schema.** `inventoryLevels`, `reservedQuantity`, `lowStockThreshold` are stored but never read or decremented. | `src/collections/Products.ts` |
| 15 | Guest orders can never be read back — read access returns `false` for anonymous, and there's no order-detail route. | `src/collections/Orders.ts:17-21` |
| 16 | Template route still live at `/my-route`, returns `"This is an example of a custom route."` | `src/app/my-route/route.ts` |

---

## P1 — Content mismatches & false claims

- **`FAQSection.tsx` lines 31 and 36 contradict the actual site**: promises "3–7 business days",
  "Express options are available at checkout" and a "48 hours" returns window. Checkout collects
  no payment and offers no shipping options; `/shipping` and `/policies` deliberately give no
  timelines.
- Placeholder contact details shipped live: `tel:+1234567890`, `wa.me/1234567890`
  (`FloatingElements.tsx:72,105`).
- Social links are bare domains — `https://instagram.com`, `facebook.com`, `x.com`,
  `pinterest.com` — no brand accounts (`MegaMenu.tsx:242-270`, `Footer.tsx:60-120`).
- Domain mismatch: UI uses `info@deliciousplanet.com`, admin accounts use `deliciousplanet.**co**`.
- About page ships fabricated traction: "25+ sourcing partners", "4 continents", "7+ years",
  "100% traceable", a 2020→2026 timeline, and four team cards literally named **"Team Member"**
  (`AboutPageClient.tsx:72-135,773`).
- `"Portfolio details coming soon."` ships to users (`BrandsPageClient.tsx:153`).
- `CollectionCards.tsx:10-26` `STATIC_IMAGES` **overrides** CMS-uploaded collection images —
  editors' uploads are silently ignored.
- Nav has already drifted: the menu has `Retail`, the footer doesn't; the footer has
  `My Account`, the menu doesn't. No seed populates the `navigation` global, so the hardcoded
  fallbacks are what actually ship.

---

## P1 — Deployment blockers

- **No `migrations/` directory and no `migrationDir` configured.** Schema exists only via dev
  push mode — there is no safe production deploy path. Run `payload migrate:create`.
- [src/payload.config.ts](src/payload.config.ts) lines 58, 64, 74 use `process.env.X || ''` —
  the app boots with an **empty `PAYLOAD_SECRET`** instead of failing fast.
- [.env.example](.env.example) is 2 stale lines documenting **MongoDB**; the project runs
  Postgres. Missing `BLOB_READ_WRITE_TOKEN`, `PAYLOAD_URL`, `PAYLOAD_SEED_EMAIL`,
  `PAYLOAD_SEED_PASSWORD`.
- [docker-compose.yml](docker-compose.yml) provisions **MongoDB**; [README.md](README.md) is
  still the Payload blank template, as is `package.json` line 5's description.
- [Dockerfile](Dockerfile) lines 66–67 copy `.next/standalone`, but `next.config.ts` has no
  `output: 'standalone'` → **Docker build is broken**.
- **ESLint has never run**: [eslint.config.mjs](eslint.config.mjs) line 3 imports
  `@eslint/eslintrc`, which is not a declared dependency. `next build` doesn't run ESLint in
  Next 16, so nothing gates code quality.

---

## P2 — SEO (currently near-zero)

Missing entirely: **favicon**, `robots.ts`, `sitemap.ts`, `opengraph-image`, `manifest`,
`metadataBase`, any `openGraph`/`twitter`/canonical config, and all JSON-LD.
The `og` 1200×630 Media size is defined but never consumed.

Pages with **no** metadata — including the two highest-value SEO surfaces:
`/` (home), `/products`, **`/products/[slug]`** (no `generateMetadata`), `/categories`,
`/categories/[slug]`, `/account` (also needs `noindex`), `/login`, `/register`,
`/forgot-password`.

Also absent across `(frontend)`: `not-found.tsx`, `error.tsx`, `loading.tsx`. `notFound()` is
called in three pages with no custom 404 UI, and no `catch` block anywhere logs or reports.

---

## P2 — Accessibility & performance

- 32 of 94 `alt` attributes are empty; several are content/hero imagery, not decorative
  (`AboutPageClient` alone has 14 images with only 2 real alts).
- Raw `<img>` instead of `next/image` in `Footer.tsx:171` and `MegaMenu.tsx:158,208`.
- **No `prefers-reduced-motion` handling anywhere**, despite heavy Framer Motion + GSAP + Lenis.
- Autoplay videos with no `poster`, no `preload` hint, no `<track>`.
- Tab UIs use plain buttons without `role="tab"` / `aria-selected`; no skip-to-content link;
  `<main>` has no `id`.
- **`public/planet.mov` — 11.9 MB, referenced nowhere**, shipped in the deploy.
  `chef-hero.mp4` is 6.8 MB.

---

## P2 — Dead code (~1,000 lines)

Never imported: `ExperiencesPageClient.tsx` (superseded by the singular
`ExperiencePageClient.tsx`), `MobileNav.tsx`, `ExperienceSection.tsx`, `BecomeVendorCTA.tsx`,
`AnimatedSection.tsx`, the unused `MegaMenu` dropdown export, plus barrel-only
`PageTransition`, `ParallaxImage`, `ScrollVideo`, `TextReveal`, `Badge`, `Section`.
Also `md/page.tsx` (0-byte, committed).

**Orphaned CMS page-builder:** [src/collections/Pages.ts](src/collections/Pages.ts) and all 11
blocks in [src/blocks/index.ts](src/blocks/index.ts) are fully defined, but there is no `[slug]`
route and no block renderer — `'pages'` is never queried by the frontend. The admin advertises
a page-builder that produces nothing.

**Unwired dependencies:** `stripe` + `@stripe/react-stripe-js` (zero source references),
`next-intl` (no `src/i18n`, no locale routing — Phase 7 entirely unbuilt; multi-currency is
nominal, `preferredCurrency` is stored but never used). `@types/gsap` is a deprecated stub.

---

## P2 — Tests

Both harnesses are configured; **not one test covers this project's own code.**
- `tests/int/api.int.spec.ts` — a single `expect(users).toBeDefined()`.
- **`tests/e2e/frontend.e2e.spec.ts` lines 13–18 always fail** — they assert
  `toHaveTitle(/Payload Blank Template/)` and an `h1` of `"Welcome to your new project."`.
- `playwright.config.ts` line 25 has `baseURL` commented out; no CI workflow exists.

---

## Suggested execution order

1. **Secure** — rotate the admin password + gitignore `scripts/`; add `access` to all ten
   collections; add the Orders `beforeChange` re-pricing hook; guard the `roles` field on create.
2. **Unbreak** — `SafeImage` fallback + drop in real AVIFs; wire the homepage contact form;
   configure an email adapter; add `/reset-password`; honour `?redirect=`, `?category=`, `?type=`.
3. **Truth-up content** — reconcile FAQ against `/shipping` and `/policies`; replace placeholder
   phone/social/team data; remove the `STATIC_IMAGES` override; reconcile nav drift.
4. **Deployable** — generate migrations; fail fast on missing env; rewrite `.env.example`,
   `README`, `docker-compose`; fix the Dockerfile/`standalone` mismatch; repair ESLint.
5. **Findable** — favicon, robots, sitemap, `metadataBase`, OG images, `generateMetadata` on
   product/category/home, JSON-LD, `not-found.tsx` + `error.tsx`.
6. **Clean** — delete ~1,000 lines of dead components, the 29 orphaned images, `planet.mov`,
   `/my-route`; decide the fate of the orphaned page-builder and the unwired
   Stripe / `next-intl` deps.
7. **Prove it** — fix the failing e2e spec, set `baseURL`, add smoke tests for the flows above.

---

## Verification

- `npx tsc --noEmit` — must stay clean.
- `npx eslint .` — must run at all (currently crashes).
- `pnpm dev`, then walk `/about`, `/b2b`, `/retail`, `/sourcing`, `/sustainability`,
  `/vendors`, `/experiences` with devtools Network open — **zero 404s on `/images/**`**.
- Register a new user at `/register` — must succeed (currently 403s).
- As customer A, `PATCH /api/users/<B's id>` — must be denied.
- `POST /api/orders` with `total: 0` and a foreign `user` id — must be rejected / recomputed.
- Submit the homepage contact form, then confirm the record exists in `/admin`.
- `pnpm test:e2e` — must pass.
