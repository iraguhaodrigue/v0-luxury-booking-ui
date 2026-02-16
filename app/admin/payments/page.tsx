'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Navbar } from '@/components/layouts/navbar'
import { AdminSidebar } from '@/components/layouts/admin-sidebar'
import { Footer } from '@/components/layouts/footer'

interface Payment {
  id: string
  booking_id: string
  amount: number
  payment_method: string
  status: string
  transaction_id: string
  created_at: string
}

interface PaymentWithBooking extends Payment {
  guestName?: string
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<PaymentWithBooking[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [totalAmount, setTotalAmount] = useState(0)

  useEffect(() => {
    fetchPayments()
  }, [])

  const fetchPayments = async () => {
    try {
      setLoading(true)
      const supabase = createClient()

      const { data, error } = await supabase
        .from('payments')
        .select(`
          *,
          bookings(user_id)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Enrich with guest names if available
      const enrichedPayments = (data || []).map(payment => ({
        ...payment,
        guestName: `Booking #${payment.booking_id}`,
      }))

      setPayments(enrichedPayments)
      const total = enrichedPayments.reduce((sum, p) => sum + (p.amount || 0), 0)
      setTotalAmount(total)
    } catch (error) {
      console.error('Error fetching payments:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async (payment: PaymentWithBooking, newStatus: string) => {
    try {
      const supabase = createClient()

      const { error } = await supabase
        .from('payments')
        .update({ status: newStatus })
        .eq('id', payment.id)

      if (error) throw error

      setPayments(payments.map(p =>
        p.id === payment.id ? { ...p, status: newStatus } : p
      ))
    } catch (error) {
      console.error('Error updating payment status:', error)
    }
  }

  const filteredPayments = payments.filter(payment => {
    const matchesSearch =
      payment.transaction_id.toLowerCase().includes(search.toLowerCase()) ||
      (payment.guestName?.toLowerCase().includes(search.toLowerCase()) || false)
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'succeeded':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'failed':
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
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
                Payment Management
              </h1>
              <p className="text-muted-foreground">
                {filteredPayments.length} transaction{filteredPayments.length !== 1 ? 's' : ''} • Total: ${totalAmount.toLocaleString()}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-white p-4 rounded-lg shadow">
                <p className="text-gray-600 text-sm mb-1">Total Payments</p>
                <p className="text-2xl font-bold text-accent">${totalAmount.toLocaleString()}</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <p className="text-gray-600 text-sm mb-1">Total Transactions</p>
                <p className="text-2xl font-bold text-accent">{filteredPayments.length}</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <p className="text-gray-600 text-sm mb-1">Avg Transaction</p>
                <p className="text-2xl font-bold text-accent">
                  ${filteredPayments.length > 0 ? Math.round(totalAmount / filteredPayments.length).toLocaleString() : '0'}
                </p>
              </div>
            </div>

            <div className="flex gap-4 mb-8 flex-wrap">
              <input
                type="text"
                placeholder="Search by transaction ID or booking..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-luxury flex-1 min-w-[200px]"
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input-luxury"
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Loading payments...</p>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="text-left px-6 py-3 font-semibold text-sm">Transaction ID</th>
                      <th className="text-left px-6 py-3 font-semibold text-sm">Booking</th>
                      <th className="text-left px-6 py-3 font-semibold text-sm">Amount</th>
                      <th className="text-left px-6 py-3 font-semibold text-sm">Method</th>
                      <th className="text-left px-6 py-3 font-semibold text-sm">Status</th>
                      <th className="text-left px-6 py-3 font-semibold text-sm">Date</th>
                      <th className="text-left px-6 py-3 font-semibold text-sm">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPayments.map(payment => (
                      <tr key={payment.id} className="border-b hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-mono">{payment.transaction_id}</td>
                        <td className="px-6 py-4 text-sm">{payment.guestName}</td>
                        <td className="px-6 py-4 text-sm font-semibold">${payment.amount.toLocaleString()}</td>
                        <td className="px-6 py-4 text-sm capitalize">{payment.payment_method}</td>
                        <td className="px-6 py-4 text-sm">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(payment.status)}`}>
                            {payment.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {new Date(payment.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {payment.status === 'pending' && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleUpdateStatus(payment, 'completed')}
                                className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
                              >
                                Confirm
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(payment, 'failed')}
                                className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                              >
                                Fail
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
