# Plan: Delicious Planet — Phased Build with Model Assignments

Build the premium food ingredients website in ordered phases. Complex/creative phases use **Opus 4.6**, straightforward/boilerplate phases use **Sonnet 4.6**. Deploy at the halfway mark, then push incremental updates per phase.

---

## PART A — Build to First Deployment (Phases 1–5a)

### Phase 1: Project Scaffolding & Infrastructure — `Sonnet 4.6`
> Straightforward setup, no creative decisions

1. `npx create-payload-app@latest` with Next.js 15 + PostgreSQL template (App Router)
2. Folder structure: `/collections`, `/globals`, `/blocks`, `/components` (ui/layout/sections/animations), `/i18n`, `/lib`
3. Railway PostgreSQL — create instance, wire `DATABASE_URI` to `@payloadcms/db-postgres`
4. Install deps: `framer-motion`, `gsap`, `lenis`, `next-intl`, `stripe`, `@stripe/react-stripe-js`
5. Tailwind config — premium tokens: serif headings (`Playfair Display`/`Cormorant Garamond`), sans body (`Inter`/`DM Sans`), generous whitespace, 0–4px radii, RTL support classes
6. Create reusable animation wrappers: `<FadeIn>`, `<TextReveal>`, `<ParallaxImage>`, `<MagneticButton>`, `<SmoothScroll>`, `<PageTransition>`

**Verification:** `next dev` runs, Payload admin loads at `/admin`, Tailwind styles apply, animation components render

---

### Phase 2: Payload CMS Data Model — `Sonnet 4.6`
> Schema definitions are formulaic — collections, fields, relations

All steps parallel:
1. **Products** — title, slug, description (richText), prices array ({currency, amount}), images array, category (rel), origin, weight, sku, inStock, isFeatured, supplier (rel), SEO meta. Draft/publish
2. **Categories** — title, slug, description, image, parent (self-ref). Seed 7 categories
3. **Suppliers** — name, slug, logo, website, country. Seed: Admiral Caviar, Velsoro, Casinetto, Cebon
4. **Users** (extend Payload auth) — email, password, name, phone, addresses array, role (customer/admin), preferredCurrency, preferredLanguage
5. **Orders** — orderNumber, user (rel), items array, totals, currency, status enum, shippingAddress, stripePaymentIntentId, type
6. **B2B Inquiries** — company, contact, email, products (rel), message, status, assignedOffice
7. **Content collections** — Pages (block-based), Blog Posts + Blog Categories, Testimonials, Office Locations
8. **Globals** — SiteSettings (logo, socials, announcement bar), Navigation (main nav + footer columns)
9. **Media** — image optimization with responsive sizes (400w, 800w, 1920w, OG 1200×630)

**Verification:** All collections visible in `/admin`, CRUD works, seed data created

---

### Phase 3: Page Builder Blocks — `Sonnet 4.6`
> Block definitions are schema work, no UI rendering yet

1. Define blocks for Pages `layout` field: HeroBlock, FeaturedProductsBlock, CategoryShowcaseBlock, TestimonialsBlock, ExperienceBlock, StoryBlock, OfficeLocationsBlock, NewsletterBlock, PartnersLogoBlock, CTABannerBlock, RichContentBlock

**Verification:** Blocks available in Pages editor in admin

---

### Phase 4: Frontend Layout, Navigation & Shell — `Opus 4.6`
> Complex — glassmorphism header, mega menu, animations, cart drawer

1. **Root layout** — SmoothScroll, PageTransition, i18n provider, auth context, cart context. Load fonts, meta defaults from SiteSettings global
2. **Header** — transparent-on-hero → solid-on-scroll with glassmorphism. Logo | centered nav | search + account + cart + language/currency switcher. Mega menu for Products (category images). Full-screen mobile overlay with staggered Framer animations
3. **Footer** — 5-column: Brand story, Quick Links, Categories, Offices, Newsletter. Social row, payment icons, legal
4. **Cart drawer** — Framer Motion slide-in from right. Line items with qty controls, subtotal, checkout CTA. localStorage + React context persistence

**Verification:** Header transitions on scroll, mega menu opens, mobile nav works, cart drawer opens/closes, footer renders

---

### Phase 5a: Core Pages (Homepage + Products) — `Opus 4.6`
> Most creative/complex phase — cinematic homepage, GSAP scroll animations, parallax

1. **Homepage** (`/`) — savor.it-inspired:
   - Full-viewport hero with `<TextReveal>` headline, `<MagneticButton>` CTA
   - Brand statement with scroll-triggered word reveal (GSAP)
   - Category horizontal scroll strip with parallax images
   - Featured products 3-col grid (properhealth.com-style cards with hover zoom)
   - Experience/story section: full-bleed parallax, pinned scroll with image transitions (maxwellwines.com.au-style)
   - Testimonials carousel, Office locations, Newsletter CTA, Partners marquee

2. **Products listing** (`/products`) — properhealth.com-inspired:
   - Filter sidebar (category, origin, price, supplier) + sort
   - 3–4 column product grid with hover effects
   - URL-based filter state for SEO, pagination

3. **Single product** (`/products/[slug]`) — properhealth.com-inspired:
   - Two-col: image gallery + lightbox | product info + "Add to Cart" + "Inquire for Bulk" modal
   - Tabs: Description, Specs, Shipping. Related products carousel

