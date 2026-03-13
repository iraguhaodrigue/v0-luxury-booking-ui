'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { RealtimeChannel } from '@supabase/supabase-js'

export interface Message {
  id: string
  booking_id: string
  name: string
  sender_email: string
  message: string
  sender_role: 'customer' | 'admin'
  read_by_admin: boolean
  read_by_customer: boolean
  created_at: string
}

export function useMessages(userEmail: string | null) {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [unreadCount, setUnreadCount] = useState(0)

  const supabase = createClient()
  let channel: RealtimeChannel | null = null

  // Initial load
  useEffect(() => {
    if (!userEmail) {
      setLoading(false)
      return
    }

    const fetchMessages = async () => {
      try {
        setLoading(true)
        const { data, error: fetchError } = await supabase
          .from('messages')
          .select('*')
          .or(`sender_email.eq.${userEmail},receiver_email.eq.${userEmail}`)
          .order('created_at', { ascending: false })

        if (fetchError) throw fetchError
        
        const allMessages = data || []
        setMessages(allMessages)
        
        // Count unread messages (from admin to customer)
        const unread = allMessages.filter(
          (msg) => msg.sender_role === 'admin' && msg.receiver_email === userEmail && !msg.read_by_customer
        ).length
        setUnreadCount(unread)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch messages')
      } finally {
        setLoading(false)
      }
    }

    fetchMessages()

    // Subscribe to real-time changes
    channel = supabase
      .channel(`messages:${userEmail}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newMsg = payload.new as Message
            // Only add if relevant to this user
            if (newMsg.sender_email === userEmail || newMsg.receiver_email === userEmail) {
              setMessages((prev) => [newMsg, ...prev])
              
              // Increment unread if it's from admin to this customer
              if (newMsg.sender_role === 'admin' && newMsg.receiver_email === userEmail && !newMsg.read_by_customer) {
                setUnreadCount((prev) => prev + 1)
              }
            }
          } else if (payload.eventType === 'UPDATE') {
            const updatedMsg = payload.new as Message
            setMessages((prev) =>
              prev.map((m) => (m.id === updatedMsg.id ? updatedMsg : m))
            )
            
            // Update unread count if read status changed
            const oldMsg = payload.old as Message
            if (oldMsg.read_by_customer === false && updatedMsg.read_by_customer === true) {
              setUnreadCount((prev) => Math.max(0, prev - 1))
            }
          } else if (payload.eventType === 'DELETE') {
            setMessages((prev) => prev.filter((m) => m.id !== payload.old.id))
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

  return { messages, loading, error, unreadCount }
}
