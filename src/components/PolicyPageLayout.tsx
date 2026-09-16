import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { cmsApi, type PolicySection } from '../api/cms'

const GOLD = '#C9A227'
const BG = '#FAF8F4'
const TEXT = '#1A1A1A'
const SECOND = '#6A6A6A'
const BORDER = '#ECE7DF'

interface Props {
  slug: string
  fallbackTitle: string
  icon: React.ReactNode
}

export function PolicyPageLayout({ slug, fallbackTitle, icon }: Props) {
  const [title, setTitle] = useState(fallbackTitle)
  const [sections, setSections] = useState<PolicySection[]>([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    cmsApi.getPolicy(slug).then(data => {
      if (data) {
        setTitle(data.title)
        setSections(data.sections)
      }
      setLoading(false)
    })
  }, [slug])

  return (
    <div style={{ background: BG, minHeight: '100vh' }}>
      <Helmet>
        <title>{title} | NIROTÉ</title>
      </Helmet>

      {/* Hero */}
      <div className="py-14 px-4 text-center" style={{ background: 'linear-gradient(180deg, #F0E8D0 0%, #FAF8F4 100%)' }}>
        <div className="w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: '#F5EDD4' }}>
          <div style={{ color: GOLD }}>{icon}</div>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-2" style={{ color: TEXT }}>{title}</h1>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-12">
        {loading ? (
          <div className="text-center py-16 text-gray-400">Loading...</div>
        ) : sections.length === 0 ? (
          <div className="text-center py-16" style={{ color: SECOND }}>
            <p>No content available yet. Please check back soon.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {sections.map((section, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-6" style={{ border: `1px solid ${BORDER}` }}>
                {section.title && (
                  <h2 className="text-base font-bold mb-3" style={{ color: TEXT }}>{section.title}</h2>
                )}
                <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: SECOND }}>{section.body}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
