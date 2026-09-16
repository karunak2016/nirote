import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { SlidersHorizontal, X } from 'lucide-react'
import type { ProductListItem } from '../types'
import { productsApi } from '../api/products'
import { categoriesApi } from '../api/categories'
import { ProductCard } from '../components/product/ProductCard'
import { ProductFilters } from '../components/product/ProductFilters'
import { Spinner } from '../components/ui/Spinner'

const fromFabricSlug = (s: string) => s.replace(/-/g, ' ')

export function Products() {
  const { categorySlug, fabric: fabricParam, sortBy: sortByParam } = useParams<{ categorySlug?: string; fabric?: string; sortBy?: string }>()
  const fabric = fabricParam ? fromFabricSlug(fabricParam) : undefined
  const [searchParams] = useSearchParams()
  const [products, setProducts] = useState<ProductListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [categoryName, setCategoryName] = useState<string>('')

  const q = searchParams.get('q')

  useEffect(() => {
    setLoading(true)
    setCategoryName('')

    async function load() {
      let categoryId: number | undefined
      if (categorySlug) {
        const cats = await categoriesApi.list().catch(() => [])
        const matched = cats.find(
          (c) => c.slug === categorySlug ||
                 c.name.toLowerCase().replace(/\s+/g, '-') === categorySlug.toLowerCase()
        )
        categoryId = matched?.id
        if (matched) setCategoryName(matched.name)
      }

      const filters = {
        categoryId,
        fabric,
        minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined,
        maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined,
        sortBy: (sortByParam as 'price_asc' | 'price_desc' | 'newest' | 'name') ?? undefined,
        state: searchParams.get('state') ?? undefined,
        minRating: searchParams.get('minRating') ? Number(searchParams.get('minRating')) : undefined,
      }

      const result = await (q ? productsApi.search(q) : productsApi.list(filters))
      return result.items
    }

    load()
      .then(setProducts)
      .catch(() => setProducts([]))
      .finally(() => setLoading(false))
  }, [categorySlug, fabric, sortByParam, searchParams, q])

  const pageTitle = q
    ? `Search: "${q}" | Niroté`
    : categoryName
      ? `${categoryName} | Niroté`
      : fabric
        ? `${fabric} Jewellery | Niroté`
        : 'Shop All Jewellery | Niroté'

  const pageDesc = q
    ? `Shop premium jewellery matching "${q}" at Niroté.`
    : categoryName
      ? `Browse our collection of ${categoryName} at Niroté. Premium jewellery for every occasion.`
      : 'Browse our full collection of premium jewellery — earrings, necklaces, bangles and more at Niroté.'

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDesc} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDesc} />
        <meta property="og:type" content="website" />
        {q && <meta name="robots" content="noindex, follow" />}
      </Helmet>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-gray-900">
            {q ? `Search: "${q}"` : categoryName || 'All Jewellery'}
          </h1>
          {!loading && (
            <p className="mt-1 text-sm text-gray-500">{products.length} product{products.length !== 1 ? 's' : ''}</p>
          )}
        </div>
        <button
          onClick={() => setShowFilters((v) => !v)}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 border border-gray-200 transition-colors lg:hidden"
        >
          {showFilters ? <X className="h-4 w-4" /> : <SlidersHorizontal className="h-4 w-4" />}
          Filters
        </button>
      </div>

      <div className="mt-6 flex gap-8">
        <div className={`${showFilters ? 'block' : 'hidden'} w-48 flex-shrink-0 lg:block`}>
          <ProductFilters />
        </div>

        <div className="flex-1">
          {loading ? (
            <div className="flex justify-center py-24"><Spinner size="lg" /></div>
          ) : products.length === 0 ? (
            <div className="py-24 text-center text-gray-500">
              <p className="text-lg font-serif text-gray-700">No products found</p>
              <p className="mt-1 text-sm">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
