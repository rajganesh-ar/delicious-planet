# Delicious Planet

Speciality-food storefront and trade portal for deliciousplanet.co, priced in AED
and run from the UAE.

| Layer | What |
|---|---|
| App | Next.js 16 (App Router) with Payload CMS 3.80 mounted in the same app at `/admin` and `/api` |
| Database | Postgres on Railway (`@payloadcms/db-postgres`), schema changed only by migrations |
| Media | Cloudflare R2 through the S3 adapter. Static page art is in R2 too (`siteImage()`) |
| Payments | Stripe Checkout, confirmed on the redirect and by webhook |
| Email | Google Workspace SMTP through `@payloadcms/email-nodemailer` |
| Hosting | Vercel |

## Getting started

```sh
cp .env.example .env      # every variable is explained in the file
pnpm install
pnpm dev                  # http://localhost:3000, admin at /admin
```

Node `^20.19 || ^22.12 || >=24` and pnpm 9 or 10 are required (see
[Node version](#node-version)).

**`.env` points at the production database.** Treat local writes, seeds and the
e2e suite as writes to the live shop.

## Everyday commands

| Command | Does |
|---|---|
| `pnpm dev` | Dev server (webpack) |
| `pnpm build` / `pnpm start` | Production build and server. The build refuses to start in production mode without the R2 and SMTP variables |
| `pnpm lint` | ESLint |
| `npx tsc --noEmit` | Type-check |
| `pnpm test:int` | Vitest integration suite. Read-only against the database |
| `pnpm test:e2e` | Playwright. Seeds a test admin, so **don't** run it against production |
| `pnpm generate:types` | Regenerate `src/payload-types.ts` after a schema change |
| `pnpm generate:importmap` | Regenerate the admin import map after adding an admin component |
| `pnpm migrate:create` / `pnpm migrate:apply` | Create a migration, or apply pending ones (see `scripts/apply-migration.cjs`) |

Catalogue importers, image tools and one-off fixes live in `md/scripts` and
`md/seed`, and are wired up in `package.json` (`import:*`, `images:*`,
`check:suppliers`, …).

## Where things are

```
src/app/(frontend)/   storefront routes
src/app/(payload)/    Payload admin and REST routes (generated)
src/app/api/          checkout, Stripe webhook, partner portal endpoints
src/collections/      collection configs; access rules in access.ts
src/components/       storefront (layout, sections, ui) and admin components
src/lib/              pricing, orders, email templates, helpers
src/migrations/       database migrations
md/                   docs, importers, one-off scripts, retired files (md/unused)
```

## Documentation

- [`md/OPEN-ISSUES.md`](md/OPEN-ISSUES.md): data, supplier and DNS issues still open
- [`md/PRODUCTION-AUDIT.md`](md/PRODUCTION-AUDIT.md): the 2026-10-05 production
  readiness audit (what was fixed, what still needs a decision)
- [`md/unused/README.md`](md/unused/README.md): files retired from the build, and why
- [`AGENTS.md`](AGENTS.md): Payload development rules for AI coding agents

## Node version

`engines.node` is `^20.19.0 || ^22.12.0 || >=24.0.0`. The floor is a real
requirement, not caution: jsdom 28 (used by the Vitest integration suite)
reaches a dependency that `require()`s an ES module, which only works from Node
20.19.

On an older Node the failure is quiet rather than loud. The worker fails to
start and Vitest reports the file as "no tests" instead of failing it, so a
suite can look green without ever having run. Check `node --version` before
trusting a passing `pnpm test:int`.
