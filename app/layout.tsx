import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Luxury Stays | Premium Villas & Apartments',
  description: 'Book luxury villas, apartments, and premium car rentals. Experience elegant hospitality with our curated collection of high-end properties.',
  keywords: ['luxury villas', 'apartments', 'car rental', 'hospitality', 'travel'],
  authors: [{ name: 'Luxury Stays' }],
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
