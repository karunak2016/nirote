import { useEffect, useRef, useState, useCallback, Fragment } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight, ChevronLeft, ChevronRight,
  Shield, Truck, RotateCcw, RefreshCw, Gem,
  Star, Mail, Heart, Award, Zap, Package, Gift, Clock, Headphones,
} from 'lucide-react'
import type { ElementType } from 'react'
import { useSite } from '../contexts/SiteContext'
import { useCms } from '../contexts/CmsContext'
import { settingsApi } from '../api/settings'
import { productsApi } from '../api/products'
import { reviewsApi } from '../api/reviews'
import { newsletterApi } from '../api/newsletter'
import type { Review } from '../types'
import { ProductCard } from '../components/product/ProductCard'
import type { ProductListItem } from '../types'

const BG      = '#FCFAF6'
const WHITE   = '#FFFFFF'
const GOLD    = '#C9A227'
const GOLD_H  = '#B68E1F'
const HEADING = '#1E1E1E'
const BODY    = '#666666'
const BORDER  = '#E9E3D7'

const CARD_TINTS = ['#F0EBE0', '#EBE6F0', '#E6EBF0', '#F0E6EB', '#EBF0E6', '#F0EEE6']

const ICON_MAP: Record<string, ElementType> = {
  Gem, Shield, Truck, RotateCcw, RefreshCw, Headphones,
  Heart, Star, Award, Zap, Package, Gift, Clock,
}

const STYLE_FALLBACKS = [
  { name: 'Stud Earrings', link: '/products?q=studs' },
  { name: 'Hoops',         link: '/products?q=hoops' },
  { name: 'Jhumkas',       link: '/products?q=jhumkas' },
  { name: 'Chandbalis',    link: '/products?q=chandbali' },
  { name: 'Danglers',      link: '/products?q=danglers' },
  { name: 'Tassels',       link: '/products?q=tassel' },
]

const DEFAULT_WHY = [
  { icon: Award,     title: 'Premium Quality',   desc: 'Carefully curated pieces made with the finest materials for lasting beauty.' },
  { icon: Truck,     title: 'Fast Shipping',      desc: 'Express delivery to your doorstep. Orders dispatched within 24 hours.' },
  { icon: Shield,    title: 'Secure Payments',    desc: '100% safe and encrypted checkout. Pay via UPI, card, or net banking.' },
  { icon: RotateCcw, title: 'Easy Returns',       desc: 'Hassle-free 48-hour returns. Your satisfaction is our promise.' },
]

const DEFAULT_SECTION_ORDER = [
  'hero', 'categories', 'featured', 'new-arrivals',
  'brand', 'why-us', 'testimonials', 'instagram', 'newsletter',
]

