import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ChevronLeft, RotateCcw, X, Clock, Package } from 'lucide-react'
import type { Order, ReturnRequest } from '../types'
import { ordersApi } from '../api/orders'
import { returnsApi } from '../api/returns'
import { Button } from '../components/ui/Button'
import { Spinner } from '../components/ui/Spinner'

const BG = '#FAF8F4'
const GOLD = '#C9A227'
const TEXT = '#1A1A1A'
const SECOND = '#6A6A6A'
const BORDER = '#ECE7DF'

const RETURN_REASONS = [
  'Wrong item received',
  'Item damaged / defective',
  'Poor quality',
  'Size / colour mismatch',
  'Changed my mind',
  'Other',
]

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string }> = {
    Pending:   { bg: '#FFF8E7', color: '#B08A30' },
    Confirmed: { bg: '#EAF4FF', color: '#1A6BB0' },
    Shipped:   { bg: '#EAF4FF', color: '#1A6BB0' },
    Delivered: { bg: '#EAFAF0', color: '#2E8B57' },
    Cancelled: { bg: '#FFEEEE', color: '#C0392B' },
    Returned:  { bg: '#F5F5F5', color: '#666' },
  }
  const style = map[status] ?? { bg: '#F5F5F5', color: '#666' }
  return (
    <span className="px-3 py-1 rounded-full text-[12px] font-semibold"
      style={{ background: style.bg, color: style.color }}>
      {status}
    </span>
  )
}

function getReturnWindow(deliveredAt?: string) {
  if (!deliveredAt) return { isOpen: false, hoursLeft: 0, minutesLeft: 0, deadline: null }
  const delivered = new Date(deliveredAt)
  const deadline = new Date(delivered.getTime() + 48 * 60 * 60 * 1000)
  const now = new Date()
  const msLeft = deadline.getTime() - now.getTime()
  if (msLeft <= 0) return { isOpen: false, hoursLeft: 0, minutesLeft: 0, deadline }
  const hoursLeft = Math.floor(msLeft / (1000 * 60 * 60))
  const minutesLeft = Math.floor((msLeft % (1000 * 60 * 60)) / (1000 * 60))
  return { isOpen: true, hoursLeft, minutesLeft, deadline }
}

function returnStatusStyle(status: string) {
  if (status === 'Approved') return { bg: '#EAFAF0', color: '#2E8B57' }
  if (status === 'Rejected') return { bg: '#FFEEEE', color: '#C0392B' }
  return { bg: '#FFF8E7', color: '#B08A30' }
}

