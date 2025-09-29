"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Bell, Clock, AlertTriangle, CheckCircle, X, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { formatDistanceToNow } from "date-fns"

interface Notification {
  id: string
  type: string
  title: string
  message: string
  taskId?: string
  isRead: boolean
  isSent: boolean
  sentAt?: string
  createdAt: string
  task?: {
    id: string
    title: string
    status: string
    dueDate?: string
  }
}

interface NotificationCenterProps {
  onNotificationClick?: (notification: Notification) => void
}

export function NotificationCenter({ onNotificationClick }: NotificationCenterProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  const fetchNotifications = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/notifications')
      if (response.ok) {
        const data = await response.json()
        setNotifications(data.notifications)
        setUnreadCount(data.unreadCount)
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      fetchNotifications()
    }
  }, [isOpen])

  const markAsRead = async (notificationIds: string[]) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notificationIds,
          action: 'markRead'
        })
      })

      if (response.ok) {
        setNotifications(prev => 
          prev.map(notification => 
            notificationIds.includes(notification.id)
              ? { ...notification, isRead: true }
              : notification
          )
        )
        setUnreadCount(prev => Math.max(0, prev - notificationIds.length))
      }
    } catch (error) {
      console.error('Failed to mark notifications as read:', error)
    }
  }

  const deleteNotification = async (notificationIds: string[]) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notificationIds,
          action: 'delete'
        })
      })

      if (response.ok) {
        setNotifications(prev => 
          prev.filter(notification => !notificationIds.includes(notification.id))
        )
        setUnreadCount(prev => Math.max(0, prev - notificationIds.filter(id => 
          !notifications.find(n => n.id === id)?.isRead
        ).length))
        toast.success('Notification deleted')
      }
    } catch (error) {
      console.error('Failed to delete notification:', error)
      toast.error('Failed to delete notification')
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'deadline_alert':
        return <Clock className="h-4 w-4 text-orange-500" />
      case 'overdue_task':
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case 'task_completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      default:
        return <Bell className="h-4 w-4 text-blue-500" />
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'deadline_alert':
        return 'border-l-orange-500 bg-orange-50'
      case 'overdue_task':
        return 'border-l-red-500 bg-red-50'
      case 'task_completed':
        return 'border-l-green-500 bg-green-50'
      default:
        return 'border-l-blue-500 bg-blue-50'
    }
  }

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsRead([notification.id])
    }
    
    if (onNotificationClick) {
      onNotificationClick(notification)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm"
          className="relative p-2 hover:bg-white/20 transition-colors"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[600px] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
            {unreadCount > 0 && (
              <Badge variant="secondary">{unreadCount} unread</Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            Stay updated with your task deadlines and progress.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No notifications yet</p>
              <p className="text-sm">You'll receive alerts for deadlines and task updates.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 rounded-lg border-l-4 transition-all cursor-pointer hover:shadow-md ${getNotificationColor(notification.type)} ${!notification.isRead ? 'ring-2 ring-blue-200' : ''}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      {getNotificationIcon(notification.type)}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm text-gray-900 truncate">
                          {notification.title}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                          {notification.message}
                        </p>
                        {notification.task && (
                          <div className="mt-2">
                            <Badge variant="outline" className="text-xs">
                              {notification.task.title}
                            </Badge>
                          </div>
                        )}
                        <p className="text-xs text-gray-500 mt-2">
                          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 ml-2">
                      {!notification.isRead && (
                        <div className="h-2 w-2 bg-blue-500 rounded-full" />
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteNotification([notification.id])
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {notifications.length > 0 && (
          <div className="flex justify-between items-center pt-4 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const unreadIds = notifications
                  .filter(n => !n.isRead)
                  .map(n => n.id)
                if (unreadIds.length > 0) {
                  markAsRead(unreadIds)
                }
              }}
              disabled={unreadCount === 0}
            >
              Mark all as read
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const allIds = notifications.map(n => n.id)
                deleteNotification(allIds)
              }}
            >
              Clear all
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
