'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { motion, useScroll, useTransform } from 'framer-motion'
import { FadeIn } from '@/components/animations/FadeIn'

export function ContactUsSection() {
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })
  const [contactSubmitted, setContactSubmitted] = useState(false)

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setContactSubmitted(true)
    setContactForm({ name: '', email: '', subject: '', message: '' })
  }

  const sectionRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  })
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '30%'])
  const leavesY = useTransform(scrollYProgress, [0, 1], ['-10%', '15%'])

  const inputClasses =
    'w-full bg-cream/8 border border-cream/15 text-cream text-sm px-5 py-3.5 rounded-none outline-none placeholder:text-cream/30 focus:border-gold/60 transition-colors'

  return (
    <section ref={sectionRef} className="relative overflow-hidden">
      {/* Background image with parallax */}
      <motion.div
        className="absolute inset-x-0 -top-[15%] h-[130%] bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/images/misc/newsletter.avif')",
          y: bgY,
        }}
      />
      <div className="absolute inset-0 bg-obsidian/80" />

      <div className="relative z-10 max-w-360 mx-auto flex">
        {/* Decorative leaves — left side with parallax, PNG for transparency */}
        <motion.div
          className="hidden lg:flex items-end absolute left-0 bottom-0 w-96 xl:w-120 pointer-events-none z-10"
          style={{ y: leavesY, height: '120%' }}
        >
          <Image
            src="/images/misc/newsletter-leaves.png"
            alt=""
            width={600}
            height={900}
            className="w-full h-full object-contain object-bottom"
            sizes="(min-width: 1280px) 480px, 384px"
          />
        </motion.div>

        {/* Content — left aligned */}
        <div className="flex-1 py-10 md:py-14 lg:py-16 px-5 md:px-8 lg:px-10 xl:px-14 lg:pl-105 xl:pl-127.5">
          <div className="max-w-2xl">
            {/* ─── Contact Form ─── */}
            <FadeIn>
              <div>
                <p className="text-[10px] uppercase tracking-[0.25em] text-gold font-heading font-medium m-0 mb-3 flex items-center gap-3">
                  <span className="inline-block w-6 md:w-8 h-px bg-gold/40" />
                  Get in Touch
                </p>
                <h2 className="font-luxury text-2xl md:text-3xl lg:text-4xl font-medium text-cream tracking-tight m-0 leading-tight">
                  Contact Us
                </h2>
                <p className="text-cream/50 text-sm m-0 mt-2 max-w-md">
                  Questions, partnerships, or just want to say hello &mdash; we&rsquo;d love to hear
                  from you.
                </p>

                {contactSubmitted ? (
                  <div className="flex items-center gap-3 mt-6 py-4 px-5 border border-gold/20 bg-gold/5">
                    <svg
                      className="w-5 h-5 text-gold shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <p className="text-cream/70 text-sm m-0">
                      Message sent. We&rsquo;ll get back to you shortly.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleContactSubmit} className="space-y-4 mt-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <input
                        type="text"
                        required
                        value={contactForm.name}
                        onChange={(e) => setContactForm((p) => ({ ...p, name: e.target.value }))}
                        placeholder="Your name"
                        className={inputClasses}
                      />
                      <input
                        type="email"
                        required
                        value={contactForm.email}
                        onChange={(e) => setContactForm((p) => ({ ...p, email: e.target.value }))}
                        placeholder="Your email"
                        className={inputClasses}
                      />
                    </div>
                    <input
                      type="text"
                      required
                      value={contactForm.subject}
                      onChange={(e) => setContactForm((p) => ({ ...p, subject: e.target.value }))}
                      placeholder="Subject"
                      className={inputClasses}
                    />
                    <textarea
                      required
                      rows={4}
                      value={contactForm.message}
                      onChange={(e) => setContactForm((p) => ({ ...p, message: e.target.value }))}
                      placeholder="Your message"
                      className={`${inputClasses} resize-none`}
                    />
                    <div className="flex justify-start pt-1">
                      <button
                        type="submit"
                        className="bg-gold text-white text-xs font-medium uppercase tracking-[0.2em] px-10 py-3.5 rounded-none border-0 cursor-pointer hover:bg-gold-dark transition-colors"
                      >
                        Send Message
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </FadeIn>
          </div>
        </div>
      </div>
    </section>
  )
}
