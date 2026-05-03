'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef, useState, useEffect } from 'react'
import { FadeIn } from '@/components/animations/FadeIn'
import { MagneticButton } from '@/components/animations/MagneticButton'

type Policy = {
  id: string
  title: string
  summary: string
  points: string[]
}

const policies: Policy[] = [
  {
    id: 'terms',
    title: 'Terms of Service',
    summary:
      'By accessing the Delicious Planet website and placing orders, you agree to our terms of service. These terms govern your use of our platform and purchasing relationship.',
    points: [
      'All prices are displayed in the selected currency and may vary by region.',
      'Delicious Planet reserves the right to update product listings and pricing without prior notice.',
      'Orders are subject to availability and confirmation of payment.',
      'We reserve the right to cancel orders where products are unavailable or where pricing errors have occurred.',
    ],
  },
  {
    id: 'privacy',
    title: 'Privacy Policy',
    summary:
      'Your personal data is handled in accordance with applicable data protection regulations. We collect only the information necessary to fulfil your orders and improve your experience.',
    points: [
      'Personal data collected includes name, email, delivery address, and payment information.',
      'We do not sell personal data to third parties.',
      'Data is retained for as long as required to fulfil legal and operational obligations.',
      'You may request access to or deletion of your personal data by contacting us.',
    ],
  },
  {
    id: 'shipping',
    title: 'Shipping Policy',
    summary:
      'We dispatch orders through carriers selected for reliability, traceability, and category-appropriate handling. Lead times vary by destination and product type.',
    points: [
      'Standard orders are dispatched within 2–4 business days of confirmation.',
      'Temperature-sensitive products are shipped using cold-chain carriers only.',
      'International shipments may be subject to customs duties payable by the recipient.',
      'Tracking details are issued by email at the time of dispatch.',
    ],
  },
  {
    id: 'returns',
    title: 'Returns & Refunds',
    summary:
      'We are committed to the quality of every product we ship. If you receive a damaged or incorrect item, please contact us within 48 hours of delivery.',
    points: [
      'Returns are accepted for damaged or incorrectly dispatched items only.',
      'Perishable and temperature-controlled products cannot be returned once delivered.',
      'Refunds are processed to the original payment method within 7–10 business days.',
      'For B2B orders, returns are subject to the terms agreed at the time of order.',
    ],
  },
  {
    id: 'cancellation',
    title: 'Cancellation Policy',
    summary:
      'Orders may be cancelled before dispatch. Once an order has been dispatched, cancellations cannot be processed.',
    points: [
      'To cancel an order, contact us as soon as possible after placing it.',
      'Cancellations are not guaranteed once order processing has begun.',
      'B2B and contract orders are subject to separate cancellation terms.',
    ],
  },
  {
    id: 'b2b-terms',
    title: 'B2B Terms',
    summary:
      'Business-to-business supply agreements are governed by individually negotiated terms. The following general principles apply unless otherwise specified in a written agreement.',
    points: [
      'Volume pricing, lead times, and payment terms are confirmed in writing prior to first delivery.',
      'Minimum order quantities apply and vary by product category.',
      'Supply continuity commitments are subject to producer availability and logistics conditions.',
      'Quality disputes must be raised within 48 hours of delivery with photographic documentation.',
    ],
  },
]

