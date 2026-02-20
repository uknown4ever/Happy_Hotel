'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import api from '@/lib/api'
import { setAuth, validateEmail, validatePassword } from '@/lib/auth'

export default function LoginPage() {
  const router = useRouter()
  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({ email: '', password: '' })
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)
  const [touched, setTouched] = useState({ email: false, password: false })

  const validate = (field?: string) => {
    const newErrors = {
      email: field === 'email' || !field ? validateEmail(form.email) : errors.email,
      password: field === 'password' || !field ? validatePassword(form.password) : errors.password,
    }
    setErrors(newErrors)
    return !newErrors.email && !newErrors.password
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    if (touched[name as keyof typeof touched]) {
      setErrors(prev => ({
        ...prev,
        [name]: name === 'email' ? validateEmail(value) : validatePassword(value),
      }))
    }
    setServerError('')
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name } = e.target
    setTouched(prev => ({ ...prev, [name]: true }))
    validate(name)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setTouched({ email: true, password: true })
    if (!validate()) return
    setLoading(true)
    setServerError('')
    try {
      const res = await api.post('/api/auth/login', form)
      setAuth(res.data.token, res.data.user || { email: form.email })
      router.push('/dashboard')
    } catch (err: any) {
      setServerError(err.response?.data?.message || 'Invalid credentials. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'stretch' }}>
      {/* Left Panel */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '3rem',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Background orbs */}
        <div style={{
          position: 'absolute', top: '15%', left: '10%',
          width: '300px', height: '300px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(201,151,58,0.06) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }} />
        <div style={{
          position: 'absolute', bottom: '20%', right: '5%',
          width: '200px', height: '200px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(201,151,58,0.04) 0%, transparent 70%)',
          filter: 'blur(30px)',
        }} />

        {/* Logo */}
        <div className="animate-fade-in" style={{ marginBottom: '3rem', textAlign: 'center' }}>
          <div style={{
            width: '56px', height: '56px',
            background: 'linear-gradient(135deg, #8a6425, #c9973a)',
            borderRadius: '14px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1rem',
            boxShadow: '0 4px 20px rgba(201,151,58,0.3)',
          }}>
            <span style={{ fontSize: '1.5rem' }}>♦</span>
          </div>
          <h1 className="gold-shimmer" style={{ fontSize: '1.5rem', fontFamily: 'Playfair Display, serif' }}>
            AURUM
          </h1>
          <p style={{ color: 'var(--text-dim)', fontSize: '0.75rem', letterSpacing: '0.2em', marginTop: '0.25rem' }}>
            HOTEL MANAGEMENT
          </p>
        </div>

        {/* Form Card */}
        <div className="animate-fade-in-up delay-100 luxury-card" style={{
          width: '100%', maxWidth: '420px',
          padding: '2.5rem',
        }}>
          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.75rem', marginBottom: '0.5rem' }}>
              Welcome back
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Sign in to your management portal
            </p>
          </div>

          {serverError && (
            <div className="animate-fade-in" style={{
              background: 'rgba(192,57,43,0.1)',
              border: '1px solid rgba(192,57,43,0.3)',
              borderRadius: '8px',
              padding: '0.875rem 1rem',
              marginBottom: '1.5rem',
              display: 'flex', alignItems: 'center', gap: '0.5rem',
            }}>
              <span style={{ color: '#f87171', fontSize: '0.875rem' }}>⚠ {serverError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {/* Email */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{
                display: 'block', marginBottom: '0.5rem',
                fontSize: '0.8rem', fontWeight: 500,
                color: 'var(--text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase',
              }}>
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="name@hotel.com"
                className={`luxury-input ${errors.email && touched.email ? 'error' : ''}`}
                autoComplete="email"
              />
              {errors.email && touched.email && (
                <p className="animate-fade-in" style={{ color: '#f87171', fontSize: '0.8rem', marginTop: '0.4rem' }}>
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div style={{ marginBottom: '1.75rem' }}>
              <label style={{
                display: 'block', marginBottom: '0.5rem',
                fontSize: '0.8rem', fontWeight: 500,
                color: 'var(--text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase',
              }}>
                Password
              </label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Minimum 8 characters"
                className={`luxury-input ${errors.password && touched.password ? 'error' : ''}`}
                autoComplete="current-password"
              />
              {errors.password && touched.password && (
                <p className="animate-fade-in" style={{ color: '#f87171', fontSize: '0.8rem', marginTop: '0.4rem' }}>
                  {errors.password}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-gold"
              style={{ width: '100%', padding: '0.875rem' }}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                  <span style={{
                    width: '16px', height: '16px',
                    border: '2px solid rgba(0,0,0,0.3)',
                    borderTop: '2px solid #080f1e',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite',
                    display: 'inline-block',
                  }} />
                  Signing in...
                </span>
              ) : 'Sign In'}
            </button>
          </form>

          <div className="gold-divider" />

          <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Don&apos;t have an account?{' '}
            <Link href="/register" style={{ color: 'var(--gold)', fontWeight: 500, textDecoration: 'none' }}>
              Create one
            </Link>
          </p>
        </div>
      </div>

      {/* Right Panel — decorative */}
      <div style={{
        width: '42%',
        background: 'linear-gradient(160deg, #111d30 0%, #080f1e 60%)',
        borderLeft: '1px solid rgba(201,151,58,0.1)',
        display: 'flex', flexDirection: 'column',
        justifyContent: 'center', alignItems: 'center',
        padding: '3rem',
        position: 'relative', overflow: 'hidden',
      }} className="hidden md:flex">
        {/* Decorative grid */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(rgba(201,151,58,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(201,151,58,0.04) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }} />

        {/* Center content */}
        <div style={{ position: 'relative', textAlign: 'center', maxWidth: '320px' }}>
          <div style={{
            fontSize: '5rem', marginBottom: '1.5rem',
            background: 'linear-gradient(135deg, #8a6425, #c9973a, #e2b96a)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>♦</div>
          <h2 style={{
            fontFamily: 'Playfair Display, serif',
            fontSize: '2rem', lineHeight: 1.3,
            marginBottom: '1rem',
          }}>
            Elegance in<br /><em>every detail</em>
          </h2>
          <p style={{ color: 'var(--text-muted)', lineHeight: 1.8, fontSize: '0.9rem' }}>
            Manage your property with the precision and grace your guests deserve.
          </p>

          <div style={{ marginTop: '3rem', display: 'flex', gap: '1.5rem', justifyContent: 'center' }}>
            {['Rooms', 'Guests', 'Bookings'].map(item => (
              <div key={item} style={{
                textAlign: 'center', padding: '1rem',
                background: 'rgba(201,151,58,0.05)',
                border: '1px solid rgba(201,151,58,0.1)',
                borderRadius: '10px',
              }}>
                <p style={{ color: 'var(--gold)', fontFamily: 'Playfair Display, serif', fontSize: '1.25rem' }}>✓</p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.25rem' }}>{item}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 768px) { .hidden { display: none !important; } }
      `}</style>
    </div>
  )
}