'use client'

import { useState } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import { FadeIn } from '@/components/animations/FadeIn'
import { FAQSection } from '@/components/sections/FAQSection'
import { ImagePlaceholder } from '@/components/ui'
import { BAND, Cta, Eyebrow, GUTTER, SectionHead } from '@/components/sections/editorial'
import { cn } from '@/lib/cn'
import type { OfficeLocation, Media } from '@/payload-types'

interface ContactPageClientProps {
  offices: OfficeLocation[]
}

type FormTab = 'general' | 'b2b'

/* ──────────────────────────────────────────────────────────────
 * Media slots — `src: null` renders the designed placeholder.
 * ────────────────────────────────────────────────────────────── */
const MEDIA = {
  hero: { src: '/images/contact/contact-cover.avif', label: 'Contact hero — 4:3' },
  formAside: { src: '/images/contact/contact-misc.avif', label: 'Team at work — 4:3' },
  locations: { src: null, label: 'Operating regions' },
} satisfies Record<string, { src: string | null; label: string }>

/* Kept in step with the footer and the floating contact widget. */
const CONTACT = {
  email: 'info@deliciousplanet.com',
  phone: '+1234567890',
  phoneLabel: '+1 234 567 890',
  whatsapp: 'https://wa.me/1234567890',
  hours: 'Mon–Fri, 9am–6pm GMT',
}

const CHANNELS = [
  {
    key: 'general',
    title: 'General enquiries',
    detail: 'Product questions, orders, and anything else.',
    action: 'Write to us',
    href: `mailto:${CONTACT.email}`,
    icon: (
      <>
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="m2 7 10 6 10-6" />
      </>
    ),
  },
  {
    key: 'b2b',
    title: 'Wholesale & B2B',
    detail: 'Volume pricing, contracts, and private label.',
    action: 'Start an inquiry',
    href: '#enquiry',
    icon: (
      <>
        <path d="M20.5 12.5 12 21 3 12V3h9z" />
        <circle cx="7.8" cy="7.8" r="1.4" />
      </>
    ),
  },
  {
    key: 'vendors',
    title: 'Become a supplier',
    detail: 'Producer and partnership applications.',
    action: 'Vendor programme',
    href: '/vendors',
    icon: (
      <>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M19 8v6M22 11h-6" />
      </>
    ),
  },
  {
    key: 'call',
    title: 'Speak to a specialist',
    detail: CONTACT.hours,
    action: CONTACT.phoneLabel,
    href: `tel:${CONTACT.phone}`,
    icon: (
      <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.1 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z" />
    ),
  },
]

const PROMISES = [
  { label: 'First response', value: 'Within 1 business day' },
  { label: 'B2B quotes', value: '2–3 business days' },
  { label: 'Working hours', value: CONTACT.hours },
]

const REGIONS = [
  { tag: 'HQ', value: 'United Arab Emirates' },
  { tag: 'Origin', value: 'Algeria' },
  { tag: 'Supply', value: 'Southern Europe' },
  { tag: 'Reach', value: '4 continents' },
]

/** Form field shell — label + control, matching the storefront input styling. */
function Field({
  label,
  htmlFor,
  required,
  children,
  className,
}: {
  label: string
  htmlFor: string
  required?: boolean
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={className}>
      <label
        htmlFor={htmlFor}
        className="block font-sans text-[10px] uppercase tracking-[0.16em] text-stone mb-1.5"
      >
        {label}
        {required ? <span className="text-forest-green ml-1">*</span> : null}
      </label>
      {children}
    </div>
  )
}

const FIELD_CLASS =
  'w-full bg-white border border-stone/20 rounded-sm px-3 py-2.5 font-sans text-[13px] text-obsidian placeholder:text-stone/50 outline-none focus:border-forest-green transition-colors'

