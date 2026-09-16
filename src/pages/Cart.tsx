import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react'
import { cartApi } from '../api/cart'
import { couponsApi, type BankOffer } from '../api/coupons'
import { settingsApi } from '../api/settings'
import { useCartStore } from '../stores/cartStore'
import { useAuthStore } from '../stores/authStore'
import { Spinner } from '../components/ui/Spinner'

const BG = '#FAF8F4'
const GOLD = '#C9A227'
const TEXT = '#1A1A1A'
const SECOND = '#6A6A6A'
const BORDER = '#ECE7DF'

export function Cart() {
  const { cart, setCart, itemCount } = useCartStore()
  const { isAuthenticated } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [bankOffers, setBankOffers] = useState<BankOffer[]>([])
  const [shippingFeeRate, setShippingFeeRate] = useState(99)
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(1999)

  useEffect(() => {
    couponsApi.getBankOffers().then(setBankOffers).catch(() => {})
    settingsApi.getShipping().then(s => { setShippingFeeRate(s.shippingFee); setFreeShippingThreshold(s.freeShippingThreshold) }).catch(() => {})
    if (!isAuthenticated) { setLoading(false); return }
    cartApi.get().then(setCart).finally(() => setLoading(false))
  }, [isAuthenticated, setCart])

  async function handleUpdateQty(itemId: number, qty: number) {
    if (qty < 1) return
    const updated = await cartApi.updateItem(itemId, qty)
    setCart(updated)
  }

  async function handleRemove(itemId: number) {
    const updated = await cartApi.removeItem(itemId)
    setCart(updated)
  }

  if (loading) return <div className="flex justify-center py-32"><Spinner size="lg" /></div>

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center gap-5 py-32 text-center px-4" style={{ background: BG }}>
        <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: '#F5EDD4' }}>
          <ShoppingBag className="h-8 w-8" style={{ color: GOLD }} />
        </div>
        <p className="text-[15px]" style={{ color: SECOND }}>Please login to view your cart</p>
        <Link to="/login"
          className="px-8 py-3 text-[13px] font-semibold text-white rounded-full transition-opacity hover:opacity-90"
          style={{ background: GOLD }}>
          Login
        </Link>
      </div>
    )
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-5 py-32 text-center px-4" style={{ background: BG }}>
        <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: '#F5EDD4' }}>
          <ShoppingBag className="h-8 w-8" style={{ color: GOLD }} />
        </div>
        <p className="text-[18px] font-medium" style={{ color: TEXT }}>Your bag is empty</p>
        <p className="text-[14px]" style={{ color: SECOND }}>Add some beautiful jewellery to get started.</p>
        <Link to="/products"
          className="mt-2 px-8 py-3 text-[13px] font-semibold text-white rounded-full transition-opacity hover:opacity-90"
          style={{ background: GOLD }}>
          Browse Jewellery
        </Link>
      </div>
    )
  }

  const shippingFee = cart.total >= freeShippingThreshold ? 0 : shippingFeeRate
  const orderTotal = cart.total + shippingFee

  return (
    <div className="min-h-screen" style={{ background: BG }}>
      {/* Header */}
      <section className="py-14 text-center px-6" style={{ borderBottom: `1px solid ${BORDER}` }}>
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] mb-2" style={{ color: GOLD }}>My</p>
        <h1 className="font-serif text-[36px] sm:text-[44px] font-bold" style={{ color: TEXT }}>Shopping Bag</h1>
      </section>

      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">

          {/* Items */}
          <div className="lg:col-span-2 rounded-2xl bg-white overflow-hidden" style={{ border: `1px solid ${BORDER}` }}>
            {cart.items.map((item, idx) => (
              <div key={item.id} className="flex gap-4 p-5"
                style={{ borderBottom: idx < cart.items.length - 1 ? `1px solid ${BORDER}` : 'none' }}>
                <Link to={`/products/${item.productId}`}
                  className="flex-shrink-0 rounded-xl overflow-hidden flex items-center justify-center"
                  style={{ width: 80, height: 104, background: '#F7F4EF' }}>
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.productName}
                      className="w-full h-full object-cover object-top" />
                  ) : (
                    <ShoppingBag className="h-7 w-7" style={{ color: '#C9A22750' }} />
                  )}
                </Link>
                <div className="flex flex-1 flex-col justify-between">
                  <div>
                    <Link to={`/products/${item.productId}`}
                      className="text-[14px] font-medium hover:opacity-80 transition-opacity" style={{ color: TEXT }}>
                      {item.productName}
                    </Link>
                    <p className="mt-1 text-[15px] font-bold" style={{ color: GOLD }}>₹{item.unitPrice.toLocaleString('en-IN')}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 rounded-full border" style={{ borderColor: BORDER }}>
                      <button onClick={() => handleUpdateQty(item.id, item.quantity - 1)} disabled={item.quantity <= 1}
                        className="w-8 h-8 flex items-center justify-center transition-opacity hover:opacity-60 disabled:opacity-30"
                        style={{ color: TEXT }}>
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-7 text-center text-[14px] font-medium" style={{ color: TEXT }}>{item.quantity}</span>
                      <button onClick={() => handleUpdateQty(item.id, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center transition-opacity hover:opacity-60"
                        style={{ color: TEXT }}>
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[14px] font-semibold" style={{ color: TEXT }}>₹{item.subtotal.toLocaleString('en-IN')}</span>
                      <button onClick={() => handleRemove(item.id)}
                        className="w-8 h-8 flex items-center justify-center rounded-full transition-colors hover:bg-red-50"
                        style={{ color: SECOND }}>
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="rounded-2xl bg-white p-6 h-fit" style={{ border: `1px solid ${BORDER}` }}>
            <h2 className="font-serif text-[20px] font-bold mb-5" style={{ color: TEXT }}>Order Summary</h2>
            <div className="space-y-2.5 text-[14px]">
              <div className="flex justify-between">
                <span style={{ color: SECOND }}>Subtotal ({itemCount} items)</span>
                <span style={{ color: TEXT }}>₹{cart.total.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: SECOND }}>Shipping</span>
                <span className={shippingFee === 0 ? 'text-green-600' : ''} style={shippingFee !== 0 ? { color: TEXT } : {}}>
                  {shippingFee === 0 ? 'FREE' : `₹${shippingFeeRate}`}
                </span>
              </div>
            </div>

            {cart.total < freeShippingThreshold && (
              <p className="mt-3 text-[12px] rounded-xl p-3" style={{ background: '#F5EDD4', color: '#9a7830' }}>
                Add ₹{(freeShippingThreshold - cart.total).toLocaleString('en-IN')} more for free shipping!
              </p>
            )}

            <div className="mt-4 pt-4 flex justify-between font-bold text-[16px]" style={{ borderTop: `1px solid ${BORDER}`, color: TEXT }}>
              <span>Total</span>
              <span style={{ color: GOLD }}>₹{orderTotal.toLocaleString('en-IN')}</span>
            </div>

            {bankOffers.length > 0 && (
              <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50 p-3 space-y-2">
                <p className="text-[11px] font-semibold text-blue-700 uppercase tracking-wide">Bank Card Offers</p>
                {bankOffers.map((offer) => (
                  <p key={offer.id} className="text-[12px] text-blue-800">
                    <span className="font-semibold">{offer.bankName}:</span>{' '}
                    {offer.description}
                    {offer.code && <> — <span className="font-mono font-bold bg-blue-100 px-1 rounded">{offer.code}</span></>}
                  </p>
                ))}
              </div>
            )}

            <Link to="/checkout" className="block mt-5">
              <button className="w-full py-3.5 text-[14px] font-semibold text-white rounded-full transition-opacity hover:opacity-90"
                style={{ background: GOLD }}>
                Proceed to Checkout
              </button>
            </Link>
            <Link to="/products" className="block mt-3 text-center text-[13px] transition-opacity hover:opacity-70" style={{ color: SECOND }}>
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
