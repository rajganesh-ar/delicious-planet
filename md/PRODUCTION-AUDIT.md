# Production readiness audit: Delicious Planet

**Date:** 2026-10-05

**Scope:**
- **Code:** every storefront route, the purchase flow from basket to Stripe
  to fulfilment, access control on all 21 collections and both globals, the
  partner portals, forms and emails, accessibility, SEO and performance.
- **Running app:** a production build was crawled at desktop and phone width.

**Out of scope:** supplier data, DNS and missing content. These are covered in
[`OPEN-ISSUES.md`](OPEN-ISSUES.md) and were not re-audited.

## Verdict

The purchase path is now safe to take real orders through:

- Prices are always recomputed on the server.
- Payments are confirmed against Stripe and recorded exactly once.
- A refund can no longer bring an order back into the shipping queue.
- No customer can read another customer's data or any staff-only data.

The fixes are listed in [§2](#2-fixed-in-this-pass).

Four things are not code bugs but should be settled before the site is
promoted, because they are promises the shop currently does not keep:

- the shipping charge (B1)
- VAT (B2)
- the advertised 10% discount (B3)
- the repository being public (A1)

They are in [§1](#1-decide-before-launch).

## Verification

| Check | Result |
|---|---|
| `npx tsc --noEmit` | Clean |
| `pnpm lint` | 0 problems. The one warning before this pass (the Google Fonts `<link>`) is gone. |
| `pnpm test:int` | 122 of 122 pass. There were 107; 15 new tests cover the payment, refund, redirect and pricing fixes. |
| `pnpm build` (production) | Passes |
| Crawl of the production build | 39 routes × 2 viewports = 78 page loads, all 200 except the deliberate 404. 0 uncaught JS errors, 0 broken images, 0 images without `alt`, 0 unnamed buttons or links, 0 horizontal overflow, exactly one `<h1>` per page. The first Tab lands on a visible "Skip to content". |
| Internal links found by the crawl | 269 checked, 0 broken |
| Product page caching, after the fix | First visit 9.6 s (render), then 0.03 s and 0.004 s from cache. Unknown slugs still 404. |
| Basket drawer, driven with a real browser | Scrolls by wheel. 40 Tab presses, 0 left the drawer. Escape returns focus to the button that opened it. Each line shows its size. |
| Row lock against the live Postgres (read-only: nonexistent order id) | Transaction, `SELECT … FOR UPDATE` and commit all work through the real adapter |
| Live endpoints on the build | `/api/graphql` → 404. `/api/globals/site-settings` no longer returns the staff mailbox. `?page=-1` and `?page=Infinity` render. |
| `pnpm migrate:status` | All 12 migrations applied. This pass needs no new migration. |
| Test admin `dev@payloadcms.com` in production | Not present. There are 4 admin accounts. |

Nothing was written to the production database, and nothing was sent to Stripe
or SMTP.

---

## 1. Decide before launch

These need a business decision or an account change, so they were not changed
in code.

### A. Accounts and infrastructure

| # | Issue | Why it matters | What to do |
|---|---|---|---|
| A1 | **The GitHub repository is public.** An anonymous request to `api.github.com/repos/rajganesh-ar/delicious-planet` returns 200. | It publishes the admin login emails (`src/lib/contact.ts`, `md/scripts/reset-admin.ts`), supplier price comparisons (`OPEN-ISSUES.md`), the full access-control logic, and every internal note in `md/`. | Make it private (GitHub → Settings → Danger zone). Vercel deploys from private repos without any change. |
| A2 | **Admins can be locked out by anyone.** Payload locks an account for 10 minutes after 5 failed logins, and the admin addresses are public (see A1). | Five bad requests every ten minutes per address keeps every admin out of `/admin` indefinitely. That is well under the rate limit. | Sign in to the admin with addresses that are not published anywhere, and keep the public ones as mailboxes only. |
| A3 | **Rate limits do not hold on Vercel.** `src/lib/rate-limit.ts` counts in each server instance's memory, and Vercel runs many instances. | Login, sign-up, checkout, enquiry and newsletter limits are effectively per instance, so a script spread across instances is barely slowed. | Move the counter to a shared store (Upstash Redis or Vercel KV), or add Vercel Firewall rate-limit rules for `/api/users/login`, `/api/checkout/session`, `/api/b2b-inquiries`, `/api/newsletter-subscribers` and `/api/portal/*`. |
| A4 | **Auth cookie hardening.** The cookie is HttpOnly and SameSite=Lax, but not `Secure`, and `csrf` and `serverURL` are unset. | Today SameSite=Lax is what protects writes. It stops protecting them if media ever moves to a `*.deliciousplanet.co` subdomain. | Set `auth.cookies.secure` in production, plus `serverURL` and `csrf: [SITE_URL]` in `payload.config.ts`. Check the Vercel preview domains first, or admin logins on previews will fail. |
| A5 | **The password minimum is only enforced in the browser.** The server accepts Payload's default of 3 characters. | Anyone using the API directly can set a 3-character password. | Add a `beforeOperation` hook on Users that rejects passwords under 8 on create, update and reset. |

### B. Promises the shop does not keep yet

| # | Issue | What the site says | What actually happens | What to do |
|---|---|---|---|---|
| B1 | **Delivery is never charged.** | "Complimentary UAE delivery on orders over AED 250" (header, buy box, basket meter), "Standard / Express / International" (product page), "Ships worldwide" (top bar), "calculated at checkout" (basket) | Shipping is hard-coded to 0 (`src/app/api/checkout/session/route.ts`), Stripe charges the subtotal, and the receipt says "Shipping: Free". A 40 AED order to London is charged 40 AED. | Decide the rule: UAE fee below 250, which countries, whether Express exists. Then compute it in `priceCart`, send it to Stripe as a line item or `shipping_options`, and make the copy match. |
| B2 | **VAT.** | "Incl. VAT" (buy box) | `totals.tax` is always 0, and neither the order nor the receipt shows VAT. | If the business is VAT-registered, the receipt has to work as a tax invoice (TRN, VAT amount). Decide, then record VAT on the order and print it on the receipt. |
| B3 | **The 10% newsletter discount doesn't exist.** | "Sign up and get 10% off your first order" (`src/components/sections/home/NewsletterBar.tsx`) | There is no discount or promotion code anywhere, and the welcome email has no code. | Either create a Stripe promotion code, turn on `allow_promotion_codes` in the session, and put the code in the welcome email, or remove the claim. |
| B4 | **Published chef recipes appear nowhere.** | Chef portal: "published recipes are live on the site" | No storefront page reads the `recipes` collection. `/recipes` is a static page and `/recipes/<slug>` doesn't exist. This pass removed the 404 links (see §2). | Build `/recipes/[slug]` and list published recipes on `/recipes`, or pause chef sign-ups until then. |
| B5 | **Stock is never decremented.** | "In stock — ships within 48 hours" | Only the `inStock` flag is checked. The per-warehouse `inventory.quantity` fields are never read or reduced, so the last jar can be sold any number of times. Supplier drift (OPEN-ISSUES §2) is a separate problem. | Decide whether quantities are tracked. If they are, decrement them in `markOrderPaid` and check them in `priceCart`. |
| B6 | **No phone number is collected.** | The account page says the phone number "travels with every order" | Neither checkout nor the order has a phone field. UAE couriers need one. | Add a required mobile field to checkout and `Orders.shippingAddress`. This needs a migration. |
| B7 | **No shipping email.** | Receipt: "We will email you again with tracking details" | There is no shipped email, and the account page doesn't show tracking. | Add an `afterChange` hook on Orders that sends a tracking email when status becomes `shipped` (pass `req`, use a context guard), and show tracking on the account page. |
| B8 | **Saved addresses are never saved.** | Account: addresses "entered at checkout are kept" | Nothing writes `user.addresses`, so the Addresses tab and the checkout picker are always empty. | Save the checkout address to the account, or remove the claim. |

### C. Housekeeping that needs your approval

| # | Item | Notes |
|---|---|---|
| C1 | **`public/images/` (113 MB) still ships in every deployment.** | The site has read all static art from R2 since 2026-10-04. Moving the folder into `md/` was blocked as a destructive change during this pass. The exact commands are in [`md/unused/README.md`](unused/README.md#not-moved-waiting-on-a-decision). |
| C2 | **The R2 bucket is served from its `r2.dev` URL**, which Cloudflare rate-limits | Covered in OPEN-ISSUES §6.6. It needs a custom domain on Cloudflare DNS. |

---

## 2. Fixed in this pass

### Payments and orders

| Was | Fix | Where |
|---|---|---|
| **A refunded order came back as paid** and re-entered "To fulfil", with both confirmation emails re-sent. Stripe still calls a refunded session `paid`, so a reloaded success page or a redelivered webhook revived it. Any customer could trigger this. | An order now moves to paid only from `unpaid` or `failed`. A refunded order, revisited, is answered with `paid: false`. | `src/lib/orders.ts`, `src/app/api/checkout/confirm/route.ts` |
| **The webhook and the redirect raced**, so buyer and shop each got two confirmations. | The order row is locked (`SELECT … FOR UPDATE`) inside a Payload transaction. The second caller waits, then reads `paid` and stops. Emails go out after the commit. The order hooks still run, so the timeline is kept. | `src/lib/orders.ts` |
| **A database error was reported as "order missing"**, so Stripe was told the event was handled and never retried. | Only a genuine `NotFound` counts as missing. Anything else surfaces as a 500, which Stripe retries. | `src/lib/orders.ts` |
| **Out-of-order Stripe events overwrote orders:** a late "payment failed" after a success, a session expiry after a manual "mark paid", a partial refund closing the whole order, and events for deleted orders retried for three days. | Every webhook change goes through `transitionOrder` under the same lock, using tested decision functions: `failIfUnpaid`, `cancelIfAbandoned`, and `refundTransition` (a partial refund is logged on the timeline). A deleted order counts as handled. | `src/lib/orders.ts`, `src/app/api/stripe/webhook/route.ts` |
| **Anyone could create an unpaid "B2B invoice" order** by POSTing `type: 'b2b'`. Fulfilment showed it as paid with "Mark shipped", and it counted as revenue. | The public route always creates a retail card order. | `src/app/api/checkout/session/route.ts` |
| **"Needs attention" filled with every abandoned checkout and every finished refund.** | Closed orders are excluded. | `src/components/admin/orders/queues.ts` |
| **Customers received staff-only internal notes and the audit timeline** through `/api/orders` on their account page. | Both fields are staff-read only. | `src/collections/Orders.ts`, `src/collections/access.ts` |
| **A stale admin tab, or a fulfilment user, could rewrite the audit timeline.** | The timeline can't be written through the API, and it is rebuilt from the stored order on every save. Events that change no field arrive as `context.timelineEvent`. | `src/collections/hooks/orderHooks.ts` |
| **Quick actions said "Marked shipped" even when the save failed.** | Success is shown only on an OK response. | `src/components/admin/orders/FulfilmentActions.tsx` |

### Checkout and basket

| Was | Fix | Where |
|---|---|---|
| A postcode was required, but UAE addresses have none. | Postcode is optional, country is prefilled as UAE, and every field has autocomplete tokens. | `CheckoutClient.tsx`, `session/route.ts` |
| A typo such as `name@gmailcom` produced a 500 "could not place your order". | Payload's own email rule is checked first, so the shopper gets a clear 400. The portal forms use the same helper. | `src/lib/email-address.ts`, `src/lib/portal-input.ts` |
| "One of the items in your cart is no longer available", with no clue which one. | The server names the line, and checkout shows it with a **Remove it** button. | `src/lib/cart-pricing.ts`, `CheckoutClient.tsx` |
| A size priced at 0.00 could be sold. | Refused. | `src/lib/cart-pricing.ts` |
| After pressing Back from Stripe, the button stayed on "Redirecting to payment…". | It resets when the page is restored from the back/forward cache. | `CheckoutClient.tsx` |
| The size bought was never shown, so two sizes looked like duplicate lines. | Shown in the drawer, the cart and the checkout summary. | `CartDrawer.tsx`, `CartPageClient.tsx`, `CheckoutClient.tsx` |
| The basket quantity had no limit, but checkout refuses more than 99. | Clamped at 99, from one shared constant. | `CartContext.tsx`, `src/lib/product.ts` |
| Quick-add could put a sold-out size in the basket. | Quick-add is offered only when the priced size can be bought; otherwise the card shows **Choose Size**. Multi-size cards say "From". The product page opens on an in-stock size. | `ProductCard.tsx`, `src/lib/product.ts` |
| Reopening the success page from history emptied the basket again. | The basket is cleared once per order. | `CheckoutSuccessClient.tsx` |

### Security

| Was | Fix | Where |
|---|---|---|
| **`/api/graphql` bypassed every REST rate limit.** One request could alias hundreds of logins, sign-ups or enquiries. | GraphQL is disabled, and its generated routes moved to `md/unused` (the flag alone doesn't stop them serving). Live check: 404. | `src/payload.config.ts` |
| **The enquiry form was an open mail relay.** The acknowledgement quoted the visitor's name and message back to any address, sent from the company mailbox and DKIM-signed by Google. | The acknowledgement is fixed text. The staff alert still carries everything. | `src/lib/email/templates/enquiry.ts` |
| **Any signed-in customer could read drafts and version history**, including unpublished products and past prices, draft posts and draft pages. | `readVersions` is admin-only, and Pages and BlogPosts `read` is published-or-staff. | `Products.ts`, `BlogPosts.ts`, `Pages.ts` |
| **Open redirect after login:** `/login?redirect=/%5Cevil.example` and `/%09/evil.example` led off-site. | The redirect is parsed as the browser would parse it and must stay same-origin. Tests cover the bypasses. | `src/lib/redirect.ts`, `tests/int/redirect.int.spec.ts` |
| Public enquiries could arrive pre-marked won/lost (skipping the inbox), with internal notes filled in. | `status`, `assignedOffice` and `notes` are admin-only. Public submissions still default to `new`. | `B2BInquiries.ts` |
| A chef could set `Media.sourceUrl` and get an image attached to a catalogue product on the next import. | Admin-only. Importers write it with access overridden. | `Media.ts` |
| The staff alert mailbox was public at `/api/globals/site-settings` and shipped to every browser in the footer props. | Field-level read access, and the footer now receives only `socials`. | `SiteSettings.ts`, `(frontend)/layout.tsx`, `Footer.tsx` |
| Product JSON-LD could be broken out of by `</script>` in supplier text. | `<` is escaped as `<`. Checked against the real source literal. | `products/[slug]/page.tsx` |
| Hook queries ran outside the save's transaction, so renamed categories gave their children stale paths. | `req` is passed, as AGENTS.md requires. | `categoryHooks.ts`, `productHooks.ts` |

### SEO

| Was | Fix | Where |
|---|---|---|
| Every page without its own Open Graph tags shared as the homepage, with the homepage's title, description and URL. | The layout sets site-wide values only. Home and journal posts set their own; product and category pages already did. | `(frontend)/layout.tsx`, `page.tsx`, `journal/[slug]/page.tsx` |
| A journal draft's title leaked through its metadata, and post titles ended "— Delicious Planet Journal — Delicious Planet". | Published-only lookup, a single suffix, canonical and og tags. | `journal/[slug]/page.tsx` |
| `/reset-password` was indexable. | `noindex`. | `reset-password/layout.tsx` |
| `?page=-1` or `?page=Infinity` produced a negative or infinite SQL OFFSET. | Clamped to 1–1000. | `src/lib/pagination.ts` |
| Product rich results could advertise a sold-out product as in stock. | Product-level stock is respected. | `products/[slug]/page.tsx` |

### Accessibility and UX

| Was | Fix | Where |
|---|---|---|
| **The basket, mobile menu and filter sheet couldn't be scrolled.** A stopped Lenis cancels every wheel and touch event. | Lenis leaves `role="dialog"` alone. Verified in a browser. | `SmoothScroll.tsx` |
| **There was no visible keyboard focus anywhere** (`a:focus { outline: none }`). | A two-tone `:focus-visible` ring that shows on light and dark backgrounds. | `styles.css` |
| **Overlays let focus wander behind them and dropped it on close.** | A shared focus trap that returns focus to the opener. Verified. | `useDialogFocus.ts`, `CartDrawer.tsx`, `MobileDrawer.tsx`, `MobileFilterSheet.tsx` |
| There was no skip link, so about 20 tab stops came before the content. | "Skip to content" → `<main id="main">`. | `(frontend)/layout.tsx` |
| **The carousels couldn't be paused** (WCAG 2.2.2, level A). The hero also dropped focus when a focused link's slide changed. | The hero has a pause button and pauses on hover or keyboard focus. The experience carousel pauses on hover, on focus and when off-screen. Neither autoplays under reduced motion. | `HomeHero.tsx`, `ElegantCarousel.tsx` |
| JavaScript animations ignored "reduce motion". | `MotionConfig reducedMotion="user"`, and Lenis is off for those visitors. | `ClientShell.tsx`, `SmoothScroll.tsx` |
| iOS zoomed into fields smaller than 16px and stayed zoomed. | 16px below `md` for the header search, sort, search-in-results, newsletter, footer and brand search fields. | `Header.tsx`, `ShopToolbar.tsx`, `NewsletterBar.tsx`, `Footer.tsx`, `BrandsPageClient.tsx` |
| Selected filters weren't announced (`aria-pressed` on a link), and the sort select had no name on phones. | `aria-current`, and an `sr-only` label. | `FilterPanel.tsx`, `ShopToolbar.tsx` |
| 24 identical "Add to Cart" and "View More" names per page, plus three tab stops per card. | The names include the product, and the image link is out of the tab order. | `ProductCard.tsx` |
| The chef recipe product search had no label. | Labelled. | `ProductPicker.tsx` |
| The product page's gallery, title and buy box were server-rendered invisible (`opacity: 0`) until JavaScript ran. | Rendered visible (`FadeIn appear={false}`). | `FadeIn.tsx`, `ProductDetail.tsx` |
| The newsletter said "you're on the list" for rejected addresses, and stored `A@x.com` and `a@x.com` twice. | Real outcomes are reported, and emails are lower-cased. | `src/lib/newsletter.ts`, `NewsletterSubscribers.ts` |
| Forgot-password said "check your email" even when the request failed. | Rate-limit and server errors are shown. Unknown addresses still get the same answer. | `forgot-password/page.tsx` |
| "Request a quote" landed on the general contact form at the top of the page. | It opens the B2B tab at the form. | `ContactPageClient.tsx`, `BuyBox.tsx`, `ProductDetail.tsx` |
| The footer said 9–6 **GMT**, while `contact.ts` says GST (1pm–10pm UAE time versus the real hours). | The footer reads `CONTACT.hours`. | `Footer.tsx` |
| Journal dates could hydrate as a different day (server in UTC, browser at UTC+4). | Formatted in `Asia/Dubai`. | `JournalCard.tsx`, `JournalPostClient.tsx` |
| The chef's "View live" link and the approval email button led to a 404. | Removed. The email no longer claims a live page (see B4). | `ChefDashboard.tsx`, `templates/portal.ts` |
| The error page claimed "our team has been notified", but nothing reports errors. The 404 mentioned "shelves below". | The copy now matches what actually happens. | `global-error.tsx`, `not-found.tsx` |

### Performance

| Was | Fix | Where |
|---|---|---|
| Four Google Font families loaded through a render-blocking cross-origin stylesheet in `<body>`. | `next/font` self-hosts Lexend, Merriweather and Poppins with metric-matched fallbacks. Outfit was never reached and is dropped. | `(frontend)/layout.tsx`, `styles.css` |
| The layout re-ran six queries, including a 1,000-row product scan, on every request to a dynamic page. | Cached for 300 s (`unstable_cache`), the same window as the facet cache. | `(frontend)/layout.tsx` |
| The homepage loaded every matching product in full six times, just to count dietary tags. | `payload.count`. | `(frontend)/page.tsx` |
| Every product and journal page view rendered from scratch: about 6 s to first byte, measured locally against the live database. | Incremental static regeneration: cached on first visit and refreshed every 300 s. Checkout re-prices from the database, so a cached price is never charged. | `products/[slug]/page.tsx`, `journal/[slug]/page.tsx` |

### Housekeeping

- 13 unwanted files moved into `md/unused/`, `md/unused/root/` and `md/archive/`.
  The full list, the reasons, and how to restore each one are in
  [`md/unused/README.md`](unused/README.md). In short:
  - the Docker and Yarn template leftovers;
  - four orphaned components;
  - a seed script for a deleted collection;
  - the GraphQL routes;
  - about 190 lines of dead CSS;
  - four superseded docs.
- `README.md` rewritten for this project. It was the Payload blank template:
  MongoDB, Docker, "Users and Media".
- `package.json` description fixed. The dead `seed:collection-images` script
  removed.
- `.env.example` had `NEXT_PUBLIC_SITE_URL=https://www.deliciousplanet.com`. The
  live site is `https://deliciousplanet.co` (`www` redirects there).
- The admin users list asked for a `role` column; the field is `roles`.

---

## 3. Recommended next

None of these block launch. They are ordered roughly by value.

### Commerce and accounts

1. **A stale admin tab can still overwrite the payment status the webhook
   wrote.** The form submits every field. Add an optimistic-concurrency check
   (reject a save whose `updatedAt` is older than the stored one), or make the
   quick actions PATCH only their own fields.
2. **Cancelling a paid order raises no refund prompt**, and a `cancelled` + `paid`
   order drops out of every queue.
3. **Admin "Mark paid" sends no confirmation email.**
4. **Two tabs can open two live Stripe sessions for one basket.**
5. **The account page:**
   - it lists abandoned, unpaid orders;
   - it shows only the latest 20;
   - guest orders under the same email aren't linked;
   - "Track Order" sends guests to the login page;
   - login and register promise tracking, reorders and saved addresses
     (see B7, B8).
6. **Trade orders on invoice terms can't be created anywhere now.** `Orders`
   create access is `false` for everyone, and the public route no longer
   accepts `b2b`. If you need them, add an admin-only route or action.

### Security and portals

7. **Chef contact details can be enumerated through relationship filters**, e.g.
   `/api/recipes?where[author.email][like]=a` letter by letter. This is a
   Payload behaviour. Reject dotted `where` paths through `author` and `chef` for
   non-admins in a `beforeOperation` hook.
8. **The chef role is granted on sign-up, before approval.** Chefs can then
   upload unlimited media to R2 and toggle submissions, each of which emails
   staff. Gate Media and Recipe access on an approved profile, and add per-user
   limits.
9. **An existing shop customer can't become a chef.** The route answers 409
   "sign in first" and never reads the session.
10. **Recipe portal details:**
    - optional fields can't be cleared (the builder sends `undefined`, not
      `null`);
    - declined chefs can still submit;
    - `reviewFeedback` is publicly readable;
    - admins can't create a recipe in the admin (`author` is required but
      read-only).
11. **Notification emails are sent inside the database transaction**
    (`notificationHooks.ts`, `portalNotifications.ts`). SMTP time holds a
    connection, and a failed commit still sends the email. Defer the sends with
    `after()` from `next/server`.

### Storefront

12. **Listing pages are still dynamic,** at 4–6 s to first byte measured locally:
    `/products`, `/categories/[slug]`, `/journal`. They query at `depth: 2` and
    send whole product documents to the browser, including supplier feed URLs.
    Use `select` and `populate` for the card fields, and `depth: 1`.
13. **Category SEO:** the nav links to `/products?category=`, which canonicalises
    to `/products`, while the sitemap lists `/categories/<slug>`, which nothing
    links to. Pick one URL per category. The older `/categories/[slug]` listing
    could redirect to the shop's filtered view.
14. **The journal category filter only searches the 12 posts on the current
    page.** Filter on the server.
15. **Suppliers are still shown to shoppers** (the Supplier facet and "Supplied
    by" on the product page), which contradicts the brands decision in 7b1e7f4.
16. **Visual polish from the screenshots:**
    - product titles are clipped to one line on phone cards ("Barritas…");
    - the floating chat button covers the second card's buttons and the banner
      edge;
    - "Newest first" opens the shop on sold-out products: 3 of the first 5 at
      1440px (77 of 254 products are sold out). Consider sorting in-stock first;
    - "Basket" and "Cart" are used interchangeably.
17. **Contrast:**
    - secondary text at `text-stone/45`–`/70` measures about 1.9–2.9:1 on
      white;
    - footer text at `cream/25`–`/45` measures about 2.0–4.3:1 on black;
    - several labels are 8–9px.

    WCAG AA asks for 4.5:1. A design pass on the tokens would fix this
    site-wide.
18. **The mega-menu panels can't be reached by keyboard** (the panel is rendered
    after the whole menu list), and the announcement bar rotates every 5 s with
    no pause.
19. **About 200 other `FadeIn` sections are still invisible until JavaScript
    loads,** including the first row of the product grid. Use `appear={false}`
    above the fold.
20. **The sticky filter sidebar is taller than a laptop screen,** so its last
    groups can't be reached until the grid ends.
21. **Heading levels skip** (h1 → h3) on 12 pages. Most static pages have no
    canonical. There is no default `og:image`, no apple-touch-icon and no web
    manifest.

### Operations

22. **No error monitoring is installed** (Sentry, or Vercel's built-in
    monitoring). Production errors are currently invisible.
23. **The e2e suite seeds an admin into whatever `DATABASE_URL` points at**,
    which locally is production. Give the tests their own database before
    running them.

---

## 4. Checked and found correct

Everything here was checked and is sound; it is listed so the scope is clear.

- **Pricing**
  - The server prices the basket from published products per variant, and
    never trusts browser prices.
  - It caps lines at 50 and quantities at 1–99, and converts to minor units
    correctly, including zero-decimal currencies.
- **Stripe**
  - The webhook verifies the signature over the raw body.
  - Redirect URLs are built from `SITE_URL`, not request headers.
  - The confirm route trusts only what Stripe returns.
- **Orders**
  - Order `create` is closed.
  - Money, line items, customer and payment fields are admin-only.
  - Customers read only their own orders.
- **Accounts**
  - Public sign-ups are pinned to the `customer` role. Only admins change
    roles, and the trusted role flag can't be set from outside.
  - Logout invalidates the session, tokens last 2 h, and forgot-password
    doesn't reveal whether an account exists.
- **Portals**
  - Both routes rebuild input field by field.
  - The vendor status lookup needs both the reference and the email, and
    gives one generic 404.
- **Media**
  - MIME types are validated, and SVG is checked for non-staff.
  - Remote uploads go through Payload's private-IP-blocking fetch.
- **Email**
  - Every template value is HTML-escaped.
  - Reset links use `SITE_URL`.
  - A failed send never breaks a save.
- **Config**
  - DB push is off in production.
  - Missing R2 or SMTP configuration is fatal in production.
  - Security headers are set: HSTS, frame-ancestors, nosniff, object-src,
    base-uri, form-action and Permissions-Policy.
- **Secrets**
  - `.env` has never been committed. Tracked env files hold placeholders only.
  - No keys were found in the tracked files or in history.
- **Schema**
  - Every collection and global is registered, and the import map has no
    stale entries.
  - `payload-types.ts` matches the schema, and all migrations are applied.
