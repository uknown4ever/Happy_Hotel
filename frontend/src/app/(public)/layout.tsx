'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import '@/app/public.css'
import { isGuestAuthenticated, getGuestUser, clearGuestAuth } from '@/lib/guestAuth'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [guest, setGuest] = useState<any>(null)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (isGuestAuthenticated()) setGuest(getGuestUser())
    else setGuest(null)
  }, [pathname])

  const handleLogout = () => {
    clearGuestAuth()
    setGuest(null)
    router.push('/')
  }

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/rooms', label: 'Rooms' },
  ]

  return (
    <div className="public-site" style={{ minHeight: '100vh' }}>
      {/* Navbar */}
      <nav className={`pub-nav${scrolled ? ' scrolled' : ''}`}>
        {/* Logo */}
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <div style={{
            width: '32px', height: '32px',
            background: 'linear-gradient(135deg, #8a6225, #b8863a)',
            borderRadius: '6px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.875rem',
          }}>♦</div>
          <div>
            <span style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontSize: '1.3rem', fontWeight: 600,
              color: 'var(--pub-charcoal)',
              letterSpacing: '0.1em',
            }}>AURUM</span>
          </div>
        </Link>

        {/* Center links */}
        <div style={{ display: 'flex', gap: '2.5rem', alignItems: 'center' }} className="pub-nav-links">
          {navLinks.map(l => (
            <Link key={l.href} href={l.href} style={{
              fontFamily: 'Jost, sans-serif',
              fontSize: '0.8rem', fontWeight: 500,
              letterSpacing: '0.1em', textTransform: 'uppercase',
              textDecoration: 'none',
              color: pathname === l.href ? 'var(--pub-gold-dark)' : 'var(--pub-muted)',
              transition: 'color 0.2s ease',
              borderBottom: pathname === l.href ? '1px solid var(--pub-gold)' : '1px solid transparent',
              paddingBottom: '2px',
            }}>
              {l.label}
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {guest ? (
            <>
              <span style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.85rem', color: 'var(--pub-muted)' }}>
                Welcome, <strong style={{ color: 'var(--pub-charcoal)' }}>{guest.name?.split(' ')[0]}</strong>
              </span>
              <button onClick={handleLogout} className="pub-btn-outline" style={{ padding: '0.5rem 1.25rem', fontSize: '0.75rem' }}>
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link href="/guest/login" style={{
                fontFamily: 'Jost, sans-serif', fontSize: '0.8rem', fontWeight: 500,
                letterSpacing: '0.08em', color: 'var(--pub-muted)', textDecoration: 'none',
              }}>Sign In</Link>
              <Link href="/guest/register" className="pub-btn" style={{ padding: '0.625rem 1.5rem' }}>
                Register
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Page content */}
      <main style={{ paddingTop: '72px' }}>
        {children}
      </main>

      {/* Footer */}
      <footer style={{
        background: 'var(--pub-charcoal)',
        color: '#d4cdc4',
        padding: '4rem',
        marginTop: '6rem',
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '3rem', marginBottom: '3rem' }}>
            {/* Brand */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1.25rem' }}>
                <div style={{ width: '28px', height: '28px', background: 'linear-gradient(135deg, #8a6225, #b8863a)', borderRadius: '5px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>♦</div>
                <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.25rem', letterSpacing: '0.1em', color: '#f0ece4' }}>AURUM</span>
              </div>
              <p style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.875rem', lineHeight: 1.8, color: '#8a8078', maxWidth: '280px' }}>
                Where timeless elegance meets modern luxury. Every detail crafted for the discerning traveller.
              </p>
            </div>

            {/* Navigation */}
            <div>
              <p style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#b8863a', marginBottom: '1.25rem' }}>
                Explore
              </p>
              {[{ href: '/', l: 'Home' }, { href: '/rooms', l: 'Rooms & Suites' }, { href: '/guest/register', l: 'Create Account' }].map(i => (
                <Link key={i.href} href={i.href} style={{ display: 'block', fontFamily: 'Jost, sans-serif', fontSize: '0.875rem', color: '#8a8078', textDecoration: 'none', marginBottom: '0.625rem', transition: 'color 0.2s' }}
                  onMouseEnter={e => (e.target as HTMLElement).style.color = '#d4a85c'}
                  onMouseLeave={e => (e.target as HTMLElement).style.color = '#8a8078'}
                >{i.l}</Link>
              ))}
            </div>

            {/* Contact */}
            <div>
              <p style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#b8863a', marginBottom: '1.25rem' }}>
                Contact
              </p>
              {['reservations@aurum.com', '+1 (555) 000-0000', '1 Aurum Plaza, Suite 100'].map(t => (
                <p key={t} style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.875rem', color: '#8a8078', marginBottom: '0.5rem' }}>{t}</p>
              ))}
            </div>
          </div>

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.78rem', color: '#5a534a' }}>
              © {new Date().getFullYear()} Aurum Hotel. All rights reserved.
            </p>
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              {['Privacy', 'Terms', 'Cookies'].map(t => (
                <span key={t} style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.78rem', color: '#5a534a', cursor: 'pointer' }}>{t}</span>
              ))}
            </div>
          </div>
        </div>
      </footer>

      <style>{`
        @media (max-width: 768px) {
          .pub-nav { padding: 1rem 1.5rem !important; }
          .pub-nav-links { display: none !important; }
        }
      `}</style>
    </div>
  )
}