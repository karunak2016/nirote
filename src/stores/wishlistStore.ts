import { create } from 'zustand'
import type { WishlistItem } from '../types'

interface WishlistState {
  items: WishlistItem[]
  setItems: (items: WishlistItem[]) => void
  addItem: (item: WishlistItem) => void
  removeItem: (productId: number) => void
  isWishlisted: (productId: number) => boolean
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
  items: [],
  setItems: (items) => set({ items }),
  addItem: (item) => set((state) => ({ items: [...state.items, item] })),
  removeItem: (productId) => set((state) => ({ items: state.items.filter((i) => i.productId !== productId) })),
  isWishlisted: (productId) => get().items.some((i) => i.productId === productId),
}))
