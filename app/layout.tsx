import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Rwanda Luxury | Premium Villas & Hospitality',
  description: 'Experience luxury living in Rwanda. Book exquisite villas, hotel rooms, and premium services in Kigali, Rubavu, Musanze, and Huye.',
  keywords: ['luxury villas Rwanda', 'hotel rooms', 'Rwanda hospitality', 'Kigali villas', 'premium accommodations'],
  authors: [{ name: 'Rwanda Luxury Hospitality' }],
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
