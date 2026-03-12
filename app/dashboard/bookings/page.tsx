import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/layouts/navbar'
import { DashboardSidebar } from '@/components/layouts/dashboard-sidebar'
import { Footer } from '@/components/layouts/footer'
import { formatPrice } from '@/lib/utils/currency'
import { Calendar, MapPin, Eye, Download, Filter } from 'lucide-react'
import Link from 'next/link'

export const metadata = {
  title: 'My Bookings | KILUVA Dashboard',
  description: 'View and manage all your bookings',
}

interface Booking {
  id: string
  item_name: string
  item_type: string
  checkin: string
  checkout: string
  status: 'pending' | 'confirmed' | 'rejected' | 'completed'
  total_price: number
  created_at: string
}

export default async function BookingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Fetch user's bookings
  const { data: bookings } = await supabase
    .from('bookings')
    .select('*')
    .eq('user_email', user.email)
    .order('created_at', { ascending: false })

  const allBookings = (bookings as Booking[]) || []
  const confirmedCount = allBookings.filter(b => b.status === 'confirmed').length
  const pendingCount = allBookings.filter(b => b.status === 'pending').length
  const completedCount = allBookings.filter(b => b.status === 'completed').length

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'completed':
        return 'bg-blue-100 text-blue-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

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
                Manage and track all your reservations
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="card-luxury">
                <p className="text-muted-foreground text-sm mb-1">
                  Total Bookings
                </p>
                <p className="text-3xl font-bold text-foreground">
                  {allBookings.length}
                </p>
              </div>
              <div className="card-luxury">
                <p className="text-muted-foreground text-sm mb-1">
                  Pending
                </p>
                <p className="text-3xl font-bold text-yellow-500">
                  {pendingCount}
                </p>
              </div>
              <div className="card-luxury">
                <p className="text-muted-foreground text-sm mb-1">
                  Confirmed
                </p>
                <p className="text-3xl font-bold text-green-500">
                  {confirmedCount}
                </p>
              </div>
              <div className="card-luxury">
                <p className="text-muted-foreground text-sm mb-1">
                  Completed
                </p>
                <p className="text-3xl font-bold text-blue-500">
                  {completedCount}
                </p>
              </div>
            </div>

            {/* Bookings List or Empty State */}
            {allBookings.length === 0 ? (
              <div className="card-luxury text-center py-16">
                <Calendar className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                <h2 className="text-2xl font-serif font-bold text-foreground mb-2">
                  No bookings yet
                </h2>
                <p className="text-muted-foreground mb-6">
                  Start exploring and book your dream stay or service!
                </p>
                <div className="flex gap-4 justify-center">
                  <a href="/properties">
                    <button className="btn-luxury-accent">
                      Browse Properties
                    </button>
                  </a>
                  <a href="/services">
                    <button className="btn-luxury-ghost">
                      Explore Services
                    </button>
                  </a>
                </div>
              </div>
            ) : (
              <div className="bg-card rounded-lg shadow-luxury overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border bg-secondary">
                        <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                          Item
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
                      {allBookings.map((booking) => (
                        <tr
                          key={booking.id}
                          className="border-b border-border hover:bg-secondary/50 transition-colors"
                        >
                          {/* Item */}
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-semibold text-foreground">
                                {booking.item_name || 'Booking'}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1 capitalize">
                                {booking.item_type || 'property'}
                              </p>
                            </div>
                          </td>

                          {/* Dates */}
                          <td className="px-6 py-4 text-sm">
                            <div className="flex items-center space-x-2 text-muted-foreground">
                              <Calendar className="w-4 h-4 flex-shrink-0" />
                              <span>
                                {new Date(booking.checkin).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                })}{' '}
                                -{' '}
                                {new Date(booking.checkout).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                })}
                              </span>
                            </div>
                          </td>

                          {/* Status */}
                          <td className="px-6 py-4">
                            <span
                              className={`inline-block px-3 py-1 rounded-full text-xs font-semibold capitalize ${getStatusColor(booking.status)}`}
                            >
                              {booking.status}
                            </span>
                          </td>

                          {/* Total */}
                          <td className="px-6 py-4 text-sm font-semibold text-foreground">
                            {formatPrice(parseFloat(String(booking.total_price)) || 0)}
                          </td>

                          {/* Actions */}
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-2">
                              <Link href={`/dashboard/bookings/${booking.id}`}>
                                <button
                                  title="View Details"
                                  className="p-2 hover:bg-secondary rounded-md transition-colors text-foreground hover:text-accent"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                              </Link>
                              <button
                                title="Download Invoice"
                                className="p-2 hover:bg-secondary rounded-md transition-colors text-foreground hover:text-accent"
                              >
                                <Download className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
