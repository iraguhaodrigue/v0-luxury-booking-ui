'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { AdminSidebar } from '@/components/layouts/admin-sidebar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2, Star, CheckCircle, XCircle } from 'lucide-react'

interface Review {
  id: string
  item_id: string
  item_type: string
  reviewer_name: string
  reviewer_email: string
  rating: number
  title: string | null
  body: string
  approved: boolean
  admin_note: string | null
  created_at: string
}

export default function AdminReviewsPage() {
  const [reviews, setReviews]   = useState<Review[]>([])
  const [loading, setLoading]   = useState(true)
  const [filter,  setFilter]    = useState<'all' | 'pending' | 'approved'>('pending')
  const [saving,  setSaving]    = useState<string | null>(null)

  const supabase = createClient()

  useEffect(() => { loadReviews() }, [])

  const loadReviews = async () => {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false })
    if (!error) setReviews((data ?? []) as Review[])
    setLoading(false)
  }

  const setApproved = async (id: string, approved: boolean) => {
    setSaving(id)
    const { data, error } = await supabase
      .from('reviews')
      .update({ approved })
      .eq('id', id)
      .select()
      .single()
    if (!error && data) {
      setReviews(prev => prev.map(r => r.id === id ? (data as Review) : r))
    }
    setSaving(null)
  }

  const filtered = reviews.filter(r => {
    if (filter === 'pending')  return !r.approved
    if (filter === 'approved') return r.approved
    return true
  })

  const pendingCount  = reviews.filter(r => !r.approved).length
  const approvedCount = reviews.filter(r => r.approved).length

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <div className="flex-1 p-6 md:p-8 overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-serif font-bold text-foreground">Reviews</h1>
            <p className="text-muted-foreground text-sm mt-1">Moderate guest reviews before they appear publicly.</p>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6">
          {([
            { key: 'pending',  label: 'Pending',  count: pendingCount },
            { key: 'approved', label: 'Approved', count: approvedCount },
            { key: 'all',      label: 'All',      count: reviews.length },
          ] as const).map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                filter === key
                  ? 'bg-accent text-accent-foreground border-accent'
                  : 'bg-background text-muted-foreground border-border hover:border-accent/50'
              }`}
            >
              {label}
              <span className="ml-1.5 text-xs opacity-70">({count})</span>
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-accent" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            No {filter === 'all' ? '' : filter} reviews found.
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(review => (
              <div key={review.id} className="bg-secondary rounded-xl border border-border p-5 space-y-3">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-foreground">{review.reviewer_name}</p>
                      <Badge variant="outline" className="capitalize text-xs">{review.item_type}</Badge>
                      {review.approved
                        ? <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">Approved</Badge>
                        : <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 text-xs">Pending</Badge>
                      }
                    </div>
                    <p className="text-xs text-muted-foreground">{review.reviewer_email} &middot; Item #{review.item_id}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(review.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                  {/* Stars */}
                  <div className="flex gap-0.5">
                    {[1,2,3,4,5].map(s => (
                      <Star key={s} className={`w-4 h-4 ${s <= review.rating ? 'fill-accent text-accent' : 'text-muted-foreground/30'}`} />
                    ))}
                  </div>
                </div>

                {review.title && (
                  <p className="font-semibold text-foreground">{review.title}</p>
                )}
                <p className="text-sm text-muted-foreground leading-relaxed">{review.body}</p>

                {/* Actions */}
                <div className="flex gap-2 pt-1">
                  {!review.approved ? (
                    <Button
                      size="sm"
                      onClick={() => setApproved(review.id, true)}
                      disabled={saving === review.id}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      {saving === review.id
                        ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        : <><CheckCircle className="w-3.5 h-3.5 mr-1" />Approve</>
                      }
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setApproved(review.id, false)}
                      disabled={saving === review.id}
                      className="border-red-200 text-red-700 hover:bg-red-50"
                    >
                      {saving === review.id
                        ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        : <><XCircle className="w-3.5 h-3.5 mr-1" />Revoke</>
                      }
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
