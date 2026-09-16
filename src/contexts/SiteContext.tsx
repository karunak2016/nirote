import { createContext, useContext, useEffect, useState } from 'react'
import type { Category } from '../types'
import { settingsApi } from '../api/settings'
import { categoriesApi } from '../api/categories'

export interface SiteSettings {
  siteName: string
  logoUrl: string
  announcementBar: string
  footerAbout: string
  footerInstagram: string
  footerFacebook: string
  footerEmail: string
  footerCopyright: string
  whatsappNumber: string
  bannerTagline: string
  bannerHeading: string
  bannerDescription: string
  bannerImage: string
  bannerBtn1: string
  bannerBtn2: string
  offerStrip1: string
  offerStrip2: string
  offerStrip3: string
  marqueeText: string
  reviewsSummary: string
  newsletterHeading: string
  newsletterBody: string
}

interface SiteContextValue {
  settings: SiteSettings
  categories: Category[]
  parentCategories: Category[]
  homepageCategories: Category[]
  childrenOf: (parentId: number) => Category[]
  catUrl: (cat: Category) => string
}

const DEFAULTS: SiteSettings = {
  siteName: "Nirote'",
  logoUrl: '',
  announcementBar: "Free shipping on orders above ₹999  |  Premium artificial jewellery",
  footerAbout: "Premium artificial jewellery — earrings, necklaces and more.",
  footerInstagram: '',
  footerFacebook: '',
  footerEmail: 'hello.nirote@gmail.com',
  footerCopyright: "Nirote'",
  whatsappNumber: '',
  bannerTagline: 'New Arrivals 2026',
  bannerHeading: 'Premium Earrings For Every Occasion',
  bannerDescription: 'Discover our exclusive collection of premium earrings. From everyday studs to statement chandbalis, find your perfect pair.',
  bannerImage: '',
  bannerBtn1: 'Shop Earrings',
  bannerBtn2: 'New Arrivals',
  offerStrip1: '✦ Free Shipping Above ₹999',
  offerStrip2: '✦ Premium Curated Jewellery',
  offerStrip3: '✦ Easy 48-Hour Returns',
  marqueeText: 'PREMIUM JEWELLERY  ✦  FREE SHIPPING ₹999+  ✦  EASY RETURNS  ✦  EXCLUSIVE DESIGNS  ✦  NEW ARRIVALS WEEKLY  ✦  ',
  reviewsSummary: '4.9 out of 5 from 500+ reviews',
  newsletterHeading: 'Join the NIROTÉ Circle',
  newsletterBody: 'Be the first to hear about new arrivals, exclusive offers and festive collections.',
}

const DB_KEYS: Record<keyof SiteSettings, string> = {
  siteName: 'SiteName',
  logoUrl: 'LogoUrl',
  announcementBar: 'AnnouncementBar',
  footerAbout: 'FooterAbout',
  footerInstagram: 'FooterInstagram',
  footerFacebook: 'FooterFacebook',
  footerEmail: 'FooterEmail',
  footerCopyright: 'FooterCopyright',
  whatsappNumber: 'WhatsappNumber',
  bannerTagline: 'BannerTagline',
  bannerHeading: 'BannerHeading',
  bannerDescription: 'BannerDescription',
  bannerImage: 'BannerImage',
  bannerBtn1: 'BannerBtn1',
  bannerBtn2: 'BannerBtn2',
  offerStrip1: 'OfferStrip1',
  offerStrip2: 'OfferStrip2',
  offerStrip3: 'OfferStrip3',
  marqueeText: 'MarqueeText',
  reviewsSummary: 'ReviewsSummary',
  newsletterHeading: 'NewsletterHeading',
  newsletterBody: 'NewsletterBody',
}

const SiteCtx = createContext<SiteContextValue>({
  settings: DEFAULTS,
  categories: [],
  parentCategories: [],
  homepageCategories: [],
  childrenOf: () => [],
  catUrl: (c) => `/products/category/${c.slug || c.name.replace(/\s+/g, '-')}`,
})

export function SiteProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULTS)
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    const keys = Object.keys(DB_KEYS) as (keyof SiteSettings)[]
    Promise.all([
      categoriesApi.list(),
      ...keys.map((k) => settingsApi.get(DB_KEYS[k]).catch(() => ({ value: '' }))),
    ]).then(([cats, ...vals]) => {
      setCategories((cats as Category[]).filter((c) => c.isActive))
      const s = { ...DEFAULTS }
      keys.forEach((k, i) => {
        const v = (vals[i] as any).value
        if (v) s[k] = v
      })
      setSettings(s)
    })
  }, [])

  const parentCategories = categories.filter((c) => !c.parentId)
  const homepageCategories = parentCategories
  const childrenOf = (parentId: number) => categories.filter((c) => c.parentId === parentId)
  const catUrl = (c: Category) => `/products/category/${c.slug || c.name.toLowerCase().replace(/\s+/g, '-')}`

  return (
    <SiteCtx.Provider value={{ settings, categories, parentCategories, homepageCategories, childrenOf, catUrl }}>
      {children}
    </SiteCtx.Provider>
  )
}

export const useSite = () => useContext(SiteCtx)
