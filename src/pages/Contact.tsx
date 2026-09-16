import { useEffect, useState } from 'react'
import { Mail, MessageCircle, Clock, MapPin, ChevronDown, ChevronUp, Send } from 'lucide-react'
import axios from 'axios'
import { settingsApi } from '../api/settings'
import { cmsApi, type FaqItem } from '../api/cms'
import { useSite } from '../contexts/SiteContext'

const BG      = '#FCFAF6'
const WHITE   = '#FFFFFF'
const GOLD    = '#C9A227'
const GOLD_H  = '#B68E1F'
const HEADING = '#1E1E1E'
const BODY    = '#666666'
const BORDER  = '#E9E3D7'

interface ContactSettings {
  heading: string
  subheading: string
  email: string
  phone: string
  whatsapp: string
  address: string
  hours: string
  mapUrl: string
  formEnabled: string
}

const DEFAULTS: ContactSettings = {
  heading: "We'd Love to Hear from You",
  subheading: 'Questions, feedback, or just want to say hello? Our team is here to help.',
  email: '',
  phone: '',
  whatsapp: '',
  address: 'Jamshedpur, Jharkhand, India',
  hours: 'Mon – Sat, 10:00 AM – 6:00 PM\nIndian Standard Time',
  mapUrl: '',
  formEnabled: 'true',
}

const FALLBACK_FAQS = [
  { id: 0, question: 'How long does delivery take?',            answer: 'We typically deliver within 5–7 business days across India. Express delivery is available at checkout.' },
  { id: 1, question: 'Are your jewellery pieces hypoallergenic?', answer: 'Most of our pieces are made from high-quality alloys with gold or silver plating. We recommend avoiding prolonged contact with water and perfume.' },
  { id: 2, question: 'What is your return policy?',             answer: 'We offer easy 48-hour returns on all products. The item should be unused and in its original packaging. Reach out to us via email or WhatsApp to initiate a return.' },
  { id: 3, question: 'Can I exchange a product?',              answer: 'Yes, exchanges are accepted within 48 hours of delivery. The item must be in its original condition. Contact us to begin the process.' },
  { id: 4, question: 'Do you ship outside India?',             answer: 'Currently we ship within India only. International shipping is coming soon — follow us on Instagram for updates.' },
]

