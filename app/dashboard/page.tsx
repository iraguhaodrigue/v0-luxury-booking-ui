import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/layouts/navbar'
import { DashboardSidebar } from '@/components/layouts/dashboard-sidebar'
import { Footer } from '@/components/layouts/footer'
import { formatPrice } from '@/lib/utils/currency'
import { Calendar, MapPin, DollarSign, Star, Heart, TrendingUp } from 'lucide-react'

// Will be fetched from database

export const metadata = {
  title: 'Dashboard | Rwanda Luxury Hospitality',
  description: 'Manage your Rwanda luxury accommodation bookings and account',
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

  // Fetch real bookings from database for this user
  const { data: bookingsData } = await supabase
    .from('bookings')
    .select('id, check_in_date, check_out_date, status, total_price, rooms(properties(name, image_url, location))')
    .eq('auth_user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(2)

  const recentBookings = (bookingsData || []).map((b: any) => ({
    id: b.id,
    property: b.rooms?.properties?.name || 'Unknown Property',
    location: b.rooms?.properties?.location || 'Rwanda',
    checkIn: b.check_in_date,
    checkOut: b.check_out_date,
    status: b.status?.charAt(0).toUpperCase() + b.status?.slice(1) || 'Pending',
    total: b.total_price || 0,
    image: b.rooms?.properties?.image_url || 'https://images.unsplash.com/photo-1570129477492-45a003537e1f?w=300&q=80',
  }))

  // Calculate stats
  const totalBookings = bookingsData?.length || 0
  const totalSpent = recentBookings.reduce((sum, b) => sum + b.total, 0)
  
  const stats = [
    { label: 'Total Bookings', value: String(totalBookings), icon: Calendar },
    { label: 'Bookings Made', value: String(totalBookings), icon: TrendingUp },
    { label: 'Total Spent', value: formatPrice(totalSpent, false), icon: DollarSign },
    { label: 'Member Status', value: 'Active', icon: Star },
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
                  <div key={index} className="card-luxury">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-muted-foreground text-sm mb-1">
                          {stat.label}
                        </p>
                        <p className="text-3xl font-bold text-foreground">
                          {stat.value}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                        <Icon className="w-6 h-6 text-accent" />
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
                {recentBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="flex items-center space-x-4 p-4 border border-border rounded-lg hover:bg-secondary transition-colors"
                  >
                    {/* Image */}
                    <img
                      src={booking.image}
                      alt={booking.property}
                      className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                    />

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground">
                        {booking.property}
                      </h3>
                      <div className="flex items-center space-x-1 text-muted-foreground text-sm mb-2">
                        <MapPin className="w-4 h-4" />
                        <span>{booking.location}</span>
                      </div>
                      <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                        <span>
                          {new Date(booking.checkIn).toLocaleDateString()} -{' '}
                          {new Date(booking.checkOut).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {/* Status & Price */}
                    <div className="text-right flex-shrink-0">
                      <div className="flex items-center justify-end gap-2 mb-2">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            booking.status === 'Confirmed'
                              ? 'bg-accent/10 text-accent'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {booking.status}
                        </span>
                      </div>
                      <p className="text-lg font-bold text-foreground">
                        {formatPrice(booking.total, false)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Account Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              <div className="card-luxury">
                <h3 className="text-lg font-serif font-bold text-foreground mb-4">
                  Total Spent in Rwanda
                </h3>
                <p className="text-3xl font-bold text-accent mb-2">
                  {formatPrice(totalSpent, false)}
                </p>
                <p className="text-sm text-muted-foreground">
                  Across {recentBookings.length} bookings
                </p>
              </div>

              <div className="card-luxury">
                <h3 className="text-lg font-serif font-bold text-foreground mb-4">
                  Loyalty Status
                </h3>
                <p className="text-2xl font-bold text-foreground mb-2">
                  VIP Member
                </p>
                <p className="text-sm text-muted-foreground">
                  Earn points on every booking
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
