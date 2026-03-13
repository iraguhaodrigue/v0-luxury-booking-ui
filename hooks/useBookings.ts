'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { RealtimeChannel } from '@supabase/supabase-js'

export interface Booking {
  id: string
  item_id: string
  item_type: 'property' | 'car' | 'service'
  item_name: string
  user_name: string
  user_email: string
  user_phone: string
  guests: number
  checkin: string
  checkout: string
  total_price: string
  payment_method: string
  status: 'pending' | 'confirmed' | 'rejected' | 'completed'
  admin_comment: string | null
  confirmed_at: string | null
  created_at: string
  extras: Record<string, unknown>
}

export function useBookings(userEmail: string | null) {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()
  let channel: RealtimeChannel | null = null

  // Initial load
  useEffect(() => {
    if (!userEmail) {
      setLoading(false)
      return
    }

    const fetchBookings = async () => {
      try {
        setLoading(true)
        const { data, error: fetchError } = await supabase
          .from('bookings')
          .select('*')
          .eq('user_email', userEmail)
          .order('created_at', { ascending: false })

        if (fetchError) throw fetchError
        setBookings(data || [])
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch bookings')
      } finally {
        setLoading(false)
      }
    }

    fetchBookings()

    // Subscribe to real-time changes
    channel = supabase
      .channel(`bookings:${userEmail}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings',
          filter: `user_email=eq.${userEmail}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setBookings((prev) => [payload.new as Booking, ...prev])
          } else if (payload.eventType === 'UPDATE') {
            setBookings((prev) =>
              prev.map((b) => (b.id === payload.new.id ? (payload.new as Booking) : b))
            )
          } else if (payload.eventType === 'DELETE') {
            setBookings((prev) => prev.filter((b) => b.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    return () => {
      if (channel) {
        supabase.removeChannel(channel)
      }
    }
  }, [userEmail, supabase])

  return { bookings, loading, error }
}
