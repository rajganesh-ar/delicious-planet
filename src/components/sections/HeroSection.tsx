'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

interface HeroSectionProps {
  headline?: string
  subheadline?: string
  backgroundUrl?: string | null
}

const ease = [0.22, 1, 0.36, 1] as [number, number, number, number]

export function HeroSection({
  headline = 'Premium Ingredients, Global Origins',
  subheadline = 'Sourced from leading producers across Europe, North Africa, the United Kingdom, and the United States — serving professional kitchens, retailers, and culinary enthusiasts.',
  backgroundUrl,
}: HeroSectionProps) {
  return (
    <section className="hero">
      {/* ── Background ── */}
      <div className="hero__media">
        <motion.video
          src="/videos/chef-hero.mp4"
          autoPlay
          muted
          loop
          playsInline
          className="hero__video"
          initial={{ scale: 1.06 }}
          animate={{ scale: 1 }}
          transition={{ duration: 2.8, ease }}
        />
        <div className="hero__overlay" />
      </div>

      {/* ── Content ── */}
      <div className="hero__inner">
        {/* Headline */}
        <motion.h1
          className="hero__headline"
          initial={{ opacity: 0, y: 56 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, delay: 0.45, ease }}
        >
          {headline}
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          className="hero__sub"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7, ease }}
        >
          {subheadline}
        </motion.p>

        {/* CTAs */}
        <motion.div
          className="hero__ctas"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.95, ease }}
        >
          <Link href="/products" className="hero__btn hero__btn--primary">
            Shop the Collection
          </Link>
          <Link href="/about" className="hero__btn hero__btn--ghost">
            Our Story
          </Link>
        </motion.div>
      </div>

      {/* ── Scroll indicator ── */}
      <motion.div
        className="hero__scroll"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.6, ease }}
      >
        <span className="hero__scroll-text">Scroll</span>
        <span className="hero__scroll-bar" />
      </motion.div>
    </section>
  )
}
