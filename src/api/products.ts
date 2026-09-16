import { apiClient } from './client'
import type { Product, ProductFilters, ProductListItem, PagedResult } from '../types'

export const productsApi = {
  list: (filters?: ProductFilters) =>
    apiClient
      .get<PagedResult<ProductListItem>>('/products', { params: filters })
      .then((r) => r.data),

  getById: (id: number) =>
    apiClient.get<Product>(`/products/${id}`).then((r) => r.data),

  search: (q: string, page = 1, pageSize = 20) =>
    apiClient
      .get<PagedResult<ProductListItem>>('/products/search', { params: { q, page, pageSize } })
      .then((r) => r.data),
}
