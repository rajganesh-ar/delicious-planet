'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useCart } from './CartContext'

export function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, subtotal } = useCart()
  const currency = items[0]?.currency ?? 'USD'

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-200 bg-obsidian/30 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
          />

          {/* Drawer */}
          <motion.aside
            className="fixed top-0 right-0 h-full w-full max-w-md bg-cream z-201 flex flex-col shadow-2xl"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 h-20 border-b border-mist/40">
              <h2 className="font-luxury text-xl font-semibold m-0">Your Cart</h2>
              <button
                onClick={closeCart}
                className="p-2 text-obsidian bg-transparent border-0 cursor-pointer hover:text-gold transition-colors"
                aria-label="Close cart"
              >
                <svg
                  width="24"
                  height="24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  viewBox="0 0 24 24"
                >
                  <path d="M18 6 6 18" strokeLinecap="round" />
                  <path d="m6 6 12 12" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-6 py-6">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <svg
                    width="48"
                    height="48"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                    viewBox="0 0 24 24"
                    className="text-stone/40 mb-4"
                  >
                    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                    <path d="M3 6h18" />
                    <path d="M16 10a4 4 0 0 1-8 0" />
                  </svg>
                  <p className="text-stone text-sm m-0">Your cart is empty</p>
                  <button
                    onClick={closeCart}
                    className="mt-4 text-sm text-gold underline bg-transparent border-0 cursor-pointer"
                  >
                    Continue shopping
                  </button>
                </div>
              ) : (
                <ul className="list-none m-0 p-0 space-y-6">
                  {items.map((item) => (
                    <motion.li
                      key={item.productId}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: 40 }}
                      className="flex gap-4"
                    >
                      {item.image && (
                        <Link
                          href={`/products/${item.slug}`}
                          onClick={closeCart}
                          className="shrink-0"
                        >
                          <Image
                            src={item.image}
                            alt={item.title}
                            width={80}
                            height={80}
                            className="rounded-xs object-cover"
                          />
                        </Link>
                      )}
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/products/${item.slug}`}
                          onClick={closeCart}
                          className="text-sm font-medium text-obsidian no-underline hover:text-gold transition-colors truncate block"
                        >
                          {item.title}
                        </Link>
                        <p className="text-xs text-stone m-0 mt-1">
                          {new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: item.currency,
                          }).format(item.price)}
                        </p>

                        <div className="flex items-center gap-3 mt-2">
                          <div className="flex items-center border border-mist rounded-sm">
                            <button
                              onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                              className="w-7 h-7 flex items-center justify-center text-sm bg-transparent border-0 cursor-pointer text-obsidian hover:text-gold"
                              aria-label="Decrease quantity"
                            >
                              −
                            </button>
                            <span className="w-7 h-7 flex items-center justify-center text-xs border-x border-mist">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                              className="w-7 h-7 flex items-center justify-center text-sm bg-transparent border-0 cursor-pointer text-obsidian hover:text-gold"
                              aria-label="Increase quantity"
                            >
                              +
                            </button>
                          </div>
                          <button
                            onClick={() => removeItem(item.productId)}
                            className="text-xs text-stone hover:text-red-600 transition-colors bg-transparent border-0 cursor-pointer underline"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </motion.li>
                  ))}
                </ul>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="px-6 py-6 border-t border-mist/40 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-stone">Subtotal</span>
                  <span className="font-luxury text-lg font-semibold">
                    {new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(
                      subtotal,
                    )}
                  </span>
                </div>
                <p className="text-xs text-stone m-0">Shipping and taxes calculated at checkout.</p>
                <Link
                  href="/checkout"
                  onClick={closeCart}
                  className="block text-center py-3.5 bg-obsidian text-cream text-sm font-medium uppercase tracking-wider rounded-sm no-underline hover:bg-charcoal transition-colors"
                >
                  Checkout
                </Link>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
