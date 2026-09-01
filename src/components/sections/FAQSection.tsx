'use client'

import { useId, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { FadeIn } from '@/components/animations/FadeIn'
import { Eyebrow, GUTTER } from '@/components/sections/editorial'
import { cn } from '@/lib/cn'

interface FAQItem {
  question: string
  answer: string
}

const FAQ_ITEMS: FAQItem[] = [
  {
    question: 'Where do you source your ingredients?',
    answer:
      'We work directly with artisan producers across 30+ countries — from truffle hunters in Piedmont to saffron farmers in Kashmir. Every supplier is personally vetted for quality, sustainability, and ethical practices.',
  },
  {
    question: 'Do you offer wholesale or B2B pricing?',
    answer:
      'Yes. We partner with restaurants, hotels, and specialty retailers worldwide. Visit our B2B page or contact our trade team for volume pricing and custom sourcing.',
  },
  {
    question: 'How do you ensure freshness and quality?',
    answer:
      'All products are stored in climate-controlled facilities and shipped with appropriate cold-chain packaging. We guarantee freshness on delivery, and every batch is traceable to its origin.',
  },
  {
    question: 'What is your shipping policy?',
    answer:
      'We ship globally with temperature-controlled logistics. Standard delivery takes 3–7 business days depending on your location. Express options are available at checkout.',
  },
  {
    question: 'Can I return or exchange a product?',
    answer:
      'Due to the perishable nature of our products, we handle returns on a case-by-case basis. If you receive a damaged or incorrect item, contact us within 48 hours for a full replacement or refund.',
  },
]

const HELP_LINKS = [
  { label: 'Send a message', href: '/contact#enquiry' },
  { label: 'Wholesale & B2B', href: '/b2b' },
  { label: 'Shipping policy', href: '/shipping' },
]

/**
 * styles.css sets unlayered h1–h6 / p typography that outranks Tailwind's
 * layered utilities, so the visual styling lives on a child span and the
 * margin needs an important override — same pattern as the homepage rails.
 */
export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number>(0)
  const baseId = useId()

  return (
    <section className={cn(GUTTER, 'py-8 md:py-11 bg-cream border-t border-stone/12')}>
      {/* Full-width heading row, matching every other section on the page. */}
      <FadeIn>
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-2.5 lg:gap-10 mb-5 md:mb-7">
          <div className="min-w-0">
            <Eyebrow className="mb-2">Answers</Eyebrow>
            <h2 className="m-0!">
              <span className="block font-luxury text-xl sm:text-2xl lg:text-[28px] font-semibold tracking-tight text-obsidian">
                Frequently asked questions
              </span>
            </h2>
          </div>
          <p className="m-0! font-sans text-[13px] md:text-sm text-stone leading-relaxed lg:max-w-md lg:text-right">
            Sourcing, quality, delivery and returns — the things buyers ask us most.
          </p>
        </div>
      </FadeIn>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 md:gap-4 items-start">
        {/* Aside — image and help links share one card so the column tracks the
            accordion's height instead of trailing off below it. It comes second
            in the source so the questions lead on mobile. */}
        <div className="lg:col-span-4 order-2">
          <FadeIn delay={0.08}>
            <div className="bg-white border border-stone/15 rounded-sm overflow-hidden">
              <div className="relative aspect-video w-full bg-mist">
                <Image
                  src="/images/misc/faq.avif"
                  alt=""
                  fill
                  sizes="(max-width: 1024px) 100vw, 30vw"
                  className="object-cover"
                />
              </div>
              <div className="p-4 md:p-5">
                <span className="block font-luxury text-base md:text-lg font-semibold text-obsidian leading-tight">
                  Still have a question?
                </span>
                <p className="m-0! mt-1.5! font-sans text-[12.5px] text-stone leading-relaxed">
                  Our team replies within one business day.
                </p>
                <ul className="list-none m-0 p-0 mt-3">
                  {HELP_LINKS.map((l) => (
                    <li key={l.label} className="border-t border-stone/10 first:border-t-0">
                      {/* Colour sits on the span — `a { color: currentColor }` in
                          styles.css is unlayered and outranks text utilities. */}
                      <Link
                        href={l.href}
                        className="group no-underline flex items-center justify-between gap-3 py-2.5"
                      >
                        <span className="font-sans text-[12.5px] text-obsidian group-hover:text-forest-green transition-colors">
                          {l.label}
                        </span>
                        <span
                          aria-hidden
                          className="font-sans text-[12.5px] text-stone/50 group-hover:text-forest-green transition-all duration-300 group-hover:translate-x-1"
                        >
                          →
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </FadeIn>
        </div>

        {/* Accordion */}
        <div className="lg:col-span-8 order-1">
          <ul className="list-none m-0 p-0 bg-white border border-stone/15 rounded-sm overflow-hidden">
            {FAQ_ITEMS.map((item, i) => {
              const isOpen = openIndex === i
              const panelId = `${baseId}-panel-${i}`
              const buttonId = `${baseId}-button-${i}`

              return (
                <li key={item.question} className="border-b border-stone/10 last:border-b-0">
                  <h3 className="m-0!">
                    <button
                      type="button"
                      id={buttonId}
                      aria-expanded={isOpen}
                      aria-controls={panelId}
                      onClick={() => setOpenIndex(isOpen ? -1 : i)}
                      className={cn(
                        'w-full flex items-start justify-between gap-4 text-left bg-transparent border-0 cursor-pointer px-4 md:px-6 py-5 md:py-6 transition-colors',
                        isOpen ? 'bg-parchment' : 'hover:bg-parchment/60',
                      )}
                    >
                      <span className="flex items-baseline gap-3 min-w-0">
                        <span className="shrink-0 font-luxury text-[13px] text-forest-green/50 leading-none">
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <span
                          className={cn(
                            'font-sans text-[13px] md:text-sm font-semibold leading-snug transition-colors',
                            isOpen ? 'text-forest-green' : 'text-obsidian',
                          )}
                        >
                          {item.question}
                        </span>
                      </span>

                      {/* The glyph rotates into a cross; the box stays square. */}
                      <span
                        aria-hidden
                        className={cn(
                          'shrink-0 mt-0.5 w-6 h-6 flex items-center justify-center rounded-sm border transition-colors duration-300',
                          isOpen ?
                            'border-forest-green bg-forest-green text-cream'
                          : 'border-stone/25 text-stone',
                        )}
                      >
                        <svg
                          width="11"
                          height="11"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.2"
                          strokeLinecap="round"
                          className={cn(
                            'transition-transform duration-300',
                            isOpen && 'rotate-45',
                          )}
                        >
                          <path d="M12 5v14M5 12h14" />
                        </svg>
                      </span>
                    </button>
                  </h3>

                  {/* Grid-rows animation expands to the answer's real height —
                      a fixed max-height would clip longer copy. */}
                  <div
                    id={panelId}
                    role="region"
                    aria-labelledby={buttonId}
                    className="grid transition-[grid-template-rows] duration-300 ease-out"
                    style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}
                  >
                    <div className="overflow-hidden">
                      <p className="m-0! font-sans text-[12.5px] md:text-[13px] text-stone leading-relaxed px-4 md:px-6 pb-4 md:pb-5 md:pl-14 max-w-2xl">
                        {item.answer}
                      </p>
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </section>
  )
}
