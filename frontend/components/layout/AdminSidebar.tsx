'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import {
    LayoutDashboard,
    Users,
    Briefcase,
    Activity,
    LogOut,
    ChevronDown,
    GraduationCap,
    ClipboardCheck,
    FileBadge,
    Bell,
    UserPlus,
    UserX,
    Shield,
    FileText,
    Send,
    UserCircle,
    Target
} from 'lucide-react'
import type { Page } from '@/types/navigation'
import { getNotifications } from '@/lib/api/notifications'
import { useSocket } from '@/components/providers/SocketProvider'
import Cookies from 'js-cookie'

interface AdminSidebarProps {
    activePage: Page
    setActivePage: (page: Page) => void
    onLogout: () => void
}

export default function AdminSidebar({ activePage, setActivePage, onLogout }: AdminSidebarProps) {
    const [isServicesOpen, setIsServicesOpen] = useState(false)
    const [isBDMManagementOpen, setIsBDMManagementOpen] = useState(false)
    const [unreadCount, setUnreadCount] = useState(0)

    const socketService = useSocket()

    useEffect(() => {
        const fetchUnreadCount = async () => {
            const token = Cookies.get('token') || localStorage.getItem('token')
            if (token) {
                try {
                    const res = await getNotifications(token)
                    const count = res.data?.filter((n: any) => !n.isRead).length || 0
                    setUnreadCount(count)
                } catch (error) {
                    console.error("Failed to fetch notification count", error)
                }
            }
        }
        fetchUnreadCount()
    }, [])

    useEffect(() => {
        if (socketService?.socket) {
            const handleNewNotification = () => {
                setUnreadCount(prev => prev + 1)
            }
            socketService.socket.on('new-notification', handleNewNotification)
            return () => {
                socketService.socket?.off('new-notification', handleNewNotification)
            }
        }
    }, [socketService?.socket])

    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    ]

    const servicesItems = [
        { id: 'course-details', label: 'Course Details', icon: GraduationCap },
        { id: 'mock-test', label: 'Mock Test', icon: ClipboardCheck },
        { id: 'exam-reg', label: 'Exam Reg', icon: FileBadge },
    ]

    const bdmManagementItems = [
        { id: 'bdm-add', label: 'BDM Add', icon: UserPlus },
        { id: 'bdm-remove', label: 'BDM Remove', icon: UserX },
        { id: 'bdm-role', label: 'BDM Role M', icon: Shield },
        { id: 'bdm-activity', label: 'BDM Activity', icon: Activity },
        { id: 'bdm-report', label: 'BDM Report', icon: FileText },
        { id: 'lead-assignments', label: 'Lead Assignments', icon: Send },
    ]

    const NavItem = ({ item, isSub = false }: { item: any, isSub?: boolean }) => {
        const Icon = item.icon
        const isActive = activePage === item.id
        return (
            <button
                onClick={() => setActivePage(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-2 my-0.5 rounded-lg transition-all duration-200 ${isActive
                    ? 'bg-[#FACE39] text-[#00000F] font-semibold'
                    : 'text-[#00000F]/60 hover:bg-[#FACE39]/10 hover:text-[#00000F]'
                    } ${isSub ? 'pl-9 text-xs' : 'text-sm font-medium'}`}
            >
                <Icon className={`${isSub ? 'w-4 h-4' : 'w-5 h-5'}`} />
                <span>{item.label}</span>
            </button>
        )
    }

    return (
        <div className="w-64 flex-shrink-0 bg-white border-r border-gray-100 flex flex-col h-screen overflow-hidden text-[#00000F]">
            {/* Logo Section */}
            <div className="p-5">
                <div className="p-4 border-b border-gray-100 bg-white">
                    <div className="flex items-center gap-3">
                        <img src="/assets/logo.png" alt="Luminedge logo" className="w-36 h-auto bg-white object-contain rounded-md" />

                    </div>
                </div>
            </div>

            {/* Navigation */}
            <div className="flex-1 px-3 overflow-y-auto py-2 scrollbar-hide">
                <NavItem item={menuItems[0]} />

                {/* Services Section */}
                <div className="mt-2">
                    <button
                        onClick={() => setIsServicesOpen(!isServicesOpen)}
                        className={`w-full flex items-center justify-between px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isServicesOpen ? 'text-[#00000F]' : 'text-[#00000F]/60 hover:bg-[#FACE39]/10 hover:text-[#00000F]'}`}
                    >
                        <div className="flex items-center gap-3">
                            <Briefcase className="w-5 h-5" />
                            <span>Services</span>
                        </div>
                        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isServicesOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {isServicesOpen && (
                        <div className="mt-1 space-y-0.5">
                            {servicesItems.map(item => <NavItem key={item.id} item={item} isSub />)}
                        </div>
                    )}
                </div>

                <div className="mt-2">
                    <button
                        onClick={() => setActivePage('lead-center')}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 my-0.5 rounded-lg text-sm font-medium transition-all duration-200 ${activePage === 'lead-center' ? 'bg-[#FACE39] text-[#00000F] font-bold shadow-sm' : 'text-[#00000F]/60 hover:bg-[#FACE39]/10 hover:text-[#00000F]'}`}
                    >
                        <Users className="w-5 h-5" />
                        <span>Lead Center</span>
                    </button>
                </div>

                <div className="mt-1">
                    <button
                        onClick={() => setActivePage('lead-stage')}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 my-0.5 rounded-lg text-sm font-medium transition-all duration-200 ${activePage === 'lead-stage' ? 'bg-[#FACE39] text-[#00000F] font-bold shadow-sm' : 'text-[#00000F]/60 hover:bg-[#FACE39]/10 hover:text-[#00000F]'}`}
                    >
                        <Activity className="w-5 h-5" />
                        <span>Lead Stage</span>
                    </button>
                </div>

                {/* BDM Management Section */}
                <div className="mt-2">
                    <button
                        onClick={() => setIsBDMManagementOpen(!isBDMManagementOpen)}
                        className={`w-full flex items-center justify-between px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isBDMManagementOpen ? 'text-[#00000F]' : 'text-[#00000F]/60 hover:bg-[#FACE39]/10 hover:text-[#00000F]'}`}
                    >
                        <div className="flex items-center gap-3">
                            <Users className="w-5 h-5" />
                            <span>BDM Management</span>
                        </div>
                        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isBDMManagementOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {isBDMManagementOpen && (
                        <div className="mt-1 space-y-0.5">
                            {bdmManagementItems.map(item => <NavItem key={item.id} item={item} isSub />)}
                        </div>
                    )}
                </div>
            </div>

            {/* Bottom Section */}
            <div className="px-3 py-4 border-t border-gray-100 space-y-1">
                <button
                    onClick={() => setActivePage('notification')}
                    className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${activePage === 'notification' ? 'bg-[#FACE39] text-[#00000F] font-semibold' : 'text-[#00000F]/60 hover:bg-[#FACE39]/10 hover:text-[#00000F]'}`}
                >
                    <div className="flex items-center gap-3">
                        <Bell className="w-5 h-5" />
                        <span>Notification</span>
                    </div>
                    {unreadCount > 0 && (
                        <span className="w-5 h-5 bg-[#EF4444] text-white text-[10px] flex items-center justify-center rounded-full font-bold">
                            {unreadCount}
                        </span>
                    )}
                </button>
                <button
                    onClick={() => setActivePage('profile')}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${activePage === 'profile' ? 'bg-[#FACE39] text-[#00000F] font-semibold' : 'text-[#00000F]/60 hover:bg-[#FACE39]/10 hover:text-[#00000F]'}`}
                >
                    <UserCircle className="w-5 h-5" />
                    <span>Profile</span>
                </button>
                <button
                    onClick={onLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-[#00000F] bg-[#EF4444] hover:bg-red-600 transition-colors mt-2"
                >
                    <LogOut className="w-5 h-5" />
                    <span>Logout</span>
                </button>
            </div>
        </div>
    )
}
