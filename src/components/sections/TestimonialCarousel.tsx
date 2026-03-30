'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import Image from 'next/image'
import { FadeIn } from '@/components/animations/FadeIn'
import type { Testimonial, Media } from '@/payload-types'

interface TestimonialCarouselProps {
  testimonials: Testimonial[]
}

export function TestimonialCarousel({ testimonials }: TestimonialCarouselProps) {
  const [current, setCurrent] = useState(0)

  if (testimonials.length === 0) return null

  const t = testimonials[current]
  const imageUrl =
    typeof t.image === 'object' && t.image !== null
      ? ((t.image as Media).sizes?.thumbnail?.url ?? (t.image as Media).url ?? null)
      : null

  return (
    <section className="py-(--spacing-section-lg) bg-parchment">
      <div className="max-w-[1440px] mx-auto px-5 md:px-8 lg:px-16">
        <FadeIn>
          <h2 className="font-serif text-2xl md:text-3xl lg:text-[44px] font-medium m-0 mb-10 md:mb-16 lg:mb-20 text-center text-obsidian tracking-tight">
            What Our Clients Say
          </h2>
        </FadeIn>

        <div className="max-w-3xl mx-auto text-center min-h-[160px] md:min-h-[180px] flex flex-col items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center"
            >
              <blockquote className="font-serif text-xl md:text-2xl lg:text-3xl font-medium text-obsidian leading-[1.35] tracking-tight m-0 mb-6 md:mb-10">
                &ldquo;{t.quote}&rdquo;
              </blockquote>

              <div className="flex items-center gap-4">
                {imageUrl && (
                  <Image
                    src={imageUrl}
                    alt={t.name}
                    width={48}
                    height={48}
                    className="rounded-full object-cover"
                  />
                )}
                <div className="text-left">
                  <p className="text-sm font-medium text-obsidian m-0">{t.name}</p>
                  {(t.role || t.company) && (
                    <p className="text-xs text-stone m-0 mt-1">
                      {[t.role, t.company].filter(Boolean).join(', ')}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Dots */}
        {testimonials.length > 1 && (
          <div className="flex justify-center gap-2 mt-12">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`w-2 h-2 rounded-full border-0 cursor-pointer transition-all duration-300 ${
                  i === current ? 'bg-gold w-6' : 'bg-stone/30 hover:bg-stone/50'
                }`}
                aria-label={`Testimonial ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
