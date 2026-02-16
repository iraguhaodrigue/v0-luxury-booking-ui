'use client'

import { Navbar } from '@/components/layouts/navbar'
import { AdminSidebar } from '@/components/layouts/admin-sidebar'
import { Footer } from '@/components/layouts/footer'
import { DataTable } from '@/components/admin/data-table'

const users = [
  {
    id: 1,
    name: 'John Smith',
    email: 'john.smith@example.com',
    joinDate: '2024-01-15',
    bookings: 5,
    spent: 12500,
    status: 'Active',
  },
  {
    id: 2,
    name: 'Jane Doe',
    email: 'jane.doe@example.com',
    joinDate: '2024-02-20',
    bookings: 3,
    spent: 8200,
    status: 'Active',
  },
  {
    id: 3,
    name: 'Robert Johnson',
    email: 'robert.j@example.com',
    joinDate: '2024-03-10',
    bookings: 8,
    spent: 28450,
    status: 'Active',
  },
  {
    id: 4,
    name: 'Emma Wilson',
    email: 'emma.w@example.com',
    joinDate: '2023-11-05',
    bookings: 12,
    spent: 45300,
    status: 'Active',
  },
  {
    id: 5,
    name: 'Michael Brown',
    email: 'michael.b@example.com',
    joinDate: '2024-05-01',
    bookings: 2,
    spent: 4500,
    status: 'Inactive',
  },
]

const columns = [
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  {
    key: 'joinDate',
    label: 'Join Date',
    render: (value: string) => new Date(value).toLocaleDateString(),
  },
  { key: 'bookings', label: 'Bookings' },
  {
    key: 'spent',
    label: 'Total Spent',
    render: (value: number) => `$${value.toLocaleString()}`,
  },
  {
    key: 'status',
    label: 'Status',
    render: (value: string) => (
      <span
        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
          value === 'Active'
            ? 'bg-accent/10 text-accent'
            : 'bg-muted text-muted-foreground'
        }`}
      >
        {value}
      </span>
    ),
  },
]

export default function UsersPage() {
  const handleEdit = (user: any) => {
    console.log('Edit user:', user)
  }

  const handleDelete = (user: any) => {
    console.log('Delete user:', user)
  }

  const handleView = (user: any) => {
    console.log('View user:', user)
  }

  return (
    <main className="w-full min-h-screen flex flex-col">
      <Navbar />

      <div className="flex flex-1">
        <AdminSidebar />

        <div className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
              <h1 className="text-4xl font-serif font-bold text-foreground mb-2">
                Manage Users
              </h1>
              <p className="text-muted-foreground">
                {users.length} total users
              </p>
            </div>

            <div className="flex gap-4 mb-8 flex-wrap">
              <input
                type="text"
                placeholder="Search by name or email..."
                className="input-luxury flex-1 min-w-[200px]"
              />
              <select className="input-luxury">
                <option>All Status</option>
                <option>Active</option>
                <option>Inactive</option>
              </select>
            </div>

            <DataTable
              columns={columns}
              data={users}
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