export function PoliciesPageClient() {
  const heroRef = useRef<HTMLDivElement | null>(null)
  const [heroTarget, setHeroTarget] = useState<HTMLDivElement | null>(null)
  const [activeId, setActiveId] = useState<string>(policies[0].id)

  const refCallback = (node: HTMLDivElement | null) => {
    heroRef.current = node
    setHeroTarget(node)
  }

  const { scrollYProgress } = useScroll({
    ...(heroTarget ? { target: { current: heroTarget } } : {}),
    offset: ['start start', 'end start'],
  })
  const imgY = useTransform(scrollYProgress, [0, 1], ['0%', '20%'])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)
        if (visible[0]) setActiveId(visible[0].target.id)
      },
      { rootMargin: '-30% 0px -55% 0px', threshold: [0, 0.25, 0.5, 0.75, 1] },
    )
    policies.forEach((p) => {
      const el = document.getElementById(p.id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [])

  return (
    <>
      {/* ─── Hero ─── */}
      <section
        ref={refCallback}
        className="relative h-[60vh] min-h-[420px] flex items-end overflow-hidden"
      >
        <motion.div style={{ y: imgY }} className="absolute inset-0">
          <Image
            src="/images/policy/policy-cover.avif"
            alt=""
            fill
            sizes="100vw"
            className="object-cover object-center"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/70 to-obsidian/40" />
        </motion.div>
        <div className="relative z-10 w-full max-w-[1440px] mx-auto px-5 sm:px-6 md:px-8 lg:px-12 pb-12 sm:pb-16 lg:pb-20">
          <motion.p
            className="text-xs uppercase tracking-[0.3em] text-gold font-medium mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Legal &amp; Compliance
          </motion.p>
          <motion.h1
            className="font-luxury text-[36px] sm:text-[48px] lg:text-[64px] xl:text-[72px] font-light text-cream leading-[1.05] tracking-[-0.03em] m-0 mb-6 max-w-3xl"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            Policies &amp; Terms
          </motion.h1>
          <motion.p
            className="text-cream/65 text-base lg:text-lg leading-relaxed max-w-xl m-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.7 }}
          >
            Structured policies ensure clarity and consistency across transactions —
            for individual customers and B2B partners alike.
          </motion.p>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-gold to-transparent opacity-50" />
      </section>

      {/* ─── Intro / Last updated ─── */}
      <section className="bg-cream py-12 lg:py-16 border-b border-mist/40">
        <div className="max-w-[1440px] mx-auto px-5 sm:px-6 md:px-8 lg:px-12">
          <div className="flex flex-col md:flex-row gap-8 md:gap-16 md:items-end justify-between">
            <FadeIn>
              <p className="font-luxury text-2xl lg:text-3xl text-obsidian leading-[1.3] tracking-[-0.02em] m-0 max-w-2xl font-light">
                We aim for transparency in every commercial relationship — these policies
                outline the framework that governs our service.
              </p>
            </FadeIn>
            <FadeIn delay={0.15}>
              <div className="text-right shrink-0">
                <p className="text-[10px] uppercase tracking-[0.25em] text-stone/60 m-0 mb-2">
                  Last updated
                </p>
                <p className="font-luxury text-xl text-obsidian m-0">May 2026</p>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ─── Policies — sticky sidebar + content ─── */}
      <section className="bg-cream py-14 sm:py-16 md:py-20 lg:py-28">
        <div className="max-w-[1440px] mx-auto px-5 sm:px-6 md:px-8 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-12 lg:gap-20">
            {/* Sticky sidebar nav */}
            <aside className="lg:sticky lg:top-28 lg:self-start">
              <p className="text-[10px] uppercase tracking-[0.3em] text-gold font-medium mb-5">
                Contents
              </p>
              <nav className="flex flex-row lg:flex-col flex-wrap gap-x-4 gap-y-2 lg:gap-y-1">
                {policies.map((p, i) => {
                  const num = String(i + 1).padStart(2, '0')
                  const isActive = activeId === p.id
                  return (
                    <a
                      key={p.id}
                      href={`#${p.id}`}
                      className={`group flex items-baseline gap-3 py-1.5 lg:py-2 text-sm transition-colors no-underline border-l-2 lg:pl-4 ${
                        isActive
                          ? 'border-forest-green text-obsidian font-medium'
                          : 'border-transparent text-stone hover:text-obsidian'
                      }`}
                    >
                      <span
                        className={`font-luxury text-[10px] tracking-widest ${
                          isActive ? 'text-forest-green' : 'text-stone/40'
                        }`}
                      >
                        {num}
                      </span>
                      <span>{p.title}</span>
                    </a>
                  )
                })}
              </nav>

              {/* Decorative image — shows on lg+ */}
              <div className="hidden lg:block mt-10 relative aspect-[3/4] rounded-sm overflow-hidden">
                <Image
                  src="/images/policy/policy.avif"
                  alt=""
                  fill
                  sizes="260px"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-obsidian/60 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <p className="text-[10px] uppercase tracking-[0.25em] text-gold m-0 mb-1">
                    Need help?
                  </p>
                  <Link
                    href="/contact"
                    className="text-cream text-sm no-underline hover:text-gold transition-colors"
                  >
                    Get in touch →
                  </Link>
                </div>
              </div>
            </aside>

            {/* Content */}
            <div className="min-w-0">
              <div className="space-y-16 sm:space-y-20">
                {policies.map((policy, i) => (
                  <PolicyBlock key={policy.id} policy={policy} index={i} />
                ))}

                {/* Shipping detail card with image */}
                <FadeIn>
                  <div className="relative rounded-sm overflow-hidden bg-obsidian">
                    <div className="grid grid-cols-1 md:grid-cols-2">
                      <div className="relative aspect-[4/3] md:aspect-auto md:min-h-[320px]">
                        <Image
                          src="/images/policy/shipping-policy.avif"
                          alt=""
                          fill
                          sizes="(max-width:768px) 100vw, 50vw"
                          className="object-cover"
                        />
                      </div>
                      <div className="p-8 sm:p-10 lg:p-12 flex flex-col justify-center">
                        <p className="text-[10px] uppercase tracking-[0.3em] text-gold font-medium mb-4">
                          Logistics
                        </p>
                        <h3 className="font-luxury text-2xl lg:text-3xl text-cream leading-[1.2] tracking-tight m-0 mb-4 font-light">
                          Tracked shipping, every order.
                        </h3>
                        <p className="text-cream/65 text-sm leading-relaxed m-0 mb-6">
                          Every dispatch generates a tracking record sent directly to your
                          inbox. For temperature-sensitive products, cold-chain carriers
                          maintain integrity from warehouse to destination.
                        </p>
                        <a
                          href="#shipping"
                          className="text-gold text-xs uppercase tracking-[0.2em] no-underline hover:text-gold-light transition-colors w-fit"
                        >
                          Read shipping policy →
                        </a>
                      </div>
                    </div>
                  </div>
                </FadeIn>

                {/* Contact closeout */}
                <FadeIn>
                  <div className="border-t border-mist/60 pt-12">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-gold font-medium mb-3">
                      Questions
                    </p>
                    <h3 className="font-luxury text-2xl lg:text-3xl text-obsidian leading-[1.2] tracking-tight m-0 mb-4 font-light">
                      Need clarification on any of these terms?
                    </h3>
                    <p className="text-stone text-base leading-relaxed m-0 mb-6 max-w-xl">
                      Our team responds to policy and terms inquiries within two business
                      days. For B2B contract questions, please indicate company details in
                      your message.
                    </p>
                    <MagneticButton>
                      <Link
                        href="/contact"
                        className="inline-block bg-obsidian text-cream text-sm font-medium uppercase tracking-widest px-9 py-4 rounded-sm no-underline hover:bg-forest-green transition-colors"
                      >
                        Contact Us
                      </Link>
                    </MagneticButton>
                  </div>
                </FadeIn>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

function PolicyBlock({ policy, index }: { policy: Policy; index: number }) {
  const num = String(index + 1).padStart(2, '0')
  return (
    <FadeIn>
      <div id={policy.id} className="scroll-mt-28">
        <div className="flex items-baseline gap-4 mb-6">
          <span className="font-luxury text-sm text-gold tracking-[0.25em]">{num}</span>
          <div className="flex-1 h-px bg-mist/60" />
        </div>
        <h2 className="font-luxury text-[28px] sm:text-[32px] lg:text-[40px] font-light text-obsidian leading-[1.15] tracking-[-0.02em] m-0 mb-5">
          {policy.title}
        </h2>
        <p className="text-stone text-base lg:text-lg leading-relaxed m-0 mb-8 max-w-2xl">
          {policy.summary}
        </p>
        {policy.points.length > 0 && (
          <ul className="list-none m-0 p-0 space-y-3 max-w-2xl">
            {policy.points.map((point) => (
              <li
                key={point}
                className="flex items-start gap-4 pl-6 py-3 border-l border-mist/60 hover:border-forest-green/60 transition-colors"
              >
                <span className="text-stone text-[15px] leading-relaxed">{point}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </FadeIn>
  )
}
