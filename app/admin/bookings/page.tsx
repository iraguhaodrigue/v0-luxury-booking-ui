import { Navbar } from '@/components/layouts/navbar'
import { AdminSidebar } from '@/components/layouts/admin-sidebar'
import { Footer } from '@/components/layouts/footer'
import BookingsContent from '@/components/admin/bookings-content'

export const metadata = {
  title: 'Manage Bookings | Admin',
  description: 'Manage all bookings',
}

export default function BookingsPage() {
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
                Manage Bookings
              </h1>
              <p className="text-muted-foreground">
                View and manage all property bookings
              </p>
            </div>

            {/* Content */}
            <BookingsContent />
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
