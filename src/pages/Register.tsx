import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { authApi } from '../api/auth'
import { useAuthStore } from '../stores/authStore'

const BG = '#FAF8F4'
const GOLD = '#C9A227'
const TEXT = '#1A1A1A'
const SECOND = '#6A6A6A'
const BORDER = '#ECE7DF'

const inputCls = 'w-full rounded-xl border px-4 py-3 text-[14px] focus:outline-none transition-colors bg-white placeholder:text-gray-400'

export function Register() {
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()
  const [tab, setTab] = useState<'full' | 'otp'>('full')

  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const [otpPhone, setOtpPhone] = useState('')
  const [otpCode, setOtpCode] = useState('')
  const [otpStep, setOtpStep] = useState<'phone' | 'verify'>('phone')
  const [otpError, setOtpError] = useState('')
  const [otpLoading, setOtpLoading] = useState(false)

  function field(key: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [key]: e.target.value }))
  }

  async function handleFullRegister(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirmPassword) { setError('Passwords do not match.'); return }
    setLoading(true)
    try {
      const res = await authApi.register({ name: form.name, email: form.email, phone: form.phone || undefined, password: form.password })
      setAuth({ id: res.userId, name: res.name, email: res.email, role: res.role }, res.token)
      navigate('/')
    } catch {
      setError('Registration failed. Email may already be in use.')
    } finally {
      setLoading(false)
    }
  }

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault()
    setOtpError('')
    if (!/^\d{10}$/.test(otpPhone)) { setOtpError('Enter a valid 10-digit mobile number.'); return }
    setOtpLoading(true)
    try {
      await authApi.sendOtp({ phone: otpPhone })
      setOtpStep('verify')
    } catch {
      setOtpError('Failed to send OTP. Please try again.')
    } finally {
      setOtpLoading(false)
    }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault()
    setOtpError('')
    setOtpLoading(true)
    try {
      const res = await authApi.verifyOtp({ phone: otpPhone, otp: otpCode })
      setAuth({ id: res.userId, name: res.name, email: res.email, role: res.role }, res.token)
      navigate('/')
    } catch {
      setOtpError('Invalid or expired OTP.')
    } finally {
      setOtpLoading(false)
    }
  }

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => { e.currentTarget.style.borderColor = GOLD }
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => { e.currentTarget.style.borderColor = BORDER }

  const SubmitBtn = ({ loading: l, label }: { loading: boolean; label: string }) => (
    <button type="submit" disabled={l}
      className="w-full py-3.5 text-[13px] font-semibold text-white rounded-full transition-opacity hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
      style={{ background: GOLD }}>
      {l && <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg>}
      {label}
    </button>
  )

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-16" style={{ background: BG }}>
      <div className="w-full max-w-sm">

        <div className="text-center mb-8">
          <p className="font-serif text-2xl font-bold tracking-widest mb-2" style={{ color: GOLD }}>NIROTÉ</p>
          <h1 className="font-serif text-[28px] font-bold" style={{ color: TEXT }}>Create Account</h1>
          <p className="mt-1.5 text-[14px]" style={{ color: SECOND }}>Join the Niroté family today</p>
        </div>

        {/* Tabs */}
        <div className="flex rounded-full overflow-hidden mb-6 bg-white" style={{ border: `1px solid ${BORDER}` }}>
          {(['full', 'otp'] as const).map((t) => (
            <button key={t} onClick={() => { setTab(t); if (t === 'otp') { setOtpStep('phone'); setOtpError('') } }}
              className="flex-1 py-2.5 text-[13px] font-semibold transition-colors rounded-full"
              style={{ background: tab === t ? GOLD : 'transparent', color: tab === t ? '#fff' : SECOND }}>
              {t === 'full' ? 'Sign Up' : 'Login with OTP'}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-2xl p-8" style={{ border: `1px solid ${BORDER}` }}>
          {tab === 'full' ? (
            <form onSubmit={handleFullRegister} className="space-y-4">
              {error && (
                <div className="rounded-xl border px-4 py-3 text-[13px] text-red-700 bg-red-50 border-red-200">{error}</div>
              )}
              {[
                { key: 'name' as const, label: 'Full Name', type: 'text', placeholder: 'Priya Sharma', auto: 'name' },
                { key: 'email' as const, label: 'Email', type: 'email', placeholder: 'you@example.com', auto: 'email' },
                { key: 'phone' as const, label: 'Phone (optional)', type: 'tel', placeholder: '9876543210', auto: 'tel' },
              ].map(({ key, label, type, placeholder, auto }) => (
                <div key={key}>
                  <label className="block text-[12px] font-semibold uppercase tracking-[0.15em] mb-1.5" style={{ color: TEXT }}>{label}</label>
                  <input type={type} placeholder={placeholder} value={form[key]} onChange={field(key)}
                    required={key !== 'phone'} autoComplete={auto}
                    className={inputCls} style={{ borderColor: BORDER }}
                    onFocus={handleFocus} onBlur={handleBlur} />
                </div>
              ))}

              {[
                { key: 'password' as const, label: 'Password', show: showPassword, toggle: () => setShowPassword(v => !v), auto: 'new-password', min: 8, placeholder: 'Min 8 characters' },
                { key: 'confirmPassword' as const, label: 'Confirm Password', show: showConfirm, toggle: () => setShowConfirm(v => !v), auto: 'new-password', min: undefined, placeholder: '••••••••' },
              ].map(({ key, label, show, toggle, auto, min, placeholder }) => (
                <div key={key}>
                  <label className="block text-[12px] font-semibold uppercase tracking-[0.15em] mb-1.5" style={{ color: TEXT }}>{label}</label>
                  <div className="relative">
                    <input type={show ? 'text' : 'password'} placeholder={placeholder} value={form[key]} onChange={field(key)}
                      required minLength={min} autoComplete={auto}
                      className={inputCls + ' pr-10'} style={{ borderColor: BORDER }}
                      onFocus={handleFocus} onBlur={handleBlur} />
                    <button type="button" onClick={toggle}
                      className="absolute right-3 top-1/2 -translate-y-1/2 transition-opacity hover:opacity-60" style={{ color: SECOND }}>
                      {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              ))}

              <SubmitBtn loading={loading} label="Create Account" />
            </form>
          ) : (
            <div>
              {otpStep === 'phone' ? (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  {otpError && <div className="rounded-xl border px-4 py-3 text-[13px] text-red-700 bg-red-50 border-red-200">{otpError}</div>}
                  <p className="text-[13px]" style={{ color: SECOND }}>Enter your mobile number to get a one-time password.</p>
                  <div>
                    <label className="block text-[12px] font-semibold uppercase tracking-[0.15em] mb-1.5" style={{ color: TEXT }}>Mobile Number</label>
                    <div className="flex">
                      <span className="flex items-center rounded-l-xl border-l border-y px-3 text-[13px] font-medium"
                        style={{ borderColor: BORDER, color: SECOND, background: BG }}>+91</span>
                      <input type="tel" placeholder="9876543210" value={otpPhone}
                        onChange={(e) => setOtpPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        maxLength={10} required
                        className="flex-1 rounded-r-xl border px-4 py-3 text-[14px] focus:outline-none bg-white placeholder:text-gray-400"
                        style={{ borderColor: BORDER }}
                        onFocus={(e) => { e.currentTarget.style.borderColor = GOLD }}
                        onBlur={(e) => { e.currentTarget.style.borderColor = BORDER }} />
                    </div>
                  </div>
                  <SubmitBtn loading={otpLoading} label="Send OTP" />
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  {otpError && <div className="rounded-xl border px-4 py-3 text-[13px] text-red-700 bg-red-50 border-red-200">{otpError}</div>}
                  <p className="text-[13px]" style={{ color: SECOND }}>
                    OTP sent to <span className="font-semibold" style={{ color: TEXT }}>+91 {otpPhone}</span>
                  </p>
                  <div>
                    <label className="block text-[12px] font-semibold uppercase tracking-[0.15em] mb-1.5" style={{ color: TEXT }}>Enter OTP</label>
                    <input type="text" placeholder="6-digit code" value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      maxLength={6} required
                      className={inputCls + ' text-center text-xl font-mono tracking-widest'}
                      style={{ borderColor: BORDER }}
                      onFocus={(e) => { e.currentTarget.style.borderColor = GOLD }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = BORDER }} />
                  </div>
                  <SubmitBtn loading={otpLoading} label="Verify & Continue" />
                  <button type="button"
                    onClick={() => { setOtpStep('phone'); setOtpCode(''); setOtpError('') }}
                    className="w-full text-[13px] underline transition-opacity hover:opacity-70"
                    style={{ color: SECOND }}>
                    Change number
                  </button>
                </form>
              )}
            </div>
          )}
        </div>

        <p className="mt-6 text-center text-[13px]" style={{ color: SECOND }}>
          Already have an account?{' '}
          <Link to="/login" className="font-semibold underline hover:opacity-80 transition-opacity" style={{ color: GOLD }}>Sign in</Link>
        </p>
      </div>
    </div>
  )
}
