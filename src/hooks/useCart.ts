import { type Product } from '@/server/payload-types'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

export interface CartItem {
  product: Product
}

export interface CartState {
  items: CartItem[]
  addItem: (product: Product) => void
  removeItem: (productId: string) => void
  clearCart: () => void
}

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (product) => {
        set((state) => {
          return { items: [...state.items, { product }] }
        })
      },
      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter(e => e.product.id !== id)
        }))
      },
      clearCart: () => { set({ items: [] }) }
    }

    ), { name: 'cart-storage', storage: createJSONStorage(() => localStorage) })
)
