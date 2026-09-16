import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Gem } from 'lucide-react'
import type { ProductListItem } from '../types'
import { productsApi } from '../api/products'
import { newsletterApi } from '../api/newsletter'
import { useSite } from '../contexts/SiteContext'
import { useCms } from '../contexts/CmsContext'
import { ProductCard } from '../components/product/ProductCard'
import { Spinner } from '../components/ui/Spinner'

const BG = '#FAF8F4'
const GOLD = '#C9A227'
const TEXT = '#1A1A1A'
const SECOND = '#6A6A6A'
const BORDER = '#ECE7DF'

interface RecentItem {
  id: number
  name: string
  image?: string
  price: number
  discountedPrice?: number
}

export function Collections() {
  const { homepageCategories, catUrl, settings } = useSite()
  const { collections } = useCms()
  const [newArrivals, setNewArrivals] = useState<ProductListItem[]>([])
  const [bestSellers, setBestSellers] = useState<ProductListItem[]>([])
  const [recentlyViewed, setRecentlyViewed] = useState<RecentItem[]>([])
  const [loadingNew, setLoadingNew] = useState(true)
  const [nlEmail, setNlEmail] = useState('')
  const [nlDone, setNlDone] = useState(false)
  const [nlLoading, setNlLoading] = useState(false)

  async function handleNewsletter(e: React.FormEvent) {
    e.preventDefault()
    if (!nlEmail.trim()) return
    setNlLoading(true)
    try { await newsletterApi.subscribe(nlEmail.trim()); setNlDone(true) }
    catch { setNlDone(true) }
    finally { setNlLoading(false) }
  }

  useEffect(() => {
    productsApi.list({ pageSize: 8, sortBy: 'newest' } as any)
      .then((r) => setNewArrivals(r.items ?? []))
      .catch(() => {})
      .finally(() => setLoadingNew(false))
    productsApi.list({ pageSize: 4, sortBy: 'popular' } as any)
      .then((r) => setBestSellers(r.items ?? []))
      .catch(() => {})
    try {
      const stored = localStorage.getItem('nirote_recently_viewed')
      if (stored) setRecentlyViewed(JSON.parse(stored).slice(0, 4))
    } catch {}
  }, [])

  return (
    <div style={{ background: BG }}>
      {/* Hero */}
      <section className="relative py-24 px-6 text-center overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 70% 60% at 50% 0%, #F0E8D0 0%, transparent 70%)' }} />
        <div className="relative z-10 mx-auto max-w-3xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] mb-3" style={{ color: GOLD }}>
            Curated For You
          </p>
          <h1 className="font-serif text-[44px] sm:text-[56px] font-bold leading-tight mb-5" style={{ color: TEXT }}>
            Our Collections
          </h1>
          <p className="text-[16px] leading-relaxed max-w-xl mx-auto" style={{ color: SECOND }}>
            Every piece tells a story. Explore our curated jewellery collections — from everyday elegance to statement adornments.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/products"
              className="px-8 py-3.5 text-[13px] font-semibold text-white rounded-full transition-opacity hover:opacity-90"
              style={{ background: GOLD }}>
              Shop All Jewellery
            </Link>
            <Link to="/about"
              className="px-8 py-3.5 text-[13px] font-semibold rounded-full border transition-colors hover:bg-white"
              style={{ color: TEXT, borderColor: BORDER }}>
              Our Story
            </Link>
          </div>
        </div>
      </section>

      {/* Offer strips */}
      {(settings.offerStrip1 || settings.offerStrip2 || settings.offerStrip3) && (
        <div className="overflow-hidden py-4" style={{ background: TEXT }}>
          <div className="flex animate-marquee-infinite whitespace-nowrap gap-12 px-8">
            {[settings.offerStrip1, settings.offerStrip2, settings.offerStrip3, settings.offerStrip1, settings.offerStrip2, settings.offerStrip3].filter(Boolean).map((s, i) => (
              <span key={i} className="text-[12px] font-medium tracking-widest uppercase" style={{ color: GOLD }}>{s}</span>
            ))}
          </div>
        </div>
      )}

      {/* Curated CMS Collections */}
      {collections.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] mb-2" style={{ color: GOLD }}>Handpicked For You</p>
            <h2 className="font-serif text-[34px] sm:text-[42px] font-bold" style={{ color: TEXT }}>Curated Collections</h2>
            <p className="mt-3 text-[15px]" style={{ color: SECOND }}>
              Thoughtfully curated edits for every occasion and mood
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {collections.map((col) => (
              <Link
                key={col.id}
                to={`/collections/${col.slug}`}
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="group relative overflow-hidden rounded-2xl transition-all hover:shadow-xl hover:-translate-y-1 duration-300"
                style={{ border: `1px solid ${BORDER}`, aspectRatio: '3/4' }}>
                {col.imageUrl || col.bannerUrl ? (
                  <img
                    src={col.imageUrl || col.bannerUrl}
                    alt={col.name}
                    className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, #F0E8D0 0%, #E8DCC8 100%)' }}>
                    <Gem className="h-12 w-12 opacity-20" style={{ color: GOLD }} />
                  </div>
                )}
                <div className="absolute inset-0"
                  style={{ background: 'linear-gradient(to top, rgba(26,26,26,0.75) 0%, rgba(26,26,26,0.1) 60%, transparent 100%)' }} />
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <p className="font-serif text-[20px] font-bold text-white leading-snug">{col.name}</p>
                  {col.description && (
                    <p className="mt-1 text-[12px] leading-relaxed line-clamp-2" style={{ color: 'rgba(255,255,255,0.75)' }}>
                      {col.description}
                    </p>
                  )}
                  <div className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider transition-colors"
                    style={{ color: GOLD }}>
                    <span>Explore</span>
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1 duration-300" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Categories */}
      {homepageCategories.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] mb-2" style={{ color: GOLD }}>Browse By</p>
            <h2 className="font-serif text-[34px] sm:text-[42px] font-bold" style={{ color: TEXT }}>Collections</h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {homepageCategories.map((cat) => (
              <Link key={cat.id} to={catUrl(cat)}
                className="group relative overflow-hidden rounded-2xl transition-all hover:shadow-lg hover:-translate-y-1 duration-300"
                style={{ border: `1px solid ${BORDER}`, background: '#F7F4EF', aspectRatio: '3/4' }}>
                {(cat as any).imageUrl ? (
                  <img src={(cat as any).imageUrl} alt={cat.name}
                    className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, #F0E8D0 0%, #E8DCC8 100%)' }}>
                    <Gem className="h-10 w-10 opacity-30" style={{ color: GOLD }} />
                  </div>
                )}
                <div className="absolute inset-0"
                  style={{ background: 'linear-gradient(to top, rgba(26,26,26,0.65) 0%, transparent 60%)' }} />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="font-serif text-[18px] font-bold text-white leading-tight">{cat.name}</p>
                  <div className="mt-1.5 flex items-center gap-1 text-[11px] font-medium text-white/70 group-hover:text-white/90 transition-colors">
                    <span>Explore</span>
                    <ArrowRight className="h-3 w-3" />
                  </div>
                </div>
              </Link>
            ))}

            {/* All Collections card */}
            <Link to="/products"
              className="group relative overflow-hidden rounded-2xl flex items-center justify-center transition-all hover:shadow-lg hover:-translate-y-1 duration-300"
              style={{ border: `1px solid ${BORDER}`, background: '#F5EDD4', aspectRatio: '3/4' }}>
              <div className="text-center px-4">
                <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3"
                  style={{ background: GOLD }}>
                  <ArrowRight className="h-6 w-6 text-white" />
                </div>
                <p className="font-serif text-[16px] font-bold" style={{ color: TEXT }}>All Jewellery</p>
                <p className="mt-1 text-[12px]" style={{ color: SECOND }}>View complete collection</p>
              </div>
            </Link>
          </div>
        </section>
      )}

      {/* New Arrivals */}
      <section style={{ borderTop: `1px solid ${BORDER}` }}>
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] mb-2" style={{ color: GOLD }}>Just In</p>
              <h2 className="font-serif text-[34px] sm:text-[42px] font-bold" style={{ color: TEXT }}>New Arrivals</h2>
            </div>
            <Link to="/products?sortBy=newest"
              className="hidden sm:flex items-center gap-1.5 text-[13px] font-medium transition-opacity hover:opacity-70"
              style={{ color: SECOND }}>
              View All <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {loadingNew ? (
            <div className="flex justify-center py-16"><Spinner size="lg" /></div>
          ) : newArrivals.length === 0 ? (
            <p className="text-center py-16" style={{ color: SECOND }}>No products found.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {newArrivals.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          )}

          <div className="mt-8 text-center sm:hidden">
            <Link to="/products"
              className="inline-flex items-center gap-2 text-[13px] font-medium transition-opacity hover:opacity-70"
              style={{ color: SECOND }}>
              View All New Arrivals <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Best Sellers */}
      {bestSellers.length > 0 && (
        <section className="py-20" style={{ background: '#F5EDD4' }}>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] mb-2" style={{ color: GOLD }}>Most Loved</p>
                <h2 className="font-serif text-[34px] sm:text-[42px] font-bold" style={{ color: TEXT }}>Best Sellers</h2>
              </div>
              <Link to="/products"
                className="hidden sm:flex items-center gap-1.5 text-[13px] font-medium transition-opacity hover:opacity-70"
                style={{ color: SECOND }}>
                View All <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {bestSellers.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        </section>
      )}

      {/* Recently Viewed */}
      {recentlyViewed.length > 0 && (
        <section style={{ borderTop: `1px solid ${BORDER}` }}>
          <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
            <div className="mb-10">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] mb-2" style={{ color: GOLD }}>Continue Browsing</p>
              <h2 className="font-serif text-[34px] font-bold" style={{ color: TEXT }}>Recently Viewed</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {recentlyViewed.map((item) => (
                <Link key={item.id} to={`/products/${item.id}`}
                  className="group rounded-2xl bg-white overflow-hidden transition-all hover:-translate-y-1 hover:shadow-md"
                  style={{ border: `1px solid ${BORDER}` }}>
                  <div className="aspect-[3/4] overflow-hidden" style={{ background: '#F7F4EF' }}>
                    {item.image ? (
                      <img src={item.image} alt={item.name}
                        className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Gem className="h-8 w-8 opacity-20" style={{ color: GOLD }} />
                      </div>
                    )}
                  </div>
                  <div className="p-3.5">
                    <p className="text-[13px] font-medium line-clamp-2 mb-1.5" style={{ color: TEXT }}>{item.name}</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-[14px] font-bold" style={{ color: GOLD }}>
                        ₹{(item.discountedPrice ?? item.price).toLocaleString('en-IN')}
                      </span>
                      {item.discountedPrice && (
                        <span className="text-[12px] line-through" style={{ color: SECOND }}>
                          ₹{item.price.toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Newsletter */}
      <section className="py-20 px-6 text-center" style={{ background: TEXT }}>
        <div className="mx-auto max-w-lg">
          <div className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-5" style={{ background: '#2A2A2A' }}>
            <Gem className="h-5 w-5" style={{ color: GOLD }} />
          </div>
          <h2 className="font-serif text-[30px] sm:text-[36px] font-bold text-white mb-3">
            {settings.newsletterHeading || 'Join the NIROTÉ Circle'}
          </h2>
          <p className="text-[14px] leading-relaxed mb-8" style={{ color: 'rgba(255,255,255,0.6)' }}>
            {settings.newsletterBody || 'Be the first to hear about new arrivals, exclusive offers and festive collections.'}
          </p>
          {nlDone ? (
            <p className="text-[14px] font-medium" style={{ color: GOLD }}>
              You're in! Welcome to the NIROTÉ circle.
            </p>
          ) : (
            <form onSubmit={handleNewsletter} className="flex gap-2 max-w-sm mx-auto">
              <input type="email" placeholder="Your email address" required
                value={nlEmail} onChange={e => setNlEmail(e.target.value)}
                className="flex-1 rounded-full px-5 py-3 text-[14px] focus:outline-none bg-white/10 text-white placeholder:text-white/40"
                style={{ border: '1px solid rgba(255,255,255,0.15)' }}
                onFocus={(e) => { e.currentTarget.style.borderColor = GOLD }}
                onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)' }} />
              <button type="submit" disabled={nlLoading}
                className="px-6 py-3 text-[13px] font-semibold rounded-full transition-opacity hover:opacity-90 disabled:opacity-60"
                style={{ background: GOLD, color: '#FFF' }}>
                {nlLoading ? '...' : 'Subscribe'}
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  )
}
