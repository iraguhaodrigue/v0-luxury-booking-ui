import { Navbar } from '@/components/layouts/navbar'
import { AdminSidebar } from '@/components/layouts/admin-sidebar'
import { Footer } from '@/components/layouts/footer'
import { Building2, Calendar, Users, DollarSign, TrendingUp, AlertCircle } from 'lucide-react'

const stats = [
  { label: 'Total Properties', value: '127', icon: Building2, change: '+12 this month' },
  { label: 'Active Bookings', value: '43', icon: Calendar, change: '+8 this week' },
  { label: 'Total Guests', value: '892', icon: Users, change: '+156 this month' },
  { label: 'Revenue', value: '$285,450', icon: DollarSign, change: '+23% vs last month' },
]

const recentBookings = [
  { id: 1, guest: 'John Smith', property: 'Mediterranean Escape', dates: 'Mar 15-22', amount: '$5,950', status: 'Confirmed' },
  { id: 2, guest: 'Jane Doe', property: 'Tropical Paradise', dates: 'Apr 10-17', amount: '$4,550', status: 'Pending' },
  { id: 3, guest: 'Robert Johnson', property: 'Alpine Luxury', dates: 'May 1-8', amount: '$8,400', status: 'Confirmed' },
  { id: 4, guest: 'Emma Wilson', property: 'Coastal Villa', dates: 'Jun 5-12', amount: '$6,650', status: 'Confirmed' },
]

const alerts = [
  { id: 1, type: 'urgent', message: '2 properties require maintenance check' },
  { id: 2, type: 'warning', message: '5 pending payment confirmations' },
  { id: 3, type: 'info', message: 'New review submitted for Mediterranean Escape' },
]

export const metadata = {
  title: 'Admin Dashboard | Luxury Stays',
  description: 'Manage properties, bookings, and services',
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
                Admin Dashboard
              </h1>
              <p className="text-muted-foreground">
                Welcome back! Here's your business overview
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
                    Recent Bookings
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
                  Alerts
                </h2>

                <div className="space-y-3">
                  {alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={`p-3 rounded-lg border flex items-start space-x-3 ${
                        alert.type === 'urgent'
                          ? 'bg-red-50 border-red-200'
                          : alert.type === 'warning'
                            ? 'bg-yellow-50 border-yellow-200'
                            : 'bg-blue-50 border-blue-200'
                      }`}
                    >
                      <AlertCircle
                        className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                          alert.type === 'urgent'
                            ? 'text-red-600'
                            : alert.type === 'warning'
                              ? 'text-yellow-600'
                              : 'text-blue-600'
                        }`}
                      />
                      <p className="text-xs font-medium text-foreground">
                        {alert.message}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
              <a href="/admin/properties">
                <button className="card-luxury w-full text-center hover:shadow-luxury-md transition-shadow">
                  <h3 className="font-semibold text-foreground text-sm">
                    Manage Properties
                  </h3>
                </button>
              </a>

              <a href="/admin/bookings">
                <button className="card-luxury w-full text-center hover:shadow-luxury-md transition-shadow">
                  <h3 className="font-semibold text-foreground text-sm">
                    View Bookings
                  </h3>
                </button>
              </a>

              <a href="/admin/services">
                <button className="card-luxury w-full text-center hover:shadow-luxury-md transition-shadow">
                  <h3 className="font-semibold text-foreground text-sm">
                    Manage Services
                  </h3>
                </button>
              </a>

              <a href="/admin/users">
                <button className="card-luxury w-full text-center hover:shadow-luxury-md transition-shadow">
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
