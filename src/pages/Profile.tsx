import { useEffect, useState } from 'react'
import { Plus, Trash2, MapPin, Pencil, User } from 'lucide-react'
import type { Address } from '../types'
import { addressesApi } from '../api/addresses'
import { authApi } from '../api/auth'
import { useAuthStore } from '../stores/authStore'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { INDIA_STATES, COUNTRIES } from '../lib/locationData'

const BG = '#FAF8F4'
const GOLD = '#C9A227'
const TEXT = '#1A1A1A'
const SECOND = '#6A6A6A'
const BORDER = '#ECE7DF'

const emptyForm = {
  fullName: '', phone: '', line1: '', line2: '',
  city: '', state: '', pincode: '', country: 'India',
}

function Select({ label, value, onChange, options, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; options: string[]; placeholder?: string
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium" style={{ color: SECOND }}>{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border bg-white px-3 py-2.5 text-[14px] focus:outline-none"
        style={{ borderColor: BORDER, color: TEXT }}>
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  )
}

export function Profile() {
  const { user, setAuth, token } = useAuthStore()
  const [addresses, setAddresses] = useState<Address[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [editId, setEditId] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)

  const isOtpUser = user?.email?.endsWith('@nirote.local') ?? false
  const [editingProfile, setEditingProfile] = useState(false)
  const [profileForm, setProfileForm] = useState({ name: user?.name ?? '', email: '', phone: '' })
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileMsg, setProfileMsg] = useState('')

  const [showSetPassword, setShowSetPassword] = useState(false)
  const [passwordForm, setPasswordForm] = useState({ newPassword: '', confirmPassword: '' })
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [passwordMsg, setPasswordMsg] = useState('')

  function startEditProfile() {
    setProfileForm({ name: user?.name ?? '', email: isOtpUser ? '' : (user?.email ?? ''), phone: '' })
    setEditingProfile(true)
    setProfileMsg('')
  }

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault()
    setProfileSaving(true)
    try {
      const email = profileForm.email.trim() || user!.email
      const phone = profileForm.phone.trim() || undefined
      await authApi.updateProfile({ name: profileForm.name.trim(), email, phone })
      setAuth({ id: user!.id, name: profileForm.name.trim(), email, role: user!.role }, token ?? '')
      setProfileMsg('Profile updated successfully.')
      setEditingProfile(false)
    } catch (err: any) {
      const msg = err?.response?.data?.error ?? err?.message ?? 'Unknown error'
      setProfileMsg(`Failed to update profile: ${msg}`)
    } finally {
      setProfileSaving(false)
    }
  }

  async function handleSetPassword(e: React.FormEvent) {
    e.preventDefault()
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMsg('Passwords do not match.')
      return
    }
    setPasswordSaving(true)
    try {
      await authApi.setPassword(passwordForm.newPassword)
      setPasswordMsg('Password set! You can now login with your email and password.')
      setShowSetPassword(false)
      setPasswordForm({ newPassword: '', confirmPassword: '' })
    } catch (err: any) {
      const msg = err?.response?.data?.error ?? err?.message ?? 'Unknown error'
      setPasswordMsg(`Failed: ${msg}`)
    } finally {
      setPasswordSaving(false)
    }
  }

  useEffect(() => {
    addressesApi.list().then(setAddresses).catch(() => {})
  }, [])

  function field(key: keyof typeof emptyForm) {
    return (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [key]: e.target.value }))
  }

  const isIndiaForm = form.country === 'India'

  async function handleSave() {
    setSaving(true)
    try {
      const payload = {
        fullName: form.fullName, phone: form.phone, line1: form.line1,
        line2: form.line2 || undefined, city: form.city, state: form.state,
        pincode: form.pincode, country: form.country,
      }
      if (editId) {
        await addressesApi.update(editId, payload)
        setAddresses((prev) => prev.map((a) => a.id === editId ? { ...a, ...payload, line2: payload.line2 } : a))
      } else {
        const created = await addressesApi.create({ ...payload, isDefault: addresses.length === 0 })
        setAddresses((prev) => [...prev, { id: created.id, userId: 0, ...payload, line2: payload.line2, isDefault: addresses.length === 0 }])
      }
      setForm(emptyForm); setShowForm(false); setEditId(null)
    } finally {
      setSaving(false)
    }
  }

  async function handleSetDefault(id: number) {
    await addressesApi.setDefault(id)
    setAddresses((prev) => prev.map((a) => ({ ...a, isDefault: a.id === id })))
  }

  async function handleDelete(id: number) {
    await addressesApi.remove(id)
    setAddresses((prev) => prev.filter((a) => a.id !== id))
  }

  function startEdit(addr: Address) {
    setEditId(addr.id)
    setForm({ fullName: addr.fullName, phone: addr.phone, line1: addr.line1, line2: addr.line2 ?? '', city: addr.city, state: addr.state, pincode: addr.pincode, country: addr.country || 'India' })
    setShowForm(true)
  }

  const sectionCls = 'rounded-2xl bg-white p-6 mb-5'
  const sectionStyle = { border: `1px solid ${BORDER}` }

  function msgCls(msg: string) {
    return msg.startsWith('Failed') || msg.startsWith('Passwords')
      ? 'mb-4 rounded-xl border px-4 py-3 text-[13px] bg-red-50 border-red-200 text-red-700'
      : 'mb-4 rounded-xl border px-4 py-3 text-[13px] bg-green-50 border-green-200 text-green-700'
  }

  return (
    <div className="min-h-screen" style={{ background: BG }}>
      <section className="py-14 text-center px-6" style={{ borderBottom: `1px solid ${BORDER}` }}>
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] mb-2" style={{ color: GOLD }}>My</p>
        <h1 className="font-serif text-[36px] sm:text-[44px] font-bold" style={{ color: TEXT }}>Account</h1>
      </section>

      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">

        {/* User info */}
        <div className={sectionCls} style={sectionStyle}>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: '#F5EDD4' }}>
                <User className="h-5 w-5" style={{ color: GOLD }} />
              </div>
              <h2 className="font-semibold text-[16px]" style={{ color: TEXT }}>Account Details</h2>
            </div>
            {!editingProfile && (
              <button onClick={startEditProfile} className="flex items-center gap-1 text-[13px] font-medium transition-opacity hover:opacity-70" style={{ color: GOLD }}>
                <Pencil className="h-3.5 w-3.5" /> Edit
              </button>
            )}
          </div>

          {isOtpUser && !editingProfile && (
            <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-[13px] text-amber-800">
              You registered with mobile OTP. Add your email and name to complete your profile.
              <button onClick={startEditProfile} className="ml-2 font-medium underline">Update now</button>
            </div>
          )}

          {profileMsg && <div className={msgCls(profileMsg)}>{profileMsg}</div>}

          {editingProfile ? (
            <form onSubmit={saveProfile} className="space-y-3">
              <Input label="Full Name" value={profileForm.name}
                onChange={(e) => setProfileForm((f) => ({ ...f, name: e.target.value }))} required />
              <Input label="Email" type="email" value={profileForm.email}
                onChange={(e) => setProfileForm((f) => ({ ...f, email: e.target.value }))}
                placeholder={isOtpUser ? 'Add your email address' : user?.email}
                required={isOtpUser} />
              <Input label="Phone (optional)" type="tel" value={profileForm.phone}
                onChange={(e) => setProfileForm((f) => ({ ...f, phone: e.target.value }))}
                placeholder="10-digit mobile number" />
              <div className="flex gap-2 pt-1">
                <Button type="submit" size="sm" loading={profileSaving} className="rounded-full">Save Changes</Button>
                <Button type="button" size="sm" variant="ghost" onClick={() => setEditingProfile(false)} className="rounded-full">Cancel</Button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-2 gap-4 text-[14px]">
              <div>
                <p className="text-[12px] font-semibold uppercase tracking-[0.15em] mb-0.5" style={{ color: GOLD }}>Name</p>
                <p className="font-medium" style={{ color: TEXT }}>{user?.name}</p>
              </div>
              <div>
                <p className="text-[12px] font-semibold uppercase tracking-[0.15em] mb-0.5" style={{ color: GOLD }}>Email</p>
                <p className="font-medium" style={{ color: isOtpUser ? '#D97706' : TEXT }}>
                  {isOtpUser ? 'Not set' : user?.email}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Set Password */}
        {isOtpUser && (
          <div className={sectionCls} style={sectionStyle}>
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-semibold text-[16px]" style={{ color: TEXT }}>Set Password</h2>
              {!showSetPassword && (
                <button onClick={() => { setShowSetPassword(true); setPasswordMsg('') }}
                  className="text-[13px] font-medium transition-opacity hover:opacity-70" style={{ color: GOLD }}>
                  Set now
                </button>
              )}
            </div>
            <p className="text-[13px] mb-3" style={{ color: SECOND }}>
              Set a password so you can also login with your email and password next time.
            </p>
            {passwordMsg && <div className={msgCls(passwordMsg)}>{passwordMsg}</div>}
            {showSetPassword && (
              <form onSubmit={handleSetPassword} className="space-y-3">
                <Input label="New Password" type="password" value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm((f) => ({ ...f, newPassword: e.target.value }))}
                  placeholder="Minimum 6 characters" required />
                <Input label="Confirm Password" type="password" value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm((f) => ({ ...f, confirmPassword: e.target.value }))}
                  placeholder="Re-enter password" required />
                <div className="flex gap-2 pt-1">
                  <Button type="submit" size="sm" loading={passwordSaving} className="rounded-full">Save Password</Button>
                  <Button type="button" size="sm" variant="ghost" onClick={() => setShowSetPassword(false)} className="rounded-full">Cancel</Button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Addresses */}
        <div className={sectionCls} style={sectionStyle}>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: '#F5EDD4' }}>
                <MapPin className="h-5 w-5" style={{ color: GOLD }} />
              </div>
              <h2 className="font-semibold text-[16px]" style={{ color: TEXT }}>Saved Addresses</h2>
            </div>
            <button onClick={() => { setShowForm((v) => !v); setEditId(null); setForm(emptyForm) }}
              className="flex items-center gap-1 text-[13px] font-medium transition-opacity hover:opacity-70" style={{ color: GOLD }}>
              <Plus className="h-4 w-4" /> Add New
            </button>
          </div>

          {showForm && (
            <div className="mb-5 space-y-3 rounded-xl p-4" style={{ background: BG, border: `1px solid ${BORDER}` }}>
              <h3 className="text-[14px] font-semibold" style={{ color: TEXT }}>{editId ? 'Edit Address' : 'New Address'}</h3>
              <div className="grid grid-cols-2 gap-3">
                <Input label="Full Name" value={form.fullName} onChange={field('fullName')} />
                <Input label="Phone" value={form.phone} onChange={field('phone')} />
              </div>
              <Input label="Address Line 1" value={form.line1} onChange={field('line1')} />
              <Input label="Address Line 2 (optional)" value={form.line2} onChange={field('line2')} />
              <Select label="Country" value={form.country}
                onChange={(v) => setForm((f) => ({ ...f, country: v, state: '' }))} options={COUNTRIES} />
              {isIndiaForm ? (
                <Select label="State / UT" value={form.state}
                  onChange={(v) => setForm((f) => ({ ...f, state: v }))} options={INDIA_STATES} placeholder="Select state" />
              ) : (
                <Input label="State / Province / Region" value={form.state} onChange={field('state')} />
              )}
              <div className="grid grid-cols-2 gap-3">
                <Input label="City" value={form.city} onChange={field('city')} />
                <Input label={isIndiaForm ? 'Pincode' : 'ZIP / Postal Code'} value={form.pincode} onChange={field('pincode')}
                  placeholder={isIndiaForm ? '6-digit pincode' : 'Postal code'} />
              </div>
              <div className="flex gap-2 pt-1">
                <Button size="sm" loading={saving} onClick={handleSave} className="rounded-full">
                  {editId ? 'Update' : 'Save'} Address
                </Button>
                <Button size="sm" variant="ghost" onClick={() => { setShowForm(false); setEditId(null) }} className="rounded-full">Cancel</Button>
              </div>
            </div>
          )}

          {addresses.length === 0 && !showForm ? (
            <p className="text-[13px] text-center py-8" style={{ color: SECOND }}>No saved addresses yet</p>
          ) : (
            <div className="space-y-3">
              {addresses.map((addr) => (
                <div key={addr.id} className="rounded-xl p-4" style={{ border: `1px solid ${BORDER}` }}>
                  <div className="flex justify-between gap-3">
                    <div className="text-[13px]">
                      <p className="font-semibold" style={{ color: TEXT }}>{addr.fullName} · {addr.phone}</p>
                      <p className="mt-0.5" style={{ color: SECOND }}>{addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}</p>
                      <p style={{ color: SECOND }}>{addr.city}, {addr.state} – {addr.pincode}</p>
                      {addr.country && addr.country !== 'India' && <p style={{ color: SECOND }}>{addr.country}</p>}
                      <div className="mt-1.5">
                        {addr.isDefault
                          ? <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full" style={{ background: '#F5EDD4', color: GOLD }}>Default</span>
                          : <button onClick={() => handleSetDefault(addr.id)}
                              className="text-[12px] underline transition-opacity hover:opacity-70" style={{ color: SECOND }}>
                              Set as Default
                            </button>
                        }
                      </div>
                    </div>
                    <div className="flex gap-2 items-start flex-shrink-0">
                      <button onClick={() => startEdit(addr)}
                        className="text-[13px] font-medium transition-opacity hover:opacity-70" style={{ color: GOLD }}>
                        Edit
                      </button>
                      <button onClick={() => handleDelete(addr.id)}
                        className="w-7 h-7 flex items-center justify-center rounded-full transition-colors hover:bg-red-50"
                        style={{ color: SECOND }}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
