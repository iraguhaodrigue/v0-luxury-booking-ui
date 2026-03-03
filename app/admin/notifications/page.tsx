'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { AdminSidebar } from '@/components/layouts/admin-sidebar'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2, Bell, BookOpen, MessageSquare, CheckCircle, XCircle } from 'lucide-react'

interface Notification {
  id: number
  booking_id?: number
  type: string
  title: string
  message?: string
  read_at?: string
  created_at: string
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 5000)
    return () => clearInterval(interval)
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
      console.error('Error fetching notifications:', error)
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
      console.error('Error marking notification as read:', error)
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
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.read_at
    if (filter === 'bookings') return ['new_booking', 'booking_confirmed', 'booking_cancelled'].includes(n.type)
    if (filter === 'messages') return n.type === 'message'
    return true
  })

  return (
    <div className="flex min-h-screen flex-col md:flex-row bg-background">
      <AdminSidebar />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-serif font-bold text-foreground">Notifications</h1>
            <p className="text-muted-foreground mt-2">Booking and message alerts</p>
          </div>

          <div className="flex gap-2 mb-8 flex-wrap">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              onClick={() => setFilter('all')}
              size="sm"
            >
              All ({notifications.length})
            </Button>
            <Button
              variant={filter === 'unread' ? 'default' : 'outline'}
              onClick={() => setFilter('unread')}
              size="sm"
            >
              Unread ({notifications.filter(n => !n.read_at).length})
            </Button>
            <Button
              variant={filter === 'bookings' ? 'default' : 'outline'}
              onClick={() => setFilter('bookings')}
              size="sm"
            >
              Bookings
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
              ) : filteredNotifications.length === 0 ? (
                <p className="text-center py-12 text-muted-foreground">No notifications</p>
              ) : (
                <div className="space-y-3">
                  {filteredNotifications.map(notif => (
                    <div
                      key={notif.id}
                      className={`p-4 rounded-lg border flex items-start justify-between cursor-pointer transition-colors ${
                        notif.read_at
                          ? 'bg-background border-input'
                          : 'bg-accent/5 border-accent'
                      }`}
                      onClick={() => !notif.read_at && markAsRead(notif)}
                    >
                      <div className="flex items-start gap-3 flex-1">
                        <div className="mt-1">{getIcon(notif.type)}</div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-foreground">{notif.title}</h3>
                            <Badge className={`text-xs ${getTypeColor(notif.type)}`}>
                              {notif.type.replace('_', ' ')}
                            </Badge>
                          </div>
                          {notif.message && <p className="text-sm text-muted-foreground">{notif.message}</p>}
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(notif.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      {!notif.read_at && (
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
