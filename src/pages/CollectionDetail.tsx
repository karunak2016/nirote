import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Gem, Sparkles } from 'lucide-react'
import { cmsApi, type CmsCollection } from '../api/cms'
import type { ProductListItem } from '../types'
import { ProductCard } from '../components/product/ProductCard'
import { Spinner } from '../components/ui/Spinner'

const GOLD = '#C9A227'
const BG = '#FAF8F4'
const TEXT = '#1A1A1A'
const SECOND = '#6A6A6A'
const BORDER = '#ECE7DF'

export function CollectionDetail() {
  const { slug } = useParams<{ slug: string }>()
  const [collection, setCollection] = useState<CmsCollection | null>(null)
  const [products, setProducts] = useState<ProductListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!slug) return
    setLoading(true)
    setNotFound(false)
    Promise.all([
      cmsApi.getCollectionBySlug(slug),
      cmsApi.getCollectionProducts(slug),
    ])
      .then(([col, prods]) => {
        setCollection(col)
        setProducts(prods)
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]" style={{ background: BG }}>
        <Spinner size="lg" />
      </div>
    )
  }

  if (notFound || !collection) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6" style={{ background: BG }}>
        <Gem className="h-12 w-12 mb-4 opacity-20" style={{ color: GOLD }} />
        <h2 className="font-serif text-2xl font-bold mb-2" style={{ color: TEXT }}>Collection not found</h2>
        <p className="text-sm mb-6" style={{ color: SECOND }}>This collection may have been removed or renamed.</p>
        <Link to="/collections" className="text-sm font-medium underline" style={{ color: GOLD }}>Back to all collections</Link>
      </div>
    )
  }

  return (
    <div style={{ background: BG }}>
      {/* Hero */}
      <section className="relative overflow-hidden"
        style={{ minHeight: collection.bannerUrl ? 360 : 260 }}>
        {collection.bannerUrl ? (
          <>
            <img
              src={collection.bannerUrl}
              alt={collection.name}
              className="absolute inset-0 w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0"
              style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.55) 100%)' }} />
          </>
        ) : (
          <div className="absolute inset-0"
            style={{ background: 'radial-gradient(ellipse 80% 70% at 50% -10%, #F0E8D0 0%, #FAF8F4 70%)' }} />
        )}

        <div className="relative z-10 flex flex-col items-center justify-center text-center px-6 py-20"
          style={{ minHeight: 'inherit' }}>
          <Link
            to="/collections"
            className="flex items-center gap-1.5 text-[12px] font-medium mb-8 transition-opacity hover:opacity-70"
            style={{ color: collection.bannerUrl ? 'rgba(255,255,255,0.8)' : SECOND }}>
            <ArrowLeft className="h-3.5 w-3.5" />
            All Collections
          </Link>

          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-3.5 w-3.5" style={{ color: GOLD }} />
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em]" style={{ color: GOLD }}>
              Curated Collection
            </p>
            <Sparkles className="h-3.5 w-3.5" style={{ color: GOLD }} />
          </div>

          <h1
            className="font-serif text-[40px] sm:text-[54px] font-bold leading-tight mb-4"
            style={{ color: collection.bannerUrl ? '#fff' : TEXT }}>
            {collection.name}
          </h1>

          {collection.description && (
            <p
              className="text-[15px] leading-relaxed max-w-xl"
              style={{ color: collection.bannerUrl ? 'rgba(255,255,255,0.8)' : SECOND }}>
              {collection.description}
            </p>
          )}

          <div className="mt-5 flex items-center gap-2">
            <div className="h-px w-8" style={{ background: GOLD }} />
            <p className="text-[11px] font-medium uppercase tracking-widest" style={{ color: GOLD }}>
              {products.length} {products.length === 1 ? 'Piece' : 'Pieces'}
            </p>
            <div className="h-px w-8" style={{ background: GOLD }} />
          </div>
        </div>
      </section>

      {/* Products */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mb-5"
              style={{ background: '#F0E8D0' }}>
              <Gem className="h-7 w-7" style={{ color: GOLD }} />
            </div>
            <h3 className="font-serif text-xl font-bold mb-2" style={{ color: TEXT }}>
              Coming Soon
            </h3>
            <p className="text-[14px] mb-8 max-w-sm" style={{ color: SECOND }}>
              We're hand-selecting pieces for this collection. Check back soon or explore all jewellery.
            </p>
            <Link
              to="/products"
              className="px-7 py-3 text-[13px] font-semibold rounded-full text-white transition-opacity hover:opacity-90"
              style={{ background: GOLD }}>
              Shop All Jewellery
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </section>

      {/* Related collections link */}
      <div className="text-center pb-16" style={{ borderTop: `1px solid ${BORDER}` }}>
        <div className="pt-12">
          <p className="text-[11px] font-semibold uppercase tracking-[0.25em] mb-4" style={{ color: GOLD }}>
            Explore More
          </p>
          <Link
            to="/collections"
            className="inline-flex items-center gap-2 text-[14px] font-medium transition-opacity hover:opacity-70"
            style={{ color: TEXT }}>
            <ArrowLeft className="h-4 w-4" />
            View All Collections
          </Link>
        </div>
      </div>
    </div>
  )
}
