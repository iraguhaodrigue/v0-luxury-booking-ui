import { Navbar } from '@/components/layouts/navbar'
import { AdminSidebar } from '@/components/layouts/admin-sidebar'
import { Footer } from '@/components/layouts/footer'
import { DataTable } from '@/components/admin/data-table'
import { Plus } from 'lucide-react'

const services = [
  {
    id: 1,
    name: 'Airport Transfer',
    category: 'Transportation',
    price: 150,
    availability: 'Available',
  },
  {
    id: 2,
    name: 'Private Chef',
    category: 'Dining',
    price: 250,
    availability: 'Available',
  },
  {
    id: 3,
    name: 'Spa & Wellness',
    category: 'Wellness',
    price: 200,
    availability: 'Available',
  },
  {
    id: 4,
    name: 'Personal Shopping',
    category: 'Activities',
    price: 120,
    availability: 'Limited',
  },
  {
    id: 5,
    name: 'Housekeeping',
    category: 'Service',
    price: 100,
    availability: 'Available',
  },
]

const columns = [
  { key: 'name', label: 'Service Name' },
  { key: 'category', label: 'Category' },
  {
    key: 'price',
    label: 'Price',
    render: (value: number) => `$${value}`,
  },
  {
    key: 'availability',
    label: 'Availability',
    render: (value: string) => (
      <span
        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
          value === 'Available'
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
  title: 'Manage Services | Admin',
  description: 'Manage premium services',
}

export default function ServicesPage() {
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
                  Manage Services
                </h1>
                <p className="text-muted-foreground">
                  {services.length} total services
                </p>
              </div>
              <button className="btn-luxury-accent flex items-center space-x-2">
                <Plus className="w-5 h-5" />
                <span>Add Service</span>
              </button>
            </div>

            <DataTable columns={columns} data={services} />
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
