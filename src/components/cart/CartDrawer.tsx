import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { X, Trash2, Plus, Minus, ShoppingBag } from 'lucide-react'
import { useCartStore } from '../../stores/cartStore'
import { useAuthStore } from '../../stores/authStore'
import { cartApi } from '../../api/cart'
import { Button } from '../ui/Button'

export function CartDrawer() {
  const { cart, isOpen, itemCount, closeDrawer, setCart, clearCart } = useCartStore()
  const { isAuthenticated } = useAuthStore()

  useEffect(() => {
    if (isOpen && isAuthenticated) {
      cartApi.get().then(setCart).catch(() => {})
    }
    if (isOpen && !isAuthenticated) {
      clearCart()
    }
  }, [isOpen, isAuthenticated, setCart, clearCart])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') closeDrawer()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [closeDrawer])

  async function handleUpdateQty(itemId: number, qty: number) {
    if (qty < 1) return
    const updated = await cartApi.updateItem(itemId, qty)
    setCart(updated)
  }

  async function handleRemove(itemId: number) {
    const updated = await cartApi.removeItem(itemId)
    setCart(updated)
  }

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm" onClick={closeDrawer} />
      )}

      <div className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-white shadow-2xl transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid #e8e3db' }}>
          <h2 className="font-serif text-base font-semibold text-gray-900">
            Shopping Bag {itemCount > 0 ? `(${itemCount})` : ''}
          </h2>
          <button onClick={closeDrawer} className="text-gray-400 hover:text-gray-700 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {!isAuthenticated ? (
            <div className="flex flex-col items-center gap-4 py-16 text-center">
              <ShoppingBag className="h-10 w-10 text-gray-200" />
              <p className="text-sm text-gray-500">Login to view your cart</p>
              <Link to="/login" onClick={closeDrawer}><Button>Login</Button></Link>
            </div>
          ) : !cart || cart.items.length === 0 ? (
            <div className="flex flex-col items-center gap-4 py-16 text-center">
              <ShoppingBag className="h-10 w-10 text-gray-200" />
              <p className="text-sm text-gray-500">Your bag is empty</p>
              <Link to="/products" onClick={closeDrawer}><Button variant="outline">Browse Jewellery</Button></Link>
            </div>
          ) : (
            <ul>
              {cart.items.map((item) => (
                <li key={item.id} className="flex gap-4 py-4" style={{ borderBottom: '1px solid #f0ede8' }}>
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.productName} className="h-20 w-16 object-cover object-top bg-gray-50" style={{ borderRadius: 6 }} />
                  ) : (
                    <div className="h-20 w-16 flex items-center justify-center flex-shrink-0" style={{ background: '#F7F4EF', borderRadius: 6 }}>
                      <ShoppingBag className="h-6 w-6" style={{ color: '#C9A22750' }} />
                    </div>
                  )}
                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <p className="text-[13px] font-medium text-gray-800 leading-snug line-clamp-2">{item.productName}</p>
                      <p className="mt-1 text-[13px] font-semibold text-gray-900">Rs.{item.unitPrice.toLocaleString('en-IN')}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center" style={{ border: '1px solid #e8e3db' }}>
                        <button onClick={() => handleUpdateQty(item.id, item.quantity - 1)} disabled={item.quantity <= 1}
                          className="px-2 py-1 text-gray-400 hover:text-gray-700 disabled:opacity-30 transition-colors">
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-6 text-center text-[13px] text-gray-700">{item.quantity}</span>
                        <button onClick={() => handleUpdateQty(item.id, item.quantity + 1)}
                          className="px-2 py-1 text-gray-400 hover:text-gray-700 transition-colors">
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <button onClick={() => handleRemove(item.id)} className="text-gray-300 hover:text-red-400 transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {cart && cart.items.length > 0 && (
          <div className="px-5 py-4 space-y-3" style={{ borderTop: '1px solid #e8e3db' }}>
            <div className="flex justify-between text-[14px]">
              <span className="text-gray-500">Subtotal</span>
              <span className="font-semibold text-gray-900">Rs.{cart.total.toLocaleString('en-IN')}</span>
            </div>
            <p className="text-[12px] text-gray-400">Shipping & taxes calculated at checkout</p>
            <Link to="/checkout" onClick={closeDrawer} className="block">
              <Button className="w-full" size="lg">Proceed to Checkout</Button>
            </Link>
            <Link to="/cart" onClick={closeDrawer}
              className="block text-center text-[12px] text-gray-500 hover:text-gray-900 transition-colors">
              View Full Cart
            </Link>
          </div>
        )}
      </div>
    </>
  )
}
