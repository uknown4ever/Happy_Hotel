'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import api from '@/lib/api'
import { setAuth, validateEmail, validatePassword, validateRequired } from '@/lib/auth'

interface FormData {
  name: string
  email: string
  password: string
  confirmPassword: string
  role: string
}

interface FormErrors {
  name: string
  email: string
  password: string
  confirmPassword: string
  role: string
}

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState<FormData>({
    name: '', email: '', password: '', confirmPassword: '', role: 'staff',
  })
  const [errors, setErrors] = useState<FormErrors>({
    name: '', email: '', password: '', confirmPassword: '', role: '',
  })
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)

  const validateField = (name: string, value: string): string => {
    switch (name) {
      case 'name': return validateRequired(value, 'Full name')
      case 'email': return validateEmail(value)
      case 'password': return validatePassword(value)
      case 'confirmPassword':
        if (!value) return 'Please confirm your password'
        if (value !== form.password) return 'Passwords do not match'
        return ''
      case 'role': return validateRequired(value, 'Role')
      default: return ''
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    if (touched[name]) {
      setErrors(prev => ({ ...prev, [name]: validateField(name, value) }))
    }
    setServerError('')
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setTouched(prev => ({ ...prev, [name]: true }))
    setErrors(prev => ({ ...prev, [name]: validateField(name, value) }))
  }

  const validateAll = (): boolean => {
    const newErrors: FormErrors = {
      name: validateField('name', form.name),
      email: validateField('email', form.email),
      password: validateField('password', form.password),
      confirmPassword: validateField('confirmPassword', form.confirmPassword),
      role: validateField('role', form.role),
    }
    setErrors(newErrors)
    setTouched({ name: true, email: true, password: true, confirmPassword: true, role: true })
    return !Object.values(newErrors).some(e => e)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateAll()) return
    setLoading(true)
    setServerError('')
    try {
      const res = await api.post('/api/auth/register', {
        name: form.name, email: form.email, password: form.password, role: form.role,
      })
      setAuth(res.data.token, res.data.user || { email: form.email, name: form.name })
      router.push('/dashboard')
    } catch (err: any) {
      setServerError(err.response?.data?.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const FieldError = ({ field }: { field: keyof FormErrors }) =>
    errors[field] && touched[field] ? (
      <p className="animate-fade-in" style={{ color: '#f87171', fontSize: '0.8rem', marginTop: '0.4rem' }}>
        {errors[field]}
      </p>
    ) : null

  const passwordStrength = (): { label: string; color: string; width: string } => {
    const p = form.password
    if (!p) return { label: '', color: 'transparent', width: '0%' }
    if (p.length < 6) return { label: 'Weak', color: '#f87171', width: '25%' }
    if (p.length < 8) return { label: 'Fair', color: '#fbbf24', width: '50%' }
    if (p.length < 12) return { label: 'Good', color: '#c9973a', width: '75%' }
    return { label: 'Strong', color: '#4ade9a', width: '100%' }
  }

  const strength = passwordStrength()

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'stretch' }}>
      {/* Decorative left panel */}
      <div style={{
        width: '38%',
        background: 'linear-gradient(160deg, #111d30 0%, #080f1e 100%)',
        borderRight: '1px solid rgba(201,151,58,0.1)',
        display: 'flex', flexDirection: 'column',
        justifyContent: 'center', alignItems: 'center',
        padding: '3rem', position: 'relative', overflow: 'hidden',
      }} className="hidden md:flex">
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(rgba(201,151,58,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(201,151,58,0.03) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }} />
        <div style={{ position: 'relative', textAlign: 'center', maxWidth: '280px' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1.5rem', color: 'var(--gold)' }}>⬡</div>
          <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.8rem', lineHeight: 1.3, marginBottom: '1rem' }}>
            Join the<br /><em>Aurum family</em>
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.8 }}>
            Create your staff account and start managing your hotel with elegance and precision.
          </p>
          <div style={{ marginTop: '2.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {['Full booking management', 'Real-time room tracking', 'Payment processing', 'Guest profiles'].map(f => (
              <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ color: 'var(--gold)', fontSize: '0.875rem' }}>✦</span>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        justifyContent: 'center', alignItems: 'center',
        padding: '3rem', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: '20%', right: '10%',
          width: '300px', height: '300px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(201,151,58,0.05) 0%, transparent 70%)',
          filter: 'blur(50px)',
        }} />

        {/* Logo */}
        <div className="animate-fade-in" style={{ marginBottom: '2rem', textAlign: 'center' }}>
          <div style={{
            width: '48px', height: '48px',
            background: 'linear-gradient(135deg, #8a6425, #c9973a)',
            borderRadius: '12px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 0.75rem',
            boxShadow: '0 4px 16px rgba(201,151,58,0.25)',
          }}>
            <span style={{ fontSize: '1.25rem' }}>♦</span>
          </div>
          <p className="gold-shimmer" style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.1rem' }}>AURUM</p>
        </div>

        <div className="animate-fade-in-up delay-100 luxury-card" style={{
          width: '100%', maxWidth: '460px', padding: '2.5rem',
        }}>
          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.6rem', marginBottom: '0.4rem' }}>
              Create account
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              Set up your staff portal access
            </p>
          </div>

          {serverError && (
            <div className="animate-fade-in" style={{
              background: 'rgba(192,57,43,0.1)', border: '1px solid rgba(192,57,43,0.3)',
              borderRadius: '8px', padding: '0.875rem 1rem', marginBottom: '1.5rem',
            }}>
              <span style={{ color: '#f87171', fontSize: '0.875rem' }}>⚠ {serverError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              {/* Full Name */}
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                  Full Name
                </label>
                <input
                  type="text" name="name" value={form.name}
                  onChange={handleChange} onBlur={handleBlur}
                  placeholder="John Doe"
                  className={`luxury-input ${errors.name && touched.name ? 'error' : ''}`}
                />
                <FieldError field="name" />
              </div>

              {/* Email */}
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                  Email Address
                </label>
                <input
                  type="email" name="email" value={form.email}
                  onChange={handleChange} onBlur={handleBlur}
                  placeholder="name@hotel.com"
                  className={`luxury-input ${errors.email && touched.email ? 'error' : ''}`}
                />
                <FieldError field="email" />
              </div>

              {/* Role */}
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                  Role
                </label>
                <select
                  name="role" value={form.role}
                  onChange={handleChange} onBlur={handleBlur}
                  className="luxury-select"
                >
                  <option value="staff">Staff</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              {/* Password */}
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                  Password
                </label>
                <input
                  type="password" name="password" value={form.password}
                  onChange={handleChange} onBlur={handleBlur}
                  placeholder="Min. 8 characters"
                  className={`luxury-input ${errors.password && touched.password ? 'error' : ''}`}
                />
                {form.password && (
                  <div style={{ marginTop: '0.5rem' }}>
                    <div style={{ height: '3px', background: 'var(--bg-card-hover)', borderRadius: '2px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: strength.width, background: strength.color, transition: 'all 0.3s ease', borderRadius: '2px' }} />
                    </div>
                    <p style={{ fontSize: '0.75rem', color: strength.color, marginTop: '0.25rem' }}>{strength.label}</p>
                  </div>
                )}
                <FieldError field="password" />
              </div>

              {/* Confirm Password */}
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                  Confirm
                </label>
                <input
                  type="password" name="confirmPassword" value={form.confirmPassword}
                  onChange={handleChange} onBlur={handleBlur}
                  placeholder="Repeat password"
                  className={`luxury-input ${errors.confirmPassword && touched.confirmPassword ? 'error' : ''}`}
                />
                <FieldError field="confirmPassword" />
              </div>
            </div>

            <button
              type="submit" disabled={loading}
              className="btn-gold"
              style={{ width: '100%', padding: '0.875rem', marginTop: '0.5rem' }}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                  <span style={{ width: '16px', height: '16px', border: '2px solid rgba(0,0,0,0.3)', borderTop: '2px solid #080f1e', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} />
                  Creating account...
                </span>
              ) : 'Create Account'}
            </button>
          </form>

          <div className="gold-divider" />

          <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Already have an account?{' '}
            <Link href="/login" style={{ color: 'var(--gold)', fontWeight: 500, textDecoration: 'none' }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 768px) { .hidden { display: none !important; } }
      `}</style>
    </div>
  )
}