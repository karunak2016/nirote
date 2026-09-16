import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { authApi } from '../api/auth'
import { useAuthStore } from '../stores/authStore'

const BG = '#FAF8F4'
const GOLD = '#C9A227'
const TEXT = '#1A1A1A'
const SECOND = '#6A6A6A'
const BORDER = '#ECE7DF'

type Mode = 'unknown' | 'email' | 'otp-send' | 'otp-verify'

function isPhone(v: string) { return /^\d{10}$/.test(v.trim()) }
function isEmail(v: string) { return v.includes('@') && !v.endsWith('@nirote.local') }

const inputCls = 'w-full rounded-xl border px-4 py-3 text-[14px] focus:outline-none transition-colors bg-white placeholder:text-gray-400'

export function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { setAuth } = useAuthStore()
  const from = (location.state as { from?: string })?.from ?? '/'

  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [otpCode, setOtpCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [otpSent, setOtpSent] = useState(false)

  useEffect(() => {
    if (!error) return
    const t = setTimeout(() => setError(''), 10000)
    return () => clearTimeout(t)
  }, [error])

  const mode: Mode = isPhone(identifier)
    ? 'otp-send'
    : isEmail(identifier)
      ? 'email'
      : 'unknown'

  function handleIdentifierChange(e: React.ChangeEvent<HTMLInputElement>) {
    setIdentifier(e.target.value)
    setError('')
    setOtpCode('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (mode === 'unknown') {
      setError('Enter a valid email address or 10-digit mobile number.')
      return
    }
    setLoading(true)
    try {
      if (mode === 'email') {
        const res = await authApi.login({ email: identifier.trim(), password })
        setAuth({ id: res.userId, name: res.name, email: res.email, role: res.role }, res.token)
        navigate(from, { replace: true })
      } else if (mode === 'otp-send') {
        await authApi.sendOtp({ phone: identifier.trim() })
        setOtpSent(true)
      }
    } catch {
      setError(mode === 'email' ? 'Invalid email or password.' : 'Failed to send OTP. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await authApi.verifyOtp({ phone: identifier.trim(), otp: otpCode })
      setAuth({ id: res.userId, name: res.name, email: res.email, role: res.role }, res.token)
      navigate(from, { replace: true })
    } catch {
      setError('Invalid or expired OTP.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-16" style={{ background: BG }}>
      <div className="w-full max-w-sm">

        {/* Brand mark */}
        <div className="text-center mb-8">
          <p className="font-serif text-2xl font-bold tracking-widest mb-2" style={{ color: GOLD }}>NIROTÉ</p>
          <h1 className="font-serif text-[28px] font-bold" style={{ color: TEXT }}>Welcome Back</h1>
          <p className="mt-1.5 text-[14px]" style={{ color: SECOND }}>Sign in to your Niroté account</p>
        </div>

        <div className="bg-white rounded-2xl p-8" style={{ border: `1px solid ${BORDER}` }}>
          {error && (
            <div className="mb-4 rounded-xl border px-4 py-3 text-[13px] text-red-700 bg-red-50 border-red-200">{error}</div>
          )}

          {!otpSent ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[12px] font-semibold uppercase tracking-[0.15em] mb-1.5" style={{ color: TEXT }}>
                  Email or Mobile Number
                </label>
                <input
                  type="text"
                  placeholder="you@example.com or 9876543210"
                  value={identifier}
                  onChange={handleIdentifierChange}
                  required
                  autoComplete="username"
                  className={inputCls}
                  style={{ borderColor: BORDER }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = GOLD }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = BORDER }}
                />
                {isPhone(identifier) && (
                  <p className="text-[12px] mt-1" style={{ color: GOLD }}>We'll send an OTP to +91 {identifier}</p>
                )}
              </div>

              {mode === 'email' && (
                <div>
                  <label className="block text-[12px] font-semibold uppercase tracking-[0.15em] mb-1.5" style={{ color: TEXT }}>Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="current-password"
                      className={inputCls + ' pr-10'}
                      style={{ borderColor: BORDER }}
                      onFocus={(e) => { e.currentTarget.style.borderColor = GOLD }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = BORDER }}
                    />
                    <button type="button" onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 transition-opacity hover:opacity-60"
                      style={{ color: SECOND }}>
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 text-[13px] font-semibold text-white rounded-full transition-opacity hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
                style={{ background: GOLD }}>
                {loading && <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg>}
                {mode === 'otp-send' ? 'Send OTP' : 'Sign In'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <p className="text-[13px]" style={{ color: SECOND }}>
                OTP sent to <span className="font-semibold" style={{ color: TEXT }}>+91 {identifier}</span>
              </p>
              <div>
                <label className="block text-[12px] font-semibold uppercase tracking-[0.15em] mb-1.5" style={{ color: TEXT }}>Enter OTP</label>
                <input
                  type="text"
                  placeholder="6-digit code"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                  required
                  className={inputCls + ' text-center text-xl font-mono tracking-widest'}
                  style={{ borderColor: BORDER }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = GOLD }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = BORDER }}
                />
              </div>
              <button type="submit" disabled={loading}
                className="w-full py-3.5 text-[13px] font-semibold text-white rounded-full transition-opacity hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
                style={{ background: GOLD }}>
                {loading && <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg>}
                Verify & Sign In
              </button>
              <button type="button"
                onClick={() => { setOtpSent(false); setOtpCode(''); setError('') }}
                className="w-full text-[13px] transition-opacity hover:opacity-70 underline"
                style={{ color: SECOND }}>
                Change number
              </button>
            </form>
          )}
        </div>

        <p className="mt-6 text-center text-[13px]" style={{ color: SECOND }}>
          Don't have an account?{' '}
          <Link to="/register" className="font-semibold underline hover:opacity-80 transition-opacity" style={{ color: GOLD }}>Create one</Link>
        </p>
      </div>
    </div>
  )
}
