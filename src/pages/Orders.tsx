import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Package, ChevronRight } from 'lucide-react'
import type { Order } from '../types'
import { ordersApi } from '../api/orders'
import { useAuthStore } from '../stores/authStore'
import { Spinner } from '../components/ui/Spinner'

const BG = '#FAF8F4'
const GOLD = '#C9A227'
const TEXT = '#1A1A1A'
const SECOND = '#6A6A6A'
const BORDER = '#ECE7DF'

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string }> = {
    Pending:   { bg: '#FFF8E7', color: '#B08A30' },
    Confirmed: { bg: '#EAF4FF', color: '#1A6BB0' },
    Shipped:   { bg: '#EAF4FF', color: '#1A6BB0' },
    Delivered: { bg: '#EAFAF0', color: '#2E8B57' },
    Cancelled: { bg: '#FFEEEE', color: '#C0392B' },
  }
  const style = map[status] ?? { bg: '#F5F5F5', color: '#666' }
  return (
    <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold"
      style={{ background: style.bg, color: style.color }}>
      {status}
    </span>
  )
}

function PaymentBadge({ status }: { status: string }) {
  return (
    <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold"
      style={{ background: status === 'Paid' ? '#EAFAF0' : '#FFF8E7', color: status === 'Paid' ? '#2E8B57' : '#B08A30' }}>
      {status}
    </span>
  )
}

export function Orders() {
  const { isAuthenticated } = useAuthStore()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) { setLoading(false); return }
    ordersApi.list().then(setOrders).finally(() => setLoading(false))
  }, [isAuthenticated])

  if (loading) return <div className="flex justify-center py-32"><Spinner size="lg" /></div>

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center gap-5 py-32 text-center px-4" style={{ background: BG }}>
        <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: '#F5EDD4' }}>
          <Package className="h-8 w-8" style={{ color: GOLD }} />
        </div>
        <p className="text-[15px]" style={{ color: SECOND }}>Login to view your orders</p>
        <Link to="/login"
          className="px-8 py-3 text-[13px] font-semibold text-white rounded-full transition-opacity hover:opacity-90"
          style={{ background: GOLD }}>
          Login
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: BG }}>
      {/* Header */}
      <section className="py-14 text-center px-6" style={{ borderBottom: `1px solid ${BORDER}` }}>
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] mb-2" style={{ color: GOLD }}>My</p>
        <h1 className="font-serif text-[36px] sm:text-[44px] font-bold" style={{ color: TEXT }}>Orders</h1>
      </section>

      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
        {orders.length === 0 ? (
          <div className="flex flex-col items-center gap-5 py-24 text-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: '#F5EDD4' }}>
              <Package className="h-8 w-8" style={{ color: GOLD }} />
            </div>
            <p className="text-[18px] font-medium" style={{ color: TEXT }}>No orders yet</p>
            <p className="text-[14px]" style={{ color: SECOND }}>Your order history will appear here once you make your first purchase.</p>
            <Link to="/products"
              className="mt-2 px-8 py-3 text-[13px] font-semibold text-white rounded-full transition-opacity hover:opacity-90"
              style={{ background: GOLD }}>
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <Link
                key={order.id}
                to={`/orders/${order.id}`}
                className="flex items-center gap-4 rounded-2xl bg-white p-5 transition-shadow hover:shadow-md group"
                style={{ border: `1px solid ${BORDER}` }}>
                <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: '#F5EDD4' }}>
                  <Package className="h-4 w-4" style={{ color: GOLD }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-[14px] font-semibold" style={{ color: TEXT }}>Order #{order.id}</p>
                    <StatusBadge status={order.orderStatus} />
                    <PaymentBadge status={order.paymentStatus} />
                  </div>
                  <p className="text-[12px] mt-0.5" style={{ color: SECOND }}>
                    {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                    {' · '}
                    {order.itemCount ?? order.items?.length ?? 0} item{(order.itemCount ?? order.items?.length ?? 0) !== 1 ? 's' : ''}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <p className="text-[15px] font-bold" style={{ color: GOLD }}>₹{order.finalAmount.toLocaleString('en-IN')}</p>
                  <ChevronRight className="h-4 w-4" style={{ color: SECOND }} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
