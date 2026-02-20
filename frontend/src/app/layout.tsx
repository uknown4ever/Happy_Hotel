import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Aurum — Hotel Management',
  description: 'Luxury Hotel Management System',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="page-bg noise">{children}</body>
    </html>
  )
}