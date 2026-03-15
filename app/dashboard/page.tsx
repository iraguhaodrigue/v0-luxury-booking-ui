import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/layouts/navbar'
import { DashboardSidebar } from '@/components/layouts/dashboard-sidebar'
import { Footer } from '@/components/layouts/footer'
import { formatPrice } from '@/lib/utils/currency'
import { Calendar, MapPin, DollarSign, Star, Heart, TrendingUp } from 'lucide-react'

export const metadata = {
  title: 'Dashboard | KILUVA',
  description: 'Manage your KILUVA bookings and account',
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // If admin, redirect to admin dashboard
  const isAdmin = user.user_metadata?.role === 'admin'
  if (isAdmin) {
    redirect('/admin')
  }

  const userName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Guest'

  // Fetch bookings: try auth_user_id first, union with user_email to catch legacy rows
  const { data: byUid } = await supabase
    .from('bookings')
    .select('*')
    .eq('auth_user_id', user.id)
    .order('created_at', { ascending: false })

  const { data: byEmail } = await supabase
    .from('bookings')
    .select('*')
    .eq('user_email', user.email)
    .is('auth_user_id', null)          // avoid duplicates with rows already matched above
    .order('created_at', { ascending: false })

  const allBookings = [...(byUid || []), ...(byEmail || [])]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  const recentBookings = allBookings.slice(0, 5)
  
  // Calculate stats
  const totalBookings = allBookings.length
  const confirmedBookings = allBookings.filter(b => b.status === 'confirmed').length
  const pendingBookings = allBookings.filter(b => b.status === 'pending').length
  const completedBookings = allBookings.filter(b => b.status === 'completed').length
  const totalSpent = allBookings.reduce((sum, b) => sum + (parseFloat(b.total_price) || 0), 0)

  const stats = [
    { label: 'Total Bookings', value: String(totalBookings), icon: Calendar, color: 'text-blue-500' },
    { label: 'Confirmed', value: String(confirmedBookings), icon: TrendingUp, color: 'text-green-500' },
    { label: 'Pending', value: String(pendingBookings), icon: Heart, color: 'text-yellow-500' },
    { label: 'Total Spent', value: formatPrice(totalSpent, false), icon: DollarSign, color: 'text-accent' },
  ]

  return (
    <main className="w-full min-h-screen flex flex-col">
      <Navbar />

      <div className="flex flex-1">
        <DashboardSidebar />

        <div className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Welcome Section */}
            <div className="mb-8">
              <h1 className="text-4xl font-serif font-bold text-foreground mb-2">
                Welcome Back, {userName}
              </h1>
              <p className="text-muted-foreground">
                Manage your Rwanda luxury stay bookings and account preferences
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {stats.map((stat, index) => {
                const Icon = stat.icon
                return (
                  <div key={index} className="card-luxury hover:shadow-luxury-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-muted-foreground text-sm mb-2">
                          {stat.label}
                        </p>
                        <p className="text-3xl font-bold text-foreground">
                          {stat.value}
                        </p>
                      </div>
                      <div className="w-14 h-14 bg-opacity-10 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: `var(--color-${stat.color.split('-')[1]})` + '20' }}>
                        <Icon className={`w-7 h-7 ${stat.color}`} />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Recent Bookings */}
            <div className="bg-card rounded-lg shadow-luxury p-6 mb-12">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-serif font-bold text-foreground">
                  Recent Rwanda Bookings
                </h2>
                <a href="/dashboard/bookings">
                  <button className="text-accent hover:text-accent/80 transition-colors text-sm font-semibold">
                    View All
                  </button>
                </a>
              </div>

              <div className="space-y-4">
                {recentBookings.length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">You have not made any bookings yet.</p>
                    <a href="/properties">
                      <button className="btn-luxury-accent text-sm">
                        Browse Villas & Apartments
                      </button>
                    </a>
                  </div>
                ) : (
                  recentBookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="flex items-center space-x-4 p-4 border border-border rounded-lg hover:bg-secondary transition-colors group"
                    >
                      {/* Image */}
                      <div className="w-20 h-20 rounded-lg object-cover flex-shrink-0 bg-muted flex items-center justify-center">
                        <Calendar className="w-8 h-8 text-muted-foreground/50" />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground">
                          {booking.item_name || 'Booking'}
                        </h3>
                        <div className="flex items-center space-x-1 text-muted-foreground text-sm mb-2">
                          <span className="capitalize text-xs bg-secondary px-2 py-1 rounded">
                            {booking.item_type || 'property'}
                          </span>
                        </div>
                        <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                          <span>
                            {new Date(booking.checkin).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} -{' '}
                            {new Date(booking.checkout).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                      </div>

                      {/* Status & Price */}
                      <div className="text-right flex-shrink-0">
                        <div className="flex items-center justify-end gap-2 mb-2">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                              booking.status === 'confirmed'
                                ? 'bg-green-100 text-green-800'
                                : booking.status === 'pending'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : booking.status === 'completed'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {booking.status}
                          </span>
                        </div>
                        <p className="text-lg font-bold text-foreground">
                          {formatPrice(parseFloat(booking.total_price) || 0)}
                        </p>
                      </div>

                      {/* View Details Link */}
                      <a href={`/dashboard/bookings/${booking.id}`} className="hidden group-hover:block">
                        <button className="text-accent hover:text-accent/80 text-sm font-semibold">
                          View →
                        </button>
                      </a>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Account Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className="card-luxury">
                <h3 className="text-lg font-serif font-bold text-foreground mb-4">
                  Total Amount Spent
                </h3>
                <p className="text-3xl font-bold text-accent mb-2">
                  {formatPrice(totalSpent)}
                </p>
                <p className="text-sm text-muted-foreground">
                  Across {allBookings.length} booking{allBookings.length !== 1 ? 's' : ''}
                </p>
              </div>

              <div className="card-luxury">
                <h3 className="text-lg font-serif font-bold text-foreground mb-4">
                  Confirmed Bookings
                </h3>
                <p className="text-3xl font-bold text-green-500 mb-2">
                  {confirmedBookings}
                </p>
                <p className="text-sm text-muted-foreground">
                  Ready to enjoy
                </p>
              </div>

              <div className="card-luxury">
                <h3 className="text-lg font-serif font-bold text-foreground mb-4">
                  Pending Approval
                </h3>
                <p className="text-3xl font-bold text-yellow-500 mb-2">
                  {pendingBookings}
                </p>
                <p className="text-sm text-muted-foreground">
                  Awaiting confirmation
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <a href="/properties">
                <button className="card-luxury w-full text-center hover:shadow-luxury-md transition-shadow h-full">
                  <h3 className="text-xl font-serif font-bold text-foreground mb-2">
                    Browse Properties
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Discover Rwanda luxury accommodations
                  </p>
                </button>
              </a>

              <a href="/services">
                <button className="card-luxury w-full text-center hover:shadow-luxury-md transition-shadow h-full">
                  <h3 className="text-xl font-serif font-bold text-foreground mb-2">
                    Add Services
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Enhance with premium local services
                  </p>
                </button>
              </a>

              <a href="/dashboard/profile">
                <button className="card-luxury w-full text-center hover:shadow-luxury-md transition-shadow h-full">
                  <h3 className="text-xl font-serif font-bold text-foreground mb-2">
                    Edit Profile
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Update account information
                  </p>
                </button>
              </a>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
