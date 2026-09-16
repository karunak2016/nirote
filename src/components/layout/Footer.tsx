import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Mail, MapPin, Clock, MessageCircle } from 'lucide-react'
import { useSite } from '../../contexts/SiteContext'
import { settingsApi } from '../../api/settings'

const GOLD   = '#C9A227'
const BG     = '#FCFAF6'
const BORDER = '#E9E3D7'
const TEXT   = '#1E1E1E'
const MUTED  = '#666666'

interface QuickLink { label: string; url: string }
interface SocialLink { platform: string; url: string }
type SvgIcon = () => JSX.Element

// ─── Social icon SVGs (Lucide lacks Pinterest & WhatsApp) ───────────────────

const IgSvg: SvgIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}
    strokeLinecap="round" strokeLinejoin="round" width={16} height={16}>
    <rect x="2" y="2" width="20" height="20" rx="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
  </svg>
)

const FbSvg: SvgIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width={15} height={15}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
  </svg>
)

const PinSvg: SvgIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width={15} height={15}>
    <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.36-.719-.36-1.782c0-1.668.968-2.914 2.172-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/>
  </svg>
)

const YtSvg: SvgIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width={16} height={16}>
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
)

const WaSvg: SvgIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width={15} height={15}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
  </svg>
)

const SOCIAL_SVG: Record<string, SvgIcon> = {
  Instagram: IgSvg,
  Facebook:  FbSvg,
  Pinterest: PinSvg,
  YouTube:   YtSvg,
  WhatsApp:  WaSvg,
}

// ─── Payment logo SVGs ──────────────────────────────────────────────────────

function PyBase({ children, w }: { children: ReactNode; w: number }) {
  return (
    <svg width={w} height={28} viewBox={`0 0 ${w} 28`} fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x=".5" y=".5" width={w - 1} height="27" rx="4" fill="white" stroke="#DDDAD5"/>
      {children}
    </svg>
  )
}

const VisaLogo = () => (
  <PyBase w={48}>
    <text x="24" y="20" textAnchor="middle" fontFamily="Arial,sans-serif" fontSize="16"
      fontWeight="900" fontStyle="italic" fill="#1A1F71">VISA</text>
  </PyBase>
)

// cx1=19 cx2=31 r=8 → intersection x=25, y=14±5.29
const MastercardLogo = () => (
  <PyBase w={50}>
    <circle cx="19" cy="14" r="8" fill="#EB001B"/>
    <circle cx="31" cy="14" r="8" fill="#F79E1B"/>
    <path d="M25 8.71A8 8 0 0 1 25 19.29A8 8 0 0 1 25 8.71Z" fill="#FF5F00"/>
  </PyBase>
)

const RuPayLogo = () => (
  <PyBase w={54}>
    <text x="27" y="19" textAnchor="middle" fontFamily="Arial,sans-serif" fontSize="12" fontWeight="800">
      <tspan fill="#097AB2">Ru</tspan><tspan fill="#F26924">Pay</tspan>
    </text>
  </PyBase>
)

const UpiLogo = () => (
  <PyBase w={44}>
    <text x="22" y="20" textAnchor="middle" fontFamily="Arial,sans-serif"
      fontSize="13" fontWeight="800" fill="#5B2C8D">UPI</text>
  </PyBase>
)

const RazorpayLogo = () => (
  <PyBase w={66}>
    <text x="33" y="20" textAnchor="middle" fontFamily="Arial,sans-serif"
      fontSize="10" fontWeight="700" fill="#2B6CB0">razorpay</text>
  </PyBase>
)

const GpayLogo = () => (
  <PyBase w={54}>
    <text x="27" y="20" textAnchor="middle" fontFamily="Arial,sans-serif" fontSize="13" fontWeight="800">
      <tspan fill="#4285F4">G</tspan><tspan fill="#3C4043" fontSize="12" fontWeight="600"> Pay</tspan>
    </text>
  </PyBase>
)

const PhonePeLogo = () => (
  <PyBase w={66}>
    <text x="33" y="20" textAnchor="middle" fontFamily="Arial,sans-serif"
      fontSize="10" fontWeight="800" fill="#5F259F">PhonePe</text>
  </PyBase>
)

// ─── CSS ─────────────────────────────────────────────────────────────────────

const FOOTER_CSS = `
  .nftr a.fl {
    position: relative;
    display: inline-block;
    color: ${MUTED};
    font-size: 13px;
    font-weight: 300;
    letter-spacing: 0.01em;
    text-decoration: none;
    transition: color .3s ease;
  }
  .nftr a.fl::after {
    content: '';
    position: absolute;
    bottom: -1px;
    left: 0;
    width: 0;
    height: 1px;
    background: ${GOLD};
    transition: width .3s ease;
  }
  .nftr a.fl:hover { color: ${GOLD}; }
  .nftr a.fl:hover::after { width: 100%; }

  .nftr .soc {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    border: 1px solid #DDDAD5;
    color: ${MUTED};
    background: transparent;
    flex-shrink: 0;
    transition: background .25s ease, border-color .25s ease, color .25s ease;
  }
  .nftr .soc:hover {
    background: ${GOLD};
    border-color: ${GOLD};
    color: white;
  }
`

