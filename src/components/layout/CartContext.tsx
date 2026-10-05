'use client'

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useSyncExternalStore,
  type ReactNode,
} from 'react'
import { MAX_QTY_PER_LINE } from '@/lib/product'

export interface CartItem {
  productId: string
  /** The exact variant bought. Two sizes of one product are two lines. */
  variantSku: string
  /** Variant size label, e.g. "125g". Shown under the title in the basket. */
  size?: string
  title: string
  slug: string
  image?: string
  price: number
  currency: string
  quantity: number
}

/**
 * Basket lines are keyed on product *and* variant. Keying on productId alone
 * silently merged a 30g and a 125g tin into one line at one price.
 */
export type CartLineKey = string

export function lineKey(item: Pick<CartItem, 'productId' | 'variantSku'>): CartLineKey {
  return `${item.productId}::${item.variantSku}`
}

interface CartContextValue {
  items: CartItem[]
  isOpen: boolean
  /**
   * False until the persisted basket has been read on the client. Anything
   * that renders an empty state (e.g. /cart) has to wait for this, or it
   * flashes "your basket is empty" on every load.
   */
  hydrated: boolean
  openCart: () => void
  closeCart: () => void
  toggleCart: () => void
  addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void
  removeItem: (key: CartLineKey) => void
  updateQuantity: (key: CartLineKey, quantity: number) => void
  clearCart: () => void
  totalItems: number
  subtotal: number
}

const CartContext = createContext<CartContextValue | null>(null)

/** Checkout refuses more than this per line, so the basket never holds more. */
const clampQuantity = (quantity: number) => Math.min(Math.max(1, Math.floor(quantity)), MAX_QTY_PER_LINE)

const STORAGE_KEY = 'dp-cart-v2'

/**
 * A persisted v1 basket has no `variantSku`, so its lines cannot be priced
 * against the new schema. Dropping those lines is better than guessing a
 * variant and charging for the wrong size.
 */
function loadCart(): CartItem[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (i): i is CartItem =>
        typeof i === 'object' &&
        i !== null &&
        typeof (i as CartItem).productId === 'string' &&
        typeof (i as CartItem).variantSku === 'string' &&
        typeof (i as CartItem).price === 'number',
    )
  } catch {
    return []
  }
}

function saveCart(items: CartItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch {
    // Storage full or unavailable
  }
}

/**
 * The basket lives in localStorage, which is an external store — so it is read
 * through `useSyncExternalStore` rather than copied into state by a mount
 * effect. React swaps `getServerSnapshot` for `getSnapshot` after hydration,
 * which is what keeps the server's empty basket from tripping a hydration
 * mismatch against a returning visitor's saved one.
 *
 * The `storage` listener is the reason this is a module store rather than a
 * lazy `useState`: it keeps two open tabs from overwriting each other's basket.
 */
const EMPTY: CartItem[] = []

/** `null` means "not read from localStorage yet", not "empty basket". */
let snapshot: CartItem[] | null = null
const listeners = new Set<() => void>()

function emit() {
  for (const listener of listeners) listener()
}

function onStorage(event: StorageEvent) {
  if (event.key !== STORAGE_KEY) return
  // Drop the cache so the next read picks the other tab's write up.
  snapshot = null
  emit()
}

function subscribe(listener: () => void): () => void {
  if (listeners.size === 0) window.addEventListener('storage', onStorage)
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
    if (listeners.size === 0) window.removeEventListener('storage', onStorage)
  }
}

/** Must stay referentially stable between writes or React re-renders forever. */
function getSnapshot(): CartItem[] {
  snapshot ??= loadCart()
  return snapshot
}

function getServerSnapshot(): CartItem[] {
  return EMPTY
}

function setCart(update: (prev: CartItem[]) => CartItem[]) {
  snapshot = update(getSnapshot())
  saveCart(snapshot)
  emit()
}

/**
 * A line's `image` is the URL saved when it was added, and photos change after
 * that: a replaced product photo, the move to R2, a deleted product. Once per
 * page load, re-read each product's current thumbnail and swap any stale URL.
 * Prices are not touched here: checkout re-prices on the server regardless.
 */
let imagesRefreshed = false

async function refreshLineImages() {
  if (imagesRefreshed) return
  imagesRefreshed = true
  const ids = [...new Set(getSnapshot().map((i) => i.productId))]
  if (ids.length === 0) return
  const params = new URLSearchParams({
    'where[id][in]': ids.join(','),
    depth: '1',
    limit: String(ids.length),
    'select[images]': 'true',
  })
  try {
    const res = await fetch(`/api/products?${params}`)
    if (!res.ok) return
    const { docs } = (await res.json()) as {
      docs: Array<{
        id: number | string
        images?: Array<{ image?: { url?: string | null; sizes?: { thumbnail?: { url?: string | null } } } | null }>
      }>
    }
    const current = new Map<string, string>()
    for (const doc of docs) {
      const media = doc.images?.[0]?.image
      const url = media?.sizes?.thumbnail?.url ?? media?.url
      if (url) current.set(String(doc.id), url)
    }
    if (getSnapshot().some((i) => current.has(i.productId) && current.get(i.productId) !== i.image)) {
      setCart((prev) =>
        prev.map((i) => (current.has(i.productId) ? { ...i, image: current.get(i.productId) } : i)),
      )
    }
  } catch {
    // Offline or the API is down: keep the saved URLs; CartThumb falls back.
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const items = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  const [isOpen, setIsOpen] = useState(false)
  // False through the server render and the hydration pass, true from the first
  // client render on — so consumers can hold back a basket count that would
  // otherwise flicker from 0.
  const hydrated = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  )

  useEffect(() => {
    if (hydrated) void refreshLineImages()
  }, [hydrated])

  const openCart = useCallback(() => setIsOpen(true), [])
  const closeCart = useCallback(() => setIsOpen(false), [])
  const toggleCart = useCallback(() => setIsOpen((o) => !o), [])

  const addItem = useCallback((item: Omit<CartItem, 'quantity'>, quantity = 1) => {
    const key = lineKey(item)
    setCart((prev) => {
      const existing = prev.find((i) => lineKey(i) === key)
      if (existing) {
        return prev.map((i) =>
          lineKey(i) === key ? { ...i, quantity: clampQuantity(i.quantity + quantity) } : i,
        )
      }
      return [...prev, { ...item, quantity: clampQuantity(quantity) }]
    })
  }, [])

  const removeItem = useCallback((key: CartLineKey) => {
    setCart((prev) => prev.filter((i) => lineKey(i) !== key))
  }, [])

  const updateQuantity = useCallback((key: CartLineKey, quantity: number) => {
    if (quantity <= 0) {
      setCart((prev) => prev.filter((i) => lineKey(i) !== key))
      return
    }
    setCart((prev) =>
      prev.map((i) => (lineKey(i) === key ? { ...i, quantity: clampQuantity(quantity) } : i)),
    )
  }, [])

  const clearCart = useCallback(() => setCart(() => []), [])

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0)
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        items,
        isOpen,
        hydrated,
        openCart,
        closeCart,
        toggleCart,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        subtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