export function Contact() {
  const { settings: siteSettings } = useSite()
  const [settings, setSettings] = useState<ContactSettings>(DEFAULTS)
  const [faqs, setFaqs] = useState<{ id: number; question: string; answer: string }[]>(FALLBACK_FAQS)
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  useEffect(() => {
    const keys = Object.keys(DEFAULTS) as (keyof ContactSettings)[]
    Promise.all(keys.map(k => settingsApi.get(`contact_${k}`).catch(() => ({ value: '' })))).then(results => {
      const updated: Partial<ContactSettings> = {}
      keys.forEach((k, i) => { if (results[i].value) updated[k] = results[i].value })
      setSettings(prev => ({ ...prev, ...updated }))
    })

    cmsApi.getFaq().then(data => {
      const all = data.items.sort((a: FaqItem, b: FaqItem) => a.displayOrder - b.displayOrder)
      if (all.length > 0) setFaqs(all.map((f: FaqItem) => ({ id: f.id, question: f.question, answer: f.answer })))
    }).catch(() => {})
  }, [])

  function field(key: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm(f => ({ ...f, [key]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name || !form.email || !form.message) return
    setSubmitting(true)
    setSubmitError('')
    try {
      await axios.post('/api/contact', form)
      setSubmitted(true)
      setForm({ name: '', email: '', phone: '', subject: '', message: '' })
    } catch {
      setSubmitError('Something went wrong. Please email us directly or try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const contactEmail = settings.email || siteSettings.footerEmail

  const whatsappHref = settings.whatsapp
    ? `https://wa.me/${settings.whatsapp.replace(/\D/g, '')}`
    : null

  const hoursLines = settings.hours.split('\n').filter(Boolean)

  const contactItems = [
    contactEmail && {
      icon: Mail, label: 'Email Us', value: contactEmail,
      href: `mailto:${contactEmail}`, desc: 'We reply within 24 hours',
    },
    whatsappHref && {
      icon: MessageCircle, label: 'WhatsApp', value: settings.phone || settings.whatsapp,
      href: whatsappHref, desc: 'Chat with us directly',
    },
    settings.hours && {
      icon: Clock, label: 'Business Hours', value: hoursLines[0] || settings.hours,
      href: null, desc: hoursLines[1] || '',
    },
    settings.address && {
      icon: MapPin, label: 'Location', value: settings.address,
      href: `https://maps.google.com/?q=${encodeURIComponent(settings.address)}`,
      desc: '',
    },
  ].filter(Boolean) as { icon: React.ElementType; label: string; value: string; href: string | null; desc: string }[]

  return (
    <div style={{ background: BG }}>

      {/* ── HERO ────────────────────────────────────────────────────── */}
      <section className="py-16 sm:py-20 text-center" style={{ background: WHITE, borderBottom: `1px solid ${BORDER}` }}>
        <p className="text-[10px] font-bold tracking-[0.32em] uppercase mb-3" style={{ color: GOLD }}>Get in Touch</p>
        <h1 className="font-serif font-bold mb-3"
          style={{ color: HEADING, fontSize: 'clamp(30px, 4vw, 52px)', letterSpacing: '-0.02em' }}>
          {settings.heading}
        </h1>
        <p className="max-w-md mx-auto text-[15px] leading-relaxed" style={{ color: BODY }}>
          {settings.subheading}
        </p>
      </section>

      {/* ── MAIN TWO-COLUMN ─────────────────────────────────────────── */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-[1fr_380px] gap-10 lg:gap-16">

            {/* LEFT — Contact Form */}
            {settings.formEnabled !== 'false' && (
              <div>
                <div className="rounded-2xl p-7 sm:p-9" style={{ background: WHITE, border: `1px solid ${BORDER}` }}>
                  <h2 className="font-serif font-bold mb-1" style={{ color: HEADING, fontSize: 22 }}>Send Us a Message</h2>
                  <p className="text-[13px] mb-7" style={{ color: BODY }}>Fill out the form and we'll get back to you within 24 hours.</p>

                  {submitted ? (
                    <div className="flex flex-col items-center py-10 text-center">
                      <div className="w-14 h-14 rounded-full flex items-center justify-center mb-4"
                        style={{ background: `${GOLD}18` }}>
                        <Send className="h-6 w-6" style={{ color: GOLD }} />
                      </div>
                      <h3 className="font-semibold text-[17px] mb-2" style={{ color: HEADING }}>Message Sent!</h3>
                      <p className="text-[14px] max-w-xs" style={{ color: BODY }}>
                        Thank you for reaching out. We'll reply to your email within 24 hours.
                      </p>
                      <button onClick={() => setSubmitted(false)}
                        className="mt-6 text-[13px] font-medium underline" style={{ color: GOLD }}>
                        Send another message
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[11px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: HEADING }}>
                            Full Name <span style={{ color: GOLD }}>*</span>
                          </label>
                          <input type="text" value={form.name} onChange={field('name')} placeholder="Your name" required
                            className="w-full rounded-xl px-4 py-3 text-[14px] outline-none transition-all"
                            style={{ background: BG, border: `1.5px solid ${BORDER}`, color: HEADING }}
                            onFocus={e => e.target.style.borderColor = GOLD}
                            onBlur={e => e.target.style.borderColor = BORDER} />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: HEADING }}>
                            Email Address <span style={{ color: GOLD }}>*</span>
                          </label>
                          <input type="email" value={form.email} onChange={field('email')} placeholder="you@example.com" required
                            className="w-full rounded-xl px-4 py-3 text-[14px] outline-none transition-all"
                            style={{ background: BG, border: `1.5px solid ${BORDER}`, color: HEADING }}
                            onFocus={e => e.target.style.borderColor = GOLD}
                            onBlur={e => e.target.style.borderColor = BORDER} />
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[11px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: HEADING }}>
                            Phone <span className="font-normal normal-case" style={{ color: BODY }}>(optional)</span>
                          </label>
                          <input type="tel" value={form.phone} onChange={field('phone')} placeholder="+91 98765 43210"
                            className="w-full rounded-xl px-4 py-3 text-[14px] outline-none transition-all"
                            style={{ background: BG, border: `1.5px solid ${BORDER}`, color: HEADING }}
                            onFocus={e => e.target.style.borderColor = GOLD}
                            onBlur={e => e.target.style.borderColor = BORDER} />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: HEADING }}>Subject</label>
                          <select value={form.subject} onChange={field('subject')}
                            className="w-full rounded-xl px-4 py-3 text-[14px] outline-none transition-all"
                            style={{ background: BG, border: `1.5px solid ${BORDER}`, color: form.subject ? HEADING : BODY }}
                            onFocus={e => e.target.style.borderColor = GOLD}
                            onBlur={e => e.target.style.borderColor = BORDER}>
                            <option value="">Select a topic</option>
                            <option value="Order Enquiry">Order Enquiry</option>
                            <option value="Return / Exchange">Return / Exchange</option>
                            <option value="Product Question">Product Question</option>
                            <option value="Bulk / Wholesale">Bulk / Wholesale</option>
                            <option value="Feedback">Feedback</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: HEADING }}>
                          Message <span style={{ color: GOLD }}>*</span>
                        </label>
                        <textarea value={form.message} onChange={field('message')} rows={5}
                          placeholder="Tell us how we can help you..." required
                          className="w-full rounded-xl px-4 py-3 text-[14px] outline-none transition-all resize-none"
                          style={{ background: BG, border: `1.5px solid ${BORDER}`, color: HEADING }}
                          onFocus={e => e.target.style.borderColor = GOLD}
                          onBlur={e => e.target.style.borderColor = BORDER} />
                      </div>

                      {submitError && <p className="text-[13px]" style={{ color: '#D32F2F' }}>{submitError}</p>}

                      <button type="submit" disabled={submitting}
                        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-[14px] font-semibold text-white transition-all hover:-translate-y-0.5 disabled:opacity-60"
                        style={{ background: GOLD }}
                        onMouseEnter={e => !submitting && (e.currentTarget.style.background = GOLD_H)}
                        onMouseLeave={e => !submitting && (e.currentTarget.style.background = GOLD)}>
                        {submitting ? (
                          <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Sending...</>
                        ) : (
                          <><Send className="h-4 w-4" /> Send Message</>
                        )}
                      </button>
                    </form>
                  )}
                </div>
              </div>
            )}

            {/* RIGHT — Contact info + Map */}
            <div className="space-y-5">
              <div>
                <h2 className="font-serif font-bold mb-1" style={{ color: HEADING, fontSize: 22 }}>Contact Information</h2>
                <p className="text-[13px]" style={{ color: BODY }}>Reach us through any of the channels below.</p>
              </div>

              <div className="space-y-3">
                {contactItems.map(info => (
                  <div key={info.label} className="flex gap-4 p-4 rounded-xl"
                    style={{ background: WHITE, border: `1px solid ${BORDER}` }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: `${GOLD}14` }}>
                      <info.icon className="h-4 w-4" style={{ color: GOLD }} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold uppercase tracking-wider mb-0.5" style={{ color: BODY }}>{info.label}</p>
                      {info.href ? (
                        <a href={info.href} target="_blank" rel="noopener noreferrer"
                          className="text-[14px] font-semibold transition-colors hover:underline" style={{ color: HEADING }}>
                          {info.value}
                        </a>
                      ) : (
                        <p className="text-[14px] font-semibold" style={{ color: HEADING }}>{info.value}</p>
                      )}
                      {info.desc && <p className="text-[12px] mt-0.5" style={{ color: BODY }}>{info.desc}</p>}
                    </div>
                  </div>
                ))}
              </div>

              {settings.mapUrl && (
                <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${BORDER}` }}>
                  <iframe title="NIROTÉ Location" src={settings.mapUrl}
                    width="100%" height="220"
                    style={{ border: 0, display: 'block' }}
                    loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────────────────────────── */}
      {faqs.length > 0 && (
        <section className="py-16 sm:py-20" style={{ background: WHITE, borderTop: `1px solid ${BORDER}` }}>
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <p className="text-[10px] font-bold tracking-[0.3em] uppercase mb-3" style={{ color: GOLD }}>FAQ</p>
              <h2 className="font-serif font-bold" style={{ color: HEADING, fontSize: 'clamp(24px, 3vw, 34px)' }}>
                Frequently Asked Questions
              </h2>
            </div>

            <div className="space-y-2">
              {faqs.map((faq, i) => (
                <div key={faq.id} className="rounded-xl overflow-hidden transition-all"
                  style={{ border: `1px solid ${openFaq === i ? GOLD + '55' : BORDER}`, background: openFaq === i ? `${GOLD}07` : WHITE }}>
                  <button className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                    <span className="text-[14px] font-semibold" style={{ color: HEADING }}>{faq.question}</span>
                    {openFaq === i
                      ? <ChevronUp className="h-4 w-4 flex-shrink-0" style={{ color: GOLD }} />
                      : <ChevronDown className="h-4 w-4 flex-shrink-0" style={{ color: BODY }} />}
                  </button>
                  {openFaq === i && (
                    <div className="px-5 pb-5">
                      <p className="text-[14px] leading-[1.75]" style={{ color: BODY }}>{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
