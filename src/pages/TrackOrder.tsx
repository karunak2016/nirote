import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Search, Package, CheckCircle, Truck, MapPin } from 'lucide-react'
import type { TrackingInfo } from '../types'
import { shippingApi } from '../api/shipping'
import { Button } from '../components/ui/Button'
import { Spinner } from '../components/ui/Spinner'

export function TrackOrder() {
  const { awbCode: paramAwb } = useParams<{ awbCode?: string }>()
  const navigate = useNavigate()
  const [awb, setAwb] = useState(paramAwb ?? '')
  const [tracking, setTracking] = useState<TrackingInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleTrack(e?: React.FormEvent) {
    e?.preventDefault()
    if (!awb.trim()) return
    setError('')
    setLoading(true)
    try {
      const info = await shippingApi.track(awb.trim())
      setTracking(info)
      navigate(`/track/${awb.trim()}`, { replace: true })
    } catch {
      setError('No tracking information found for this AWB code.')
      setTracking(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="text-center mb-8">
        <Package className="h-12 w-12 text-primary-800 mx-auto mb-3" />
        <h1 className="font-serif text-2xl font-bold text-gray-900">Track Your Order</h1>
        <p className="mt-2 text-sm text-gray-500">Enter your AWB / tracking number to see live shipment status</p>
      </div>

      <form onSubmit={handleTrack} className="flex gap-2">
        <input
          type="text"
          placeholder="Enter AWB number..."
          value={awb}
          onChange={(e) => setAwb(e.target.value)}
          className="flex-1 rounded border border-gray-200 px-4 py-2.5 text-sm focus:border-primary-800 focus:outline-none"
        />
        <Button type="submit" loading={loading}>
          <Search className="h-4 w-4" /> Track
        </Button>
      </form>

      {error && (
        <div className="mt-4 rounded bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {loading && (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      )}

      {tracking && !loading && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">AWB: {tracking.awbCode}</h2>
            <span className="rounded-full bg-primary-100 px-3 py-1 text-sm font-medium text-primary-800">
              {tracking.currentStatus}
            </span>
          </div>

          {tracking.events.length > 0 ? (
            <ol className="relative border-l border-gray-200 pl-6 space-y-6">
              {tracking.events.map((ev, i) => (
                <li key={i} className="relative">
                  <span className="absolute -left-[1.6rem] flex h-5 w-5 items-center justify-center">
                    {i === 0 ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <Truck className="h-4 w-4 text-gray-400" />
                    )}
                  </span>
                  <p className="text-sm font-medium text-gray-900">{ev.activity}</p>
                  <div className="mt-0.5 flex items-center gap-2 text-xs text-gray-400">
                    <MapPin className="h-3 w-3" /> {ev.location}
                    <span>·</span>
                    {new Date(ev.date).toLocaleString('en-IN')}
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-sm text-gray-500 text-center py-8">No tracking events yet.</p>
          )}
        </div>
      )}
    </div>
  )
}
