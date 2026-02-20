'use client'
import { useEffect, useState } from 'react'
import api from '@/lib/api'
import { validateRequired, validatePositiveNumber } from '@/lib/auth'

interface Room {
  id: number; number: string; type: string; floor: number
  price: number; capacity: number; status: string; createdAt: string
}

interface RoomForm {
  number: string; type: string; floor: string; price: string; capacity: string; status: string
}

const emptyForm: RoomForm = { number: '', type: 'standard', floor: '', price: '', capacity: '', status: 'available' }

const roomTypes = ['standard', 'deluxe', 'suite', 'presidential']
const statusOptions = ['available', 'occupied', 'maintenance']

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<'add' | 'edit' | null>(null)
  const [selected, setSelected] = useState<Room | null>(null)
  const [form, setForm] = useState<RoomForm>(emptyForm)
  const [errors, setErrors] = useState<Partial<RoomForm>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [filterStatus, setFilterStatus] = useState('all')
  const [search, setSearch] = useState('')

  const load = async () => {
    try {
      const res = await api.get('/api/rooms')
      setRooms(res.data)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const validateField = (name: string, value: string) => {
    switch (name) {
      case 'number': return validateRequired(value, 'Room number')
      case 'type': return validateRequired(value, 'Room type')
      case 'floor': return validatePositiveNumber(value, 'Floor')
      case 'price': return validatePositiveNumber(value, 'Price')
      case 'capacity': return validatePositiveNumber(value, 'Capacity')
      default: return ''
    }
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
    const fields = ['number', 'type', 'floor', 'price', 'capacity']
    const newErrors: Partial<RoomForm> = {}
    fields.forEach(f => { const e = validateField(f, (form as any)[f]); if (e) newErrors[f as keyof RoomForm] = e })
    setErrors(newErrors)
    setTouched(Object.fromEntries(fields.map(f => [f, true])))
    return Object.keys(newErrors).length === 0
  }

  const openAdd = () => { setForm(emptyForm); setErrors({}); setTouched({}); setSelected(null); setModal('add') }
  const openEdit = (room: Room) => {
    setForm({ number: room.number, type: room.type, floor: String(room.floor), price: String(room.price), capacity: String(room.capacity), status: room.status })
    setErrors({}); setTouched({}); setSelected(room); setModal('edit')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateAll()) return
    setSaving(true)
    try {
      const data = { ...form, floor: Number(form.floor), price: Number(form.price), capacity: Number(form.capacity) }
      if (modal === 'add') await api.post('/api/rooms', data)
      else await api.put(`/api/rooms/${selected!.id}`, data)
      setModal(null)
      load()
    } catch (err: any) {
      alert(err.response?.data?.message || 'Something went wrong')
    } finally { setSaving(false) }
  }

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/api/rooms/${id}`)
      setDeleteId(null)
      load()
    } catch (err: any) {
      alert(err.response?.data?.message || 'Could not delete room')
    }
  }

  const filtered = rooms.filter(r => {
    const matchStatus = filterStatus === 'all' || r.status === filterStatus
    const matchSearch = !search || r.number.toLowerCase().includes(search.toLowerCase()) || r.type.toLowerCase().includes(search.toLowerCase())
    return matchStatus && matchSearch
  })

  const FieldError = ({ field }: { field: keyof RoomForm }) =>
    errors[field] && touched[field] ? <p style={{ color: '#f87171', fontSize: '0.78rem', marginTop: '0.3rem' }}>{errors[field]}</p> : null

  return (
    <div>
      {/* Header */}
      <div className="animate-fade-in" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '2rem', marginBottom: '0.25rem' }}>Rooms</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{rooms.length} rooms total</p>
        </div>
        <button onClick={openAdd} className="btn-gold">+ Add Room</button>
      </div>

      {/* Filters */}
      <div className="animate-fade-in-up delay-100" style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <input
          type="text" placeholder="Search rooms..." value={search}
          onChange={e => setSearch(e.target.value)}
          className="luxury-input" style={{ maxWidth: '240px' }}
        />
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="luxury-select" style={{ maxWidth: '180px' }}>
          <option value="all">All Status</option>
          {statusOptions.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>
      </div>

      {/* Status summary */}
      <div className="animate-fade-in-up delay-200" style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        {statusOptions.map(s => (
          <div key={s} style={{
            padding: '0.75rem 1.25rem', borderRadius: '8px',
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', gap: '0.5rem',
          }}>
            <span className={`badge badge-${s}`} style={{ fontSize: '0.65rem' }}>{s}</span>
            <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
              {rooms.filter(r => r.status === s).length}
            </span>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="animate-fade-in-up delay-300 luxury-card" style={{ overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '2rem' }}>
            {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: '52px', marginBottom: '0.5rem', borderRadius: '6px' }} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-dim)' }}>
            <p style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>⊡</p>
            <p style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.1rem', marginBottom: '0.5rem' }}>No rooms found</p>
            <p style={{ fontSize: '0.875rem' }}>Add a room or adjust your filters</p>
          </div>
        ) : (
          <table className="luxury-table">
            <thead>
              <tr>
                <th>Room #</th>
                <th>Type</th>
                <th>Floor</th>
                <th>Capacity</th>
                <th>Price / Night</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(room => (
                <tr key={room.id}>
                  <td style={{ fontWeight: 600, fontFamily: 'Playfair Display, serif' }}>{room.number}</td>
                  <td style={{ color: 'var(--text-muted)', textTransform: 'capitalize' }}>{room.type}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{room.floor}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{room.capacity} guests</td>
                  <td style={{ color: 'var(--gold)', fontWeight: 500 }}>${room.price.toLocaleString()}</td>
                  <td><span className={`badge badge-${room.status}`}>{room.status}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      <button onClick={() => openEdit(room)} className="btn-ghost" style={{ fontSize: '0.78rem', padding: '0.4rem 0.875rem' }}>Edit</button>
                      <button
                        onClick={() => setDeleteId(room.id)}
                        style={{ background: 'rgba(192,57,43,0.1)', border: '1px solid rgba(192,57,43,0.25)', color: '#f87171', borderRadius: '6px', padding: '0.4rem 0.875rem', fontSize: '0.78rem', cursor: 'pointer', transition: 'all 0.2s' }}
                      >Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add/Edit Modal */}
      {modal && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setModal(null) }}>
          <div className="modal-content">
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.5rem', marginBottom: '0.5rem' }}>
              {modal === 'add' ? 'Add New Room' : `Edit Room ${selected?.number}`}
            </h2>
            <div className="gold-divider" />
            <form onSubmit={handleSubmit} noValidate>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                {[
                  { name: 'number', label: 'Room Number', placeholder: '101', type: 'text' },
                  { name: 'floor', label: 'Floor', placeholder: '1', type: 'number' },
                  { name: 'price', label: 'Price / Night ($)', placeholder: '250', type: 'number' },
                  { name: 'capacity', label: 'Capacity (guests)', placeholder: '2', type: 'number' },
                ].map(field => (
                  <div key={field.name}>
                    <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {field.label}
                    </label>
                    <input
                      type={field.type} name={field.name}
                      value={(form as any)[field.name]}
                      onChange={handleChange} onBlur={handleBlur}
                      placeholder={field.placeholder}
                      className={`luxury-input ${errors[field.name as keyof RoomForm] && touched[field.name] ? 'error' : ''}`}
                    />
                    <FieldError field={field.name as keyof RoomForm} />
                  </div>
                ))}
                <div>
                  <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Type</label>
                  <select name="type" value={form.type} onChange={handleChange} className="luxury-select">
                    {roomTypes.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</label>
                  <select name="status" value={form.status} onChange={handleChange} className="luxury-select">
                    {statusOptions.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setModal(null)} className="btn-ghost">Cancel</button>
                <button type="submit" disabled={saving} className="btn-gold">
                  {saving ? 'Saving...' : modal === 'add' ? 'Add Room' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteId && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setDeleteId(null) }}>
          <div className="modal-content" style={{ maxWidth: '380px', textAlign: 'center' }}>
            <p style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>⚠</p>
            <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.3rem', marginBottom: '0.5rem' }}>Delete Room?</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '2rem' }}>
              This action cannot be undone. The room and all associated data will be permanently removed.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button onClick={() => setDeleteId(null)} className="btn-ghost">Cancel</button>
              <button
                onClick={() => handleDelete(deleteId)}
                style={{ background: 'rgba(192,57,43,0.8)', border: 'none', color: '#fff', borderRadius: '8px', padding: '0.75rem 1.5rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem' }}
              >Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}