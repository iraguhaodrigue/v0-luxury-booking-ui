'use client'

import { useEffect, useState } from 'react'
import { X, CheckCircle, AlertCircle, Mail, Calendar } from 'lucide-react'
import type { Notification } from '@/contexts/NotificationsContext'

interface NotificationToastProps {
  notification: Notification
  onClose: (id: string) => void
}

export function NotificationToast({ notification, onClose }: NotificationToastProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(() => onClose(notification.id), 300)
    }, 5000)

    return () => clearTimeout(timer)
  }, [notification.id, onClose])

  const bgColor = notification.type === 'booking' 
    ? 'bg-blue-50 border-blue-200'
    : 'bg-green-50 border-green-200'

  const iconBg = notification.type === 'booking'
    ? 'bg-blue-100'
    : 'bg-green-100'

  const icon = notification.type === 'booking' ? Calendar : Mail

  const Icon = icon

  return (
    <div
      className={`${bgColor} border rounded-lg shadow-luxury-md p-4 mb-3 transition-all duration-300 transform flex items-start gap-3 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
      }`}
    >
      <div className={`${iconBg} rounded-full p-2 flex-shrink-0`}>
        <Icon className={`w-5 h-5 ${notification.type === 'booking' ? 'text-blue-600' : 'text-green-600'}`} />
      </div>

      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-foreground text-sm">{notification.title}</h4>
        <p className="text-muted-foreground text-sm mt-1 break-words">{notification.message}</p>
        <p className="text-xs text-muted-foreground mt-2">
          {new Date(notification.timestamp).toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </p>
      </div>

      <button
        onClick={() => {
          setIsVisible(false)
          setTimeout(() => onClose(notification.id), 300)
        }}
        className="flex-shrink-0 p-1 hover:bg-black/5 rounded transition-colors"
        aria-label="Dismiss notification"
      >
        <X className="w-4 h-4 text-muted-foreground" />
      </button>
    </div>
  )
}
