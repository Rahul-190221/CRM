'use client'

import { useState } from 'react'
import { Bell, CheckCircle, AlertCircle, Info, X } from 'lucide-react'

interface Notification {
  id: string
  type: 'success' | 'warning' | 'info'
  title: string
  message: string
  timestamp: string
  isRead: boolean
}

// Mock notifications data - In production, this would come from an API
const initialNotifications: Notification[] = [
  {
    id: '1',
    type: 'success',
    title: 'Lead Converted',
    message: 'John Doe has been successfully converted to a customer',
    timestamp: '5 minutes ago',
    isRead: false
  },
  {
    id: '2',
    type: 'warning',
    title: 'Follow-up Reminder',
    message: 'You have 3 leads pending follow-up today',
    timestamp: '1 hour ago',
    isRead: false
  },
  {
    id: '3',
    type: 'info',
    title: 'New Lead Assigned',
    message: 'A new lead "Jane Smith" has been assigned to you',
    timestamp: '2 hours ago',
    isRead: true
  },
  {
    id: '4',
    type: 'success',
    title: 'Report Generated',
    message: 'Your monthly BDM report is ready for download',
    timestamp: '3 hours ago',
    isRead: true
  },
  {
    id: '5',
    type: 'warning',
    title: 'Deadline Approaching',
    message: 'Course enrollment deadline is in 2 days',
    timestamp: '5 hours ago',
    isRead: true
  }
]

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications)

  const unreadCount = notifications.filter(n => !n.isRead).length

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, isRead: true })))
  }

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(n =>
      n.id === id ? { ...n, isRead: true } : n
    ))
  }

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id))
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-red-500" />
      case 'info':
      default:
        return <Info className="w-5 h-5 text-blue-500" />
    }
  }

  const getBorderColor = (notification: Notification) => {
    if (!notification.isRead) {
      return 'border-l-4 border-l-yellow-400 bg-yellow-50'
    }
    return 'border-l-4 border-l-transparent bg-white'
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-yellow-100 rounded-lg">
            <Bell className="w-6 h-6 text-yellow-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-xs font-medium px-2 py-1 rounded-full">
              {unreadCount} new
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Mark all as read
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No notifications</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`relative p-4 rounded-lg shadow-sm border border-gray-200 transition-all hover:shadow-md ${getBorderColor(notification)}`}
              onClick={() => markAsRead(notification.id)}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-0.5">
                  {getIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-gray-900">
                      {notification.title}
                    </h3>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteNotification(notification.id)
                      }}
                      className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {notification.message}
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    {notification.timestamp}
                  </p>
                </div>
                {!notification.isRead && (
                  <div className="absolute top-4 right-12">
                    <span className="w-2 h-2 bg-red-500 rounded-full block"></span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
