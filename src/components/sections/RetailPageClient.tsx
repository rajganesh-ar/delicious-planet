'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { FadeIn } from '@/components/animations/FadeIn'
import { MagneticButton } from '@/components/animations/MagneticButton'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

/* ─── Data ──────────────────────────────────────────── */

const heroStats = [
  { value: '7+', label: 'Store Formats' },
  { value: 'ME & Africa', label: 'Distribution Focus' },
  { value: '6', label: 'Product Categories' },
  { value: 'Multi-Year', label: 'Supply Terms' },
]

const storeFormats = [
  {
    title: 'Specialty Food Stores',
    desc: 'Curated retail environments focused on natural, artisan, and origin-specific products with discerning customer bases seeking premium quality.',
  },
  {
    title: 'Gourmet Retailers',
    desc: 'High-end food destinations maintaining carefully selected assortments aligned with premium product positioning and provenance clarity.',
  },
  {
    title: 'Organic Product Shops',
    desc: 'Retail formats prioritizing natural, minimally processed products with transparent sourcing and clean ingredient profiles.',
  },
  {
    title: 'Delicatessens',
    desc: 'Specialist food retailers requiring consistent access to imported and specialty food products with reliable replenishment cycles.',
  },
  {
    title: 'Health-Focused Retail',
    desc: 'Environments serving health-conscious consumers seeking natural ingredients, functional foods, and products with verified origin clarity.',
  },
  {
    title: 'Premium Supermarket Formats',
    desc: 'Larger retail operations maintaining premium food aisles or specialty sections requiring structured supply continuity and volume reliability.',
  },
  {
    title: 'Regional Distributors',
    desc: 'Distribution intermediaries supplying retail networks across Middle East and Africa markets seeking consolidated product access.',
  },
]

const retailCategories = [
  { name: 'Honey & Hive-Derived Products', status: 'active' },
  { name: 'Olive Oil & Botanical Oils', status: 'active' },
  { name: 'Dried Fruits & Natural Sweeteners', status: 'active' },
  { name: 'Plant Extracts & Specialty Ingredients', status: 'active' },
  { name: 'Premium Pantry Products', status: 'active' },
  { name: 'Imported Natural Food Products', status: 'active' },
]

const supplyStructureItems = [
  {
    title: 'Store Scale & Category Focus',
    desc: 'Supply frameworks calibrated to store size, product range, and category concentration within each retail environment.',
  },
  {
    title: 'Inventory Turnover Alignment',
    desc: 'Replenishment cycles structured around typical sales velocity patterns across specialty food retail segments.',
  },
  {
    title: 'Regional Logistics Fit',
    desc: 'Distribution routing optimised for delivery efficiency across Middle East and Africa retail coverage areas.',
  },
  {
    title: 'Product Handling Requirements',
    desc: 'Supply coordination accounts for temperature sensitivity, shelf-life targets, and storage infrastructure considerations.',
  },
  {
    title: 'Controlled Inventory Risk',
    desc: 'Structured order frameworks designed to maintain product availability without creating excessive inventory exposure.',
  },
]

const volumeConsiderations = [
  'Minimum order thresholds calibrated for logistics efficiency',
  'Replenishment frequency coordination aligned with store cycles',
  'Mixed product category orders within unified supply structures',
  'Scalable volume capacity as retail demand evolves over time',
]

const presentationFactors = [
  'Visual clarity on shelf across premium retail environments',
  'Transport stability protecting product integrity in transit',
  'Handling efficiency compatible with retail receiving processes',
  'Clear product identification supporting customer navigation',
  'Consistent category grouping aligned with retail assortment logic',
]

const distributionConsiderations = [
  {
    title: 'Delivery Route Efficiency',
    desc: 'Logistics networks structured for reliable delivery across Middle East and Africa retail markets.',
  },
  {
    title: 'Product Stability in Transit',
    desc: 'Temperature and handling controls maintained throughout distribution pathways to retail destinations.',
  },
  {
    title: 'Customs Handling Readiness',
    desc: 'Export documentation and customs coordination managed for seamless cross-border supply continuity.',
  },
  {
    title: 'Supply Continuity Across Geography',
    desc: 'Distribution frameworks designed to maintain consistent availability across dispersed retail coverage areas.',
  },
  {
    title: 'Logistics Timing Consistency',
    desc: 'Delivery scheduling coordinated with retail inventory cycles to support predictable replenishment.',
  },
]

const privateLabelCapabilities = [
  {
    title: 'Category Identification',
    desc: 'Product categories matched to retail brand positioning and customer demand profiles.',
  },
  {
    title: 'Packaging Specification',
    desc: 'Controlled format development aligned with retail display environments and brand identity.',
  },
  {
    title: 'Production Coordination',
    desc: 'Manufacturing partnerships managed to maintain stable and consistent product output.',
  },
  {
    title: 'Supply Scalability',
    desc: 'Volume-ready production infrastructure supporting gradual range expansion.',
  },
  {
    title: 'Product Consistency',
    desc: 'Characteristic maintenance across supply cycles protecting shelf presence and customer trust.',
  },
]

