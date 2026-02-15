import { Navbar } from '@/components/layouts/navbar'
import { DashboardSidebar } from '@/components/layouts/dashboard-sidebar'
import { Footer } from '@/components/layouts/footer'
import { MapPin, Calendar, DollarSign, Download, Eye } from 'lucide-react'

const bookings = [
  {
    id: 'BK-001',
    property: 'Mediterranean Escape',
    location: 'Santorini, Greece',
    checkIn: '2025-03-15',
    checkOut: '2025-03-22',
    status: 'Confirmed',
    total: 5950,
    nights: 7,
    image: 'https://images.unsplash.com/photo-1570129477492-45a003537e1f?w=300&q=80',
  },
  {
    id: 'BK-002',
    property: 'Tropical Paradise',
    location: 'Bali, Indonesia',
    checkIn: '2025-04-10',
    checkOut: '2025-04-17',
    status: 'Pending',
    total: 4550,
    nights: 7,
    image: 'https://images.unsplash.com/photo-1551821440-e5b88667fab0?w=300&q=80',
  },
  {
    id: 'BK-003',
    property: 'Alpine Luxury Retreat',
    location: 'Swiss Alps, Switzerland',
    checkIn: '2025-05-01',
    checkOut: '2025-05-08',
    status: 'Confirmed',
    total: 8400,
    nights: 7,
    image: 'https://images.unsplash.com/photo-1631049307038-da8ec40ed52d?w=300&q=80',
  },
  {
    id: 'BK-004',
    property: 'Coastal Villa Deluxe',
    location: 'Maldives',
    checkIn: '2025-02-10',
    checkOut: '2025-02-17',
    status: 'Completed',
    total: 6650,
    nights: 7,
    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=300&q=80',
  },
  {
    id: 'BK-005',
    property: 'Manhattan Penthouse',
    location: 'New York, USA',
    checkIn: '2024-12-01',
    checkOut: '2024-12-05',
    status: 'Completed',
    total: 3000,
    nights: 4,
    image: 'https://images.unsplash.com/photo-1512917774080-9a485dc1d1fb?w=300&q=80',
  },
]

export const metadata = {
  title: 'My Bookings | Luxury Stays',
  description: 'View and manage all your luxury stay bookings',
}

export default function BookingsPage() {
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
