'use client'
import { useEffect, useState } from 'react'
import api from '@/lib/api'
import { getUser } from '@/lib/auth'

interface Stats {
  rooms: { total: number; available: number; occupied: number }
  guests: number
  bookings: { total: number; pending: number; confirmed: number }
  payments: { total: number; revenue: number }
}

function StatCard({ label, value, sub, icon, delay, gold }: {
  label: string; value: string | number; sub?: string; icon: string; delay: string; gold?: boolean
}) {
  const [visible, setVisible] = useState(false)
  useEffect(() => { setTimeout(() => setVisible(true), 100) }, [])

  return (
    <div className={`luxury-card animate-fade-in-up ${delay}`} style={{ padding: '1.75rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
        <div style={{
          width: '44px', height: '44px', borderRadius: '10px',
          background: gold ? 'linear-gradient(135deg, #8a6425, #c9973a)' : 'rgba(201,151,58,0.08)',
          border: gold ? 'none' : '1px solid rgba(201,151,58,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.25rem',
        }}>
          {icon}
        </div>
      </div>
      <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>
        {label}
      </p>
      <p style={{
        fontFamily: 'Playfair Display, serif', fontSize: '2.25rem', fontWeight: 700,
        color: gold ? 'var(--gold)' : 'var(--text-primary)', lineHeight: 1,
        marginBottom: sub ? '0.5rem' : 0,
      }}>
        {value}
      </p>
      {sub && <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{sub}</p>}
    </div>
  )
}

function SkeletonCard() {
  return (
    <div className="luxury-card" style={{ padding: '1.75rem' }}>
      <div className="skeleton" style={{ width: '44px', height: '44px', borderRadius: '10px', marginBottom: '1.25rem' }} />
      <div className="skeleton" style={{ width: '60%', height: '12px', marginBottom: '0.5rem' }} />
      <div className="skeleton" style={{ width: '40%', height: '36px' }} />
    </div>
  )
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [recentBookings, setRecentBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const user = getUser()

  useEffect(() => {
    const load = async () => {
      try {
        const [roomsRes, guestsRes, bookingsRes, paymentsRes] = await Promise.all([
          api.get('/api/rooms'),
          api.get('/api/guests'),
          api.get('/api/bookings'),
          api.get('/api/payments'),
        ])

        const rooms = roomsRes.data
        const guests = guestsRes.data
        const bookings = bookingsRes.data
        const payments = paymentsRes.data

        setStats({
          rooms: {
            total: rooms.length,
            available: rooms.filter((r: any) => r.status === 'available').length,
            occupied: rooms.filter((r: any) => r.status === 'occupied').length,
          },
          guests: guests.length,
          bookings: {
            total: bookings.length,
            pending: bookings.filter((b: any) => b.status === 'pending').length,
            confirmed: bookings.filter((b: any) => b.status === 'confirmed').length,
          },
          payments: {
            total: payments.length,
            revenue: payments.filter((p: any) => p.status === 'paid').reduce((sum: number, p: any) => sum + p.amount, 0),
          },
        })
        setRecentBookings(bookings.slice(0, 5))
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 18) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <div>
      {/* Header */}
      <div className="animate-fade-in" style={{ marginBottom: '2.5rem' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
          {greeting()},
        </p>
        <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '2.25rem', marginBottom: '0.5rem' }}>
          {user?.name || 'Welcome back'} <span className="gold-shimmer">✦</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Here&apos;s your hotel at a glance — {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
        {loading ? (
          [1,2,3,4].map(i => <SkeletonCard key={i} />)
        ) : stats ? (
          <>
            <StatCard label="Total Rooms" value={stats.rooms.total} sub={`${stats.rooms.available} available · ${stats.rooms.occupied} occupied`} icon="⊡" delay="delay-100" />
            <StatCard label="Registered Guests" value={stats.guests} sub="All time" icon="◉" delay="delay-200" />
            <StatCard label="Total Bookings" value={stats.bookings.total} sub={`${stats.bookings.pending} pending · ${stats.bookings.confirmed} confirmed`} icon="◫" delay="delay-300" />
            <StatCard label="Revenue" value={`$${stats.payments.revenue.toLocaleString('en-US', { minimumFractionDigits: 0 })}`} sub={`${stats.payments.total} payments`} icon="◎" delay="delay-400" gold />
          </>
        ) : null}
      </div>

      {/* Occupancy bar */}
      {stats && (
        <div className="animate-fade-in-up delay-300 luxury-card" style={{ padding: '1.75rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.1rem' }}>Room Occupancy</h3>
            <span style={{ color: 'var(--gold)', fontSize: '1.5rem', fontFamily: 'Playfair Display, serif', fontWeight: 700 }}>
              {stats.rooms.total ? Math.round((stats.rooms.occupied / stats.rooms.total) * 100) : 0}%
            </span>
          </div>
          <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: stats.rooms.total ? `${(stats.rooms.occupied / stats.rooms.total) * 100}%` : '0%',
              background: 'linear-gradient(90deg, #8a6425, #c9973a, #e2b96a)',
              borderRadius: '4px',
              transition: 'width 1s ease',
            }} />
          </div>
          <div style={{ display: 'flex', gap: '2rem', marginTop: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--gold)' }} />
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Occupied ({stats.rooms.occupied})</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#4ade9a' }} />
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Available ({stats.rooms.available})</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--text-dim)' }} />
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Other ({stats.rooms.total - stats.rooms.occupied - stats.rooms.available})</span>
            </div>
          </div>
        </div>
      )}

      {/* Recent Bookings */}
      <div className="animate-fade-in-up delay-400 luxury-card" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '1.5rem 1.75rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.1rem' }}>Recent Bookings</h3>
          <a href="/dashboard/bookings" style={{ color: 'var(--gold)', fontSize: '0.8rem', textDecoration: 'none', letterSpacing: '0.05em' }}>
            View all →
          </a>
        </div>
        {loading ? (
          <div style={{ padding: '1.5rem' }}>
            {[1,2,3].map(i => (
              <div key={i} style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                <div className="skeleton" style={{ flex: 1, height: '40px' }} />
              </div>
            ))}
          </div>
        ) : recentBookings.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-dim)' }}>
            <p style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>◫</p>
            <p>No bookings yet</p>
          </div>
        ) : (
          <table className="luxury-table">
            <thead>
              <tr>
                <th>Guest</th>
                <th>Room</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Status</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {recentBookings.map(b => (
                <tr key={b.id}>
                  <td style={{ fontWeight: 500 }}>{b.guest?.name || '—'}</td>
                  <td style={{ color: 'var(--text-muted)' }}>Room {b.room?.number || b.roomId}</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{new Date(b.checkIn).toLocaleDateString()}</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{new Date(b.checkOut).toLocaleDateString()}</td>
                  <td><span className={`badge badge-${b.status}`}>{b.status}</span></td>
                  <td style={{ color: 'var(--gold)', fontWeight: 500 }}>${b.totalPrice?.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}