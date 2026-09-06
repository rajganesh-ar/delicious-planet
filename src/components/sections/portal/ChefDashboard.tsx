'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { FadeIn } from '@/components/animations/FadeIn'
import { Cta, GUTTER } from '@/components/sections/editorial'
import { Alert } from './PortalForm'
import { PortalMasthead, StatusChip } from './PortalShell'
import { CHEF_STATUSES, RECIPE_STATUSES, labelFor } from '@/lib/portal-options'
import { cn } from '@/lib/cn'

/**
 * The chef's own view of their work.
 *
 * A statement, not a gallery: one row per recipe with its state, the same
 * hairline rhythm the account page uses for order history. What a contributor
 * needs from this screen is to see at a glance which drafts are unfinished,
 * which are waiting on us, and which came back with a note — so the state is
 * the second thing on every row, and a note is shown in full rather than
 * behind a click.
 *
 * Everything is read with the session cookie against the Payload REST API. The
 * Recipes collection scopes a chef to `author = their id`, so this asks for
 * their rows and would get nothing else even if it asked for more.
 */

interface RecipeRow {
  id: number
  title: string
  slug?: string | null
  status: string
  course?: string | null
  servings?: number | null
  updatedAt?: string | null
  submittedAt?: string | null
  reviewFeedback?: string | null
  ingredients?: unknown[] | null
}

interface Profile {
  id: number
  displayName: string
  status: string
  establishment?: string | null
}

const STATUS_TONE: Record<string, 'neutral' | 'progress' | 'good' | 'warn'> = {
  draft: 'neutral',
  submitted: 'progress',
  published: 'good',
  changes_requested: 'warn',
  archived: 'neutral',
}

