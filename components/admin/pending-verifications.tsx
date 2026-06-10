'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Check, X, Eye } from 'lucide-react'
import { toast } from 'sonner'

interface PendingOwner {
  id: string
  email: string
  full_name: string
  phone: string
  country: string
  created_at: string
}

interface PendingVerificationsProps {
  owners: PendingOwner[]
  onVerify?: (id: string) => void
  onReject?: (id: string) => void
}

export function PendingVerifications({
  owners,
  onVerify,
  onReject,
}: PendingVerificationsProps) {
  const [verifying, setVerifying] = useState<string | null>(null)

  const handleVerify = async (id: string) => {
    setVerifying(id)
    try {
      const response = await fetch(`/api/admin/owners/${id}/verify`, {
        method: 'POST',
      })

      if (!response.ok) throw new Error('Failed to verify owner')

      toast.success('Owner verified successfully')
      onVerify?.(id)
    } catch (error) {
      toast.error('Failed to verify owner')
    } finally {
      setVerifying(null)
    }
  }

  const handleReject = async (id: string) => {
    setVerifying(id)
    try {
      const response = await fetch(`/api/admin/owners/${id}/reject`, {
        method: 'POST',
      })

      if (!response.ok) throw new Error('Failed to reject owner')

      toast.success('Owner rejected')
      onReject?.(id)
    } catch (error) {
      toast.error('Failed to reject owner')
    } finally {
      setVerifying(null)
    }
  }

  if (owners.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">All owners verified!</p>
      </Card>
    )
  }

  return (
    <Card>
      <div className="p-6 border-b border-border">
        <h3 className="font-semibold text-lg">Pending Owner Verification</h3>
      </div>
      <div className="divide-y divide-border">
        {owners.map((owner) => (
          <div key={owner.id} className="p-6 hover:bg-secondary/50 transition-colors">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 flex-1">
                <Avatar>
                  <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${owner.email}`} />
                  <AvatarFallback>{owner.full_name[0]}</AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <p className="font-semibold">{owner.full_name}</p>
                    <Badge variant="outline">{owner.country}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{owner.email}</p>
                  <p className="text-sm text-muted-foreground">{owner.phone}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Applied {new Date(owner.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  disabled={verifying === owner.id}
                >
                  <Eye className="w-4 h-4" />
                  View
                </Button>
                <Button
                  size="sm"
                  className="gap-2"
                  disabled={verifying === owner.id}
                  onClick={() => handleVerify(owner.id)}
                >
                  <Check className="w-4 h-4" />
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  className="gap-2"
                  disabled={verifying === owner.id}
                  onClick={() => handleReject(owner.id)}
                >
                  <X className="w-4 h-4" />
                  Reject
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
