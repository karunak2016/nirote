import { apiClient } from './client'
import type { WishlistItem } from '../types'

export const wishlistApi = {
  get: () =>
    apiClient.get<WishlistItem[]>('/wishlist').then((r) => r.data),

  // API takes a raw int in the body
  add: (productId: number) =>
    apiClient.post('/wishlist/items', productId).then((r) => r.data),

  remove: (productId: number) =>
    apiClient.post(`/wishlist/items/remove/${productId}`),

  check: (productId: number) =>
    apiClient
      .get<{ isWishlisted: boolean }>(`/wishlist/check/${productId}`)
      .then((r) => r.data),
}
