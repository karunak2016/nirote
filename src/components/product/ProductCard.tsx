import { Link, useNavigate } from 'react-router-dom'
import { Heart, ShoppingBag, Star } from 'lucide-react'
import type { ProductListItem } from '../../types'
import { useCartStore } from '../../stores/cartStore'
import { useWishlistStore } from '../../stores/wishlistStore'
import { useAuthStore } from '../../stores/authStore'
import { cartApi } from '../../api/cart'
import { wishlistApi } from '../../api/wishlist'

const GOLD = '#C9A227'
const BORDER = '#ECE7DF'

interface ProductCardProps {
  product: ProductListItem
}

function getStatusBadge(product: ProductListItem): { label: string; bg: string; color: string } {
  if (product.discountedPrice) return { label: 'Best Seller', bg: '#FFF8E7', color: '#A07820' }
  if (product.averageRating && product.averageRating >= 4.5 && (product.reviewCount ?? 0) > 10)
    return { label: 'Trending', bg: '#FEF3F2', color: '#C0392B' }
  return { label: 'New Arrival', bg: '#F5EDD4', color: '#9A7425' }
}

export function ProductCard({ product }: ProductCardProps) {
  const { cart, setCart } = useCartStore()
  const { isWishlisted, addItem, removeItem } = useWishlistStore()
  const { isAuthenticated } = useAuthStore()
  const navigate = useNavigate()

  const inCart = cart?.items.some(i => i.productId === product.id) ?? false

  const wishlisted = isWishlisted(product.id)
  const hasReviews = (product.reviewCount ?? 0) > 0
  const badge = getStatusBadge(product)
  const displayPrice = product.discountedPrice ?? product.price
  const discountPct = product.discountedPrice
    ? Math.round((1 - product.discountedPrice / product.price) * 100)
    : 0
  const filledStars = hasReviews ? Math.round(product.averageRating ?? 0) : 0

  async function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault()
    if (!isAuthenticated) { navigate('/login', { state: { from: `/products/${product.id}` } }); return }
    if (inCart) { navigate('/cart'); return }
    const updated = await cartApi.addItem({ productId: product.id, quantity: 1 })
    setCart(updated)
  }

  async function handleToggleWishlist(e: React.MouseEvent) {
    e.preventDefault()
    if (!isAuthenticated) { navigate('/login', { state: { from: `/products/${product.id}` } }); return }
    if (wishlisted) {
      await wishlistApi.remove(product.id)
      removeItem(product.id)
    } else {
      await wishlistApi.add(product.id)
      addItem({ productId: product.id, productName: product.name, imageUrl: product.defaultImageUrl, price: product.price })
    }
  }

  return (
    <Link
      to={`/products/${product.id}`}
      className="group relative flex flex-col bg-white overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)]"
      style={{ borderRadius: 16, border: `1px solid ${BORDER}` }}
    >
      {/* Image */}
      <div className="relative overflow-hidden" style={{ background: '#F7F4EF', borderRadius: '16px 16px 0 0' }}>
        <div className="aspect-[3/4]">
          {product.defaultImageUrl ? (
            <img
              src={product.defaultImageUrl}
              alt={product.name}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-[600ms]"
              style={{ transitionTimingFunction: 'cubic-bezier(0.25,0.46,0.45,0.94)' }}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <ShoppingBag className="h-10 w-10" style={{ color: `${GOLD}50` }} />
            </div>
          )}
        </div>

        {/* Discount badge */}
        {discountPct > 0 && (
          <div className="absolute top-3 left-3 z-10">
            <span className="px-2 py-0.5 text-[10px] font-bold text-white rounded-full" style={{ background: '#1A1A1A' }}>
              {discountPct}% OFF
            </span>
          </div>
        )}

        {/* Wishlist */}
        <button
          onClick={handleToggleWishlist}
          className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-white transition-transform hover:scale-110 shadow-sm"
          style={{ border: `1px solid ${BORDER}` }}
          aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart
            className="h-3.5 w-3.5 transition-colors"
            style={{ color: wishlisted ? GOLD : '#AAAAAA', fill: wishlisted ? GOLD : 'none' }}
          />
        </button>

        {/* Hover actions */}
        <div className="absolute inset-x-3 bottom-3 z-10 flex gap-2 translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
          <button
            onClick={handleAddToCart}
            className="w-full py-2 text-[11px] font-semibold transition-all hover:brightness-90"
            style={{
              borderRadius: 40,
              background: inCart ? '#2d3a2e' : GOLD,
              color: inCart ? '#fff' : '#000',
            }}
          >
            {!isAuthenticated ? 'Login to Buy' : inCart ? 'Go to Cart' : 'Add to Bag'}
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="p-3.5 flex flex-col gap-1.5">
        <p className="text-[10px] font-medium uppercase tracking-[0.12em]" style={{ color: '#AAAAAA' }}>
          {product.categoryName}
        </p>

        <h3 className="text-[13px] font-medium leading-snug line-clamp-2" style={{ color: '#1A1A1A' }}>
          {product.name}
        </h3>

        {/* Rating row — fixed height so cards stay aligned */}
        <div className="h-5 flex items-center">
          {hasReviews ? (
            <div className="flex items-center gap-1.5">
              {/* Stars */}
              <div className="flex items-center gap-[2px]">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className="h-[11px] w-[11px]"
                    style={{
                      fill: s <= filledStars ? GOLD : 'none',
                      color: s <= filledStars ? GOLD : '#D1D5DB',
                    }}
                  />
                ))}
              </div>
              {/* Score */}
              <span className="text-[11px] font-semibold leading-none" style={{ color: '#1A1A1A' }}>
                {(product.averageRating ?? 0).toFixed(1)}
              </span>
              {/* Count */}
              <span className="text-[11px] leading-none" style={{ color: '#AAAAAA' }}>
                ({product.reviewCount})
              </span>
            </div>
          ) : (
            <span
              className="inline-block text-[9.5px] font-semibold uppercase tracking-[0.1em] px-2 py-[3px] rounded-full leading-none"
              style={{ background: badge.bg, color: badge.color }}
            >
              {badge.label}
            </span>
          )}
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-2">
          <span className="text-[15px] font-bold" style={{ color: '#1A1A1A' }}>
            ₹{displayPrice.toLocaleString('en-IN')}
          </span>
          {product.discountedPrice && (
            <span className="text-[12px] line-through" style={{ color: '#AAAAAA' }}>
              ₹{product.price.toLocaleString('en-IN')}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
