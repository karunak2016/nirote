import { apiClient } from './client'

export const newsletterApi = {
  subscribe: (email: string) =>
    apiClient.post<{ message: string }>('/newsletter/subscribe', { email }).then((r) => r.data),
}
