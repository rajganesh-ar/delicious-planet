'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useCart } from '@/components/layout/CartContext'
import { Button, Container, Eyebrow, Heading, ProseText } from '@/components/ui'

/**
 * `pending` covers both "still asking Stripe" and an async payment method that
 * genuinely has not settled — the copy for those is the same, and it is
 * deliberately not the confident "your payment has gone through".
 */
type PaymentState = 'pending' | 'paid' | 'unconfirmed'

function SuccessInner() {
  const params = useSearchParams()
  const orderNumber = params.get('order') ?? ''
  const sessionId = params.get('session_id') ?? ''
  const { clearCart } = useCart()
  const [payment, setPayment] = useState<PaymentState>(sessionId ? 'pending' : 'unconfirmed')

  // The cart is kept through the Stripe redirect so a cancelled payment lands
  // back on a full basket. Reaching this page is what makes the sale final.
  //
  // Once per order, though: reopening this page from history used to empty a
  // basket the shopper had filled again since.
  useEffect(() => {
    if (!orderNumber) return
    const key = 'dp-cart-cleared-for'
    try {
      if (localStorage.getItem(key) === orderNumber) return
      localStorage.setItem(key, orderNumber)
    } catch {
      // Storage unavailable: clearing every time is the safer failure.
    }
    clearCart()
  }, [orderNumber, clearCart])

  /**
   * Confirms the payment against Stripe instead of assuming it from the
   * redirect. This is also what marks the order paid when the webhook has not
   * fired — see the docblock on /api/checkout/confirm.
   *
   * A failure here is not shown as an error: the money may well have been
   * taken, and the webhook is still coming. The page falls back to wording that
   * is true either way rather than claiming a payment it could not verify.
   */
  useEffect(() => {
    if (!sessionId) return
    let cancelled = false

    fetch(`/api/checkout/confirm?session_id=${encodeURIComponent(sessionId)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled) return
        setPayment(data?.paid ? 'paid' : 'unconfirmed')
      })
      .catch(() => {
        if (!cancelled) setPayment('unconfirmed')
      })

    return () => {
      cancelled = true
    }
  }, [sessionId])

  return (
    <>
      <section className="relative bg-obsidian overflow-hidden">
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
            <Heading as="h1" variant="display" className="text-cream">
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

          <Heading as="h2" variant="section" className="mb-4!">
            Your order has been received
          </Heading>

          {/*
            Only the confirmed branch claims the payment succeeded. The other
            two say something true without it — the order exists either way, and
            telling a shopper their card went through when we could not verify
            it is the one thing this page must not do.
          */}
          <ProseText size="md" tone="muted" className="mb-3!">
            {payment === 'paid' ? (
              <>
                Your payment has gone through and our team is preparing your order. We&apos;ll be
                in touch with shipping details shortly.
              </>
            ) : payment === 'pending' ? (
              <>Confirming your payment…</>
            ) : (
              <>
                Our team is preparing your order and will be in touch with shipping details
                shortly. If your payment is still settling, the status will update on your
                account shortly.
              </>
            )}
          </ProseText>
          <ProseText size="md" tone="muted" className="mb-10! sm:mb-12!">
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
