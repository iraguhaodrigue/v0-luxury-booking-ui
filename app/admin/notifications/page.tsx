'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { AdminSidebar } from '@/components/layouts/admin-sidebar'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2, Bell, BookOpen, MessageSquare, CheckCircle, XCircle, Mail } from 'lucide-react'

interface Notification {
  id: number
  booking_id?: number
  type: string
  title: string
  message?: string
  read_at?: string
  created_at: string
}

interface ContactMessage {
  id: string
  sender_name: string
  sender_email: string
  message: string
  admin_reply?: string
  read_by_admin: boolean
  created_at: string
}

interface BookingNotification {
  id: string
  user_name: string
  user_email: string
  item_type: string
  item_id: string
  total_price: number
  checkin: string
  checkout: string
  created_at: string
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [contactMessages, setContactMessages] = useState<ContactMessage[]>([])
  const [bookings, setBookings] = useState<BookingNotification[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetchNotifications()
    fetchContactMessages()
    fetchBookings()
    
    // Set up real-time subscription for messages
    const supabase = createClient()
    const messageSubscription = supabase
      .channel('messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        console.log('[v0] New contact message received:', payload)
        setContactMessages((prev) => [payload.new as ContactMessage, ...prev])
      })
      .subscribe()

    // Set up real-time subscription for bookings
    const bookingSubscription = supabase
      .channel('bookings')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'bookings' }, (payload) => {
        console.log('[v0] New booking received:', payload)
        setBookings((prev) => [payload.new as BookingNotification, ...prev])
      })
      .subscribe()

    const interval = setInterval(fetchNotifications, 5000)
    
    return () => {
      clearInterval(interval)
      messageSubscription.unsubscribe()
      bookingSubscription.unsubscribe()
    }
  }, [])

  const fetchNotifications = async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) return

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('admin_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      setNotifications(data || [])
    } catch (error) {
      console.error('[v0] Error fetching notifications:', error)
    }
  }

  const fetchContactMessages = async () => {
    try {
      console.log('[v0] Fetching contact messages')
      const supabase = createClient()
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('[v0] Error fetching messages:', error.message)
        return
      }

      setContactMessages(data || [])
    } catch (error) {
      console.error('[v0] Exception fetching messages:', error)
    }
  }

  const fetchBookings = async () => {
    try {
      console.log('[v0] Fetching bookings')
      const supabase = createClient()
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('[v0] Error fetching bookings:', error.message)
        return
      }

      setBookings(data || [])
    } catch (error) {
      console.error('[v0] Exception fetching bookings:', error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (notification: Notification) => {
    try {
      const supabase = createClient()

      const { error } = await supabase
        .from('notifications')
        .update({ read_at: new Date().toISOString() })
        .eq('id', notification.id)

      if (error) throw error

      setNotifications(notifications.map(n =>
        n.id === notification.id ? { ...n, read_at: new Date().toISOString() } : n
      ))
    } catch (error) {
      console.error('[v0] Error marking notification as read:', error)
    }
  }

  const markMessageAsRead = async (messageId: string) => {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('messages')
        .update({ read_by_admin: true })
        .eq('id', messageId)

      if (!error) {
        setContactMessages((prev) =>
          prev.map((m) => (m.id === messageId ? { ...m, read_by_admin: true } : m))
        )
      }
    } catch (error) {
      console.error('[v0] Error marking message as read:', error)
    }
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'new_booking':
        return <BookOpen className="w-5 h-5" />
      case 'booking_confirmed':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'booking_cancelled':
        return <XCircle className="w-5 h-5 text-red-600" />
      case 'message':
        return <MessageSquare className="w-5 h-5" />
      case 'contact':
        return <Mail className="w-5 h-5" />
      default:
        return <Bell className="w-5 h-5" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'new_booking':
        return 'bg-blue-100 text-blue-800'
      case 'booking_confirmed':
        return 'bg-green-100 text-green-800'
      case 'booking_cancelled':
        return 'bg-red-100 text-red-800'
      case 'message':
        return 'bg-purple-100 text-purple-800'
      case 'contact':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const unreadContactCount = contactMessages.filter(m => !m.read_by_admin).length
  const unreadNotificationCount = notifications.filter(n => !n.read_at).length
  const totalUnread = unreadContactCount + unreadNotificationCount

  // Combine all items for display
  const allItems = [
    ...contactMessages.map((msg) => ({
      id: msg.id,
      type: 'contact',
      title: `Message from ${msg.name}`,
      message: msg.message.substring(0, 100) + (msg.message.length > 100 ? '...' : ''),
      read_at: msg.read_by_admin ? new Date().toISOString() : undefined,
      created_at: msg.created_at,
      isContact: true,
      email: msg.email,
      fullMessage: msg.message,
    })),
    ...notifications.map((notif) => ({
      ...notif,
      isContact: false,
    })),
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  const filteredItems = allItems.filter((item: any) => {
    if (filter === 'all') return true
    if (filter === 'unread') return !item.read_at
    if (filter === 'bookings') return ['new_booking', 'booking_confirmed', 'booking_cancelled'].includes(item.type)
    if (filter === 'messages') return item.type === 'message' || item.type === 'contact'
    if (filter === 'contact') return item.type === 'contact'
    return true
  })

  return (
    <div className="flex min-h-screen flex-col md:flex-row bg-background">
      <AdminSidebar />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-serif font-bold text-foreground">Notifications & Messages</h1>
            <p className="text-muted-foreground mt-2">Bookings, messages, and contact inquiries</p>
          </div>

          <div className="flex gap-2 mb-8 flex-wrap">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              onClick={() => setFilter('all')}
              size="sm"
            >
              All ({allItems.length})
            </Button>
            <Button
              variant={filter === 'unread' ? 'default' : 'outline'}
              onClick={() => setFilter('unread')}
              size="sm"
            >
              Unread ({totalUnread})
            </Button>
            <Button
              variant={filter === 'bookings' ? 'default' : 'outline'}
              onClick={() => setFilter('bookings')}
              size="sm"
            >
              Bookings
            </Button>
            <Button
              variant={filter === 'contact' ? 'default' : 'outline'}
              onClick={() => setFilter('contact')}
              size="sm"
            >
              Contact ({unreadContactCount})
            </Button>
            <Button
              variant={filter === 'messages' ? 'default' : 'outline'}
              onClick={() => setFilter('messages')}
              size="sm"
            >
              Messages
            </Button>
          </div>

          <Card>
            <CardContent className="pt-6">
              {loading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : filteredItems.length === 0 ? (
                <p className="text-center py-12 text-muted-foreground">No notifications</p>
              ) : (
                <div className="space-y-3">
                  {filteredItems.map((item: any) => (
                    <div
                      key={`${item.isContact ? 'msg' : 'notif'}-${item.id}`}
                      className={`p-4 rounded-lg border flex items-start justify-between cursor-pointer transition-colors ${
                        item.read_at
                          ? 'bg-background border-input'
                          : 'bg-accent/5 border-accent'
                      }`}
                      onClick={() => {
                        if (item.isContact && !item.read_at) {
                          markMessageAsRead(item.id)
                        } else if (!item.isContact && !item.read_at) {
                          markAsRead(item)
                        }
                      }}
                    >
                      <div className="flex items-start gap-3 flex-1">
                        <div className="mt-1">{getIcon(item.type)}</div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-foreground">{item.title}</h3>
                            <Badge className={`text-xs ${getTypeColor(item.type)}`}>
                              {item.type.replace('_', ' ')}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{item.message}</p>
                          {item.email && (
                            <p className="text-xs text-muted-foreground mt-1">
                              <a href={`mailto:${item.email}`} className="text-accent hover:underline">
                                {item.email}
                              </a>
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(item.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      {!item.read_at && (
                        <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

