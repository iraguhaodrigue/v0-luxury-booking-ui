import { Navbar } from '@/components/layouts/navbar'
import { AdminSidebar } from '@/components/layouts/admin-sidebar'
import { Footer } from '@/components/layouts/footer'
import { DataTable } from '@/components/admin/data-table'
import { Plus } from 'lucide-react'

const properties = [
  {
    id: 1,
    name: 'Mediterranean Escape',
    location: 'Santorini, Greece',
    type: 'Villa',
    rooms: 4,
    price: 850,
    status: 'Active',
  },
  {
    id: 2,
    name: 'Tropical Paradise',
    location: 'Bali, Indonesia',
    type: 'Villa',
    rooms: 5,
    price: 650,
    status: 'Active',
  },
  {
    id: 3,
    name: 'Alpine Luxury Retreat',
    location: 'Swiss Alps',
    type: 'Villa',
    rooms: 6,
    price: 1200,
    status: 'Active',
  },
  {
    id: 4,
    name: 'Manhattan Penthouse',
    location: 'New York, USA',
    type: 'Apartment',
    rooms: 3,
    price: 750,
    status: 'Maintenance',
  },
  {
    id: 5,
    name: 'Parisian Elegance',
    location: 'Paris, France',
    type: 'Apartment',
    rooms: 2,
    price: 680,
    status: 'Active',
  },
]

const columns = [
  { key: 'name', label: 'Property Name' },
  { key: 'location', label: 'Location' },
  { key: 'type', label: 'Type' },
  { key: 'rooms', label: 'Rooms' },
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
          value === 'Active'
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
  title: 'Manage Properties | Admin',
  description: 'Manage all luxury properties',
}

export default function PropertiesPage() {
  const handleEdit = (property: any) => {
    console.log('Edit property:', property)
  }

  const handleDelete = (property: any) => {
    console.log('Delete property:', property)
  }

  const handleView = (property: any) => {
    console.log('View property:', property)
  }

  return (
    <main className="w-full min-h-screen flex flex-col">
      <Navbar />

      <div className="flex flex-1">
        <AdminSidebar />

        <div className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-4xl font-serif font-bold text-foreground mb-2">
                  Manage Properties
                </h1>
                <p className="text-muted-foreground">
                  {properties.length} total properties
                </p>
              </div>
              <button className="btn-luxury-accent flex items-center space-x-2">
                <Plus className="w-5 h-5" />
                <span>Add Property</span>
              </button>
            </div>

            {/* Filters */}
            <div className="flex gap-4 mb-8 flex-wrap">
              <input
                type="text"
                placeholder="Search properties..."
                className="input-luxury flex-1 min-w-[200px]"
              />
              <select className="input-luxury">
                <option>All Types</option>
                <option>Villa</option>
                <option>Apartment</option>
              </select>
              <select className="input-luxury">
                <option>All Status</option>
                <option>Active</option>
                <option>Maintenance</option>
                <option>Inactive</option>
              </select>
            </div>

            {/* Table */}
            <DataTable
              columns={columns}
              data={properties}
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
