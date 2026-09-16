import { apiClient } from './client'
import type { RazorpayOrderResponse, VerifyPaymentRequest } from '../types'

export const paymentApi = {
  createOrder: (orderId: number) =>
    apiClient
      .post<RazorpayOrderResponse>('/payment/create-order', { orderId })
      .then((r) => r.data),

  verify: (data: VerifyPaymentRequest) =>
    apiClient.post('/payment/verify', data).then((r) => r.data),
}
