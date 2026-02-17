import { Navbar } from '@/components/layouts/navbar'
import { DashboardSidebar } from '@/components/layouts/dashboard-sidebar'
import { Footer } from '@/components/layouts/footer'
import { MapPin, Calendar, DollarSign, Download, Eye } from 'lucide-react'

// Will be fetched from database

export const metadata = {
  title: 'My Bookings | Luxury Stays',
  description: 'View and manage all your luxury stay bookings',
}

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function BookingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/auth/login')
  }

  // Fetch real bookings for the current user
  const { data: bookingsData } = await supabase
    .from('bookings')
    .select('id, check_in_date, check_out_date, status, total_price, rooms(properties(name, image_url, location))')
    .eq('auth_user_id', user.id)
    .order('created_at', { ascending: false })

  const bookings = (bookingsData || []).map((b: any) => {
    const checkIn = new Date(b.check_in_date)
    const checkOut = new Date(b.check_out_date)
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
    
    return {
      id: `BK-${b.id}`,
      property: b.rooms?.properties?.name || 'Unknown Property',
      location: b.rooms?.properties?.location || 'Rwanda',
      checkIn: b.check_in_date,
      checkOut: b.check_out_date,
      status: b.status?.charAt(0).toUpperCase() + b.status?.slice(1) || 'Pending',
      total: b.total_price || 0,
      nights,
      image: b.rooms?.properties?.image_url || 'https://images.unsplash.com/photo-1570129477492-45a003537e1f?w=300&q=80',
    }
  })

  const confirmedCount = bookings.filter((b) => b.status === 'Confirmed').length
  const completedCount = bookings.filter((b) => b.status === 'Completed').length

  return (
    <main className="w-full min-h-screen flex flex-col">
      <Navbar />

      <div className="flex flex-1">
        <DashboardSidebar />

        <div className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-4xl font-serif font-bold text-foreground mb-2">
                My Bookings
              </h1>
              <p className="text-muted-foreground">
                View and manage all your luxury stay reservations
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="card-luxury">
                <p className="text-muted-foreground text-sm mb-1">
                  Total Bookings
                </p>
                <p className="text-3xl font-bold text-foreground">
                  {bookings.length}
                </p>
              </div>
              <div className="card-luxury">
                <p className="text-muted-foreground text-sm mb-1">
                  Confirmed
                </p>
                <p className="text-3xl font-bold text-accent">
                  {confirmedCount}
                </p>
              </div>
              <div className="card-luxury">
                <p className="text-muted-foreground text-sm mb-1">
                  Completed
                </p>
                <p className="text-3xl font-bold text-foreground">
                  {completedCount}
                </p>
              </div>
            </div>

            {/* Bookings List */}
            <div className="bg-card rounded-lg shadow-luxury overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-secondary">
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                        Property
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                        Dates
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                        Total
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((booking) => (
                      <tr
                        key={booking.id}
                        className="border-b border-border hover:bg-secondary/30 transition-colors"
                      >
                        {/* Property */}
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <img
                              src={booking.image}
                              alt={booking.property}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                            <div>
                              <p className="font-semibold text-foreground">
                                {booking.property}
                              </p>
                              <div className="flex items-center space-x-1 text-muted-foreground text-xs mt-1">
                                <MapPin className="w-3 h-3" />
                                <span>{booking.location}</span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Dates */}
                        <td className="px-6 py-4 text-sm">
                          <div className="flex items-center space-x-1 text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                            <span>
                              {new Date(booking.checkIn).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                              })}{' '}
                              -{' '}
                              {new Date(booking.checkOut).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                              })}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {booking.nights} nights
                          </p>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                              booking.status === 'Confirmed'
                                ? 'bg-accent/10 text-accent'
                                : booking.status === 'Pending'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-muted text-muted-foreground'
                            }`}
                          >
                            {booking.status}
                          </span>
                        </td>

                        {/* Total */}
                        <td className="px-6 py-4 text-sm font-semibold text-foreground">
                          ${booking.total}
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <button
                              title="View Details"
                              className="p-2 hover:bg-secondary rounded-md transition-colors"
                            >
                              <Eye className="w-4 h-4 text-foreground" />
                            </button>
                            <button
                              title="Download Invoice"
                              className="p-2 hover:bg-secondary rounded-md transition-colors"
                            >
                              <Download className="w-4 h-4 text-foreground" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
