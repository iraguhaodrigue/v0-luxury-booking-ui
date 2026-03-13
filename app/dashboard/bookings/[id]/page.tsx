import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/layouts/navbar'
import { DashboardSidebar } from '@/components/layouts/dashboard-sidebar'
import { Footer } from '@/components/layouts/footer'
import { formatPrice } from '@/lib/utils/currency'
import { ArrowLeft, Calendar, Users, DollarSign, Phone, Mail, CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react'
import Link from 'next/link'

export const metadata = {
  title: 'Booking Details | KILUVA Dashboard',
  description: 'View your booking details',
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
  user_name: string
  user_email: string
  user_phone: string
  guests?: number
  extras?: any
  admin_comment?: string
}

export default async function BookingDetailsPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Fetch booking
  const { data: booking } = await supabase
    .from('bookings')
    .select('*')
    .eq('id', params.id)
    .eq('user_email', user.email)
    .single()

  if (!booking) {
    notFound()
  }

  const b = booking as Booking
  const checkInDate = new Date(b.checkin)
  const checkOutDate = new Date(b.checkout)
  const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24))

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="w-6 h-6 text-green-500" />
      case 'pending':
        return <Clock className="w-6 h-6 text-yellow-500" />
      case 'completed':
        return <CheckCircle className="w-6 h-6 text-blue-500" />
      case 'rejected':
        return <XCircle className="w-6 h-6 text-red-500" />
      default:
        return <AlertCircle className="w-6 h-6 text-gray-500" />
    }
  }

  const getStatusBg = (status: string) => {
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
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Back Button */}
            <Link href="/dashboard/bookings">
              <button className="flex items-center gap-2 text-accent hover:text-accent/80 mb-6 font-semibold">
                <ArrowLeft className="w-4 h-4" />
                Back to Bookings
              </button>
            </Link>

            {/* Header with Status */}
            <div className="card-luxury mb-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-serif font-bold text-foreground mb-2">
                    {b.item_name}
                  </h1>
                  <p className="text-muted-foreground capitalize">
                    {b.item_type} • Booking ID: {b.id.slice(0, 8).toUpperCase()}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${getStatusBg(b.status)}`}>
                    {getStatusIcon(b.status)}
                    <span className="font-semibold capitalize">{b.status}</span>
                  </div>
                  <span className="text-2xl font-bold text-foreground">
                    {formatPrice(parseFloat(String(b.total_price)) || 0)}
                  </span>
                </div>
              </div>

              {/* Status Message */}
              {b.status === 'confirmed' && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
                  <p className="text-sm text-green-800">
                    <span className="font-semibold">Booking confirmed!</span> Your reservation is confirmed. Check your email for confirmation details.
                  </p>
                </div>
              )}
              {b.status === 'pending' && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
                  <p className="text-sm text-yellow-800">
                    <span className="font-semibold">Pending confirmation.</span> We're reviewing your booking and will notify you soon.
                  </p>
                </div>
              )}
              {b.status === 'rejected' && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
                  <p className="text-sm text-red-800">
                    <span className="font-semibold">Booking was not confirmed.</span> Please contact support for more information.
                  </p>
                </div>
              )}
            </div>

            {/* Booking Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Booking Information */}
              <div className="card-luxury">
                <h2 className="text-lg font-serif font-bold text-foreground mb-4">
                  Booking Information
                </h2>
                <div className="space-y-4">
                  <div>
                    <p className="text-muted-foreground text-sm mb-1">Check-in Date</p>
                    <div className="flex items-center gap-2 text-foreground font-semibold">
                      <Calendar className="w-4 h-4 text-accent" />
                      {checkInDate.toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </div>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm mb-1">Check-out Date</p>
                    <div className="flex items-center gap-2 text-foreground font-semibold">
                      <Calendar className="w-4 h-4 text-accent" />
                      {checkOutDate.toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </div>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm mb-1">Duration</p>
                    <p className="text-foreground font-semibold">
                      {nights} night{nights !== 1 ? 's' : ''}
                    </p>
                  </div>
                  {b.guests && (
                    <div>
                      <p className="text-muted-foreground text-sm mb-1">Guests</p>
                      <div className="flex items-center gap-2 text-foreground font-semibold">
                        <Users className="w-4 h-4 text-accent" />
                        {b.guests} guest{b.guests !== 1 ? 's' : ''}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Guest Information */}
              <div className="card-luxury">
                <h2 className="text-lg font-serif font-bold text-foreground mb-4">
                  Guest Information
                </h2>
                <div className="space-y-4">
                  <div>
                    <p className="text-muted-foreground text-sm mb-1">Full Name</p>
                    <p className="text-foreground font-semibold">
                      {b.user_name || 'Not provided'}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm mb-1">Email</p>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-accent flex-shrink-0" />
                      <a href={`mailto:${b.user_email}`} className="text-accent hover:underline">
                        {b.user_email}
                      </a>
                    </div>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm mb-1">Phone</p>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-accent flex-shrink-0" />
                      <a href={`tel:${b.user_phone}`} className="text-accent hover:underline">
                        {b.user_phone || 'Not provided'}
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="card-luxury mb-6">
              <h2 className="text-lg font-serif font-bold text-foreground mb-4">
                Price Summary
              </h2>
              <div className="space-y-3 border-b border-border pb-4 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-foreground">Booking Total</span>
                  <span className="font-semibold text-foreground">
                    {formatPrice(parseFloat(String(b.total_price)) || 0)}
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center text-lg">
                <span className="font-semibold text-foreground">Total Amount</span>
                <span className="font-bold text-accent text-2xl">
                  {formatPrice(parseFloat(String(b.total_price)) || 0)}
                </span>
              </div>
            </div>

            {/* Admin Message or Comments */}
            {b.admin_comment && (
              <div className="card-luxury mb-6 bg-blue-50 border border-blue-200">
                <h2 className="text-lg font-serif font-bold text-foreground mb-3">
                  Message from Admin
                </h2>
                <p className="text-foreground whitespace-pre-wrap">
                  {b.admin_comment}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-4">
              <button className="btn-luxury-accent">
                Download Invoice
              </button>
              <Link href="/dashboard/messages">
                <button className="btn-luxury-ghost">
                  Contact Support
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
