import { useEffect, useRef, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { Heart, ShoppingBag, ChevronLeft, Truck, Star, Plus, Minus } from 'lucide-react'
import type { Product, ProductListItem, Review, CreateReviewRequest } from '../types'
import { productsApi } from '../api/products'
import { analyticsApi } from '../api/analytics'
import { cartApi } from '../api/cart'
import { wishlistApi } from '../api/wishlist'
import { shippingApi } from '../api/shipping'
import { couponsApi, type BankOffer } from '../api/coupons'
import { reviewsApi } from '../api/reviews'
import { useCartStore } from '../stores/cartStore'
import { useWishlistStore } from '../stores/wishlistStore'
import { useAuthStore } from '../stores/authStore'
import { useSite } from '../contexts/SiteContext'
import { Spinner } from '../components/ui/Spinner'
import { ProductCard } from '../components/product/ProductCard'

const BG = '#FAF8F4'
const GOLD = '#C9A227'
const TEXT = '#1A1A1A'
const SECOND = '#6A6A6A'
const BORDER = '#ECE7DF'

export function ProductDetail() {
  const { id } = useParams<{ id: string }>()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeImage, setActiveImage] = useState(0)
  const [addingToCart, setAddingToCart] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const [pincode, setPincode] = useState('')
  const [serviceMsg, setServiceMsg] = useState('')
  const [bankOffers, setBankOffers] = useState<BankOffer[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [canReview, setCanReview] = useState(false)
  const [reviewForm, setReviewForm] = useState<CreateReviewRequest>({ productId: 0, rating: 5, title: '', body: '' })
  const [submittingReview, setSubmittingReview] = useState(false)
  const [reviewMsg, setReviewMsg] = useState('')
  const [reviewError, setReviewError] = useState('')
  const [related, setRelated] = useState<ProductListItem[]>([])

  const scrollRef = useRef<HTMLDivElement>(null)
  const trackedRef = useRef(false)

  const navigate = useNavigate()
  const { setCart, openDrawer } = useCartStore()
  const { isWishlisted, addItem: addToWishlist, removeItem: removeFromWishlist } = useWishlistStore()
  const { isAuthenticated } = useAuthStore()
  const { categories } = useSite()

  useEffect(() => {
    if (!id) return
    setLoading(true)
    setRelated([])
    productsApi.getById(Number(id))
      .then((p) => {
        setProduct(p)
        if (!trackedRef.current) { trackedRef.current = true; analyticsApi.trackView(Number(id), useAuthStore.getState().user?.id) }
        try {
          const key = 'nirote_recently_viewed'
          const prev: { id: number; name: string; image?: string; price: number; discountedPrice?: number }[] = JSON.parse(localStorage.getItem(key) || '[]')
          const filtered = prev.filter((x) => x.id !== p.id)
          const entry = { id: p.id, name: p.name, image: p.defaultImageUrl, price: p.price, discountedPrice: p.discountedPrice }
          localStorage.setItem(key, JSON.stringify([entry, ...filtered].slice(0, 10)))
        } catch {}
        const cat = categories.find((c) => c.name === p.categoryName)
        if (cat) {
          productsApi.list({ categoryId: cat.id, pageSize: 5 })
            .then((res) => setRelated((res.items ?? []).filter((r) => r.id !== p.id).slice(0, 4)))
            .catch(() => {})
        }
      })
      .finally(() => setLoading(false))
    couponsApi.getBankOffers().then(setBankOffers).catch(() => {})
    reviewsApi.getByProduct(Number(id)).then(setReviews).catch(() => {})
    if (isAuthenticated) {
      reviewsApi.canReview(Number(id)).then((r) => setCanReview(r.canReview)).catch(() => {})
    }
  }, [id, categories])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    el.scrollTo({ left: el.clientWidth * activeImage, behavior: 'smooth' })
  }, [activeImage])

  if (loading) return <div className="flex justify-center py-32"><Spinner size="lg" /></div>

  if (!product) {
    return (
      <div className="py-32 text-center" style={{ background: BG }}>
        <p style={{ color: SECOND }}>Product not found.</p>
        <Link to="/products" className="mt-4 inline-block underline hover:opacity-80" style={{ color: GOLD }}>Browse all jewellery</Link>
      </div>
    )
  }

  const wishlisted = isWishlisted(product.id)
  const images = product.imageUrls ?? []
  const allImages = images.length > 0 ? images : (product.defaultImageUrl ? [product.defaultImageUrl] : [])
  const displayImage = allImages[activeImage] ?? allImages[0]

  const avgRating = reviews.length > 0
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null
  const metaDesc = product.description
    ? product.description.slice(0, 155).replace(/\n/g, ' ') + (product.description.length > 155 ? '…' : '')
    : `Buy ${product.name} at Niroté. ${product.fabric}, ${product.color}.`
  const canonicalUrl = `${window.location.origin}/products/${product.id}`
  const jsonLd = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: product.name,
    description: product.description || metaDesc,
    image: allImages,
    brand: { '@type': 'Brand', name: 'Niroté' },
    offers: {
      '@type': 'Offer',
      url: canonicalUrl,
      priceCurrency: 'INR',
      price: String(product.discountedPrice ?? product.price),
      availability: product.stockQuantity > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      seller: { '@type': 'Organization', name: 'Niroté' },
    },
    ...(avgRating && reviews.length >= 2 ? {
      aggregateRating: { '@type': 'AggregateRating', ratingValue: avgRating, reviewCount: String(reviews.length) },
    } : {}),
  }

  function handleCarouselScroll() {
    const el = scrollRef.current
    if (!el) return
    const idx = Math.round(el.scrollLeft / el.clientWidth)
    if (idx !== activeImage) setActiveImage(idx)
  }

  async function handleAddToCart() {
    if (!isAuthenticated) { navigate('/login', { state: { from: `/products/${id}` } }); return }
    setAddingToCart(true)
    try {
      const cart = await cartApi.addItem({ productId: product!.id, quantity })
      setCart(cart)
      openDrawer()
    } finally {
      setAddingToCart(false)
    }
  }

  async function handleToggleWishlist() {
    if (!isAuthenticated) { navigate('/login', { state: { from: `/products/${id}` } }); return }
    if (wishlisted) {
      await wishlistApi.remove(product!.id)
      removeFromWishlist(product!.id)
    } else {
      await wishlistApi.add(product!.id)
      addToWishlist({ productId: product!.id, productName: product!.name, imageUrl: product!.defaultImageUrl, price: product!.price })
    }
  }

  async function handleSubmitReview(e: React.FormEvent) {
    e.preventDefault()
    if (!reviewForm.body.trim()) { setReviewError('Please write your review.'); return }
    setSubmittingReview(true)
    setReviewError('')
    try {
      const res = await reviewsApi.create({ ...reviewForm, productId: product!.id })
      setReviewMsg(res.message)
      setReviewForm({ productId: product!.id, rating: 5, title: '', body: '' })
      reviewsApi.getByProduct(product!.id).then(setReviews).catch(() => {})
    } catch {
      setReviewError('Failed to submit review. Please try again.')
    } finally {
      setSubmittingReview(false)
    }
  }

  async function checkPincode() {
    if (!pincode || pincode.length !== 6) return
    const res = await shippingApi.checkServiceability(pincode)
    setServiceMsg(
      res.serviceable
        ? `Delivery available. Estimated ${product!.deliveryDays} day(s).`
        : 'Delivery not available for this pincode',
    )
  }

  return (
    <div style={{ background: BG }}>
      <Helmet>
        <title>{product.name} | Niroté</title>
        <meta name="description" content={metaDesc} />
        <meta property="og:title" content={`${product.name} | Niroté`} />
        <meta property="og:description" content={metaDesc} />
        <meta property="og:type" content="product" />
        {allImages[0] && <meta property="og:image" content={allImages[0]} />}
        <meta property="og:url" content={window.location.href} />
        <meta property="product:price:amount" content={String(product.discountedPrice ?? product.price)} />
        <meta property="product:price:currency" content="INR" />
        <link rel="canonical" href={canonicalUrl} />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Link to="/products" className="mb-6 inline-flex items-center gap-1 text-[13px] font-medium transition-opacity hover:opacity-70" style={{ color: SECOND }}>
          <ChevronLeft className="h-4 w-4" /> Back to Jewellery
        </Link>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
          {/* Images */}
          <div className="flex gap-3">
            {allImages.length > 1 && (
              <div className="hidden lg:flex flex-col gap-2">
                {allImages.map((url, i) => (
                  <button key={i} onClick={() => setActiveImage(i)}
                    className="h-16 w-12 overflow-hidden rounded-xl transition-all"
                    style={{ border: `2px solid ${activeImage === i ? GOLD : BORDER}` }}>
                    <img src={url} alt="" className="h-full w-full object-cover object-center" />
                  </button>
                ))}
              </div>
            )}

            <div className="hidden lg:block flex-1 overflow-hidden rounded-2xl aspect-[3/4]"
              style={{ background: '#F7F4EF' }}>
              {displayImage ? (
                <img src={displayImage} alt={product.name} className="h-full w-full object-cover object-center" />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <ShoppingBag className="h-16 w-16 text-gray-300" />
                </div>
              )}
            </div>

            <div className="lg:hidden relative w-full rounded-2xl overflow-hidden" style={{ aspectRatio: '3/4', background: '#F7F4EF' }}>
              <div ref={scrollRef} onScroll={handleCarouselScroll}
                className="absolute inset-0 flex overflow-x-auto snap-x snap-mandatory"
                style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' } as React.CSSProperties}>
                {allImages.length > 0 ? allImages.map((url, i) => (
                  <div key={i} className="snap-start shrink-0" style={{ minWidth: '100%', height: '100%' }}>
                    <img src={url} alt={product.name} className="w-full h-full object-cover object-center" />
                  </div>
                )) : (
                  <div className="flex w-full h-full items-center justify-center">
                    <ShoppingBag className="h-16 w-16 text-gray-300" />
                  </div>
                )}
              </div>
              {allImages.length > 1 && (
                <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 pointer-events-none">
                  {allImages.map((_, i) => (
                    <button key={i} onClick={() => setActiveImage(i)}
                      className="rounded-full transition-all pointer-events-auto"
                      style={{ height: 6, width: activeImage === i ? 20 : 6, background: activeImage === i ? GOLD : 'rgba(255,255,255,0.8)' }} />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="flex flex-col gap-5">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em]" style={{ color: GOLD }}>{product.categoryName}</p>
              <h1 className="mt-1.5 font-serif text-[26px] sm:text-[32px] font-bold leading-tight" style={{ color: TEXT }}>{product.name}</h1>
              <p className="mt-1 text-[13px]" style={{ color: SECOND }}>{product.fabric} · {product.color}</p>

              {avgRating && (
                <div className="mt-2 flex items-center gap-1.5">
                  <div className="flex">
                    {[1,2,3,4,5].map((s) => (
                      <Star key={s} className="h-3.5 w-3.5"
                        style={{ fill: s <= Math.round(Number(avgRating)) ? '#FBBF24' : 'none', color: s <= Math.round(Number(avgRating)) ? '#FBBF24' : '#D1D5DB' }} />
                    ))}
                  </div>
                  <span className="text-[13px]" style={{ color: SECOND }}>{avgRating} ({reviews.length} reviews)</span>
                </div>
              )}

              <div className="mt-4 flex items-baseline gap-3">
                <p className="text-[28px] font-bold" style={{ color: GOLD }}>
                  ₹{(product.discountedPrice ?? product.price).toLocaleString('en-IN')}
                </p>
                {product.discountedPrice && (
                  <p className="text-[16px] line-through" style={{ color: SECOND }}>₹{product.price.toLocaleString('en-IN')}</p>
                )}
                {product.discountedPrice && (
                  <span className="text-[12px] font-semibold px-2 py-0.5 rounded-full text-green-700 bg-green-50">
                    {Math.round((1 - product.discountedPrice / product.price) * 100)}% off
                  </span>
                )}
              </div>
            </div>

            {product.stockQuantity === 0 ? (
              <p className="text-[13px] font-semibold text-red-600">Out of Stock</p>
            ) : product.stockQuantity <= 5 ? (
              <p className="text-[13px] font-semibold text-orange-500">Only {product.stockQuantity} left!</p>
            ) : (
              <p className="text-[13px] font-medium text-green-600">In Stock</p>
            )}

            {product.stockQuantity > 0 && (
              <div className="flex items-center gap-3">
                <span className="text-[13px] font-medium" style={{ color: TEXT }}>Qty:</span>
                <div className="flex items-center rounded-full border" style={{ borderColor: BORDER }}>
                  <button onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-9 h-9 flex items-center justify-center transition-opacity hover:opacity-60 disabled:opacity-30"
                    disabled={quantity <= 1} style={{ color: TEXT }}>
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="w-8 text-center text-[14px] font-semibold" style={{ color: TEXT }}>{quantity}</span>
                  <button onClick={() => setQuantity((q) => Math.min(product.stockQuantity, q + 1))}
                    className="w-9 h-9 flex items-center justify-center transition-opacity hover:opacity-60"
                    style={{ color: TEXT }}>
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button
                className="flex-1 flex items-center justify-center gap-2 py-3.5 text-[14px] font-semibold text-white rounded-full transition-opacity hover:opacity-90 disabled:opacity-50"
                style={{ background: product.stockQuantity === 0 ? '#CCC' : GOLD }}
                disabled={product.stockQuantity === 0 || addingToCart}
                onClick={handleAddToCart}>
                {addingToCart
                  ? <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg>
                  : <ShoppingBag className="h-4 w-4" />}
                {isAuthenticated ? 'Add to Bag' : 'Login to Buy'}
              </button>
              <button onClick={handleToggleWishlist}
                className="w-12 h-12 flex items-center justify-center rounded-full border transition-colors hover:border-gray-300"
                style={{ borderColor: wishlisted ? GOLD : BORDER }}>
                <Heart className="h-5 w-5"
                  style={{ fill: wishlisted ? GOLD : 'none', color: wishlisted ? GOLD : SECOND }} />
              </button>
            </div>

            {/* Bank offers */}
            {bankOffers.length > 0 && (
              <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4 space-y-2">
                <p className="text-[11px] font-semibold text-blue-700 uppercase tracking-wide">Bank Card Offers</p>
                {bankOffers.map((offer) => (
                  <div key={offer.id} className="flex items-start gap-2 text-[13px] text-blue-800">
                    <span className="text-base leading-none mt-0.5">🏦</span>
                    <span>
                      <span className="font-semibold">{offer.bankName} Card:</span>{' '}
                      {offer.description}
                      {offer.code && <> — Use code <span className="font-mono font-bold bg-blue-100 px-1 rounded">{offer.code}</span></>}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Pincode check */}
            <div className="rounded-2xl p-4" style={{ border: `1px solid ${BORDER}`, background: '#FFF' }}>
              <div className="flex items-center gap-2 mb-3">
                <Truck className="h-4 w-4" style={{ color: GOLD }} />
                <span className="text-[13px] font-semibold" style={{ color: TEXT }}>Check Delivery</span>
              </div>
              <div className="flex gap-2">
                <input type="text" maxLength={6} placeholder="Enter 6-digit pincode"
                  value={pincode}
                  onChange={(e) => { setPincode(e.target.value); setServiceMsg('') }}
                  className="flex-1 rounded-full border px-4 py-2 text-[13px] focus:outline-none bg-white"
                  style={{ borderColor: BORDER }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = GOLD }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = BORDER }} />
                <button onClick={checkPincode}
                  className="px-5 py-2 text-[13px] font-semibold text-white rounded-full transition-opacity hover:opacity-90"
                  style={{ background: GOLD }}>
                  Check
                </button>
              </div>
              {serviceMsg && <p className="mt-2 text-[12px]" style={{ color: SECOND }}>{serviceMsg}</p>}
            </div>

            {/* Details */}
            {product.description && (
              <div className="rounded-2xl p-4 bg-white" style={{ border: `1px solid ${BORDER}` }}>
                <h3 className="font-semibold text-[14px] mb-2" style={{ color: TEXT }}>About this Piece</h3>
                <p className="text-[13px] leading-relaxed" style={{ color: SECOND }}>{product.description}</p>
              </div>
            )}
            {product.careInstructions && (
              <div>
                <h3 className="font-semibold text-[14px] mb-1" style={{ color: TEXT }}>Care Instructions</h3>
                <p className="text-[13px]" style={{ color: SECOND }}>{product.careInstructions}</p>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <div className="mt-20 pt-12" style={{ borderTop: `1px solid ${BORDER}` }}>
            <div className="flex items-end justify-between mb-8">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.25em] mb-1.5" style={{ color: GOLD }}>You May Also Like</p>
                <h2 className="font-serif text-[28px] font-bold" style={{ color: TEXT }}>Related Jewellery</h2>
              </div>
              <Link to={`/products/category/${product.categoryName.toLowerCase().replace(/\s+/g, '-')}`}
                className="text-[13px] font-medium transition-opacity hover:opacity-70" style={{ color: SECOND }}>
                View All →
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {related.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        )}

        {/* Reviews */}
        <div className="mt-20 pt-12" style={{ borderTop: `1px solid ${BORDER}` }}>
          <div className="flex items-center gap-3 mb-8">
            <h2 className="font-serif text-[28px] font-bold" style={{ color: TEXT }}>Customer Reviews</h2>
            {reviews.length > 0 && (
              <span className="flex items-center gap-1 text-[14px]" style={{ color: SECOND }}>
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                {(reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)}
                <span>({reviews.length})</span>
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
            <div className="space-y-5">
              {reviews.length === 0 ? (
                <p className="text-[14px]" style={{ color: SECOND }}>No reviews yet. Be the first to review!</p>
              ) : (
                reviews.map((r) => (
                  <div key={r.id} className="pb-5" style={{ borderBottom: `1px solid ${BORDER}` }}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="flex items-center gap-0.5">
                        {[1,2,3,4,5].map((s) => (
                          <Star key={s} className="h-3.5 w-3.5"
                            style={{ fill: s <= r.rating ? '#FBBF24' : 'none', color: s <= r.rating ? '#FBBF24' : '#D1D5DB' }} />
                        ))}
                      </span>
                      <span className="text-[14px] font-medium" style={{ color: TEXT }}>{r.userName}</span>
                      <span className="text-[12px] ml-auto" style={{ color: SECOND }}>
                        {new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                    {r.title && <p className="text-[14px] font-medium mb-1" style={{ color: TEXT }}>{r.title}</p>}
                    <p className="text-[13px] leading-relaxed" style={{ color: SECOND }}>{r.body}</p>
                  </div>
                ))
              )}
            </div>

            <div>
              <h3 className="font-serif text-[20px] font-bold mb-5" style={{ color: TEXT }}>Write a Review</h3>
              {!isAuthenticated ? (
                <p className="text-[14px]" style={{ color: SECOND }}>
                  <Link to="/login" className="font-semibold underline hover:opacity-80" style={{ color: GOLD }}>Login</Link> to write a review.
                </p>
              ) : !canReview ? (
                <p className="text-[14px]" style={{ color: SECOND }}>Only customers who have purchased this product can write a review.</p>
              ) : reviewMsg ? (
                <div className="rounded-2xl bg-green-50 border border-green-200 p-4 text-[14px] text-green-700">{reviewMsg}</div>
              ) : (
                <form onSubmit={handleSubmitReview} className="space-y-4">
                  <div>
                    <label className="block text-[12px] font-semibold uppercase tracking-[0.15em] mb-2" style={{ color: TEXT }}>Your Rating</label>
                    <div className="flex gap-1">
                      {[1,2,3,4,5].map((s) => (
                        <button key={s} type="button" onClick={() => setReviewForm((f) => ({ ...f, rating: s }))}>
                          <Star className="h-6 w-6 transition-colors"
                            style={{ fill: s <= reviewForm.rating ? '#FBBF24' : 'none', color: s <= reviewForm.rating ? '#FBBF24' : '#D1D5DB' }} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-[12px] font-semibold uppercase tracking-[0.15em] mb-1.5" style={{ color: TEXT }}>Title (optional)</label>
                    <input type="text" placeholder="Summary of your experience"
                      value={reviewForm.title ?? ''} onChange={(e) => setReviewForm((f) => ({ ...f, title: e.target.value }))}
                      className="w-full rounded-xl border px-4 py-2.5 text-[14px] focus:outline-none bg-white"
                      style={{ borderColor: BORDER }}
                      onFocus={(e) => { e.currentTarget.style.borderColor = GOLD }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = BORDER }} />
                  </div>
                  <div>
                    <label className="block text-[12px] font-semibold uppercase tracking-[0.15em] mb-1.5" style={{ color: TEXT }}>Review</label>
                    <textarea rows={4} placeholder="Share your experience with this piece..."
                      value={reviewForm.body} onChange={(e) => setReviewForm((f) => ({ ...f, body: e.target.value }))}
                      className="w-full rounded-xl border px-4 py-2.5 text-[14px] focus:outline-none resize-none bg-white"
                      style={{ borderColor: BORDER }}
                      onFocus={(e) => { e.currentTarget.style.borderColor = GOLD }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = BORDER }} />
                  </div>
                  {reviewError && <p className="text-[12px] text-red-600">{reviewError}</p>}
                  <button type="submit" disabled={submittingReview}
                    className="px-8 py-3 text-[13px] font-semibold text-white rounded-full transition-opacity hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
                    style={{ background: GOLD }}>
                    {submittingReview && <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg>}
                    Submit Review
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
