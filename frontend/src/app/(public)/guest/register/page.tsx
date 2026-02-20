'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import { setGuestAuth, getPendingBooking } from '@/lib/guestAuth'
import { validateEmail, validatePassword, validateRequired, validatePhone } from '@/lib/auth'

export default function GuestRegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)

  const validateField = (name: string, value: string): string => {
    switch (name) {
      case 'name': return validateRequired(value, 'Full name')
      case 'email': return validateEmail(value)
      case 'phone': return validatePhone(value)
      case 'password': return validatePassword(value)
      case 'confirmPassword':
        if (!value) return 'Please confirm your password'
        if (value !== form.password) return 'Passwords do not match'
        return ''
      default: return ''
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setForm(p => ({ ...p, [name]: value }))
    if (touched[name]) setErrors(p => ({ ...p, [name]: validateField(name, value) }))
    setServerError('')
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setTouched(p => ({ ...p, [name]: true }))
    setErrors(p => ({ ...p, [name]: validateField(name, value) }))
  }

  const validateAll = () => {
    const fields = ['name', 'email', 'phone', 'password', 'confirmPassword']
    const newErrors: Record<string, string> = {}
    fields.forEach(f => { const e = validateField(f, (form as any)[f]); if (e) newErrors[f] = e })
    setErrors(newErrors)
    setTouched(Object.fromEntries(fields.map(f => [f, true])))
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateAll()) return
    setLoading(true)
    try {
      // First create the guest profile in the guests table
      await api.post('/api/guests', { name: form.name, email: form.email, phone: form.phone })
      // Then register as staff/user for auth (reusing auth system)
      const res = await api.post('/api/auth/register', {
        name: form.name, email: form.email, password: form.password, role: 'guest'
      })
      setGuestAuth(res.data.token, { name: form.name, email: form.email, role: 'guest' })
      const pending = getPendingBooking()
      if (pending) router.push('/book?' + new URLSearchParams(pending).toString())
      else router.push('/')
    } catch (err: any) {
      setServerError(err.response?.data?.message || 'Registration failed. This email may already be in use.')
    } finally { setLoading(false) }
  }

  const FieldError = ({ field }: { field: string }) =>
    errors[field] && touched[field] ? (
      <p style={{ fontFamily: 'Jost, sans-serif', color: '#c0392b', fontSize: '0.78rem', marginTop: '0.35rem' }}>{errors[field]}</p>
    ) : null

  const strength = (() => {
    const p = form.password
    if (!p) return null
    if (p.length < 6) return { label: 'Weak', color: '#c0392b', w: '25%' }
    if (p.length < 8) return { label: 'Fair', color: '#d4860a', w: '50%' }
    if (p.length < 12) return { label: 'Good', color: '#b8863a', w: '75%' }
    return { label: 'Strong', color: '#2a7d4f', w: '100%' }
  })()

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem 1.5rem' }}>
      <div style={{ width: '100%', maxWidth: '480px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <span style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--pub-gold)', display: 'block', marginBottom: '0.75rem' }}>
            Join Aurum
          </span>
          <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2.5rem', fontWeight: 400, color: 'var(--pub-charcoal)', marginBottom: '0.5rem' }}>
            Create Account
          </h1>
          <p style={{ fontFamily: 'Jost, sans-serif', color: 'var(--pub-muted)', fontSize: '0.875rem' }}>
            Book rooms, manage reservations, and enjoy exclusive benefits
          </p>
        </div>

        <div style={{ background: '#fff', border: '1px solid var(--pub-border)', borderRadius: '4px', padding: '2.5rem', boxShadow: '0 4px 24px var(--pub-shadow)' }}>
          {serverError && (
            <div style={{ background: 'rgba(192,57,43,0.06)', border: '1px solid rgba(192,57,43,0.2)', borderRadius: '3px', padding: '0.875rem 1rem', marginBottom: '1.5rem' }}>
              <p style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.875rem', color: '#c0392b' }}>⚠ {serverError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {[
              { name: 'name', label: 'Full Name', type: 'text', placeholder: 'Jane Smith' },
              { name: 'email', label: 'Email Address', type: 'email', placeholder: 'jane@example.com' },
              { name: 'phone', label: 'Phone Number', type: 'tel', placeholder: '+1 234 567 8900' },
            ].map(field => (
              <div key={field.name} style={{ marginBottom: '1.25rem' }}>
                <label className="pub-label">{field.label}</label>
                <input type={field.type} name={field.name} value={(form as any)[field.name]}
                  onChange={handleChange} onBlur={handleBlur} placeholder={field.placeholder}
                  className={`pub-input ${errors[field.name] && touched[field.name] ? 'error' : ''}`} />
                <FieldError field={field.name} />
              </div>
            ))}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
              <div>
                <label className="pub-label">Password</label>
                <input type="password" name="password" value={form.password}
                  onChange={handleChange} onBlur={handleBlur} placeholder="Min. 8 characters"
                  className={`pub-input ${errors.password && touched.password ? 'error' : ''}`} />
                {strength && (
                  <div style={{ marginTop: '0.5rem' }}>
                    <div style={{ height: '3px', background: '#f0ebe0', borderRadius: '2px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: strength.w, background: strength.color, transition: 'all 0.3s' }} />
                    </div>
                    <p style={{ fontSize: '0.72rem', color: strength.color, marginTop: '0.2rem', fontFamily: 'Jost, sans-serif' }}>{strength.label}</p>
                  </div>
                )}
                <FieldError field="password" />
              </div>
              <div>
                <label className="pub-label">Confirm</label>
                <input type="password" name="confirmPassword" value={form.confirmPassword}
                  onChange={handleChange} onBlur={handleBlur} placeholder="Repeat password"
                  className={`pub-input ${errors.confirmPassword && touched.confirmPassword ? 'error' : ''}`} />
                <FieldError field="confirmPassword" />
              </div>
            </div>

            <button type="submit" disabled={loading} className="pub-btn-gold"
              style={{ width: '100%', textAlign: 'center', padding: '1rem' }}>
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <div className="pub-divider" />

          <p style={{ textAlign: 'center', fontFamily: 'Jost, sans-serif', fontSize: '0.875rem', color: 'var(--pub-muted)' }}>
            Already have an account?{' '}
            <Link href="/guest/login" style={{ color: 'var(--pub-gold-dark)', fontWeight: 500, textDecoration: 'none' }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}