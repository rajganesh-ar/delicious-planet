'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import type { User, Order } from '@/payload-types'
import { AuthField, AuthSubmit, authInputClass, AuthAlert } from '@/components/sections/AuthShell'
import { Cta, Eyebrow, GUTTER } from '@/components/sections/editorial'
import { formatPrice } from '@/lib/product'
import { cn } from '@/lib/cn'

/**
 * Account — the console archetype.
 *
 * A dark identity band, a hairline rail of sections on the left, and one panel
 * at a time on the right. Records are rows, not cards: an order history reads
 * like a statement, and the addresses and profile follow the same hairline
 * rhythm so nothing here competes with the storefront's photography.
 *
 * styles.css declares unlayered `a`, `h1`–`h6` and `p` rules that outrank
 * Tailwind's layered utilities — colour on child spans, margins with `!`.
 */

type Tab = 'orders' | 'addresses' | 'profile'

interface Address {
  label?: string | null
  line1: string
  line2?: string | null
  city: string
  state?: string | null
  postalCode: string
  country: string
  isDefault?: boolean | null
  id?: string | null
}

/** House colours for the status marker — the palette, not Tailwind defaults. */
const STATUS_DOT: Record<Order['status'], string> = {
  pending: 'bg-gold',
  processing: 'bg-bud-green',
  shipped: 'bg-forest-green',
  delivered: 'bg-forest-green',
  cancelled: 'bg-stone/50',
  refunded: 'bg-stone/50',
}

const TABS: { key: Tab; label: string; blurb: string }[] = [
  { key: 'orders', label: 'Orders', blurb: 'Every order placed on this account' },
  { key: 'addresses', label: 'Addresses', blurb: 'Delivery destinations on file' },
  { key: 'profile', label: 'Profile', blurb: 'Name, contact and sign-in email' },
]

