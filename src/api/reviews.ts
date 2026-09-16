import { apiClient } from './client'
import type { Review, CreateReviewRequest } from '../types'

export const reviewsApi = {
  getFeatured: (count = 6): Promise<Review[]> =>
    apiClient.get<Review[]>(`/reviews/featured?count=${count}`).then((r) => r.data),

  getByProduct: (productId: number): Promise<Review[]> =>
    apiClient.get<Review[]>(`/reviews/product/${productId}`).then((r) => r.data),

  create: (data: CreateReviewRequest): Promise<{ message: string }> =>
    apiClient.post<{ message: string }>('/reviews', data).then((r) => r.data),

  canReview: (productId: number): Promise<{ canReview: boolean }> =>
    apiClient.get<{ canReview: boolean }>(`/reviews/can-review/${productId}`).then((r) => r.data),
}