const onboardingSteps = [
  {
    num: '01',
    title: 'Initial Partnership Inquiry',
    desc: 'Retailers and distributors submit a partnership inquiry including store profile, product category interest, and regional location for initial assessment.',
  },
  {
    num: '02',
    title: 'Store Profile Review',
    desc: 'Our team reviews the retail environment, store format, category focus, and distribution structure to assess supply alignment feasibility.',
  },
  {
    num: '03',
    title: 'Product Category Alignment',
    desc: 'Identification of appropriate product categories, assortment structure, and specification requirements relevant to the retail environment.',
  },
  {
    num: '04',
    title: 'Order Structure Discussion',
    desc: 'Coordination of minimum order thresholds, replenishment frequency, and mixed category ordering frameworks suited to store scale.',
  },
  {
    num: '05',
    title: 'Logistics Coordination',
    desc: 'Confirmation of delivery routes, customs requirements, product handling considerations, and supply timing expectations.',
  },
  {
    num: '06',
    title: 'Trial Order Execution',
    desc: 'Controlled initial supply run validating product presentation, delivery reliability, and end-to-end supply performance.',
  },
  {
    num: '07',
    title: 'Ongoing Supply Activation',
    desc: 'Full integration into structured replenishment cycles with defined ordering cadence and continuous supply coordination.',
  },
]

const partnerProfileItems = [
  {
    label: 'Structured Product Selection',
    desc: 'Stores maintaining curated assortment strategies and quality-driven purchasing criteria.',
  },
  {
    label: 'Consistency-Focused Retail',
    desc: 'Environments prioritising product reliability, repeat availability, and consistent customer experience.',
  },
  {
    label: 'Stable Supply Relationships',
    desc: 'Businesses seeking long-term procurement partnerships over short-term transactional arrangements.',
  },
  {
    label: 'Origin-Transparent Categories',
    desc: 'Retailers focused on products with clear provenance and traceable sourcing characteristics.',
  },
]

/* ─── Reusable: Parallax Image ──────────────────────── */

function useParallax(amount = 30) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const imgRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        imgRef.current,
        { y: -amount },
        {
          y: amount,
          ease: 'none',
          scrollTrigger: {
            trigger: wrapRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        },
      )
    }, wrapRef)
    return () => ctx.revert()
  }, [amount])

  return { wrapRef, imgRef }
}

/* ─── Reusable: Gold Divider ────────────────────────── */

function GoldDivider() {
  return (
    <div className="max-w-[1440px] mx-auto px-6 lg:px-16">
      <div className="h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
    </div>
  )
}

/* ═══════════════════════════════════════════════════════
   1. HERO
   ═══════════════════════════════════════════════════════ */