function FadeIn({ children, delay = 0, className = '' }: {
  children: React.ReactNode; delay?: number; className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold: 0.1 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return (
    <div ref={ref} className={className} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(22px)',
      transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`,
    }}>
      {children}
    </div>
  )
}

function SectionLabel({ text }: { text: string }) {
  return (
    <p className="text-[10px] font-bold tracking-[0.3em] uppercase mb-2.5" style={{ color: GOLD }}>{text}</p>
  )
}

function SectionHeading({ text, size = 'md' }: { text: string; size?: 'sm' | 'md' | 'lg' }) {
  const fs = size === 'lg' ? 'clamp(30px,3.2vw,44px)' : size === 'sm' ? 'clamp(22px,2.2vw,30px)' : 'clamp(26px,2.8vw,38px)'
  return (
    <h2 className="font-serif font-bold leading-tight" style={{ color: HEADING, fontSize: fs }}>{text}</h2>
  )
}

interface RecentItem { id: number; name: string; price: number; imageUrl: string | null }

export function Home() {
  const { settings, homepageCategories, catUrl } = useSite()
  const { banners, homeSections, whyItems, instagramPosts } = useCms()

  const [bestSellers, setBestSellers]           = useState<ProductListItem[]>([])
  const [newArrivals, setNewArrivals]           = useState<ProductListItem[]>([])
  const [featuredReviews, setFeaturedReviews]   = useState<Review[]>([])
  const [recentlyViewed, setRecentlyViewed]     = useState<RecentItem[]>([])
  const [email, setEmail]                       = useState('')
  const [newsletterState, setNewsletterState]   = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [instagramUrl, setInstagramUrl]         = useState('')
  const [instagramHeading, setInstagramHeading] = useState('Follow Us on Instagram')
  const [brandTag, setBrandTag]                 = useState('')
  const [brandHeading, setBrandHeading]         = useState('')
  const [brandBody, setBrandBody]               = useState('')
  const [brandImage, setBrandImage]             = useState('')
  const [brandBtn, setBrandBtn]                 = useState('Shop Now')
  const carouselRef = useRef<HTMLDivElement>(null)

  const banner = banners[0]
  const hero = {
    badge:       banner?.badge      ?? settings.bannerTagline   ?? 'New Arrivals 2026',
    heading:     banner?.heading    ?? settings.bannerHeading   ?? 'Timeless Jewellery,\nCrafted with Soul',
    description: banner?.subheading ?? settings.bannerDescription ?? 'Discover premium jewellery curated for the modern Indian woman. Each piece tells a story of beauty and elegance.',
    image:       banner?.imageUrl   ?? settings.bannerImage,
    mobileImage: banner?.mobileImageUrl ?? banner?.imageUrl ?? settings.bannerImage,
    btn1:        banner?.btn1Text   ?? settings.bannerBtn1      ?? 'Shop Earrings',
    btn1Url:     banner?.btn1Url    ?? '/products',
    btn2:        banner?.btn2Text   ?? settings.bannerBtn2      ?? 'Explore Collection',
    btn2Url:     banner?.btn2Url    ?? '/products/sortBy/newest',
  }


  const styleCards = (() => {
    const cats = homepageCategories.slice(0, 6).map(cat => ({
      name: cat.name, link: catUrl(cat), image: cat.imageUrl as string | null,
    }))
    const needed = Math.max(0, 6 - cats.length)
    return [
      ...cats,
      ...STYLE_FALLBACKS.slice(cats.length, cats.length + needed).map(f => ({
        name: f.name, link: f.link, image: null as string | null,
      })),
    ]
  })()

  const isSectionEnabled = (key: string) => {
    if (homeSections.length === 0) return true
    const dbKey = key === 'shop_by_style' ? 'categories'
      : key === 'best_sellers' ? 'featured'
      : key === 'new_arrivals' ? 'new-arrivals'
      : key === 'why_choose_us' ? 'why-us'
      : key
    const s = homeSections.find(s => s.sectionKey === dbKey || s.sectionKey === key)
    return !s || s.isEnabled
  }

  const orderedSectionKeys = (() => {
    if (homeSections.length === 0) return DEFAULT_SECTION_ORDER
    const keys = homeSections.map(s => s.sectionKey)
    if (!keys.includes('instagram')) {
      const nlIdx = keys.indexOf('newsletter')
      if (nlIdx >= 0) keys.splice(nlIdx, 0, 'instagram')
      else keys.push('instagram')
    }
    if (!keys.includes('brand')) {
      const whyIdx = keys.indexOf('why-us')
      if (whyIdx >= 0) keys.splice(whyIdx, 0, 'brand')
      else keys.push('brand')
    }
    return keys
  })()

  useEffect(() => {
    productsApi.list({ featured: true, pageSize: 8 }).then(r => setBestSellers(r.items)).catch(() => {})
    productsApi.list({ sortBy: 'newest', pageSize: 8 }).then(r => setNewArrivals(r.items)).catch(() => {})
    reviewsApi.getFeatured(6).then(setFeaturedReviews).catch(() => {})
    try {
      const stored = JSON.parse(localStorage.getItem('nirote_recently_viewed') || '[]')
      setRecentlyViewed(stored)
    } catch { /* ignore */ }
    Promise.all([
      settingsApi.get('instagram_url').catch(() => ({ value: '' })),
      settingsApi.get('instagram_heading').catch(() => ({ value: '' })),
      settingsApi.get('BrandTag').catch(() => ({ value: '' })),
      settingsApi.get('BrandHeading').catch(() => ({ value: '' })),
      settingsApi.get('BrandBody').catch(() => ({ value: '' })),
      settingsApi.get('BrandImage').catch(() => ({ value: '' })),
      settingsApi.get('BrandBtn').catch(() => ({ value: '' })),
    ]).then(([url, heading, bTag, bHeading, bBody, bImage, bBtn]) => {
      setInstagramUrl(url.value || settings.footerInstagram || '')
      setInstagramHeading(heading.value || 'Follow Us on Instagram')
      if (bTag.value)     setBrandTag(bTag.value)
      if (bHeading.value) setBrandHeading(bHeading.value)
      if (bBody.value)    setBrandBody(bBody.value)
      if (bImage.value)   setBrandImage(bImage.value)
      if (bBtn.value)     setBrandBtn(bBtn.value)
    })
  }, [settings.footerInstagram])

  const scrollCarousel = useCallback((dir: 'left' | 'right') => {
    carouselRef.current?.scrollBy({ left: dir === 'left' ? -280 : 280, behavior: 'smooth' })
  }, [])

  async function handleNewsletter(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setNewsletterState('loading')
    try {
      await newsletterApi.subscribe(email.trim())
      setNewsletterState('done')
      setEmail('')
    } catch { setNewsletterState('error') }
  }

  function renderSection(key: string): React.ReactNode {
    switch (key) {
      case 'announcement': return null

      // ── HERO ────────────────────────────────────────────────────────
      case 'hero': return (
        <>
          <section style={{ background: BG }} className="relative overflow-hidden">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
              style={{ minHeight: 'clamp(500px, 70vh, 720px)' }}>
              <div className="grid md:grid-cols-[44%_1fr] items-center gap-0"
                style={{ minHeight: 'inherit' }}>

                {/* Left: Content */}
                <div className="flex flex-col justify-center py-14 md:py-0 pr-0 md:pr-12 order-2 md:order-1">
                  <FadeIn>
                    <p className="text-[10px] font-bold tracking-[0.3em] uppercase mb-5"
                      style={{ color: GOLD }}>{hero.badge}</p>
                  </FadeIn>
                  <FadeIn delay={80}>
                    <h1 className="font-serif font-bold mb-5"
                      style={{
                        color: HEADING,
                        fontSize: 'clamp(32px, 4vw, 56px)',
                        lineHeight: 1.08,
                        letterSpacing: '-0.025em',
                        whiteSpace: 'pre-line',
                      }}>
                      {hero.heading}
                    </h1>
                  </FadeIn>
                  <FadeIn delay={160}>
                    <p className="leading-[1.75] mb-8"
                      style={{ color: BODY, fontSize: 15, maxWidth: 380 }}>
                      {hero.description}
                    </p>
                  </FadeIn>
                  <FadeIn delay={240}>
                    <div className="flex flex-wrap gap-3 mb-7">
                      <Link to={hero.btn1Url}
                        className="inline-flex items-center gap-2 px-7 py-3.5 text-[13px] font-semibold rounded-full text-white transition-all hover:-translate-y-0.5 active:translate-y-0"
                        style={{ background: GOLD }}
                        onMouseEnter={e => e.currentTarget.style.background = GOLD_H}
                        onMouseLeave={e => e.currentTarget.style.background = GOLD}>
                        {hero.btn1} <ArrowRight className="h-4 w-4" />
                      </Link>
                      <Link to={hero.btn2Url}
                        className="inline-flex items-center gap-2 px-7 py-3.5 text-[13px] font-semibold rounded-full transition-all hover:-translate-y-0.5 active:translate-y-0"
                        style={{ border: `1.5px solid ${BORDER}`, color: HEADING }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = GOLD; e.currentTarget.style.color = GOLD }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = BORDER; e.currentTarget.style.color = HEADING }}>
                        {hero.btn2}
                      </Link>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
                      {['Free Shipping ₹999+', '48-Hour Returns', 'Secure Checkout'].map((t, i) => (
                        <div key={i} className="flex items-center gap-1.5">
                          <span className="w-[5px] h-[5px] rounded-full flex-shrink-0" style={{ background: GOLD }} />
                          <span className="text-[11px] font-medium" style={{ color: BODY }}>{t}</span>
                        </div>
                      ))}
                    </div>
                  </FadeIn>
                </div>

                {/* Right: Image */}
                <div className="relative order-1 md:order-2 flex items-center justify-center py-8 md:py-10 md:pl-4">
                  {hero.image ? (
                    <picture className="w-full">
                      {hero.mobileImage !== hero.image && (
                        <source media="(max-width: 767px)" srcSet={hero.mobileImage} />
                      )}
                      <img src={hero.image} alt={settings.siteName || 'NIROTÉ Jewellery'}
                        className="w-full object-cover"
                        style={{
                          borderRadius: 28,
                          boxShadow: '0 24px 80px rgba(0,0,0,0.10)',
                          maxHeight: 'clamp(320px, 58vh, 620px)',
                        }} />
                    </picture>
                  ) : (
                    <div className="w-full flex items-center justify-center"
                      style={{
                        borderRadius: 28,
                        background: 'linear-gradient(135deg, #EDE9DF 0%, #E0D9CE 100%)',
                        minHeight: 'clamp(320px, 50vh, 560px)',
                        boxShadow: '0 24px 80px rgba(0,0,0,0.06)',
                      }}>
                      <div className="text-center py-16">
                        <Gem className="h-14 w-14 mx-auto mb-3" style={{ color: `${GOLD}50` }} />
                        <p className="text-[11px] font-medium tracking-widest uppercase" style={{ color: `${GOLD}70` }}>
                          Add hero image in Admin
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Dark scrolling marquee */}
          {settings.marqueeText && isSectionEnabled('marquee') && (
            <div className="overflow-hidden py-3" style={{ background: '#12100E' }}>
              <div className="flex items-center gap-16 animate-marquee-infinite whitespace-nowrap">
                {[settings.marqueeText, settings.marqueeText].map((text, ti) =>
                  text.split(/✦|◈|\|/).filter(s => s.trim()).map((segment, i) => (
                    <span key={`${ti}-${i}`} className="flex items-center gap-4 text-[11px] font-semibold tracking-[0.2em] uppercase flex-shrink-0">
                      <span style={{ color: GOLD }}>✦</span>
                      <span style={{ color: '#E8DFC8' }}>{segment.trim()}</span>
                    </span>
                  ))
                )}
              </div>
            </div>
          )}
        </>
      )

      // ── SHOP BY STYLE ────────────────────────────────────────────────
      case 'categories':
      case 'shop_by_style': return (
        <section style={{ background: WHITE }} className="py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <FadeIn>
              <div className="flex items-end justify-between mb-10">
                <div>
                  <SectionLabel text="Shop By Style" />
                  <SectionHeading text="Earring Styles" />
                </div>
                <Link to="/products"
                  className="hidden sm:flex items-center gap-1.5 text-[13px] font-semibold transition-opacity hover:opacity-70"
                  style={{ color: GOLD }}>
                  Shop All <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </FadeIn>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
              {styleCards.map((card, i) => (
                <FadeIn key={card.name} delay={i * 55}>
                  <Link to={card.link}
                    className="group relative flex flex-col overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(0,0,0,0.10)]"
                    style={{ borderRadius: 16, border: `1px solid ${BORDER}` }}>
                    <div className="relative overflow-hidden" style={{ aspectRatio: '3/4', background: CARD_TINTS[i % 6] }}>
                      {card.image ? (
                        <img src={card.image} alt={card.name}
                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Gem className="h-10 w-10 opacity-25" style={{ color: GOLD }} />
                        </div>
                      )}
                      <div className="absolute inset-0"
                        style={{ background: 'linear-gradient(to top, rgba(18,16,14,0.72) 0%, transparent 52%)' }} />
                      <div className="absolute bottom-0 inset-x-0 p-3.5">
                        <p className="text-white font-semibold text-[13px] leading-snug">{card.name}</p>
                        <p className="flex items-center gap-1 mt-0.5 text-[11px] font-medium transition-all duration-300 group-hover:gap-2"
                          style={{ color: GOLD }}>
                          Explore <ArrowRight className="h-3 w-3" />
                        </p>
                      </div>
                    </div>
                  </Link>
                </FadeIn>
              ))}
            </div>

            <div className="mt-8 text-center sm:hidden">
              <Link to="/products"
                className="inline-flex items-center gap-2 px-6 py-2.5 text-[13px] font-semibold rounded-full"
                style={{ border: `1.5px solid ${BORDER}`, color: HEADING }}>
                Shop All Earrings <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      )

      // ── NEW ARRIVALS ─────────────────────────────────────────────────
      case 'new-arrivals':
      case 'new_arrivals': return (
        <section style={{ background: BG }} className="py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <FadeIn>
              <div className="flex items-end justify-between mb-10">
                <div>
                  <SectionLabel text="Just In" />
                  <SectionHeading text="New Arrivals" />
                </div>
                <Link to="/products/sortBy/newest"
                  className="hidden sm:flex items-center gap-1.5 text-[13px] font-semibold transition-opacity hover:opacity-70"
                  style={{ color: GOLD }}>
                  View All <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </FadeIn>

            {newArrivals.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {newArrivals.map((product, i) => (
                  <FadeIn key={product.id} delay={i * 55}>
                    <ProductCard product={product} />
                  </FadeIn>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="rounded-2xl animate-pulse" style={{ background: BORDER, aspectRatio: '3/4' }} />
                ))}
              </div>
            )}

            <div className="mt-8 text-center sm:hidden">
              <Link to="/products/sortBy/newest"
                className="inline-flex items-center gap-2 px-6 py-2.5 text-[13px] font-semibold rounded-full"
                style={{ border: `1.5px solid ${GOLD}`, color: GOLD }}>
                View All New Arrivals <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      )

      // ── BEST SELLERS ─────────────────────────────────────────────────
      case 'featured':
      case 'best_sellers': return (
        <section style={{ background: WHITE }} className="py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <FadeIn>
              <div className="flex items-end justify-between mb-10">
                <div>
                  <SectionLabel text="Customer Favourites" />
                  <SectionHeading text="Best Sellers" />
                </div>
                <div className="flex items-center gap-3">
                  <Link to="/products"
                    className="hidden sm:flex items-center gap-1.5 text-[13px] font-semibold mr-2 transition-opacity hover:opacity-70"
                    style={{ color: GOLD }}>
                    View All <ArrowRight className="h-4 w-4" />
                  </Link>
                  <button onClick={() => scrollCarousel('left')}
                    className="w-9 h-9 flex items-center justify-center rounded-full transition-all hover:shadow-md"
                    style={{ border: `1.5px solid ${BORDER}`, color: HEADING }}>
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button onClick={() => scrollCarousel('right')}
                    className="w-9 h-9 flex items-center justify-center rounded-full transition-all hover:shadow-md"
                    style={{ border: `1.5px solid ${BORDER}`, color: HEADING }}>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </FadeIn>

            <div ref={carouselRef} className="flex gap-4 overflow-x-auto pb-2"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {bestSellers.length > 0
                ? bestSellers.map(product => (
                  <div key={product.id} className="flex-shrink-0" style={{ width: 'clamp(190px, 21vw, 250px)' }}>
                    <ProductCard product={product} />
                  </div>
                ))
                : Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex-shrink-0 rounded-2xl animate-pulse"
                    style={{ width: 220, aspectRatio: '3/4', background: BORDER }} />
                ))
              }
            </div>
          </div>
        </section>
      )

      // ── BRAND SECTION ────────────────────────────────────────────────
      case 'brand': return brandHeading ? (
        <section style={{ background: WHITE }} className="py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center">

              {/* Image */}
              <FadeIn>
                {brandImage ? (
                  <div className="rounded-2xl overflow-hidden"
                    style={{ aspectRatio: '4/5', boxShadow: '0 20px 60px rgba(0,0,0,0.08)' }}>
                    <img src={brandImage} alt="Brand"
                      className="w-full h-full object-cover"
                      style={{ objectPosition: 'center 15%' }} />
                  </div>
                ) : (
                  <div className="rounded-2xl flex items-center justify-center"
                    style={{
                      aspectRatio: '4/5',
                      background: 'linear-gradient(135deg, #EDE9DF 0%, #E0D9CE 100%)',
                    }}>
                    <Gem className="h-16 w-16 opacity-20" style={{ color: GOLD }} />
                  </div>
                )}
              </FadeIn>

              {/* Text */}
              <FadeIn delay={120}>
                <div>
                  {brandTag && (
                    <p className="text-[10px] font-bold tracking-[0.3em] uppercase mb-4" style={{ color: GOLD }}>
                      {brandTag}
                    </p>
                  )}
                  <h2 className="font-serif font-bold mb-6"
                    style={{
                      color: HEADING,
                      fontSize: 'clamp(28px, 3vw, 44px)',
                      lineHeight: 1.12,
                      whiteSpace: 'pre-line',
                    }}>
                    {brandHeading}
                  </h2>
                  {brandBody && (
                    <p className="text-[15px] leading-[1.8] mb-8" style={{ color: BODY }}>{brandBody}</p>
                  )}
                  <Link to="/products"
                    className="inline-flex items-center gap-2 px-7 py-3.5 text-[13px] font-semibold rounded-full text-white transition-all hover:-translate-y-0.5"
                    style={{ background: GOLD }}
                    onMouseEnter={e => e.currentTarget.style.background = GOLD_H}
                    onMouseLeave={e => e.currentTarget.style.background = GOLD}>
                    {brandBtn} <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </FadeIn>
            </div>
          </div>
        </section>
      ) : null

      // ── WHY NIROTÉ ───────────────────────────────────────────────────
      case 'why-us':
      case 'why_choose_us': return (
        <section style={{ background: BG }} className="py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <FadeIn>
              <div className="text-center mb-12">
                <SectionLabel text="Our Promise" />
                <SectionHeading text="Why Shop NIROTÉ" />
              </div>
            </FadeIn>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {(whyItems.length > 0 ? whyItems.slice(0, 4) : DEFAULT_WHY).map((item, i) => {
                const Icon = (whyItems.length > 0
                  ? (ICON_MAP[(item as any).iconName] ?? Gem)
                  : (item as { icon: ElementType }).icon
                ) as ElementType
                const title = whyItems.length > 0 ? (item as any).title : (item as any).title
                const desc  = whyItems.length > 0 ? (item as any).description : (item as any).desc
                return (
                  <FadeIn key={title} delay={i * 80}>
                    <div className="flex flex-col items-center text-center p-7 rounded-2xl transition-all hover:-translate-y-1 hover:shadow-sm"
                      style={{ background: WHITE, border: `1px solid ${BORDER}` }}>
                      <div className="w-12 h-12 flex items-center justify-center rounded-full mb-5"
                        style={{ background: `${GOLD}14` }}>
                        <Icon className="h-5 w-5" style={{ color: GOLD }} />
                      </div>
                      <h3 className="text-[14px] font-semibold mb-2" style={{ color: HEADING }}>{title}</h3>
                      <p className="text-[12.5px] leading-relaxed" style={{ color: BODY }}>{desc}</p>
                    </div>
                  </FadeIn>
                )
              })}
            </div>
          </div>
        </section>
      )

      // ── TESTIMONIALS ─────────────────────────────────────────────────
      case 'testimonials': return featuredReviews.length > 0 ? (
        <section style={{ background: WHITE }} className="py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <FadeIn>
              <div className="text-center mb-12">
                <SectionLabel text="Real Reviews" />
                <SectionHeading text="What Our Customers Say" />
                <div className="flex items-center justify-center gap-1 mt-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4" style={{ fill: GOLD, color: GOLD }} />
                  ))}
                  {settings.reviewsSummary && (
                    <span className="ml-2 text-[13px] font-medium" style={{ color: BODY }}>{settings.reviewsSummary}</span>
                  )}
                </div>
              </div>
            </FadeIn>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {featuredReviews.slice(0, 3).map((r, i) => (
                <FadeIn key={r.id} delay={i * 90}>
                  <div className="flex flex-col p-6 rounded-2xl h-full"
                    style={{ background: BG, border: `1px solid ${BORDER}` }}>
                    <div className="flex items-center gap-[3px] mb-4">
                      {Array.from({ length: r.rating }).map((_, j) => (
                        <Star key={j} className="h-3.5 w-3.5" style={{ fill: GOLD, color: GOLD }} />
                      ))}
                    </div>
                    <p className="text-[13.5px] leading-relaxed flex-1 italic" style={{ color: HEADING }}>
                      "{r.body}"
                    </p>
                    <div className="flex items-center gap-3 mt-5 pt-4" style={{ borderTop: `1px solid ${BORDER}` }}>
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-[13px] font-bold text-white flex-shrink-0"
                        style={{ background: GOLD }}>
                        {r.userName.charAt(0).toUpperCase()}
                      </div>
                      <p className="text-[13px] font-semibold" style={{ color: HEADING }}>{r.userName}</p>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>
      ) : null

      // ── INSTAGRAM ────────────────────────────────────────────────────
      case 'instagram': return isSectionEnabled('instagram') ? (
        <section style={{ background: BG }} className="py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <FadeIn>
              <div className="text-center mb-10">
                <SectionLabel text="Follow Us" />
                <SectionHeading text={instagramHeading} />
                {instagramUrl && (
                  <p className="mt-2 text-[13px]" style={{ color: BODY }}>
                    @{instagramUrl.replace(/.*instagram\.com\//, '').replace(/\/$/, '')}
                  </p>
                )}
              </div>
            </FadeIn>

            {instagramPosts.length > 0 ? (
              <div className="grid grid-cols-3 md:grid-cols-6 gap-2 sm:gap-3">
                {instagramPosts.slice(0, 6).map((post, i) => (
                  <FadeIn key={post.id} delay={i * 45}>
                    <a href={post.postUrl || instagramUrl || '#'} target="_blank" rel="noopener noreferrer"
                      className="group relative block overflow-hidden rounded-xl" style={{ aspectRatio: '1/1' }}>
                      <img src={post.imageUrl} alt={post.caption || ''}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                    </a>
                  </FadeIn>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-3 md:grid-cols-6 gap-2 sm:gap-3">
                {CARD_TINTS.map((bg, i) => (
                  <FadeIn key={i} delay={i * 45}>
                    <a href={instagramUrl || '#'} target="_blank" rel="noopener noreferrer"
                      className="group relative block overflow-hidden rounded-xl"
                      style={{ aspectRatio: '1/1', background: bg }}>
                      <div className="absolute inset-0 flex items-center justify-center opacity-40 group-hover:opacity-20 transition-opacity">
                        <Gem className="h-8 w-8" style={{ color: GOLD }} />
                      </div>
                    </a>
                  </FadeIn>
                ))}
              </div>
            )}

            {instagramUrl && (
              <div className="text-center mt-8">
                <a href={instagramUrl} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-2.5 text-[13px] font-semibold rounded-full transition-all hover:-translate-y-0.5"
                  style={{ border: `1.5px solid ${BORDER}`, color: HEADING }}>
                  Follow on Instagram <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            )}
          </div>
        </section>
      ) : null

      // ── NEWSLETTER ───────────────────────────────────────────────────
      case 'newsletter': return (
        <section className="py-16 sm:py-20" style={{ background: BG, borderTop: `1px solid ${BORDER}` }}>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <FadeIn>
              <div className="max-w-xl mx-auto text-center">
                <div className="w-11 h-11 rounded-full flex items-center justify-center mx-auto mb-5"
                  style={{ background: `${GOLD}14` }}>
                  <Mail className="h-5 w-5" style={{ color: GOLD }} />
                </div>
                <SectionLabel text="Stay Connected" />
                <h2 className="font-serif font-bold mb-3"
                  style={{ color: HEADING, fontSize: 'clamp(24px, 2.5vw, 32px)' }}>
                  {settings.newsletterHeading || 'Join the NIROTÉ Circle'}
                </h2>
                <p className="text-[14px] leading-relaxed mb-8" style={{ color: BODY }}>
                  {settings.newsletterBody || 'Get exclusive launches, offers and styling inspiration.'}
                </p>

                {newsletterState === 'done' ? (
                  <div className="py-4 px-6 rounded-2xl text-[14px] font-medium"
                    style={{ background: `${GOLD}10`, color: GOLD, border: `1px solid ${GOLD}30` }}>
                    Thank you for subscribing! Welcome to NIROTÉ.
                  </div>
                ) : (
                  <form onSubmit={handleNewsletter} className="flex gap-2 max-w-sm mx-auto">
                    <input type="email" required placeholder="Your email address"
                      value={email} onChange={e => setEmail(e.target.value)}
                      className="flex-1 px-5 py-3 text-[13px] rounded-full focus:outline-none"
                      style={{ background: WHITE, border: `1.5px solid ${BORDER}`, color: HEADING }}
                      onFocus={e => e.currentTarget.style.borderColor = GOLD}
                      onBlur={e => e.currentTarget.style.borderColor = BORDER} />
                    <button type="submit" disabled={newsletterState === 'loading'}
                      className="px-6 py-3 text-[13px] font-semibold text-white rounded-full transition-all hover:brightness-90 disabled:opacity-60 flex-shrink-0"
                      style={{ background: GOLD }}>
                      {newsletterState === 'loading' ? '...' : 'Subscribe'}
                    </button>
                  </form>
                )}

                {newsletterState === 'error' && (
                  <p className="mt-3 text-[12px]" style={{ color: '#D32F2F' }}>Something went wrong. Please try again.</p>
                )}
                <p className="mt-4 text-[11px]" style={{ color: BODY }}>
                  No spam, ever. Unsubscribe anytime.
                </p>
              </div>
            </FadeIn>
          </div>
        </section>
      )

      default: return null
    }
  }

  return (
    <main style={{ background: BG }}>
      {orderedSectionKeys.map(key => {
        if (!isSectionEnabled(key)) return null
        const node = renderSection(key)
        return node ? <Fragment key={key}>{node}</Fragment> : null
      })}

      {/* Recently Viewed */}
      {recentlyViewed.length >= 2 && (
        <section style={{ background: WHITE, borderTop: `1px solid ${BORDER}` }} className="py-14">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <FadeIn>
              <h2 className="font-serif font-semibold mb-8" style={{ color: HEADING, fontSize: 22 }}>
                Recently Viewed
              </h2>
            </FadeIn>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4">
              {recentlyViewed.slice(0, 5).map((item, i) => (
                <FadeIn key={item.id} delay={i * 55}>
                  <Link to={`/products/${item.id}`}
                    className="group flex flex-col rounded-2xl overflow-hidden transition-all hover:-translate-y-1 hover:shadow-md"
                    style={{ border: `1px solid ${BORDER}`, background: WHITE }}>
                    <div className="aspect-square overflow-hidden" style={{ background: BG }}>
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Gem className="h-8 w-8 opacity-20" style={{ color: GOLD }} />
                        </div>
                      )}
                    </div>
                    <div className="p-3.5">
                      <p className="text-[12px] font-medium line-clamp-1 mb-1" style={{ color: HEADING }}>{item.name}</p>
                      <p className="text-[13px] font-bold" style={{ color: GOLD }}>₹{item.price.toLocaleString('en-IN')}</p>
                    </div>
                  </Link>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  )
}
