'use client'

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface Notification {
  id: string
  type: 'booking' | 'message'
  title: string
  message: string
  timestamp: Date
  read: boolean
  relatedId?: string
}

interface NotificationsContextType {
  notifications: Notification[]
  unreadCount: number
  bookingsPendingCount: number
  messagesUnreadCount: number
  markAsRead: (id: string) => void
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void
  clearNotifications: () => void
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined)

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [bookingsPendingCount, setBookingsPendingCount] = useState(0)
  const [messagesUnreadCount, setMessagesUnreadCount] = useState(0)

  const supabase = createClient()

  // Get user email on mount
  useEffect(() => {
    const getUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (user?.email) {
        setUserEmail(user.email)
      }
    }
    getUser()
  }, [supabase])

  // Subscribe to real-time booking updates
  useEffect(() => {
    if (!userEmail) return

    const channel = supabase
      .channel(`bookings-notifications:${userEmail}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'bookings',
          filter: `user_email=eq.${userEmail}`,
        },
        (payload) => {
          const booking = payload.new as any
          if (booking.status === 'confirmed') {
            addNotification({
              type: 'booking',
              title: 'Booking Confirmed!',
              message: `Your booking for ${booking.item_name} has been confirmed.`,
              relatedId: booking.id,
            })
          } else if (booking.status === 'rejected') {
            addNotification({
              type: 'booking',
              title: 'Booking Rejected',
              message: `Your booking for ${booking.item_name} was rejected. Please contact support.`,
              relatedId: booking.id,
            })
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userEmail, supabase])

  // Subscribe to real-time message updates
  useEffect(() => {
    if (!userEmail) return

    const channel = supabase
      .channel(`messages-notifications:${userEmail}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          const message = payload.new as any
          if (message.receiver_email === userEmail && message.sender_role === 'admin') {
            addNotification({
              type: 'message',
              title: 'New Message from Admin',
              message: message.message.substring(0, 50) + (message.message.length > 50 ? '...' : ''),
              relatedId: message.booking_id,
            })
            setMessagesUnreadCount((prev) => prev + 1)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userEmail, supabase])

  // Fetch pending bookings count
  useEffect(() => {
    if (!userEmail) return

    const fetchPendingCount = async () => {
      const { data, count } = await supabase
        .from('bookings')
        .select('id', { count: 'exact' })
        .eq('user_email', userEmail)
        .eq('status', 'pending')

      if (count) setBookingsPendingCount(count)
    }

    fetchPendingCount()

    // Subscribe to changes
    const channel = supabase
      .channel(`pending-bookings:${userEmail}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings',
          filter: `user_email=eq.${userEmail}`,
        },
        () => {
          fetchPendingCount()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userEmail, supabase])

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const id = Date.now().toString()
    setNotifications((prev) => [
      {
        id,
        ...notification,
        timestamp: new Date(),
        read: false,
      },
      ...prev,
    ])

    // Auto-remove after 5 seconds
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id))
    }, 5000)
  }, [])

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    )
  }, [])

  const clearNotifications = useCallback(() => {
    setNotifications([])
  }, [])

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        unreadCount,
        bookingsPendingCount,
        messagesUnreadCount,
        markAsRead,
        addNotification,
        clearNotifications,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationsContext)
  if (context === undefined) {
    throw new Error('useNotifications must be used within NotificationsProvider')
  }
  return context
}
