import { apiClient } from './client'
import type { AuthResponse, LoginRequest, RegisterRequest, OtpSendRequest, OtpVerifyRequest, FirebaseLoginRequest } from '../types'

export const authApi = {
  register: (data: RegisterRequest) =>
    apiClient.post<AuthResponse>('/auth/register', data).then((r) => r.data),

  login: (data: LoginRequest) =>
    apiClient.post<AuthResponse>('/auth/login', data).then((r) => r.data),

  sendOtp: (data: OtpSendRequest) =>
    apiClient.post('/auth/otp/send', data).then((r) => r.data),

  verifyOtp: (data: OtpVerifyRequest) =>
    apiClient.post<AuthResponse>('/auth/otp/verify', data).then((r) => r.data),

  loginWithFirebase: (data: FirebaseLoginRequest) =>
    apiClient.post<AuthResponse>('/auth/firebase', data).then((r) => r.data),

  updateProfile: (data: { name: string; email: string; phone?: string }) =>
    apiClient.post('/auth/profile/update', data).then((r) => r.data),

  setPassword: (newPassword: string) =>
    apiClient.post('/auth/profile/set-password', { newPassword }).then((r) => r.data),
}
