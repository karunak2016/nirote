import { apiClient } from './client'

export const analyticsApi = {
  trackView: (productId: number, userId?: number) => {
    const sessionId = getSessionId()
    const referrer = document.referrer || ''
    return apiClient
      .post('/analytics/track', { productId, referrer, sessionId, userId: userId ?? null })
      .catch(() => {}) // never crash the page if tracking fails
  },
}

function getSessionId(): string {
  const key = 'nr_sid'
  let sid = sessionStorage.getItem(key)
  if (!sid) {
    sid = Math.random().toString(36).slice(2) + Date.now().toString(36)
    sessionStorage.setItem(key, sid)
  }
  return sid
}
