'use client'

import { Navbar } from '@/components/layouts/navbar'
import { AdminSidebar } from '@/components/layouts/admin-sidebar'
import { Footer } from '@/components/layouts/footer'
import { DataTable } from '@/components/admin/data-table'
import { Plus } from 'lucide-react'

const rooms = [
  {
    id: 1,
    roomNumber: 'MED-101',
    property: 'Mediterranean Escape',
    type: 'Deluxe Suite',
    capacity: 2,
    price: 850,
    status: 'Available',
  },
  {
    id: 2,
    roomNumber: 'TRO-201',
    property: 'Tropical Paradise',
    type: 'Garden Cottage',
    capacity: 2,
    price: 650,
    status: 'Available',
  },
  {
    id: 3,
    roomNumber: 'ALP-301',
    property: 'Alpine Luxury Retreat',
    type: 'Master Villa',
    capacity: 4,
    price: 1200,
    status: 'Occupied',
  },
  {
    id: 4,
    roomNumber: 'COA-401',
    property: 'Coastal Villa Deluxe',
    type: 'Oceanview Suite',
    capacity: 3,
    price: 950,
    status: 'Available',
  },
  {
    id: 5,
    roomNumber: 'MAN-501',
    property: 'Manhattan Penthouse',
    type: 'Penthouse',
    capacity: 2,
    price: 750,
    status: 'Maintenance',
  },
]

const columns = [
  { key: 'roomNumber', label: 'Room Number' },
  { key: 'property', label: 'Property' },
  { key: 'type', label: 'Type' },
  { key: 'capacity', label: 'Capacity' },
  {
    key: 'price',
    label: 'Price/Night',
    render: (value: number) => `$${value}`,
  },
  {
    key: 'status',
    label: 'Status',
    render: (value: string) => (
      <span
        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
          value === 'Available'
            ? 'bg-accent/10 text-accent'
            : value === 'Occupied'
              ? 'bg-blue-100 text-blue-800'
              : 'bg-yellow-100 text-yellow-800'
        }`}
      >
        {value}
      </span>
    ),
  },
]

export default function RoomsPage() {
  return (
    <main className="w-full min-h-screen flex flex-col">
      <Navbar />

      <div className="flex flex-1">
        <AdminSidebar />

        <div className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-4xl font-serif font-bold text-foreground mb-2">
                  Manage Rooms
                </h1>
                <p className="text-muted-foreground">
                  {rooms.length} total rooms
                </p>
              </div>
              <button className="btn-luxury-accent flex items-center space-x-2">
                <Plus className="w-5 h-5" />
                <span>Add Room</span>
              </button>
            </div>

            <div className="flex gap-4 mb-8 flex-wrap">
              <input
                type="text"
                placeholder="Search by room number..."
                className="input-luxury flex-1 min-w-[200px]"
              />
              <select className="input-luxury">
                <option>All Status</option>
                <option>Available</option>
                <option>Occupied</option>
                <option>Maintenance</option>
              </select>
            </div>

            <DataTable columns={columns} data={rooms} />
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
