'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { GUTTER } from '@/components/sections/editorial'
import {
  AddRowButton,
  Alert,
  areaClass,
  CheckboxRow,
  ChipSelect,
  Field,
  FieldGrid,
  FieldsetHead,
  fieldClass,
  GhostButton,
  PrimaryButton,
  RepeatableRow,
  SelectField,
} from './PortalForm'
import { PortalMasthead, PortalPanel, StepRail, type PortalStep } from './PortalShell'
import { COUNTRY_OPTIONS } from '@/lib/countries'
import { CHEF_ROLES, CUISINES, EXPERIENCE_BANDS, KITCHEN_TYPES } from '@/lib/portal-options'
import { cn } from '@/lib/cn'

/**
 * Chef registration.
 *
 * Three steps rather than the vendor form's seven, because the two are asking
 * for different things: a supplier is being evaluated, a chef is being
 * introduced. What we need is enough to put a credible byline under a recipe
 * and enough to reach them about it — everything past that is optional and
 * says so.
 *
 * The account and the profile are created in one request (/api/portal/chef),
 * then this signs them straight in. Registering and then being shown a login
 * screen is the most common way a portal loses the person it just recruited.
 */

interface Qualification {
  name: string
  institution: string
  year: string
}

const emptyQualification = (): Qualification => ({ name: '', institution: '', year: '' })

interface FormState {
  displayName: string
  email: string
  password: string
  confirmPassword: string
  phone: string
  chefRole: string
  establishment: string
  kitchenType: string
  experience: string
  cuisines: string[]
  specialities: string
  bio: string
  city: string
  country: string
  website: string
  instagram: string
  youtube: string
  linkedin: string
  awards: string
  qualifications: Qualification[]
  motivation: string
  consentPublish: boolean
  consentTerms: boolean
}

const INITIAL: FormState = {
  displayName: '',
  email: '',
  password: '',
  confirmPassword: '',
  phone: '',
  chefRole: '',
  establishment: '',
  kitchenType: '',
  experience: '',
  cuisines: [],
  specialities: '',
  bio: '',
  city: '',
  country: '',
  website: '',
  instagram: '',
  youtube: '',
  linkedin: '',
  awards: '',
  qualifications: [emptyQualification()],
  motivation: '',
  consentPublish: false,
  consentTerms: false,
}

const STEPS: PortalStep[] = [
  { key: 'you', label: 'About you' },
  { key: 'kitchen', label: 'Your kitchen' },
  { key: 'account', label: 'Account' },
]

const MIN_PASSWORD_LENGTH = 8

function validateStep(step: number, form: FormState): string | null {
  switch (step) {
    case 0:
      if (!form.displayName.trim()) return 'Please tell us the name that should appear on a recipe.'
      if (!form.chefRole) return 'Please choose the role that fits you best.'
      if (!form.experience) return 'Please tell us roughly how long you have been cooking.'
      if (form.cuisines.length === 0) return 'Please pick at least one cuisine.'
      if (form.bio.trim().length < 40) {
        return 'Please write a couple of sentences for your biography — it runs under your byline.'
      }
      return null
    case 1:
      if (!form.country) return 'Please choose the country you cook in.'
      return null
    case 2:
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
        return 'Please enter a valid email address.'
      }
      if (form.password.length < MIN_PASSWORD_LENGTH) {
        return `Please choose a password of at least ${MIN_PASSWORD_LENGTH} characters.`
      }
      if (form.password !== form.confirmPassword) return 'The two passwords do not match.'
      if (!form.consentTerms || !form.consentPublish) {
        return 'Please accept the contributor terms and the permission to publish.'
      }
      return null
    default:
      return null
  }
}

