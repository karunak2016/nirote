import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Layout } from './components/layout/Layout'
import { useAuthStore } from './stores/authStore'
import { SiteProvider } from './contexts/SiteContext'
import { CmsProvider } from './contexts/CmsContext'

// Pages
import { Home } from './pages/Home'
import { Products } from './pages/Products'
import { ProductDetail } from './pages/ProductDetail'
import { Cart } from './pages/Cart'
import { Wishlist } from './pages/Wishlist'
import { Checkout } from './pages/Checkout'
import { Orders } from './pages/Orders'
import { OrderDetail } from './pages/OrderDetail'
import { Login } from './pages/Login'
import { Register } from './pages/Register'
import { Profile } from './pages/Profile'
import { TrackOrder } from './pages/TrackOrder'
import { About } from './pages/About'
import { Contact } from './pages/Contact'
import { ShippingPolicy } from './pages/ShippingPolicy'
import { ReturnPolicy } from './pages/ReturnPolicy'
import { PrivacyPolicy } from './pages/PrivacyPolicy'
import { FAQ } from './pages/FAQ'
import { Terms } from './pages/Terms'
import { Collections } from './pages/Collections'
import { CollectionDetail } from './pages/CollectionDetail'
import { ThankYou } from './pages/ThankYou'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 1000 * 60 * 5, retry: 1 },
  },
})

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore()
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: window.location.pathname }} replace />
  }
  return <>{children}</>
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
      <SiteProvider>
      <CmsProvider>
        <Routes>
          <Route element={<Layout />}>
            {/* Public */}
            <Route index element={<Home />} />
            <Route path="products" element={<Products />} />
            <Route path="products/sortBy/:sortBy" element={<Products />} />
            <Route path="products/fabric/:fabric" element={<Products />} />
            <Route path="products/fabric/:fabric/sortBy/:sortBy" element={<Products />} />
            <Route path="products/category/:categorySlug" element={<Products />} />
            <Route path="products/category/:categorySlug/sortBy/:sortBy" element={<Products />} />
            <Route path="products/category/:categorySlug/fabric/:fabric" element={<Products />} />
            <Route path="products/category/:categorySlug/fabric/:fabric/sortBy/:sortBy" element={<Products />} />
            <Route path="products/:id" element={<ProductDetail />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="track" element={<TrackOrder />} />
            <Route path="track/:awbCode" element={<TrackOrder />} />
            <Route path="collections" element={<Collections />} />
            <Route path="collections/:slug" element={<CollectionDetail />} />
            <Route path="about" element={<About />} />
            <Route path="contact" element={<Contact />} />
            <Route path="shipping-policy" element={<ShippingPolicy />} />
            <Route path="return-policy" element={<ReturnPolicy />} />
            <Route path="privacy-policy" element={<PrivacyPolicy />} />
            <Route path="faq" element={<FAQ />} />
            <Route path="terms" element={<Terms />} />

            {/* Protected */}
            <Route path="cart" element={<RequireAuth><Cart /></RequireAuth>} />
            <Route path="wishlist" element={<RequireAuth><Wishlist /></RequireAuth>} />
            <Route path="checkout" element={<RequireAuth><Checkout /></RequireAuth>} />
            <Route path="orders" element={<RequireAuth><Orders /></RequireAuth>} />
            <Route path="orders/:id" element={<RequireAuth><OrderDetail /></RequireAuth>} />
            <Route path="thank-you/:id" element={<RequireAuth><ThankYou /></RequireAuth>} />
            <Route path="profile" element={<RequireAuth><Profile /></RequireAuth>} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </CmsProvider>
      </SiteProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
