'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import api from '@/lib/api'
import { setGuestAuth, getPendingBooking } from '@/lib/guestAuth'
import { validateEmail, validatePassword } from '@/lib/auth'

function GuestLoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/'
  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({ email: '', password: '' })
  const [touched, setTouched] = useState({ email: false, password: false })
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)

  const validate = (field?: string) => {
    const e = {
      email: (!field || field === 'email') ? validateEmail(form.email) : errors.email,
      password: (!field || field === 'password') ? validatePassword(form.password) : errors.password,
    }
    setErrors(e)
    return !e.email && !e.password
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setForm(p => ({ ...p, [name]: value }))
    if (touched[name as keyof typeof touched]) {
      setErrors(p => ({ ...p, [name]: name === 'email' ? validateEmail(value) : validatePassword(value) }))
    }
    setServerError('')
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name } = e.target
    setTouched(p => ({ ...p, [name]: true }))
    validate(name)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setTouched({ email: true, password: true })
    if (!validate()) return
    setLoading(true)
    try {
      // Guest login uses staff auth endpoint — adapt if you have a separate guest endpoint
      const res = await api.post('/api/auth/login', form)
      setGuestAuth(res.data.token, res.data.user || { email: form.email })
      const pending = getPendingBooking()
      if (pending) router.push('/book?' + new URLSearchParams(pending).toString())
      else router.push(redirect)
    } catch (err: any) {
      setServerError(err.response?.data?.message || 'Invalid email or password.')
    } finally { setLoading(false) }
  }

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem 1.5rem' }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <span style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--pub-gold)', display: 'block', marginBottom: '0.75rem' }}>
            Welcome Back
          </span>
          <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2.5rem', fontWeight: 400, color: 'var(--pub-charcoal)', marginBottom: '0.5rem' }}>
            Sign In
          </h1>
          <p style={{ fontFamily: 'Jost, sans-serif', color: 'var(--pub-muted)', fontSize: '0.875rem' }}>
            Access your reservations and guest profile
          </p>
        </div>

        <div style={{ background: '#fff', border: '1px solid var(--pub-border)', borderRadius: '4px', padding: '2.5rem', boxShadow: '0 4px 24px var(--pub-shadow)' }}>
          {serverError && (
            <div style={{ background: 'rgba(192,57,43,0.06)', border: '1px solid rgba(192,57,43,0.2)', borderRadius: '3px', padding: '0.875rem 1rem', marginBottom: '1.5rem' }}>
              <p style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.875rem', color: '#c0392b' }}>⚠ {serverError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div style={{ marginBottom: '1.25rem' }}>
              <label className="pub-label">Email Address</label>
              <input type="email" name="email" value={form.email}
                onChange={handleChange} onBlur={handleBlur}
                placeholder="your@email.com"
                className={`pub-input ${errors.email && touched.email ? 'error' : ''}`} />
              {errors.email && touched.email && (
                <p style={{ fontFamily: 'Jost, sans-serif', color: '#c0392b', fontSize: '0.78rem', marginTop: '0.35rem' }}>{errors.email}</p>
              )}
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <label className="pub-label">Password</label>
              <input type="password" name="password" value={form.password}
                onChange={handleChange} onBlur={handleBlur}
                placeholder="Minimum 8 characters"
                className={`pub-input ${errors.password && touched.password ? 'error' : ''}`} />
              {errors.password && touched.password && (
                <p style={{ fontFamily: 'Jost, sans-serif', color: '#c0392b', fontSize: '0.78rem', marginTop: '0.35rem' }}>{errors.password}</p>
              )}
            </div>

            <button type="submit" disabled={loading} className="pub-btn-gold"
              style={{ width: '100%', textAlign: 'center', padding: '1rem' }}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="pub-divider" />

          <p style={{ textAlign: 'center', fontFamily: 'Jost, sans-serif', fontSize: '0.875rem', color: 'var(--pub-muted)' }}>
            New guest?{' '}
            <Link href="/guest/register" style={{ color: 'var(--pub-gold-dark)', fontWeight: 500, textDecoration: 'none' }}>
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function GuestLoginPage() {
  return (
    <Suspense fallback={null}>
      <GuestLoginContent />
    </Suspense>
  )
}