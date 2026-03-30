'use client'

import { useState } from 'react'
import Image from 'next/image'
import { FadeIn } from '@/components/animations/FadeIn'

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

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number>(0)

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? -1 : index)
  }

  return (
    <section className="bg-obsidian lg:py-0 py-12 md:py-20 px-5 md:px-6 lg:px-0 overflow-hidden">
      <div className="max-w-[1440px] mx-auto">
        <FadeIn>
          <h2 className="font-luxury text-cream text-center lg:text-left lg:hidden text-xl md:text-2xl font-normal m-0 mb-8 md:mb-12 tracking-tight">
            FAQ
          </h2>
        </FadeIn>

        <div className="flex flex-col lg:flex-row">
          {/* Image — full height */}
          <div className="hidden lg:block lg:w-2/5 shrink-0 relative">
            <Image
              src="/images/misc/faq.avif"
              alt="Premium ingredients"
              fill
              className="object-cover"
              sizes="40vw"
            />
            <div className="absolute inset-0 bg-linear-to-r from-transparent to-obsidian/60" />
          </div>
          {/* Questions — vertically centered */}
          <div className="flex-1 flex flex-col justify-center lg:py-20 lg:px-16">
            <FadeIn>
              <h2 className="hidden lg:block font-luxury text-cream text-2xl lg:text-[36px] font-normal m-0 mb-12 lg:mb-16 tracking-tight">
                FAQ
              </h2>
            </FadeIn>
            {FAQ_ITEMS.map((item, i) => {
              const isOpen = openIndex === i
              return (
                <FadeIn key={i} delay={i * 0.05}>
                  <div className="border-b border-cream/10">
                    <button
                      onClick={() => toggle(i)}
                      className="w-full flex items-center justify-between py-5 lg:py-6 bg-transparent border-0 cursor-pointer text-left"
                    >
                      <span className="font-sans text-sm lg:text-base font-semibold text-cream/90 pr-8">
                        {item.question}
                      </span>
                      <span
                        className="text-cream/50 text-xl lg:text-2xl shrink-0 transition-transform duration-300"
                        style={{ transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)' }}
                      >
                        +
                      </span>
                    </button>
                    <div
                      className="overflow-hidden transition-all duration-300 ease-in-out"
                      style={{
                        maxHeight: isOpen ? '200px' : '0px',
                        opacity: isOpen ? 1 : 0,
                      }}
                    >
                      <p className="text-sm text-cream/50 m-0 pb-5 lg:pb-6 pr-12 leading-relaxed">
                        {item.answer}
                      </p>
                    </div>
                  </div>
                </FadeIn>
              )
            })}{' '}
          </div>{' '}
        </div>
      </div>
    </section>
  )
}
