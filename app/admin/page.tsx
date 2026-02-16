import { Navbar } from '@/components/layouts/navbar'
import { AdminSidebar } from '@/components/layouts/admin-sidebar'
import { Footer } from '@/components/layouts/footer'
import { formatPrice } from '@/lib/utils/currency'
import { Building2, Calendar, Users, DollarSign, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react'

const stats = [
  { label: 'Rwanda Properties', value: '6', icon: Building2, change: '+2 this month' },
  { label: 'Active Bookings', value: '23', icon: Calendar, change: '+8 this week' },
  { label: 'Total Guests', value: '156', icon: Users, change: '+42 this month' },
  { label: 'Revenue (RWF)', value: formatPrice(245000000, false), icon: DollarSign, change: '+18% vs last month' },
]

const recentBookings = [
  { id: 1, guest: 'John Smith', property: 'Kigali Luxury Villa', dates: 'Mar 15-22', amount: formatPrice(6800000, false), status: 'Confirmed' },
  { id: 2, guest: 'Jane Doe', property: 'Volcanoes National Park', dates: 'Apr 10-17', amount: formatPrice(5100000, false), status: 'Pending' },
  { id: 3, guest: 'Robert Johnson', property: 'Rubavu Lakeside Villa', dates: 'May 1-8', amount: formatPrice(4200000, false), status: 'Confirmed' },
  { id: 4, guest: 'Emma Wilson', property: 'Kigali City View Suite', dates: 'Jun 5-12', amount: formatPrice(3850000, false), status: 'Confirmed' },
]

const alerts = [
  { id: 1, type: 'urgent', message: 'Rubavu property requires urgent maintenance' },
  { id: 2, type: 'warning', message: '3 pending payment confirmations for Rwanda bookings' },
  { id: 3, type: 'success', message: '5-star review received for Kigali Luxury Villa' },
]

export const metadata = {
  title: 'Admin Dashboard | Rwanda Luxury Hospitality',
  description: 'Manage Rwanda properties, bookings, and services',
}

export default function AdminDashboardPage() {
  return (
    <main className="w-full min-h-screen flex flex-col">
      <Navbar />

      <div className="flex flex-1">
        <AdminSidebar />

        <div className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-4xl font-serif font-bold text-foreground mb-2">
                Admin Dashboard - Rwanda Operations
              </h1>
              <p className="text-muted-foreground">
                Welcome back! Here's your Rwanda luxury hospitality business overview
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {stats.map((stat, index) => {
                const Icon = stat.icon
                return (
                  <div key={index} className="card-luxury">
                    <div className="flex items-start justify-between mb-4">
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
                    <p className="text-xs text-accent font-semibold">
                      {stat.change}
                    </p>
                  </div>
                )
              })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Recent Bookings */}
              <div className="lg:col-span-2 card-luxury">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-serif font-bold text-foreground">
                    Recent Rwanda Bookings
                  </h2>
                  <a href="/admin/bookings">
                    <button className="text-accent hover:text-accent/80 transition-colors text-sm font-semibold">
                      View All
                    </button>
                  </a>
                </div>

                <div className="space-y-3">
                  {recentBookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-secondary/50 transition-colors"
                    >
                      <div>
                        <p className="font-semibold text-foreground text-sm">
                          {booking.guest}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {booking.property}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-foreground">
                          {booking.amount}
                        </p>
                        <span
                          className={`inline-block text-xs font-semibold px-2 py-1 rounded mt-1 ${
                            booking.status === 'Confirmed'
                              ? 'bg-accent/10 text-accent'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {booking.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Alerts */}
              <div className="card-luxury">
                <h2 className="text-xl font-serif font-bold text-foreground mb-6">
                  System Alerts
                </h2>

                <div className="space-y-3">
                  {alerts.map((alert) => {
                    const Icon = alert.type === 'success' ? CheckCircle : AlertCircle
                    return (
                      <div
                        key={alert.id}
                        className={`p-3 rounded-lg border flex items-start space-x-3 ${
                          alert.type === 'urgent'
                            ? 'bg-red-50 border-red-200'
                            : alert.type === 'warning'
                              ? 'bg-yellow-50 border-yellow-200'
                              : 'bg-green-50 border-green-200'
                        }`}
                      >
                        <Icon
                          className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                            alert.type === 'urgent'
                              ? 'text-red-600'
                              : alert.type === 'warning'
                                ? 'text-yellow-600'
                                : 'text-green-600'
                          }`}
                        />
                        <p className="text-xs font-medium text-foreground">
                          {alert.message}
                        </p>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <div className="card-luxury">
                <h3 className="font-semibold text-foreground mb-4">Occupancy Rate</h3>
                <div className="flex items-end justify-between">
                  <p className="text-3xl font-bold text-accent">78%</p>
                  <span className="text-xs text-accent font-semibold">↑ 12%</span>
                </div>
              </div>

              <div className="card-luxury">
                <h3 className="font-semibold text-foreground mb-4">Guest Satisfaction</h3>
                <div className="flex items-end justify-between">
                  <p className="text-3xl font-bold text-accent">4.7/5</p>
                  <span className="text-xs text-accent font-semibold">↑ 0.2</span>
                </div>
              </div>

              <div className="card-luxury">
                <h3 className="font-semibold text-foreground mb-4">Revenue This Month</h3>
                <div className="flex items-end justify-between">
                  <p className="text-2xl font-bold text-accent">62M RWF</p>
                  <span className="text-xs text-accent font-semibold">↑ 8%</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
              <a href="/admin/properties">
                <button className="card-luxury w-full text-center hover:shadow-luxury-md transition-shadow py-4">
                  <h3 className="font-semibold text-foreground text-sm">
                    Manage Properties
                  </h3>
                </button>
              </a>

              <a href="/admin/bookings">
                <button className="card-luxury w-full text-center hover:shadow-luxury-md transition-shadow py-4">
                  <h3 className="font-semibold text-foreground text-sm">
                    View Bookings
                  </h3>
                </button>
              </a>

              <a href="/admin/services">
                <button className="card-luxury w-full text-center hover:shadow-luxury-md transition-shadow py-4">
                  <h3 className="font-semibold text-foreground text-sm">
                    Manage Services
                  </h3>
                </button>
              </a>

              <a href="/admin/users">
                <button className="card-luxury w-full text-center hover:shadow-luxury-md transition-shadow py-4">
                  <h3 className="font-semibold text-foreground text-sm">
                    View Users
                  </h3>
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