export default function AccountPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [activeTab, setActiveTab] = useState<Tab>('orders')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profileName, setProfileName] = useState('')
  const [profilePhone, setProfilePhone] = useState('')
  const [profileMsg, setProfileMsg] = useState<{ tone: 'error' | 'success'; text: string } | null>(
    null,
  )

  useEffect(() => {
    async function fetchData() {
      try {
        const meRes = await fetch('/api/users/me', { credentials: 'include' })
        const meData = await meRes.json()

        if (!meData.user) {
          router.push('/login')
          return
        }

        setUser(meData.user)
        setProfileName(meData.user.name || '')
        setProfilePhone(meData.user.phone || '')

        const ordersRes = await fetch(
          `/api/orders?where[user][equals]=${meData.user.id}&sort=-createdAt&limit=20`,
          { credentials: 'include' },
        )
        const ordersData = await ordersRes.json()
        setOrders(ordersData.docs || [])
      } catch {
        router.push('/login')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [router])

  async function handleProfileUpdate(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return
    setSaving(true)
    setProfileMsg(null)

    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: profileName, phone: profilePhone }),
        credentials: 'include',
      })

      if (res.ok) {
        const data = await res.json()
        setUser(data.doc)
        setProfileMsg({ tone: 'success', text: 'Profile updated.' })
      } else {
        setProfileMsg({ tone: 'error', text: 'That change could not be saved. Try again.' })
      }
    } catch {
      setProfileMsg({ tone: 'error', text: 'An error occurred. Try again.' })
    } finally {
      setSaving(false)
    }
  }

  async function handleLogout() {
    await fetch('/api/users/logout', { method: 'POST', credentials: 'include' })
    router.push('/')
    router.refresh()
  }

  if (loading) return <AccountSkeleton />
  if (!user) return null

  const addresses = (user.addresses ?? []) as Address[]
  const counts: Record<Tab, number> = {
    orders: orders.length,
    addresses: addresses.length,
    profile: 0,
  }
  const lastOrder = orders[0]

  return (
    <div className="bg-cream">
      {/* ═══ IDENTITY BAND ══════════════════════════════════════ */}
      <section className="bg-obsidian">
        <div className={cn(GUTTER, 'pt-9 pb-7 md:pt-12 md:pb-9')}>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5">
            <div className="min-w-0">
              <Eyebrow tone="light">Your account</Eyebrow>
              <h1 className="m-0! mt-2.5!">
                <span className="block font-luxury text-cream font-semibold leading-[1.1] tracking-tight text-[clamp(1.75rem,4.5vw,3rem)]">
                  {user.name || 'My account'}
                </span>
              </h1>
              <p className="m-0! mt-2! font-sans text-cream/60 text-[13px] md:text-sm">
                {user.email}
              </p>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="shrink-0 h-10 px-5 rounded-sm border border-cream/25 bg-transparent cursor-pointer transition-colors hover:bg-cream hover:border-cream group self-start sm:self-auto"
            >
              <span className="font-heading text-[11px] uppercase tracking-[0.16em] font-semibold text-cream group-hover:text-obsidian transition-colors">
                Sign out
              </span>
            </button>
          </div>
        </div>

        {/* Summary rule — a line of facts, not a stat grid. */}
        <div className={cn(GUTTER, 'border-t border-cream/10')}>
          <p className="m-0! py-3.5 font-sans text-[11px] md:text-[12px] uppercase tracking-[0.16em] text-cream/45">
            {orders.length} {orders.length === 1 ? 'order' : 'orders'}
            <span className="text-cream/20"> · </span>
            {addresses.length} saved {addresses.length === 1 ? 'address' : 'addresses'}
            {lastOrder ? (
              <>
                <span className="text-cream/20"> · </span>
                last order{' '}
                {new Date(lastOrder.createdAt).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </>
            ) : null}
          </p>
        </div>
      </section>

      {/* ═══ CONSOLE ════════════════════════════════════════════ */}
      <section className={cn(GUTTER, 'py-8 md:py-11')}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-start">
          {/* ── Rail ──────────────────────────────────────── */}
          <nav
            aria-label="Account sections"
            className="lg:col-span-3 lg:sticky lg:top-[calc(var(--header-h)+1.5rem)]"
          >
            <ul className="list-none m-0 p-0 border-t border-obsidian/20">
              {TABS.map((tab) => {
                const active = activeTab === tab.key
                return (
                  <li key={tab.key} className="border-b border-stone/12">
                    <button
                      type="button"
                      onClick={() => setActiveTab(tab.key)}
                      aria-current={active ? 'true' : undefined}
                      className="w-full text-left bg-transparent border-0 cursor-pointer py-3.5 px-0 flex items-start gap-3 group"
                    >
                      <span
                        aria-hidden
                        className={cn(
                          'mt-1.5 w-1.5 h-1.5 shrink-0 transition-colors',
                          active ? 'bg-forest-green' : 'bg-stone/25',
                        )}
                      />
                      <span className="min-w-0 flex-1">
                        <span className="flex items-baseline justify-between gap-3">
                          <span
                            className={cn(
                              'font-luxury text-[15px] font-semibold leading-tight transition-colors',
                              active
                                ? 'text-forest-green'
                                : 'text-obsidian group-hover:text-forest-green',
                            )}
                          >
                            {tab.label}
                          </span>
                          {counts[tab.key] > 0 ? (
                            <span className="font-sans text-[11px] text-stone shrink-0">
                              {counts[tab.key]}
                            </span>
                          ) : null}
                        </span>
                        <span className="block font-sans text-[11.5px] text-stone leading-snug mt-0.5">
                          {tab.blurb}
                        </span>
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>

            <div className="mt-5 bg-obsidian rounded-sm p-4">
              <Eyebrow tone="light">Need a hand?</Eyebrow>
              <p className="m-0! mt-2! font-sans text-[12px] text-cream/65 leading-relaxed">
                Questions about a dispatch, a return or an invoice go to the same desk.
              </p>
              <div className="mt-3.5">
                <Cta href="/contact#enquiry" variant="outline">
                  Contact us
                </Cta>
              </div>
            </div>
          </nav>

          {/* ── Panels ────────────────────────────────────── */}
          <div className="lg:col-span-9">
            <AnimatePresence mode="wait">
              {activeTab === 'orders' && (
                <Panel key="orders">
                  <PanelHead
                    title="Order history"
                    lede="Every order placed on this account, newest first. Dispatch notifications are sent by email as each one leaves the warehouse."
                  />

                  {orders.length > 0 ? (
                    <>
                      {/* Column headings on md+; each row repeats them inline below. */}
                      <div className="hidden md:grid grid-cols-12 gap-6 pb-2.5 border-b border-obsidian/20">
                        <span className="col-span-5 font-sans text-[10px] uppercase tracking-[0.16em] font-medium text-stone">
                          Order
                        </span>
                        <span className="col-span-4 font-sans text-[10px] uppercase tracking-[0.16em] font-medium text-stone">
                          Status
                        </span>
                        <span className="col-span-3 text-right font-sans text-[10px] uppercase tracking-[0.16em] font-medium text-stone">
                          Total
                        </span>
                      </div>
                      <ul className="list-none m-0 p-0 border-t border-obsidian/20 md:border-t-0">
                        {orders.map((order) => (
                          <OrderRow key={order.id} order={order} />
                        ))}
                      </ul>
                    </>
                  ) : (
                    <EmptyPanel
                      title="No orders yet"
                      body="Once you place an order it appears here with its dispatch status and totals."
                      cta={{ href: '/products', label: 'Browse the catalogue' }}
                    />
                  )}
                </Panel>
              )}

              {activeTab === 'addresses' && (
                <Panel key="addresses">
                  <PanelHead
                    title="Saved addresses"
                    lede="Destinations kept on file for checkout. Add or edit them during the checkout flow, or ask the team to update one for you."
                  />

                  {addresses.length > 0 ? (
                    <ul className="list-none m-0 p-0 grid grid-cols-1 md:grid-cols-2 gap-x-10 border-t border-obsidian/20">
                      {addresses.map((addr, i) => (
                        <li key={addr.id || i} className="border-b border-stone/12 py-4">
                          <div className="flex items-baseline justify-between gap-3">
                            <span className="font-luxury text-base font-semibold text-obsidian leading-tight">
                              {addr.label || `Address ${i + 1}`}
                            </span>
                            {addr.isDefault ? (
                              <span className="font-sans text-[10px] uppercase tracking-[0.16em] text-forest-green shrink-0">
                                Default
                              </span>
                            ) : null}
                          </div>
                          <p className="m-0! mt-2! font-sans text-[12.5px] text-stone leading-relaxed">
                            {addr.line1}
                            {addr.line2 ? (
                              <>
                                <br />
                                {addr.line2}
                              </>
                            ) : null}
                            <br />
                            {addr.city}
                            {addr.state ? `, ${addr.state}` : ''} {addr.postalCode}
                            <br />
                            {addr.country}
                          </p>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <EmptyPanel
                      title="No saved addresses"
                      body="Addresses entered at checkout are kept here so you don't have to type them twice."
                      cta={{ href: '/products', label: 'Start an order' }}
                    />
                  )}
                </Panel>
              )}

              {activeTab === 'profile' && (
                <Panel key="profile">
                  <PanelHead
                    title="Profile"
                    lede="Your name and phone number travel with every order so the courier knows who to hand it to."
                  />

                  <form
                    onSubmit={handleProfileUpdate}
                    className="border-t border-obsidian/20 pt-5 max-w-lg flex flex-col gap-4"
                  >
                    {profileMsg ? (
                      <AuthAlert tone={profileMsg.tone}>{profileMsg.text}</AuthAlert>
                    ) : null}

                    <AuthField
                      label="Email"
                      htmlFor="profile-email"
                      hint="Your sign-in address. Contact us to change it."
                    >
                      <input
                        id="profile-email"
                        type="email"
                        value={user.email}
                        disabled
                        className={cn(authInputClass, 'bg-mist/60 text-stone cursor-not-allowed')}
                      />
                    </AuthField>

                    <AuthField label="Name" htmlFor="profile-name">
                      <input
                        id="profile-name"
                        type="text"
                        value={profileName}
                        onChange={(e) => setProfileName(e.target.value)}
                        autoComplete="name"
                        className={authInputClass}
                      />
                    </AuthField>

                    <AuthField
                      label="Phone"
                      htmlFor="profile-phone"
                      hint="Used only for delivery coordination."
                    >
                      <input
                        id="profile-phone"
                        type="tel"
                        value={profilePhone}
                        onChange={(e) => setProfilePhone(e.target.value)}
                        autoComplete="tel"
                        className={authInputClass}
                      />
                    </AuthField>

                    <AuthSubmit loading={saving} className="mt-1 sm:w-auto sm:px-10 sm:self-start">
                      {saving ? 'Saving…' : 'Save changes'}
                    </AuthSubmit>
                  </form>
                </Panel>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>
    </div>
  )
}

/* ── Panel scaffolding ─────────────────────────────────────── */

function Panel({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
    >
      {children}
    </motion.div>
  )
}

function PanelHead({ title, lede }: { title: string; lede: string }) {
  return (
    <div className="mb-5">
      <h2 className="m-0!">
        <span className="block font-luxury text-xl sm:text-2xl font-semibold text-obsidian tracking-tight leading-tight">
          {title}
        </span>
      </h2>
      <p className="m-0! mt-2! font-sans text-[13px] text-stone leading-relaxed max-w-2xl">
        {lede}
      </p>
    </div>
  )
}

/* ── One order ─────────────────────────────────────────────── */

function OrderRow({ order }: { order: Order }) {
  const itemCount = (order.items ?? []).reduce((sum, i) => sum + (i.quantity ?? 0), 0)
  const city = order.shippingAddress?.city

  return (
    // motion.li rather than <FadeIn>, which renders a <div> and would be
    // invalid as a direct child of <ul>.
    <motion.li
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-10%' }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="border-b border-stone/12 py-4 md:py-5 grid grid-cols-12 gap-3 md:gap-6 items-start"
    >
      <div className="col-span-12 md:col-span-5 min-w-0">
        <div className="flex items-center gap-2.5">
          <span aria-hidden className={cn('w-1.5 h-1.5 shrink-0', STATUS_DOT[order.status])} />
          <span className="font-luxury text-base md:text-lg font-semibold text-obsidian leading-tight">
            #{order.orderNumber}
          </span>
          {order.type === 'b2b' ? (
            <span className="font-sans text-[10px] uppercase tracking-[0.16em] text-forest-green">
              B2B
            </span>
          ) : null}
        </div>
        <p className="m-0! mt-1.5! font-sans text-[12px] text-stone">
          {new Date(order.createdAt).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
          {city ? ` · ${city}` : ''}
        </p>
      </div>

      <div className="col-span-6 md:col-span-4">
        <span className="md:hidden block font-sans text-[10px] uppercase tracking-[0.16em] text-stone/70">
          Status
        </span>
        <span className="block font-sans text-[12.5px] text-obsidian capitalize mt-0.5">
          {order.status}
        </span>
        <span className="block font-sans text-[11.5px] text-stone mt-0.5">
          {itemCount} {itemCount === 1 ? 'item' : 'items'}
        </span>
      </div>

      <div className="col-span-6 md:col-span-3 text-right">
        <span className="md:hidden block font-sans text-[10px] uppercase tracking-[0.16em] text-stone/70">
          Total
        </span>
        <span className="block font-luxury text-base md:text-lg font-semibold text-obsidian leading-none mt-1">
          {formatPrice(order.totals?.total ?? 0, order.currency)}
        </span>
      </div>
    </motion.li>
  )
}

/* ── States ────────────────────────────────────────────────── */

function EmptyPanel({
  title,
  body,
  cta,
}: {
  title: string
  body: string
  cta: { href: string; label: string }
}) {
  return (
    <div className="border-t border-obsidian/20 pt-8 pb-4">
      {/* max-w on a wrapper — the `m-0!` below would cancel auto margins. */}
      <div className="max-w-md">
        <h3 className="m-0!">
          <span className="block font-luxury text-lg font-semibold text-obsidian leading-tight">
            {title}
          </span>
        </h3>
        <p className="m-0! mt-2! font-sans text-[13px] text-stone leading-relaxed">{body}</p>
        <div className="mt-5">
          <Link href={cta.href} className="group no-underline inline-flex items-center gap-2">
            <span className="font-heading text-[11px] uppercase tracking-[0.16em] font-semibold text-forest-green">
              {cta.label}
            </span>
            <span
              aria-hidden
              className="font-sans text-[12px] text-forest-green transition-transform group-hover:translate-x-0.5"
            >
              →
            </span>
          </Link>
        </div>
      </div>
    </div>
  )
}

function AccountSkeleton() {
  return (
    <div className="bg-cream" aria-busy="true">
      <section className="bg-obsidian">
        <div className={cn(GUTTER, 'pt-9 pb-7 md:pt-12 md:pb-9')}>
          <span className="block h-3 w-24 bg-cream/10 rounded-sm" />
          <span className="block h-8 w-64 bg-cream/10 rounded-sm mt-4" />
          <span className="block h-3 w-40 bg-cream/10 rounded-sm mt-3" />
        </div>
      </section>
      <section className={cn(GUTTER, 'py-8 md:py-11')}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10">
          <div className="lg:col-span-3 flex flex-col gap-3">
            {[0, 1, 2].map((i) => (
              <span key={i} className="h-12 bg-mist rounded-sm" />
            ))}
          </div>
          <div className="lg:col-span-9 flex flex-col gap-3">
            {[0, 1, 2].map((i) => (
              <span key={i} className="h-16 bg-mist rounded-sm" />
            ))}
          </div>
        </div>
      </section>
      <span className="sr-only">Loading your account…</span>
    </div>
  )
}
