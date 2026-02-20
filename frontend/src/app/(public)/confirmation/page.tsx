'use client'
import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { clearPendingBooking } from '@/lib/guestAuth'
import { useEffect } from 'react'

function ConfirmationContent() {
  const searchParams = useSearchParams()
  const bookingId = searchParams.get('bookingId')
  const roomId = searchParams.get('roomId')
  const checkIn = searchParams.get('checkIn')
  const checkOut = searchParams.get('checkOut')
  const total = searchParams.get('total')

  const nights = checkIn && checkOut
    ? Math.max(0, Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000))
    : 0

  useEffect(() => { clearPendingBooking() }, [])

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4rem 2rem' }}>
      <div style={{ width: '100%', maxWidth: '560px', textAlign: 'center' }}>
        {/* Success icon */}
        <div style={{
          width: '80px', height: '80px', margin: '0 auto 2rem',
          background: 'linear-gradient(135deg, #d4c4a0, #b8a870)',
          borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '2rem',
          boxShadow: '0 8px 32px rgba(184,134,58,0.25)',
          animation: 'pub-fade-in 0.5s ease',
        }}>
          ✦
        </div>

        <span style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--pub-gold)', display: 'block', marginBottom: '0.75rem' }}>
          Booking Confirmed
        </span>

        <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 400, color: 'var(--pub-charcoal)', marginBottom: '1rem', lineHeight: 1.1 }}>
          Your Stay is Reserved
        </h1>

        <p style={{ fontFamily: 'Jost, sans-serif', color: 'var(--pub-muted)', lineHeight: 1.8, marginBottom: '2.5rem', fontSize: '0.9rem' }}>
          A confirmation will be sent to your email. We look forward to welcoming you to Aurum.
        </p>

        {/* Booking details card */}
        <div style={{
          background: '#fff', border: '1px solid var(--pub-border)',
          borderRadius: '4px', padding: '2rem',
          boxShadow: '0 4px 24px var(--pub-shadow)',
          marginBottom: '2rem', textAlign: 'left',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.25rem', fontWeight: 400, color: 'var(--pub-charcoal)' }}>
              Booking Summary
            </h3>
            <span style={{
              fontFamily: 'Jost, sans-serif', fontSize: '0.75rem', fontWeight: 600,
              letterSpacing: '0.08em', color: '#2a7d4f',
              background: 'rgba(42,125,79,0.08)', border: '1px solid rgba(42,125,79,0.2)',
              padding: '0.2rem 0.75rem', borderRadius: '999px', textTransform: 'uppercase',
            }}>
              Pending
            </span>
          </div>

          <div className="pub-divider" />

          {[
            { label: 'Booking Reference', value: `#${bookingId}` },
            { label: 'Room', value: `Room ${roomId}` },
            checkIn && { label: 'Check In', value: new Date(checkIn).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) },
            checkOut && { label: 'Check Out', value: new Date(checkOut).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) },
            nights > 0 && { label: 'Duration', value: `${nights} night${nights !== 1 ? 's' : ''}` },
          ].filter(Boolean).map((item: any) => (
            <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '0.625rem 0', borderBottom: '1px solid var(--pub-border)' }}>
              <span style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.8rem', color: 'var(--pub-muted)', fontWeight: 400 }}>{item.label}</span>
              <span style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.85rem', color: 'var(--pub-ink)', fontWeight: 500, textAlign: 'right', maxWidth: '280px' }}>{item.value}</span>
            </div>
          ))}

          {total && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', marginTop: '0.25rem' }}>
              <span style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.9rem', fontWeight: 600, color: 'var(--pub-charcoal)' }}>Total Amount</span>
              <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.5rem', color: 'var(--pub-gold-dark)', fontWeight: 500 }}>
                ${Number(total).toLocaleString()}
              </span>
            </div>
          )}
        </div>

        {/* Info callout */}
        <div style={{
          background: 'rgba(184,134,58,0.05)', border: '1px solid var(--pub-border)',
          borderRadius: '4px', padding: '1.25rem', marginBottom: '2.5rem',
        }}>
          <p style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.82rem', color: 'var(--pub-muted)', lineHeight: 1.7 }}>
            ✦ Check-in from <strong>3:00 PM</strong> · Check-out by <strong>12:00 PM</strong><br />
            ✦ Please bring a valid photo ID and your booking reference<br />
            ✦ Our concierge is available 24/7 at <strong>+1 (555) 000-0000</strong>
          </p>
        </div>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/" className="pub-btn-gold">
            Back to Home
          </Link>
          <Link href="/rooms" className="pub-btn-outline">
            Browse More Rooms
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={null}>
      <ConfirmationContent />
    </Suspense>
  )
}