'use client'

import { Navbar } from '@/components/layouts/navbar'
import { AdminSidebar } from '@/components/layouts/admin-sidebar'
import { Footer } from '@/components/layouts/footer'
import { DataTable } from '@/components/admin/data-table'
import { Plus } from 'lucide-react'

const cars = [
  {
    id: 1,
    name: 'Tesla Model S',
    model: 'Electric Sedan',
    price: 250,
    seats: 5,
    available: 5,
  },
  {
    id: 2,
    name: 'Mercedes-Benz S-Class',
    model: 'Luxury Sedan',
    price: 280,
    seats: 5,
    available: 3,
  },
  {
    id: 3,
    name: 'BMW 7 Series',
    model: 'Executive Sedan',
    price: 270,
    seats: 5,
    available: 4,
  },
  {
    id: 4,
    name: 'Porsche 911',
    model: 'Sports Car',
    price: 350,
    seats: 2,
    available: 2,
  },
  {
    id: 5,
    name: 'Range Rover',
    model: 'Luxury SUV',
    price: 320,
    seats: 7,
    available: 1,
  },
]

const columns = [
  { key: 'name', label: 'Car Name' },
  { key: 'model', label: 'Model' },
  {
    key: 'price',
    label: 'Price/Day',
    render: (value: number) => `$${value}`,
  },
  { key: 'seats', label: 'Seats' },
  { key: 'available', label: 'Available Units' },
]

export default function CarsPage() {
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
                  Manage Cars
                </h1>
                <p className="text-muted-foreground">
                  {cars.length} vehicles in fleet
                </p>
              </div>
              <button className="btn-luxury-accent flex items-center space-x-2">
                <Plus className="w-5 h-5" />
                <span>Add Car</span>
              </button>
            </div>

            <DataTable columns={columns} data={cars} />
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
