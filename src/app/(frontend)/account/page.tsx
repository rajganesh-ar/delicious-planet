'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { FadeIn } from '@/components/animations/FadeIn'
import type { User, Order } from '@/payload-types'

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

export default function AccountPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [activeTab, setActiveTab] = useState<Tab>('orders')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profileName, setProfileName] = useState('')
  const [profilePhone, setProfilePhone] = useState('')
  const [profileMsg, setProfileMsg] = useState<string | null>(null)

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
        setProfileMsg('Profile updated successfully')
      } else {
        setProfileMsg('Failed to update profile')
      }
    } catch {
      setProfileMsg('An error occurred')
    } finally {
      setSaving(false)
    }
  }

  async function handleLogout() {
    await fetch('/api/users/logout', {
      method: 'POST',
      credentials: 'include',
    })
    router.push('/')
    router.refresh()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="text-stone text-sm">Loading...</div>
      </div>
    )
  }

  if (!user) return null

  const addresses = (user.addresses ?? []) as Address[]

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    processing: 'bg-blue-100 text-blue-800',
    shipped: 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  }

  return (
    <div className="min-h-screen bg-cream pt-32 pb-20">
      <div className="max-w-screen-2xl mx-auto px-6 lg:px-12">
        {/* Header */}
        <FadeIn>
          <div className="flex items-center justify-between mb-10">
            <div>
              <h1 className="font-luxury text-4xl font-light text-obsidian m-0 mb-1">My Account</h1>
              <p className="text-stone text-sm m-0">{user.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="text-sm text-stone hover:text-obsidian transition-colors cursor-pointer bg-transparent border-0"
            >
              Sign Out
            </button>
          </div>
        </FadeIn>

        {/* Tabs */}
        <FadeIn delay={0.1}>
          <div className="flex gap-6 mb-10 border-b border-mist/40">
            {[
              { key: 'orders' as Tab, label: 'Orders' },
              { key: 'addresses' as Tab, label: 'Addresses' },
              { key: 'profile' as Tab, label: 'Profile' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`text-sm pb-3 border-b-2 transition-colors cursor-pointer bg-transparent ${
                  activeTab === tab.key
                    ? 'border-gold text-gold font-medium'
                    : 'border-transparent text-stone hover:text-obsidian'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </FadeIn>

        <AnimatePresence mode="wait">
          {/* Orders */}
          {activeTab === 'orders' && (
            <motion.div
              key="orders"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              {orders.length > 0 ? (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="bg-white p-6 rounded-sm border border-mist/40">
                      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                        <div>
                          <p className="text-sm font-medium text-obsidian m-0">
                            Order #{order.orderNumber}
                          </p>
                          <p className="text-xs text-stone m-0 mt-1">
                            {new Date(order.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span
                            className={`text-xs px-3 py-1 rounded-full font-medium ${statusColors[order.status] || 'bg-gray-100 text-gray-700'}`}
                          >
                            {order.status}
                          </span>
                          <p className="text-sm font-medium text-obsidian m-0">
                            {order.currency} {order.totals?.total?.toFixed(2)}
                          </p>
                        </div>
                      </div>

                      <div className="text-xs text-stone">
                        {(order.items ?? []).length} item
                        {(order.items ?? []).length !== 1 ? 's' : ''}
                        {order.type === 'b2b' && (
                          <span className="ml-2 text-gold font-medium">B2B</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20">
                  <p className="text-stone text-lg m-0 mb-4">No orders yet</p>
                  <Link
                    href="/products"
                    className="text-sm text-gold no-underline hover:underline font-medium"
                  >
                    Start shopping
                  </Link>
                </div>
              )}
            </motion.div>
          )}

          {/* Addresses */}
          {activeTab === 'addresses' && (
            <motion.div
              key="addresses"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              {addresses.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {addresses.map((addr, i) => (
                    <div
                      key={addr.id || i}
                      className={`p-6 rounded-sm border ${
                        addr.isDefault ? 'border-gold bg-gold/5' : 'border-mist/40 bg-white'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <p className="text-sm font-medium text-obsidian m-0">
                          {addr.label || `Address ${i + 1}`}
                        </p>
                        {addr.isDefault && (
                          <span className="text-xs text-gold font-medium">Default</span>
                        )}
                      </div>
                      <p className="text-sm text-stone m-0 leading-relaxed">
                        {addr.line1}
                        {addr.line2 && (
                          <>
                            <br />
                            {addr.line2}
                          </>
                        )}
                        <br />
                        {addr.city}
                        {addr.state ? `, ${addr.state}` : ''} {addr.postalCode}
                        <br />
                        {addr.country}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20">
                  <p className="text-stone text-lg m-0">No saved addresses</p>
                </div>
              )}
            </motion.div>
          )}

          {/* Profile */}
          {activeTab === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <form onSubmit={handleProfileUpdate} className="max-w-lg space-y-6">
                {profileMsg && (
                  <div className="bg-forest/10 text-forest text-sm px-4 py-3 rounded-sm">
                    {profileMsg}
                  </div>
                )}

                <div>
                  <label className="block text-xs uppercase tracking-wider text-stone mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={user.email}
                    disabled
                    className="w-full bg-mist/30 border border-mist text-stone text-sm px-4 py-3 rounded-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-stone mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="w-full bg-transparent border border-mist text-obsidian text-sm px-4 py-3 rounded-sm outline-none focus:border-gold transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-stone mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={profilePhone}
                    onChange={(e) => setProfilePhone(e.target.value)}
                    className="w-full bg-transparent border border-mist text-obsidian text-sm px-4 py-3 rounded-sm outline-none focus:border-gold transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="bg-gold text-obsidian text-sm font-medium uppercase tracking-widest px-10 py-4 rounded-sm border-0 cursor-pointer hover:bg-gold-light transition-colors disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
