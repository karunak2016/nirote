import { apiClient } from './client'
import type { Cart, AddToCartRequest } from '../types'

export const cartApi = {
  get: () =>
    apiClient.get<Cart>('/cart').then((r) => r.data),

  addItem: (data: AddToCartRequest) =>
    apiClient.post<Cart>('/cart/items', data).then((r) => r.data),

  updateItem: (id: number, quantity: number) =>
    apiClient.post<Cart>(`/cart/items/update/${id}`, quantity).then((r) => r.data),

  removeItem: (id: number) =>
    apiClient.post<Cart>(`/cart/items/remove/${id}`).then((r) => r.data),

  clear: () =>
    apiClient.post('/cart/clear'),
}
