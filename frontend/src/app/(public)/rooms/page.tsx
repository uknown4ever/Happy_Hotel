'use client'
import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import api from '@/lib/api'

const roomTypeLabels: Record<string, string> = {
  standard: 'Classic Room', deluxe: 'Deluxe Room', suite: 'Junior Suite', presidential: 'Presidential Suite'
}

function RoomsContent() {
  const searchParams = useSearchParams()
  const [rooms, setRooms] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState('all')
  const [filterCapacity, setFilterCapacity] = useState('any')
  const [sortBy, setSortBy] = useState('price-asc')
  const [checkIn, setCheckIn] = useState(searchParams.get('checkIn') || '')
  const [checkOut, setCheckOut] = useState(searchParams.get('checkOut') || '')
  const [search, setSearch] = useState('')

  useEffect(() => {
    api.get('/api/rooms')
      .then(r => setRooms(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const allTypes = [...new Set(rooms.map(r => r.type))]

  const filtered = rooms
    .filter(r => r.status === 'available')
    .filter(r => filterType === 'all' || r.type === filterType)
    .filter(r => filterCapacity === 'any' || r.capacity >= Number(filterCapacity))
    .filter(r => !search || r.type.includes(search.toLowerCase()) || r.number.includes(search))
    .sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price
      if (sortBy === 'price-desc') return b.price - a.price
      if (sortBy === 'capacity') return b.capacity - a.capacity
      return 0
    })

  const bookUrl = (roomId: number) => {
    const params = new URLSearchParams({ roomId: String(roomId) })
    if (checkIn) params.set('checkIn', checkIn)
    if (checkOut) params.set('checkOut', checkOut)
    return `/book?${params.toString()}`
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '4rem 2rem' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <span style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--pub-gold)', display: 'block', marginBottom: '0.75rem' }}>
          Accommodations
        </span>
        <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 400, marginBottom: '1rem', color: 'var(--pub-charcoal)' }}>
          Rooms & Suites
        </h1>
        <p style={{ fontFamily: 'Jost, sans-serif', color: 'var(--pub-muted)', maxWidth: '460px', margin: '0 auto', lineHeight: 1.8 }}>
          Discover spaces that transcend the ordinary — each one a private sanctuary of refined elegance.
        </p>
      </div>

      {/* Date picker bar */}
      <div style={{
        background: '#fff', border: '1px solid var(--pub-border)',
        borderRadius: '4px', padding: '1.5rem 2rem', marginBottom: '2.5rem',
        boxShadow: '0 2px 16px var(--pub-shadow)',
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '1rem', alignItems: 'end' }}>
          <div>
            <label className="pub-label">Check In</label>
            <input type="date" value={checkIn} onChange={e => setCheckIn(e.target.value)}
              min={new Date().toISOString().slice(0,10)} className="pub-input" />
          </div>
          <div>
            <label className="pub-label">Check Out</label>
            <input type="date" value={checkOut} onChange={e => setCheckOut(e.target.value)}
              min={checkIn || new Date().toISOString().slice(0,10)} className="pub-input" />
          </div>
          <button
            className="pub-btn"
            style={{ height: '46px' }}
            onClick={() => {}}
          >
            Update
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: '2.5rem', alignItems: 'start' }}>
        {/* Sidebar filters */}
        <div style={{ position: 'sticky', top: '100px' }}>
          <div style={{ background: '#fff', border: '1px solid var(--pub-border)', borderRadius: '4px', padding: '1.75rem', marginBottom: '1.25rem' }}>
            <p style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--pub-gold)', marginBottom: '1.25rem' }}>
              Room Type
            </p>
            {['all', ...allTypes].map(t => (
              <button key={t} onClick={() => setFilterType(t)} style={{
                display: 'block', width: '100%', textAlign: 'left',
                padding: '0.6rem 0.875rem', borderRadius: '2px', border: 'none',
                background: filterType === t ? 'rgba(184,134,58,0.1)' : 'transparent',
                color: filterType === t ? 'var(--pub-gold-dark)' : 'var(--pub-muted)',
                fontFamily: 'Jost, sans-serif', fontSize: '0.875rem',
                cursor: 'pointer', transition: 'all 0.2s',
                fontWeight: filterType === t ? 500 : 400,
                marginBottom: '0.25rem',
                textTransform: 'capitalize',
              }}>
                {t === 'all' ? 'All Types' : roomTypeLabels[t] || t}
                <span style={{ float: 'right', fontSize: '0.75rem', opacity: 0.6 }}>
                  ({t === 'all' ? rooms.filter(r => r.status === 'available').length : rooms.filter(r => r.type === t && r.status === 'available').length})
                </span>
              </button>
            ))}
          </div>

          <div style={{ background: '#fff', border: '1px solid var(--pub-border)', borderRadius: '4px', padding: '1.75rem', marginBottom: '1.25rem' }}>
            <p style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--pub-gold)', marginBottom: '1.25rem' }}>
              Guests
            </p>
            {['any', '1', '2', '3', '4'].map(c => (
              <button key={c} onClick={() => setFilterCapacity(c)} style={{
                display: 'block', width: '100%', textAlign: 'left',
                padding: '0.6rem 0.875rem', borderRadius: '2px', border: 'none',
                background: filterCapacity === c ? 'rgba(184,134,58,0.1)' : 'transparent',
                color: filterCapacity === c ? 'var(--pub-gold-dark)' : 'var(--pub-muted)',
                fontFamily: 'Jost, sans-serif', fontSize: '0.875rem',
                cursor: 'pointer', transition: 'all 0.2s',
                fontWeight: filterCapacity === c ? 500 : 400,
                marginBottom: '0.25rem',
              }}>
                {c === 'any' ? 'Any' : `${c}+ guests`}
              </button>
            ))}
          </div>

          <div style={{ background: '#fff', border: '1px solid var(--pub-border)', borderRadius: '4px', padding: '1.75rem' }}>
            <p style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--pub-gold)', marginBottom: '1.25rem' }}>
              Sort By
            </p>
            {[
              { val: 'price-asc', label: 'Price: Low to High' },
              { val: 'price-desc', label: 'Price: High to Low' },
              { val: 'capacity', label: 'Most Capacity' },
            ].map(s => (
              <button key={s.val} onClick={() => setSortBy(s.val)} style={{
                display: 'block', width: '100%', textAlign: 'left',
                padding: '0.6rem 0.875rem', borderRadius: '2px', border: 'none',
                background: sortBy === s.val ? 'rgba(184,134,58,0.1)' : 'transparent',
                color: sortBy === s.val ? 'var(--pub-gold-dark)' : 'var(--pub-muted)',
                fontFamily: 'Jost, sans-serif', fontSize: '0.875rem',
                cursor: 'pointer', transition: 'all 0.2s',
                fontWeight: sortBy === s.val ? 500 : 400,
                marginBottom: '0.25rem',
              }}>
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Room grid */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <p style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.875rem', color: 'var(--pub-muted)' }}>
              <strong style={{ color: 'var(--pub-ink)' }}>{filtered.length}</strong> room{filtered.length !== 1 ? 's' : ''} available
            </p>
            <input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)}
              className="pub-input" style={{ maxWidth: '200px' }} />
          </div>

          {loading ? (
            <div style={{ display: 'grid', gap: '1.5rem' }}>
              {[1,2,3].map(i => (
                <div key={i} style={{ height: '200px', background: 'var(--pub-surface)', borderRadius: '4px', border: '1px solid var(--pub-border)', opacity: 0.6 }} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '5rem 2rem', color: 'var(--pub-muted)' }}>
              <p style={{ fontSize: '3rem', marginBottom: '1rem' }}>⊡</p>
              <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.5rem', marginBottom: '0.5rem' }}>No rooms match your filters</h3>
              <p style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.875rem' }}>Try adjusting your criteria</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '1.5rem' }}>
              {filtered.map(room => (
                <div key={room.id} className="pub-card" style={{
                  display: 'grid', gridTemplateColumns: '280px 1fr',
                  cursor: 'pointer',
                }} onClick={() => window.location.href = `/rooms/${room.id}`}>
                  {/* Image */}
                  <div style={{
                    background: `linear-gradient(135deg, #e8dcc8, #d4c4a0)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    minHeight: '200px',
                  }}>
                    <span style={{ fontSize: '3rem', opacity: 0.3 }}>⊡</span>
                  </div>

                  {/* Info */}
                  <div style={{ padding: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                      <div>
                        <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.5rem', fontWeight: 500, color: 'var(--pub-charcoal)', marginBottom: '0.25rem' }}>
                          {roomTypeLabels[room.type] || room.type}
                        </h3>
                        <p style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.78rem', color: 'var(--pub-dim)', letterSpacing: '0.04em' }}>
                          Room {room.number} · Floor {room.floor} · Up to {room.capacity} guests
                        </p>
                      </div>
                      <span className="pub-badge pub-badge-available">{room.status}</span>
                    </div>

                    <div className="pub-divider" />

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.25rem' }}>
                      {['King Bed', 'City View', 'Free WiFi', 'Mini Bar'].map(f => (
                        <span key={f} style={{
                          fontFamily: 'Jost, sans-serif', fontSize: '0.72rem',
                          padding: '0.2rem 0.75rem',
                          border: '1px solid var(--pub-border)',
                          borderRadius: '999px', color: 'var(--pub-muted)',
                        }}>{f}</span>
                      ))}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <p className="pub-price">
                          <sup>$</sup>{room.price.toLocaleString()}
                          <span>/ night</span>
                        </p>
                        {checkIn && checkOut && (
                          <p style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.75rem', color: 'var(--pub-muted)', marginTop: '0.25rem' }}>
                            {Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000)} nights = ${(room.price * Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000)).toLocaleString()}
                          </p>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <Link href={`/rooms/${room.id}`} className="pub-btn-outline" style={{ padding: '0.625rem 1.25rem', fontSize: '0.75rem' }} onClick={e => e.stopPropagation()}>
                          Details
                        </Link>
                        <Link href={bookUrl(room.id)} className="pub-btn-gold" style={{ padding: '0.625rem 1.5rem', fontSize: '0.75rem' }} onClick={e => e.stopPropagation()}>
                          Book Now
                        </Link>
                      </div>
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

export default function RoomsPage() {
  return (
    <Suspense fallback={<div style={{ padding: '4rem', textAlign: 'center', fontFamily: 'Jost, sans-serif', color: 'var(--pub-muted)' }}>Loading rooms...</div>}>
      <RoomsContent />
    </Suspense>
  )
}