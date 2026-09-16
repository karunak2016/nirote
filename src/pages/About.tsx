import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Star, Heart, Gem, Award, Leaf, Users, ChevronDown, ChevronUp } from 'lucide-react'
import axios from 'axios'
import { reviewsApi } from '../api/reviews'
import type { Review } from '../types'

const BG      = '#FCFAF6'
const WHITE   = '#FFFFFF'
const GOLD    = '#C9A227'
const GOLD_H  = '#B68E1F'
const HEADING = '#1E1E1E'
const BODY    = '#666666'
const BORDER  = '#E9E3D7'

interface AboutData {
  heroImage: string; heading: string; subtitle: string; story: string
  mission: string; vision: string; promise: string; ctaText: string; ctaUrl: string
  image1: string; image2: string
  heroLabel: string
  storyLabel: string; storyHeading: string
  missionLabel: string; missionHeading: string
  missionCardLabel: string; visionCardLabel: string; promiseCardLabel: string
  craftLabel: string; craftHeading: string
  ctaLabel: string; ctaHeading: string; ctaBody: string
  faqLabel: string; faqHeading: string
  testimonialsLabel: string; testimonialsHeading: string
  values: string; faqs: string
}

const DEFAULTS: AboutData = {
  heroImage: '',
  heading: 'Our Story',
  subtitle: 'Curated with passion, worn with pride.',
  story: "NIROTÉ was born from a love of beautiful jewellery and a desire to make premium craftsmanship accessible to every woman. Founded in Jamshedpur, Jharkhand, we believe that every woman deserves to feel extraordinary — without compromise.\n\nOur journey began with a simple belief: that artificial jewellery, when made with the right materials and care, can be just as beautiful and meaningful as the real thing. Each piece in our collection is thoughtfully designed and quality-tested to ensure it stands the test of time.",
  mission: "Our mission is to craft premium artificial jewellery that celebrates the modern Indian woman — making everyday moments feel extraordinary.",
  vision: "To become the most loved jewellery brand for the modern Indian woman, known for quality, beauty, and meaningful craftsmanship.",
  promise: "Every piece is handpicked, quality-tested, and delivered with care. We stand behind everything we create.",
  ctaText: 'Shop Earrings',
  ctaUrl: '/products',
  image1: '', image2: '',
  heroLabel: 'Our Story',
  storyLabel: 'How We Started',
  storyHeading: 'The NIROTÉ Story',
  missionLabel: 'Who We Are',
  missionHeading: 'Our Mission & Vision',
  missionCardLabel: 'Our Mission',
  visionCardLabel: 'Our Vision',
  promiseCardLabel: 'Our Promise',
  craftLabel: 'What Sets Us Apart',
  craftHeading: 'The NIROTÉ Difference',
  ctaLabel: 'Ready to Explore?',
  ctaHeading: 'Find Your Perfect Piece',
  ctaBody: 'Every piece in our collection is handpicked for quality, beauty, and lasting craftsmanship. Shop our earring collection today.',
  faqLabel: 'FAQ',
  faqHeading: 'Common Questions',
  testimonialsLabel: 'Testimonials',
  testimonialsHeading: 'Loved by Our Customers',
  values: '',
  faqs: '',
}

const DEFAULT_VALUES = [
  { title: 'Premium Materials',  desc: 'We use only high-quality alloys, gold-plating, and finish techniques that resist tarnish and last.' },
  { title: 'Thoughtful Design',  desc: 'Every design is curated by our in-house team, drawing inspiration from Indian heritage and modern fashion.' },
  { title: 'Customer First',     desc: 'Your satisfaction is our north star. From packaging to after-sale support, we care at every step.' },
  { title: 'Community Driven',   desc: "We listen to our community and design pieces that reflect real women's real lives and celebrations." },
]

const CRAFT_ICONS = [Award, Leaf, Heart, Users]

