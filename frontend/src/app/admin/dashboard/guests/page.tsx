'use client'
import { useEffect, useState } from 'react'
import api from '@/lib/api'
import { validateRequired, validateEmail, validatePhone } from '@/lib/auth'

interface Guest {
  id: number; name: string; email: string; phone: string; createdAt: string
  bookings?: any[]
}

interface GuestForm { name: string; email: string; phone: string }
const emptyForm: GuestForm = { name: '', email: '', phone: '' }

export default function GuestsPage() {
  const [guests, setGuests] = useState<Guest[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<'add' | 'edit' | null>(null)
  const [selected, setSelected] = useState<Guest | null>(null)
  const [form, setForm] = useState<GuestForm>(emptyForm)
  const [errors, setErrors] = useState<Partial<GuestForm>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [search, setSearch] = useState('')

  const load = async () => {
    try { const res = await api.get('/api/guests'); setGuests(res.data) }
    catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const validateField = (name: string, value: string) => {
    if (name === 'name') return validateRequired(value, 'Full name')
    if (name === 'email') return validateEmail(value)
    if (name === 'phone') return validatePhone(value)
    return ''
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setForm(p => ({ ...p, [name]: value }))
    if (touched[name]) setErrors(p => ({ ...p, [name]: validateField(name, value) }))
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setTouched(p => ({ ...p, [name]: true }))
    setErrors(p => ({ ...p, [name]: validateField(name, value) }))
  }

  const validateAll = () => {
    const fields = ['name', 'email', 'phone']
    const newErrors: Partial<GuestForm> = {}
    fields.forEach(f => { const e = validateField(f, (form as any)[f]); if (e) newErrors[f as keyof GuestForm] = e })
    setErrors(newErrors)
    setTouched(Object.fromEntries(fields.map(f => [f, true])))
    return Object.keys(newErrors).length === 0
  }

  const openAdd = () => { setForm(emptyForm); setErrors({}); setTouched({}); setSelected(null); setModal('add') }
  const openEdit = (g: Guest) => {
    setForm({ name: g.name, email: g.email, phone: g.phone })
    setErrors({}); setTouched({}); setSelected(g); setModal('edit')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateAll()) return
    setSaving(true)
    try {
      if (modal === 'add') await api.post('/api/guests', form)
      else await api.put(`/api/guests/${selected!.id}`, form)
      setModal(null); load()
    } catch (err: any) {
      alert(err.response?.data?.message || 'Something went wrong')
    } finally { setSaving(false) }
  }

  const handleDelete = async (id: number) => {
    try { await api.delete(`/api/guests/${id}`); setDeleteId(null); load() }
    catch (err: any) { alert(err.response?.data?.message || 'Could not delete guest') }
  }

  const filtered = guests.filter(g =>
    !search || g.name.toLowerCase().includes(search.toLowerCase()) ||
    g.email.toLowerCase().includes(search.toLowerCase()) ||
    g.phone.includes(search)
  )

  const FieldError = ({ field }: { field: keyof GuestForm }) =>
    errors[field] && touched[field] ? <p style={{ color: '#f87171', fontSize: '0.78rem', marginTop: '0.3rem' }}>{errors[field]}</p> : null

  const initials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  return (
    <div>
      <div className="animate-fade-in" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '2rem', marginBottom: '0.25rem' }}>Guests</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{guests.length} registered guests</p>
        </div>
        <button onClick={openAdd} className="btn-gold">+ Add Guest</button>
      </div>

      <div className="animate-fade-in-up delay-100" style={{ marginBottom: '1.5rem' }}>
        <input
          type="text" placeholder="Search by name, email or phone..." value={search}
          onChange={e => setSearch(e.target.value)}
          className="luxury-input" style={{ maxWidth: '340px' }}
        />
      </div>

      <div className="animate-fade-in-up delay-200 luxury-card" style={{ overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '2rem' }}>
            {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: '60px', marginBottom: '0.5rem', borderRadius: '8px' }} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-dim)' }}>
            <p style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>◉</p>
            <p style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.1rem', marginBottom: '0.5rem' }}>No guests found</p>
            <p style={{ fontSize: '0.875rem' }}>Add a guest to get started</p>
          </div>
        ) : (
          <table className="luxury-table">
            <thead>
              <tr>
                <th>Guest</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Member Since</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(guest => (
                <tr key={guest.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                      <div style={{
                        width: '36px', height: '36px', borderRadius: '50%',
                        background: 'linear-gradient(135deg, #162238, #1e3050)',
                        border: '1px solid rgba(201,151,58,0.2)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.75rem', fontWeight: 600, color: 'var(--gold)',
                        flexShrink: 0,
                      }}>
                        {initials(guest.name)}
                      </div>
                      <span style={{ fontWeight: 500 }}>{guest.name}</span>
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-muted)' }}>{guest.email}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{guest.phone}</td>
                  <td style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>{new Date(guest.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      <button onClick={() => openEdit(guest)} className="btn-ghost" style={{ fontSize: '0.78rem', padding: '0.4rem 0.875rem' }}>Edit</button>
                      <button
                        onClick={() => setDeleteId(guest.id)}
                        style={{ background: 'rgba(192,57,43,0.1)', border: '1px solid rgba(192,57,43,0.25)', color: '#f87171', borderRadius: '6px', padding: '0.4rem 0.875rem', fontSize: '0.78rem', cursor: 'pointer' }}
                      >Delete</button>
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
              {modal === 'add' ? 'Add New Guest' : `Edit ${selected?.name}`}
            </h2>
            <div className="gold-divider" />
            <form onSubmit={handleSubmit} noValidate>
              {[
                { name: 'name', label: 'Full Name', placeholder: 'Jane Smith', type: 'text' },
                { name: 'email', label: 'Email Address', placeholder: 'jane@example.com', type: 'email' },
                { name: 'phone', label: 'Phone Number', placeholder: '+1 234 567 8900', type: 'tel' },
              ].map(field => (
                <div key={field.name} style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {field.label}
                  </label>
                  <input
                    type={field.type} name={field.name}
                    value={(form as any)[field.name]}
                    onChange={handleChange} onBlur={handleBlur}
                    placeholder={field.placeholder}
                    className={`luxury-input ${errors[field.name as keyof GuestForm] && touched[field.name] ? 'error' : ''}`}
                  />
                  <FieldError field={field.name as keyof GuestForm} />
                </div>
              ))}
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setModal(null)} className="btn-ghost">Cancel</button>
                <button type="submit" disabled={saving} className="btn-gold">
                  {saving ? 'Saving...' : modal === 'add' ? 'Add Guest' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteId && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setDeleteId(null) }}>
          <div className="modal-content" style={{ maxWidth: '380px', textAlign: 'center' }}>
            <p style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>⚠</p>
            <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.3rem', marginBottom: '0.5rem' }}>Delete Guest?</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '2rem' }}>
              This will permanently remove the guest and may affect related bookings.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button onClick={() => setDeleteId(null)} className="btn-ghost">Cancel</button>
              <button onClick={() => handleDelete(deleteId)} style={{ background: 'rgba(192,57,43,0.8)', border: 'none', color: '#fff', borderRadius: '8px', padding: '0.75rem 1.5rem', cursor: 'pointer', fontWeight: 600 }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}