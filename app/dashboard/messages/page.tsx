'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Navbar } from '@/components/layouts/navbar'
import { DashboardSidebar } from '@/components/layouts/dashboard-sidebar'
import { Footer } from '@/components/layouts/footer'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Loader2, Send, MessageSquare, Mail, Clock, CheckCheck, User as UserIcon, Building } from 'lucide-react'
import { useMessages } from '@/hooks/useMessages'
import { useNotifications } from '@/contexts/NotificationsContext'

interface DbMessage {
  id: string
  thread_id: string | null
  name: string
  sender_email: string
  message: string
  sender_role: 'customer' | 'admin'
  read_by_customer: boolean
  created_at: string
  booking_id?: string | null
}

interface Booking {
  id: string
  item_name: string
  item_type: string
  status: string
  checkin: string
  checkout: string
}

export default function CustomerMessagesPage() {
  const [bookings, setBookings]       = useState<Booking[]>([])
  const [selectedBooking, setSelectedBooking] = useState<string | null>(null)
  const [newMessage, setNewMessage]   = useState('')
  const [sending, setSending]         = useState(false)
  const [loading, setLoading]         = useState(true)
  const [userEmail, setUserEmail]     = useState<string | null>(null)
  const [showBookingsList, setShowBookingsList] = useState(false)
  const bottomRef                     = useRef<HTMLDivElement>(null)

  const supabase = createClient()
  const { addNotification } = useNotifications()
  
  // Use real-time messages hook
  const { messages, loading: messagesLoading, unreadCount } = useMessages(userEmail)

  useEffect(() => {
    checkUserAndLoad()
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, selectedBooking])

  const checkUserAndLoad = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user?.email) {
      setUserEmail(user.email)
      await Promise.all([
        loadMessages(user.email),
        loadBookings(user.email)
      ])
    }
    setLoading(false)
  }

  const loadMessages = async (email: string) => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('sender_email', email)
      .order('created_at', { ascending: true })

    if (!error && data) {
      setMessages(data as DbMessage[])
      
      // Mark unread admin messages as read
      const unreadIds = (data as DbMessage[])
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

  const loadBookings = async (email: string) => {
    const { data, error } = await supabase
      .from('bookings')
      .select('id, item_name, item_type, status, checkin, checkout')
      .eq('user_email', email)
      .order('created_at', { ascending: false })

    if (!error && data) {
      setBookings(data as Booking[])
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !userEmail) return
    setSending(true)

    const { data: { user } } = await supabase.auth.getUser()
    const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Customer'

    const { data, error } = await supabase
      .from('messages')
      .insert({
        name:           userName,
        sender_email:   userEmail,
        message:        newMessage.trim(),
        sender_role:    'customer',
        read_by_admin:  false,
        read_by_customer: true,
        booking_id:     selectedBooking,
      })
      .select()
      .single()

    if (!error && data) {
      setMessages(prev => [...prev, data as DbMessage])
      setNewMessage('')
    }

    setSending(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) sendMessage()
  }

  // Filter messages by selected booking (or show all if none selected)
  const filteredMessages = selectedBooking
    ? messages.filter(m => m.booking_id === selectedBooking || !m.booking_id)
    : messages

  const unreadCount = messages.filter(m => !m.read_by_customer && m.sender_role === 'admin').length

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

  if (!userEmail) {
    return (
      <main className="w-full min-h-screen flex flex-col">
        <Navbar />
        <div className="flex flex-1">
          <DashboardSidebar />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <h2 className="text-xl font-serif font-bold text-foreground mb-2">Sign in Required</h2>
              <p className="text-muted-foreground">Please sign in to view your messages.</p>
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
          <div className="border-b border-border px-6 py-4 flex items-center gap-3 bg-background justify-between md:justify-start">
            <div className="flex items-center gap-3">
              <MessageSquare className="w-5 h-5 text-accent" />
              <h1 className="text-xl font-serif font-bold text-foreground">Messages</h1>
              {unreadCount > 0 && (
                <Badge className="bg-accent text-accent-foreground">{unreadCount} new</Badge>
              )}
            </div>
            {/* Mobile toggle button */}
            <button
              onClick={() => setShowBookingsList(!showBookingsList)}
              className="md:hidden px-3 py-1 text-sm font-semibold text-accent hover:bg-secondary rounded-md transition-colors"
              aria-label={showBookingsList ? 'Hide bookings' : 'Show bookings'}
            >
              {showBookingsList ? '✕' : '☰ Bookings'}
            </button>
          </div>

          <div className="flex flex-1 overflow-hidden flex-col md:flex-row">
            {/* Bookings sidebar - Hidden on mobile, shown on desktop / Toggle on mobile */}
            <div className={`${showBookingsList ? 'flex' : 'hidden'} md:flex md:w-full md:max-w-xs border-r border-border flex-col overflow-hidden bg-secondary/30`}>
              <div className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide border-b border-border">
                Your Bookings
              </div>
              
              <div className="flex-1 overflow-y-auto">
                <button
                  onClick={() => setSelectedBooking(null)}
                  className={`w-full text-left px-4 py-3 border-b border-border/60 hover:bg-accent/5 transition-colors ${
                    !selectedBooking ? 'bg-accent/10 border-l-2 border-l-accent' : ''
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-accent" />
                    <span className="font-semibold text-sm text-foreground">All Messages</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">General inquiries</p>
                </button>

                {bookings.map(booking => (
                  <button
                    key={booking.id}
                    onClick={() => setSelectedBooking(booking.id)}
                    className={`w-full text-left px-4 py-3 border-b border-border/60 hover:bg-accent/5 transition-colors ${
                      selectedBooking === booking.id ? 'bg-accent/10 border-l-2 border-l-accent' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <span className="font-semibold text-sm text-foreground truncate">{booking.item_name}</span>
                      <Badge variant={booking.status === 'confirmed' ? 'default' : 'secondary'} className="text-xs flex-shrink-0">
                        {booking.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground capitalize">{booking.item_type}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(booking.checkin).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      {booking.checkout !== booking.checkin && (
                        <> - {new Date(booking.checkout).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</>
                      )}
                    </p>
                  </button>
                ))}

                {bookings.length === 0 && (
                  <div className="px-4 py-8 text-center">
                    <Building className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground">No bookings yet</p>
                  </div>
                )}
              </div>
            </div>

            {/* Chat area */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
                {filteredMessages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
                    <MessageSquare className="w-12 h-12 text-muted-foreground/30" />
                    <div>
                      <p className="text-muted-foreground font-medium">No messages yet</p>
                      <p className="text-sm text-muted-foreground">Send a message to get help from our support team</p>
                    </div>
                  </div>
                ) : (
                  filteredMessages.map(msg => {
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
                          <div className={`flex items-center justify-end gap-1 mt-1 ${isCustomer ? 'text-accent-foreground/70' : 'text-muted-foreground'}`}>
                            <span className="text-xs">
                              {new Date(msg.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {isCustomer && <CheckCheck className="w-3 h-3" />}
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
      </div>

      <Footer />
    </main>
  )
}