export function ChefRegistrationForm() {
  const router = useRouter()
  const [form, setForm] = useState<FormState>(INITIAL)
  const [step, setStep] = useState(0)
  const [furthest, setFurthest] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const goTo = (next: number) => {
    setError(null)
    setStep(next)
    setFurthest((prev) => Math.max(prev, next))
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const advance = () => {
    const problem = validateStep(step, form)
    if (problem) {
      setError(problem)
      return
    }
    goTo(Math.min(step + 1, STEPS.length - 1))
  }

  async function submit() {
    const problem = validateStep(2, form)
    if (problem) {
      setError(problem)
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      const res = await fetch('/api/portal/chef', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          displayName: form.displayName,
          email: form.email,
          password: form.password,
          phone: form.phone,
          chefRole: form.chefRole,
          establishment: form.establishment,
          kitchenType: form.kitchenType,
          experience: form.experience,
          cuisines: form.cuisines,
          specialities: form.specialities,
          bio: form.bio,
          city: form.city,
          country: form.country,
          links: {
            website: form.website,
            instagram: form.instagram,
            youtube: form.youtube,
            linkedin: form.linkedin,
          },
          awards: form.awards,
          qualifications: form.qualifications.filter((entry) => entry.name.trim()),
          motivation: form.motivation,
          consentPublish: form.consentPublish,
          consentTerms: form.consentTerms,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data?.error || 'We could not complete your registration. Please try again.')
        return
      }

      // Straight in rather than back to a sign-in screen — the credentials
      // were typed thirty seconds ago and the portal is the point.
      const login = await fetch('/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, password: form.password }),
        credentials: 'include',
      })

      router.push(login.ok ? '/portal/chef' : '/login?redirect=%2Fportal%2Fchef')
      router.refresh()
    } catch {
      setError('Something went wrong on the way to us. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="bg-cream min-h-[70vh]">
      <PortalMasthead
        eyebrow="Chef registration"
        title={
          <>
            Cook with our catalogue, <span className="text-gold">publish with us</span>
          </>
        }
        lede="Register once, then write as many recipes as you like. Every ingredient is chosen from the products we stock, so a reader can order exactly what you cooked with — which is the whole point of the thing."
        back={{ href: '/portal', label: 'Partner portal' }}
      />

      <div className={cn(GUTTER, 'py-7 md:py-10')}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-8 items-start">
          <div className="lg:col-span-3">
            <StepRail steps={STEPS} current={step} furthest={furthest} onSelect={goTo} />
          </div>

          <div className="lg:col-span-9 flex flex-col gap-4">
            {error ? <Alert>{error}</Alert> : null}

            {step === 0 ? (
              <PortalPanel
                title="About you"
                blurb="What goes under the byline on every recipe you publish."
              >
                <FieldGrid>
                  <Field
                    label="Name as it should appear"
                    htmlFor="c-name"
                    required
                    hint="However you are credited professionally."
                  >
                    <input
                      id="c-name"
                      className={fieldClass}
                      value={form.displayName}
                      onChange={(e) => set('displayName', e.target.value)}
                      autoComplete="name"
                    />
                  </Field>
                  <Field label="Your role" htmlFor="c-role" required>
                    <SelectField
                      id="c-role"
                      value={form.chefRole}
                      onChange={(value) => set('chefRole', value)}
                      options={CHEF_ROLES}
                    />
                  </Field>
                  <Field label="Years in professional kitchens" htmlFor="c-experience" required>
                    <SelectField
                      id="c-experience"
                      value={form.experience}
                      onChange={(value) => set('experience', value)}
                      options={EXPERIENCE_BANDS}
                    />
                  </Field>
                  <Field label="Phone" htmlFor="c-phone" hint="Only used if we need to reach you about a recipe.">
                    <input
                      id="c-phone"
                      type="tel"
                      className={fieldClass}
                      value={form.phone}
                      onChange={(e) => set('phone', e.target.value)}
                      autoComplete="tel"
                    />
                  </Field>
                </FieldGrid>

                <Field label="Cuisines you cook" required hint="Pick as many as genuinely apply.">
                  <ChipSelect
                    options={CUISINES}
                    values={form.cuisines}
                    onChange={(values) => set('cuisines', values)}
                    columns={3}
                  />
                </Field>

                <FieldGrid>
                  <Field
                    label="Short biography"
                    htmlFor="c-bio"
                    required
                    span="full"
                    hint="Two or three sentences. It runs under your name on every recipe."
                  >
                    <textarea
                      id="c-bio"
                      className={areaClass}
                      value={form.bio}
                      onChange={(e) => set('bio', e.target.value)}
                      rows={4}
                    />
                  </Field>
                  <Field label="Specialities" htmlFor="c-specialities" span="full">
                    <textarea
                      id="c-specialities"
                      className={areaClass}
                      value={form.specialities}
                      onChange={(e) => set('specialities', e.target.value)}
                      rows={3}
                    />
                  </Field>
                </FieldGrid>
              </PortalPanel>
            ) : null}

            {step === 1 ? (
              <PortalPanel
                title="Your kitchen"
                blurb="Where you cook, and anything that would help a reader place you. All optional bar the country."
              >
                <FieldGrid>
                  <Field label="Restaurant, hotel or business" htmlFor="c-establishment">
                    <input
                      id="c-establishment"
                      className={fieldClass}
                      value={form.establishment}
                      onChange={(e) => set('establishment', e.target.value)}
                      autoComplete="organization"
                    />
                  </Field>
                  <Field label="Kind of kitchen" htmlFor="c-kitchen">
                    <SelectField
                      id="c-kitchen"
                      value={form.kitchenType}
                      onChange={(value) => set('kitchenType', value)}
                      options={KITCHEN_TYPES}
                    />
                  </Field>
                  <Field label="City" htmlFor="c-city">
                    <input
                      id="c-city"
                      className={fieldClass}
                      value={form.city}
                      onChange={(e) => set('city', e.target.value)}
                      autoComplete="address-level2"
                    />
                  </Field>
                  <Field label="Country" htmlFor="c-country" required>
                    <SelectField
                      id="c-country"
                      value={form.country}
                      onChange={(value) => set('country', value)}
                      options={COUNTRY_OPTIONS}
                    />
                  </Field>
                </FieldGrid>

                <FieldsetHead title="Where to find you" />
                <FieldGrid>
                  <Field label="Website" htmlFor="c-website">
                    <input
                      id="c-website"
                      className={fieldClass}
                      value={form.website}
                      onChange={(e) => set('website', e.target.value)}
                      placeholder="https://"
                      inputMode="url"
                    />
                  </Field>
                  <Field label="Instagram" htmlFor="c-instagram">
                    <input
                      id="c-instagram"
                      className={fieldClass}
                      value={form.instagram}
                      onChange={(e) => set('instagram', e.target.value)}
                      placeholder="@"
                    />
                  </Field>
                  <Field label="YouTube" htmlFor="c-youtube">
                    <input
                      id="c-youtube"
                      className={fieldClass}
                      value={form.youtube}
                      onChange={(e) => set('youtube', e.target.value)}
                    />
                  </Field>
                  <Field label="LinkedIn" htmlFor="c-linkedin">
                    <input
                      id="c-linkedin"
                      className={fieldClass}
                      value={form.linkedin}
                      onChange={(e) => set('linkedin', e.target.value)}
                    />
                  </Field>
                </FieldGrid>

                <FieldsetHead title="Training and recognition" blurb="Optional, and not a filter — a good recipe is a good recipe." />
                <Field label="Awards and recognition" htmlFor="c-awards">
                  <textarea
                    id="c-awards"
                    className={areaClass}
                    value={form.awards}
                    onChange={(e) => set('awards', e.target.value)}
                    rows={3}
                  />
                </Field>

                <div className="flex flex-col gap-3">
                  {form.qualifications.map((qualification, index) => (
                    <RepeatableRow
                      key={index}
                      index={index}
                      label="Qualification"
                      removable={form.qualifications.length > 1}
                      onRemove={() =>
                        set(
                          'qualifications',
                          form.qualifications.filter((_, i) => i !== index),
                        )
                      }
                    >
                      <FieldGrid>
                        <Field label="Qualification" htmlFor={`c-qual-name-${index}`}>
                          <input
                            id={`c-qual-name-${index}`}
                            className={fieldClass}
                            value={qualification.name}
                            onChange={(e) =>
                              set(
                                'qualifications',
                                form.qualifications.map((entry, i) =>
                                  i === index ? { ...entry, name: e.target.value } : entry,
                                ),
                              )
                            }
                          />
                        </Field>
                        <Field label="Institution" htmlFor={`c-qual-inst-${index}`}>
                          <input
                            id={`c-qual-inst-${index}`}
                            className={fieldClass}
                            value={qualification.institution}
                            onChange={(e) =>
                              set(
                                'qualifications',
                                form.qualifications.map((entry, i) =>
                                  i === index ? { ...entry, institution: e.target.value } : entry,
                                ),
                              )
                            }
                          />
                        </Field>
                        <Field label="Year" htmlFor={`c-qual-year-${index}`}>
                          <input
                            id={`c-qual-year-${index}`}
                            className={fieldClass}
                            value={qualification.year}
                            onChange={(e) =>
                              set(
                                'qualifications',
                                form.qualifications.map((entry, i) =>
                                  i === index ? { ...entry, year: e.target.value } : entry,
                                ),
                              )
                            }
                            inputMode="numeric"
                          />
                        </Field>
                      </FieldGrid>
                    </RepeatableRow>
                  ))}
                  {form.qualifications.length < 8 ? (
                    <AddRowButton
                      onClick={() =>
                        set('qualifications', [...form.qualifications, emptyQualification()])
                      }
                    >
                      Add another qualification
                    </AddRowButton>
                  ) : null}
                </div>
              </PortalPanel>
            ) : null}

            {step === 2 ? (
              <PortalPanel
                title="Your account"
                blurb="How you get back to your drafts. The same login also works on the shop."
              >
                <FieldGrid>
                  <Field label="Email" htmlFor="c-email" required>
                    <input
                      id="c-email"
                      type="email"
                      className={fieldClass}
                      value={form.email}
                      onChange={(e) => set('email', e.target.value)}
                      autoComplete="email"
                    />
                  </Field>
                  <Field label="Password" htmlFor="c-password" required hint="At least eight characters.">
                    <input
                      id="c-password"
                      type="password"
                      className={fieldClass}
                      value={form.password}
                      onChange={(e) => set('password', e.target.value)}
                      autoComplete="new-password"
                      minLength={MIN_PASSWORD_LENGTH}
                    />
                  </Field>
                  <Field label="Confirm password" htmlFor="c-confirm" required>
                    <input
                      id="c-confirm"
                      type="password"
                      className={fieldClass}
                      value={form.confirmPassword}
                      onChange={(e) => set('confirmPassword', e.target.value)}
                      autoComplete="new-password"
                    />
                  </Field>
                  <Field
                    label="Why you would like to publish with us"
                    htmlFor="c-motivation"
                    span="full"
                  >
                    <textarea
                      id="c-motivation"
                      className={areaClass}
                      value={form.motivation}
                      onChange={(e) => set('motivation', e.target.value)}
                      rows={3}
                    />
                  </Field>
                </FieldGrid>

                <div className="flex flex-col gap-3 pt-1">
                  <CheckboxRow
                    id="c-consent-publish"
                    checked={form.consentPublish}
                    onChange={(checked) => set('consentPublish', checked)}
                    label="You may publish my name, portrait and recipes on the site."
                    hint="You keep authorship. We will not change a recipe's substance without asking you first."
                  />
                  <CheckboxRow
                    id="c-consent-terms"
                    checked={form.consentTerms}
                    onChange={(checked) => set('consentTerms', checked)}
                    label={
                      <>
                        I accept the{' '}
                        <Link href="/policies#terms" className="no-underline">
                          <span className="text-forest-green hover:underline underline-offset-2">
                            contributor terms
                          </span>
                        </Link>{' '}
                        and the{' '}
                        <Link href="/policies#privacy" className="no-underline">
                          <span className="text-forest-green hover:underline underline-offset-2">
                            privacy policy
                          </span>
                        </Link>
                        .
                      </>
                    }
                  />
                </div>

                <div className="rounded-sm bg-parchment border border-stone/15 px-4 py-3.5">
                  <p className="m-0! font-sans text-[12.5px] text-stone leading-relaxed">
                    Registering does not publish anything. You write drafts, submit the ones you are
                    happy with, and we review each on its own — usually within a few working days.
                  </p>
                </div>
              </PortalPanel>
            ) : null}

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <span className="font-sans text-[11.5px] text-stone">
                Step {step + 1} of {STEPS.length} · {STEPS[step]?.label}
              </span>
              <div className="flex flex-wrap gap-3">
                {step > 0 ? <GhostButton onClick={() => goTo(step - 1)}>Back</GhostButton> : null}
                {step < STEPS.length - 1 ? (
                  <PrimaryButton onClick={advance}>Continue</PrimaryButton>
                ) : (
                  <PrimaryButton onClick={submit} disabled={submitting}>
                    {submitting ? 'Creating your account…' : 'Create account'}
                  </PrimaryButton>
                )}
              </div>
            </div>

            <p className="m-0! font-sans text-[12.5px] text-stone">
              Already registered?{' '}
              <Link href="/login?redirect=%2Fportal%2Fchef" className="no-underline">
                <span className="text-forest-green font-medium hover:underline underline-offset-2">
                  Sign in
                </span>
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
