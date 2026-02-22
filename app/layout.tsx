import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'DropCircles | Direct-to-Vault Music Drops',
  description: 'Closed-circuit infrastructure for artists. Zero leaks. Zero algorithms. Direct-to-vault drops.',
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
