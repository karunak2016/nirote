import { apiClient } from './client'

export interface CouponValidationResult {
  isValid: boolean
  message: string
  couponId: number | null
  discountAmount: number
  description: string | null
}

export interface ActiveOffer {
  id: number
  description: string
  discountType: 'Percentage' | 'Fixed'
  discountValue: number
  minCartAmount: number | null
  maxDiscount: number | null
  festivalName: string | null
}

export interface BankOffer {
  id: number
  code: string | null
  description: string
  discountType: 'Percentage' | 'Fixed'
  discountValue: number
  bankName: string
  minCartAmount: number | null
  endDate: string | null
}

export const couponsApi = {
  validate: (code: string, cartTotal: number): Promise<CouponValidationResult> =>
    apiClient.post<CouponValidationResult>('/coupons/validate', { code, cartTotal }).then((r) => r.data),

  getActiveOffers: (): Promise<ActiveOffer[]> =>
    apiClient.get<ActiveOffer[]>('/coupons/active-offers').then((r) => r.data),

  getBankOffers: (): Promise<BankOffer[]> =>
    apiClient.get<BankOffer[]>('/coupons/bank-offers').then((r) => r.data),
}
