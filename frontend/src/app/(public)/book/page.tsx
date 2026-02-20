'use client'
import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import api from '@/lib/api'
import { isGuestAuthenticated, getGuestUser, savePendingBooking } from '@/lib/guestAuth'

function BookingContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const roomId = searchParams.get('roomId')
  const [room, setRoom] = useState<any>(null)
  const [checkIn, setCheckIn] = useState(searchParams.get('checkIn') || '')
  const [checkOut, setCheckOut] = useState(searchParams.get('checkOut') || '')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState('')
  const isAuth = isGuestAuthenticated()
  const guest = getGuestUser()

  useEffect(() => {
    if (!roomId) { router.push('/rooms'); return }
    api.get(`/api/rooms/${roomId}`)
      .then(r => setRoom(r.data))
      .catch(() => router.push('/rooms'))
      .finally(() => setLoading(false))
  }, [roomId, router])

  const nights = checkIn && checkOut
    ? Math.max(0, Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000))
    : 0

  const totalPrice = room ? nights * room.price : 0

  const validate = () => {
    const e: Record<string, string> = {}
    if (!checkIn) e.checkIn = 'Check-in date is required'
    if (!checkOut) e.checkOut = 'Check-out date is required'
    if (checkIn && checkOut && checkOut <= checkIn) e.checkOut = 'Check-out must be after check-in'
    if (nights <= 0) e.checkOut = 'Please select valid dates'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    if (!isAuth) {
      // Save booking intent and redirect to login
      savePendingBooking({ roomId: roomId!, checkIn, checkOut })
      router.push('/guest/login?redirect=/book?' + searchParams.toString())
      return
    }

    setSubmitting(true)
    setServerError('')
    try {
      // First, find or get guest id from email
      const guestsRes = await api.get('/api/guests')
      const guestRecord = guestsRes.data.find((g: any) => g.email === guest.email)

      if (!guestRecord) {
        setServerError('Guest profile not found. Please register again.')
        setSubmitting(false)
        return
      }

      const res = await api.post('/api/bookings', {
        guestId: guestRecord.id,
        roomId: Number(roomId),
        checkIn, checkOut,
        status: 'pending',
        totalPrice,
      })

      router.push(`/confirmation?bookingId=${res.data.id}&roomId=${roomId}&checkIn=${checkIn}&checkOut=${checkOut}&total=${totalPrice}`)
    } catch (err: any) {
      setServerError(err.response?.data?.message || 'Booking failed. Please try again.')
    } finally { setSubmitting(false) }
  }

  if (loading) return (
    <div style={{ padding: '8rem', textAlign: 'center' }}>
      <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.5rem', color: 'var(--pub-muted)' }}>Preparing your booking...</p>
    </div>
  )

  if (!room) return null

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '4rem 2rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '3rem' }}>
        <Link href={`/rooms/${roomId}`} style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.8rem', color: 'var(--pub-muted)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
          ← Back to Room
        </Link>
        <span style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--pub-gold)', display: 'block', marginBottom: '0.5rem' }}>
          Reservation
        </span>
        <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 400, color: 'var(--pub-charcoal)' }}>
          Complete Your Booking
        </h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '3rem', alignItems: 'start' }}>
        {/* Left — form */}
        <div>
          {/* Guest info */}
          {isAuth ? (
            <div style={{ background: '#fff', border: '1px solid var(--pub-border)', borderRadius: '4px', padding: '2rem', marginBottom: '2rem' }}>
              <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.5rem', fontWeight: 400, marginBottom: '0.375rem', color: 'var(--pub-charcoal)' }}>
                Guest Details
              </h2>
              <p style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.8rem', color: 'var(--pub-muted)', marginBottom: '1.5rem' }}>
                Booking as your registered account
              </p>

              <div style={{
                display: 'flex', alignItems: 'center', gap: '1rem',
                padding: '1rem', background: 'rgba(184,134,58,0.06)',
                border: '1px solid var(--pub-border)', borderRadius: '3px',
              }}>
                <div style={{
                  width: '44px', height: '44px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, #d4c4a0, #b8a870)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1rem', fontWeight: 600, color: '#6b5220',
                  flexShrink: 0,
                }}>
                  {guest?.name?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <div>
                  <p style={{ fontFamily: 'Jost, sans-serif', fontWeight: 500, color: 'var(--pub-charcoal)', fontSize: '0.9rem' }}>{guest?.name}</p>
                  <p style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.8rem', color: 'var(--pub-muted)' }}>{guest?.email}</p>
                </div>
                <Link href="/guest/login" style={{ marginLeft: 'auto', fontFamily: 'Jost, sans-serif', fontSize: '0.75rem', color: 'var(--pub-gold-dark)', textDecoration: 'none' }}>
                  Not you?
                </Link>
              </div>
            </div>
          ) : (
            <div style={{ background: '#fff', border: '1px solid var(--pub-border)', borderRadius: '4px', padding: '2rem', marginBottom: '2rem' }}>
              <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.5rem', fontWeight: 400, marginBottom: '0.375rem', color: 'var(--pub-charcoal)' }}>
                Sign In to Continue
              </h2>
              <p style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.875rem', color: 'var(--pub-muted)', marginBottom: '1.5rem', lineHeight: 1.7 }}>
                Please sign in or create an account to complete your reservation. Your booking details will be saved.
              </p>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <Link href={`/guest/login?redirect=/book?${searchParams.toString()}`} className="pub-btn" style={{ padding: '0.75rem 1.5rem' }}>
                  Sign In
                </Link>
                <Link href="/guest/register" className="pub-btn-outline" style={{ padding: '0.75rem 1.5rem' }}>
                  Create Account
                </Link>
              </div>
            </div>
          )}

          {/* Dates */}
          <div style={{ background: '#fff', border: '1px solid var(--pub-border)', borderRadius: '4px', padding: '2rem', marginBottom: '2rem' }}>
            <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.5rem', fontWeight: 400, marginBottom: '1.5rem', color: 'var(--pub-charcoal)' }}>
              Stay Dates
            </h2>

            {serverError && (
              <div style={{ background: 'rgba(192,57,43,0.06)', border: '1px solid rgba(192,57,43,0.2)', borderRadius: '3px', padding: '0.875rem', marginBottom: '1.25rem' }}>
                <p style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.875rem', color: '#c0392b' }}>⚠ {serverError}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.5rem' }}>
                <div>
                  <label className="pub-label">Check In</label>
                  <input type="date" value={checkIn} onChange={e => { setCheckIn(e.target.value); setErrors({}) }}
                    min={new Date().toISOString().slice(0,10)}
                    className={`pub-input ${errors.checkIn ? 'error' : ''}`} />
                  {errors.checkIn && <p style={{ fontFamily: 'Jost, sans-serif', color: '#c0392b', fontSize: '0.78rem', marginTop: '0.3rem' }}>{errors.checkIn}</p>}
                </div>
                <div>
                  <label className="pub-label">Check Out</label>
                  <input type="date" value={checkOut} onChange={e => { setCheckOut(e.target.value); setErrors({}) }}
                    min={checkIn || new Date().toISOString().slice(0,10)}
                    className={`pub-input ${errors.checkOut ? 'error' : ''}`} />
                  {errors.checkOut && <p style={{ fontFamily: 'Jost, sans-serif', color: '#c0392b', fontSize: '0.78rem', marginTop: '0.3rem' }}>{errors.checkOut}</p>}
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting || !isAuth}
                className="pub-btn-gold"
                style={{ width: '100%', textAlign: 'center', padding: '1.125rem', opacity: !isAuth ? 0.5 : 1 }}
              >
                {submitting ? 'Processing...' : !isAuth ? 'Sign In to Book' : nights > 0 ? `Confirm Reservation — $${totalPrice.toLocaleString()}` : 'Confirm Reservation'}
              </button>

              {!isAuth && (
                <p style={{ textAlign: 'center', fontFamily: 'Jost, sans-serif', fontSize: '0.78rem', color: 'var(--pub-dim)', marginTop: '0.75rem' }}>
                  Please sign in above to complete your booking
                </p>
              )}
            </form>
          </div>

          {/* Policies */}
          <div style={{ background: 'rgba(184,134,58,0.04)', border: '1px solid var(--pub-border)', borderRadius: '4px', padding: '1.5rem' }}>
            <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.1rem', fontWeight: 400, marginBottom: '1rem', color: 'var(--pub-charcoal)' }}>
              Booking Policies
            </h3>
            {[
              '✦ Free cancellation up to 48 hours before check-in',
              '✦ Check-in from 3:00 PM, check-out by 12:00 PM',
              '✦ A valid ID will be required at check-in',
              '✦ Payment processed securely upon confirmation',
            ].map(p => (
              <p key={p} style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.82rem', color: 'var(--pub-muted)', marginBottom: '0.5rem', lineHeight: 1.6 }}>{p}</p>
            ))}
          </div>
        </div>

        {/* Right — summary */}
        <div style={{ position: 'sticky', top: '100px' }}>
          <div style={{ background: '#fff', border: '1px solid var(--pub-border)', borderRadius: '4px', overflow: 'hidden', boxShadow: '0 4px 24px var(--pub-shadow)' }}>
            {/* Room thumbnail */}
            <div style={{
              height: '180px', background: 'linear-gradient(135deg, #e8dcc8, #d4c4a0)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ fontSize: '3rem', opacity: 0.2 }}>⊡</span>
            </div>

            <div style={{ padding: '1.75rem' }}>
              <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.3rem', fontWeight: 500, color: 'var(--pub-charcoal)', marginBottom: '0.25rem' }}>
                {room.type?.charAt(0).toUpperCase() + room.type?.slice(1)} Room
              </h3>
              <p style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.78rem', color: 'var(--pub-muted)', marginBottom: '1.25rem' }}>
                Room {room.number} · Floor {room.floor} · {room.capacity} guests max
              </p>

              <div className="pub-divider" />

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.85rem', color: 'var(--pub-muted)' }}>Rate per night</span>
                <span style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.85rem', color: 'var(--pub-ink)' }}>${room.price}</span>
              </div>
              {checkIn && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <span style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.85rem', color: 'var(--pub-muted)' }}>Check In</span>
                  <span style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.85rem', color: 'var(--pub-ink)' }}>{new Date(checkIn).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>
              )}
              {checkOut && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <span style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.85rem', color: 'var(--pub-muted)' }}>Check Out</span>
                  <span style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.85rem', color: 'var(--pub-ink)' }}>{new Date(checkOut).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>
              )}
              {nights > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <span style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.85rem', color: 'var(--pub-muted)' }}>Duration</span>
                  <span style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.85rem', color: 'var(--pub-ink)' }}>{nights} night{nights !== 1 ? 's' : ''}</span>
                </div>
              )}

              <div className="pub-divider" />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.9rem', fontWeight: 600, color: 'var(--pub-charcoal)' }}>Total</span>
                <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.5rem', color: 'var(--pub-gold-dark)', fontWeight: 500 }}>
                  {nights > 0 ? `$${totalPrice.toLocaleString()}` : '—'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function BookPage() {
  return (
    <Suspense fallback={<div style={{ padding: '8rem', textAlign: 'center', fontFamily: 'Jost, sans-serif', color: 'var(--pub-muted)' }}>Loading...</div>}>
      <BookingContent />
    </Suspense>
  )
}