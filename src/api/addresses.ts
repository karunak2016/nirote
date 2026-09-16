import { apiClient } from './client'
import type { Address, AddressRequest } from '../types'

export const addressesApi = {
  list: () =>
    apiClient.get<Address[]>('/addresses').then((r) => r.data),

  create: (data: AddressRequest) =>
    apiClient.post<{ id: number }>('/addresses', data).then((r) => r.data),

  update: (id: number, data: AddressRequest) =>
    apiClient.post(`/addresses/update/${id}`, data).then((r) => r.data),

  setDefault: (id: number) =>
    apiClient.post(`/addresses/default/${id}`).then((r) => r.data),

  remove: (id: number) =>
    apiClient.post(`/addresses/delete/${id}`).then((r) => r.data),
}
