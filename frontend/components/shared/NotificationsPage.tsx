'use client'

import React, { useState, useEffect } from 'react'
import { Bell, CheckCircle, AlertCircle, Info, Clock } from 'lucide-react'
import toast from 'react-hot-toast'
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '@/lib/api/notifications'

interface Notification {
    _id: string
    title: string
    message: string
    type: 'success' | 'warning' | 'info' | 'error'
    isRead: boolean
    createdAt: string
}

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [loading, setLoading] = useState(true)

    const fetchNotifications = async () => {
        try {
            const token = localStorage.getItem('accessToken')
            if (!token) return

            const response = await getNotifications(token)
            if (response.success) {
                setNotifications(response.data)
            }
        } catch (error) {
            console.error('Error fetching notifications:', error)
            toast.error('Failed to load notifications')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchNotifications()
    }, [])

    const handleMarkAsRead = async (id: string) => {
        try {
            const token = localStorage.getItem('accessToken')
            if (!token) return

            await markNotificationAsRead(token, id)
            setNotifications(prev => prev.map(n =>
                n._id === id ? { ...n, isRead: true } : n
            ))
        } catch (error) {
            console.error('Error marking as read:', error)
        }
    }

    const handleMarkAllAsRead = async () => {
        try {
            const token = localStorage.getItem('accessToken')
            if (!token) return

            await markAllNotificationsAsRead(token)
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
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

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-400"></div>
            </div>
        )
    }

    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <Bell className="w-6 h-6 text-orange-500" />
                    <h1 className="text-2xl font-bold text-slate-800">Notifications</h1>
                </div>
                {notifications.some(n => !n.isRead) && (
                    <button
                        onClick={handleMarkAllAsRead}
                        className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-slate-600 hover:bg-gray-50 transition-colors shadow-sm"
                    >
                        Mark all as read
                    </button>
                )}
            </div>

            {/* List */}
            {notifications.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-200">
                    <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No notifications yet</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {notifications.map((notification) => (
                        <div
                            key={notification._id}
                            className={`relative bg-white border rounded-xl p-5 hover:shadow-md transition-shadow cursor-pointer ${notification.isRead ? 'border-gray-100' : 'border-orange-100 bg-orange-50/10'}`}
                            onClick={() => !notification.isRead && handleMarkAsRead(notification._id)}
                        >
                            <div className="flex gap-4">
                                {/* Icon based on type */}
                                <div className="flex-shrink-0 mt-1">
                                    {notification.type === 'success' && <CheckCircle className="w-5 h-5 text-green-500" />}
                                    {notification.type === 'warning' && <AlertCircle className="w-5 h-5 text-orange-500" />}
                                    {notification.type === 'info' && <Info className="w-5 h-5 text-blue-500" />}
                                    {notification.type === 'error' && <Clock className="w-5 h-5 text-red-500" />}
                                </div>

                                <div className="flex-1">
                                    <h3 className={`font-semibold text-slate-800 mb-1 ${!notification.isRead ? 'text-slate-900 group-hover:text-orange-600' : ''}`}>
                                        {notification.title}
                                    </h3>
                                    <p className="text-slate-500 text-sm mb-2">
                                        {notification.message}
                                    </p>
                                    <span className="text-xs text-slate-400">
                                        {getTimeAgo(notification.createdAt)}
                                    </span>
                                </div>

                                {/* Unread Indicator */}
                                {!notification.isRead && (
                                    <div className="absolute top-5 right-5 w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
