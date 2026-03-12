'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Navbar } from '@/components/layouts/navbar'
import { DashboardSidebar } from '@/components/layouts/dashboard-sidebar'
import { Footer } from '@/components/layouts/footer'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Loader2, Send, ArrowLeft, Calendar } from 'lucide-react'
import Link from 'next/link'

interface Message {
  id: string
  message: string
  sender_role: 'customer' | 'admin'
  created_at: string
  sender_email?: string
  name?: string
}

interface Booking {
  id: string
  item_name: string
  checkin: string
  checkout: string
  status: string
}

export default function MessageThreadPage() {
  const params = useParams()
  const bookingId = params.booking_id as string

  const [messages, setMessages] = useState<Message[]>([])
  const [booking, setBooking] = useState<Booking | null>(null)
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  const supabase = createClient()

  useEffect(() => {
    loadThreadData()
  }, [bookingId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const loadThreadData = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()

    if (user?.email) {
      setUserEmail(user.email)

      // Fetch booking
      const { data: bookingData } = await supabase
        .from('bookings')
        .select('*')
        .eq('id', bookingId)
        .eq('user_email', user.email)
        .single()

      if (bookingData) {
        setBooking(bookingData as Booking)
      }

      // Fetch messages for this booking
      const { data: messagesData } = await supabase
        .from('messages')
        .select('*')
        .eq('booking_id', bookingId)
        .eq('sender_email', user.email)
        .order('created_at', { ascending: true })

      if (messagesData) {
        setMessages(messagesData as Message[])

        // Mark unread admin messages as read
        const unreadIds = (messagesData as Message[])
          .filter(m => !m.read_by_customer && m.sender_role === 'admin')
          .map(m => m.id)

        if (unreadIds.length > 0) {
          await supabase
            .from('messages')
            .update({ read_by_customer: true })
            .in('id', unreadIds)
        }
      }
    }

    setLoading(false)
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !userEmail) return

    setSending(true)

    const { data: { user } } = await supabase.auth.getUser()
    const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Customer'

    const { data, error } = await supabase
      .from('messages')
      .insert({
        name: userName,
        sender_email: userEmail,
        message: newMessage.trim(),
        sender_role: 'customer',
        read_by_admin: false,
        read_by_customer: true,
        booking_id: bookingId,
      })
      .select()
      .single()

    if (!error && data) {
      setMessages(prev => [...prev, data as Message])
      setNewMessage('')
    }

    setSending(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) sendMessage()
  }

  if (loading) {
    return (
      <main className="w-full min-h-screen flex flex-col">
        <Navbar />
        <div className="flex flex-1 items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
        <Footer />
      </main>
    )
  }

  if (!booking) {
    return (
      <main className="w-full min-h-screen flex flex-col">
        <Navbar />
        <div className="flex flex-1">
          <DashboardSidebar />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <p className="text-muted-foreground">Booking not found.</p>
              <Link href="/dashboard/messages">
                <button className="text-accent hover:underline mt-2">Back to Messages</button>
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </main>
    )
  }

  return (
    <main className="w-full min-h-screen flex flex-col">
      <Navbar />

      <div className="flex flex-1">
        <DashboardSidebar />

        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="border-b border-border px-6 py-4 bg-background">
            <Link href="/dashboard/messages">
              <button className="flex items-center gap-2 text-accent hover:text-accent/80 mb-2 font-semibold text-sm">
                <ArrowLeft className="w-4 h-4" />
                Back to Messages
              </button>
            </Link>
            <div>
              <h1 className="text-2xl font-serif font-bold text-foreground">
                {booking.item_name}
              </h1>
              <div className="flex items-center gap-2 text-muted-foreground text-sm mt-1">
                <Calendar className="w-4 h-4" />
                <span>
                  {new Date(booking.checkin).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })} - {new Date(booking.checkout).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
                <span className="px-2 py-1 rounded-full text-xs bg-secondary capitalize">
                  {booking.status}
                </span>
              </div>
            </div>
          </div>

          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
                  <p className="text-muted-foreground font-medium">No messages yet</p>
                  <p className="text-sm text-muted-foreground">Start a conversation with our support team</p>
                </div>
              ) : (
                messages.map(msg => {
                  const isCustomer = msg.sender_role === 'customer'
                  return (
                    <div key={msg.id} className={`flex ${isCustomer ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                        isCustomer
                          ? 'bg-accent text-accent-foreground rounded-br-sm'
                          : 'bg-secondary text-foreground rounded-bl-sm border border-border'
                      }`}>
                        {!isCustomer && (
                          <p className="text-xs font-semibold mb-1 text-accent">Support Team</p>
                        )}
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                        <div className={`flex items-center justify-end gap-1 mt-1 text-xs ${
                          isCustomer ? 'text-accent-foreground/70' : 'text-muted-foreground'
                        }`}>
                          {new Date(msg.created_at).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
              <div ref={bottomRef} />
            </div>

            {/* Message input */}
            <div className="border-t border-border px-6 py-4 bg-background">
              <div className="flex gap-3 items-end">
                <Textarea
                  placeholder="Type your message... (Ctrl+Enter to send)"
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  rows={2}
                  className="flex-1 resize-none"
                />
                <Button
                  onClick={sendMessage}
                  disabled={sending || !newMessage.trim()}
                  className="h-10 px-4"
                >
                  {sending
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : <Send className="w-4 h-4" />
                  }
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Our support team typically responds within 24 hours.
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