function formatDate(value?: string | null): string {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function ChefDashboard() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const justSubmitted = searchParams.get('submitted') === '1'

  const [profile, setProfile] = useState<Profile | null>(null)
  const [recipes, setRecipes] = useState<RecipeRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      const meRes = await fetch('/api/users/me', { credentials: 'include' })
      const me = await meRes.json()

      if (!me?.user) {
        router.push('/login?redirect=%2Fportal%2Fchef')
        return
      }

      const roles: string[] = me.user.roles ?? []
      if (!roles.includes('chef')) {
        // A signed-in shopper who wandered in. Registration is the right door,
        // and it explains itself better than an error would.
        router.push('/portal/chef/register')
        return
      }

      const [profileRes, recipesRes] = await Promise.all([
        fetch(
          `/api/chef-profiles?where[account][equals]=${encodeURIComponent(me.user.id)}&limit=1&depth=0`,
          { credentials: 'include' },
        ),
        fetch(
          `/api/recipes?where[author][equals]=${encodeURIComponent(me.user.id)}&limit=100&depth=0&sort=-updatedAt`,
          { credentials: 'include' },
        ),
      ])

      const profileData = profileRes.ok ? await profileRes.json() : null
      const recipeData = recipesRes.ok ? await recipesRes.json() : null

      setProfile(profileData?.docs?.[0] ?? null)
      setRecipes((recipeData?.docs ?? []) as RecipeRow[])
    } catch {
      setError('We could not load your recipes. Please refresh and try again.')
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    void load()
  }, [load])

  const counts = {
    draft: recipes.filter((recipe) => recipe.status === 'draft').length,
    submitted: recipes.filter((recipe) => recipe.status === 'submitted').length,
    published: recipes.filter((recipe) => recipe.status === 'published').length,
    changes: recipes.filter((recipe) => recipe.status === 'changes_requested').length,
  }

  if (loading) {
    return (
      <div className="bg-cream min-h-[70vh]">
        <PortalMasthead eyebrow="Chef portal" title="Your recipes" />
        <div className={cn(GUTTER, 'py-10')}>
          <p className="m-0! font-sans text-[13px] text-stone">Loading…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-cream min-h-[70vh]">
      <PortalMasthead
        eyebrow="Chef portal"
        title={profile?.displayName ? `Welcome back, ${profile.displayName}` : 'Your recipes'}
        lede="Drafts are private until you submit them. Every submission is read by an editor before it goes live."
        aside={
          profile ? (
            <StatusChip
              label={labelFor(CHEF_STATUSES, profile.status)}
              tone={profile.status === 'verified' ? 'good' : 'neutral'}
            />
          ) : null
        }
      />

      <div className={cn(GUTTER, 'py-7 md:py-10')}>
        <div className="flex flex-col gap-5">
          {error ? <Alert>{error}</Alert> : null}
          {justSubmitted ? (
            <Alert tone="success">
              Submitted. We will read it and come back to you — you will get an email either way.
            </Alert>
          ) : null}

          {/* ── Counters ────────────────────────────────────────── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 bg-white border border-stone/15 rounded-sm overflow-hidden">
            {[
              { label: 'Drafts', value: counts.draft },
              { label: 'In review', value: counts.submitted },
              { label: 'Published', value: counts.published },
              { label: 'Needs a change', value: counts.changes },
            ].map((stat) => (
              <div
                key={stat.label}
                className="px-4 md:px-5 py-4 border-b border-r border-stone/10 last:border-r-0"
              >
                <span className="block font-luxury text-2xl font-semibold text-obsidian leading-none">
                  {stat.value}
                </span>
                <span className="block font-sans text-[10px] uppercase tracking-[0.16em] text-stone mt-2">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="font-luxury text-lg md:text-xl font-semibold text-obsidian">
              Your recipes
            </span>
            <Cta href="/portal/chef/recipes/new">Write a new recipe</Cta>
          </div>

          {recipes.length === 0 ? (
            <FadeIn>
              <div className="bg-white border border-stone/15 rounded-sm px-5 md:px-8 py-8 md:py-10 max-w-2xl">
                <span className="block font-luxury text-lg font-semibold text-obsidian leading-tight">
                  Nothing written yet
                </span>
                <p className="m-0! mt-2! font-sans text-[13px] text-stone leading-relaxed">
                  A recipe here is built from our catalogue: you search for each ingredient, give it
                  a quantity and a unit, and every line becomes something a reader can order. Start
                  with a dish you already cook — the first one takes about twenty minutes.
                </p>
                <div className="mt-5">
                  <Cta href="/portal/chef/recipes/new">Write your first recipe</Cta>
                </div>
              </div>
            </FadeIn>
          ) : (
            <ul className="list-none m-0 p-0 bg-white border border-stone/15 rounded-sm overflow-hidden">
              {recipes.map((recipe) => {
                const editable = recipe.status !== 'published' && recipe.status !== 'archived'
                return (
                  <li key={recipe.id} className="border-b border-stone/10 last:border-b-0">
                    <div className="px-4 md:px-5 py-4 flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2.5">
                          <span className="font-luxury text-base font-semibold text-obsidian leading-tight">
                            {recipe.title}
                          </span>
                          <StatusChip
                            label={labelFor(RECIPE_STATUSES, recipe.status)}
                            tone={STATUS_TONE[recipe.status] ?? 'neutral'}
                          />
                        </div>
                        <span className="block font-sans text-[11.5px] text-stone mt-1.5">
                          {recipe.ingredients?.length ?? 0} ingredients · serves{' '}
                          {recipe.servings ?? '—'} · updated {formatDate(recipe.updatedAt)}
                        </span>
                        {recipe.status === 'changes_requested' && recipe.reviewFeedback ? (
                          <p className="m-0! mt-2! font-sans text-[12.5px] text-red-700 leading-relaxed max-w-2xl">
                            {recipe.reviewFeedback}
                          </p>
                        ) : null}
                      </div>

                      <div className="flex items-center gap-4 shrink-0">
                        {recipe.status === 'published' && recipe.slug ? (
                          <Link href={`/recipes/${recipe.slug}`} className="no-underline">
                            <span className="font-sans text-[12px] text-forest-green hover:underline underline-offset-2">
                              View live
                            </span>
                          </Link>
                        ) : null}
                        <Link
                          href={`/portal/chef/recipes/${recipe.id}`}
                          className="no-underline"
                        >
                          <span className="font-sans text-[12px] text-forest-green hover:underline underline-offset-2">
                            {editable ? 'Edit' : 'Open'}
                          </span>
                        </Link>
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}

          {profile && profile.status === 'pending' ? (
            <div className="rounded-sm bg-parchment border border-stone/15 px-4 py-3.5 max-w-2xl">
              <p className="m-0! font-sans text-[12.5px] text-stone leading-relaxed">
                Your profile is awaiting verification. That is a badge on your byline rather than a
                gate — you can write and submit recipes right now, and each is reviewed on its own.
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
