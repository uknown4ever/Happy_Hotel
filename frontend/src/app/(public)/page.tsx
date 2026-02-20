'use client'
import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import api from '@/lib/api'

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true) }, { threshold })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [threshold])
  return { ref, inView }
}

function AnimatedSection({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const { ref, inView } = useInView()
  return (
    <div ref={ref} style={{
      opacity: inView ? 1 : 0,
      transform: inView ? 'translateY(0)' : 'translateY(32px)',
      transition: `opacity 0.8s ease ${delay}ms, transform 0.8s ease ${delay}ms`,
    }}>
      {children}
    </div>
  )
}

export default function HomePage() {
  const [rooms, setRooms] = useState<any[]>([])
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [guests, setGuests] = useState('1')
  const router = { push: (url: string) => { window.location.href = url } }

  useEffect(() => {
    api.get('/api/rooms').then(r => setRooms(r.data.slice(0, 3))).catch(() => {})
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (checkIn) params.set('checkIn', checkIn)
    if (checkOut) params.set('checkOut', checkOut)
    if (guests) params.set('guests', guests)
    window.location.href = `/rooms?${params.toString()}`
  }

  const amenities = [
    { icon: '✦', title: 'Concierge 24/7', desc: 'Round-the-clock personal service tailored to your every need.' },
    { icon: '◈', title: 'Fine Dining', desc: 'Award-winning restaurants helmed by world-class chefs.' },
    { icon: '◉', title: 'Spa & Wellness', desc: 'Restorative treatments inspired by ancient rituals and modern science.' },
    { icon: '⬡', title: 'Private Events', desc: 'Exclusive spaces for celebrations, conferences and intimate gatherings.' },
  ]

  const roomTypeLabels: Record<string, string> = {
    standard: 'Classic Room', deluxe: 'Deluxe Room', suite: 'Junior Suite', presidential: 'Presidential Suite'
  }

  return (
    <div>
      {/* ── HERO ── */}
      <section style={{
        minHeight: 'calc(100vh - 72px)',
        display: 'flex', flexDirection: 'column',
        justifyContent: 'center', alignItems: 'center',
        position: 'relative', overflow: 'hidden',
        background: 'linear-gradient(160deg, #f5f0e8 0%, #faf7f2 50%, #f0ebe0 100%)',
        padding: '4rem 2rem',
      }}>
        {/* Background pattern */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `
            radial-gradient(circle at 20% 50%, rgba(184,134,58,0.06) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(184,134,58,0.04) 0%, transparent 40%),
            radial-gradient(circle at 50% 90%, rgba(184,134,58,0.05) 0%, transparent 40%)
          `,
        }} />

        {/* Decorative lines */}
        <div style={{
          position: 'absolute', top: '15%', left: '8%',
          width: '1px', height: '120px',
          background: 'linear-gradient(180deg, transparent, rgba(184,134,58,0.4), transparent)',
        }} />
        <div style={{
          position: 'absolute', bottom: '20%', right: '10%',
          width: '1px', height: '80px',
          background: 'linear-gradient(180deg, transparent, rgba(184,134,58,0.3), transparent)',
        }} />

        {/* Diamond ornament */}
        <div style={{
          opacity: 0, animation: 'pub-fade-in 1s ease 0.2s forwards',
          marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem',
        }}>
          <div style={{ height: '1px', width: '60px', background: 'var(--pub-gold-light)' }} />
          <span style={{ color: 'var(--pub-gold)', fontSize: '0.875rem', letterSpacing: '0.2em', fontFamily: 'Jost, sans-serif', fontWeight: 500, textTransform: 'uppercase' }}>
            Since 1924
          </span>
          <div style={{ height: '1px', width: '60px', background: 'var(--pub-gold-light)' }} />
        </div>

        {/* Main headline */}
        <h1 style={{
          fontFamily: 'Cormorant Garamond, serif',
          fontSize: 'clamp(3rem, 8vw, 7rem)',
          fontWeight: 300,
          lineHeight: 1.05,
          textAlign: 'center',
          color: 'var(--pub-charcoal)',
          maxWidth: '900px',
          marginBottom: '1.75rem',
          opacity: 0, animation: 'pub-fade-up 1s ease 0.3s forwards',
        }}>
          Where Luxury<br />
          <em style={{ fontStyle: 'italic', color: 'var(--pub-gold-dark)' }}>Becomes Home</em>
        </h1>

        <p style={{
          fontFamily: 'Jost, sans-serif',
          fontSize: '1rem', fontWeight: 300,
          color: 'var(--pub-muted)', textAlign: 'center',
          maxWidth: '480px', lineHeight: 1.9,
          marginBottom: '3rem',
          opacity: 0, animation: 'pub-fade-up 1s ease 0.5s forwards',
        }}>
          An intimate sanctuary where every room tells a story and every moment is crafted with unrivalled attention to detail.
        </p>

        {/* CTA buttons */}
        <div style={{
          display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center',
          opacity: 0, animation: 'pub-fade-up 1s ease 0.7s forwards',
          marginBottom: '5rem',
        }}>
          <Link href="/rooms" className="pub-btn-gold" style={{ padding: '1rem 2.5rem' }}>
            Explore Rooms
          </Link>
          <Link href="/rooms" className="pub-btn-outline">
            View Availability
          </Link>
        </div>

        {/* Availability search bar */}
        <div style={{
          width: '100%', maxWidth: '860px',
          background: '#fff',
          borderRadius: '4px',
          boxShadow: '0 8px 48px rgba(44,35,20,0.12)',
          border: '1px solid var(--pub-border)',
          padding: '1.75rem 2rem',
          opacity: 0, animation: 'pub-fade-up 1s ease 0.9s forwards',
        }}>
          <p style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--pub-gold)', marginBottom: '1.25rem' }}>
            Check Availability
          </p>
          <form onSubmit={handleSearch} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '1rem', alignItems: 'end' }}>
            <div>
              <label className="pub-label">Check In</label>
              <input type="date" value={checkIn} onChange={e => setCheckIn(e.target.value)}
                min={new Date().toISOString().slice(0,10)}
                className="pub-input" />
            </div>
            <div>
              <label className="pub-label">Check Out</label>
              <input type="date" value={checkOut} onChange={e => setCheckOut(e.target.value)}
                min={checkIn || new Date().toISOString().slice(0,10)}
                className="pub-input" />
            </div>
            <div>
              <label className="pub-label">Guests</label>
              <select value={guests} onChange={e => setGuests(e.target.value)} className="pub-select">
                {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n} Guest{n > 1 ? 's' : ''}</option>)}
              </select>
            </div>
            <button type="submit" className="pub-btn" style={{ whiteSpace: 'nowrap', height: '46px' }}>
              Search
            </button>
          </form>
        </div>
      </section>

      {/* ── STATS STRIP ── */}
      <section style={{ background: 'var(--pub-charcoal)', padding: '3rem 4rem' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '2rem' }}>
          {[
            { num: '100+', label: 'Rooms & Suites' },
            { num: '4.9★', label: 'Guest Rating' },
            { num: '1924', label: 'Est. Year' },
            { num: '24/7', label: 'Concierge' },
          ].map((s, i) => (
            <AnimatedSection key={s.label} delay={i * 100}>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2.5rem', color: 'var(--pub-gold-light)', fontWeight: 500, lineHeight: 1 }}>
                  {s.num}
                </p>
                <p style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#6b6457', marginTop: '0.5rem' }}>
                  {s.label}
                </p>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </section>

      {/* ── FEATURED ROOMS ── */}
      <section style={{ padding: '7rem 4rem', maxWidth: '1200px', margin: '0 auto' }}>
        <AnimatedSection>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <span className="pub-section-tag">Accommodations</span>
            <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(2rem, 4vw, 3.5rem)', fontWeight: 400, marginBottom: '1rem' }}>
              Rooms & Suites
            </h2>
            <p style={{ fontFamily: 'Jost, sans-serif', color: 'var(--pub-muted)', maxWidth: '480px', margin: '0 auto', lineHeight: 1.8 }}>
              Each room is a private world — designed to indulge the senses and restore the spirit.
            </p>
          </div>
        </AnimatedSection>

        {rooms.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
            {rooms.map((room, i) => (
              <AnimatedSection key={room.id} delay={i * 150}>
                <div className="pub-card" style={{ cursor: 'pointer' }} onClick={() => window.location.href = `/rooms/${room.id}`}>
                  {/* Room image placeholder */}
                  <div style={{
                    height: '240px',
                    background: `linear-gradient(135deg, 
                      ${i === 0 ? '#e8dcc8, #d4c4a0' : i === 1 ? '#d4c4a0, #c8b888' : '#c8b888, #b8a870'}
                    )`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    position: 'relative', overflow: 'hidden',
                  }}>
                    <span style={{ fontSize: '4rem', opacity: 0.3 }}>⊡</span>
                    <div style={{
                      position: 'absolute', top: '1rem', left: '1rem',
                    }}>
                      <span className="pub-badge pub-badge-available">{room.status}</span>
                    </div>
                    <div style={{
                      position: 'absolute', bottom: '1rem', right: '1rem',
                    }}>
                      <span className="pub-badge">{room.type}</span>
                    </div>
                  </div>

                  <div style={{ padding: '1.75rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                      <div>
                        <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.4rem', fontWeight: 500, color: 'var(--pub-charcoal)', marginBottom: '0.2rem' }}>
                          {roomTypeLabels[room.type] || room.type}
                        </h3>
                        <p style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.78rem', color: 'var(--pub-dim)', letterSpacing: '0.05em' }}>
                          Room {room.number} · Floor {room.floor} · Up to {room.capacity} guests
                        </p>
                      </div>
                    </div>

                    <div className="pub-divider" style={{ margin: '1rem 0' }} />

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <p className="pub-price">
                          <sup>$</sup>{room.price.toLocaleString()}
                          <span>/ night</span>
                        </p>
                      </div>
                      <Link
                        href={`/rooms/${room.id}`}
                        className="pub-btn"
                        style={{ padding: '0.625rem 1.5rem', fontSize: '0.75rem' }}
                        onClick={e => e.stopPropagation()}
                      >
                        Book Now
                      </Link>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem', marginBottom: '3rem' }}>
            {[0,1,2].map(i => (
              <div key={i} style={{ height: '420px', background: 'var(--pub-surface)', borderRadius: '4px', border: '1px solid var(--pub-border)', opacity: 0.5 + i * 0.15 }} />
            ))}
          </div>
        )}

        <AnimatedSection>
          <div style={{ textAlign: 'center' }}>
            <Link href="/rooms" className="pub-btn-outline">
              View All Rooms & Suites
            </Link>
          </div>
        </AnimatedSection>
      </section>

      {/* ── AMENITIES ── */}
      <section style={{
        padding: '7rem 4rem',
        background: 'linear-gradient(160deg, #f0ebe0, #faf7f2)',
        borderTop: '1px solid var(--pub-border)',
        borderBottom: '1px solid var(--pub-border)',
      }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <AnimatedSection>
            <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
              <span className="pub-section-tag">The Aurum Experience</span>
              <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(2rem, 4vw, 3.5rem)', fontWeight: 400 }}>
                Every Detail. <em>Perfected.</em>
              </h2>
            </div>
          </AnimatedSection>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '2.5rem' }}>
            {amenities.map((a, i) => (
              <AnimatedSection key={a.title} delay={i * 120}>
                <div style={{
                  padding: '2.5rem 2rem',
                  background: '#fff',
                  border: '1px solid var(--pub-border)',
                  borderRadius: '4px',
                  textAlign: 'center',
                  transition: 'all 0.3s ease',
                }}
                  onMouseEnter={e => {
                    const el = e.currentTarget as HTMLElement
                    el.style.borderColor = 'var(--pub-border-strong)'
                    el.style.boxShadow = '0 8px 32px var(--pub-shadow)'
                    el.style.transform = 'translateY(-4px)'
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget as HTMLElement
                    el.style.borderColor = 'var(--pub-border)'
                    el.style.boxShadow = 'none'
                    el.style.transform = 'translateY(0)'
                  }}
                >
                  <div style={{
                    width: '56px', height: '56px', margin: '0 auto 1.5rem',
                    background: 'linear-gradient(135deg, #f5f0e8, #e8dcc8)',
                    border: '1px solid var(--pub-border)',
                    borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.25rem', color: 'var(--pub-gold)',
                  }}>
                    {a.icon}
                  </div>
                  <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.3rem', fontWeight: 500, marginBottom: '0.75rem', color: 'var(--pub-charcoal)' }}>
                    {a.title}
                  </h3>
                  <p style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.875rem', color: 'var(--pub-muted)', lineHeight: 1.8 }}>
                    {a.desc}
                  </p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BAND ── */}
      <section style={{ padding: '7rem 4rem', textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
        <AnimatedSection>
          <span className="pub-section-tag">Reserve Your Stay</span>
          <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 300, marginBottom: '1.5rem', lineHeight: 1.1 }}>
            Begin Your<br /><em>Aurum Journey</em>
          </h2>
          <p style={{ fontFamily: 'Jost, sans-serif', color: 'var(--pub-muted)', lineHeight: 1.9, marginBottom: '2.5rem', fontSize: '1rem' }}>
            From the moment you arrive until the moment you reluctantly depart, every aspect of your stay is curated for perfection.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/rooms" className="pub-btn-gold">
              Reserve a Room
            </Link>
            <Link href="/guest/register" className="pub-btn-outline">
              Create Account
            </Link>
          </div>
        </AnimatedSection>
      </section>
    </div>
  )
}