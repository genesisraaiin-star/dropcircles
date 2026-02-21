import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AURA | Premium Musician Ecosystem',
  description: 'Secure demo sharing and D2C payout platform.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
