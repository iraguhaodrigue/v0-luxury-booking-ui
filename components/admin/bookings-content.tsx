'use client'

import { useEffect, useState } from 'react'
import { DataTable } from '@/components/admin/data-table'
import { supabase } from '@/lib/supabase/client'

interface BookingData {
  id: number
  guest_name: string
  property_name: string
  check_in_date: string
  check_out_date: string
  total_price: number
  status: string
  nights: number
}

const columns = [
  { key: 'id', label: 'Booking ID' },
  { key: 'guest_name', label: 'Guest Name' },
  { key: 'property_name', label: 'Property' },
  {
    key: 'check_in_date',
    label: 'Check-in',
    render: (value: string) => new Date(value).toLocaleDateString(),
  },
  {
    key: 'check_out_date',
    label: 'Check-out',
    render: (value: string) => new Date(value).toLocaleDateString(),
  },
  { key: 'nights', label: 'Nights' },
  {
    key: 'total_price',
    label: 'Total',
    render: (value: number) => `$${value}`,
  },
  {
    key: 'status',
    label: 'Status',
    render: (value: string) => (
      <span
        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
          value === 'confirmed'
            ? 'bg-accent/10 text-accent'
            : 'bg-yellow-100 text-yellow-800'
        }`}
      >
        {value.charAt(0).toUpperCase() + value.slice(1)}
      </span>
    ),
  },
]

export default function BookingsContent() {
  const [bookings, setBookings] = useState<BookingData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const { data, error } = await supabase
          .from('bookings')
          .select(`
            id,
            total_price,
            status,
            check_in_date,
            check_out_date,
            users (full_name),
            rooms (property_id, properties (name))
          `)
          .order('created_at', { ascending: false })

        if (error) throw error

        const formattedBookings = data?.map((booking: any) => {
          const checkIn = new Date(booking.check_in_date)
          const checkOut = new Date(booking.check_out_date)
          const nights = Math.ceil(
            (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)
          )

          return {
            id: booking.id,
            guest_name: booking.users?.full_name || 'Unknown',
            property_name: booking.rooms?.properties?.name || 'Unknown Property',
            check_in_date: booking.check_in_date,
            check_out_date: booking.check_out_date,
            total_price: booking.total_price,
            status: booking.status,
            nights,
          }
        }) || []

        setBookings(formattedBookings)
      } catch (err) {
        console.error('Error fetching bookings:', err)
        setError('Failed to load bookings')
      } finally {
        setLoading(false)
      }
    }

    fetchBookings()
  }, [])

  const handleEdit = (booking: any) => {
    console.log('Edit booking:', booking)
  }

  const handleDelete = async (booking: any) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .delete()
        .eq('id', booking.id)

      if (error) throw error
      setBookings(bookings.filter(b => b.id !== booking.id))
    } catch (err) {
      console.error('Error deleting booking:', err)
    }
  }

  const handleView = (booking: any) => {
    console.log('View booking:', booking)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Loading bookings...</p>
      </div>
    )
  }

  return (
    <div>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-4 mb-8 flex-wrap">
        <input
          type="text"
          placeholder="Search by guest or booking ID..."
          className="input-luxury flex-1 min-w-[200px]"
        />
        <select className="input-luxury">
          <option>All Status</option>
          <option>confirmed</option>
          <option>pending</option>
          <option>cancelled</option>
        </select>
        <input type="date" className="input-luxury" />
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={bookings}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
      />
    </div>
  )
}