function Hero() {
  const containerRef = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        overlayRef.current,
        { opacity: 0.5 },
        {
          opacity: 0.82,
          ease: 'none',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: true,
          },
        },
      )
    }, containerRef)
    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={containerRef}
      className="relative min-h-[100svh] flex items-center overflow-hidden"
    >
      <div className="absolute inset-0">
        <Image
          src="/images/retail/retail-store.avif"
          alt="Premium retail food environment"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div ref={overlayRef} className="absolute inset-0 bg-obsidian/50" />
        <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-transparent to-obsidian/30" />
      </div>

      <div className="relative z-10 w-full max-w-[1440px] mx-auto px-6 lg:px-16 pt-32 pb-20">
        <div className="max-w-2xl">
          <FadeIn>
            <p className="text-xs uppercase tracking-[0.3em] text-gold font-heading font-medium mb-6">
              Retail Partnership
            </p>
          </FadeIn>
          <FadeIn delay={0.1}>
            <h1 className="font-luxury text-4xl sm:text-5xl lg:text-[68px] font-light text-cream leading-[1.06] tracking-tight mb-7">
              Structured Retail Supply
              <br />
              <span className="text-gold/90">for Premium Food Environments</span>
            </h1>
          </FadeIn>
          <FadeIn delay={0.18}>
            <p className="text-cream/60 text-lg lg:text-xl font-light leading-relaxed mb-5 max-w-xl">
              Delicious Planet collaborates with specialty food stores, gourmet retailers, and
              regional distributors seeking consistent access to high-quality natural products
              across Middle East and Africa markets.
            </p>
          </FadeIn>
          <FadeIn delay={0.22}>
            <p className="text-cream/40 text-sm leading-relaxed mb-10 max-w-lg">
              Our retail partnership framework supports stable product availability, reliable
              replenishment cycles, and premium-positioned product categories aligned with curated
              retail assortments.
            </p>
          </FadeIn>
          <FadeIn delay={0.3}>
            <div className="flex flex-wrap gap-4">
              <MagneticButton>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 text-sm font-heading font-medium uppercase tracking-widest px-8 py-4 rounded-sm no-underline bg-gold text-obsidian hover:bg-gold-light transition-colors duration-300"
                >
                  Submit Partnership Inquiry
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                    />
                  </svg>
                </Link>
              </MagneticButton>
              <MagneticButton>
                <Link
                  href="/sourcing"
                  className="inline-flex items-center gap-2 text-sm font-heading font-medium uppercase tracking-widest px-8 py-4 rounded-sm no-underline text-cream border border-cream/20 hover:border-cream/40 transition-colors duration-300"
                >
                  Our Sourcing Framework
                </Link>
              </MagneticButton>
            </div>
          </FadeIn>
        </div>

        <FadeIn delay={0.4}>
          <div className="mt-20 pt-8 border-t border-cream/10">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-16">
              {heroStats.map((s) => (
                <div key={s.label}>
                  <span className="block font-luxury text-3xl lg:text-5xl font-light text-gold mb-1.5">
                    {s.value}
                  </span>
                  <span className="text-cream/40 text-xs uppercase tracking-[0.2em] font-heading">
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════════
   2. RETAIL COLLABORATION SCOPE — Content + Image
   ═══════════════════════════════════════════════════════ */

function RetailCollaborationScope() {
  const { wrapRef, imgRef } = useParallax(40)

  return (
    <section className="bg-obsidian">
      <GoldDivider />
      <div className="flex flex-col lg:flex-row min-h-[80vh]">
        {/* Content — left */}
        <div className="lg:w-[50%] flex items-start px-6 lg:pl-16 lg:pr-12 py-16 lg:py-24">
          <div className="w-full max-w-lg">
            <FadeIn>
              <p className="text-xs uppercase tracking-[0.3em] text-gold font-heading font-medium mb-4">
                Retail Collaboration Scope
              </p>
            </FadeIn>
            <FadeIn delay={0.05}>
              <h2 className="font-luxury text-3xl lg:text-[38px] font-light text-cream leading-[1.15] tracking-tight mb-6">
                Who We Supply
              </h2>
            </FadeIn>
            <FadeIn delay={0.1}>
              <p className="text-cream/50 text-base leading-relaxed mb-5">
                Our retail supply structure supports a range of store formats operating within
                natural, specialty, and premium food segments. Product selection is designed to
                complement curated retail assortments where origin transparency and product
                consistency are important purchasing considerations.
              </p>
            </FadeIn>
            <FadeIn delay={0.15}>
              <p className="text-cream/35 text-sm leading-relaxed mb-8">
                Retail partners benefit from structured access to stable product categories
                supported by coordinated procurement systems built for reliable replenishment and
                consistent shelf presence.
              </p>
            </FadeIn>
            <div className="space-y-0">
              {storeFormats.map((format, i) => (
                <FadeIn key={format.title} delay={0.18 + i * 0.04}>
                  <div className="group flex gap-5 items-start py-5 border-b border-cream/[0.06] last:border-b-0">
                    <div className="w-9 h-9 rounded-full border border-gold/20 flex items-center justify-center shrink-0 mt-0.5 group-hover:border-gold/40 transition-colors duration-500">
                      <span className="text-gold/50 text-[10px] font-heading font-bold group-hover:text-gold/80 transition-colors duration-500">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-heading text-sm font-semibold text-cream/90 mb-1.5 tracking-tight">
                        {format.title}
                      </h3>
                      <p className="text-cream/40 text-sm leading-relaxed m-0">{format.desc}</p>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </div>

        {/* Image — right */}
        <div ref={wrapRef} className="relative lg:w-[50%] min-h-[400px] lg:min-h-0 overflow-hidden">
          <div ref={imgRef} className="absolute inset-[-40px]">
            <Image
              src="/images/retail/retail-supermarket-a.avif"
              alt="Premium specialty food retail environment"
              fill
              sizes="50vw"
              className="object-cover"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-obsidian/50 hidden lg:block" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-obsidian/60 lg:hidden" />
        </div>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════════
   3. PRODUCT PORTFOLIO ACCESS
   ═══════════════════════════════════════════════════════ */

function ProductPortfolioAccess() {
  return (
    <section className="bg-obsidian py-(--spacing-section-lg) border-t border-cream/[0.06]">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-16">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-24">
          <div className="lg:w-[380px] shrink-0">
            <FadeIn>
              <p className="text-xs uppercase tracking-[0.3em] text-gold font-heading font-medium mb-4">
                Product Portfolio
              </p>
            </FadeIn>
            <FadeIn delay={0.05}>
              <h2 className="font-luxury text-3xl lg:text-[40px] font-light text-cream leading-[1.15] tracking-tight mb-5">
                Retail Product
                <br />
                Categories
              </h2>
            </FadeIn>
            <FadeIn delay={0.1}>
              <p className="text-cream/45 text-base leading-relaxed mb-4">
                Retail partners gain access to multiple product categories through a unified supply
                structure, curated for consistent quality characteristics and origin transparency
                across every replenishment cycle.
              </p>
            </FadeIn>
            <FadeIn delay={0.15}>
              <p className="text-cream/30 text-sm leading-relaxed">
                Category availability may vary depending on regional logistics alignment and product
                handling requirements. All categories are maintained to consistent shelf
                presentation standards.
              </p>
            </FadeIn>
          </div>

          <div className="flex-1">
            <div className="space-y-0">
              {retailCategories.map((cat, i) => (
                <FadeIn key={cat.name} delay={i * 0.04}>
                  <div className="flex items-center justify-between py-5 border-b border-cream/[0.06] last:border-b-0 group">
                    <div className="flex items-center gap-4">
                      <span className="w-2 h-2 rounded-full bg-gold/25 group-hover:bg-gold/50 transition-colors duration-500 shrink-0" />
                      <span className="text-cream/70 text-base font-medium group-hover:text-cream transition-colors duration-300">
                        {cat.name}
                      </span>
                    </div>
                    {cat.status === 'active' ? (
                      <span className="text-[10px] uppercase tracking-wider text-gold/70 font-heading font-semibold bg-gold/[0.08] px-3 py-1.5 rounded-full border border-gold/10">
                        Available
                      </span>
                    ) : (
                      <span className="text-[10px] uppercase tracking-wider text-cream/30 font-heading font-semibold bg-cream/[0.03] px-3 py-1.5 rounded-full border border-cream/[0.06]">
                        Expanding
                      </span>
                    )}
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════════
   4. SUPPLY STRUCTURE — Five-Card Grid
   ═══════════════════════════════════════════════════════ */

function SupplyStructure() {
  return (
    <section className="bg-obsidian py-(--spacing-section-lg) border-t border-cream/[0.06]">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-16">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-24 mb-16 lg:mb-20">
          <div className="lg:w-1/2">
            <FadeIn>
              <p className="text-xs uppercase tracking-[0.3em] text-gold font-heading font-medium mb-4">
                Supply Structure
              </p>
            </FadeIn>
            <FadeIn delay={0.05}>
              <h2 className="font-luxury text-3xl lg:text-[44px] font-light text-cream leading-[1.12] tracking-tight mb-0">
                Calibrated for
                <br />
                Each Retailer
              </h2>
            </FadeIn>
          </div>
          <div className="lg:w-1/2 lg:pt-10">
            <FadeIn delay={0.1}>
              <p className="text-cream/50 text-base lg:text-lg leading-relaxed m-0">
                Retail partnerships operate within structured supply frameworks designed to support
                consistent replenishment cycles and controlled inventory flow. Supply structures are
                calibrated to each partner's operational reality — accounting for store scale,
                product handling requirements, and regional logistics considerations.
              </p>
            </FadeIn>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">
          {supplyStructureItems.map((item, i) => (
            <FadeIn key={item.title} delay={i * 0.06}>
              <motion.div
                className="group relative border border-cream/[0.06] rounded-sm bg-obsidian h-full hover:border-gold/25 transition-colors duration-500 overflow-hidden"
                whileHover={{ y: -4 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="h-px w-0 group-hover:w-full bg-gold/40 transition-all duration-700 ease-out" />
                <div className="p-6 lg:p-7">
                  <div className="w-10 h-10 rounded-full border border-gold/15 flex items-center justify-center mb-5 group-hover:border-gold/30 transition-colors duration-500">
                    <span className="text-gold/50 text-xs font-heading font-bold group-hover:text-gold/80 transition-colors duration-500">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                  </div>
                  <h3 className="font-heading text-sm font-semibold text-cream/90 mb-2 tracking-tight">
                    {item.title}
                  </h3>
                  <p className="text-cream/38 text-sm leading-relaxed m-0">{item.desc}</p>
                </div>
              </motion.div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════════
   5. ORDER VOLUME FRAMEWORK — Image + Content
   ═══════════════════════════════════════════════════════ */

function OrderVolumeFramework() {
  const { wrapRef, imgRef } = useParallax(35)

  return (
    <section className="bg-obsidian">
      <GoldDivider />
      <div className="flex flex-col lg:flex-row min-h-[65vh]">
        {/* Image — left */}
        <div ref={wrapRef} className="relative lg:w-[55%] min-h-[400px] lg:min-h-0 overflow-hidden">
          <div ref={imgRef} className="absolute inset-[-35px]">
            <Image
              src="/images/retail/retail-warehouse.avif"
              alt="Retail warehouse — order and volume framework"
              fill
              sizes="55vw"
              className="object-cover"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-obsidian/50 hidden lg:block" />
          <div className="absolute inset-0 bg-gradient-to-t from-obsidian/60 via-transparent to-transparent lg:hidden" />
        </div>

        {/* Content — right */}
        <div className="lg:w-[45%] flex items-center px-6 lg:pl-16 lg:pr-16 py-16 lg:py-24">
          <div className="max-w-md">
            <FadeIn>
              <p className="text-xs uppercase tracking-[0.3em] text-gold font-heading font-medium mb-4">
                Order Volume Framework
              </p>
            </FadeIn>
            <FadeIn delay={0.05}>
              <h2 className="font-luxury text-3xl lg:text-[38px] font-light text-cream leading-[1.15] tracking-tight mb-6">
                Flexible Volume
                <br />
                Structures
              </h2>
            </FadeIn>
            <FadeIn delay={0.1}>
              <p className="text-cream/50 text-base leading-relaxed mb-5">
                Retail partnerships may operate across varying order volume tiers depending on store
                scale and distribution structure. Flexible volume frameworks allow gradual expansion
                of product assortment as retail demand evolves — maintaining cost efficiency without
                restricting growth potential.
              </p>
            </FadeIn>
            <FadeIn delay={0.15}>
              <p className="text-cream/35 text-sm leading-relaxed mb-8">
                Structured order frameworks help maintain supply continuity across replenishment
                cycles, supporting predictable inventory planning for retail operations of all
                sizes.
              </p>
            </FadeIn>
            <FadeIn delay={0.2}>
              <div className="border border-cream/[0.06] rounded-sm p-6 bg-cream/[0.015]">
                <p className="text-[10px] uppercase tracking-[0.25em] text-cream/30 font-heading font-semibold mb-4">
                  Volume Alignment Considerations
                </p>
                <ul className="space-y-3 list-none m-0 p-0">
                  {volumeConsiderations.map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-gold/30 mt-[7px] shrink-0" />
                      <span className="text-cream/50 text-sm leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </FadeIn>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════════
   6. PRODUCT PRESENTATION ALIGNMENT — Content + Image
   ═══════════════════════════════════════════════════════ */

function ProductPresentationAlignment() {
  const { wrapRef, imgRef } = useParallax(35)

  return (
    <section className="bg-obsidian">
      <GoldDivider />
      <div className="flex flex-col-reverse lg:flex-row min-h-[65vh]">
        {/* Content — left */}
        <div className="lg:w-[45%] flex items-center px-6 lg:pl-16 lg:pr-12 py-16 lg:py-24">
          <div className="max-w-md">
            <FadeIn>
              <p className="text-xs uppercase tracking-[0.3em] text-gold font-heading font-medium mb-4">
                Product Presentation
              </p>
            </FadeIn>
            <FadeIn delay={0.05}>
              <h2 className="font-luxury text-3xl lg:text-[38px] font-light text-cream leading-[1.15] tracking-tight mb-6">
                Shelf-Ready
                <br />
                by Design
              </h2>
            </FadeIn>
            <FadeIn delay={0.1}>
              <p className="text-cream/50 text-base leading-relaxed mb-5">
                Retail product success depends on presentation clarity and shelf consistency. Our
                product packaging and category structure are aligned with premium retail display
                environments — ensuring products are immediately presentable upon delivery without
                requiring additional preparation.
              </p>
            </FadeIn>
            <FadeIn delay={0.15}>
              <p className="text-cream/35 text-sm leading-relaxed mb-8">
                Where applicable, retail partners may receive guidance regarding product grouping
                and category presentation alignment, supporting consistent discoverability and
                premium positioning on shelf.
              </p>
            </FadeIn>
            <div className="space-y-4">
              {presentationFactors.map((factor, i) => (
                <FadeIn key={factor} delay={0.2 + i * 0.03}>
                  <div className="group flex items-start gap-3.5">
                    <div className="w-7 h-7 rounded-full border border-gold/15 flex items-center justify-center shrink-0 mt-0.5 group-hover:border-gold/30 transition-colors duration-500">
                      <svg
                        className="w-3 h-3 text-gold/40 group-hover:text-gold/70 transition-colors duration-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M4.5 12.75l6 6 9-13.5"
                        />
                      </svg>
                    </div>
                    <span className="text-cream/50 text-sm leading-relaxed">{factor}</span>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </div>

        {/* Image — right */}
        <div ref={wrapRef} className="relative lg:w-[55%] min-h-[400px] lg:min-h-0 overflow-hidden">
          <div ref={imgRef} className="absolute inset-[-35px]">
            <Image
              src="/images/retail/retail-stand-b.avif"
              alt="Retail product display — presentation alignment"
              fill
              sizes="55vw"
              className="object-cover"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-obsidian/50 hidden lg:block" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-obsidian/60 lg:hidden" />
        </div>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════════
   7. REGIONAL DISTRIBUTION COORDINATION — Two Column
   ═══════════════════════════════════════════════════════ */

function RegionalDistributionCoordination() {
  return (
    <section className="bg-obsidian py-(--spacing-section-lg) border-t border-cream/[0.06]">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-16">
        <div className="flex flex-col lg:flex-row gap-16 lg:gap-24">
          <div className="flex-1">
            <FadeIn>
              <p className="text-xs uppercase tracking-[0.3em] text-gold font-heading font-medium mb-4">
                Regional Distribution
              </p>
            </FadeIn>
            <FadeIn delay={0.05}>
              <h2 className="font-luxury text-3xl lg:text-[40px] font-light text-cream leading-[1.15] tracking-tight mb-5">
                Coordinated Across
                <br />
                the Region
              </h2>
            </FadeIn>
            <FadeIn delay={0.1}>
              <p className="text-cream/45 text-base leading-relaxed mb-10">
                Retail partnerships are supported through coordinated logistics structures aligned
                with regional delivery networks across Middle East and Africa. Distribution
                coordination aims to maintain stable product availability with consistent delivery
                timing aligned to retail inventory cycles.
              </p>
            </FadeIn>

            <div className="space-y-6">
              {distributionConsiderations.map((item, i) => (
                <FadeIn key={item.title} delay={0.12 + i * 0.04}>
                  <div className="group border-l-2 border-gold/15 pl-6 py-1 hover:border-gold/40 transition-colors duration-500">
                    <h3 className="font-heading text-sm font-semibold text-cream/90 mb-1.5 tracking-wide">
                      {item.title}
                    </h3>
                    <p className="text-cream/38 text-sm leading-relaxed m-0">{item.desc}</p>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>

          <div className="lg:w-[420px] shrink-0">
            <FadeIn>
              <p className="text-xs uppercase tracking-[0.3em] text-gold font-heading font-medium mb-4">
                Regional Coverage
              </p>
            </FadeIn>
            <FadeIn delay={0.05}>
              <h2 className="font-luxury text-3xl lg:text-[32px] font-light text-cream leading-[1.15] tracking-tight mb-5">
                Primary Coverage
                <br />
                Markets
              </h2>
            </FadeIn>
            <FadeIn delay={0.1}>
              <p className="text-cream/45 text-sm leading-relaxed mb-8">
                Retail partnerships are primarily structured to support distribution across
                established regional markets, with availability expanding as logistics networks
                evolve and product category capacity increases.
              </p>
            </FadeIn>
            <FadeIn delay={0.15}>
              <div className="border border-cream/[0.06] rounded-sm p-7 lg:p-8 bg-cream/[0.015]">
                <p className="text-[10px] uppercase tracking-[0.25em] text-cream/30 font-heading font-semibold mb-5">
                  Active Distribution Regions
                </p>
                <ul className="space-y-4 list-none m-0 p-0">
                  {[
                    { region: 'Middle East Markets', note: 'GCC and Levant distribution coverage' },
                    {
                      region: 'North Africa Markets',
                      note: 'Established logistics and trade routes',
                    },
                    {
                      region: 'Selected African Markets',
                      note: 'Expanding coverage across key territories',
                    },
                  ].map((item) => (
                    <li key={item.region} className="flex items-start gap-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-gold/30 mt-[7px] shrink-0" />
                      <div>
                        <p className="text-cream/70 text-sm font-heading font-semibold m-0 mb-0.5">
                          {item.region}
                        </p>
                        <p className="text-cream/30 text-xs leading-relaxed m-0">{item.note}</p>
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="mt-6 pt-6 border-t border-cream/[0.06]">
                  <p className="text-cream/30 text-xs leading-relaxed m-0">
                    Regional focus allows optimisation of supply continuity and distribution
                    efficiency across established retail networks. Coverage expands alongside
                    logistics infrastructure development.
                  </p>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════════
   8. PRIVATE LABEL RETAIL — Five-Card Grid
   ═══════════════════════════════════════════════════════ */

function PrivateLabelRetail() {
  return (
    <section className="bg-obsidian py-(--spacing-section-lg) border-t border-cream/[0.06]">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-16">
        <div className="max-w-2xl mb-14 lg:mb-20">
          <FadeIn>
            <p className="text-xs uppercase tracking-[0.3em] text-gold font-heading font-medium mb-4">
              Private Label Retail
            </p>
          </FadeIn>
          <FadeIn delay={0.05}>
            <h2 className="font-luxury text-3xl lg:text-[44px] font-light text-cream leading-[1.12] tracking-tight mb-5">
              Proprietary Retail
              <br />
              Offerings
            </h2>
          </FadeIn>
          <FadeIn delay={0.1}>
            <p className="text-cream/45 text-base lg:text-lg leading-relaxed m-0">
              Retail partners seeking proprietary product offerings may explore private label
              development opportunities supported by our sourcing network. Private label retail
              products allow stores to develop differentiated offerings aligned with their brand
              identity while maintaining stable sourcing continuity and consistent product
              characteristics.
            </p>
          </FadeIn>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">
          {privateLabelCapabilities.map((cap, i) => (
            <FadeIn key={cap.title} delay={i * 0.06}>
              <motion.div
                className="group relative border border-cream/[0.06] rounded-sm bg-obsidian h-full hover:border-gold/25 transition-colors duration-500 overflow-hidden"
                whileHover={{ y: -4 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="h-px w-0 group-hover:w-full bg-gold/40 transition-all duration-700 ease-out" />
                <div className="p-6 lg:p-7">
                  <div className="w-10 h-10 rounded-full border border-gold/15 flex items-center justify-center mb-5 group-hover:border-gold/30 transition-colors duration-500">
                    <svg
                      className="w-4 h-4 text-gold/40 group-hover:text-gold/70 transition-colors duration-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z"
                      />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
                    </svg>
                  </div>
                  <h3 className="font-heading text-sm font-semibold text-cream/90 mb-2 tracking-tight">
                    {cap.title}
                  </h3>
                  <p className="text-cream/38 text-sm leading-relaxed m-0">{cap.desc}</p>
                </div>
              </motion.div>
            </FadeIn>
          ))}
        </div>

        <FadeIn delay={0.35}>
          <p className="text-cream/30 text-sm leading-relaxed mt-10 max-w-2xl">
            Private label feasibility varies according to category requirements and production
            capability alignment. Interested retail partners are invited to discuss private label
            opportunities as part of the partnership inquiry process.
          </p>
        </FadeIn>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════════
   9. ONBOARDING PATHWAY — Numbered List
   ═══════════════════════════════════════════════════════ */

function OnboardingPathway() {
  return (
    <section className="bg-obsidian py-(--spacing-section-lg) border-t border-cream/[0.06]">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-16">
        <div className="text-center max-w-2xl mx-auto mb-16 lg:mb-24">
          <FadeIn>
            <p className="text-xs uppercase tracking-[0.3em] text-gold font-heading font-medium mb-4">
              Partnership Onboarding
            </p>
          </FadeIn>
          <FadeIn delay={0.05}>
            <h2 className="font-luxury text-3xl lg:text-[44px] font-light text-cream leading-[1.12] tracking-tight mb-5">
              From Inquiry
              <br />
              to Supply Activation
            </h2>
          </FadeIn>
          <FadeIn delay={0.1}>
            <p className="text-cream/45 text-base lg:text-lg leading-relaxed">
              Retail partnership initiation follows structured coordination stages designed to
              ensure supply alignment before full integration into retail inventory cycles.
              Onboarding timelines vary depending on geographic location, category scope, and
              logistics configuration.
            </p>
          </FadeIn>
        </div>

        <div className="space-y-0">
          {onboardingSteps.map((step, i) => (
            <FadeIn key={step.num} delay={i * 0.04}>
              <div className="group grid grid-cols-1 lg:grid-cols-12 gap-6 py-8 lg:py-10 border-b border-cream/[0.06] last:border-b-0 items-start">
                <div className="lg:col-span-2">
                  <span className="font-luxury text-5xl lg:text-7xl font-light text-gold/12 leading-none group-hover:text-gold/22 transition-colors duration-600">
                    {step.num}
                  </span>
                </div>
                <div className="lg:col-span-3 lg:pt-3">
                  <h3 className="font-heading text-lg font-semibold text-cream tracking-tight m-0">
                    {step.title}
                  </h3>
                </div>
                <div className="lg:col-span-7 lg:pt-3">
                  <p className="text-cream/40 text-sm lg:text-base leading-relaxed m-0">
                    {step.desc}
                  </p>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>

        <FadeIn delay={0.3}>
          <p className="text-cream/25 text-xs leading-relaxed mt-8 max-w-xl">
            Structured onboarding ensures supply alignment prior to full integration into retail
            inventory cycles. For general inquiries, please visit our{' '}
            <Link
              href="/contact"
              className="text-gold/40 hover:text-gold/70 underline underline-offset-2 transition-colors"
            >
              contact page
            </Link>
            .
          </p>
        </FadeIn>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════════
   10. PARTNERSHIP CONTINUITY — Image + Content
   ═══════════════════════════════════════════════════════ */

function PartnershipContinuity() {
  const { wrapRef, imgRef } = useParallax(30)

  return (
    <section className="bg-obsidian">
      <GoldDivider />
      <div className="flex flex-col lg:flex-row min-h-[65vh]">
        {/* Image — left */}
        <div ref={wrapRef} className="relative lg:w-[50%] min-h-[400px] lg:min-h-0 overflow-hidden">
          <div ref={imgRef} className="absolute inset-[-30px]">
            <Image
              src="/images/retail/retail-supermarket-b.avif"
              alt="Long-term retail partnership continuity"
              fill
              sizes="50vw"
              className="object-cover"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-obsidian/50 hidden lg:block" />
          <div className="absolute inset-0 bg-gradient-to-t from-obsidian/60 via-transparent to-transparent lg:hidden" />
        </div>

        {/* Content — right */}
        <div className="lg:w-[50%] flex items-center px-6 lg:pl-16 lg:pr-16 py-16 lg:py-24">
          <div className="max-w-md">
            <FadeIn>
              <p className="text-xs uppercase tracking-[0.3em] text-gold font-heading font-medium mb-4">
                Partnership Continuity
              </p>
            </FadeIn>
            <FadeIn delay={0.05}>
              <h2 className="font-luxury text-3xl lg:text-[38px] font-light text-cream leading-[1.15] tracking-tight mb-6">
                Built for Long-Term
                <br />
                Supply Alignment
              </h2>
            </FadeIn>
            <FadeIn delay={0.1}>
              <p className="text-cream/50 text-base leading-relaxed mb-5">
                Retail partnerships are structured with long-term supply continuity in mind. Stable
                collaboration enables consistent product availability, predictable inventory
                planning, and coordinated expansion of product categories where appropriate —
                creating a foundation for sustained retail performance.
              </p>
            </FadeIn>
            <FadeIn delay={0.15}>
              <p className="text-cream/35 text-sm leading-relaxed mb-8">
                Continuity-based relationships allow refinement of product assortment and improved
                forecasting alignment over time. Predictable supply relationships directly
                contribute to consistency in product availability for end customers.
              </p>
            </FadeIn>
            <FadeIn delay={0.2}>
              <blockquote className="border-l-2 border-gold/20 pl-5 py-2">
                <p className="text-cream/55 text-sm italic leading-relaxed mb-0">
                  &ldquo;Premium retail environments require stable product availability and
                  predictable replenishment cycles. Our supply framework is designed to support both
                  without compromising product positioning.&rdquo;
                </p>
              </blockquote>
            </FadeIn>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════════
   11. RETAIL PARTNER PROFILE — Content + Image
   ═══════════════════════════════════════════════════════ */

function RetailPartnerProfile() {
  const { wrapRef, imgRef } = useParallax(25)

  return (
    <section className="bg-obsidian">
      <GoldDivider />
      <div className="flex flex-col-reverse lg:flex-row min-h-[60vh]">
        {/* Content — left */}
        <div className="lg:w-[50%] flex items-center px-6 lg:pl-16 lg:pr-16 py-16 lg:py-24">
          <div className="max-w-md">
            <FadeIn>
              <p className="text-xs uppercase tracking-[0.3em] text-gold font-heading font-medium mb-4">
                Ideal Partner Profile
              </p>
            </FadeIn>
            <FadeIn delay={0.05}>
              <h2 className="font-luxury text-3xl lg:text-[38px] font-light text-cream leading-[1.15] tracking-tight mb-6">
                Alignment Across
                <br />
                Retail Values
              </h2>
            </FadeIn>
            <FadeIn delay={0.1}>
              <p className="text-cream/50 text-base leading-relaxed mb-5">
                Retail partners typically operate within environments emphasising product quality,
                origin clarity, and curated assortment strategies. Alignment between product
                positioning and retail environment supports consistent customer expectations and
                long-term category performance.
              </p>
            </FadeIn>
            <FadeIn delay={0.15}>
              <p className="text-cream/35 text-sm leading-relaxed mb-8">
                Strong partnership alignment exists where retailers are committed to category
                development, seek stable procurement relationships, and value consistent product
                characteristics across supply cycles.
              </p>
            </FadeIn>

            <div className="space-y-5">
              {partnerProfileItems.map((item, i) => (
                <FadeIn key={item.label} delay={0.2 + i * 0.04}>
                  <div className="group border-l-2 border-gold/15 pl-5 py-1 hover:border-gold/40 transition-colors duration-500">
                    <h3 className="font-heading text-sm font-semibold text-cream/90 mb-1 tracking-wide">
                      {item.label}
                    </h3>
                    <p className="text-cream/38 text-sm leading-relaxed m-0">{item.desc}</p>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </div>

        {/* Image — right */}
        <div ref={wrapRef} className="relative lg:w-[50%] min-h-[400px] lg:min-h-0 overflow-hidden">
          <div ref={imgRef} className="absolute inset-[-25px]">
            <Image
              src="/images/retail/julia-anseele-YUzypVCe8WE-unsplash.avif"
              alt="Retail partner profile — premium food environment"
              fill
              sizes="50vw"
              className="object-cover"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-obsidian/50 hidden lg:block" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-obsidian/60 lg:hidden" />
        </div>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════════
   12. STATEMENT
   ═══════════════════════════════════════════════════════ */

function Statement() {
  return (
    <section className="bg-obsidian py-28 lg:py-40 border-t border-cream/[0.06]">
      <div className="max-w-[720px] mx-auto px-6 text-center">
        <FadeIn>
          <div className="w-12 h-px bg-gold/30 mx-auto mb-10" />
        </FadeIn>
        <FadeIn delay={0.08}>
          <p className="font-luxury text-2xl sm:text-3xl lg:text-[34px] font-light text-cream/70 leading-[1.55] tracking-tight mb-8">
            Delicious Planet structures retail partnerships to support continuity across procurement
            cycles while maintaining alignment with premium product positioning across Middle East
            and Africa markets.
          </p>
        </FadeIn>
        <FadeIn delay={0.12}>
          <p className="text-cream/30 text-base font-light leading-relaxed mb-6">
            Our retail supply framework is designed to support curated store environments seeking
            reliable access to natural products with consistent origin clarity and stable supply
            characteristics. Structured retail collaboration enables long-term category development
            supported by coordinated sourcing and distribution systems.
          </p>
        </FadeIn>
        <FadeIn delay={0.16}>
          <div className="w-8 h-px bg-gold/20 mx-auto" />
        </FadeIn>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════════
   13. RETAIL CTA — Image + Inquiry
   ═══════════════════════════════════════════════════════ */

function RetailCTA() {
  const { wrapRef, imgRef } = useParallax(20)

  return (
    <section className="bg-obsidian">
      <div className="flex flex-col lg:flex-row min-h-[70vh]">
        {/* Text side */}
        <div className="lg:w-1/2 flex items-center px-6 lg:px-16 py-20 lg:py-0">
          <div className="max-w-md">
            <FadeIn>
              <p className="text-xs uppercase tracking-[0.3em] text-gold font-heading font-medium mb-5">
                Retail Partnership Inquiry
              </p>
            </FadeIn>
            <FadeIn delay={0.05}>
              <h2 className="font-luxury text-3xl lg:text-[44px] font-light text-cream leading-[1.1] tracking-tight mb-6">
                Begin Your Retail
                <br />
                Supply Relationship
              </h2>
            </FadeIn>
            <FadeIn delay={0.1}>
              <p className="text-cream/50 text-base leading-relaxed mb-4">
                Retailers and distributors seeking structured supply relationships may submit
                partnership inquiries including store profile information, product category
                interest, and regional location. Qualified inquiries proceed to structured
                coordination aligned with supply feasibility and distribution coverage.
              </p>
            </FadeIn>
            <FadeIn delay={0.12}>
              <p className="text-cream/35 text-sm leading-relaxed mb-4">
                Our team reviews every inquiry with care. Partnerships are evaluated based on retail
                environment alignment, category compatibility, regional logistics feasibility, and
                long-term supply continuity potential.
              </p>
            </FadeIn>
            <FadeIn delay={0.14}>
              <p className="text-cream/25 text-xs leading-relaxed mb-10">
                For questions about our retail supply framework or product categories, please visit
                our{' '}
                <Link
                  href="/contact"
                  className="text-gold/40 hover:text-gold/70 underline underline-offset-2 transition-colors"
                >
                  contact page
                </Link>
                .
              </p>
            </FadeIn>
            <FadeIn delay={0.18}>
              <div className="flex flex-wrap gap-4">
                <MagneticButton>
                  <Link
                    href="/contact"
                    className="inline-flex items-center gap-2 text-sm font-heading font-medium uppercase tracking-widest px-9 py-4 rounded-sm no-underline bg-gold text-obsidian hover:bg-gold-light transition-colors duration-300"
                  >
                    Submit Retail Inquiry
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                      />
                    </svg>
                  </Link>
                </MagneticButton>
                <MagneticButton>
                  <Link
                    href="/sourcing"
                    className="inline-flex items-center text-sm font-heading font-medium uppercase tracking-widest px-9 py-4 rounded-sm no-underline text-cream border border-cream/20 hover:border-gold/40 transition-colors duration-300"
                  >
                    Our Sourcing
                  </Link>
                </MagneticButton>
              </div>
            </FadeIn>
          </div>
        </div>

        {/* Image side */}
        <div ref={wrapRef} className="relative lg:w-1/2 min-h-[400px] lg:min-h-0 overflow-hidden">
          <div ref={imgRef} className="absolute inset-[-20px]">
            <Image
              src="/images/retail/retail-ingredients.avif"
              alt="Premium retail supply — partnership opportunity"
              fill
              sizes="50vw"
              className="object-cover"
            />
          </div>
          <div className="absolute inset-0 bg-obsidian/10" />
        </div>
      </div>
    </section>
  )
}

/* ═════════════════════════════════════════════════════
   PAGE COMPOSITION
   ═════════════════════════════════════════════════════ */

export function RetailPageClient() {
  return (
    <>
      {/* 1. Full-screen hero with stats */}
      <Hero />

      {/* 2. Retail collaboration scope — store formats list + image */}
      <RetailCollaborationScope />

      {/* 3. Product portfolio access — category listing */}
      <ProductPortfolioAccess />

      {/* 4. Supply structure — five-pillar card grid */}
      <SupplyStructure />

      {/* 5. Order volume framework — image + volume considerations */}
      <OrderVolumeFramework />

      {/* 6. Product presentation alignment — checklist + image */}
      <ProductPresentationAlignment />

      {/* 7. Regional distribution coordination — two-column layout */}
      <RegionalDistributionCoordination />

      {/* 8. Private label retail — capabilities grid */}
      <PrivateLabelRetail />

      {/* 9. Onboarding pathway — seven-step numbered list */}
      <OnboardingPathway />

      {/* 10. Partnership continuity — image + blockquote */}
      <PartnershipContinuity />

      {/* 11. Retail partner profile — border-left items + image */}
      <RetailPartnerProfile />

      {/* 12. Philosophical statement */}
      <Statement />

      {/* 13. Final CTA — image + retail inquiry */}
      <RetailCTA />
    </>
  )
}
