import { Navbar } from '@/components/layouts/navbar'
import { Footer } from '@/components/layouts/footer'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, Home, ShoppingCart, TrendingUp, AlertCircle } from 'lucide-react'
import { formatPrice } from '@/lib/utils/currency'
import Link from 'next/link'

export default async function AdminDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Check admin role
  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (userData?.role !== 'admin') {
    redirect('/')
  }

  // Fetch stats
  const [{ data: properties }, { data: bookings }, { data: users }] = await Promise.all([
    supabase.from('properties').select('id'),
    supabase.from('bookings').select('total_price'),
    supabase.from('users').select('id'),
  ])

  const totalRevenue = (bookings || []).reduce((sum, b) => sum + (b.total_price || 0), 0)
  const pendingBookings = bookings?.filter(b => b.status === 'pending') || []

  const stats = [
    {
      title: 'Total Properties',
      value: properties?.length || 0,
      icon: Home,
      trend: '+12% this month',
    },
    {
      title: 'Total Users',
      value: users?.length || 0,
      icon: Users,
      trend: '+8% this month',
    },
    {
      title: 'Total Revenue',
      value: formatPrice(totalRevenue),
      icon: TrendingUp,
      trend: '+23% this month',
    },
    {
      title: 'Pending Bookings',
      value: pendingBookings.length,
      icon: AlertCircle,
      trend: 'Requires action',
    },
  ]

  return (
    <main className="w-full">
      <Navbar />

      <section className="py-12 md:py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h1 className="text-4xl font-serif font-bold text-foreground mb-2">
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground">
              Manage KILUVA marketplace and monitor platform activity
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {stats.map((stat, idx) => {
              const Icon = stat.icon
              return (
                <Card key={idx}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <p className="text-xs text-muted-foreground">{stat.trend}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Management Sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground text-sm">
                  Manage platform users, roles, and permissions
                </p>
                <Link href="/admin/users">
                  <Button className="w-full">Manage Users</Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Properties & Listings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground text-sm">
                  Review and manage property listings
                </p>
                <Link href="/admin/properties">
                  <Button className="w-full">Manage Properties</Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Bookings & Orders</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground text-sm">
                  View and manage all bookings and orders
                </p>
                <Link href="/admin/bookings">
                  <Button className="w-full">View Bookings</Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Reporting & Analytics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground text-sm">
                  Access detailed platform reports and analytics
                </p>
                <Link href="/admin/reports">
                  <Button className="w-full">View Reports</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
