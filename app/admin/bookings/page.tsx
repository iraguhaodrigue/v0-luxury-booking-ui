import { Navbar } from '@/components/layouts/navbar'
import { AdminSidebar } from '@/components/layouts/admin-sidebar'
import { Footer } from '@/components/layouts/footer'
import { DataTable } from '@/components/admin/data-table'

const bookings = [
  {
    id: 'BK-001',
    guest: 'John Smith',
    property: 'Mediterranean Escape',
    checkIn: '2025-03-15',
    checkOut: '2025-03-22',
    nights: 7,
    total: 5950,
    status: 'Confirmed',
  },
  {
    id: 'BK-002',
    guest: 'Jane Doe',
    property: 'Tropical Paradise',
    checkIn: '2025-04-10',
    checkOut: '2025-04-17',
    nights: 7,
    total: 4550,
    status: 'Pending',
  },
  {
    id: 'BK-003',
    guest: 'Robert Johnson',
    property: 'Alpine Luxury Retreat',
    checkIn: '2025-05-01',
    checkOut: '2025-05-08',
    nights: 7,
    total: 8400,
    status: 'Confirmed',
  },
  {
    id: 'BK-004',
    guest: 'Emma Wilson',
    property: 'Coastal Villa Deluxe',
    checkIn: '2025-06-05',
    checkOut: '2025-06-12',
    nights: 7,
    total: 6650,
    status: 'Confirmed',
  },
  {
    id: 'BK-005',
    guest: 'Michael Brown',
    property: 'Manhattan Penthouse',
    checkIn: '2025-07-10',
    checkOut: '2025-07-14',
    nights: 4,
    total: 3000,
    status: 'Confirmed',
  },
]

const columns = [
  { key: 'id', label: 'Booking ID' },
  { key: 'guest', label: 'Guest Name' },
  { key: 'property', label: 'Property' },
  {
    key: 'checkIn',
    label: 'Check-in',
    render: (value: string) => new Date(value).toLocaleDateString(),
  },
  {
    key: 'checkOut',
    label: 'Check-out',
    render: (value: string) => new Date(value).toLocaleDateString(),
  },
  { key: 'nights', label: 'Nights' },
  {
    key: 'total',
    label: 'Total',
    render: (value: number) => `$${value}`,
  },
  {
    key: 'status',
    label: 'Status',
    render: (value: string) => (
      <span
        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
          value === 'Confirmed'
            ? 'bg-accent/10 text-accent'
            : 'bg-yellow-100 text-yellow-800'
        }`}
      >
        {value}
      </span>
    ),
  },
]

export const metadata = {
  title: 'Manage Bookings | Admin',
  description: 'Manage all bookings',
}

export default function BookingsPage() {
  const handleEdit = (booking: any) => {
    console.log('Edit booking:', booking)
  }

  const handleDelete = (booking: any) => {
    console.log('Delete booking:', booking)
  }

  const handleView = (booking: any) => {
    console.log('View booking:', booking)
  }

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
                {bookings.length} total bookings
              </p>
            </div>

            {/* Filters */}
            <div className="flex gap-4 mb-8 flex-wrap">
              <input
                type="text"
                placeholder="Search by guest or booking ID..."
                className="input-luxury flex-1 min-w-[200px]"
              />
              <select className="input-luxury">
                <option>All Status</option>
                <option>Confirmed</option>
                <option>Pending</option>
                <option>Cancelled</option>
              </select>
              <input
                type="date"
                className="input-luxury"
              />
            </div>

            {/* Table */}
            <DataTable
              columns={columns}
              data={bookings}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onView={handleView}
            />
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