// ─── Sub-components ──────────────────────────────────────────────────────────

function Fl({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link to={to} className="fl" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
      {children}
    </Link>
  )
}

function ColHead({ label }: { label: string }) {
  return (
    <div className="mb-6">
      <p className="text-[10px] font-semibold uppercase tracking-[0.25em] mb-3" style={{ color: TEXT }}>
        {label}
      </p>
      <div className="h-px w-5" style={{ background: GOLD }} />
    </div>
  )
}

// ─── Footer ──────────────────────────────────────────────────────────────────

export function Footer() {
  const { settings, categories, catUrl } = useSite()

  const [description, setDescription]   = useState('')
  const [quickLinks, setQuickLinks]     = useState<QuickLink[]>([])
  const [socialLinks, setSocialLinks]   = useState<SocialLink[]>([])
  const [copyright, setCopyright]       = useState('')
  const [footerTagline, setFooterTagline] = useState('Made with ❤ in India')
  const [contactHours, setContactHours] = useState('')
  const [contactAddress, setContactAddress] = useState('')

  useEffect(() => {
    Promise.all([
      settingsApi.get('footer_description').catch(() => ({ value: '' })),
      settingsApi.get('footer_quickLinks').catch(() => ({ value: '' })),
      settingsApi.get('footer_socialLinks').catch(() => ({ value: '' })),
      settingsApi.get('footer_copyright').catch(() => ({ value: '' })),
      settingsApi.get('footer_tagline').catch(() => ({ value: '' })),
      settingsApi.get('contact_hours').catch(() => ({ value: '' })),
      settingsApi.get('contact_address').catch(() => ({ value: '' })),
    ]).then(([desc, ql, sl, cr, tag, hours, addr]) => {
      setDescription(desc.value)
      try { setQuickLinks(JSON.parse(ql.value) as QuickLink[]) } catch { /* ignore */ }
      try { setSocialLinks(JSON.parse(sl.value) as SocialLink[]) } catch { /* ignore */ }
      setCopyright(cr.value)
      if (tag.value) setFooterTagline(tag.value)
      setContactHours(hours.value)
      setContactAddress(addr.value)
    })
  }, [])

  const footerDesc  = description || settings.footerAbout
    || 'Premium fashion jewellery curated to bring elegance and confidence to your everyday style.'
  const brandName   = copyright || settings.footerCopyright || 'NIROTÉ'
  const contactEmail = settings.footerEmail || 'hello.nirote@gmail.com'
  const whatsappUrl  = settings.whatsappNumber
    ? `https://wa.me/${settings.whatsappNumber.replace(/\D/g, '')}`
    : 'https://wa.me/'

  const defaultSocials: SocialLink[] = [
    { platform: 'Instagram', url: settings.footerInstagram || '#' },
    { platform: 'Facebook',  url: settings.footerFacebook  || '#' },
    { platform: 'Pinterest', url: '#' },
    { platform: 'YouTube',   url: '#' },
    { platform: 'WhatsApp',  url: whatsappUrl },
  ]
  const activeSocials = socialLinks.length > 0 ? socialLinks : defaultSocials

  const categoryLinks: QuickLink[] = categories
    .filter(c => !c.parentId)
    .slice(0, 4)
    .map(c => ({ label: c.name, url: catUrl(c) }))
  const shopLinks = quickLinks.length > 0
    ? quickLinks
    : [
        { label: 'New Arrivals', url: '/products/sortBy/newest' },
        { label: 'Best Sellers', url: '/products?featured=true' },
        ...categoryLinks,
        { label: 'View All',     url: '/products' },
      ]

  return (
    <>
      <style>{FOOTER_CSS}</style>

      <footer className="nftr" style={{ background: BG, borderTop: `1px solid ${BORDER}` }}>

        {/* ── Main columns ── */}
        <div className="mx-auto px-6 sm:px-10" style={{ maxWidth: 1280, paddingTop: 70, paddingBottom: 50 }}>
          <div className="grid grid-cols-1 gap-10 text-center
                          md:grid-cols-2 md:text-left
                          lg:grid-cols-[1.5fr_1fr_1fr_1fr_1.2fr] lg:gap-8">

            {/* Col 1 — Brand */}
            <div>
              <div className="mb-5 flex justify-center md:justify-start">
                {settings.logoUrl ? (
                  <img src={settings.logoUrl} alt="NIROTÉ" className="h-12 w-auto object-contain" />
                ) : (
                  <span className="font-serif font-bold tracking-[0.15em]" style={{ fontSize: 28, color: GOLD }}>
                    NIROTÉ
                  </span>
                )}
              </div>

              <p className="text-[13px] leading-[1.85] font-light mb-7 mx-auto md:mx-0"
                style={{ color: MUTED, maxWidth: 220 }}>
                {footerDesc}
              </p>

              <div className="flex gap-2.5 flex-wrap justify-center md:justify-start">
                {activeSocials.filter(s => s.url && s.url !== '#').map((s, i) => {
                  const Icon = SOCIAL_SVG[s.platform]
                  if (!Icon) return null
                  return (
                    <a key={i} href={s.url} target="_blank" rel="noopener noreferrer"
                      className="soc" aria-label={s.platform}>
                      <Icon />
                    </a>
                  )
                })}
              </div>
            </div>

            {/* Col 2 — Shop */}
            <div>
              <ColHead label="Shop" />
              <ul className="space-y-3">
                {shopLinks.map(l => (
                  <li key={l.url + l.label}>
                    <Fl to={l.url}>{l.label}</Fl>
                  </li>
                ))}
              </ul>
            </div>

            {/* Col 3 — Customer Care */}
            <div>
              <ColHead label="Customer Care" />
              <ul className="space-y-3">
                {[
                  { to: '/contact',         label: 'Contact Us'          },
                  { to: '/track',           label: 'Track Order'         },
                  { to: '/profile',         label: 'My Account'          },
                  { to: '/wishlist',        label: 'Wishlist'            },
                  { to: '/faq',             label: 'FAQ'                 },
                  { to: '/shipping-policy', label: 'Shipping Information' },
                  { to: '/return-policy',   label: 'Returns'             },
                ].map(l => (
                  <li key={l.to}><Fl to={l.to}>{l.label}</Fl></li>
                ))}
              </ul>
            </div>

            {/* Col 4 — Policies (includes About Us) */}
            <div>
              <ColHead label="Policies" />
              <ul className="space-y-3">
                {[
                  { to: '/about',           label: 'About Us'              },
                  { to: '/shipping-policy', label: 'Shipping Policy'       },
                  { to: '/return-policy',   label: 'Return & Refund Policy'},
                  { to: '/privacy-policy',  label: 'Privacy Policy'        },
                  { to: '/terms',           label: 'Terms & Conditions'    },
                ].map(l => (
                  <li key={l.to}><Fl to={l.to}>{l.label}</Fl></li>
                ))}
              </ul>
            </div>

            {/* Col 5 — Contact */}
            <div>
              <ColHead label="Contact" />
              <ul className="space-y-3.5">
                <li className="flex items-start gap-2.5 justify-center md:justify-start">
                  <Mail className="mt-0.5 shrink-0" size={13} style={{ color: GOLD }} />
                  <a href={`mailto:${contactEmail}`} className="fl" style={{ fontSize: 12.5 }}>
                    {contactEmail}
                  </a>
                </li>
                {(settings.whatsappNumber || whatsappUrl !== 'https://wa.me/') && (
                <li className="flex items-start gap-2.5 justify-center md:justify-start">
                  <MessageCircle className="mt-0.5 shrink-0" size={13} style={{ color: GOLD }} />
                  <a href={whatsappUrl} target="_blank" rel="noopener noreferrer"
                    className="fl" style={{ fontSize: 12.5 }}>
                    {settings.whatsappNumber || 'WhatsApp Support'}
                  </a>
                </li>
                )}
                {contactHours && (
                  <li className="flex items-start gap-2.5 justify-center md:justify-start">
                    <Clock className="mt-0.5 shrink-0" size={13} style={{ color: MUTED }} />
                    <div className="text-left">
                      {contactHours.split('\n').filter(Boolean).map((line, i) => (
                        <p key={i} className="text-[12.5px] font-light leading-[1.7]" style={{ color: MUTED }}>{line}</p>
                      ))}
                    </div>
                  </li>
                )}
                {contactAddress && (
                  <li className="flex items-center gap-2.5 justify-center md:justify-start">
                    <MapPin className="shrink-0" size={13} style={{ color: MUTED }} />
                    <p className="text-[12.5px] font-light" style={{ color: MUTED }}>{contactAddress}</p>
                  </li>
                )}
              </ul>
            </div>

          </div>
        </div>

        {/* ── Bottom bar ── */}
        <div style={{ borderTop: `1px solid ${BORDER}` }}>
          <div className="mx-auto px-6 sm:px-10 py-4
                          flex flex-col sm:flex-row items-center justify-between gap-4"
            style={{ maxWidth: 1280 }}>

            <p className="text-[11px] font-light order-3 sm:order-1 whitespace-nowrap"
              style={{ color: MUTED }}>
              © {new Date().getFullYear()} {brandName}. All Rights Reserved.
            </p>

            {/* Payment logos */}
            <div className="flex items-center gap-2 flex-wrap justify-center order-1 sm:order-2">
              <VisaLogo />
              <MastercardLogo />
              <RuPayLogo />
              <UpiLogo />
              <RazorpayLogo />
              <GpayLogo />
              <PhonePeLogo />
            </div>

            <p className="text-[11px] font-light order-2 sm:order-3 whitespace-nowrap"
              style={{ color: MUTED }}>
              {footerTagline}
            </p>

          </div>
        </div>

      </footer>
    </>
  )
}
