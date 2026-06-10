'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Star, Loader2, CheckCircle } from 'lucide-react'

interface ReviewFormProps {
  itemId: string
  itemType: 'property' | 'car' | 'service'
  itemName: string
  bookingId?: string
}

export function ReviewForm({ itemId, itemType, itemName, bookingId }: ReviewFormProps) {
  const [rating,        setRating]        = useState(0)
  const [hoverRating,   setHoverRating]   = useState(0)
  const [title,         setTitle]         = useState('')
  const [body,          setBody]          = useState('')
  const [name,          setName]          = useState('')
  const [email,         setEmail]         = useState('')
  const [submitting,    setSubmitting]    = useState(false)
  const [success,       setSuccess]       = useState(false)
  const [error,         setError]         = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!rating)        return setError('Please select a star rating.')
    if (!name.trim())   return setError('Please enter your name.')
    if (!email.trim())  return setError('Please enter your email.')
    if (!body.trim())   return setError('Please write a review.')

    setSubmitting(true)

    const supabase = createClient()
    const { error: dbError } = await supabase.from('reviews').insert({
      item_id:        itemId,
      item_type:      itemType,
      reviewer_name:  name.trim(),
      reviewer_email: email.trim(),
      rating,
      title:          title.trim() || null,
      body:           body.trim(),
      booking_id:     bookingId ?? null,
      approved:       false,
    })

    if (dbError) {
      setError('Failed to submit review. Please try again.')
    } else {
      setSuccess(true)
    }
    setSubmitting(false)
  }

  if (success) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center space-y-2">
        <CheckCircle className="w-8 h-8 text-green-600 mx-auto" />
        <p className="font-semibold text-green-800">Review submitted!</p>
        <p className="text-sm text-green-700">Thank you for your feedback. It will appear after admin approval.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="card-luxury space-y-5">
      <div>
        <h3 className="text-xl font-serif font-bold text-foreground">Leave a Review</h3>
        <p className="text-sm text-muted-foreground mt-1">Share your experience at {itemName}.</p>
      </div>

      {/* Star rating */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Your Rating <span className="text-red-500">*</span></label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map(star => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="focus:outline-none"
            >
              <Star
                className={`w-8 h-8 transition-colors ${
                  star <= (hoverRating || rating)
                    ? 'fill-accent text-accent'
                    : 'text-muted-foreground/40'
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Reviewer info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Name <span className="text-red-500">*</span></label>
          <Input placeholder="Your name" value={name} onChange={e => setName(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Email <span className="text-red-500">*</span></label>
          <Input type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} />
        </div>
      </div>

      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Review Title</label>
        <Input placeholder="Summarise your experience (optional)" value={title} onChange={e => setTitle(e.target.value)} />
      </div>

      {/* Body */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Your Review <span className="text-red-500">*</span></label>
        <Textarea
          placeholder="Tell us about your stay…"
          value={body}
          onChange={e => setBody(e.target.value)}
          rows={4}
        />
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">{error}</p>
      )}

      <Button type="submit" disabled={submitting} className="w-full sm:w-auto">
        {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Submitting…</> : 'Submit Review'}
      </Button>
    </form>
  )
}
