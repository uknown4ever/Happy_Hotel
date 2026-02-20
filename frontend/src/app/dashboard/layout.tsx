'use client'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { isAuthenticated, getUser, clearAuth } from '@/lib/auth'

const navItems = [
  { href: '/dashboard', label: 'Overview', icon: '◈' },
  { href: '/dashboard/rooms', label: 'Rooms', icon: '⊡' },
  { href: '/dashboard/guests', label: 'Guests', icon: '◉' },
  { href: '/dashboard/bookings', label: 'Bookings', icon: '◫' },
  { href: '/dashboard/payments', label: 'Payments', icon: '◎' },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<any>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login')
      return
    }
    setUser(getUser())
  }, [router])

  const handleLogout = () => {
    clearAuth()
    router.push('/login')
  }

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname.startsWith(href)
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 40, backdropFilter: 'blur(4px)' }}
        />
      )}

      {/* Sidebar */}
      <aside style={{
        width: '240px',
        background: 'linear-gradient(180deg, #0d1827 0%, #080f1e 100%)',
        borderRight: '1px solid rgba(201,151,58,0.12)',
        display: 'flex', flexDirection: 'column',
        position: 'fixed', top: 0, left: 0, bottom: 0,
        zIndex: 50,
        transform: sidebarOpen ? 'translateX(0)' : undefined,
        transition: 'transform 0.3s ease',
      }}>
        {/* Logo */}
        <div style={{
          padding: '1.75rem 1.5rem',
          borderBottom: '1px solid rgba(201,151,58,0.1)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '36px', height: '36px',
              background: 'linear-gradient(135deg, #8a6425, #c9973a)',
              borderRadius: '10px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 2px 12px rgba(201,151,58,0.25)',
              flexShrink: 0,
            }}>
              <span style={{ fontSize: '1rem' }}>♦</span>
            </div>
            <div>
              <p className="gold-shimmer" style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.1rem', lineHeight: 1 }}>
                AURUM
              </p>
              <p style={{ fontSize: '0.65rem', color: 'var(--text-dim)', letterSpacing: '0.1em', marginTop: '2px' }}>
                MANAGEMENT
              </p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '1.25rem 0.75rem', overflowY: 'auto' }}>
          <p style={{ fontSize: '0.65rem', letterSpacing: '0.15em', color: 'var(--text-dim)', textTransform: 'uppercase', padding: '0 0.75rem', marginBottom: '0.75rem' }}>
            Navigation
          </p>
          {navItems.map((item, i) => {
            const active = isActive(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.875rem',
                  padding: '0.75rem 0.875rem',
                  borderRadius: '8px',
                  marginBottom: '0.25rem',
                  textDecoration: 'none',
                  transition: 'all 0.2s ease',
                  background: active ? 'rgba(201,151,58,0.1)' : 'transparent',
                  border: active ? '1px solid rgba(201,151,58,0.2)' : '1px solid transparent',
                  color: active ? 'var(--gold)' : 'var(--text-muted)',
                  position: 'relative',
                }}
                className="animate-slide-in-left"
                onMouseEnter={e => {
                  if (!active) {
                    (e.currentTarget as HTMLElement).style.background = 'rgba(201,151,58,0.05)'
                    ;(e.currentTarget as HTMLElement).style.color = 'var(--text-primary)'
                  }
                }}
                onMouseLeave={e => {
                  if (!active) {
                    (e.currentTarget as HTMLElement).style.background = 'transparent'
                    ;(e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'
                  }
                }}
              >
                {active && (
                  <div style={{
                    position: 'absolute', left: 0, top: '20%', bottom: '20%',
                    width: '3px', borderRadius: '0 2px 2px 0',
                    background: 'var(--gold)',
                  }} />
                )}
                <span style={{ fontSize: '1rem', width: '20px', textAlign: 'center' }}>{item.icon}</span>
                <span style={{ fontSize: '0.875rem', fontWeight: active ? 500 : 400 }}>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* User */}
        <div style={{
          padding: '1rem 0.75rem',
          borderTop: '1px solid rgba(201,151,58,0.1)',
        }}>
          {user && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              padding: '0.75rem',
              background: 'rgba(255,255,255,0.02)',
              borderRadius: '8px',
              marginBottom: '0.75rem',
            }}>
              <div style={{
                width: '34px', height: '34px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #8a6425, #c9973a)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.875rem', fontWeight: 600, color: '#080f1e',
                flexShrink: 0,
              }}>
                {user.name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div style={{ overflow: 'hidden', flex: 1 }}>
                <p style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user.name || 'Staff Member'}
                </p>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'capitalize' }}>
                  {user.role || 'staff'}
                </p>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="btn-ghost"
            style={{ width: '100%', fontSize: '0.8rem', padding: '0.6rem' }}
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{
        marginLeft: '240px',
        flex: 1,
        minHeight: '100vh',
        background: 'var(--bg-primary)',
      }}>
        {/* Mobile header */}
        <div style={{
          display: 'none',
          padding: '1rem 1.5rem',
          borderBottom: '1px solid var(--border)',
          background: 'var(--bg-secondary)',
          alignItems: 'center', justifyContent: 'space-between',
        }} className="mobile-header">
          <span className="gold-shimmer" style={{ fontFamily: 'Playfair Display, serif' }}>AURUM</span>
          <button onClick={() => setSidebarOpen(true)} style={{ background: 'none', border: 'none', color: 'var(--text-primary)', fontSize: '1.25rem', cursor: 'pointer' }}>☰</button>
        </div>

        <div style={{ padding: '2.5rem', maxWidth: '1400px' }}>
          {children}
        </div>
      </main>

      <style>{`
        @media (max-width: 768px) {
          aside { transform: translateX(-100%); }
          aside.open { transform: translateX(0); }
          main { margin-left: 0 !important; }
          .mobile-header { display: flex !important; }
        }
      `}</style>
    </div>
  )
}