import { Navbar } from '@/components/layouts/navbar'
import { DashboardSidebar } from '@/components/layouts/dashboard-sidebar'
import { Footer } from '@/components/layouts/footer'
import { DollarSign, Calendar, Download, Eye } from 'lucide-react'

const payments = [
  {
    id: 'PAY-001',
    bookingId: 'BK-001',
    property: 'Mediterranean Escape',
    amount: 5950,
    date: '2025-03-01',
    status: 'Completed',
    method: 'Credit Card',
    invoice: 'INV-001',
  },
  {
    id: 'PAY-002',
    bookingId: 'BK-002',
    property: 'Tropical Paradise',
    amount: 4550,
    date: '2025-04-01',
    status: 'Pending',
    method: 'Bank Transfer',
    invoice: 'INV-002',
  },
  {
    id: 'PAY-003',
    bookingId: 'BK-003',
    property: 'Alpine Luxury Retreat',
    amount: 8400,
    date: '2025-05-01',
    status: 'Completed',
    method: 'Credit Card',
    invoice: 'INV-003',
  },
  {
    id: 'PAY-004',
    bookingId: 'BK-004',
    property: 'Coastal Villa Deluxe',
    amount: 6650,
    date: '2025-02-01',
    status: 'Completed',
    method: 'Credit Card',
    invoice: 'INV-004',
  },
  {
    id: 'PAY-005',
    bookingId: 'BK-005',
    property: 'Manhattan Penthouse',
    amount: 3000,
    date: '2024-12-01',
    status: 'Completed',
    method: 'PayPal',
    invoice: 'INV-005',
  },
]

const totalSpent = payments.reduce((sum, p) => sum + p.amount, 0)
const completedPayments = payments.filter((p) => p.status === 'Completed').length

export const metadata = {
  title: 'Payment History | Luxury Stays',
  description: 'View your payment history and invoices',
}

export default function PaymentsPage() {
  return (
    <main className="w-full min-h-screen flex flex-col">
      <Navbar />

      <div className="flex flex-1">
        <DashboardSidebar />

        <div className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-4xl font-serif font-bold text-foreground mb-2">
                Payment History
              </h1>
              <p className="text-muted-foreground">
                View all your payments and download invoices
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="card-luxury">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm mb-1">
                      Total Spent
                    </p>
                    <p className="text-3xl font-bold text-foreground">
                      ${totalSpent.toLocaleString()}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-accent" />
                  </div>
                </div>
              </div>

              <div className="card-luxury">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm mb-1">
                      Total Payments
                    </p>
                    <p className="text-3xl font-bold text-foreground">
                      {payments.length}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-accent" />
                  </div>
                </div>
              </div>

              <div className="card-luxury">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm mb-1">
                      Completed
                    </p>
                    <p className="text-3xl font-bold text-accent">
                      {completedPayments}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-accent" />
                  </div>
                </div>
              </div>
            </div>

            {/* Payments Table */}
            <div className="bg-card rounded-lg shadow-luxury overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-secondary">
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                        Invoice
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                        Property
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                        Date
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                        Amount
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                        Method
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((payment) => (
                      <tr
                        key={payment.id}
                        className="border-b border-border hover:bg-secondary/30 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <span className="font-semibold text-foreground">
                            {payment.invoice}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <span className="text-foreground text-sm">
                            {payment.property}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <span className="text-sm text-muted-foreground">
                            {new Date(payment.date).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <span className="font-semibold text-foreground">
                            ${payment.amount}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <span className="text-sm text-muted-foreground">
                            {payment.method}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                              payment.status === 'Completed'
                                ? 'bg-accent/10 text-accent'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {payment.status}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <button
                              title="View Details"
                              className="p-2 hover:bg-secondary rounded-md transition-colors"
                            >
                              <Eye className="w-4 h-4 text-foreground" />
                            </button>
                            <button
                              title="Download Invoice"
                              className="p-2 hover:bg-secondary rounded-md transition-colors"
                            >
                              <Download className="w-4 h-4 text-foreground" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Payment Methods Section */}
            <div className="mt-12 card-luxury">
              <h2 className="text-xl font-serif font-bold text-foreground mb-6">
                Saved Payment Methods
              </h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div>
                    <p className="font-semibold text-foreground">
                      Visa ending in 4242
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Expires 12/26
                    </p>
                  </div>
                  <button className="text-muted-foreground hover:text-foreground transition-colors">
                    Remove
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div>
                    <p className="font-semibold text-foreground">
                      Mastercard ending in 5555
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Expires 08/25
                    </p>
                  </div>
                  <button className="text-muted-foreground hover:text-foreground transition-colors">
                    Remove
                  </button>
                </div>
              </div>

              <button className="btn-luxury-ghost mt-6 w-full text-sm">
                Add Payment Method
              </button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
