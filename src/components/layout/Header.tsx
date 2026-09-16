import { useState, useRef, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { ShoppingBag, Heart, User, Search, Menu, X, ChevronDown } from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'
import { useCartStore } from '../../stores/cartStore'
import { useWishlistStore } from '../../stores/wishlistStore'
import { useSite } from '../../contexts/SiteContext'
import { useCms } from '../../contexts/CmsContext'

const GOLD   = '#C9A227'
const BORDER = '#E9E3D7'
const TEXT   = '#1E1E1E'
const MUTED  = '#888888'

export function Header() {
  const [mobileOpen, setMobileOpen]   = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [shopOpen, setShopOpen]       = useState(false)
  const [searchOpen, setSearchOpen]   = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const navigate = useNavigate()
  const shopRef  = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  const { user, isAuthenticated, logout } = useAuthStore()
  const { itemCount, openDrawer } = useCartStore()
  const { items: wishlistItems } = useWishlistStore()
  const { settings, parentCategories, childrenOf, catUrl } = useSite()
  const { navItems, homeSections } = useCms()
  const announcementEnabled = homeSections.length === 0 || (homeSections.find(s => s.sectionKey === 'announcement')?.isEnabled ?? true)

  const displayName = user?.name?.split(' ')[0] ?? ''

  // Enabled root nav items from CMS, sorted by displayOrder
  const rootItems = navItems
    .filter(n => n.isEnabled && n.parentId === null)
    .sort((a, b) => a.displayOrder - b.displayOrder)

  // Get children for a nav item
  const navChildren = (parentId: number) =>
    navItems.filter(n => n.parentId === parentId && n.isEnabled).sort((a, b) => a.displayOrder - b.displayOrder)

  // Detect if an item represents the Shop/categories dropdown
  const isShopItem = (label: string, url: string) =>
    label.toLowerCase() === 'shop' || (url === '/products' && label.toLowerCase() !== 'new arrivals')

  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      if (shopRef.current && !shopRef.current.contains(e.target as Node)) setShopOpen(false)
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [])

  useEffect(() => {
    if (searchOpen) setTimeout(() => searchInputRef.current?.focus(), 80)
  }, [searchOpen])

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/products?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
      setSearchOpen(false)
      setMobileOpen(false)
    }
  }

  function handleLogout() { logout(); navigate('/') }

  const navLinkStyle = (isActive: boolean): React.CSSProperties => ({
    fontSize: 13,
    fontWeight: isActive ? 600 : 400,
    color: isActive ? TEXT : MUTED,
    letterSpacing: '0.01em',
    transition: 'color 0.15s',
  })

  // Categories shop dropdown (always available)
  function ShopDropdown() {
    return (
      <div ref={shopRef} className="relative">
        <button onClick={() => setShopOpen(v => !v)}
          className="flex items-center gap-1 hover:text-gray-900 transition-colors"
          style={navLinkStyle(shopOpen)}>
          Shop
          <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${shopOpen ? 'rotate-180' : ''}`} />
        </button>
        {shopOpen && (
          <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-52 py-2 z-50 bg-white rounded-xl"
            style={{ border: `1px solid ${BORDER}`, boxShadow: '0 8px 32px rgba(0,0,0,0.08)' }}>
            <Link to="/products" onClick={() => setShopOpen(false)}
              className="block px-4 py-2.5 text-[13px] text-gray-500 hover:text-gray-900 transition-colors">
              All Products
            </Link>
            <div className="my-1 border-t" style={{ borderColor: BORDER }} />
            {parentCategories.slice(0, 4).map(parent => (
              <Link key={parent.id} to={catUrl(parent)} onClick={() => setShopOpen(false)}
                className="block px-4 py-2 text-[13px] font-semibold text-gray-800 hover:text-gray-900 transition-colors">
                {parent.name}
              </Link>
            ))}
            <div className="my-1 border-t" style={{ borderColor: BORDER }} />
            <Link to="/products" onClick={() => setShopOpen(false)}
              className="block px-4 py-2.5 text-[13px] font-semibold hover:text-gray-900 transition-colors"
              style={{ color: '#C9A227' }}>
              View All →
            </Link>
          </div>
        )}
      </div>
    )
  }

  // Render a single desktop nav item (or dropdown if it has children)
  function DesktopNavItem({ item }: { item: typeof rootItems[0] }) {
    const children = navChildren(item.id)

    if (isShopItem(item.label, item.url)) {
      return <ShopDropdown />
    }

    if (children.length > 0) {
      return (
        <div className="relative group">
          <Link to={item.url}
            target={item.openInNewTab ? '_blank' : undefined}
            rel={item.openInNewTab ? 'noopener noreferrer' : undefined}
            className="flex items-center gap-1 hover:text-gray-900 transition-colors"
            style={navLinkStyle(false)}>
            {item.label}
            <ChevronDown className="h-3 w-3" />
          </Link>
          <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-44 py-2 z-50 bg-white rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all"
            style={{ border: `1px solid ${BORDER}`, boxShadow: '0 8px 32px rgba(0,0,0,0.08)' }}>
            {children.map(child => (
              <Link key={child.id} to={child.url}
                target={child.openInNewTab ? '_blank' : undefined}
                rel={child.openInNewTab ? 'noopener noreferrer' : undefined}
                className="block px-4 py-2 text-[12px] text-gray-600 hover:text-gray-900 transition-colors">
                {child.label}
              </Link>
            ))}
          </div>
        </div>
      )
    }

    return (
      <NavLink to={item.url}
        end={item.url === '/'}
        target={item.openInNewTab ? '_blank' : undefined}
        rel={item.openInNewTab ? 'noopener noreferrer' : undefined}
        style={({ isActive }) => navLinkStyle(isActive)}
        className="hover:text-gray-900 transition-colors">
        {item.label}
      </NavLink>
    )
  }

  // Fallback hardcoded nav when CMS isn't loaded yet
  const fallbackNav = (
    <>
      <NavLink to="/" end style={({ isActive }) => navLinkStyle(isActive)} className="hover:text-gray-900 transition-colors">Home</NavLink>
      <ShopDropdown />
      <NavLink to="/products/sortBy/newest" style={({ isActive }) => navLinkStyle(isActive)} className="hover:text-gray-900 transition-colors">New Arrivals</NavLink>
      <NavLink to="/about" style={({ isActive }) => navLinkStyle(isActive)} className="hover:text-gray-900 transition-colors">About</NavLink>
      <NavLink to="/contact" style={({ isActive }) => navLinkStyle(isActive)} className="hover:text-gray-900 transition-colors">Contact</NavLink>
    </>
  )

  return (
    <header className="sticky top-0 z-50 bg-white" style={{ borderBottom: `1px solid ${BORDER}` }}>
      {/* Announcement bar */}
      {announcementEnabled && (
        <div className="py-2 text-center text-[11px] font-medium tracking-[0.12em] uppercase"
          style={{ background: TEXT, color: '#FFFFFF' }}>
          {settings.announcementBar || 'FREE SHIPPING ABOVE ₹999 · PREMIUM JEWELLERY · EASY RETURNS'}
        </div>
      )}

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative flex h-[60px] items-center justify-between">

          {/* Logo */}
          <Link to="/" className="flex-shrink-0 z-10">
            {settings.logoUrl ? (
              <img src={settings.logoUrl} alt={settings.siteName} className="h-8 w-auto object-contain" />
            ) : (
              <span className="font-serif text-[1.35rem] font-bold tracking-[0.1em]" style={{ color: GOLD }}>NIROTÉ</span>
            )}
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-8">
            {rootItems.length > 0
              ? rootItems.map(item => <DesktopNavItem key={item.id} item={item} />)
              : fallbackNav
            }
          </nav>

          {/* Right icons */}
          <div className="flex items-center gap-1 z-10">
            <button
              onClick={() => { setSearchOpen(v => !v); setMobileOpen(false) }}
              className="p-2.5 transition-colors hover:text-gray-900"
              style={{ color: searchOpen ? GOLD : MUTED }}
              aria-label="Search">
              {searchOpen ? <X className="h-[18px] w-[18px]" /> : <Search className="h-[18px] w-[18px]" />}
            </button>

            <Link to="/wishlist" className="relative p-2.5 transition-colors hover:text-gray-900"
              style={{ color: MUTED }} aria-label="Wishlist">
              <Heart className="h-[18px] w-[18px]" />
              {wishlistItems.length > 0 && (
                <span className="absolute right-1 top-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full text-[8px] font-bold text-white"
                  style={{ background: GOLD }}>
                  {wishlistItems.length}
                </span>
              )}
            </Link>

            {isAuthenticated ? (
              <div className="relative">
                <button onClick={() => setUserMenuOpen(v => !v)}
                  className="flex items-center gap-1 p-2.5 transition-colors hover:text-gray-900"
                  style={{ color: MUTED }}>
                  <User className="h-[18px] w-[18px]" />
                  <span className="hidden sm:block text-[12px] font-medium">{displayName}</span>
                </button>
                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                    <div className="absolute right-0 top-full z-20 mt-2 w-44 py-1.5 bg-white rounded-xl"
                      style={{ border: `1px solid ${BORDER}`, boxShadow: '0 8px 32px rgba(0,0,0,0.08)' }}>
                      {[
                        { to: '/profile', label: 'My Profile' },
                        { to: '/orders',  label: 'My Orders'  },
                        { to: '/wishlist', label: 'Wishlist'  },
                      ].map(item => (
                        <Link key={item.to} to={item.to} onClick={() => setUserMenuOpen(false)}
                          className="block px-4 py-2.5 text-[13px] text-gray-600 hover:text-gray-900 transition-colors">
                          {item.label}
                        </Link>
                      ))}
                      <div className="my-1 border-t" style={{ borderColor: BORDER }} />
                      <button onClick={() => { setUserMenuOpen(false); handleLogout() }}
                        className="block w-full px-4 py-2.5 text-left text-[13px] text-red-500 hover:text-red-600 transition-colors">
                        Logout
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link to="/login"
                className="hidden sm:inline-flex items-center px-4 py-1.5 ml-1 text-[12px] font-semibold rounded-full transition-all hover:bg-gray-50"
                style={{ border: `1.5px solid ${BORDER}`, color: TEXT }}>
                Login
              </Link>
            )}

            <button onClick={openDrawer}
              className="relative p-2.5 transition-colors hover:text-gray-900"
              style={{ color: MUTED }} aria-label="Cart">
              <ShoppingBag className="h-[18px] w-[18px]" />
              {itemCount > 0 && (
                <span className="absolute right-1 top-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full text-[8px] font-bold text-white"
                  style={{ background: GOLD }}>
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
            </button>

            <button onClick={() => { setMobileOpen(v => !v); setSearchOpen(false) }}
              className="p-2.5 md:hidden transition-colors hover:text-gray-900"
              style={{ color: MUTED }}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}>
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Expandable search */}
      {searchOpen && (
        <div className="border-t bg-white" style={{ borderColor: BORDER }}>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 py-3.5">
            <form onSubmit={handleSearch} className="max-w-xl mx-auto">
              <div className="relative">
                <input ref={searchInputRef} type="text"
                  placeholder="Search jewellery..."
                  value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                  className="w-full py-3 pl-5 pr-12 text-[14px] rounded-full focus:outline-none focus:ring-2"
                  style={{ background: '#FAF8F4', border: `1.5px solid ${BORDER}`, color: TEXT }} />
                <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: GOLD }}>
                  <Search className="h-4 w-4" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t bg-white pb-4" style={{ borderColor: BORDER }}>
          <form onSubmit={handleSearch} className="px-4 pt-4 pb-2">
            <div className="relative">
              <input type="text" placeholder="Search..." value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full py-3 pl-4 pr-10 text-[13px] rounded-full focus:outline-none"
                style={{ background: '#FAF8F4', border: `1px solid ${BORDER}`, color: TEXT }} />
              <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: GOLD }}>
                <Search className="h-4 w-4" />
              </button>
            </div>
          </form>

          <nav className="flex flex-col px-4 mt-2">
            {rootItems.length > 0 ? (
              rootItems.map(item => {
                if (isShopItem(item.label, item.url)) {
                  return (
                    <div key={item.id}>
                      <Link to="/products" onClick={() => setMobileOpen(false)}
                        className="py-3.5 text-[14px] border-b block" style={{ color: TEXT, borderColor: BORDER }}>
                        Shop All
                      </Link>
                      {parentCategories.map(cat => (
                        <Link key={cat.id} to={catUrl(cat)} onClick={() => setMobileOpen(false)}
                          className="py-3 text-[13px] border-b pl-4 block" style={{ color: MUTED, borderColor: BORDER }}>
                          {cat.name}
                        </Link>
                      ))}
                    </div>
                  )
                }
                const children = navChildren(item.id)
                return (
                  <div key={item.id}>
                    <Link to={item.url} onClick={() => setMobileOpen(false)}
                      target={item.openInNewTab ? '_blank' : undefined}
                      rel={item.openInNewTab ? 'noopener noreferrer' : undefined}
                      className="py-3.5 text-[14px] border-b block" style={{ color: TEXT, borderColor: BORDER }}>
                      {item.label}
                    </Link>
                    {children.map(child => (
                      <Link key={child.id} to={child.url} onClick={() => setMobileOpen(false)}
                        className="py-3 text-[13px] border-b pl-4 block" style={{ color: MUTED, borderColor: BORDER }}>
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )
              })
            ) : (
              <>
                <NavLink to="/" end onClick={() => setMobileOpen(false)}
                  className="py-3.5 text-[14px] border-b" style={{ color: TEXT, borderColor: BORDER }}>Home</NavLink>
                <Link to="/products" onClick={() => setMobileOpen(false)}
                  className="py-3.5 text-[14px] border-b" style={{ color: TEXT, borderColor: BORDER }}>Shop All</Link>
                {parentCategories.map(cat => (
                  <Link key={cat.id} to={catUrl(cat)} onClick={() => setMobileOpen(false)}
                    className="py-3 text-[13px] border-b pl-4" style={{ color: MUTED, borderColor: BORDER }}>
                    {cat.name}
                  </Link>
                ))}
                {[
                  { to: '/products/sortBy/newest', label: 'New Arrivals' },
                  { to: '/about', label: 'About' },
                  { to: '/contact', label: 'Contact' },
                ].map(({ to, label }) => (
                  <Link key={to} to={to} onClick={() => setMobileOpen(false)}
                    className="py-3.5 text-[14px] border-b" style={{ color: TEXT, borderColor: BORDER }}>
                    {label}
                  </Link>
                ))}
              </>
            )}

            <div className="mt-4 pt-4 border-t" style={{ borderColor: BORDER }}>
              {isAuthenticated ? (
                <>
                  <NavLink to="/profile" onClick={() => setMobileOpen(false)} className="py-3 text-[14px] block" style={{ color: TEXT }}>Profile</NavLink>
                  <NavLink to="/orders" onClick={() => setMobileOpen(false)} className="py-3 text-[14px] block" style={{ color: TEXT }}>My Orders</NavLink>
                  <button onClick={() => { handleLogout(); setMobileOpen(false) }} className="py-3 text-left text-[14px] w-full text-red-500">Logout</button>
                </>
              ) : (
                <NavLink to="/login" onClick={() => setMobileOpen(false)}
                  className="py-3 text-[15px] font-semibold block" style={{ color: GOLD }}>
                  Login / Register
                </NavLink>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
