'use client'

import { useNotifications } from '@/contexts/NotificationsContext'
import { NotificationToast } from './notification-toast'

export function NotificationContainer() {
  const { notifications, markAsRead } = useNotifications()

  return (
    <div className="fixed bottom-4 right-4 max-w-sm z-[9999] pointer-events-none">
      <div className="space-y-2 pointer-events-auto">
        {notifications.map((notification) => (
          <NotificationToast
            key={notification.id}
            notification={notification}
            onClose={() => markAsRead(notification.id)}
          />
        ))}
      </div>
    </div>
  )
}
