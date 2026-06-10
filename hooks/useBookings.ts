'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

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
  updated_at: string
  extras: Record<string, unknown> | null
  auth_user_id: string | null
  room_id: number | null
  room_name: string | null
  booking_subtype: 'full_property' | 'room' | null
}

/**
 * Fetches all bookings that belong to the current user.
 *
 * Strategy (union approach):
 *  1. Rows matched by auth_user_id  (new bookings made while logged in)
 *  2. Rows matched by user_email where auth_user_id IS NULL  (legacy / guest bookings)
 *
 * This ensures customers see every booking they ever made regardless of
 * whether auth_user_id was populated.
 */
export function useBookings(userId: string | null, userEmail: string | null) {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState<string | null>(null)

  const supabase = createClient()

  const fetchBookings = async () => {
    if (!userId && !userEmail) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const promises: Promise<Booking[]>[] = []

      // 1. By auth_user_id
      if (userId) {
        promises.push(
          supabase
            .from('bookings')
            .select('*')
            .eq('auth_user_id', userId)
            .order('created_at', { ascending: false })
            .then(({ data, error }) => {
              if (error) throw error
              return (data ?? []) as Booking[]
            })
        )
      }

      // 2. By email (only rows without auth_user_id to avoid duplicates)
      if (userEmail) {
        promises.push(
          supabase
            .from('bookings')
            .select('*')
            .eq('user_email', userEmail)
            .is('auth_user_id', null)
            .order('created_at', { ascending: false })
            .then(({ data, error }) => {
              if (error) throw error
              return (data ?? []) as Booking[]
            })
        )
      }

      const results = await Promise.all(promises)
      const merged  = results.flat()

      // Deduplicate by id and sort newest first
      const seen = new Set<string>()
      const unique = merged.filter((b) => {
        if (seen.has(b.id)) return false
        seen.add(b.id)
        return true
      })
      unique.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

      setBookings(unique)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch bookings')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBookings()

    if (!userId && !userEmail) return

    // Real-time subscription keyed on auth_user_id when available, else email
    const channelName = userId ? `bookings:uid:${userId}` : `bookings:email:${userEmail}`

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bookings' },
        (payload) => {
          const row = (payload.new ?? payload.old) as Booking
          const belongsToUser =
            (userId    && row.auth_user_id === userId) ||
            (userEmail && row.user_email   === userEmail)

          if (!belongsToUser) return

          if (payload.eventType === 'INSERT') {
            setBookings((prev) => {
              if (prev.some((b) => b.id === row.id)) return prev
              return [row, ...prev]
            })
          } else if (payload.eventType === 'UPDATE') {
            setBookings((prev) =>
              prev.map((b) => (b.id === row.id ? (payload.new as Booking) : b))
            )
          } else if (payload.eventType === 'DELETE') {
            setBookings((prev) => prev.filter((b) => b.id !== (payload.old as Booking).id))
          }
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [userId, userEmail])

  return { bookings, loading, error, refetch: fetchBookings }
}
