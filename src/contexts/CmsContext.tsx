import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { cmsApi, type NavItem, type Banner, type HomeSection, type Testimonial, type WhyItem, type InstagramPost, type Popup, type CmsCollection } from '../api/cms'

interface CmsContextValue {
  navItems: NavItem[]
  banners: Banner[]
  homeSections: HomeSection[]
  testimonials: Testimonial[]
  whyItems: WhyItem[]
  instagramPosts: InstagramPost[]
  activePopups: Popup[]
  collections: CmsCollection[]
  loading: boolean
}

const CmsContext = createContext<CmsContextValue>({
  navItems: [], banners: [], homeSections: [], testimonials: [],
  whyItems: [], instagramPosts: [], activePopups: [], collections: [], loading: true,
})

export function CmsProvider({ children }: { children: ReactNode }) {
  const [navItems, setNavItems] = useState<NavItem[]>([])
  const [banners, setBanners] = useState<Banner[]>([])
  const [homeSections, setHomeSections] = useState<HomeSection[]>([])
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [whyItems, setWhyItems] = useState<WhyItem[]>([])
  const [instagramPosts, setInstagramPosts] = useState<InstagramPost[]>([])
  const [activePopups, setActivePopups] = useState<Popup[]>([])
  const [collections, setCollections] = useState<CmsCollection[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.allSettled([
      cmsApi.getNavItems().then(setNavItems),
      cmsApi.getActiveBanners().then(setBanners),
      cmsApi.getHomeSections().then(data => setHomeSections([...data].sort((a, b) => a.displayOrder - b.displayOrder))),
      cmsApi.getTestimonials().then(setTestimonials),
      cmsApi.getWhyItems().then(setWhyItems),
      cmsApi.getInstagramPosts().then(setInstagramPosts),
      cmsApi.getActivePopups().then(setActivePopups),
      cmsApi.getCollections().then(setCollections),
    ]).finally(() => setLoading(false))
  }, [])

  return (
    <CmsContext.Provider value={{ navItems, banners, homeSections, testimonials, whyItems, instagramPosts, activePopups, collections, loading }}>
      {children}
    </CmsContext.Provider>
  )
}

export function useCms() {
  return useContext(CmsContext)
}
