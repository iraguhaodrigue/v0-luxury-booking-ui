import type { Metadata, Viewport } from 'next'
import './globals.css'
import { NotificationsProvider } from '@/contexts/NotificationsContext'
import { NotificationContainer } from '@/components/ui/notification-container'

export const metadata: Metadata = {
  title: 'KILUVA — Villas, Apartments, Cars & Services in Rwanda',
  description: 'Book villas, apartments, cars and services easily with KILUVA.',
  keywords: ['luxury villas Rwanda', 'apartments', 'car rental', 'premium services', 'KILUVA', 'Rwanda hospitality'],
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
      <body className="font-sans antialiased">
        <NotificationsProvider>
          {children}
          <NotificationContainer />
        </NotificationsProvider>
      </body>
    </html>
  )
}
