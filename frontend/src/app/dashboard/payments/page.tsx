'use client'
import { useEffect, useState } from 'react'
import api from '@/lib/api'

interface Payment {
  id: number; bookingId: number; amount: number; method: string; status: string; createdAt: string
  booking?: {
    guest?: { name: string; email: string }
    room?: { number: string; type: string }
    checkIn: string; checkOut: string
  }
}

interface PaymentForm { bookingId: string; amount: string; method: string; status: string }
const emptyForm: PaymentForm = { bookingId: '', amount: '', method: 'cash', status: 'pending' }
const methodOptions = ['cash', 'card', 'bank_transfer', 'stripe']
const statusOptions = ['pending', 'paid', 'failed', 'refunded']

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState<PaymentForm>(emptyForm)
  const [errors, setErrors] = useState<Partial<PaymentForm>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [saving, setSaving] = useState(false)
  const [filterStatus, setFilterStatus] = useState('all')
  const [search, setSearch] = useState('')

  const load = async () => {
    try {
      const [pRes, bRes] = await Promise.all([api.get('/api/payments'), api.get('/api/bookings')])
      setPayments(pRes.data)
      setBookings(bRes.data.filter((b: any) => !pRes.data.some((p: any) => p.bookingId === b.id)))
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const validateField = (name: string, value: string) => {
    if (name === 'bookingId' && !value) return 'Please select a booking'
    if (name === 'amount') {
      if (!value) return 'Amount is required'
      if (isNaN(Number(value)) || Number(value) <= 0) return 'Amount must be a positive number'
    }
    return ''
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setForm(p => ({ ...p, [name]: value }))
    if (touched[name]) setErrors(p => ({ ...p, [name]: validateField(name, value) }))
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setTouched(p => ({ ...p, [name]: true }))
    setErrors(p => ({ ...p, [name]: validateField(name, value) }))
  }

  const validateAll = () => {
    const fields = ['bookingId', 'amount']
    const newErrors: Partial<PaymentForm> = {}
    fields.forEach(f => { const e = validateField(f, (form as any)[f]); if (e) newErrors[f as keyof PaymentForm] = e })
    setErrors(newErrors)
    setTouched(Object.fromEntries(fields.map(f => [f, true])))
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateAll()) return
    setSaving(true)
    try {
      await api.post('/api/payments', {
        bookingId: Number(form.bookingId),
        amount: Number(form.amount),
        method: form.method,
        status: form.status,
      })
      setModal(false)
      setForm(emptyForm)
      setErrors({})
      setTouched({})
      load()
    } catch (err: any) {
      alert(err.response?.data?.message || 'Something went wrong')
    } finally { setSaving(false) }
  }

  const openAdd = () => { setForm(emptyForm); setErrors({}); setTouched({}); setModal(true) }

  const totalRevenue = payments.filter(p => p.status === 'paid').reduce((s, p) => s + p.amount, 0)
  const pending = payments.filter(p => p.status === 'pending').reduce((s, p) => s + p.amount, 0)

  const filtered = payments.filter(p => {
    const matchStatus = filterStatus === 'all' || p.status === filterStatus
    const matchSearch = !search ||
      p.booking?.guest?.name?.toLowerCase().includes(search.toLowerCase()) ||
      String(p.bookingId).includes(search)
    return matchStatus && matchSearch
  })

  const FieldError = ({ field }: { field: keyof PaymentForm }) =>
    errors[field] && touched[field] ? <p style={{ color: '#f87171', fontSize: '0.78rem', marginTop: '0.3rem' }}>{errors[field]}</p> : null

  // Auto-fill amount from booking
  const selectedBooking = bookings.find(b => b.id === Number(form.bookingId))
  useEffect(() => {
    if (selectedBooking && !form.amount) {
      setForm(p => ({ ...p, amount: String(selectedBooking.totalPrice || '') }))
    }
  }, [form.bookingId])

  return (
    <div>
      <div className="animate-fade-in" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '2rem', marginBottom: '0.25rem' }}>Payments</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{payments.length} total transactions</p>
        </div>
        <button onClick={openAdd} className="btn-gold">+ Record Payment</button>
      </div>

      {/* Revenue summary cards */}
      <div className="animate-fade-in-up delay-100" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div className="luxury-card" style={{ padding: '1.5rem' }}>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>Total Revenue</p>
          <p style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.75rem', color: 'var(--gold)', fontWeight: 700 }}>
            ${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
        <div className="luxury-card" style={{ padding: '1.5rem' }}>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>Pending</p>
          <p style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.75rem', color: '#fbbf24', fontWeight: 700 }}>
            ${pending.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
        <div className="luxury-card" style={{ padding: '1.5rem' }}>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>Paid Count</p>
          <p style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.75rem', color: '#4ade9a', fontWeight: 700 }}>
            {payments.filter(p => p.status === 'paid').length}
          </p>
        </div>
        <div className="luxury-card" style={{ padding: '1.5rem' }}>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>Transactions</p>
          <p style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.75rem', fontWeight: 700 }}>
            {payments.length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="animate-fade-in-up delay-200" style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap', alignItems: 'center' }}>
        {['all', ...statusOptions].map(s => (
          <button
            key={s} onClick={() => setFilterStatus(s)}
            style={{
              padding: '0.4rem 1rem', borderRadius: '999px', fontSize: '0.78rem', fontWeight: 500,
              cursor: 'pointer', transition: 'all 0.2s ease', border: 'none',
              background: filterStatus === s ? 'rgba(201,151,58,0.15)' : 'transparent',
              color: filterStatus === s ? 'var(--gold)' : 'var(--text-muted)',
              outline: filterStatus === s ? '1px solid rgba(201,151,58,0.3)' : '1px solid transparent',
            }}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
        <input
          type="text" placeholder="Search..." value={search}
          onChange={e => setSearch(e.target.value)}
          className="luxury-input" style={{ maxWidth: '220px', marginLeft: 'auto' }}
        />
      </div>

      <div className="animate-fade-in-up delay-300 luxury-card" style={{ overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '2rem' }}>
            {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: '56px', marginBottom: '0.5rem', borderRadius: '8px' }} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-dim)' }}>
            <p style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>◎</p>
            <p style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.1rem', marginBottom: '0.5rem' }}>No payments found</p>
            <p style={{ fontSize: '0.875rem' }}>Record a payment to get started</p>
          </div>
        ) : (
          <table className="luxury-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Booking</th>
                <th>Guest</th>
                <th>Method</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id}>
                  <td style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>#{p.id}</td>
                  <td style={{ color: 'var(--text-muted)' }}>Booking #{p.bookingId}</td>
                  <td style={{ fontWeight: 500 }}>{p.booking?.guest?.name || '—'}</td>
                  <td>
                    <span className={`badge badge-${p.method}`} style={{ textTransform: 'capitalize' }}>
                      {p.method.replace('_', ' ')}
                    </span>
                  </td>
                  <td style={{ color: 'var(--gold)', fontWeight: 600, fontSize: '1rem', fontFamily: 'Playfair Display, serif' }}>
                    ${p.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                  <td><span className={`badge badge-${p.status}`}>{p.status}</span></td>
                  <td style={{ color: 'var(--text-dim)', fontSize: '0.82rem' }}>{new Date(p.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modal && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) { setModal(false) } }}>
          <div className="modal-content">
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.5rem', marginBottom: '0.5rem' }}>Record Payment</h2>
            <div className="gold-divider" />
            <form onSubmit={handleSubmit} noValidate>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Booking
                </label>
                <select name="bookingId" value={form.bookingId} onChange={handleChange} onBlur={handleBlur}
                  className={`luxury-select ${errors.bookingId && touched.bookingId ? 'error' : ''}`}>
                  <option value="">Select a booking...</option>
                  {bookings.map(b => (
                    <option key={b.id} value={b.id}>
                      #{b.id} — {b.guest?.name || 'Guest'} — Room {b.room?.number || b.roomId} — ${b.totalPrice}
                    </option>
                  ))}
                </select>
                <FieldError field="bookingId" />
                {bookings.length === 0 && !form.bookingId && (
                  <p style={{ color: 'var(--text-dim)', fontSize: '0.78rem', marginTop: '0.3rem' }}>
                    All bookings already have payments recorded.
                  </p>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Amount ($)
                  </label>
                  <input type="number" name="amount" value={form.amount} onChange={handleChange} onBlur={handleBlur}
                    placeholder="0.00" step="0.01" min="0"
                    className={`luxury-input ${errors.amount && touched.amount ? 'error' : ''}`} />
                  <FieldError field="amount" />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Method
                  </label>
                  <select name="method" value={form.method} onChange={handleChange} className="luxury-select">
                    {methodOptions.map(m => <option key={m} value={m}>{m.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>)}
                  </select>
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Status
                  </label>
                  <select name="status" value={form.status} onChange={handleChange} className="luxury-select">
                    {statusOptions.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setModal(false)} className="btn-ghost">Cancel</button>
                <button type="submit" disabled={saving} className="btn-gold">
                  {saving ? 'Saving...' : 'Record Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}