import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'KILUVA — Discover Villas, Apartments, Cars & Services',
  description: 'Book villas, apartments, cars and services easily with Kiluva.',
  keywords: ['luxury villas Rwanda', 'apartments', 'car rental', 'premium services', 'Kiluva', 'Rwanda hospitality'],
  authors: [{ name: 'KILUVA' }],
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
