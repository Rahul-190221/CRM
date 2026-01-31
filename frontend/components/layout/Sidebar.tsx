'use client'

import { useState } from 'react'
import {
  LayoutDashboard,
  Users,
  Briefcase,
  CheckSquare,
  Building2,
  Settings,
  LogOut,
  ChevronDown,
  GraduationCap,
  ClipboardCheck,
  FileBadge,
  Bell
} from 'lucide-react'
import type { Page } from '@/types/navigation'

interface SidebarProps {
  activePage: Page
  setActivePage: (page: Page) => void
  onLogout: () => void
}

export default function Sidebar({ activePage, setActivePage, onLogout }: SidebarProps) {
  const [isServicesOpen, setIsServicesOpen] = useState(true)

  const menuItems = [
    { id: 'dashboard' as Page, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'contacts' as Page, label: 'Contacts', icon: Users },
    { id: 'deals' as Page, label: 'Deals', icon: Briefcase },
    { id: 'tasks' as Page, label: 'Lead Stage', icon: CheckSquare },
    { id: 'companies' as Page, label: 'Companies', icon: Building2 },
  ]

  const servicesItems: { id: Page; label: string; icon: any }[] = [
    { id: 'course-details', label: 'Course Details', icon: GraduationCap },
    { id: 'mock-test', label: 'Mock Test', icon: ClipboardCheck },
    { id: 'exam-reg', label: 'Exam Registration', icon: FileBadge },
  ]

  return (
    <div className="w-64 bg-white border-r border-gray-100 flex flex-col h-screen">
      {/* Logo Section */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <img src="/assets/logo.png" alt="Luminedge logo" className="w-25 h-auto bg-white object-contain rounded-md" />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 overflow-y-auto scrollbar-hide space-y-1">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = activePage === item.id
            return (
              <li key={item.id}>
                <button
                  onClick={() => setActivePage(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 ${isActive
                    ? 'bg-yellow-400 text-gray-900 font-semibold'
                    : 'text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              </li>
            )
          })}
        </ul>

        {/* Services Section */}
        <div className="mt-6">
          <button
            onClick={() => setIsServicesOpen(!isServicesOpen)}
            className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-gray-700 hover:bg-gray-50 transition-all duration-200"
          >
            <div className="flex items-center gap-3">
              <Briefcase className="w-5 h-5 text-gray-600" />
              <span className="text-sm font-medium">Services</span>
            </div>
            <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isServicesOpen ? 'rotate-180' : ''}`} />
          </button>

          {isServicesOpen && (
            <ul className="mt-2 ml-4 border-l-2 border-gray-200 pl-2 space-y-1">
              {servicesItems.map((item) => {
                const Icon = item.icon
                const isActive = activePage === item.id
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => setActivePage(item.id)}
                      className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 text-sm ${isActive ? 'bg-yellow-400 text-gray-900 font-semibold' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </nav>

      {/* Bottom Section */}
      <div className="p-4 border-t border-gray-100 space-y-2">
        <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors relative">
          <Bell className="w-5 h-5 text-gray-600" />
          <span className="text-sm font-medium">Notification</span>
          <span className="absolute right-3 top-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
        <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
          <Users className="w-5 h-5 text-gray-600" />
          <span className="text-sm font-medium">Profile</span>
        </button>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-white bg-red-500 hover:bg-red-600 transition-colors font-medium"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-sm">Logout</span>
        </button>
      </div>
    </div>
  )
}
