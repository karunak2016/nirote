import { create } from 'zustand'
import type { Cart } from '../types'

interface CartState {
  cart: Cart | null
  itemCount: number
  isOpen: boolean
  setCart: (cart: Cart) => void
  clearCart: () => void
  openDrawer: () => void
  closeDrawer: () => void
}

export const useCartStore = create<CartState>((set) => ({
  cart: null,
  itemCount: 0,
  isOpen: false,

  setCart: (cart) =>
    set({
      cart,
      itemCount: cart.items.reduce((sum, i) => sum + i.quantity, 0),
    }),

  clearCart: () => set({ cart: null, itemCount: 0 }),
  openDrawer: () => set({ isOpen: true }),
  closeDrawer: () => set({ isOpen: false }),
}))
