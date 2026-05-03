'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'

export function FloatingElements() {
  const [contactOpen, setContactOpen] = useState(false)
  const [newsletterOpen, setNewsletterOpen] = useState(false)
  const [newsletterDismissed, setNewsletterDismissed] = useState(false)
  const [email, setEmail] = useState('')

  // Show newsletter popup after 30s or 60% scroll
  useEffect(() => {
    if (newsletterDismissed) return

    const timer = setTimeout(() => {
      setNewsletterOpen(true)
    }, 30000)

    const handleScroll = () => {
      const scrollPercent = window.scrollY / (document.body.scrollHeight - window.innerHeight)
      if (scrollPercent > 0.6) {
        setNewsletterOpen(true)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      clearTimeout(timer)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [newsletterDismissed])

  const [submitting, setSubmitting] = useState(false)

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await fetch('/api/newsletter-subscribers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'popup' }),
      })
    } catch {
      // Best-effort — dismiss either way
    } finally {
      setSubmitting(false)
      setNewsletterDismissed(true)
      setNewsletterOpen(false)
      setEmail('')
    }
  }

  return (
    <>
      {/* Floating contact button */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3">
        <AnimatePresence>
          {contactOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-xl shadow-2xl border border-black/5 p-5 mb-2 w-64"
            >
              <p className="text-sm font-semibold text-[#111] m-0 mb-3">Get in touch</p>
              <div className="flex flex-col gap-2.5">
                <a
                  href="tel:+1234567890"
                  className="flex items-center gap-2.5 text-sm text-[#6b6b6b] hover:text-[#1B512D] transition-colors no-underline"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  Call us
                </a>
                <a
                  href="mailto:info@deliciousplanet.com"
                  className="flex items-center gap-2.5 text-sm text-[#6b6b6b] hover:text-[#1B512D] transition-colors no-underline"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                  Email us
                </a>
                <a
                  href="https://wa.me/1234567890"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 text-sm text-[#6b6b6b] hover:text-[#1B512D] transition-colors no-underline"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.5.5 0 0 0 .611.611l4.458-1.495A11.948 11.948 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.264 0-4.353-.723-6.066-1.951l-.424-.314-2.637.884.884-2.637-.314-.424A9.935 9.935 0 0 1 2 12C2 6.486 6.486 2 12 2s10 4.486 10 10-4.486 10-10 10z" />
                  </svg>
                  WhatsApp
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Vendor inquiry button */}
        <Link
          href="/vendors"
          className="flex items-center gap-2 bg-[#1B512D] text-white text-xs font-medium px-4 py-2.5 rounded-full shadow-lg hover:bg-[#5FAD56] transition-colors no-underline"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="8.5" cy="7" r="4" />
            <line x1="20" y1="8" x2="20" y2="14" />
            <line x1="23" y1="11" x2="17" y2="11" />
          </svg>
          Become a Vendor
        </Link>

        {/* Contact toggle button */}
        <button
          onClick={() => setContactOpen(!contactOpen)}
          className="flex items-center justify-center w-12 h-12 rounded-full bg-[#1B512D] text-white shadow-lg hover:bg-[#5FAD56] transition-colors border-none cursor-pointer"
          aria-label="Contact us"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            {contactOpen ? (
              <path d="M18 6L6 18M6 6l12 12" />
            ) : (
              <>
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </>
            )}
          </svg>
        </button>
      </div>

      {/* Newsletter popup */}
      <AnimatePresence>
        {newsletterOpen && !newsletterDismissed && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-6 left-6 z-40 bg-white rounded-xl shadow-2xl border border-black/5 p-6 w-80 max-w-[calc(100vw-7rem)]"
          >
            <button
              onClick={() => {
                setNewsletterDismissed(true)
                setNewsletterOpen(false)
              }}
              className="absolute top-3 right-3 w-6 h-6 flex items-center justify-center text-[#6b6b6b] hover:text-[#111] bg-transparent border-none cursor-pointer"
              aria-label="Close"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
            <p className="text-base font-semibold text-[#111] m-0 mb-1">Stay in the loop</p>
            <p className="text-sm text-[#6b6b6b] m-0 mb-4">
              Get updates on new products, recipes, and sourcing stories.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                disabled={submitting}
                className="flex-1 text-sm px-3 py-2 border border-black/10 rounded-lg bg-[#F5F5F5] outline-none focus:border-[#1B512D] transition-colors disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 bg-[#1B512D] text-white text-sm font-medium rounded-lg border-none cursor-pointer hover:bg-[#5FAD56] transition-colors disabled:opacity-60 disabled:cursor-wait"
              >
                {submitting ? '...' : 'Join'}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
