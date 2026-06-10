'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Navbar } from '@/components/layouts/navbar'
import { Footer } from '@/components/layouts/footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle2, Loader2, AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import Link from 'next/link'

export default function ConfirmationPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [booking, setBooking] = useState<any>(null)
  const [error, setError] = useState('')

  const bookingId = searchParams.get('booking')

  useEffect(() => {
    const fetchBooking = async () => {
      if (!bookingId) {
        setError('No booking ID provided')
        setLoading(false)
        return
      }

      try {
        const response = await fetch(`/api/bookings/${bookingId}`)
        if (!response.ok) throw new Error('Booking not found')
        
        const data = await response.json()
        setBooking(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load booking')
      } finally {
        setLoading(false)
      }
    }

    fetchBooking()
  }, [bookingId])

  if (loading) {
    return (
      <main className="w-full min-h-screen flex flex-col">
        <Navbar />
        <section className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </section>
        <Footer />
      </main>
    )
  }

  if (error || !booking) {
    return (
      <main className="w-full min-h-screen flex flex-col">
        <Navbar />
        <section className="flex-1 py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error || 'Booking not found'}</AlertDescription>
            </Alert>
            <Button onClick={() => router.push('/')} className="mt-6">
              Return Home
            </Button>
          </div>
        </section>
        <Footer />
      </main>
    )
  }

  return (
    <main className="w-full min-h-screen flex flex-col">
      <Navbar />
      <section className="flex-1 py-12 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h1 className="text-4xl font-serif font-bold text-foreground mb-2">
              Booking Confirmed!
            </h1>
            <p className="text-muted-foreground text-lg">
              Thank you for your booking. A confirmation email has been sent to {booking.guestEmail}
            </p>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Booking Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground">Booking ID</p>
                  <p className="text-lg font-semibold text-foreground">{booking.id}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <p className="text-lg font-semibold capitalize text-accent">{booking.status}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Check-in</p>
                  <p className="text-lg font-semibold text-foreground">
                    {new Date(booking.checkInDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Check-out</p>
                  <p className="text-lg font-semibold text-foreground">
                    {new Date(booking.checkOutDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Guest Name</p>
                  <p className="text-lg font-semibold text-foreground">{booking.guestName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Number of Guests</p>
                  <p className="text-lg font-semibold text-foreground">{booking.numberOfGuests}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <h3 className="font-semibold text-blue-900 mb-2">What Happens Next?</h3>
            <ol className="space-y-2 text-blue-800 text-sm">
              <li>1. The property owner will review your booking request</li>
              <li>2. You'll receive a confirmation email once they approve</li>
              <li>3. Payment details will be sent before your check-in date</li>
              <li>4. Keep your booking ID ({booking.id}) for reference</li>
            </ol>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/dashboard" className="flex-1">
              <Button className="w-full">View My Bookings</Button>
            </Link>
            <Link href="/" className="flex-1">
              <Button variant="outline" className="w-full">
                Continue Browsing
              </Button>
            </Link>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  )
}
