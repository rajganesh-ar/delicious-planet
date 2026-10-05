# md/unused — files retired from the build

Moved here on 2026-10-05, during the production-readiness audit
(`md/PRODUCTION-AUDIT.md`). Nothing in the app imports or serves anything in
this folder. It is excluded from `tsconfig.json` and ignored by ESLint, so it is
never type-checked, linted or bundled.

Every move was a `git mv`, so history follows each file. To put one back, move
it to its old path with `git mv`. For the four components, re-add their lines to
`src/components/ui/index.ts` too.

| Was | Now | Why it was unwanted |
|---|---|---|
| `Dockerfile` | `root/Dockerfile` | Next.js example file. It copies `.next/standalone`, but `next.config.ts` has no `output: 'standalone'`, so it could not build. The site deploys to Vercel. |
| `docker-compose.yml` | `root/docker-compose.yml` | Payload blank-template file. It starts MongoDB on Node 18; this project is Postgres (Railway) and needs Node ≥ 20.19. |
| `test.env` | `root/test.env` | Referenced by nothing. Vitest and Playwright read `.env`. |
| `.yarnrc` | `root/.yarnrc` | Yarn v1 setting. The project is pnpm-only. |
| `src/components/animations/MagneticButton.tsx` | `components/animations/` | Imported by nothing. Last survivor of the helpers deleted in 9551469. |
| `src/components/ui/Badge.tsx` | `components/ui/` | Only re-exported by the UI barrel. Every `<Badge>` in use is `src/components/admin/Badge.tsx`. |
| `src/components/ui/Section.tsx` | `components/ui/` | Only re-exported by the UI barrel; never rendered. |
| `src/components/ui/Select.tsx` | `components/ui/` | Only re-exported by the UI barrel; never rendered. |
| `md/seed/upload-collection-images.ts` | `seed/` | Patched `/api/product-collections`, a collection removed by migration `20260901_180000`, so every row logged "not found". Its `seed:collection-images` script was removed from `package.json`. |
| `src/app/(payload)/api/graphql/route.ts` | `app/(payload)/api/graphql/` | GraphQL is unused, and this route bypassed the REST rate limits in `src/proxy.ts`. `graphQL.disable` is now set in `payload.config.ts`; that flag alone does not stop the generated route from serving. |
| `src/app/(payload)/api/graphql-playground/route.ts` | `app/(payload)/api/graphql-playground/` | Same as above. |
| ~190 lines of `.hero*` and `.section-*` rules in `src/app/(frontend)/styles.css` | `styles/retired-hero-and-section.css` | No class referenced anywhere in `src/`. They styled `HeroSection.tsx`, deleted in 9551469. |

## Also moved in the same pass

Superseded docs went to `md/archive/`, not here, because they are still useful
history:

- `md/AUDIT.md`, superseded by `OPEN-ISSUES.md`
- `md/required-images.md` and `md/missing-images.md`, superseded by
  `md/image-manifest.md` and OPEN-ISSUES §4–5
- `md/wireframe.md`, which describes a schema that no longer exists

## Not moved, waiting on a decision

**`public/images/` (113 MB, 71 files).** Since 2026-10-04 the site loads every
static image from R2 through `siteImage()`, so this folder is never read at
runtime. It still ships in every deployment, though. Git holds the only
full-resolution originals, and `md/scripts/recover-media.ts` reads the folder.
Moving it to e.g. `md/site-images/` would take 113 MB out of each deploy without
losing anything. The automated move was blocked as a destructive change, so it
is left for you. To do it by hand:

```sh
git mv public/images md/site-images
# then point indexPublic() in md/scripts/recover-media.ts at 'md/site-images'
# and the two partner-logo paths in md/scripts/set-cms-images-2026-10-04.ts
```

## Not moved because they are generated

These are all gitignored and never deployed. They are safe to delete whenever
convenient.

- `.next/`
- `tsconfig.tsbuildinfo`
- `playwright-report/`
- `test-results/`
- the empty `media/` directory
