'use client'
import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import api from '@/lib/api'

const roomTypeLabels: Record<string, string> = {
  standard: 'Classic Room', deluxe: 'Deluxe Room', suite: 'Junior Suite', presidential: 'Presidential Suite'
}

const roomFeatures: Record<string, string[]> = {
  standard: ['Queen Bed', 'City View', 'Free WiFi', 'Air Conditioning', 'Mini Fridge', 'Smart TV'],
  deluxe: ['King Bed', 'Garden View', 'Free WiFi', 'Air Conditioning', 'Mini Bar', 'Smart TV', 'Bathrobe & Slippers'],
  suite: ['King Bed', 'Panoramic View', 'Free WiFi', 'Living Area', 'Mini Bar', 'Jacuzzi', 'Butler Service', 'Dining Area'],
  presidential: ['King Bed', 'Penthouse View', 'Free WiFi', 'Private Lounge', 'Full Bar', 'Private Terrace', 'Butler Service', 'Private Dining', 'Chauffeur Service'],
}

export default function RoomDetailPage() {
  const { id } = useParams()
  const searchParams = useSearchParams()
  const [room, setRoom] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [checkIn, setCheckIn] = useState(searchParams.get('checkIn') || '')
  const [checkOut, setCheckOut] = useState(searchParams.get('checkOut') || '')

  useEffect(() => {
    api.get(`/api/rooms/${id}`)
      .then(r => setRoom(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [id])

  const nights = checkIn && checkOut
    ? Math.max(0, Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000))
    : 0

  const totalPrice = room ? nights * room.price : 0

  const bookUrl = () => {
    const params = new URLSearchParams({ roomId: String(id) })
    if (checkIn) params.set('checkIn', checkIn)
    if (checkOut) params.set('checkOut', checkOut)
    return `/book?${params.toString()}`
  }

  if (loading) return (
    <div style={{ padding: '8rem', textAlign: 'center', fontFamily: 'Jost, sans-serif', color: 'var(--pub-muted)' }}>
      <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.5rem' }}>Loading...</p>
    </div>
  )

  if (!room) return (
    <div style={{ padding: '8rem', textAlign: 'center' }}>
      <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2rem', marginBottom: '1rem' }}>Room not found</h2>
      <Link href="/rooms" className="pub-btn">Back to Rooms</Link>
    </div>
  )

  const features = roomFeatures[room.type] || roomFeatures.standard

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '4rem 2rem' }}>
      {/* Breadcrumb */}
      <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Link href="/rooms" style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.8rem', color: 'var(--pub-muted)', textDecoration: 'none' }}>
          Rooms & Suites
        </Link>
        <span style={{ color: 'var(--pub-dim)' }}>›</span>
        <span style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.8rem', color: 'var(--pub-gold)' }}>
          {roomTypeLabels[room.type] || room.type}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '3rem', alignItems: 'start' }}>
        {/* Left */}
        <div>
          {/* Hero image */}
          <div style={{
            height: '420px',
            background: 'linear-gradient(135deg, #e8dcc8, #d4c4a0, #c8b888)',
            borderRadius: '4px',
            border: '1px solid var(--pub-border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: '2rem', position: 'relative', overflow: 'hidden',
          }}>
            <span style={{ fontSize: '6rem', opacity: 0.15 }}>⊡</span>
            <div style={{ position: 'absolute', top: '1.25rem', left: '1.25rem' }}>
              <span className="pub-badge pub-badge-available">{room.status}</span>
            </div>
          </div>

          {/* Thumbnail strip */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', marginBottom: '3rem' }}>
            {[1,2,3,4].map(i => (
              <div key={i} style={{
                height: '80px',
                background: `linear-gradient(135deg, #${['e8dcc8','d4c4a0','c8b888','b8a870'][i-1]}, #d4c4a0)`,
                borderRadius: '3px', border: '1px solid var(--pub-border)',
                cursor: 'pointer', opacity: i === 1 ? 1 : 0.6,
                transition: 'opacity 0.2s',
              }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = '1'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = i === 1 ? '1' : '0.6'}
              />
            ))}
          </div>

          {/* Info */}
          <div style={{ marginBottom: '2.5rem' }}>
            <span style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--pub-gold)', display: 'block', marginBottom: '0.5rem' }}>
              {room.type} · Room {room.number}
            </span>
            <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 400, color: 'var(--pub-charcoal)', marginBottom: '0.75rem', lineHeight: 1.1 }}>
              {roomTypeLabels[room.type] || room.type}
            </h1>
            <p style={{ fontFamily: 'Jost, sans-serif', color: 'var(--pub-muted)', fontSize: '0.875rem', lineHeight: 1.8 }}>
              Floor {room.floor} · Up to {room.capacity} guests
            </p>
          </div>

          <div className="pub-divider" />

          {/* Description */}
          <div style={{ marginBottom: '2.5rem' }}>
            <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.5rem', fontWeight: 400, marginBottom: '1rem', color: 'var(--pub-charcoal)' }}>About This Room</h3>
            <p style={{ fontFamily: 'Jost, sans-serif', color: 'var(--pub-muted)', lineHeight: 1.9, fontSize: '0.9rem' }}>
              {room.type === 'presidential'
                ? 'The pinnacle of luxury at Aurum, the Presidential Suite is an unrivalled sanctuary of space, style and personalised service. Occupying a full floor, it features a private terrace with panoramic views, a formal dining room, and a dedicated butler on call around the clock.'
                : room.type === 'suite'
                ? 'Our Junior Suite blends the warmth of a private residence with the indulgence of a five-star hotel. A generous living area flows into a sumptuous sleeping space, while the marble bathroom with Jacuzzi invites long, restorative soaks.'
                : room.type === 'deluxe'
                ? 'The Deluxe Room is a sanctuary of considered luxury — from the hand-picked artworks to the bespoke furnishings sourced from local artisans. A king-size bed dressed in 600-thread-count Egyptian cotton ensures the deepest of slumbers.'
                : 'Our Classic Room is a study in refined simplicity. Every element — the bedding, the lighting, the carefully curated amenities — is chosen to create an atmosphere of quiet, restorative calm in the heart of the city.'
              }
            </p>
          </div>

          {/* Features */}
          <div>
            <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.5rem', fontWeight: 400, marginBottom: '1.5rem', color: 'var(--pub-charcoal)' }}>Room Features</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
              {features.map(f => (
                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ color: 'var(--pub-gold)', fontSize: '0.7rem' }}>✦</span>
                  <span style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.875rem', color: 'var(--pub-muted)' }}>{f}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right — booking card */}
        <div style={{ position: 'sticky', top: '100px' }}>
          <div style={{
            background: '#fff', border: '1px solid var(--pub-border)',
            borderRadius: '4px', padding: '2rem',
            boxShadow: '0 8px 32px var(--pub-shadow-md)',
          }}>
            <div style={{ marginBottom: '1.5rem' }}>
              <p className="pub-price" style={{ fontSize: '2.5rem' }}>
                <sup>$</sup>{room.price.toLocaleString()}
                <span style={{ fontSize: '0.85rem', color: 'var(--pub-muted)' }}>/ night</span>
              </p>
            </div>

            <div className="pub-divider" />

            <div style={{ marginBottom: '1.25rem' }}>
              <label className="pub-label">Check In</label>
              <input type="date" value={checkIn} onChange={e => setCheckIn(e.target.value)}
                min={new Date().toISOString().slice(0,10)} className="pub-input" />
            </div>
            <div style={{ marginBottom: '1.25rem' }}>
              <label className="pub-label">Check Out</label>
              <input type="date" value={checkOut} onChange={e => setCheckOut(e.target.value)}
                min={checkIn || new Date().toISOString().slice(0,10)} className="pub-input" />
            </div>

            {nights > 0 && (
              <div style={{
                background: 'rgba(184,134,58,0.07)',
                border: '1px solid var(--pub-border)',
                borderRadius: '3px', padding: '1.125rem',
                marginBottom: '1.25rem',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.85rem', color: 'var(--pub-muted)' }}>
                    ${room.price} × {nights} night{nights !== 1 ? 's' : ''}
                  </span>
                  <span style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.85rem', color: 'var(--pub-ink)' }}>
                    ${(room.price * nights).toLocaleString()}
                  </span>
                </div>
                <div style={{ height: '1px', background: 'var(--pub-border)', margin: '0.75rem 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.9rem', fontWeight: 600, color: 'var(--pub-charcoal)' }}>Total</span>
                  <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.25rem', color: 'var(--pub-gold-dark)', fontWeight: 500 }}>
                    ${totalPrice.toLocaleString()}
                  </span>
                </div>
              </div>
            )}

            {room.status === 'available' ? (
              <Link href={bookUrl()} className="pub-btn-gold" style={{ display: 'block', textAlign: 'center', marginBottom: '0.875rem' }}>
                Reserve This Room
              </Link>
            ) : (
              <div style={{ background: 'rgba(192,57,43,0.08)', border: '1px solid rgba(192,57,43,0.2)', borderRadius: '3px', padding: '0.875rem', textAlign: 'center', marginBottom: '0.875rem' }}>
                <p style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.875rem', color: '#c0392b' }}>Currently Unavailable</p>
              </div>
            )}

            <p style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.75rem', color: 'var(--pub-dim)', textAlign: 'center' }}>
              Free cancellation up to 48 hours before check-in
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}