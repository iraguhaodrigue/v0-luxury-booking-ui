'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Navbar } from '@/components/layouts/navbar'
import { DashboardSidebar } from '@/components/layouts/dashboard-sidebar'
import { Footer } from '@/components/layouts/footer'
import { formatPrice } from '@/lib/utils/currency'
import { useBookings } from '@/hooks/useBookings'
import { useNotifications } from '@/contexts/NotificationsContext'
import { Calendar, MapPin, Eye, Download, Filter, Loader2 } from 'lucide-react'
import Link from 'next/link'

interface BookableItem {
  id: string
  item_name: string
  item_type: string
  checkin: string
  checkout: string
  status: 'pending' | 'confirmed' | 'rejected' | 'completed'
  total_price: string | number
  created_at: string
}

export default function BookingsPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loadingUser, setLoadingUser] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'completed' | 'rejected'>('all')

  const supabase = createClient()
  const { addNotification } = useNotifications()

  // Get user
  useEffect(() => {
    const getUser = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) {
        router.push('/auth/login')
      } else {
        setUser(authUser)
      }
      setLoadingUser(false)
    }
    getUser()
  }, [supabase, router])

  // Use real-time bookings hook
  const { bookings, loading, error } = useBookings(user?.email || null)

  // Calculate stats
  const filteredBookings = filter === 'all' 
    ? bookings 
    : bookings.filter(b => b.status === filter)
  
  const confirmedCount = bookings.filter(b => b.status === 'confirmed').length
  const pendingCount = bookings.filter(b => b.status === 'pending').length
  const completedCount = bookings.filter(b => b.status === 'completed').length

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

  if (loadingUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />

      <div className="flex flex-1">
        <DashboardSidebar />

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto w-full">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-2">My Bookings</h1>
            <p className="text-muted-foreground">Manage and track all your bookings</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            <div className="card-luxury">
              <p className="text-muted-foreground text-sm mb-1">Total</p>
              <p className="text-2xl font-bold text-foreground">{bookings.length}</p>
            </div>
            <div className="card-luxury">
              <p className="text-muted-foreground text-sm mb-1">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
            </div>
            <div className="card-luxury">
              <p className="text-muted-foreground text-sm mb-1">Confirmed</p>
              <p className="text-2xl font-bold text-green-600">{confirmedCount}</p>
            </div>
            <div className="card-luxury">
              <p className="text-muted-foreground text-sm mb-1">Completed</p>
              <p className="text-2xl font-bold text-blue-600">{completedCount}</p>
            </div>
          </div>

          {/* Filter buttons */}
          <div className="mb-6 flex flex-wrap gap-2">
            {['all', 'pending', 'confirmed', 'completed'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status as any)}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                  filter === status
                    ? 'bg-accent text-accent-foreground'
                    : 'bg-secondary text-foreground hover:bg-secondary/80'
                }`}
              >
                <Filter className="inline w-4 h-4 mr-2" />
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>

          {/* Loading state */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-accent" />
            </div>
          )}

          {/* Error state */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {/* Empty state */}
          {!loading && filteredBookings.length === 0 && (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">No {filter !== 'all' ? filter : ''} bookings yet.</p>
              <Link href="/properties">
                <button className="btn-luxury-accent">Browse Properties</button>
              </Link>
            </div>
          )}

          {/* Bookings list */}
          <div className="space-y-4">
            {filteredBookings.map((booking) => (
              <div
                key={booking.id}
                className="card-luxury hover:shadow-luxury-md transition-all"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-foreground">{booking.item_name}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {new Date(booking.checkin).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} -
                          {' '}
                          {new Date(booking.checkout).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span className="capitalize">{booking.item_type}</span>
                      </div>
                    </div>
                  </div>

                  {/* Price and actions */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Total Price</p>
                      <p className="text-xl font-bold text-accent">{formatPrice(parseFloat(booking.total_price as any) || 0)}</p>
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/dashboard/bookings/${booking.id}`}>
                        <button className="flex items-center gap-2 px-4 py-2 bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 transition-colors">
                          <Eye className="w-4 h-4" />
                          <span className="text-sm font-semibold">Details</span>
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>

      <Footer />
    </div>
  )
}
