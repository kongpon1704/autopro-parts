import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CartItem, Profile } from '@/types'

// ============================================================
// AUTH STORE
// ============================================================
interface AuthStore {
  user: Profile | null
  setUser: (user: Profile | null) => void
  isAdmin: () => boolean
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  setUser: (user) => set({ user }),
  isAdmin: () => get().user?.role === 'admin',
}))

// ============================================================
// CART STORE (local state + syncs with API when logged in)
// ============================================================
interface CartStore {
  items: CartItem[]
  isOpen: boolean
  setItems: (items: CartItem[]) => void
  addItem: (item: CartItem) => void
  removeItem: (id: string) => void
  updateQty: (id: string, qty: number) => void
  clearCart: () => void
  toggleCart: () => void
  totalItems: () => number
  subtotal: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      setItems: (items) => set({ items }),
      addItem: (item) => {
        const existing = get().items.find(i => i.product_id === item.product_id)
        if (existing) {
          set({ items: get().items.map(i => i.product_id === item.product_id ? { ...i, quantity: i.quantity + item.quantity } : i) })
        } else {
          set({ items: [...get().items, item] })
        }
      },
      removeItem: (id) => set({ items: get().items.filter(i => i.id !== id) }),
      updateQty: (id, qty) => {
        if (qty <= 0) {
          set({ items: get().items.filter(i => i.id !== id) })
        } else {
          set({ items: get().items.map(i => i.id === id ? { ...i, quantity: qty } : i) })
        }
      },
      clearCart: () => set({ items: [] }),
      toggleCart: () => set({ isOpen: !get().isOpen }),
      totalItems: () => get().items.reduce((s, i) => s + i.quantity, 0),
      subtotal: () => get().items.reduce((s, i) => s + (i.product?.price || 0) * i.quantity, 0),
    }),
    { name: 'autopro-cart', partialize: (state) => ({ items: state.items }) }
  )
)

// ============================================================
// NOTIFICATION STORE
// ============================================================
interface NotifStore {
  count: number
  setCount: (n: number) => void
  decrement: () => void
}

export const useNotifStore = create<NotifStore>((set, get) => ({
  count: 0,
  setCount: (count) => set({ count }),
  decrement: () => set({ count: Math.max(0, get().count - 1) }),
}))
