'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef, useState } from 'react'
import { FadeIn } from '@/components/animations/FadeIn'
import { MagneticButton } from '@/components/animations/MagneticButton'

const categories = [
  {
    label: 'Fresh Produce',
    description: 'Seasonal fruits and vegetables sourced directly from farms.',
    href: '/products?category=fresh',
    image: '/images/retail/retail-fresh.avif',
    colSpan: 'lg:col-span-2',
    // Wide card — fixed aspect ratio drives row height
    aspectClass: 'aspect-16/9 lg:aspect-3/2',
    useHFull: false,
  },
  {
    label: 'Everyday Grocery',
    description: 'Pantry essentials and everyday staples from trusted producers.',
    href: '/products?category=grocery',
    image: '/images/retail/retail-grocery.avif',
    colSpan: 'lg:col-span-1',
    // Narrow card — must fill the row height driven by the wide card
    aspectClass: 'aspect-4/3 lg:aspect-auto',
    useHFull: true,
  },
] as const

const midCategories = [
  {
    label: 'Dairy & Cheese',
    description: 'Artisan cheeses and dairy from European farmhouse producers.',
    href: '/products?category=dairy',
    image: '/images/retail/retail-dairy.avif',
  },
  {
    label: 'Artisan Breads',
    description: 'Stone-baked loaves and baked goods with traditional methods.',
    href: '/products?category=breads',
    image: '/images/retail/retail-breads.avif',
  },
  {
    label: 'Organic Range',
    description: 'Certified organic selections held to the highest standards.',
    href: '/products?category=organic',
    image: '/images/retail/retail-organic.avif',
  },
] as const

// Row 3 — three equal cards
const bottomCategories = [
  {
    label: 'Fresh Vegetables',
    description: 'Farm-to-door vegetables selected at peak freshness.',
    href: '/products?category=vegetables',
    image: '/images/retail/retail-veg.avif',
  },
  {
    label: 'Cold & Chilled',
    description: 'Temperature-controlled premium ingredients delivered fresh.',
    href: '/products?category=cold',
    image: '/images/retail/retail-cold.avif',
  },
  {
    label: 'Drinks & Beverages',
    description: 'Curated selection of soft drinks, juices, and specialty beverages.',
    href: '/products?category=beverages',
    image: '/images/retail/retail-softdrinks.avif',
  },
] as const

const promises = [
  {
    title: 'Quality at Every Level',
    description:
      'Every product in our retail range passes through the same sourcing standards we apply to our professional supply — no compromises.',
  },
  {
    title: 'Traceable Origins',
    description:
      'We know where each ingredient comes from. From farm to shelf, origin transparency is a baseline, not an exception.',
  },
  {
    title: 'Curated Selection',
    description:
      'Our retail range is edited, not exhaustive. Each item earns its place through consistent quality and producer reliability.',
  },
  {
    title: 'Specialist Knowledge',
    description:
      'Sourced by a team with deep category expertise across European and global specialty food markets.',
  },
]

const stats = [
  { value: '7', label: 'Product Categories' },
  { value: '200+', label: 'Retail Products' },
  { value: '4', label: 'Sourcing Regions' },
  { value: '100%', label: 'Quality Checked' },
]

/* ── Category card overlay shared markup ── */
function CardOverlay({ label, description }: { label: string; description: string }) {
  return (
    <>
      <div className="absolute inset-0 bg-linear-to-t from-obsidian/85 via-obsidian/20 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-5 lg:p-7">
        <p className="text-xs uppercase tracking-[0.25em] text-gold font-medium mb-1.5 m-0">
          {label}
        </p>
        <p className="text-cream/70 text-sm leading-snug m-0 max-w-xs hidden sm:block">
          {description}
        </p>
        <span className="mt-3 inline-flex items-center gap-2 text-[11px] uppercase tracking-widest text-cream/50 group-hover:text-gold transition-colors duration-300">
          Shop Now
          <span className="w-4 h-px bg-current inline-block group-hover:w-6 transition-all duration-300" />
        </span>
      </div>
    </>
  )
}

