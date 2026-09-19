import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'

const _rawUrl = import.meta.env.VITE_API_URL ?? import.meta.env.VITE_API_BASE_URL ?? ''
const BASE_URL = _rawUrl
  ? _rawUrl.replace(/\/+$/, '').replace(/\/api$/, '') + '/api'
  : '/api'

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT token from localStorage on every request
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('accessToken')
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// On 401, clear auth and redirect to login
apiClient.interceptors.response.use(
  (res) => res,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('nirote-auth')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  },
)