const DEFAULT_FAQS = [
  { q: 'What materials do you use in your jewellery?',  a: 'We use high-quality alloys with premium gold plating and finishing techniques designed to resist tarnish. Each piece is carefully selected for durability and beauty.' },
  { q: 'Is NIROTÉ jewellery safe for sensitive skin?',  a: 'Most of our pieces are nickel-free and safe for regular wear. We recommend avoiding prolonged contact with water, sweat, and perfume to maintain the finish.' },
  { q: 'How long does shipping take?',                  a: 'We deliver across India within 5–7 business days. Express options are available at checkout. All orders are dispatched within 24 hours of placement.' },
  { q: 'What is your return policy?',                   a: 'We offer hassle-free 48-hour returns on all unused products in original packaging. Contact us via email or WhatsApp to initiate a return or exchange.' },
  { q: 'Can I get a bulk order or customisation?',      a: 'Yes! We welcome bulk orders for events, gifting, and weddings. Reach out to us at hello.nirote@gmail.com or on WhatsApp for personalised assistance.' },
]

async function fetchSetting(key: string): Promise<string> {
  try {
    const r = await axios.get(`/api/settings/${key}`)
    return r.data?.value ?? ''
  } catch { return '' }
}

export function About() {
  const [data, setData] = useState<AboutData>(DEFAULTS)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [featuredReviews, setFeaturedReviews] = useState<Review[]>([])

  useEffect(() => {
    const keys: (keyof AboutData)[] = [
      'heroImage', 'heading', 'subtitle', 'story',
      'mission', 'vision', 'promise', 'ctaText', 'ctaUrl',
      'image1', 'image2',
      'heroLabel',
      'storyLabel', 'storyHeading',
      'missionLabel', 'missionHeading',
      'missionCardLabel', 'visionCardLabel', 'promiseCardLabel',
      'craftLabel', 'craftHeading',
      'ctaLabel', 'ctaHeading', 'ctaBody',
      'faqLabel', 'faqHeading',
      'testimonialsLabel', 'testimonialsHeading',
      'values', 'faqs',
    ]
    Promise.all(keys.map(k => fetchSetting(`about_${k}`))).then(values => {
      const updated: Partial<AboutData> = {}
      keys.forEach((k, i) => { if (values[i]) updated[k] = values[i] })
      setData(prev => ({ ...prev, ...updated }))
    })
    reviewsApi.getFeatured(3).then(setFeaturedReviews).catch(() => {})
  }, [])

  const craftItems: { title: string; desc: string }[] = (() => {
    if (data.values) { try { return JSON.parse(data.values) } catch {} }
    return DEFAULT_VALUES
  })()

  const faqItems: { q: string; a: string }[] = (() => {
    if (data.faqs) { try { return JSON.parse(data.faqs) } catch {} }
    return DEFAULT_FAQS
  })()

  return (
    <div style={{ background: BG }}>

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden"
        style={{
          background: data.heroImage ? undefined : 'linear-gradient(160deg, #EDE9DF 0%, #F8F6F2 60%)',
          minHeight: 280,
        }}>
        {data.heroImage && (
          <>
            <img src={data.heroImage} alt="About NIROTÉ"
              className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0" style={{ background: 'rgba(20,16,10,0.52)' }} />
          </>
        )}
        <div className="relative z-10 flex flex-col items-center justify-center text-center px-6 py-14 sm:py-20">
          <p className="text-[10px] font-bold tracking-[0.32em] uppercase mb-4"
            style={{ color: data.heroImage ? 'rgba(255,255,255,0.7)' : GOLD }}>
            {data.heroLabel}
          </p>
          <h1 className="font-serif font-bold mb-4"
            style={{
              fontSize: 'clamp(36px, 5vw, 64px)',
              lineHeight: 1.06,
              color: data.heroImage ? WHITE : HEADING,
              letterSpacing: '-0.025em',
            }}>
            {data.heading}
          </h1>
          <p className="max-w-xl text-[16px] leading-relaxed"
            style={{ color: data.heroImage ? 'rgba(255,255,255,0.72)' : BODY }}>
            {data.subtitle}
          </p>
        </div>
      </section>

      {/* ── OUR STORY ───────────────────────────────────────────────── */}
      <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div>
              <p className="text-[10px] font-bold tracking-[0.3em] uppercase mb-3" style={{ color: GOLD }}>{data.storyLabel}</p>
              <h2 className="font-serif font-bold mb-6"
                style={{ color: HEADING, fontSize: 'clamp(26px, 3vw, 38px)', lineHeight: 1.15 }}>
                {data.storyHeading}
              </h2>
              <div className="space-y-4">
                {data.story.split('\n\n').map((para, i) => (
                  <p key={i} className="text-[15px] leading-[1.8]" style={{ color: BODY }}>{para}</p>
                ))}
              </div>
              <div className="mt-8 flex items-center gap-4">
                <div className="h-px flex-1" style={{ background: BORDER }} />
                <Gem className="h-4 w-4 flex-shrink-0" style={{ color: GOLD }} />
                <div className="h-px flex-1" style={{ background: BORDER }} />
              </div>
            </div>

            <div>
              {data.image1 ? (
                <div className="rounded-2xl overflow-hidden"
                  style={{ aspectRatio: '4/5', boxShadow: '0 20px 60px rgba(0,0,0,0.08)' }}>
                  <img src={data.image1} alt="The NIROTÉ Story"
                    className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="rounded-2xl flex items-center justify-center"
                  style={{
                    aspectRatio: '4/5',
                    background: 'linear-gradient(135deg, #EDE9DF 0%, #E0D9CE 100%)',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.06)',
                  }}>
                  <div className="text-center">
                    <Gem className="h-16 w-16 mx-auto mb-3" style={{ color: `${GOLD}40` }} />
                    <p className="text-[11px] font-medium tracking-widest uppercase" style={{ color: `${GOLD}60` }}>
                      Add image in Admin
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── MISSION & VISION ──────────────────────────────────────────── */}
      <section className="py-16 sm:py-20" style={{ background: BG }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-[10px] font-bold tracking-[0.3em] uppercase mb-3" style={{ color: GOLD }}>{data.missionLabel}</p>
            <h2 className="font-serif font-bold" style={{ color: HEADING, fontSize: 'clamp(26px, 3vw, 38px)' }}>
              {data.missionHeading}
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              { label: data.missionCardLabel, body: data.mission },
              { label: data.visionCardLabel,  body: data.vision  },
              { label: data.promiseCardLabel, body: data.promise },
            ].map((card, i) => (
              <div key={i} className="p-8 rounded-2xl"
                style={{
                  background: WHITE,
                  border: `1px solid ${i === 1 ? GOLD + '55' : BORDER}`,
                  boxShadow: i === 1 ? `0 4px 24px rgba(201,162,39,0.08)` : undefined,
                }}>
                <div className="w-8 h-0.5 mb-5" style={{ background: GOLD }} />
                <h3 className="font-serif font-bold mb-3" style={{ color: HEADING, fontSize: 18 }}>{card.label}</h3>
                <p className="text-[14px] leading-[1.75]" style={{ color: BODY }}>{card.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CRAFTSMANSHIP ─────────────────────────────────────────────── */}
      <section className="py-20 sm:py-24" style={{ background: WHITE }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-[10px] font-bold tracking-[0.3em] uppercase mb-3" style={{ color: GOLD }}>{data.craftLabel}</p>
            <h2 className="font-serif font-bold" style={{ color: HEADING, fontSize: 'clamp(26px, 3vw, 38px)' }}>
              {data.craftHeading}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {craftItems.map((item, idx) => {
              const Icon = CRAFT_ICONS[idx % CRAFT_ICONS.length]
              return (
                <div key={idx}
                  className="group p-7 rounded-2xl transition-all hover:-translate-y-1 hover:shadow-md"
                  style={{ border: `1px solid ${BORDER}`, background: BG }}>
                  <div className="w-11 h-11 flex items-center justify-center rounded-xl mb-5"
                    style={{ background: `${GOLD}14` }}>
                    <Icon className="h-5 w-5" style={{ color: GOLD }} />
                  </div>
                  <h3 className="font-semibold mb-2.5" style={{ color: HEADING, fontSize: 15 }}>{item.title}</h3>
                  <p className="text-[13px] leading-[1.7]" style={{ color: BODY }}>{item.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────────────────────────── */}
      {featuredReviews.length > 0 && (
        <section className="py-20 sm:py-24" style={{ background: WHITE }}>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <p className="text-[10px] font-bold tracking-[0.3em] uppercase mb-3" style={{ color: GOLD }}>{data.testimonialsLabel}</p>
              <h2 className="font-serif font-bold" style={{ color: HEADING, fontSize: 'clamp(26px, 3vw, 38px)' }}>
                {data.testimonialsHeading}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {featuredReviews.map(r => (
                <div key={r.id} className="flex flex-col p-7 rounded-2xl"
                  style={{ background: BG, border: `1px solid ${BORDER}` }}>
                  <div className="flex gap-[3px] mb-4">
                    {Array.from({ length: r.rating }).map((_, j) => (
                      <Star key={j} className="h-3.5 w-3.5" style={{ fill: GOLD, color: GOLD }} />
                    ))}
                  </div>
                  <p className="text-[14px] leading-[1.75] italic flex-1" style={{ color: HEADING }}>"{r.body}"</p>
                  <div className="flex items-center gap-3 mt-5 pt-4" style={{ borderTop: `1px solid ${BORDER}` }}>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-[14px] font-bold text-white flex-shrink-0"
                      style={{ background: GOLD }}>
                      {r.userName.charAt(0).toUpperCase()}
                    </div>
                    <p className="font-semibold text-[14px]" style={{ color: HEADING }}>{r.userName}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CTA ──────────────────────────────────────────────────────── */}
      <section className="py-20" style={{ background: BG, borderTop: `1px solid ${BORDER}` }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {data.image2 ? (
              <div className="rounded-2xl overflow-hidden"
                style={{ aspectRatio: '4/3', boxShadow: '0 16px 48px rgba(0,0,0,0.07)' }}>
                <img src={data.image2} alt="NIROTÉ Collection" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="rounded-2xl flex items-center justify-center"
                style={{ aspectRatio: '4/3', background: 'linear-gradient(135deg, #EDE9DF 0%, #E0D9CE 100%)' }}>
                <Gem className="h-16 w-16 opacity-30" style={{ color: GOLD }} />
              </div>
            )}

            <div>
              <p className="text-[10px] font-bold tracking-[0.3em] uppercase mb-3" style={{ color: GOLD }}>{data.ctaLabel}</p>
              <h2 className="font-serif font-bold mb-4"
                style={{ color: HEADING, fontSize: 'clamp(26px, 3vw, 40px)', lineHeight: 1.15 }}>
                {data.ctaHeading}
              </h2>
              <p className="text-[15px] leading-[1.75] mb-8" style={{ color: BODY }}>
                {data.ctaBody}
              </p>
              <div className="flex flex-wrap gap-3">
                <Link to={data.ctaUrl || '/products'}
                  className="inline-flex items-center gap-2 px-7 py-3.5 text-[13px] font-semibold rounded-full text-white transition-all hover:-translate-y-0.5"
                  style={{ background: GOLD }}
                  onMouseEnter={e => e.currentTarget.style.background = GOLD_H}
                  onMouseLeave={e => e.currentTarget.style.background = GOLD}>
                  {data.ctaText || 'Shop Earrings'} <ArrowRight className="h-4 w-4" />
                </Link>
                <Link to="/contact"
                  className="inline-flex items-center gap-2 px-7 py-3.5 text-[13px] font-semibold rounded-full transition-all hover:-translate-y-0.5"
                  style={{ border: `1.5px solid ${BORDER}`, color: HEADING }}>
                  Contact Us
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────── */}
      <section className="py-16 sm:py-20" style={{ background: WHITE, borderTop: `1px solid ${BORDER}` }}>
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <p className="text-[10px] font-bold tracking-[0.3em] uppercase mb-3" style={{ color: GOLD }}>{data.faqLabel}</p>
            <h2 className="font-serif font-bold" style={{ color: HEADING, fontSize: 'clamp(24px, 3vw, 34px)' }}>
              {data.faqHeading}
            </h2>
          </div>

          <div className="space-y-2">
            {faqItems.map((faq, i) => (
              <div key={i} className="rounded-xl overflow-hidden"
                style={{ border: `1px solid ${openFaq === i ? GOLD + '55' : BORDER}`, background: openFaq === i ? `${GOLD}06` : WHITE }}>
                <button
                  className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  <span className="text-[14px] font-semibold" style={{ color: HEADING }}>{faq.q}</span>
                  {openFaq === i
                    ? <ChevronUp className="h-4 w-4 flex-shrink-0" style={{ color: GOLD }} />
                    : <ChevronDown className="h-4 w-4 flex-shrink-0" style={{ color: BODY }} />}
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-5">
                    <p className="text-[14px] leading-[1.75]" style={{ color: BODY }}>{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
