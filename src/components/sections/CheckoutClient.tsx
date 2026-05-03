'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useCart } from '@/components/layout/CartContext'
import type { User } from '@/payload-types'
import {
  Button,
  Container,
  Eyebrow,
  FormField,
  Heading,
  Input,
  ProseText,
  Textarea,
  Divider,
} from '@/components/ui'

interface SavedAddress {
  id?: string | null
  label?: string | null
  line1: string
  line2?: string | null
  city: string
  state?: string | null
  postalCode: string
  country: string
  isDefault?: boolean | null
}

interface AddressForm {
  name: string
  line1: string
  line2: string
  city: string
  state: string
  postalCode: string
  country: string
}

const EMPTY_ADDRESS: AddressForm = {
  name: '',
  line1: '',
  line2: '',
  city: '',
  state: '',
  postalCode: '',
  country: '',
}

export function CheckoutClient() {
  const router = useRouter()
  const { items, subtotal, clearCart } = useCart()
  const currency = items[0]?.currency ?? 'USD'

  const [user, setUser] = useState<User | null>(null)
  const [userLoaded, setUserLoaded] = useState(false)
  const [email, setEmail] = useState('')
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null)
  const [useNewAddress, setUseNewAddress] = useState(false)
  const [address, setAddress] = useState<AddressForm>(EMPTY_ADDRESS)
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setHydrated(true)
  }, [])

  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch('/api/users/me', { credentials: 'include' })
        const data = await res.json()
        if (data.user) {
          setUser(data.user)
          setEmail(data.user.email || '')
          if (data.user.name) {
            setAddress((a) => ({ ...a, name: data.user.name }))
          }
          const addresses: SavedAddress[] = data.user.addresses ?? []
          const def = addresses.find((a) => a.isDefault) ?? addresses[0]
          if (def?.id) setSelectedAddressId(def.id)
          else setUseNewAddress(true)
        } else {
          setUseNewAddress(true)
        }
      } catch {
        setUseNewAddress(true)
      } finally {
        setUserLoaded(true)
      }
    }
    loadUser()
  }, [])

  useEffect(() => {
    if (hydrated && items.length === 0 && !submitting) {
      router.replace('/products')
    }
  }, [hydrated, items.length, submitting, router])

  const savedAddresses: SavedAddress[] = (user?.addresses as SavedAddress[]) ?? []
  const selectedSaved = savedAddresses.find((a) => a.id === selectedAddressId)

  const formatMoney = (amt: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amt)

  function getShippingAddress() {
    if (!useNewAddress && selectedSaved) {
      return {
        name: address.name || user?.name || '',
        line1: selectedSaved.line1,
        line2: selectedSaved.line2 ?? '',
        city: selectedSaved.city,
        state: selectedSaved.state ?? '',
        postalCode: selectedSaved.postalCode,
        country: selectedSaved.country,
      }
    }
    return address
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const shipping = getShippingAddress()
    if (!shipping.line1 || !shipping.city || !shipping.postalCode || !shipping.country) {
      setError('Please fill in all required address fields.')
      return
    }
    if (!user && !email) {
      setError('Please enter your email address.')
      return
    }

    setSubmitting(true)

    const payload: Record<string, unknown> = {
      items: items.map((i) => ({
        product: i.productId,
        quantity: i.quantity,
        unitAmount: i.price,
        currency: i.currency,
      })),
      totals: {
        subtotal,
        shipping: 0,
        tax: 0,
        total: subtotal,
      },
      currency,
      status: 'pending',
      type: 'retail',
      shippingAddress: shipping,
    }

    if (user) {
      payload.user = user.id
    } else {
      payload.guestEmail = email
    }

    if (notes.trim()) {
      payload.notes = notes.trim()
    }

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        setError('Could not place your order. Please try again.')
        setSubmitting(false)
        return
      }

      const data = await res.json()
      const orderNumber = data?.doc?.orderNumber ?? data?.orderNumber ?? ''
      clearCart()
      router.push(`/checkout/success?order=${encodeURIComponent(orderNumber)}`)
    } catch {
      setError('Network error. Please try again.')
      setSubmitting(false)
    }
  }

  if (!hydrated || items.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-stone text-sm">Loading…</p>
      </div>
    )
  }

  return (
    <>
      <section className="relative bg-obsidian overflow-hidden pt-20 sm:pt-24">
        <div className="absolute inset-0 bg-linear-to-br from-obsidian via-charcoal to-obsidian opacity-90" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-gold to-transparent opacity-40" />
        <Container size="lg" className="relative py-12 sm:py-16 md:py-20 lg:py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Eyebrow tone="gold" className="mb-4">
              Checkout
            </Eyebrow>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <Heading as="h1" variant="display" className="text-cream m-0">
              Place your order
            </Heading>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <ProseText size="md" tone="cream" className="mt-4 mb-0 max-w-lg">
              Our team will reach out shortly to confirm payment details and arrange shipping.
            </ProseText>
          </motion.div>
        </Container>
      </section>

      <section className="bg-cream py-12 sm:py-16 md:py-20 lg:py-24">
        <Container size="lg">
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-8 md:gap-12 lg:gap-16"
          >
            <div className="space-y-10">
              <div>
                <Heading as="h2" variant="card" className="m-0 mb-6">
                  Contact
                </Heading>
                <FormField label="Email" required htmlFor="checkout-email">
                  <Input
                    id="checkout-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={Boolean(user)}
                    className="disabled:opacity-70 disabled:cursor-not-allowed"
                  />
                </FormField>
                {!userLoaded ? null : !user ? (
                  <p className="text-xs text-stone/70 mt-2 m-0">
                    Have an account?{' '}
                    <Link href="/login?redirect=/checkout" className="text-forest-green underline">
                      Sign in
                    </Link>{' '}
                    for faster checkout.
                  </p>
                ) : null}
              </div>

              {user && savedAddresses.length > 0 && (
                <div>
                  <Heading as="h2" variant="card" className="m-0 mb-6">
                    Shipping address
                  </Heading>
                  <div className="space-y-3 mb-4">
                    {savedAddresses.map((a) => (
                      <button
                        key={a.id ?? a.line1}
                        type="button"
                        onClick={() => {
                          setSelectedAddressId(a.id ?? null)
                          setUseNewAddress(false)
                        }}
                        className={`w-full text-left p-4 rounded-sm border transition-all cursor-pointer bg-transparent ${
                          !useNewAddress && selectedAddressId === a.id
                            ? 'border-forest-green bg-forest-green/5'
                            : 'border-mist/60 hover:border-forest-green/40'
                        }`}
                      >
                        {a.label && (
                          <p className="text-[11px] uppercase tracking-[0.18em] text-forest-green m-0 mb-1 font-heading">
                            {a.label}
                          </p>
                        )}
                        <p className="text-sm text-obsidian m-0">
                          {a.line1}
                          {a.line2 ? `, ${a.line2}` : ''}
                        </p>
                        <p className="text-xs text-stone m-0 mt-1">
                          {a.city}
                          {a.state ? `, ${a.state}` : ''} {a.postalCode}, {a.country}
                        </p>
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        setUseNewAddress(true)
                        setSelectedAddressId(null)
                      }}
                      className={`w-full text-left p-4 rounded-sm border transition-all cursor-pointer bg-transparent ${
                        useNewAddress
                          ? 'border-forest-green bg-forest-green/5'
                          : 'border-mist/60 hover:border-forest-green/40'
                      }`}
                    >
                      <p className="text-sm text-obsidian m-0">+ Use a different address</p>
                    </button>
                  </div>
                </div>
              )}

              {(useNewAddress || savedAddresses.length === 0) && (
                <div>
                  {savedAddresses.length === 0 && (
                    <Heading as="h2" variant="card" className="m-0 mb-6">
                      Shipping address
                    </Heading>
                  )}
                  <div className="space-y-6">
                    <FormField label="Full name" required htmlFor="checkout-name">
                      <Input
                        id="checkout-name"
                        type="text"
                        required
                        value={address.name}
                        onChange={(e) => setAddress({ ...address, name: e.target.value })}
                      />
                    </FormField>
                    <FormField label="Address line 1" required htmlFor="checkout-line1">
                      <Input
                        id="checkout-line1"
                        type="text"
                        required
                        value={address.line1}
                        onChange={(e) => setAddress({ ...address, line1: e.target.value })}
                      />
                    </FormField>
                    <FormField label="Address line 2" htmlFor="checkout-line2">
                      <Input
                        id="checkout-line2"
                        type="text"
                        value={address.line2}
                        onChange={(e) => setAddress({ ...address, line2: e.target.value })}
                      />
                    </FormField>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <FormField label="City" required htmlFor="checkout-city">
                        <Input
                          id="checkout-city"
                          type="text"
                          required
                          value={address.city}
                          onChange={(e) => setAddress({ ...address, city: e.target.value })}
                        />
                      </FormField>
                      <FormField label="State / Region" htmlFor="checkout-state">
                        <Input
                          id="checkout-state"
                          type="text"
                          value={address.state}
                          onChange={(e) => setAddress({ ...address, state: e.target.value })}
                        />
                      </FormField>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <FormField label="Postal code" required htmlFor="checkout-postal">
                        <Input
                          id="checkout-postal"
                          type="text"
                          required
                          value={address.postalCode}
                          onChange={(e) => setAddress({ ...address, postalCode: e.target.value })}
                        />
                      </FormField>
                      <FormField label="Country" required htmlFor="checkout-country">
                        <Input
                          id="checkout-country"
                          type="text"
                          required
                          value={address.country}
                          onChange={(e) => setAddress({ ...address, country: e.target.value })}
                        />
                      </FormField>
                    </div>
                  </div>
                </div>
              )}

              <FormField label="Order notes (optional)" htmlFor="checkout-notes">
                <Textarea
                  id="checkout-notes"
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Anything our team should know..."
                />
              </FormField>

              {error && (
                <p className="text-sm text-red-600 m-0" role="alert">
                  {error}
                </p>
              )}
            </div>

            <aside className="lg:sticky lg:self-start" style={{ top: 'calc(var(--header-h) + 16px)' }}>
              <div className="border border-mist/60 rounded-sm p-5 sm:p-6 bg-white">
                <Heading as="h2" variant="card" className="m-0 mb-6">
                  Order summary
                </Heading>

                <ul className="list-none m-0 p-0 space-y-5 mb-6">
                  {items.map((item) => (
                    <li key={item.productId} className="flex gap-4">
                      {item.image && (
                        <div className="shrink-0 relative w-16 h-16 rounded-sm overflow-hidden bg-mist/30">
                          <Image
                            src={item.image}
                            alt={item.title}
                            fill
                            sizes="64px"
                            className="object-cover"
                          />
                          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-obsidian text-cream text-[10px] font-medium flex items-center justify-center">
                            {item.quantity}
                          </span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-obsidian m-0 truncate">{item.title}</p>
                        <p className="text-xs text-stone m-0 mt-1">
                          {formatMoney(item.price)} × {item.quantity}
                        </p>
                      </div>
                      <p className="text-sm text-obsidian m-0 whitespace-nowrap">
                        {formatMoney(item.price * item.quantity)}
                      </p>
                    </li>
                  ))}
                </ul>

                <Divider variant="hairline" tone="mist" className="mb-4" />
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-stone">
                    <span>Subtotal</span>
                    <span>{formatMoney(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-stone">
                    <span>Shipping</span>
                    <span className="text-stone/70">Calculated by team</span>
                  </div>
                  <Divider variant="hairline" tone="mist" className="my-3" />
                  <div className="flex justify-between items-baseline">
                    <span className="text-sm text-obsidian">Total</span>
                    <span className="font-luxury text-lg font-semibold text-obsidian">
                      {formatMoney(subtotal)}
                    </span>
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="dark"
                  size="lg"
                  fullWidth
                  loading={submitting}
                  className="mt-6"
                >
                  {submitting ? 'Placing order…' : 'Place order'}
                </Button>

                <p className="text-[11px] text-stone/60 m-0 mt-4 leading-relaxed">
                  No payment is collected here. Our team will contact you to confirm pricing,
                  shipping, and arrange invoice payment.
                </p>
              </div>
            </aside>
          </form>
        </Container>
      </section>
    </>
  )
}
