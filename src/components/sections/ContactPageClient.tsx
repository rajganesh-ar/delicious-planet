'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { FadeIn } from '@/components/animations/FadeIn'
import { MagneticButton } from '@/components/animations/MagneticButton'
import type { OfficeLocation, Media } from '@/payload-types'

interface ContactPageClientProps {
  offices: OfficeLocation[]
}

type FormTab = 'general' | 'commercial'

export function ContactPageClient({ offices }: ContactPageClientProps) {
  const [activeTab, setActiveTab] = useState<FormTab>('general')
  const [selectedOffice, setSelectedOffice] = useState<number | null>(offices[0]?.id ?? null)
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  async function handleGeneralSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitting(true)
    // Simulate submission delay
    await new Promise((r) => setTimeout(r, 1000))
    setSubmitting(false)
    setSubmitted(true)
  }

  async function handleCommercialSubmit(e: React.FormEvent<HTMLFormElement>) {
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

  const activeOffice = offices.find((o) => o.id === selectedOffice)

  return (
    <>
      {/* Hero */}
      <section className="pt-32 pb-16 bg-cream">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
          <motion.p
            className="text-xs uppercase tracking-[0.3em] text-gold font-medium mb-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Get in Touch
          </motion.p>
          <motion.h1
            className="font-serif text-4xl lg:text-[50px] font-medium text-obsidian tracking-[-0.04em] m-0 mb-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            Let&apos;s Connect
          </motion.h1>
          <motion.p
            className="text-stone text-lg max-w-xl m-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Whether you&apos;re a home cook, chef, or business — we&apos;d love to hear from you.
          </motion.p>
        </div>
      </section>

      {/* Main content */}
      <section className="py-(--spacing-section) bg-cream">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">
            {/* Form */}
            <div className="flex-1 max-w-2xl">
              {/* Tabs */}
              <FadeIn>
                <div className="flex gap-6 mb-10 border-b border-mist/40">
                  <button
                    onClick={() => {
                      setActiveTab('general')
                      setSubmitted(false)
                    }}
                    className={`text-sm pb-3 border-b-2 transition-colors cursor-pointer bg-transparent ${
                      activeTab === 'general'
                        ? 'border-gold text-gold font-medium'
                        : 'border-transparent text-stone hover:text-obsidian'
                    }`}
                  >
                    General Inquiry
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('commercial')
                      setSubmitted(false)
                    }}
                    className={`text-sm pb-3 border-b-2 transition-colors cursor-pointer bg-transparent ${
                      activeTab === 'commercial'
                        ? 'border-gold text-gold font-medium'
                        : 'border-transparent text-stone hover:text-obsidian'
                    }`}
                  >
                    Commercial / Wholesale
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
                    <div className="w-16 h-16 rounded-full bg-forest/10 flex items-center justify-center mx-auto mb-6">
                      <svg
                        width="32"
                        height="32"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        className="text-forest"
                      >
                        <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <h3 className="font-serif text-2xl font-medium text-obsidian m-0 mb-2">
                      Thank You
                    </h3>
                    <p className="text-stone m-0 mb-6">
                      We&apos;ve received your message and will get back to you shortly.
                    </p>
                    <button
                      onClick={() => setSubmitted(false)}
                      className="text-sm text-gold underline cursor-pointer bg-transparent border-0"
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
                      <div>
                        <label className="block text-xs uppercase tracking-wider text-stone mb-2">
                          Name *
                        </label>
                        <input
                          type="text"
                          name="name"
                          required
                          className="w-full bg-transparent border border-mist text-obsidian text-sm px-4 py-3 rounded-sm outline-none focus:border-gold transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-xs uppercase tracking-wider text-stone mb-2">
                          Email *
                        </label>
                        <input
                          type="email"
                          name="email"
                          required
                          className="w-full bg-transparent border border-mist text-obsidian text-sm px-4 py-3 rounded-sm outline-none focus:border-gold transition-colors"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-stone mb-2">
                        Subject
                      </label>
                      <input
                        type="text"
                        name="subject"
                        className="w-full bg-transparent border border-mist text-obsidian text-sm px-4 py-3 rounded-sm outline-none focus:border-gold transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-stone mb-2">
                        Message *
                      </label>
                      <textarea
                        name="message"
                        required
                        rows={5}
                        className="w-full bg-transparent border border-mist text-obsidian text-sm px-4 py-3 rounded-sm outline-none focus:border-gold transition-colors resize-vertical"
                      />
                    </div>
                    <MagneticButton>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="bg-gold text-obsidian text-sm font-medium uppercase tracking-widest px-10 py-4 rounded-sm border-0 cursor-pointer hover:bg-gold-light transition-colors disabled:opacity-50"
                      >
                        {submitting ? 'Sending...' : 'Send Message'}
                      </button>
                    </MagneticButton>
                  </motion.form>
                ) : (
                  <motion.form
                    key="commercial"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    onSubmit={handleCommercialSubmit}
                    className="space-y-6"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs uppercase tracking-wider text-stone mb-2">
                          Company Name *
                        </label>
                        <input
                          type="text"
                          name="company"
                          required
                          className="w-full bg-transparent border border-mist text-obsidian text-sm px-4 py-3 rounded-sm outline-none focus:border-gold transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-xs uppercase tracking-wider text-stone mb-2">
                          Contact Name *
                        </label>
                        <input
                          type="text"
                          name="contactName"
                          required
                          className="w-full bg-transparent border border-mist text-obsidian text-sm px-4 py-3 rounded-sm outline-none focus:border-gold transition-colors"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs uppercase tracking-wider text-stone mb-2">
                          Email *
                        </label>
                        <input
                          type="email"
                          name="email"
                          required
                          className="w-full bg-transparent border border-mist text-obsidian text-sm px-4 py-3 rounded-sm outline-none focus:border-gold transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-xs uppercase tracking-wider text-stone mb-2">
                          Phone
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          className="w-full bg-transparent border border-mist text-obsidian text-sm px-4 py-3 rounded-sm outline-none focus:border-gold transition-colors"
                        />
                      </div>
                    </div>

                    {/* Office selector */}
                    {offices.length > 0 && (
                      <div>
                        <label className="block text-xs uppercase tracking-wider text-stone mb-2">
                          Preferred Office
                        </label>
                        <select
                          value={selectedOffice ?? ''}
                          onChange={(e) =>
                            setSelectedOffice(e.target.value ? Number(e.target.value) : null)
                          }
                          className="w-full bg-transparent border border-mist text-obsidian text-sm px-4 py-3 rounded-sm outline-none focus:border-gold transition-colors"
                        >
                          <option value="">Select an office</option>
                          {offices.map((o) => (
                            <option key={o.id} value={o.id}>
                              {o.city}, {o.country}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div>
                      <label className="block text-xs uppercase tracking-wider text-stone mb-2">
                        Tell us about your needs *
                      </label>
                      <textarea
                        name="message"
                        required
                        rows={5}
                        placeholder="Products of interest, estimated volumes, delivery requirements..."
                        className="w-full bg-transparent border border-mist text-obsidian text-sm px-4 py-3 rounded-sm outline-none focus:border-gold transition-colors resize-vertical placeholder:text-stone/40"
                      />
                    </div>
                    <MagneticButton>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="bg-gold text-obsidian text-sm font-medium uppercase tracking-widest px-10 py-4 rounded-sm border-0 cursor-pointer hover:bg-gold-light transition-colors disabled:opacity-50"
                      >
                        {submitting ? 'Submitting...' : 'Submit Inquiry'}
                      </button>
                    </MagneticButton>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>

            {/* Sidebar: offices */}
            <div className="lg:w-80 lg:shrink-0">
              <FadeIn direction="right">
                <h3 className="font-serif text-xl font-medium text-obsidian m-0 mb-6">
                  Our Offices
                </h3>
                <div className="space-y-6">
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
                        onClick={() => setSelectedOffice(office.id)}
                        className={`w-full text-left p-4 rounded-sm border transition-all cursor-pointer bg-transparent ${
                          selectedOffice === office.id
                            ? 'border-gold bg-gold/5'
                            : 'border-mist/40 hover:border-gold/40'
                        }`}
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
                              <p className="text-gold text-xs m-0 mt-1">{office.email}</p>
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
        </div>
      </section>
    </>
  )
}
