import { apiClient as api } from './client'

export interface NavItem {
  id: number; label: string; url: string; parentId: number | null
  displayOrder: number; isEnabled: boolean; openInNewTab: boolean
}
export interface Banner {
  id: number; badge?: string; heading: string; subheading?: string
  imageUrl?: string; mobileImageUrl?: string; textAlign: string
  btn1Text?: string; btn1Url?: string; btn2Text?: string; btn2Url?: string
  displayOrder: number; priority: number
}
export interface HomeSection {
  id: number; sectionKey: string; heading?: string; subheading?: string
  ctaText?: string; ctaUrl?: string; isEnabled: boolean; displayOrder: number
}
export interface Testimonial {
  id: number; authorName: string; authorCity?: string; authorImage?: string
  text: string; rating: number; displayOrder: number
}
export interface WhyItem {
  id: number; iconName: string; title: string; description: string; displayOrder: number
}
export interface InstagramPost {
  id: number; imageUrl: string; postUrl?: string; caption?: string; displayOrder: number
}
export interface Popup {
  id: number; popupType: string; heading?: string; subheading?: string
  imageUrl?: string; buttonText?: string; buttonUrl?: string
  couponCode?: string; triggerDelay: number
}
export interface SeoData {
  pageKey: string; metaTitle?: string; metaDesc?: string; keywords?: string; ogImage?: string
}
export interface FaqCategory { id: number; name: string; displayOrder: number }
export interface FaqItem { id: number; categoryId: number; question: string; answer: string; displayOrder: number }
export interface PolicySection { title: string; body: string }
export interface PolicyPage { slug: string; title: string; sections: PolicySection[] }
export interface CmsCollection {
  id: number; name: string; slug: string; bannerUrl?: string; imageUrl?: string
  description?: string; displayOrder: number
}

export const cmsApi = {
  getNavItems: (): Promise<NavItem[]> =>
    api.get('/cms/nav').then(r => r.data),

  getActiveBanners: (): Promise<Banner[]> =>
    api.get('/cms/banners/active').then(r => r.data),

  getHomeSections: (): Promise<HomeSection[]> =>
    api.get('/cms/sections').then(r => r.data),

  getTestimonials: (): Promise<Testimonial[]> =>
    api.get('/cms/testimonials').then(r => r.data),

  getWhyItems: (): Promise<WhyItem[]> =>
    api.get('/cms/why-choose-us').then(r => r.data),

  getInstagramPosts: (): Promise<InstagramPost[]> =>
    api.get('/cms/instagram').then(r => r.data),

  getActivePopups: (): Promise<Popup[]> =>
    api.get('/cms/popups/active').then(r => r.data),

  getSeo: (pageKey: string): Promise<SeoData> =>
    api.get(`/cms/seo/${pageKey}`).then(r => r.data).catch(() => ({ pageKey })),

  getFaq: (): Promise<{ categories: FaqCategory[]; items: FaqItem[] }> =>
    api.get('/cms/faq').then(r => r.data),

  getPolicy: (slug: string): Promise<PolicyPage | null> =>
    api.get(`/cms/policies/${slug}`).then(r => ({
      slug,
      title: r.data.title,
      sections: JSON.parse(r.data.sections) as PolicySection[],
    })).catch(() => null),

  getCollections: (): Promise<CmsCollection[]> =>
    api.get('/cms/collections').then(r => r.data),

  getCollectionBySlug: (slug: string): Promise<CmsCollection> =>
    api.get(`/cms/collections/${slug}`).then(r => r.data),

  getCollectionProducts: (slug: string): Promise<import('../types').ProductListItem[]> =>
    api.get(`/cms/collections/${slug}/products`).then(r => r.data),
}
