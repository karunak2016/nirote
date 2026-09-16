import { apiClient } from './client'
import type { Category } from '../types'

export const categoriesApi = {
  list: () => apiClient.get<Category[]>('/categories').then((r) => r.data),
}
