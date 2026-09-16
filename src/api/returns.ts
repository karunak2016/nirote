import { apiClient } from './client'
import type { ReturnRequest } from '../types'

export const returnsApi = {
  create: (data: { orderId: number; reason: string; description?: string }): Promise<{ id: number; message: string }> =>
    apiClient.post<{ id: number; message: string }>('/returns', data).then((r) => r.data),

  getByOrder: (orderId: number): Promise<ReturnRequest | null> =>
    apiClient.get<ReturnRequest | null>(`/returns/order/${orderId}`).then((r) => r.data),

  getMine: (): Promise<ReturnRequest[]> =>
    apiClient.get<ReturnRequest[]>('/returns/my').then((r) => r.data),
}
