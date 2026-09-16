import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart, ShoppingBag, Trash2 } from 'lucide-react'
import { wishlistApi } from '../api/wishlist'
import { cartApi } from '../api/cart'
import { useWishlistStore } from '../stores/wishlistStore'
import { useCartStore } from '../stores/cartStore'
import { useAuthStore } from '../stores/authStore'
import { Spinner } from '../components/ui/Spinner'

const BG = '#FAF8F4'
const GOLD = '#C9A227'
const TEXT = '#1A1A1A'
const SECOND = '#6A6A6A'
const BORDER = '#ECE7DF'

export function Wishlist() {
  const { items, setItems, removeItem } = useWishlistStore()
  const { setCart, openDrawer } = useCartStore()
  const { isAuthenticated } = useAuthStore()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) { setLoading(false); return }
    wishlistApi.get().then(setItems).finally(() => setLoading(false))
  }, [isAuthenticated, setItems])

  async function handleRemove(productId: number) {
    await wishlistApi.remove(productId)
    removeItem(productId)
  }

  async function handleMoveToCart(productId: number) {
    const cart = await cartApi.addItem({ productId, quantity: 1 })
    setCart(cart)
    openDrawer()
    await wishlistApi.remove(productId)
    removeItem(productId)
  }

  if (loading) return <div className="flex justify-center py-32"><Spinner size="lg" /></div>

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center gap-5 py-32 text-center px-4" style={{ background: BG }}>
        <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: '#F5EDD4' }}>
          <Heart className="h-8 w-8" style={{ color: GOLD }} />
        </div>
        <p className="text-[15px]" style={{ color: SECOND }}>Login to view your wishlist</p>
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
        <h1 className="font-serif text-[36px] sm:text-[44px] font-bold" style={{ color: TEXT }}>
          Wishlist {items.length > 0 && <span className="text-[24px]" style={{ color: SECOND }}>({items.length})</span>}
        </h1>
      </section>

      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        {items.length === 0 ? (
          <div className="flex flex-col items-center gap-5 py-24 text-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: '#F5EDD4' }}>
              <Heart className="h-8 w-8" style={{ color: GOLD }} />
            </div>
            <p className="text-[18px] font-medium" style={{ color: TEXT }}>Your wishlist is empty</p>
            <p className="text-[14px]" style={{ color: SECOND }}>Save pieces you love and come back to them anytime.</p>
            <Link to="/products"
              className="mt-2 px-8 py-3 text-[13px] font-semibold text-white rounded-full transition-opacity hover:opacity-90"
              style={{ background: GOLD }}>
              Discover Jewellery
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3">
            {items.map((item) => (
              <div key={item.productId} className="flex flex-col overflow-hidden rounded-2xl bg-white" style={{ border: `1px solid ${BORDER}` }}>
                <Link to={`/products/${item.productId}`} className="block relative overflow-hidden" style={{ background: '#F7F4EF' }}>
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.productName}
                      className="w-full object-cover object-top transition-transform duration-500 hover:scale-105"
                      style={{ aspectRatio: '3/4' }} />
                  ) : (
                    <div className="flex items-center justify-center" style={{ aspectRatio: '3/4' }}>
                      <ShoppingBag className="h-10 w-10 text-gray-300" />
                    </div>
                  )}
                </Link>
                <div className="flex flex-1 flex-col gap-3 p-4">
                  <Link to={`/products/${item.productId}`}
                    className="text-[14px] font-medium line-clamp-2 hover:opacity-80 transition-opacity"
                    style={{ color: TEXT }}>
                    {item.productName}
                  </Link>
                  <p className="text-[15px] font-bold" style={{ color: GOLD }}>₹{item.price.toLocaleString('en-IN')}</p>
                  <div className="mt-auto flex gap-2">
                    <button
                      onClick={() => handleMoveToCart(item.productId)}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-full py-2.5 text-[12px] font-semibold text-white transition-opacity hover:opacity-90"
                      style={{ background: GOLD }}>
                      <ShoppingBag className="h-3.5 w-3.5" /> Move to Bag
                    </button>
                    <button onClick={() => handleRemove(item.productId)}
                      className="flex items-center justify-center rounded-full w-10 h-10 transition-colors hover:bg-red-50 border"
                      style={{ borderColor: BORDER, color: SECOND }}>
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
