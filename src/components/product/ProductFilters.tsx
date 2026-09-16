import { useEffect, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { Star } from 'lucide-react'
import type { Category } from '../../types'
import { categoriesApi } from '../../api/categories'
import { settingsApi } from '../../api/settings'

const FABRICS = ['Gold Plated', 'Silver Plated', 'Rose Gold Plated', 'Oxidized', 'Brass', 'Alloy', 'Kundan', 'Meenakari']

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana',
  'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
]

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'name', label: 'Name A–Z' },
]

const toFabricSlug   = (s: string) => s.replace(/\s+/g, '-')
const fromFabricSlug = (s: string) => s.replace(/-/g, ' ')

export function ProductFilters() {
  const navigate = useNavigate()
  const { categorySlug, fabric: fabricParam, sortBy: sortByParam } = useParams<{ categorySlug?: string; fabric?: string; sortBy?: string }>()
  const [searchParams, setSearchParams] = useSearchParams()
  const [categories, setCategories] = useState<Category[]>([])
  const [stateFilterEnabled, setStateFilterEnabled] = useState(false)

  useEffect(() => {
    categoriesApi.list().then(setCategories).catch(() => {})
    settingsApi.get('StateFilterEnabled')
      .then((s) => setStateFilterEnabled(s.value === 'true'))
      .catch(() => {})
  }, [])

  function buildPath(catSlug?: string, fab?: string, sort?: string, queryStr?: string) {
    let path = '/products'
    if (catSlug) path += `/category/${catSlug}`
    if (fab)     path += `/fabric/${toFabricSlug(fab)}`
    if (sort)    path += `/sortBy/${sort}`
    return queryStr ? `${path}?${queryStr}` : path
  }

  function qs() {
    const p = new URLSearchParams(searchParams)
    p.delete('page')
    p.delete('sortBy')
    return p.toString()
  }

  function selectCategory(name?: string) { navigate(buildPath(name, fabricParam, sortByParam, qs())) }
  function selectFabric(fab?: string)    { navigate(buildPath(categorySlug, fab, sortByParam, qs())) }
  function selectSort(sort?: string)     { navigate(buildPath(categorySlug, fabricParam, sort, qs())) }

  function update(key: string, value: string | undefined) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (value) next.set(key, value)
      else next.delete(key)
      next.delete('page')
      return next
    })
  }

  function clearAll() { navigate('/products') }

  const selectedCategory  = categorySlug ?? ''
  const selectedFabric    = fabricParam ? fromFabricSlug(fabricParam) : ''
  const selectedSort      = sortByParam ?? ''
  const minPrice          = searchParams.get('minPrice') ?? ''
  const maxPrice          = searchParams.get('maxPrice') ?? ''
  const selectedState     = searchParams.get('state') ?? ''
  const selectedMinRating = searchParams.get('minRating') ?? ''
  const hasActiveFilters  = !!(selectedCategory || selectedFabric || selectedSort || minPrice || maxPrice || selectedState || selectedMinRating)

  const heading = 'text-[10px] font-bold uppercase tracking-[0.25em] text-gray-400 mb-3'
  const btn = (active: boolean) =>
    `text-[12px] block text-left py-0.5 transition-colors ${active ? 'font-semibold text-gray-900' : 'text-gray-500 hover:text-gray-800'}`

  const inputCls = 'w-full px-2 py-1.5 text-xs bg-white text-gray-700 placeholder-gray-400 focus:outline-none rounded'
  const inputStyle = { border: '1px solid #e8e3db' }

  return (
    <aside className="w-full space-y-6">

      {/* Sort */}
      <div>
        <h3 className={heading}>Sort By</h3>
        <select value={selectedSort} onChange={(e) => selectSort(e.target.value || undefined)}
          className="w-full px-3 py-2 text-xs bg-white text-gray-700 focus:outline-none rounded"
          style={inputStyle}>
          <option value="">Featured</option>
          {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {/* Category */}
      {categories.length > 0 && (
        <div>
          <h3 className={heading}>Category</h3>
          <ul className="space-y-1">
            <li>
              <button onClick={() => selectCategory(undefined)}
                className={`text-[12px] block text-left py-0.5 pl-2 border-l-2 transition-colors ${!selectedCategory ? 'font-semibold border-[#c9a84c]' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
                style={!selectedCategory ? { color: '#c9a84c' } : undefined}>
                All
              </button>
            </li>
            {categories.map((c) => {
              const slug = c.slug || c.name.toLowerCase().replace(/\s+/g, '-')
              const isActive = selectedCategory === slug
              return (
                <li key={c.id}>
                  <button onClick={() => selectCategory(slug)}
                    className={`text-[12px] block text-left py-0.5 pl-2 border-l-2 transition-colors ${isActive ? 'font-semibold border-[#c9a84c]' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
                    style={isActive ? { color: '#c9a84c' } : undefined}>
                    {c.name}
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      )}

      {/* Material */}
      <div>
        <h3 className={heading}>Material</h3>
        <ul className="space-y-2">
          <li><button onClick={() => selectFabric(undefined)} className={btn(!selectedFabric)}>All</button></li>
          {FABRICS.map((f) => (
            <li key={f}>
              <button onClick={() => selectFabric(f)} className={btn(selectedFabric === f)}>{f}</button>
            </li>
          ))}
        </ul>
      </div>

      {/* State */}
      {stateFilterEnabled && (
        <div>
          <h3 className={heading}>Origin</h3>
          <ul className="space-y-2">
            <li><button onClick={() => update('state', undefined)} className={btn(!selectedState)}>All</button></li>
            {INDIAN_STATES.map((s) => (
              <li key={s}>
                <button onClick={() => update('state', s)} className={btn(selectedState === s)}>{s}</button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Rating */}
      <div>
        <h3 className={heading}>Rating</h3>
        <ul className="space-y-2">
          <li><button onClick={() => update('minRating', undefined)} className={btn(!selectedMinRating)}>All Ratings</button></li>
          {[4, 3, 2].map((r) => (
            <li key={r}>
              <button onClick={() => update('minRating', String(r))}
                className={`flex items-center gap-1 text-xs transition-colors ${selectedMinRating === String(r) ? 'font-semibold text-gray-900' : 'text-gray-500 hover:text-gray-800'}`}>
                {Array.from({ length: 5 }, (_, i) => (
                  <Star key={i} className="h-3 w-3" style={{ fill: i < r ? '#b8952a' : 'transparent', color: i < r ? '#b8952a' : '#d1d5db' }} />
                ))}
                <span className="ml-0.5">& up</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Price */}
      <div>
        <h3 className={heading}>Price (Rs.)</h3>
        <div className="flex gap-2">
          <input type="number" placeholder="Min" value={minPrice}
            onChange={(e) => update('minPrice', e.target.value || undefined)}
            className={inputCls} style={inputStyle} />
          <input type="number" placeholder="Max" value={maxPrice}
            onChange={(e) => update('maxPrice', e.target.value || undefined)}
            className={inputCls} style={inputStyle} />
        </div>
      </div>

      {hasActiveFilters && (
        <button onClick={clearAll} className="text-xs text-gray-500 hover:text-gray-800 underline transition-colors">
          Clear all filters
        </button>
      )}
    </aside>
  )
}
