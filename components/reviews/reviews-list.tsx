'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Star, User } from 'lucide-react'

interface Review {
  id: string
  reviewer_name: string
  rating: number
  title: string | null
  body: string
  created_at: string
}

interface ReviewsListProps {
  itemId: string
  itemType: 'property' | 'car' | 'service'
}

export function ReviewsList({ itemId, itemType }: ReviewsListProps) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('reviews')
      .select('id,reviewer_name,rating,title,body,created_at')
      .eq('item_id', itemId)
      .eq('item_type', itemType)
      .eq('approved', true)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setReviews((data ?? []) as Review[])
        setLoading(false)
      })
  }, [itemId, itemType])

  if (loading) return null
  if (reviews.length === 0) return (
    <p className="text-sm text-muted-foreground italic">No reviews yet. Be the first to leave one.</p>
  )

  const avgRating = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="flex items-center gap-3 pb-2 border-b border-border">
        <span className="text-3xl font-bold text-foreground">{avgRating.toFixed(1)}</span>
        <div>
          <div className="flex gap-0.5">
            {[1,2,3,4,5].map(s => (
              <Star key={s} className={`w-4 h-4 ${s <= Math.round(avgRating) ? 'fill-accent text-accent' : 'text-muted-foreground/30'}`} />
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">{reviews.length} review{reviews.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* Individual reviews */}
      {reviews.map(r => (
        <div key={r.id} className="space-y-2 pb-4 border-b border-border last:border-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-accent" />
              </div>
              <div>
                <p className="font-semibold text-sm text-foreground">{r.reviewer_name}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(r.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </p>
              </div>
            </div>
            <div className="flex gap-0.5 flex-shrink-0">
              {[1,2,3,4,5].map(s => (
                <Star key={s} className={`w-3.5 h-3.5 ${s <= r.rating ? 'fill-accent text-accent' : 'text-muted-foreground/30'}`} />
              ))}
            </div>
          </div>
          {r.title && <p className="font-semibold text-sm text-foreground">{r.title}</p>}
          <p className="text-sm text-muted-foreground leading-relaxed">{r.body}</p>
        </div>
      ))}
    </div>
  )
}
