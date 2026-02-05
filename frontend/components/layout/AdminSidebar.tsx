'use client'

import React, { useState } from 'react'
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

interface AdminSidebarProps {
    activePage: Page
    setActivePage: (page: Page) => void
    onLogout: () => void
}

export default function AdminSidebar({ activePage, setActivePage, onLogout }: AdminSidebarProps) {
    const [isServicesOpen, setIsServicesOpen] = useState(false)
    const [isBDMManagementOpen, setIsBDMManagementOpen] = useState(false)

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
                    ? 'bg-[#FDE047] text-gray-900 font-semibold'
                    : 'text-gray-600 hover:bg-gray-50'
                    } ${isSub ? 'pl-9 text-[13px]' : 'text-sm font-medium'}`}
            >
                <Icon className={`${isSub ? 'w-4 h-4' : 'w-5 h-5'}`} />
                <span>{item.label}</span>
            </button>
        )
    }

    return (
        <div className="w-64 flex-shrink-0 bg-white border-r border-gray-100 flex flex-col h-screen overflow-hidden text-gray-900">
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
                        className={`w-full flex items-center justify-between px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isServicesOpen ? 'text-gray-900' : 'text-gray-600 hover:bg-gray-50'}`}
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
                        className={`w-full flex items-center gap-3 px-4 py-2.5 my-0.5 rounded-lg text-sm font-medium transition-all duration-200 ${activePage === 'lead-center' ? 'bg-[#FDE047] text-gray-900 font-bold shadow-sm' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                        <Users className="w-5 h-5" />
                        <span>Lead Center</span>
                    </button>
                </div>

                <div className="mt-1">
                    <button
                        onClick={() => setActivePage('lead-stage')}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 my-0.5 rounded-lg text-sm font-medium transition-all duration-200 ${activePage === 'lead-stage' ? 'bg-[#FDE047] text-gray-900 font-bold shadow-sm' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                        <Activity className="w-5 h-5" />
                        <span>Lead Stage</span>
                    </button>
                </div>

                {/* BDM Management Section */}
                <div className="mt-2 text-gray-900">
                    <button
                        onClick={() => setIsBDMManagementOpen(!isBDMManagementOpen)}
                        className={`w-full flex items-center justify-between px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isBDMManagementOpen ? 'text-gray-900' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                        <div className="flex items-center gap-3">
                            <Users className="w-5 h-5" />
                            <span>BDM Management</span>
                        </div>
                        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isBDMManagementOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {isBDMManagementOpen && (
                        <div className="mt-1 space-y-0.5 text-gray-900">
                            {bdmManagementItems.map(item => <NavItem key={item.id} item={item} isSub />)}
                        </div>
                    )}
                </div>
            </div>

            {/* Bottom Section */}
            <div className="px-3 py-4 border-t border-gray-50 space-y-1">
                <button
                    onClick={() => setActivePage('notification')}
                    className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${activePage === 'notification' ? 'bg-[#FDE047] text-gray-900 font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                    <div className="flex items-center gap-3">
                        <Bell className="w-5 h-5" />
                        <span>Notification</span>
                    </div>
                    <span className="w-5 h-5 bg-[#EF4444] text-white text-[10px] flex items-center justify-center rounded-full font-bold">5</span>
                </button>
                <button
                    onClick={() => setActivePage('profile')}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${activePage === 'profile' ? 'bg-[#FDE047] text-gray-900 font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                    <UserCircle className="w-5 h-5" />
                    <span>Profile</span>
                </button>
                <button
                    onClick={onLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-white bg-[#EF4444] hover:bg-red-600 transition-colors mt-2"
                >
                    <LogOut className="w-5 h-5" />
                    <span>Logout</span>
                </button>
            </div>
        </div>
    )
}