export function RetailPageClient() {
  const heroRef = useRef<HTMLDivElement | null>(null)
  const [heroTarget, setHeroTarget] = useState<HTMLDivElement | null>(null)

  const refCallback = (node: HTMLDivElement | null) => {
    heroRef.current = node
    setHeroTarget(node)
  }

  const { scrollYProgress } = useScroll({
    ...(heroTarget ? { target: { current: heroTarget } } : {}),
    offset: ['start start', 'end start'],
  })
  const imgY = useTransform(scrollYProgress, [0, 1], ['0%', '25%'])

  return (
    <>
      {/* ── Hero ── */}
      <section
        ref={refCallback}
        className="relative h-[92vh] min-h-160 flex items-end overflow-hidden"
      >
        <motion.div style={{ y: imgY }} className="absolute inset-0">
          <Image
            src="/images/retail/retail-fresh.avif"
            alt=""
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
        </motion.div>
        {/* Left-heavy darkening so text is legible */}
        <div className="absolute inset-0 bg-linear-to-r from-obsidian/80 via-obsidian/40 to-transparent" />
        <div className="absolute inset-0 bg-linear-to-t from-obsidian/70 via-transparent to-obsidian/25" />

        <div className="relative z-10 w-full max-w-360 mx-auto px-5 sm:px-6 md:px-8 lg:px-12 pb-20 lg:pb-28">
          <motion.p
            className="text-xs uppercase tracking-[0.3em] text-gold font-medium mb-5 m-0"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Retail
          </motion.p>
          <motion.h1
            className="font-luxury text-4xl sm:text-5xl lg:text-[68px] xl:text-[80px] font-light text-cream leading-[1.05] tracking-[-0.03em] m-0 mb-6 max-w-3xl"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            Exceptional Ingredients,
            <br />
            <span className="text-gold">Everyday Access</span>
          </motion.h1>
          <motion.p
            className="font-luxury italic text-cream/65 text-lg lg:text-xl font-light max-w-xl m-0 mb-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            Premium specialty foods — from artisan breads to organic produce — curated for the
            discerning home kitchen.
          </motion.p>
          <motion.div
            className="flex flex-col sm:flex-row gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <MagneticButton>
              <Link
                href="/products"
                className="inline-block bg-gold text-obsidian text-sm font-medium uppercase tracking-widest px-10 py-4 rounded-sm no-underline hover:bg-gold-light transition-colors"
              >
                Shop All Products
              </Link>
            </MagneticButton>
            <Link
              href="#categories"
              className="inline-block border border-cream/40 text-cream text-sm font-medium uppercase tracking-widest px-10 py-4 rounded-sm no-underline hover:border-gold hover:text-gold transition-colors"
            >
              Browse Categories
            </Link>
          </motion.div>
        </div>

        {/* Scroll cue — matches site pattern */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          <span className="text-xs uppercase tracking-[0.2em] text-cream/40 font-medium">
            Scroll
          </span>
          <motion.div
            className="w-px h-10 bg-linear-to-b from-cream/40 to-transparent origin-top"
            animate={{ scaleY: [0, 1, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
        </motion.div>
      </section>

      {/* ── Editorial intro ── */}
      <section className="py-(--spacing-section) bg-cream">
        <div className="max-w-360 mx-auto px-5 sm:px-6 md:px-8 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-end">
            <FadeIn>
              <p className="text-xs uppercase tracking-[0.3em] text-gold font-medium mb-4 m-0">
                The Retail Range
              </p>
              <h2 className="font-luxury text-3xl lg:text-[44px] font-light text-obsidian leading-[1.15] tracking-[-0.03em] m-0">
                The same standards we hold for professional kitchens, now available for yours.
              </h2>
            </FadeIn>
            <FadeIn delay={0.15}>
              <p className="text-stone text-base lg:text-lg leading-relaxed m-0 mb-6">
                Our retail offering draws from the same supply relationships that serve restaurants
                and hotels across four continents. Seven curated categories — fresh produce, artisan
                breads, dairy, organic, chilled goods, grocery, and beverages — each selected with
                the rigour our wholesale clients depend on.
              </p>
              <div className="flex items-center gap-4">
                <div className="w-8 h-px bg-gold shrink-0" />
                <p className="text-xs uppercase tracking-[0.2em] text-gold font-medium m-0">
                  Quality without compromise
                </p>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ── Category grid — full bleed ── */}
      <section id="categories" className="bg-obsidian">
        {/* Section label — contained */}
        <div className="max-w-360 mx-auto px-5 sm:px-6 md:px-8 lg:px-12 pt-16 lg:pt-20 pb-8 lg:pb-10">
          <FadeIn>
            <p className="text-xs uppercase tracking-[0.3em] text-gold font-medium mb-3 m-0">
              Shop by Category
            </p>
            <h2 className="font-luxury text-3xl lg:text-[40px] font-light text-cream tracking-tight m-0">
              Seven Categories, One Standard
            </h2>
          </FadeIn>
        </div>

        {/* Row 1: Fresh (2 cols wide) + Grocery — full-bleed, 2px gap */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-0.5 mb-0.5">
          {categories.map((cat, i) => (
            <FadeIn
              key={cat.label}
              delay={i * 0.07}
              className={`${cat.colSpan} group ${cat.useHFull ? 'h-full' : ''}`}
            >
              <Link href={cat.href} className="block no-underline h-full">
                <div
                  className={`relative ${cat.aspectClass} overflow-hidden min-h-60 ${cat.useHFull ? 'h-full' : ''}`}
                >
                  <Image
                    src={cat.image}
                    alt={cat.label}
                    fill
                    sizes={
                      cat.colSpan === 'lg:col-span-2'
                        ? '(max-width: 1024px) 100vw, 66vw'
                        : '(max-width: 1024px) 100vw, 33vw'
                    }
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <CardOverlay label={cat.label} description={cat.description} />
                </div>
              </Link>
            </FadeIn>
          ))}
        </div>

        {/* Row 2: Dairy, Breads, Organic — equal thirds */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-0.5 mb-0.5">
          {midCategories.map((cat, i) => (
            <FadeIn key={cat.label} delay={(i + 2) * 0.07} className="group">
              <Link href={cat.href} className="block no-underline">
                <div className="relative aspect-4/3 overflow-hidden min-h-55">
                  <Image
                    src={cat.image}
                    alt={cat.label}
                    fill
                    sizes="(max-width: 640px) 100vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <CardOverlay label={cat.label} description={cat.description} />
                </div>
              </Link>
            </FadeIn>
          ))}
        </div>

        {/* Row 3: Cold (1 col) + Drinks (2 cols wide) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-0.5 pb-16 lg:pb-20">
          {bottomCategories.map((cat, i) => (
            <FadeIn
              key={cat.label}
              delay={(i + 5) * 0.07}
              className={`${cat.colSpan} group ${cat.useHFull ? 'h-full' : ''}`}
            >
              <Link href={cat.href} className="block no-underline h-full">
                <div
                  className={`relative ${cat.aspectClass} overflow-hidden min-h-60 ${cat.useHFull ? 'h-full' : ''}`}
                >
                  <Image
                    src={cat.image}
                    alt={cat.label}
                    fill
                    sizes={
                      cat.colSpan === 'lg:col-span-2'
                        ? '(max-width: 1024px) 100vw, 66vw'
                        : '(max-width: 1024px) 100vw, 33vw'
                    }
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <CardOverlay label={cat.label} description={cat.description} />
                </div>
              </Link>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ── Stats banner — organic image backdrop ── */}
      <section className="relative py-24 lg:py-32 overflow-hidden min-h-80">
        <Image
          src="/images/retail/retail-organic.avif"
          alt=""
          fill
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-obsidian/80" />
        <div className="relative z-10 max-w-360 mx-auto px-5 sm:px-6 md:px-8 lg:px-12">
          <FadeIn className="text-center mb-14">
            <p className="text-xs uppercase tracking-[0.3em] text-gold/80 font-medium m-0">
              The Numbers
            </p>
          </FadeIn>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {stats.map((stat, i) => (
              <FadeIn key={stat.label} delay={i * 0.1} className="text-center">
                <p className="font-luxury text-4xl lg:text-5xl font-light text-gold m-0 mb-2">
                  {stat.value}
                </p>
                <p className="text-xs uppercase tracking-[0.2em] text-cream/60 font-medium m-0">
                  {stat.label}
                </p>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── Our Promises ── */}
      <section className="py-(--spacing-section-lg) bg-obsidian">
        <div className="max-w-360 mx-auto px-5 sm:px-6 md:px-8 lg:px-12">
          <FadeIn className="text-center mb-16">
            <p className="text-xs uppercase tracking-[0.3em] text-gold font-medium mb-3 m-0">
              Our Promise
            </p>
            <h2 className="font-luxury text-3xl lg:text-[44px] font-light text-cream tracking-tight m-0 max-w-xl mx-auto">
              Why Shop with Delicious Planet
            </h2>
          </FadeIn>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {promises.map((item, i) => (
              <FadeIn key={item.title} delay={i * 0.08}>
                <div className="flex flex-col h-full">
                  <div className="w-8 h-px bg-gold mb-6 shrink-0" />
                  <h3 className="font-luxury text-lg font-medium text-cream m-0 mb-3">
                    {item.title}
                  </h3>
                  {/* text-cream/60 — readable on obsidian, unlike text-stone */}
                  <p className="text-cream/60 text-sm leading-relaxed m-0">{item.description}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── Split feature: cold imagery + copy ── */}
      <section className="py-(--spacing-section-lg) bg-cream overflow-hidden">
        <div className="max-w-360 mx-auto px-5 sm:px-6 md:px-8 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <FadeIn direction="left">
              <div className="relative aspect-4/5 rounded-sm overflow-hidden">
                <Image
                  src="/images/retail/retail-cold.avif"
                  alt="Cold and chilled retail products"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-linear-to-t from-obsidian/50 to-transparent" />
                <div className="absolute bottom-6 left-6">
                  <p className="text-xs uppercase tracking-[0.2em] text-cream/70 font-medium m-0">
                    Cold &amp; Chilled
                  </p>
                </div>
              </div>
            </FadeIn>

            <FadeIn direction="right" delay={0.1}>
              <p className="text-xs uppercase tracking-[0.3em] text-gold font-medium mb-4 m-0">
                Freshness Guaranteed
              </p>
              <h2 className="font-luxury text-3xl lg:text-[44px] font-light text-obsidian leading-[1.15] tracking-[-0.03em] m-0 mb-6">
                Temperature-controlled from source to your door
              </h2>
              <p className="text-stone text-base lg:text-lg leading-relaxed m-0 mb-6">
                Our cold and chilled range is handled under strict temperature protocols at every
                stage of the supply chain. The same cold-chain standards that serve our professional
                kitchen clients apply here — no exceptions.
              </p>
              <p className="text-stone text-base leading-relaxed m-0 mb-8">
                From fresh dairy to chilled prepared ingredients, every product arrives in the
                condition it was packed — maintaining integrity from dispatch to delivery.
              </p>
              <MagneticButton>
                <Link
                  href="/products?category=cold"
                  className="inline-block bg-gold text-obsidian text-sm font-medium uppercase tracking-widest px-10 py-4 rounded-sm no-underline hover:bg-gold-light transition-colors"
                >
                  Shop Cold &amp; Chilled
                </Link>
              </MagneticButton>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ── Split feature: breads + copy (reversed) ── */}
      <section className="py-(--spacing-section-lg) bg-parchment overflow-hidden">
        <div className="max-w-360 mx-auto px-5 sm:px-6 md:px-8 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <FadeIn direction="left" delay={0.1} className="order-2 lg:order-1">
              <p className="text-xs uppercase tracking-[0.3em] text-gold font-medium mb-4 m-0">
                Artisan Craft
              </p>
              <h2 className="font-luxury text-3xl lg:text-[44px] font-light text-obsidian leading-[1.15] tracking-[-0.03em] m-0 mb-6">
                Baked with tradition, delivered with precision
              </h2>
              <p className="text-stone text-base lg:text-lg leading-relaxed m-0 mb-6">
                Our artisan bread range is sourced from producers who have refined their craft over
                generations. Stone-baked sourdoughs, rye loaves, and specialty flatbreads from
                bakeries across Europe.
              </p>
              <p className="text-stone text-base leading-relaxed m-0 mb-8">
                No preservatives. No compromises. Just the kind of bread that makes the rest of the
                meal better.
              </p>
              <MagneticButton>
                <Link
                  href="/products?category=breads"
                  className="inline-block bg-gold text-obsidian text-sm font-medium uppercase tracking-widest px-10 py-4 rounded-sm no-underline hover:bg-gold-light transition-colors"
                >
                  Shop Artisan Breads
                </Link>
              </MagneticButton>
            </FadeIn>

            <FadeIn direction="right" className="order-1 lg:order-2">
              <div className="relative aspect-4/5 rounded-sm overflow-hidden">
                <Image
                  src="/images/retail/retail-breads.avif"
                  alt="Artisan breads selection"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-linear-to-t from-obsidian/50 to-transparent" />
                <div className="absolute bottom-6 left-6">
                  <p className="text-xs uppercase tracking-[0.2em] text-cream/70 font-medium m-0">
                    Artisan Breads
                  </p>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ── CTA — grocery backdrop ── */}
      <section className="relative py-(--spacing-section-lg) overflow-hidden min-h-120 flex items-center">
        <Image
          src="/images/retail/retail-grocery.avif"
          alt=""
          fill
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-br from-obsidian/88 via-obsidian/75 to-obsidian/88" />
        <div className="relative z-10 w-full max-w-360 mx-auto px-5 sm:px-6 md:px-8 lg:px-12 text-center">
          <FadeIn>
            <span className="inline-block w-8 h-px bg-gold mb-8" />
          </FadeIn>
          <FadeIn delay={0.1}>
            <p className="text-xs uppercase tracking-[0.3em] text-gold/80 font-medium mb-4 m-0">
              Start Shopping
            </p>
          </FadeIn>
          <FadeIn delay={0.2}>
            <h2 className="font-luxury text-3xl lg:text-[52px] font-light text-cream tracking-tight m-0 mb-6 max-w-3xl mx-auto leading-[1.1]">
              Bring professional-grade ingredients into your kitchen
            </h2>
          </FadeIn>
          <FadeIn delay={0.3}>
            <p className="font-luxury italic text-cream/50 text-base lg:text-lg font-light m-0 mb-10 max-w-xl mx-auto">
              Explore the full retail range — seven categories, hundreds of products, one
              uncompromising standard.
            </p>
          </FadeIn>
          <FadeIn delay={0.4}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <MagneticButton>
                <Link
                  href="/products"
                  className="inline-block bg-gold text-obsidian text-sm font-medium uppercase tracking-widest px-10 py-4 rounded-sm no-underline hover:bg-gold-light transition-colors"
                >
                  Shop All Products
                </Link>
              </MagneticButton>
              <Link
                href="/categories"
                className="inline-block border border-cream/40 text-cream text-sm font-medium uppercase tracking-widest px-10 py-4 rounded-sm no-underline hover:border-gold hover:text-gold transition-colors"
              >
                All Categories
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>
    </>
  )
}
