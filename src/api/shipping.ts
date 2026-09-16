import { apiClient } from './client'
import type { ServiceabilityResponse, TrackingInfo } from '../types'

export const shippingApi = {
  checkServiceability: (pincode: string) =>
    apiClient
      .get<ServiceabilityResponse>('/shipping/serviceability', { params: { pincode } })
      .then((r) => r.data),

  track: (awbCode: string) =>
    apiClient.get<TrackingInfo>(`/shipping/track/${awbCode}`).then((r) => r.data),
}
