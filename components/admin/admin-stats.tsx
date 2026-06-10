'use client'

import { Card } from '@/components/ui/card'
import { formatPrice } from '@/lib/utils/currency'
import { Users, Home, ShoppingCart, TrendingUp, AlertCircle } from 'lucide-react'

interface AdminStatsProps {
  totalUsers: number
  totalProperties: number
  totalBookings: number
  totalRevenue: number
  pendingVerifications: number
}

export function AdminStats({
  totalUsers,
  totalProperties,
  totalBookings,
  totalRevenue,
  pendingVerifications,
}: AdminStatsProps) {
  const stats = [
    {
      label: 'Total Users',
      value: totalUsers.toLocaleString(),
      icon: Users,
      color: 'text-blue-500',
    },
    {
      label: 'Properties',
      value: totalProperties.toLocaleString(),
      icon: Home,
      color: 'text-green-500',
    },
    {
      label: 'Bookings',
      value: totalBookings.toLocaleString(),
      icon: ShoppingCart,
      color: 'text-purple-500',
    },
    {
      label: 'Total Revenue',
      value: formatPrice(totalRevenue, false),
      icon: TrendingUp,
      color: 'text-amber-500',
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.label} className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-foreground">{stat.value}</p>
              </div>
              <Icon className={`w-8 h-8 ${stat.color}`} />
            </div>
          </Card>
        )
      })}

      {/* Alert for pending verifications */}
      {pendingVerifications > 0 && (
        <Card className="p-6 border-orange-200 bg-orange-50 col-span-full">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-1" />
            <div>
              <p className="font-semibold text-orange-900">Pending Verifications</p>
              <p className="text-sm text-orange-800">
                {pendingVerifications} property owner{pendingVerifications !== 1 ? 's' : ''} awaiting verification
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
