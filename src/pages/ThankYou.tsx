import { useEffect, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { CheckCircle, Package, Tag, Truck, MapPin } from 'lucide-react'
import { ordersApi } from '../api/orders'
import type { Order } from '../types'

const GOLD = '#C9A227'

export function ThankYou() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) { navigate('/'); return }
    ordersApi.getById(Number(id))
      .then(setOrder)
      .catch(() => navigate('/'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#FAFAF8' }}>
        <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: GOLD, borderTopColor: 'transparent' }} />
      </div>
    )
  }

  if (!order) return null

  const subtotal   = order.totalAmount ?? 0
  const discount   = order.discountAmount ?? 0
  const shipping   = order.shippingFee ?? 0
  const total      = order.finalAmount ?? 0

  return (
    <div className="min-h-screen py-16 px-4" style={{ background: '#FAFAF8' }}>
      <div className="max-w-xl mx-auto">

        {/* Success header */}
        <div className="text-center mb-10">
          <div className="flex justify-center mb-5">
            <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: '#EEF7EE' }}>
              <CheckCircle className="w-10 h-10" style={{ color: '#2E7D32' }} />
            </div>
          </div>
          <h1 className="font-serif text-3xl font-bold mb-2" style={{ color: '#1A1008' }}>
            Thank you for your purchase!
          </h1>
          <p className="text-gray-500 text-sm">
            Order <span className="font-semibold text-gray-700">#{order.id}</span> has been placed successfully.
            A confirmation email has been sent to you.
          </p>
        </div>

        {/* Order summary card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-5">

          {/* Items */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <Package className="w-4 h-4 text-gray-400" />
              <span className="text-xs font-semibold uppercase tracking-widest text-gray-400">Items Ordered</span>
            </div>
            <div className="space-y-3">
              {order.items?.map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.productName}
                      className="w-14 h-14 object-cover object-top rounded-lg flex-shrink-0"
                      style={{ background: '#F5F0E8' }} />
                  ) : (
                    <div className="w-14 h-14 rounded-lg flex-shrink-0 flex items-center justify-center" style={{ background: '#F5F0E8' }}>
                      <Package className="w-5 h-5 text-gray-300" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{item.productName}</p>
                    <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                  </div>
                  <p className="text-sm font-semibold text-gray-700 flex-shrink-0">₹{(item.subtotal ?? item.unitPrice * item.quantity).toLocaleString('en-IN')}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing */}
          <div className="p-6 border-b border-gray-100 space-y-2">
            <div className="flex justify-between text-sm text-gray-500">
              <span>Subtotal</span>
              <span>₹{subtotal.toLocaleString('en-IN')}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-sm items-center">
                <span className="flex items-center gap-1 text-green-600">
                  <Tag className="w-3 h-3" /> Discount
                </span>
                <span className="text-green-600 font-medium">–₹{discount.toLocaleString('en-IN')}</span>
              </div>
            )}
            <div className="flex justify-between text-sm text-gray-500">
              <span className="flex items-center gap-1"><Truck className="w-3 h-3" /> Shipping</span>
              {shipping > 0 ? <span>₹{shipping.toLocaleString('en-IN')}</span> : <span className="text-green-600 font-medium">FREE</span>}
            </div>
            <div className="flex justify-between font-bold text-base pt-2 border-t border-gray-100">
              <span style={{ color: '#1A1008' }}>Total Paid</span>
              <span style={{ color: GOLD }}>₹{total.toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Payment & Address */}
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">Payment</p>
              <p className="text-gray-700 font-medium">{order.paymentMethod}</p>
              <p className="text-xs text-gray-400 mt-0.5">{order.paymentStatus}</p>
            </div>
            {order.addressLine1 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> Deliver To
                </p>
                <p className="text-gray-700 font-medium leading-relaxed">
                  {order.deliveryName && <span className="block">{order.deliveryName}</span>}
                  <span className="block">{order.addressLine1}{order.addressLine2 ? `, ${order.addressLine2}` : ''}</span>
                  <span className="block">{order.city}, {order.state} – {order.pincode}</span>
                  {order.deliveryPhone && <span className="block text-gray-400 text-xs mt-0.5">{order.deliveryPhone}</span>}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link to={`/orders/${order.id}`}
            className="flex-1 text-center py-3 rounded-full text-sm font-semibold border transition-colors hover:bg-gray-50"
            style={{ borderColor: '#D4C5A9', color: '#1A1008' }}>
            View Order Details
          </Link>
          <Link to="/products"
            className="flex-1 text-center py-3 rounded-full text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: GOLD }}>
            Continue Shopping
          </Link>
        </div>

      </div>
    </div>
  )
}
