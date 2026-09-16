import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Tag, CheckCircle, XCircle, Sparkles, MapPin, CreditCard } from 'lucide-react'
import type { Address, Order, RazorpayPaymentResponse } from '../types'
import { cartApi } from '../api/cart'
import { ordersApi } from '../api/orders'
import { paymentApi } from '../api/payment'
import { addressesApi } from '../api/addresses'
import { couponsApi, type ActiveOffer, type CouponValidationResult } from '../api/coupons'
import { settingsApi } from '../api/settings'
import { useCartStore } from '../stores/cartStore'
import { useAuthStore } from '../stores/authStore'
import { Spinner } from '../components/ui/Spinner'
import { INDIA_STATES, COUNTRIES } from '../lib/locationData'

const BG = '#FAF8F4'
const GOLD = '#C9A227'
const TEXT = '#1A1A1A'
const SECOND = '#6A6A6A'
const BORDER = '#ECE7DF'

const inputCls = 'w-full rounded-xl border px-4 py-2.5 text-[14px] focus:outline-none transition-colors bg-white placeholder:text-gray-400'
const selectCls = 'w-full rounded-xl border px-4 py-2.5 text-[14px] focus:outline-none transition-colors bg-white'

export function Checkout() {
  const navigate = useNavigate()
  const { cart, setCart, clearCart } = useCartStore()
  const { user } = useAuthStore()

  const [addresses, setAddresses] = useState<Address[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<'Razorpay' | 'COD'>('Razorpay')
  const [loading, setLoading] = useState(true)
  const [placing, setPlacing] = useState(false)
  const [placeError, setPlaceError] = useState('')
  const [showNewAddress, setShowNewAddress] = useState(false)
  const [newAddr, setNewAddr] = useState({ fullName: '', phone: '', line1: '', line2: '', city: '', state: '', pincode: '', country: 'India' })

  const [couponCode, setCouponCode] = useState('')
  const [couponResult, setCouponResult] = useState<CouponValidationResult | null>(null)
  const [validating, setValidating] = useState(false)
  const [activeOffers, setActiveOffers] = useState<ActiveOffer[]>([])
  const [shippingFeeRate, setShippingFeeRate] = useState(99)
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(1999)

  useEffect(() => {
    Promise.all([cartApi.get(), addressesApi.list(), couponsApi.getActiveOffers(), settingsApi.getShipping()])
      .then(([c, addrs, offers, shippingConfig]) => {
        setShippingFeeRate(shippingConfig.shippingFee)
        setFreeShippingThreshold(shippingConfig.freeShippingThreshold)
        setCart(c)
        setAddresses(addrs)
        setActiveOffers(offers)
        const def = addrs.find((a) => a.isDefault)
        if (def) setSelectedAddressId(def.id)
      })
      .finally(() => setLoading(false))
  }, [setCart])

  async function handleSaveAddress() {
    const result = await addressesApi.create({ ...newAddr, line2: newAddr.line2 || undefined, isDefault: addresses.length === 0 })
    const fullAddr: Address = {
      id: result.id, userId: 0, fullName: newAddr.fullName, phone: newAddr.phone,
      line1: newAddr.line1, line2: newAddr.line2 || undefined,
      city: newAddr.city, state: newAddr.state, pincode: newAddr.pincode,
      country: newAddr.country,
      isDefault: addresses.length === 0,
    }
    setAddresses((prev) => [...prev, fullAddr])
    setSelectedAddressId(result.id)
    setShowNewAddress(false)
    setNewAddr({ fullName: '', phone: '', line1: '', line2: '', city: '', state: '', pincode: '', country: 'India' })
  }

  async function handleValidateCoupon() {
    if (!couponCode.trim() || !cart) return
    setValidating(true)
    try {
      const result = await couponsApi.validate(couponCode.trim(), cart.total)
      setCouponResult(result)
    } finally {
      setValidating(false)
    }
  }

  function handleRemoveCoupon() {
    setCouponCode('')
    setCouponResult(null)
  }

  function applyOfferCode(code: string) {
    setCouponCode(code)
    setCouponResult(null)
  }

  const discount = couponResult?.isValid ? couponResult.discountAmount : 0
  const shipping = cart && cart.total >= freeShippingThreshold ? 0 : shippingFeeRate
  const finalTotal = cart ? cart.total - discount + shipping : 0

  async function handlePlaceOrder() {
    if (!selectedAddressId) return
    setPlacing(true)
    setPlaceError('')
    try {
      const appliedCode = couponResult?.isValid ? couponCode.trim() : undefined
      const order: Order = await ordersApi.place({ addressId: selectedAddressId, paymentMethod, couponCode: appliedCode, shippingFee: shipping })

      if (paymentMethod === 'COD') {
        clearCart()
        navigate(`/thank-you/${order.id}`)
        return
      }

      const rpOrder = await paymentApi.createOrder(order.id)
      const options = {
        key: rpOrder.keyId,
        amount: rpOrder.amount,
        currency: rpOrder.currency,
        name: 'Niroté',
        order_id: rpOrder.razorpayOrderId,
        prefill: { name: user?.name, email: user?.email },
        theme: { color: GOLD },
        handler: async (response: RazorpayPaymentResponse) => {
          await paymentApi.verify({
            orderId: order.id,
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
          })
          clearCart()
          navigate(`/thank-you/${order.id}`)
        },
        modal: { ondismiss: () => setPlacing(false) },
      }
      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch (err: any) {
      const msg = err?.response?.data?.error ?? err?.message ?? 'Failed to process payment. Please try again.'
      setPlaceError(msg)
      setPlacing(false)
    }
  }

  if (loading) return <div className="flex justify-center py-32"><Spinner size="lg" /></div>

  if (!cart || cart.items.length === 0) {
    return (
      <div className="py-32 text-center px-4" style={{ background: BG }}>
        <p style={{ color: SECOND }}>Your cart is empty.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: BG }}>
      {/* Header */}
      <section className="py-14 text-center px-6" style={{ borderBottom: `1px solid ${BORDER}` }}>
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] mb-2" style={{ color: GOLD }}>Secure</p>
        <h1 className="font-serif text-[36px] sm:text-[44px] font-bold" style={{ color: TEXT }}>Checkout</h1>
      </section>

      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Festival offer banner */}
        {activeOffers.length > 0 && (
          <div className="mb-8 rounded-2xl p-5 text-white"
            style={{ background: `linear-gradient(135deg, ${GOLD} 0%, #B99118 100%)` }}>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-4 w-4 text-white/80" />
              <span className="text-[13px] font-semibold text-white/90 uppercase tracking-wide">Festival Offers</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {activeOffers.map((offer) => (
                <button key={offer.id} onClick={() => applyOfferCode(offer.festivalName ?? offer.description)}
                  className="rounded-full bg-white/20 px-3.5 py-1.5 text-[12px] font-medium hover:bg-white/30 transition-colors text-left">
                  🪔 {offer.festivalName && <strong>{offer.festivalName}: </strong>}
                  {offer.discountType === 'Percentage' ? `${offer.discountValue}% off` : `₹${offer.discountValue} off`}
                  {offer.minCartAmount ? ` on ₹${offer.minCartAmount}+` : ''}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">

            {/* Delivery address */}
            <div className="rounded-2xl bg-white p-6" style={{ border: `1px solid ${BORDER}` }}>
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: '#F5EDD4' }}>
                  <MapPin className="h-4 w-4" style={{ color: GOLD }} />
                </div>
                <h2 className="font-semibold text-[16px]" style={{ color: TEXT }}>Delivery Address</h2>
              </div>

              {addresses.length === 0 && !showNewAddress && (
                <p className="text-[13px] mb-3" style={{ color: SECOND }}>No saved addresses. Add one to continue.</p>
              )}

              <div className="space-y-3">
                {addresses.map((addr) => (
                  <label key={addr.id}
                    className="flex gap-3 rounded-xl p-4 cursor-pointer transition-colors"
                    style={{
                      border: `2px solid ${selectedAddressId === addr.id ? GOLD : BORDER}`,
                      background: selectedAddressId === addr.id ? '#FDFBF5' : '#FFF',
                    }}>
                    <input type="radio" name="address" value={addr.id}
                      checked={selectedAddressId === addr.id}
                      onChange={() => setSelectedAddressId(addr.id)}
                      className="mt-0.5 accent-primary-800 shrink-0" />
                    <div className="text-[13px]">
                      <p className="font-semibold mb-0.5" style={{ color: TEXT }}>{addr.fullName} · {addr.phone}</p>
                      <p style={{ color: SECOND }}>{addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}</p>
                      <p style={{ color: SECOND }}>{addr.city}, {addr.state} – {addr.pincode}</p>
                      {addr.country && addr.country !== 'India' && <p className="text-[12px]" style={{ color: SECOND }}>{addr.country}</p>}
                    </div>
                  </label>
                ))}
              </div>

              {!showNewAddress ? (
                <button onClick={() => setShowNewAddress(true)}
                  className="mt-4 flex items-center gap-1.5 text-[13px] font-semibold transition-opacity hover:opacity-70"
                  style={{ color: GOLD }}>
                  <Plus className="h-4 w-4" /> Add new address
                </button>
              ) : (
                <div className="mt-5 space-y-3" style={{ borderTop: `1px solid ${BORDER}`, paddingTop: 20 }}>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-[0.15em] mb-1.5" style={{ color: TEXT }}>Full Name</label>
                      <input className={inputCls} style={{ borderColor: BORDER }} placeholder="Full Name"
                        value={newAddr.fullName} onChange={(e) => setNewAddr((p) => ({ ...p, fullName: e.target.value }))}
                        onFocus={(e) => { e.currentTarget.style.borderColor = GOLD }}
                        onBlur={(e) => { e.currentTarget.style.borderColor = BORDER }} />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-[0.15em] mb-1.5" style={{ color: TEXT }}>Phone</label>
                      <input className={inputCls} style={{ borderColor: BORDER }} placeholder="Phone"
                        value={newAddr.phone} onChange={(e) => setNewAddr((p) => ({ ...p, phone: e.target.value }))}
                        onFocus={(e) => { e.currentTarget.style.borderColor = GOLD }}
                        onBlur={(e) => { e.currentTarget.style.borderColor = BORDER }} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-[0.15em] mb-1.5" style={{ color: TEXT }}>Address Line 1</label>
                    <input className={inputCls} style={{ borderColor: BORDER }} placeholder="House/Flat no., Street"
                      value={newAddr.line1} onChange={(e) => setNewAddr((p) => ({ ...p, line1: e.target.value }))}
                      onFocus={(e) => { e.currentTarget.style.borderColor = GOLD }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = BORDER }} />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-[0.15em] mb-1.5" style={{ color: TEXT }}>Address Line 2 <span className="normal-case font-normal">(optional)</span></label>
                    <input className={inputCls} style={{ borderColor: BORDER }} placeholder="Landmark, Area (optional)"
                      value={newAddr.line2} onChange={(e) => setNewAddr((p) => ({ ...p, line2: e.target.value }))}
                      onFocus={(e) => { e.currentTarget.style.borderColor = GOLD }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = BORDER }} />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-[0.15em] mb-1.5" style={{ color: TEXT }}>Country</label>
                    <select className={selectCls} style={{ borderColor: BORDER }}
                      value={newAddr.country} onChange={(e) => setNewAddr((p) => ({ ...p, country: e.target.value, state: '' }))}>
                      {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  {newAddr.country === 'India' ? (
                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-[0.15em] mb-1.5" style={{ color: TEXT }}>State / UT</label>
                      <select className={selectCls} style={{ borderColor: BORDER }}
                        value={newAddr.state} onChange={(e) => setNewAddr((p) => ({ ...p, state: e.target.value }))}>
                        <option value="">Select state</option>
                        {INDIA_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-[0.15em] mb-1.5" style={{ color: TEXT }}>State / Province</label>
                      <input className={inputCls} style={{ borderColor: BORDER }} placeholder="State / Province"
                        value={newAddr.state} onChange={(e) => setNewAddr((p) => ({ ...p, state: e.target.value }))}
                        onFocus={(e) => { e.currentTarget.style.borderColor = GOLD }}
                        onBlur={(e) => { e.currentTarget.style.borderColor = BORDER }} />
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-[0.15em] mb-1.5" style={{ color: TEXT }}>City</label>
                      <input className={inputCls} style={{ borderColor: BORDER }} placeholder="City"
                        value={newAddr.city} onChange={(e) => setNewAddr((p) => ({ ...p, city: e.target.value }))}
                        onFocus={(e) => { e.currentTarget.style.borderColor = GOLD }}
                        onBlur={(e) => { e.currentTarget.style.borderColor = BORDER }} />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-[0.15em] mb-1.5" style={{ color: TEXT }}>
                        {newAddr.country === 'India' ? 'Pincode' : 'ZIP / Postal Code'}
                      </label>
                      <input className={inputCls} style={{ borderColor: BORDER }}
                        placeholder={newAddr.country === 'India' ? '6-digit pincode' : 'Postal code'}
                        value={newAddr.pincode} onChange={(e) => setNewAddr((p) => ({ ...p, pincode: e.target.value }))}
                        onFocus={(e) => { e.currentTarget.style.borderColor = GOLD }}
                        onBlur={(e) => { e.currentTarget.style.borderColor = BORDER }} />
                    </div>
                  </div>
                  <div className="flex gap-3 pt-1">
                    <button onClick={handleSaveAddress}
                      className="px-6 py-2.5 text-[13px] font-semibold text-white rounded-full transition-opacity hover:opacity-90"
                      style={{ background: GOLD }}>
                      Save Address
                    </button>
                    <button onClick={() => setShowNewAddress(false)}
                      className="px-6 py-2.5 text-[13px] font-medium rounded-full border transition-colors hover:bg-gray-50"
                      style={{ color: SECOND, borderColor: BORDER }}>
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Payment method */}
            <div className="rounded-2xl bg-white p-6" style={{ border: `1px solid ${BORDER}` }}>
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: '#F5EDD4' }}>
                  <CreditCard className="h-4 w-4" style={{ color: GOLD }} />
                </div>
                <h2 className="font-semibold text-[16px]" style={{ color: TEXT }}>Payment Method</h2>
              </div>
              <div className="space-y-2">
                {(['Razorpay', 'COD'] as const).map((method) => (
                  <label key={method}
                    className="flex items-center gap-3 rounded-xl p-4 cursor-pointer transition-colors"
                    style={{
                      border: `2px solid ${paymentMethod === method ? GOLD : BORDER}`,
                      background: paymentMethod === method ? '#FDFBF5' : '#FFF',
                    }}>
                    <input type="radio" name="payment" value={method}
                      checked={paymentMethod === method}
                      onChange={() => setPaymentMethod(method)}
                      className="accent-primary-800 shrink-0" />
                    <div>
                      <p className="text-[14px] font-medium" style={{ color: TEXT }}>
                        {method === 'Razorpay' ? 'Online Payment (Razorpay)' : 'Cash on Delivery'}
                      </p>
                      <p className="text-[12px]" style={{ color: SECOND }}>
                        {method === 'Razorpay' ? 'UPI, Cards, Netbanking & more' : 'Pay when your order arrives'}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Coupon code */}
            <div className="rounded-2xl bg-white p-6" style={{ border: `1px solid ${BORDER}` }}>
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: '#F5EDD4' }}>
                  <Tag className="h-4 w-4" style={{ color: GOLD }} />
                </div>
                <h2 className="font-semibold text-[16px]" style={{ color: TEXT }}>Coupon Code</h2>
              </div>

              {couponResult?.isValid ? (
                <div className="flex items-center justify-between rounded-xl bg-green-50 border border-green-200 px-4 py-3">
                  <div className="flex items-center gap-2 text-[13px]">
                    <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <div>
                      <span className="font-mono font-semibold text-green-800">{couponCode.toUpperCase()}</span>
                      <span className="text-green-700 ml-2">— ₹{couponResult.discountAmount.toLocaleString('en-IN')} off</span>
                      {couponResult.description && <p className="text-[11px] text-green-600 mt-0.5">{couponResult.description}</p>}
                    </div>
                  </div>
                  <button onClick={handleRemoveCoupon} className="text-gray-400 hover:text-red-500 transition-colors ml-3">
                    <XCircle className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input type="text" placeholder="Enter coupon code"
                      value={couponCode}
                      onChange={(e) => { setCouponCode(e.target.value.toUpperCase()); setCouponResult(null) }}
                      onKeyDown={(e) => e.key === 'Enter' && handleValidateCoupon()}
                      className={`${inputCls} flex-1 font-mono uppercase`}
                      style={{ borderColor: BORDER }}
                      onFocus={(e) => { e.currentTarget.style.borderColor = GOLD }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = BORDER }} />
                    <button onClick={handleValidateCoupon} disabled={!couponCode.trim() || validating}
                      className="px-5 py-2.5 text-[13px] font-semibold text-white rounded-full transition-opacity hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
                      style={{ background: GOLD }}>
                      {validating && <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg>}
                      Apply
                    </button>
                  </div>
                  {couponResult && !couponResult.isValid && (
                    <p className="text-[12px] text-red-600 flex items-center gap-1">
                      <XCircle className="h-3.5 w-3.5" /> {couponResult.message}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Order summary */}
          <div className="rounded-2xl bg-white p-6 h-fit" style={{ border: `1px solid ${BORDER}` }}>
            <h2 className="font-serif text-[20px] font-bold mb-5" style={{ color: TEXT }}>Order Summary</h2>

            <ul className="space-y-2 text-[13px]">
              {cart.items.map((item) => (
                <li key={item.id} className="flex justify-between gap-3">
                  <span className="line-clamp-1 flex-1" style={{ color: SECOND }}>{item.productName} × {item.quantity}</span>
                  <span style={{ color: TEXT }}>₹{item.subtotal.toLocaleString('en-IN')}</span>
                </li>
              ))}
            </ul>

            <div className="mt-4 space-y-2 text-[13px]" style={{ borderTop: `1px solid ${BORDER}`, paddingTop: 16 }}>
              <div className="flex justify-between">
                <span style={{ color: SECOND }}>Subtotal</span>
                <span style={{ color: TEXT }}>₹{cart.total.toLocaleString('en-IN')}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between font-medium text-green-600">
                  <span>Coupon Discount</span>
                  <span>−₹{discount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span style={{ color: SECOND }}>Shipping</span>
                <span className={shipping === 0 ? 'text-green-600' : ''} style={shipping !== 0 ? { color: TEXT } : {}}>
                  {shipping === 0 ? 'FREE' : `₹${shipping}`}
                </span>
              </div>
            </div>

            <div className="mt-4 pt-4 flex justify-between font-bold text-[16px]" style={{ borderTop: `1px solid ${BORDER}`, color: TEXT }}>
              <span>Total</span>
              <span style={{ color: GOLD }}>₹{finalTotal.toLocaleString('en-IN')}</span>
            </div>

            {placeError && (
              <div className="mt-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-[13px] text-red-700">
                {placeError}
              </div>
            )}

            <button
              className="w-full mt-5 py-3.5 text-[14px] font-semibold text-white rounded-full transition-opacity hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
              style={{ background: GOLD }}
              disabled={!selectedAddressId || placing}
              onClick={handlePlaceOrder}>
              {placing && <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg>}
              {paymentMethod === 'Razorpay' ? 'Pay Now' : 'Place Order'}
            </button>

            {!selectedAddressId && (
              <p className="mt-2 text-[12px] text-center" style={{ color: SECOND }}>Select a delivery address to continue</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
