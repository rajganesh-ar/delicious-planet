'use client'

import { useState } from 'react'
import { FadeIn } from '@/components/animations/FadeIn'
import { Cta, GUTTER } from '@/components/sections/editorial'
import { Alert, Field, fieldClass, PrimaryButton } from './PortalForm'
import { PortalMasthead, PortalPanel, StatusChip } from './PortalShell'
import { cn } from '@/lib/cn'

/**
 * Progress lookup for a vendor applicant.
 *
 * Applying does not create an account — a supplier being evaluated has no
 * reason to hold a password on our site, and asking for one at the end of a
 * sixty-question form is where applications get abandoned. The reference we
 * email, plus the address it was sent to, is the credential instead.
 *
 * Two consequences are deliberate. The endpoint gives one generic failure for
 * every kind of wrong answer, so this page cannot be used to discover whether
 * a competitor has applied. And what comes back is a stage and a sentence —
 * never the questionnaire, never the reviewer's notes.
 */

interface StatusResult {
  reference: string
  company: string
  status: string
  statusLabel: string
  detail: string
  submittedAt?: string | null
  updatedAt?: string | null
}

/** Four stages of an onboarding journey, as published on /vendors. */
const STAGES = [
  { key: 'new', label: 'Initial assessment' },
  { key: 'in_review', label: 'Evaluation' },
  { key: 'verification', label: 'Verification' },
  { key: 'approved', label: 'Approval & integration' },
]

const STAGE_INDEX: Record<string, number> = {
  new: 0,
  in_review: 1,
  verification: 2,
  approved: 3,
  // On hold and rejected sit outside the journey rather than at a point on it,
  // so the rail is not drawn for them at all.
  on_hold: -1,
  rejected: -1,
}

const CHIP_TONE: Record<string, 'neutral' | 'progress' | 'good' | 'warn'> = {
  new: 'neutral',
  in_review: 'progress',
  verification: 'progress',
  approved: 'good',
  on_hold: 'warn',
  rejected: 'warn',
}

function formatDate(value?: string | null): string {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

export function VendorStatusLookup() {
  const [reference, setReference] = useState('')
  const [email, setEmail] = useState('')
  const [result, setResult] = useState<StatusResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function lookup(event: React.FormEvent) {
    event.preventDefault()
    setError(null)
    setResult(null)
    setLoading(true)

    try {
      const res = await fetch('/api/portal/vendor/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reference, email }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data?.error || 'We could not look that up. Please try again.')
        return
      }
      setResult(data as StatusResult)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const stageIndex = result ? (STAGE_INDEX[result.status] ?? -1) : -1

  return (
    <div className="bg-cream min-h-[70vh]">
      <PortalMasthead
        eyebrow="Vendor registration"
        title="Where your application has got to"
        lede="Your reference and the email address you applied with. We do not create an account for applicants, so this pair is what identifies you."
        back={{ href: '/portal', label: 'Partner portal' }}
      />

      <div className={cn(GUTTER, 'py-7 md:py-10')}>
        <div className="max-w-2xl flex flex-col gap-5">
          <PortalPanel title="Look up an application">
            <form onSubmit={lookup} className="flex flex-col gap-4">
              {error ? <Alert>{error}</Alert> : null}

              <Field
                label="Reference"
                htmlFor="status-reference"
                required
                hint="On the confirmation email — it looks like DP-V-2026-K3M9XQ."
              >
                <input
                  id="status-reference"
                  className={cn(fieldClass, 'uppercase tracking-wide')}
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder="DP-V-0000-XXXXXX"
                  required
                />
              </Field>

              <Field label="Email address" htmlFor="status-email" required>
                <input
                  id="status-email"
                  type="email"
                  className={fieldClass}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </Field>

              <PrimaryButton type="submit" disabled={loading} className="self-start">
                {loading ? 'Looking…' : 'Check status'}
              </PrimaryButton>
            </form>
          </PortalPanel>

          {result ? (
            <FadeIn>
              <div className="bg-white border border-stone/15 rounded-sm">
                <div className="px-4 md:px-6 py-4 md:py-5 border-b border-stone/12 flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0">
                    <span className="block font-luxury text-lg font-semibold text-obsidian leading-tight">
                      {result.company}
                    </span>
                    <span className="block font-sans text-[11.5px] text-stone mt-1">
                      {result.reference} · submitted {formatDate(result.submittedAt)}
                    </span>
                  </div>
                  <StatusChip
                    label={result.statusLabel}
                    tone={CHIP_TONE[result.status] ?? 'neutral'}
                  />
                </div>

                <div className="px-4 md:px-6 py-5">
                  {result.detail ? (
                    <p className="m-0! font-sans text-[13px] text-obsidian leading-relaxed">
                      {result.detail}
                    </p>
                  ) : null}

                  {stageIndex >= 0 ? (
                    <ol className="list-none m-0 p-0 mt-5 flex flex-col">
                      {STAGES.map((stage, index) => {
                        const done = index < stageIndex
                        const current = index === stageIndex
                        return (
                          <li
                            key={stage.key}
                            className="border-t border-stone/12 py-2.5 flex items-center gap-3"
                          >
                            <span
                              aria-hidden
                              className={cn(
                                'shrink-0 w-1.5 h-1.5 rounded-full',
                                done
                                  ? 'bg-forest-green'
                                  : current
                                    ? 'bg-gold'
                                    : 'bg-stone/25',
                              )}
                            />
                            <span
                              className={cn(
                                'font-sans text-[12.5px]',
                                current
                                  ? 'text-obsidian font-medium'
                                  : done
                                    ? 'text-stone'
                                    : 'text-stone/55',
                              )}
                            >
                              {stage.label}
                            </span>
                          </li>
                        )
                      })}
                    </ol>
                  ) : null}

                  <p className="m-0! mt-5! font-sans text-[11.5px] text-stone/80 leading-relaxed">
                    Last updated {formatDate(result.updatedAt)}. We write at each stage, so there is
                    nothing you need to do between them.
                  </p>
                </div>
              </div>
            </FadeIn>
          ) : null}

          <div className="border-t border-stone/15 pt-5">
            <p className="m-0! mb-3! font-sans text-[12.5px] text-stone leading-relaxed">
              Lost your reference, or have not applied yet? Write to us and we will find it, or
              start again — a second application does not replace the first.
            </p>
            <Cta href="/portal/vendor">Start an application</Cta>
          </div>
        </div>
      </div>
    </div>
  )
}
