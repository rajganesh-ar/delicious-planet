'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { motion } from 'framer-motion'
import { Button, Container, Eyebrow, Heading, ProseText } from '@/components/ui'

function SuccessInner() {
  const params = useSearchParams()
  const orderNumber = params.get('order') ?? ''

  return (
    <>
      <section className="relative bg-obsidian overflow-hidden pt-20 sm:pt-24">
        <div className="absolute inset-0 bg-linear-to-br from-obsidian via-charcoal to-obsidian opacity-90" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-gold to-transparent opacity-40" />
        <Container size="lg" className="relative py-16 sm:py-20 md:py-24 lg:py-28">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Eyebrow tone="gold" className="mb-4">
              Order received
            </Eyebrow>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <Heading as="h1" variant="display" className="text-cream m-0">
              Thank you
            </Heading>
          </motion.div>
          {orderNumber && (
            <motion.p
              className="text-cream/60 text-sm md:text-base mt-6 mb-0 font-mono"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Order reference:{' '}
              <span className="text-gold tracking-wider">{orderNumber}</span>
            </motion.p>
          )}
        </Container>
      </section>

      <section className="bg-cream py-12 sm:py-16 md:py-20 lg:py-24">
        <Container size="md" className="text-center">
          <div className="w-16 h-16 rounded-full bg-forest-green/10 flex items-center justify-center mx-auto mb-8">
            <svg
              width="32"
              height="32"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
              className="text-forest-green"
            >
              <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          <Heading as="h2" variant="section" className="m-0 mb-4">
            Your order has been received
          </Heading>

          <ProseText size="md" tone="muted" className="m-0 mb-3">
            Our team will reach out shortly to confirm pricing, shipping, and arrange invoice
            payment.
          </ProseText>
          <ProseText size="md" tone="muted" className="m-0 mb-10 sm:mb-12">
            A copy of this confirmation will be sent to your email.
          </ProseText>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Button as="link" href="/products" variant="dark" size="lg">
              Continue shopping
            </Button>
            <Button as="link" href="/account" variant="ghost" size="lg">
              View your orders
            </Button>
          </div>
        </Container>
      </section>
    </>
  )
}

export function CheckoutSuccessClient() {
  return (
    <Suspense fallback={<div className="min-h-[60vh]" />}>
      <SuccessInner />
    </Suspense>
  )
}