export function OrderDetail() {
  const { id } = useParams<{ id: string }>()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [cancelReason, setCancelReason] = useState('')

  const [returnRequest, setReturnRequest] = useState<ReturnRequest | null>(null)
  const [showReturnForm, setShowReturnForm] = useState(false)
  const [returnReason, setReturnReason] = useState(RETURN_REASONS[0])
  const [returnDescription, setReturnDescription] = useState('')
  const [submittingReturn, setSubmittingReturn] = useState(false)
  const [returnSuccess, setReturnSuccess] = useState('')
  const [returnError, setReturnError] = useState('')

  useEffect(() => {
    if (!id) return
    ordersApi.getById(Number(id))
      .then((o) => {
        setOrder(o)
        if (o.orderStatus === 'Delivered') {
          returnsApi.getByOrder(o.id).then(setReturnRequest).catch(() => {})
        }
      })
      .finally(() => setLoading(false))
  }, [id])

  async function handleCancel() {
    if (!order) return
    setCancelling(true)
    try {
      await ordersApi.cancel(order.id, cancelReason || undefined)
      setOrder((prev) => prev ? { ...prev, orderStatus: 'Cancelled' } : null)
      setShowCancelModal(false)
    } finally {
      setCancelling(false)
    }
  }

  async function handleSubmitReturn(e: React.FormEvent) {
    e.preventDefault()
    if (!order) return
    setSubmittingReturn(true)
    setReturnError('')
    try {
      const res = await returnsApi.create({
        orderId: order.id,
        reason: returnReason,
        description: returnDescription.trim() || undefined,
      })
      setReturnSuccess(res.message)
      setShowReturnForm(false)
      const updated = await returnsApi.getByOrder(order.id)
      setReturnRequest(updated)
    } catch (err: any) {
      setReturnError(err?.response?.data?.error ?? 'Failed to submit return request.')
    } finally {
      setSubmittingReturn(false)
    }
  }

  if (loading) return <div className="flex justify-center py-32"><Spinner size="lg" /></div>

  if (!order) {
    return (
      <div className="py-32 text-center" style={{ background: BG }}>
        <p style={{ color: SECOND }}>Order not found.</p>
        <Link to="/orders" className="mt-4 inline-block underline hover:opacity-80" style={{ color: GOLD }}>Back to orders</Link>
      </div>
    )
  }

  const canCancel = order.orderStatus === 'Pending' || order.orderStatus === 'Confirmed'
  const returnWindow = getReturnWindow(order.deliveredAt)
  const canReturn = order.orderStatus === 'Delivered' && order.paymentStatus === 'Paid' && !returnRequest && returnWindow.isOpen

  const sectionCls = 'rounded-2xl bg-white p-5'
  const sectionStyle = { border: `1px solid ${BORDER}` }

  return (
    <div className="min-h-screen" style={{ background: BG }}>
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <Link to="/orders" className="mb-6 inline-flex items-center gap-1 text-[13px] font-medium transition-opacity hover:opacity-70" style={{ color: SECOND }}>
          <ChevronLeft className="h-4 w-4" /> My Orders
        </Link>

        {/* Order header */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="font-serif text-[28px] font-bold" style={{ color: TEXT }}>Order #{order.id}</h1>
            <p className="mt-1 text-[13px]" style={{ color: SECOND }}>
              Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <StatusBadge status={order.orderStatus} />
            <span className="px-3 py-1 rounded-full text-[12px] font-semibold"
              style={order.paymentStatus === 'Paid' ? { background: '#EAFAF0', color: '#2E8B57' } : { background: '#FFF8E7', color: '#B08A30' }}>
              {order.paymentStatus}
            </span>
          </div>
        </div>

        <div className="space-y-4">
          {/* Items */}
          <div className={sectionCls} style={sectionStyle}>
            <h2 className="font-semibold text-[15px] mb-4 flex items-center gap-2" style={{ color: TEXT }}>
              <Package className="h-4 w-4" style={{ color: GOLD }} /> Items
            </h2>
            <div className="divide-y" style={{ borderColor: BORDER }}>
              {order.items?.map((item) => (
                <div key={item.productId} className="flex gap-4 py-4">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.productName}
                      className="h-20 w-16 rounded-xl object-cover object-top" />
                  ) : (
                    <div className="h-20 w-16 rounded-xl" style={{ background: '#F7F4EF' }} />
                  )}
                  <div className="flex flex-1 justify-between">
                    <div>
                      <Link to={`/products/${item.productId}`}
                        className="text-[14px] font-medium hover:opacity-80 transition-opacity" style={{ color: TEXT }}>
                        {item.productName}
                      </Link>
                      <p className="text-[13px] mt-0.5" style={{ color: SECOND }}>Qty: {item.quantity}</p>
                      <p className="text-[13px]" style={{ color: SECOND }}>₹{item.unitPrice.toLocaleString('en-IN')} each</p>
                    </div>
                    <p className="text-[14px] font-semibold" style={{ color: TEXT }}>₹{item.subtotal.toLocaleString('en-IN')}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 space-y-1.5 text-[13px]" style={{ borderTop: `1px solid ${BORDER}` }}>
              <div className="flex justify-between" style={{ color: SECOND }}>
                <span>Subtotal</span><span>₹{order.totalAmount.toLocaleString('en-IN')}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span><span>-₹{order.discountAmount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between" style={{ color: SECOND }}>
                <span>Shipping</span>
                <span className={order.shippingFee === 0 ? 'text-green-600' : ''}>
                  {order.shippingFee === 0 ? 'FREE' : `₹${order.shippingFee.toLocaleString('en-IN')}`}
                </span>
              </div>
              <div className="flex justify-between font-semibold pt-1" style={{ borderTop: `1px solid ${BORDER}`, color: TEXT }}>
                <span>Total</span>
                <span style={{ color: GOLD }}>₹{order.finalAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Tracking */}
          {order.awbCode && (
            <div className={sectionCls} style={sectionStyle}>
              <h2 className="font-semibold text-[15px] mb-2" style={{ color: TEXT }}>Tracking</h2>
              <p className="text-[13px]" style={{ color: SECOND }}>AWB: <span className="font-medium" style={{ color: TEXT }}>{order.awbCode}</span></p>
            </div>
          )}

          {/* Payment */}
          <div className={sectionCls} style={sectionStyle}>
            <h2 className="font-semibold text-[15px] mb-2" style={{ color: TEXT }}>Payment</h2>
            <p className="text-[13px]" style={{ color: SECOND }}>Method: <span style={{ color: TEXT }}>{order.paymentMethod}</span></p>
            <p className="text-[13px] mt-1" style={{ color: SECOND }}>Status: <span style={{ color: TEXT }}>{order.paymentStatus}</span></p>
          </div>

          {/* Return window */}
          {order.orderStatus === 'Delivered' && !returnRequest && (
            <div className="rounded-2xl p-4 flex items-start gap-3"
              style={returnWindow.isOpen
                ? { background: '#FFFBEB', border: '1px solid #FCD34D' }
                : { background: '#F9FAFB', border: `1px solid ${BORDER}` }}>
              <Clock className="h-4 w-4 mt-0.5 shrink-0" style={{ color: returnWindow.isOpen ? '#B08A30' : SECOND }} />
              <div>
                {returnWindow.isOpen ? (
                  <>
                    <p className="text-[13px] font-medium" style={{ color: '#92400E' }}>
                      Return window open — {returnWindow.hoursLeft}h {returnWindow.minutesLeft}m remaining
                    </p>
                    <p className="text-[12px] mt-0.5" style={{ color: '#B45309' }}>
                      You can request a return until{' '}
                      {returnWindow.deadline!.toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-[13px] font-medium" style={{ color: TEXT }}>Return window closed</p>
                    <p className="text-[12px] mt-0.5" style={{ color: SECOND }}>Returns must be requested within 48 hours of delivery.</p>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Return status */}
          {returnRequest && (
            <div className={sectionCls} style={sectionStyle}>
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold text-[15px]" style={{ color: TEXT }}>Return Request</h2>
                <span className="px-3 py-1 rounded-full text-[11px] font-semibold"
                  style={returnStatusStyle(returnRequest.status)}>
                  {returnRequest.status}
                </span>
              </div>
              <p className="text-[13px]" style={{ color: SECOND }}><span className="font-medium" style={{ color: TEXT }}>Reason:</span> {returnRequest.reason}</p>
              {returnRequest.description && (
                <p className="text-[13px] mt-1" style={{ color: SECOND }}><span className="font-medium" style={{ color: TEXT }}>Details:</span> {returnRequest.description}</p>
              )}
              {returnRequest.adminNote && (
                <p className="mt-2 text-[13px] rounded-xl p-3" style={{ background: BG, color: SECOND }}>
                  <span className="font-medium" style={{ color: TEXT }}>Admin note:</span> {returnRequest.adminNote}
                </p>
              )}
              <p className="mt-2 text-[12px]" style={{ color: SECOND }}>
                Submitted on {new Date(returnRequest.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            </div>
          )}

          {/* Return success */}
          {returnSuccess && (
            <div className="rounded-2xl p-4 text-[13px] text-green-700 bg-green-50 border border-green-200">
              {returnSuccess}
            </div>
          )}

          {/* Return form */}
          {showReturnForm && (
            <div className={sectionCls} style={{ border: `1px solid ${GOLD}` }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-[15px]" style={{ color: TEXT }}>Request a Return</h2>
                <button onClick={() => setShowReturnForm(false)} className="transition-opacity hover:opacity-60" style={{ color: SECOND }}>
                  <X className="h-4 w-4" />
                </button>
              </div>
              <form onSubmit={handleSubmitReturn} className="space-y-4">
                <div>
                  <label className="block text-[12px] font-semibold uppercase tracking-[0.15em] mb-1.5" style={{ color: TEXT }}>Reason for return</label>
                  <select value={returnReason} onChange={(e) => setReturnReason(e.target.value)}
                    className="w-full rounded-xl border px-3 py-2.5 text-[14px] bg-white focus:outline-none"
                    style={{ borderColor: BORDER }}>
                    {RETURN_REASONS.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[12px] font-semibold uppercase tracking-[0.15em] mb-1.5" style={{ color: TEXT }}>Additional details (optional)</label>
                  <textarea rows={3} placeholder="Describe the issue in more detail..."
                    value={returnDescription} onChange={(e) => setReturnDescription(e.target.value)}
                    className="w-full rounded-xl border px-3 py-2.5 text-[14px] focus:outline-none resize-none bg-white"
                    style={{ borderColor: BORDER }} />
                </div>
                {returnError && <p className="text-[12px] text-red-600">{returnError}</p>}
                <div className="rounded-xl p-3 text-[12px]" style={{ background: '#FFFBEB', color: '#B08A30', border: '1px solid #FCD34D' }}>
                  Return requests must be submitted within <strong>48 hours of delivery</strong>. Our team will review within 2–3 business days.
                </div>
                <div className="flex gap-3">
                  <Button type="submit" loading={submittingReturn} className="rounded-full">Submit Return Request</Button>
                  <Button type="button" variant="outline" onClick={() => setShowReturnForm(false)} className="rounded-full">Cancel</Button>
                </div>
              </form>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-3 pt-2">
            {canCancel && (
              <Button variant="danger" onClick={() => { setCancelReason(''); setShowCancelModal(true) }} className="rounded-full">
                Cancel Order
              </Button>
            )}
            {canReturn && !showReturnForm && (
              <Button variant="outline" onClick={() => setShowReturnForm(true)} className="rounded-full">
                <RotateCcw className="h-4 w-4" /> Request Return
              </Button>
            )}
            <Link to="/products">
              <Button variant="outline" className="rounded-full">Continue Shopping</Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: 'rgba(0,0,0,0.4)' }}
          onClick={() => !cancelling && setShowCancelModal(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6"
            onClick={e => e.stopPropagation()}>
            <h3 className="font-serif text-xl font-bold mb-1" style={{ color: '#1A1008' }}>Cancel Order #{order?.id}?</h3>
            <p className="text-sm text-gray-500 mb-5">This action cannot be undone. You'll receive a confirmation email.</p>

            <label className="block text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1.5">
              Reason (optional)
            </label>
            <textarea
              value={cancelReason}
              onChange={e => setCancelReason(e.target.value)}
              placeholder="Tell us why you're cancelling..."
              rows={3}
              className="w-full text-sm border rounded-xl px-4 py-3 resize-none focus:outline-none focus:ring-1"
              style={{ borderColor: '#E8E3DB', color: '#1A1008' }}
            />

            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowCancelModal(false)} disabled={cancelling}
                className="flex-1 py-3 rounded-full text-sm font-semibold border transition-colors hover:bg-gray-50"
                style={{ borderColor: '#D4C5A9', color: '#1A1008' }}>
                Keep Order
              </button>
              <button onClick={handleCancel} disabled={cancelling}
                className="flex-1 py-3 rounded-full text-sm font-semibold text-white transition-opacity hover:opacity-90"
                style={{ background: cancelling ? '#ccc' : '#C0392B' }}>
                {cancelling ? 'Cancelling…' : 'Yes, Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
