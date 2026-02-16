'use client'

import { Navbar } from '@/components/layouts/navbar'
import { AdminSidebar } from '@/components/layouts/admin-sidebar'
import { Footer } from '@/components/layouts/footer'
import { DataTable } from '@/components/admin/data-table'

const payments = [
  {
    id: 'PAY-001',
    invoice: 'INV-001',
    guest: 'John Smith',
    amount: 5950,
    date: '2025-03-01',
    method: 'Credit Card',
    status: 'Completed',
  },
  {
    id: 'PAY-002',
    invoice: 'INV-002',
    guest: 'Jane Doe',
    amount: 4550,
    date: '2025-04-01',
    method: 'Bank Transfer',
    status: 'Pending',
  },
  {
    id: 'PAY-003',
    invoice: 'INV-003',
    guest: 'Robert Johnson',
    amount: 8400,
    date: '2025-05-01',
    method: 'Credit Card',
    status: 'Completed',
  },
  {
    id: 'PAY-004',
    invoice: 'INV-004',
    guest: 'Emma Wilson',
    amount: 6650,
    date: '2025-06-01',
    method: 'PayPal',
    status: 'Completed',
  },
  {
    id: 'PAY-005',
    invoice: 'INV-005',
    guest: 'Michael Brown',
    amount: 3000,
    date: '2025-07-01',
    method: 'Credit Card',
    status: 'Completed',
  },
]

const columns = [
  { key: 'invoice', label: 'Invoice' },
  { key: 'guest', label: 'Guest' },
  {
    key: 'amount',
    label: 'Amount',
    render: (value: number) => `$${value}`,
  },
  {
    key: 'date',
    label: 'Date',
    render: (value: string) => new Date(value).toLocaleDateString(),
  },
  { key: 'method', label: 'Method' },
  {
    key: 'status',
    label: 'Status',
    render: (value: string) => (
      <span
        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
          value === 'Completed'
            ? 'bg-accent/10 text-accent'
            : 'bg-yellow-100 text-yellow-800'
        }`}
      >
        {value}
      </span>
    ),
  },
]

export default function PaymentsPage() {
  return (
    <main className="w-full min-h-screen flex flex-col">
      <Navbar />

      <div className="flex flex-1">
        <AdminSidebar />

        <div className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
              <h1 className="text-4xl font-serif font-bold text-foreground mb-2">
                Payment Management
              </h1>
              <p className="text-muted-foreground">
                {payments.length} total transactions
              </p>
            </div>

            <div className="flex gap-4 mb-8 flex-wrap">
              <input
                type="text"
                placeholder="Search by invoice or guest..."
                className="input-luxury flex-1 min-w-[200px]"
              />
              <select className="input-luxury">
                <option>All Status</option>
                <option>Completed</option>
                <option>Pending</option>
                <option>Failed</option>
              </select>
            </div>

            <DataTable columns={columns} data={payments} />
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
