'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { FadeIn } from '@/components/animations/FadeIn'
import { MagneticButton } from '@/components/animations/MagneticButton'
import { FAQSection } from '@/components/sections/FAQSection'
import type { OfficeLocation, Media } from '@/payload-types'
import {
  Button,
  Container,
  Eyebrow,
  FormField,
  Heading,
  Input,
  ProseText,
  Select,
  Textarea,
} from '@/components/ui'
import { cn } from '@/lib/cn'

interface ContactPageClientProps {
  offices: OfficeLocation[]
}

type FormTab = 'general' | 'b2b'

export function ContactPageClient({ offices }: ContactPageClientProps) {
  const [activeTab, setActiveTab] = useState<FormTab>('general')
  const [selectedOffice, setSelectedOffice] = useState<number | null>(offices[0]?.id ?? null)
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  async function handleGeneralSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)
    setSubmitting(true)

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

      if (res.ok) {
        setSubmitted(true)
      }
    } finally {
      setSubmitting(false)
    }
  }

  async function handleB2BSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)
    setSubmitting(true)

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

      if (res.ok) {
        setSubmitted(true)
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <section className="relative bg-obsidian overflow-hidden pt-20 sm:pt-24">
        <div className="absolute inset-0 bg-linear-to-br from-obsidian via-charcoal to-obsidian opacity-90" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-gold to-transparent opacity-40" />
        <Container size="lg" className="relative py-12 sm:py-16 md:py-20 lg:py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Eyebrow tone="gold" className="mb-4">
              Get in Touch
            </Eyebrow>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <Heading as="h1" variant="display" className="text-cream m-0">
              Let&apos;s Connect
            </Heading>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <ProseText size="md" tone="cream" className="mt-4 mb-0 max-w-lg">
              Whether you&apos;re a home cook, chef, or business — we&apos;d love to hear from you.
            </ProseText>
          </motion.div>
        </Container>
      </section>

      <section className="bg-cream py-12 sm:py-16 md:py-20 lg:py-24">
        <Container size="lg">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-10 md:gap-14 lg:gap-20">
            <div className="max-w-2xl">
              <FadeIn>
                <div className="flex gap-6 mb-8 sm:mb-10 border-b border-mist/60">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('general')
                      setSubmitted(false)
                    }}
                    className={cn(
                      'text-sm pb-3 border-b-2 transition-colors cursor-pointer bg-transparent',
                      activeTab === 'general'
                        ? 'border-forest-green text-forest-green font-medium'
                        : 'border-transparent text-stone hover:text-obsidian',
                    )}
                  >
                    General Inquiry
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('b2b')
                      setSubmitted(false)
                    }}
                    className={cn(
                      'text-sm pb-3 border-b-2 transition-colors cursor-pointer bg-transparent',
                      activeTab === 'b2b'
                        ? 'border-forest-green text-forest-green font-medium'
                        : 'border-transparent text-stone hover:text-obsidian',
                    )}
                  >
                    B2B / Wholesale
                  </button>
                </div>
              </FadeIn>

              <AnimatePresence mode="wait">
                {submitted ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-center py-16"
                  >
                    <div className="w-16 h-16 rounded-full bg-forest-green/10 flex items-center justify-center mx-auto mb-6">
                      <svg
                        width="32"
                        height="32"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        className="text-forest-green"
                      >
                        <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <Heading as="h3" variant="section" className="m-0 mb-2">
                      Thank You
                    </Heading>
                    <ProseText size="md" tone="muted" className="m-0 mb-6">
                      We&apos;ve received your message and will get back to you shortly.
                    </ProseText>
                    <button
                      type="button"
                      onClick={() => setSubmitted(false)}
                      className="text-sm text-forest-green underline cursor-pointer bg-transparent border-0"
                    >
                      Send another message
                    </button>
                  </motion.div>
                ) : activeTab === 'general' ? (
                  <motion.form
                    key="general"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    onSubmit={handleGeneralSubmit}
                    className="space-y-6"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <FormField label="Name" required htmlFor="contact-name">
                        <Input id="contact-name" type="text" name="name" required />
                      </FormField>
                      <FormField label="Email" required htmlFor="contact-email">
                        <Input id="contact-email" type="email" name="email" required />
                      </FormField>
                    </div>
                    <FormField label="Subject" htmlFor="contact-subject">
                      <Input id="contact-subject" type="text" name="subject" />
                    </FormField>
                    <FormField label="Message" required htmlFor="contact-message">
                      <Textarea id="contact-message" name="message" required rows={5} />
                    </FormField>
                    <MagneticButton>
                      <Button type="submit" variant="primary" size="lg" loading={submitting}>
                        {submitting ? 'Sending…' : 'Send Message'}
                      </Button>
                    </MagneticButton>
                  </motion.form>
                ) : (
                  <motion.form
                    key="b2b"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    onSubmit={handleB2BSubmit}
                    className="space-y-6"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <FormField label="Company Name" required htmlFor="b2b-company">
                        <Input id="b2b-company" type="text" name="company" required />
                      </FormField>
                      <FormField label="Contact Name" required htmlFor="b2b-contact">
                        <Input id="b2b-contact" type="text" name="contactName" required />
                      </FormField>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <FormField label="Email" required htmlFor="b2b-email">
                        <Input id="b2b-email" type="email" name="email" required />
                      </FormField>
                      <FormField label="Phone" htmlFor="b2b-phone">
                        <Input id="b2b-phone" type="tel" name="phone" />
                      </FormField>
                    </div>

                    {offices.length > 0 && (
                      <FormField label="Preferred Office" htmlFor="b2b-office">
                        <Select
                          id="b2b-office"
                          value={selectedOffice ?? ''}
                          onChange={(e) =>
                            setSelectedOffice(e.target.value ? Number(e.target.value) : null)
                          }
                        >
                          <option value="">Select an office</option>
                          {offices.map((o) => (
                            <option key={o.id} value={o.id}>
                              {o.city}, {o.country}
                            </option>
                          ))}
                        </Select>
                      </FormField>
                    )}

                    <FormField label="Tell us about your needs" required htmlFor="b2b-message">
                      <Textarea
                        id="b2b-message"
                        name="message"
                        required
                        rows={5}
                        placeholder="Products of interest, estimated volumes, delivery requirements..."
                      />
                    </FormField>
                    <MagneticButton>
                      <Button type="submit" variant="primary" size="lg" loading={submitting}>
                        {submitting ? 'Submitting…' : 'Submit Inquiry'}
                      </Button>
                    </MagneticButton>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>

            <div>
              <FadeIn direction="right">
                <Heading as="h3" variant="card" className="m-0 mb-6">
                  Our Offices
                </Heading>
                <div className="space-y-4 sm:space-y-6">
                  {offices.map((office) => {
                    const imgUrl =
                      typeof office.image === 'object' && office.image !== null
                        ? ((office.image as Media).sizes?.thumbnail?.url ??
                          (office.image as Media).url ??
                          null)
                        : null
                    return (
                      <button
                        key={office.id}
                        type="button"
                        onClick={() => setSelectedOffice(office.id)}
                        className={cn(
                          'w-full text-left p-4 rounded-sm border transition-all cursor-pointer bg-transparent',
                          selectedOffice === office.id
                            ? 'border-forest-green bg-forest-green/5'
                            : 'border-mist/60 hover:border-forest-green/40',
                        )}
                      >
                        <div className="flex gap-4">
                          {imgUrl && (
                            <div className="w-16 h-16 rounded-sm overflow-hidden shrink-0 relative">
                              <Image
                                src={imgUrl}
                                alt={`${office.city}`}
                                fill
                                sizes="64px"
                                className="object-cover"
                              />
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-obsidian m-0 text-sm">
                              {office.city}, {office.country}
                            </p>
                            {office.address && (
                              <p className="text-stone/70 text-xs m-0 mt-1">{office.address}</p>
                            )}
                            {office.email && (
                              <p className="text-forest-green text-xs m-0 mt-1">{office.email}</p>
                            )}
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </FadeIn>
            </div>
          </div>
        </Container>
      </section>

      <FAQSection />
    </>
  )
}
