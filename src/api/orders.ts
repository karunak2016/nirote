import { apiClient } from './client'
import type { Order, PlaceOrderRequest } from '../types'

export const ordersApi = {
  list: () =>
    apiClient.get<Order[]>('/orders').then((r) => r.data),

  getById: (id: number) =>
    apiClient.get<Order>(`/orders/${id}`).then((r) => r.data),

  // API expects { addressId, paymentMethod }
  place: (data: PlaceOrderRequest) =>
    apiClient.post<Order>('/orders', data).then((r) => r.data),

  cancel: (id: number, reason?: string) =>
    apiClient.post(`/orders/${id}/cancel`, reason ? { reason } : undefined).then((r) => r.data),
}
