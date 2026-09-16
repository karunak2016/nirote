import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { cmsApi, type FaqCategory, type FaqItem } from '../api/cms'

const GOLD = '#C9A227'
const BG = '#FAF8F4'
const TEXT = '#1A1A1A'
const SECOND = '#6A6A6A'
const BORDER = '#ECE7DF'

export function FAQ() {
  const [categories, setCategories] = useState<FaqCategory[]>([])
  const [items, setItems] = useState<FaqItem[]>([])
  const [openId, setOpenId] = useState<number | null>(null)
  const [activeCategory, setActiveCategory] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    cmsApi.getFaq().then(data => {
      setCategories(data.categories)
      setItems(data.items)
      if (data.categories.length > 0) setActiveCategory(data.categories[0].id)
      setLoading(false)
    })
  }, [])

  const filteredItems = (activeCategory
    ? items.filter(i => i.categoryId === activeCategory)
    : items
  ).sort((a, b) => a.displayOrder - b.displayOrder)

  return (
    <div style={{ background: BG, minHeight: '100vh' }}>
      <Helmet>
        <title>FAQ | NIROTÉ</title>
        <meta name="description" content="Find answers to common questions about orders, shipping, returns, and products." />
      </Helmet>

      {/* Hero */}
      <div className="py-14 px-4 text-center" style={{ background: 'linear-gradient(180deg, #F0E8D0 0%, #FAF8F4 100%)' }}>
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] mb-3" style={{ color: GOLD }}>Help Centre</p>
        <h1 className="text-3xl md:text-4xl font-bold mb-3" style={{ color: TEXT }}>Frequently Asked Questions</h1>
        <p className="text-base" style={{ color: SECOND }}>Find answers to the most common questions below.</p>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {loading ? (
          <div className="text-center py-16 text-gray-400">Loading...</div>
        ) : (
          <>
            {/* Category tabs */}
            {categories.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-8 justify-center">
                <button
                  onClick={() => setActiveCategory(null)}
                  className="px-4 py-2 text-sm font-medium rounded-full transition-colors"
                  style={{
                    background: activeCategory === null ? TEXT : 'white',
                    color: activeCategory === null ? 'white' : SECOND,
                    border: `1px solid ${activeCategory === null ? TEXT : BORDER}`,
                  }}
                >
                  All
                </button>
                {categories.sort((a, b) => a.displayOrder - b.displayOrder).map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className="px-4 py-2 text-sm font-medium rounded-full transition-colors"
                    style={{
                      background: activeCategory === cat.id ? TEXT : 'white',
                      color: activeCategory === cat.id ? 'white' : SECOND,
                      border: `1px solid ${activeCategory === cat.id ? TEXT : BORDER}`,
                    }}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            )}

            {/* FAQ Accordions */}
            <div className="space-y-2">
              {filteredItems.map(item => (
                <div key={item.id} className="bg-white rounded-2xl overflow-hidden" style={{ border: `1px solid ${BORDER}` }}>
                  <button
                    className="w-full flex items-center justify-between px-6 py-4 text-left"
                    onClick={() => setOpenId(openId === item.id ? null : item.id)}
                  >
                    <span className="text-sm font-semibold pr-4" style={{ color: TEXT }}>{item.question}</span>
                    {openId === item.id
                      ? <ChevronUp className="h-4 w-4 flex-shrink-0" style={{ color: GOLD }} />
                      : <ChevronDown className="h-4 w-4 flex-shrink-0" style={{ color: SECOND }} />
                    }
                  </button>
                  {openId === item.id && (
                    <div className="px-6 pb-5">
                      <div className="h-px mb-4" style={{ background: BORDER }} />
                      <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: SECOND }}>{item.answer}</p>
                    </div>
                  )}
                </div>
              ))}
              {filteredItems.length === 0 && (
                <p className="text-center text-sm py-12" style={{ color: SECOND }}>No questions in this category yet.</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
