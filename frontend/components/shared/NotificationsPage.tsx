'use client'

import React from 'react'
import { Bell, CheckCircle, AlertCircle, Info, Clock } from 'lucide-react'
import toast from 'react-hot-toast'
import { useNotifications } from '@/components/providers/NotificationProvider'

export default function NotificationsPage() {
    const { notifications, isLoading, markAsRead, markAllAsRead } = useNotifications()

    const handleMarkAllAsRead = async () => {
        try {
            await markAllAsRead()
            toast.success('All marked as read')
        } catch (error) {
            console.error('Error marking all as read:', error)
            toast.error('Failed to mark all as read')
        }
    }

    const getTimeAgo = (dateString: string) => {
        const date = new Date(dateString)
        const now = new Date()
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

        if (diffInSeconds < 60) return 'Just now'
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
        return `${Math.floor(diffInSeconds / 86400)}d ago`
    }

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'success': return 'bg-green-50 border-green-100'
            case 'warning': return 'bg-amber-50 border-amber-100'
            case 'error': return 'bg-red-50 border-red-100'
            default: return 'bg-blue-50/30 border-blue-100'
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FACE39]"></div>
            </div>
        )
    }

    const unreadCount = notifications.filter(n => !n.isRead).length

    return (
        <div className="max-w-3xl mx-auto">
            {/* Page Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        {unreadCount > 0 ? (
                            <span className="text-red-500 font-medium">{unreadCount} unread</span>
                        ) : 'All caught up!'}
                    </p>
                </div>
                {unreadCount > 0 && (
                    <button
                        onClick={handleMarkAllAsRead}
                        className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
                    >
                        Mark all as read
                    </button>
                )}
            </div>

            {/* List */}
            {notifications.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Bell className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 font-medium">No notifications yet</p>
                    <p className="text-gray-400 text-sm mt-1">You&apos;re all caught up!</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {notifications.map((notification) => (
                        <div
                            key={notification._id}
                            onClick={() => !notification.isRead && markAsRead(notification._id)}
                            className={`relative bg-white border rounded-xl p-5 cursor-pointer group transition-all hover:shadow-md ${
                                notification.isRead
                                    ? 'border-gray-100 opacity-70'
                                    : `border-l-4 ${
                                        notification.type === 'success' ? 'border-l-green-500' :
                                        notification.type === 'warning' ? 'border-l-amber-500' :
                                        notification.type === 'error' ? 'border-l-red-500' :
                                        'border-l-blue-500'
                                    } border-gray-100`
                            }`}
                        >
                            <div className="flex gap-4 items-start">
                                {/* Icon */}
                                <div className={`flex-shrink-0 p-2 rounded-lg ${
                                    notification.type === 'success' ? 'bg-green-100' :
                                    notification.type === 'warning' ? 'bg-amber-100' :
                                    notification.type === 'error' ? 'bg-red-100' :
                                    'bg-blue-100'
                                }`}>
                                    {notification.type === 'success' && <CheckCircle className="w-4 h-4 text-green-600" />}
                                    {notification.type === 'warning' && <AlertCircle className="w-4 h-4 text-amber-600" />}
                                    {notification.type === 'info' && <Info className="w-4 h-4 text-blue-600" />}
                                    {notification.type === 'error' && <AlertCircle className="w-4 h-4 text-red-600" />}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className={`font-semibold text-sm ${
                                            notification.isRead ? 'text-gray-600' : 'text-gray-900'
                                        }`}>
                                            {notification.title}
                                        </h3>
                                        {!notification.isRead && (
                                            <span className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0 animate-pulse" />
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-500 mb-2">{notification.message}</p>
                                    <span className="text-xs text-gray-400 flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {getTimeAgo(notification.createdAt)}
                                    </span>
                                </div>

                                {!notification.isRead && (
                                    <span className="text-xs text-blue-600 font-medium group-hover:underline flex-shrink-0">
                                        Mark read
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
