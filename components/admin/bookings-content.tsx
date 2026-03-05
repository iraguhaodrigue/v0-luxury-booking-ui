'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2 } from 'lucide-react'
import { logger } from '@/lib/utils/logger'

interface BookingRecord {
  id: string
  item_id: string
  item_type: string
  user_name: string
  user_email: string
  guests: number
  checkin: string
  checkout: string
  total_price: number
  payment_method: string
  status: string
  created_at: string
}

export default function BookingsContent() {
  const [bookings, setBookings] = useState<BookingRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchBookings()

    // Subscribe to new bookings
    const supabase = createClient()
    const subscription = supabase
      .channel('bookings')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'bookings' }, (payload) => {
        console.log('[v0] New booking received:', payload)
        setBookings((prev) => [payload.new as BookingRecord, ...prev])
      })
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const fetchBookings = async () => {
    try {
      logger.info('Fetching bookings from database')
      const supabase = createClient()
      const { data, error: fetchError } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false })

      if (fetchError) {
        logger.error('Error fetching bookings', fetchError)
        throw fetchError
      }

      logger.success(`Retrieved ${data?.length || 0} bookings`)
      setBookings(data || [])
      setError(null)
    } catch (err) {
      logger.error('Exception fetching bookings', err)
      setError('Failed to load bookings')
    } finally {
      setLoading(false)
    }
  }

  const calculateNights = (checkin: string, checkout: string) => {
    const start = new Date(checkin)
    const end = new Date(checkout)
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'property':
        return 'bg-blue-100 text-blue-800'
      case 'car':
        return 'bg-purple-100 text-purple-800'
      case 'service':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
        {error}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {bookings.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <p className="text-center text-muted-foreground">No bookings yet</p>
          </CardContent>
        </Card>
      ) : (
        bookings.map((booking) => (
          <Card key={booking.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-center">
                {/* Customer Info */}
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Customer</p>
                  <p className="font-semibold text-foreground">{booking.user_name}</p>
                  <p className="text-sm text-muted-foreground">{booking.user_email}</p>
                </div>

                {/* Booking Details */}
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Item</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className={getTypeColor(booking.item_type)}>
                      {booking.item_type}
                    </Badge>
                    <p className="font-semibold text-foreground">#{booking.item_id.slice(0, 8)}</p>
                  </div>
                </div>

                {/* Dates */}
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Dates</p>
                  <p className="font-semibold text-foreground">
                    {new Date(booking.checkin).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {calculateNights(booking.checkin, booking.checkout)} nights
                  </p>
                </div>

                {/* Payment & Price */}
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Payment</p>
                  <p className="font-semibold text-foreground">${booking.total_price}</p>
                  <p className="text-sm text-muted-foreground">{booking.payment_method}</p>
                </div>

                {/* Status */}
                <div className="flex flex-col items-start lg:items-end">
                  <Badge
                    className={
                      booking.status === 'confirmed'
                        ? 'bg-green-100 text-green-800'
                        : booking.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                    }
                  >
                    {booking.status}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-2">
                    {new Date(booking.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  )
}