4. **Category page** (`/categories/[slug]`) — hero + pre-filtered product grid

**Verification:** Homepage animations play, scroll triggers fire, product browse → detail flow works, filters work

---

## >>> FIRST DEPLOYMENT — Deploy to Vercel + Railway <<<

Deploy the site at this point:
- Vercel for Next.js + Payload
- Railway for PostgreSQL
- Media via `@payloadcms/storage-vercel-blob` or Cloudflare R2
- Env vars: DB, Payload secret, site URL
- Site is live with: homepage, products, categories, CMS admin, cart (no checkout yet)

---

## PART B — Incremental Deployments (one push per phase)

### Phase 5b: Remaining Pages — `Sonnet 4.6`
> Straightforward page builds following established patterns

1. **Experiences** (`/experiences`) — immersive sections per theme (use Phase 5a patterns)
2. **About** (`/about`) — brand story timeline, team placeholders, values cards, office locations
3. **Blog/Journal** (`/journal` + `/journal/[slug]`) — grid + category tabs, single post with hero + rich content + related posts
4. **Contact** (`/contact`) — form + office selector + B2B inquiry section

**Deploy** after completion

---

### Phase 6: Auth & Account — `Sonnet 4.6`
> Standard auth flow using Payload's built-in auth endpoints

1. `/login`, `/register`, `/forgot-password` pages
2. `/account` — order history, addresses, profile editing
3. Wire to Payload auth endpoints
4. Protected route middleware

**Deploy** after completion

---

### Phase 7: i18n & Multi-Currency — `Sonnet 4.6`
> Configuration-heavy, follows next-intl docs

1. `next-intl` with routes `/en/...`, `/ar/...`, `/es/...`, `/fr/...`
2. Middleware for locale detection
3. RTL for Arabic (Tailwind `rtl:` + `dir="rtl"`)
4. Payload field-level localization on content fields
5. Translation JSONs per locale
6. Currency context/provider, header selector (USD/AED/GBP/EUR/INR)
7. `Intl.NumberFormat` display, Stripe uses selected currency

**Deploy** after completion

---

### Phase 8: Stripe Checkout — `Opus 4.6`
> Security-critical — payment intents, webhooks, error handling

1. Server Action to create Stripe payment intents
2. Stripe Elements in multi-step checkout (shipping → payment → review → confirm)
3. Guest checkout option
4. Webhook at `/api/webhooks/stripe` — handle `payment_intent.succeeded` and `payment_intent.payment_failed`
5. Update order status, link to user account

**Deploy** after completion

---

### Phase 9: Animation Polish — `Opus 4.6`
> Creative finesse — performance tuning, 60fps target

1. Lenis smooth scroll tuning
2. Route transitions (Framer AnimatePresence)
3. Scroll-triggered `<FadeIn>` stagger on all sections
4. Product card hover effects (scale, shadow, button reveal)
5. Header scroll transition polish
6. Branded skeleton loaders
7. `prefers-reduced-motion` support
8. 60fps audit and GPU-only transforms

**Deploy** after completion

---

### Phase 10: SEO & Performance — `Sonnet 4.6`
> Standard SEO checklist, performance best practices

1. Dynamic meta from Payload, OG/Twitter cards
2. JSON-LD (Organization, Product, BreadcrumbList)
3. `next-sitemap` for sitemap.xml, robots.txt, canonical URLs with locale
4. Next.js `<Image>` with blur placeholders
5. Font subsetting (Arabic), lazy-load below-fold

**Deploy** — final production push

---

## Model Assignment Summary

| Phase | Description | Model | Reason |
|-------|------------|-------|--------|
| 1 | Scaffolding & Infrastructure | Sonnet 4.6 | Boilerplate setup |
| 2 | CMS Data Model | Sonnet 4.6 | Schema definitions |
| 3 | Page Builder Blocks | Sonnet 4.6 | Schema definitions |
| 4 | Layout, Nav & Shell | **Opus 4.6** | Complex UI, animations, glassmorphism |
| 5a | Homepage + Products | **Opus 4.6** | Cinematic design, GSAP, parallax |
| **DEPLOY** | **First deployment** | — | — |
| 5b | Remaining Pages | Sonnet 4.6 | Follow established patterns |
| 6 | Auth & Account | Sonnet 4.6 | Standard auth flows |
| 7 | i18n & Multi-Currency | Sonnet 4.6 | Configuration-heavy |
| 8 | Stripe Checkout | **Opus 4.6** | Security-critical payments |
| 9 | Animation Polish | **Opus 4.6** | Creative finesse, perf tuning |
| 10 | SEO & Performance | Sonnet 4.6 | Standard checklist |

## Verification (end-to-end after all phases)

1. Payload admin — CRUD all collections, test data
2. Homepage — all animations play, scroll triggers fire
3. Full product flow — browse → detail → cart → checkout → Stripe test payment
4. B2B inquiry — submit → verify in Payload
5. i18n — switch to Arabic → RTL layout + locale URL
6. Multi-currency — switch → prices update across site + checkout
7. Auth — register → login → order → account dashboard
8. Blog — create post in admin → verify on `/journal`
9. Responsive — 375px, 768px, 1440px
10. Lighthouse — target 90+ Performance, Accessibility, SEO
