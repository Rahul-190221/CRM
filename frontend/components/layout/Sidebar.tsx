'use client'

import { useState, useEffect } from 'react'
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
  UserCircle,
  X
} from 'lucide-react'
import type { Page } from '@/types/navigation'
import { getNotifications } from '@/lib/api/notifications'
import { useSocket } from '@/components/providers/SocketProvider'
import Cookies from 'js-cookie'

interface SidebarProps {
  activePage: Page
  setActivePage: (page: Page) => void
  onLogout: () => void
  isOpen: boolean
  onClose: () => void
  unreadCount: number
}

export default function Sidebar({ activePage, setActivePage, onLogout, isOpen, onClose, unreadCount }: SidebarProps) {
  const [isServicesOpen, setIsServicesOpen] = useState(true)

  const socketService = useSocket()

  const handleNavigate = (page: Page) => {
    setActivePage(page)
    onClose()
  }

  const menuItems = [
    { id: 'dashboard' as Page, label: 'Dashboard', icon: LayoutDashboard },
  ]

  const servicesItems: { id: Page; label: string; icon: any }[] = [
    { id: 'course-details', label: 'Course Details', icon: GraduationCap },
    { id: 'mock-test', label: 'Mock Test', icon: ClipboardCheck },
    { id: 'exam-reg', label: 'Exam Registration', icon: FileBadge },
  ]

  const NavItem = ({ item, isSub = false }: { item: any, isSub?: boolean }) => {
    const Icon = item.icon
    const isActive = activePage === item.id
    return (
      <button
        onClick={() => handleNavigate(item.id)}
        className={`w-full flex items-center gap-3 px-4 py-2 my-0.5 rounded-lg transition-all duration-200 ${isActive
          ? 'bg-[#FACE39] text-[#00000F] font-semibold'
          : 'text-[#00000F]/60 hover:bg-[#FACE39]/10 hover:text-[#00000F]'
          } ${isSub ? 'pl-9 text-xs' : 'text-sm font-medium'}`}
      >
        <Icon className={`${isSub ? 'w-4 h-4' : 'w-5 h-5'} flex-shrink-0`} />
        <span>{item.label}</span>
      </button>
    )
  }

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar panel */}
      <div className={`
        fixed top-0 left-0 h-full z-50
        lg:static lg:z-auto lg:translate-x-0
        w-64 flex-shrink-0 bg-white border-r border-gray-100 flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo Section */}
        <div className="p-5 flex items-center justify-between">
          <div className="p-4 border-b border-gray-100 bg-white flex-1">
            <img src="/assets/logo.png" alt="Luminedge logo" className="w-36 h-auto bg-white object-contain rounded-md" />
          </div>
          {/* Close button - mobile only */}
          <button
            onClick={onClose}
            className="lg:hidden ml-2 p-1.5 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
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
              onClick={() => handleNavigate('lead-center')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 my-0.5 rounded-lg text-sm font-medium transition-all duration-200 ${activePage === 'lead-center' ? 'bg-[#FACE39] text-[#00000F] font-bold shadow-sm' : 'text-[#00000F]/60 hover:bg-[#FACE39]/10 hover:text-[#00000F]'}`}
            >
              <Users className="w-5 h-5 flex-shrink-0" />
              <span>Lead Center</span>
            </button>
          </div>

          <div className="mt-1">
            <button
              onClick={() => handleNavigate('lead-stage')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 my-0.5 rounded-lg text-sm font-medium transition-all duration-200 ${activePage === 'lead-stage' ? 'bg-[#FACE39] text-[#00000F] font-bold shadow-sm' : 'text-[#00000F]/60 hover:bg-[#FACE39]/10 hover:text-[#00000F]'}`}
            >
              <Activity className="w-5 h-5 flex-shrink-0" />
              <span>Lead Stage</span>
            </button>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="px-3 py-4 border-t border-gray-100 space-y-1">
          <button
            onClick={() => handleNavigate('notification')}
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
            onClick={() => handleNavigate('profile')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${activePage === 'profile' ? 'bg-[#FACE39] text-[#00000F] font-semibold' : 'text-[#00000F]/60 hover:bg-[#FACE39]/10 hover:text-[#00000F]'}`}
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
    </>
  )
}
