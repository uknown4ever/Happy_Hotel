'use client'
import { useEffect, useState } from 'react'
import api from '@/lib/api'

interface Booking {
  id: number; guestId: number; roomId: number; checkIn: string; checkOut: string
  status: string; totalPrice: number; createdAt: string
  guest?: { name: string; email: string }
  room?: { number: string; type: string; price: number }
}

interface BookingForm {
  guestId: string; roomId: string; checkIn: string; checkOut: string; status: string
}

const emptyForm: BookingForm = { guestId: '', roomId: '', checkIn: '', checkOut: '', status: 'pending' }
const statusOptions = ['pending', 'confirmed', 'cancelled', 'completed']

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [guests, setGuests] = useState<any[]>([])
  const [rooms, setRooms] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<'add' | 'edit' | null>(null)
  const [selected, setSelected] = useState<Booking | null>(null)
  const [form, setForm] = useState<BookingForm>(emptyForm)
  const [errors, setErrors] = useState<Partial<BookingForm>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [saving, setSaving] = useState(false)
  const [filterStatus, setFilterStatus] = useState('all')
  const [search, setSearch] = useState('')
  const [calculatedPrice, setCalculatedPrice] = useState(0)

  const load = async () => {
    try {
      const [bRes, gRes, rRes] = await Promise.all([
        api.get('/api/bookings'),
        api.get('/api/guests'),
        api.get('/api/rooms'),
      ])
      setBookings(bRes.data)
      setGuests(gRes.data)
      setRooms(rRes.data)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  // Auto-calculate price
  useEffect(() => {
    if (form.roomId && form.checkIn && form.checkOut) {
      const room = rooms.find(r => r.id === Number(form.roomId))
      if (room) {
        const nights = Math.max(0, Math.ceil((new Date(form.checkOut).getTime() - new Date(form.checkIn).getTime()) / (1000 * 60 * 60 * 24)))
        setCalculatedPrice(nights * room.price)
      }
    } else { setCalculatedPrice(0) }
  }, [form.roomId, form.checkIn, form.checkOut, rooms])

  const validateField = (name: string, value: string) => {
    if (name === 'guestId' && !value) return 'Please select a guest'
    if (name === 'roomId' && !value) return 'Please select a room'
    if (name === 'checkIn' && !value) return 'Check-in date is required'
    if (name === 'checkOut') {
      if (!value) return 'Check-out date is required'
      if (form.checkIn && value <= form.checkIn) return 'Check-out must be after check-in'
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
    const fields = ['guestId', 'roomId', 'checkIn', 'checkOut']
    const newErrors: Partial<BookingForm> = {}
    fields.forEach(f => { const e = validateField(f, (form as any)[f]); if (e) newErrors[f as keyof BookingForm] = e })
    setErrors(newErrors)
    setTouched(Object.fromEntries(fields.map(f => [f, true])))
    return Object.keys(newErrors).length === 0
  }

  const openAdd = () => { setForm(emptyForm); setErrors({}); setTouched({}); setSelected(null); setModal('add') }
  const openEdit = (b: Booking) => {
    setForm({
      guestId: String(b.guestId), roomId: String(b.roomId),
      checkIn: b.checkIn.slice(0, 10), checkOut: b.checkOut.slice(0, 10), status: b.status,
    })
    setErrors({}); setTouched({}); setSelected(b); setModal('edit')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateAll()) return
    setSaving(true)
    try {
      const data = {
        guestId: Number(form.guestId), roomId: Number(form.roomId),
        checkIn: form.checkIn, checkOut: form.checkOut,
        status: form.status, totalPrice: calculatedPrice,
      }
      if (modal === 'add') await api.post('/api/bookings', data)
      else await api.put(`/api/bookings/${selected!.id}`, { status: form.status })
      setModal(null); load()
    } catch (err: any) {
      alert(err.response?.data?.message || 'Something went wrong')
    } finally { setSaving(false) }
  }

  const nights = (checkIn: string, checkOut: string) =>
    Math.max(0, Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24)))

  const filtered = bookings.filter(b => {
    const matchStatus = filterStatus === 'all' || b.status === filterStatus
    const matchSearch = !search ||
      b.guest?.name?.toLowerCase().includes(search.toLowerCase()) ||
      b.room?.number?.includes(search)
    return matchStatus && matchSearch
  })

  const FieldError = ({ field }: { field: keyof BookingForm }) =>
    errors[field] && touched[field] ? <p style={{ color: '#f87171', fontSize: '0.78rem', marginTop: '0.3rem' }}>{errors[field]}</p> : null

  return (
    <div>
      <div className="animate-fade-in" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '2rem', marginBottom: '0.25rem' }}>Bookings</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{bookings.length} total bookings</p>
        </div>
        <button onClick={openAdd} className="btn-gold">+ New Booking</button>
      </div>

      {/* Status tabs */}
      <div className="animate-fade-in-up delay-100" style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        {['all', ...statusOptions].map(s => (
          <button
            key={s} onClick={() => setFilterStatus(s)}
            style={{
              padding: '0.5rem 1.125rem', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 500,
              cursor: 'pointer', transition: 'all 0.2s ease', border: 'none',
              background: filterStatus === s ? 'rgba(201,151,58,0.15)' : 'transparent',
              color: filterStatus === s ? 'var(--gold)' : 'var(--text-muted)',
              outline: filterStatus === s ? '1px solid rgba(201,151,58,0.3)' : '1px solid transparent',
            }}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
            <span style={{ marginLeft: '0.375rem', fontSize: '0.7rem', opacity: 0.8 }}>
              ({s === 'all' ? bookings.length : bookings.filter(b => b.status === s).length})
            </span>
          </button>
        ))}
      </div>

      <div className="animate-fade-in-up delay-100" style={{ marginBottom: '1.5rem' }}>
        <input
          type="text" placeholder="Search by guest name or room number..." value={search}
          onChange={e => setSearch(e.target.value)}
          className="luxury-input" style={{ maxWidth: '340px' }}
        />
      </div>

      <div className="animate-fade-in-up delay-200 luxury-card" style={{ overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '2rem' }}>
            {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: '60px', marginBottom: '0.5rem', borderRadius: '8px' }} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-dim)' }}>
            <p style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>◫</p>
            <p style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.1rem', marginBottom: '0.5rem' }}>No bookings found</p>
            <p style={{ fontSize: '0.875rem' }}>Create a new booking to get started</p>
          </div>
        ) : (
          <table className="luxury-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Guest</th>
                <th>Room</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Nights</th>
                <th>Total</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(b => (
                <tr key={b.id}>
                  <td style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>#{b.id}</td>
                  <td style={{ fontWeight: 500 }}>{b.guest?.name || '—'}</td>
                  <td style={{ color: 'var(--text-muted)' }}>
                    Room {b.room?.number || b.roomId}
                    {b.room?.type && <span style={{ fontSize: '0.75rem', marginLeft: '0.25rem', opacity: 0.6, textTransform: 'capitalize' }}>({b.room.type})</span>}
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{new Date(b.checkIn).toLocaleDateString()}</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{new Date(b.checkOut).toLocaleDateString()}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{nights(b.checkIn, b.checkOut)}n</td>
                  <td style={{ color: 'var(--gold)', fontWeight: 500 }}>${b.totalPrice?.toLocaleString()}</td>
                  <td><span className={`badge badge-${b.status}`}>{b.status}</span></td>
                  <td>
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <button onClick={() => openEdit(b)} className="btn-ghost" style={{ fontSize: '0.78rem', padding: '0.4rem 0.875rem' }}>Edit</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modal && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setModal(null) }}>
          <div className="modal-content">
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.5rem', marginBottom: '0.5rem' }}>
              {modal === 'add' ? 'New Booking' : `Edit Booking #${selected?.id}`}
            </h2>
            <div className="gold-divider" />
            <form onSubmit={handleSubmit} noValidate>
              {modal === 'add' ? (
                <>
                  <div style={{ marginBottom: '1.25rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Guest</label>
                    <select name="guestId" value={form.guestId} onChange={handleChange} onBlur={handleBlur} className={`luxury-select ${errors.guestId && touched.guestId ? 'error' : ''}`}>
                      <option value="">Select a guest...</option>
                      {guests.map(g => <option key={g.id} value={g.id}>{g.name} — {g.email}</option>)}
                    </select>
                    <FieldError field="guestId" />
                  </div>
                  <div style={{ marginBottom: '1.25rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Room</label>
                    <select name="roomId" value={form.roomId} onChange={handleChange} onBlur={handleBlur} className={`luxury-select ${errors.roomId && touched.roomId ? 'error' : ''}`}>
                      <option value="">Select a room...</option>
                      {rooms.filter(r => r.status === 'available').map(r => (
                        <option key={r.id} value={r.id}>Room {r.number} — {r.type} — ${r.price}/night</option>
                      ))}
                    </select>
                    <FieldError field="roomId" />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Check In</label>
                      <input type="date" name="checkIn" value={form.checkIn} onChange={handleChange} onBlur={handleBlur}
                        min={new Date().toISOString().slice(0,10)}
                        className={`luxury-input ${errors.checkIn && touched.checkIn ? 'error' : ''}`} />
                      <FieldError field="checkIn" />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Check Out</label>
                      <input type="date" name="checkOut" value={form.checkOut} onChange={handleChange} onBlur={handleBlur}
                        min={form.checkIn || new Date().toISOString().slice(0,10)}
                        className={`luxury-input ${errors.checkOut && touched.checkOut ? 'error' : ''}`} />
                      <FieldError field="checkOut" />
                    </div>
                  </div>
                  {calculatedPrice > 0 && (
                    <div style={{ padding: '1rem', background: 'rgba(201,151,58,0.08)', border: '1px solid rgba(201,151,58,0.2)', borderRadius: '8px', marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Calculated Total</span>
                        <span style={{ color: 'var(--gold)', fontSize: '1.25rem', fontFamily: 'Playfair Display, serif', fontWeight: 700 }}>
                          ${calculatedPrice.toLocaleString()}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.25rem' }}>
                        {nights(form.checkIn, form.checkOut)} nights × ${rooms.find(r => r.id === Number(form.roomId))?.price}/night
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <div style={{ marginBottom: '1.25rem' }}>
                  <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', marginBottom: '1.25rem' }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                      Guest: <strong style={{ color: 'var(--text-primary)' }}>{selected?.guest?.name}</strong> · 
                      Room: <strong style={{ color: 'var(--text-primary)' }}>{selected?.room?.number}</strong>
                    </p>
                  </div>
                  <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</label>
                  <select name="status" value={form.status} onChange={handleChange} className="luxury-select">
                    {statusOptions.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                  </select>
                </div>
              )}
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setModal(null)} className="btn-ghost">Cancel</button>
                <button type="submit" disabled={saving} className="btn-gold">
                  {saving ? 'Saving...' : modal === 'add' ? 'Create Booking' : 'Update Status'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}