export function ContactPageClient({ offices }: ContactPageClientProps) {
  const [activeTab, setActiveTab] = useState<FormTab>('general')
  const [selectedOffice, setSelectedOffice] = useState<number | null>(offices[0]?.id ?? null)
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleGeneralSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    setSubmitting(true)
    setError(null)

    try {
      const subject = (formData.get('subject') as string) || ''
      const message = (formData.get('message') as string) || ''
      const res = await fetch('/api/b2b-inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company: 'Individual / General',
          contactName: formData.get('name'),
          email: formData.get('email'),
          message: subject ? `[${subject}]\n\n${message}` : message,
        }),
      })

      if (res.ok) setSubmitted(true)
      else setError('We could not send that. Please try again.')
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleB2BSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    setSubmitting(true)
    setError(null)

    try {
      const res = await fetch('/api/b2b-inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company: formData.get('company'),
          contactName: formData.get('contactName'),
          email: formData.get('email'),
          phone: formData.get('phone') || undefined,
          message: formData.get('message'),
          assignedOffice: selectedOffice || undefined,
        }),
      })

      if (res.ok) setSubmitted(true)
      else setError('We could not send that. Please try again.')
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const submitLabel = activeTab === 'general' ? 'Send message' : 'Submit inquiry'

  return (
    <div className="bg-cream">
      {/* ═══ 1 · HERO ═══════════════════════════════════════════ */}
      <section className="bg-obsidian">
        <div className={cn(GUTTER, 'pt-10 pb-8 md:pt-14 md:pb-10')}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center">
            <div className="lg:col-span-7">
              <FadeIn>
                <Eyebrow tone="light">Get in touch</Eyebrow>
              </FadeIn>
              <FadeIn delay={0.06}>
                <h1 className="m-0! mt-3!">
                  <span className="block font-luxury text-cream font-semibold leading-[1.12] tracking-tight text-[clamp(1.9rem,5vw,3.5rem)]">
                    Let&apos;s talk about{' '}
                    <span className="text-gold">what you&apos;re sourcing</span>
                  </span>
                </h1>
              </FadeIn>
              <FadeIn delay={0.12}>
                <p className="m-0! mt-4! font-sans text-cream/75 text-sm md:text-base leading-relaxed max-w-xl">
                  Home cook, chef, retailer, or distributor — tell us what you need and the right
                  person on our team will pick it up. Wholesale inquiries route straight to the
                  trade desk.
                </p>
              </FadeIn>
              <FadeIn delay={0.18}>
                <div className="flex flex-wrap gap-3 mt-6">
                  <Cta href="#enquiry">Send a message</Cta>
                  <Cta href={`tel:${CONTACT.phone}`} variant="outline">
                    {CONTACT.phoneLabel}
                  </Cta>
                </div>
              </FadeIn>
            </div>

            <div className="lg:col-span-5">
              <FadeIn delay={0.1}>
                <ImagePlaceholder
                  {...MEDIA.hero}
                  ratio="4/3"
                  tone="dark"
                  priority
                  sizes="(max-width: 1024px) 100vw, 38vw"
                  className="rounded-sm"
                />
              </FadeIn>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 2 · CHANNELS ═══════════════════════════════════════ */}
      <section className={cn(GUTTER, 'pt-8 md:pt-11')} aria-labelledby="channels-heading">
        <h2 id="channels-heading" className="sr-only">
          Ways to reach us
        </h2>
        <ul className="list-none m-0 p-0 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 border border-stone/15 rounded-sm bg-white overflow-hidden">
          {CHANNELS.map((c) => {
            // Route-internal targets go through Link so navigation stays client-side.
            const Tag = c.href.startsWith('/') ? Link : 'a'
            return (
              <li
                key={c.key}
                className="border-b border-r border-stone/10 last:border-r-0 xl:border-b-0"
              >
                <Tag
                  href={c.href}
                  className="group no-underline block h-full px-4 md:px-5 py-4 md:py-5 hover:bg-parchment transition-colors"
                >
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden
                    className="text-forest-green"
                  >
                    {c.icon}
                  </svg>
                  <span className="block font-luxury text-base md:text-lg font-semibold text-obsidian leading-tight mt-2.5">
                    {c.title}
                  </span>
                  <span className="block font-sans text-[11.5px] md:text-xs text-stone leading-snug mt-1">
                    {c.detail}
                  </span>
                  <span className="inline-flex items-center gap-1.5 font-sans text-[10px] uppercase tracking-[0.16em] text-forest-green mt-3">
                    {c.action}
                    <span
                      aria-hidden
                      className="inline-block transition-transform duration-300 group-hover:translate-x-1"
                    >
                      →
                    </span>
                  </span>
                </Tag>
              </li>
            )
          })}
        </ul>
      </section>

      {/* ═══ 3 · ENQUIRY ════════════════════════════════════════ */}
      <section id="enquiry" className={cn(GUTTER, BAND, 'scroll-mt-[calc(var(--header-h)+1.5rem)]')}>
        <SectionHead
          eyebrow="Send a message"
          title="Tell us what you need"
          lede="General questions and wholesale inquiries both land with the right desk."
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 md:gap-4 items-start">
          {/* Form */}
          <div className="lg:col-span-8">
            <div className="bg-white border border-stone/15 rounded-sm p-4 md:p-6">
              {/* Tabs */}
              <div
                role="tablist"
                aria-label="Enquiry type"
                className="inline-flex border border-stone/20 rounded-sm overflow-hidden mb-5 md:mb-6"
              >
                {(
                  [
                    ['general', 'General inquiry'],
                    ['b2b', 'B2B / Wholesale'],
                  ] as const
                ).map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    role="tab"
                    aria-selected={activeTab === key}
                    onClick={() => {
                      setActiveTab(key)
                      setSubmitted(false)
                      setError(null)
                    }}
                    className={cn(
                      'px-4 py-2.5 border-0 cursor-pointer transition-colors font-sans text-[11px] uppercase tracking-[0.14em] font-medium',
                      activeTab === key ?
                        'bg-forest-green text-cream'
                      : 'bg-transparent text-stone hover:text-obsidian',
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <AnimatePresence mode="wait">
                {submitted ?
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="py-10 text-center"
                  >
                    <span className="inline-flex w-12 h-12 rounded-sm bg-forest-green/10 items-center justify-center">
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-forest-green"
                      >
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                    </span>
                    <span className="block font-luxury text-xl md:text-2xl font-semibold text-obsidian mt-4">
                      Thank you
                    </span>
                    <p className="m-0! mt-2! font-sans text-[13px] text-stone leading-relaxed">
                      We&apos;ve received your message and will come back within one business day.
                    </p>
                    <button
                      type="button"
                      onClick={() => setSubmitted(false)}
                      className="mt-4 bg-transparent border-0 cursor-pointer font-sans text-[11px] uppercase tracking-[0.16em] text-forest-green underline underline-offset-4"
                    >
                      Send another message
                    </button>
                  </motion.div>
                : <motion.form
                    key={activeTab}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    onSubmit={activeTab === 'general' ? handleGeneralSubmit : handleB2BSubmit}
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                      {activeTab === 'general' ?
                        <>
                          <Field label="Name" htmlFor="contact-name" required>
                            <input
                              id="contact-name"
                              name="name"
                              type="text"
                              required
                              className={FIELD_CLASS}
                            />
                          </Field>
                          <Field label="Email" htmlFor="contact-email" required>
                            <input
                              id="contact-email"
                              name="email"
                              type="email"
                              required
                              className={FIELD_CLASS}
                            />
                          </Field>
                          <Field
                            label="Subject"
                            htmlFor="contact-subject"
                            className="sm:col-span-2"
                          >
                            <input
                              id="contact-subject"
                              name="subject"
                              type="text"
                              className={FIELD_CLASS}
                            />
                          </Field>
                          <Field
                            label="Message"
                            htmlFor="contact-message"
                            required
                            className="sm:col-span-2"
                          >
                            <textarea
                              id="contact-message"
                              name="message"
                              rows={5}
                              required
                              className={cn(FIELD_CLASS, 'resize-y')}
                            />
                          </Field>
                        </>
                      : <>
                          <Field label="Company name" htmlFor="b2b-company" required>
                            <input
                              id="b2b-company"
                              name="company"
                              type="text"
                              required
                              className={FIELD_CLASS}
                            />
                          </Field>
                          <Field label="Contact name" htmlFor="b2b-contact" required>
                            <input
                              id="b2b-contact"
                              name="contactName"
                              type="text"
                              required
                              className={FIELD_CLASS}
                            />
                          </Field>
                          <Field label="Email" htmlFor="b2b-email" required>
                            <input
                              id="b2b-email"
                              name="email"
                              type="email"
                              required
                              className={FIELD_CLASS}
                            />
                          </Field>
                          <Field label="Phone" htmlFor="b2b-phone">
                            <input
                              id="b2b-phone"
                              name="phone"
                              type="tel"
                              className={FIELD_CLASS}
                            />
                          </Field>
                          {offices.length > 0 ? (
                            <Field
                              label="Preferred office"
                              htmlFor="b2b-office"
                              className="sm:col-span-2"
                            >
                              <select
                                id="b2b-office"
                                value={selectedOffice ?? ''}
                                onChange={(e) =>
                                  setSelectedOffice(e.target.value ? Number(e.target.value) : null)
                                }
                                className={FIELD_CLASS}
                              >
                                <option value="">Select an office</option>
                                {offices.map((o) => (
                                  <option key={o.id} value={o.id}>
                                    {o.city}, {o.country}
                                  </option>
                                ))}
                              </select>
                            </Field>
                          ) : null}
                          <Field
                            label="Tell us about your needs"
                            htmlFor="b2b-message"
                            required
                            className="sm:col-span-2"
                          >
                            <textarea
                              id="b2b-message"
                              name="message"
                              rows={5}
                              required
                              placeholder="Products of interest, estimated volumes, delivery requirements…"
                              className={cn(FIELD_CLASS, 'resize-y')}
                            />
                          </Field>
                        </>
                      }
                    </div>

                    {error ? (
                      <p className="m-0! mt-3! font-sans text-[12.5px] text-red-600">{error}</p>
                    ) : null}

                    <button
                      type="submit"
                      disabled={submitting}
                      className="mt-5 inline-flex items-center justify-center h-11 px-7 bg-forest-green border-0 rounded-sm cursor-pointer transition-colors hover:bg-bud-green disabled:opacity-60 disabled:cursor-wait"
                    >
                      <span className="text-cream text-[11px] uppercase tracking-[0.16em] font-heading font-semibold">
                        {submitting ? 'Sending…' : submitLabel}
                      </span>
                    </button>
                  </motion.form>
                }
              </AnimatePresence>
            </div>
          </div>

          {/* Aside */}
          <aside className="lg:col-span-4 flex flex-col gap-3 md:gap-4">
            <FadeIn delay={0.06}>
              <div className="bg-obsidian rounded-sm p-4 md:p-5">
                <Eyebrow tone="light">What to expect</Eyebrow>
                <dl className="m-0 mt-3">
                  {PROMISES.map((p) => (
                    <div
                      key={p.label}
                      className="flex items-baseline justify-between gap-4 py-2.5 border-b border-cream/10 last:border-b-0"
                    >
                      <dt className="font-sans text-[12px] text-cream/45">{p.label}</dt>
                      <dd className="m-0 font-sans text-[12px] text-cream text-right">{p.value}</dd>
                    </div>
                  ))}
                </dl>
                <a
                  href={CONTACT.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group no-underline mt-4 flex items-center justify-between gap-3 h-10 px-4 border border-cream/25 rounded-sm hover:bg-cream transition-colors"
                >
                  <span className="font-sans text-[10px] uppercase tracking-[0.16em] font-semibold text-cream group-hover:text-obsidian transition-colors">
                    Chat on WhatsApp
                  </span>
                  <span
                    aria-hidden
                    className="text-cream/50 group-hover:text-obsidian transition-colors"
                  >
                    →
                  </span>
                </a>
              </div>
            </FadeIn>

            <FadeIn delay={0.12}>
              <ImagePlaceholder
                {...MEDIA.formAside}
                ratio="4/3"
                sizes="(max-width: 1024px) 100vw, 30vw"
                className="rounded-sm"
              />
            </FadeIn>
          </aside>
        </div>
      </section>

      {/* ═══ 4 · LOCATIONS ══════════════════════════════════════ */}
      <section className={cn(GUTTER, BAND, 'bg-parchment')}>
        <SectionHead
          eyebrow="Where we are"
          title="Offices & operating regions"
          lede="Headquartered in the UAE with agricultural roots in Algeria, coordinating across North Africa, Southern Europe and the Middle East."
        />

        {offices.length > 0 ?
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            {offices.map((office, i) => {
              const media = typeof office.image === 'object' ? (office.image as Media) : null
              const imgUrl = media?.sizes?.card?.url ?? media?.url ?? null
              const active = selectedOffice === office.id
              return (
                <FadeIn key={office.id} delay={i * 0.05}>
                  <button
                    type="button"
                    onClick={() => setSelectedOffice(office.id)}
                    className={cn(
                      'group w-full h-full text-left bg-white border rounded-sm overflow-hidden p-0 cursor-pointer transition-colors',
                      active ? 'border-forest-green' : 'border-stone/15 hover:border-stone/35',
                    )}
                  >
                    <ImagePlaceholder
                      src={imgUrl}
                      alt={`${office.city}, ${office.country}`}
                      label={office.city}
                      ratio="4/3"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 24vw"
                    />
                    <div className="p-4 md:p-5">
                      <span className="block font-luxury text-base md:text-lg font-semibold text-obsidian leading-tight">
                        {office.city}
                      </span>
                      <span className="block font-sans text-[10px] uppercase tracking-[0.16em] text-forest-green mt-1">
                        {office.country}
                      </span>
                      {office.address ? (
                        <p className="m-0! mt-2.5! font-sans text-[11.5px] text-stone leading-relaxed">
                          {office.address}
                        </p>
                      ) : null}
                      {office.email ? (
                        <span className="block font-sans text-[11.5px] text-stone mt-1">
                          {office.email}
                        </span>
                      ) : null}
                      <span
                        className={cn(
                          'block font-sans text-[10px] uppercase tracking-[0.16em] mt-3',
                          active ? 'text-forest-green' : 'text-stone/50',
                        )}
                      >
                        {active ? 'Selected for inquiry' : 'Use for inquiry'}
                      </span>
                    </div>
                  </button>
                </FadeIn>
              )
            })}
          </div>
        : <FadeIn>
            <ImagePlaceholder
              {...MEDIA.locations}
              tone="dark"
              glyph={false}
              sizes="100vw"
              className="rounded-sm"
            >
              {MEDIA.locations.src ? (
                <div className="absolute inset-0 bg-linear-to-t from-obsidian/90 via-obsidian/45 to-obsidian/15" />
              ) : null}
              <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 md:p-7">
                {REGIONS.map((r) => (
                  <div key={r.tag}>
                    <Eyebrow tone="light">{r.tag}</Eyebrow>
                    <span className="block font-sans text-[13px] md:text-sm text-cream mt-1.5">
                      {r.value}
                    </span>
                  </div>
                ))}
              </div>
            </ImagePlaceholder>
          </FadeIn>
        }
      </section>

      <FAQSection />
    </div>
  )
}
