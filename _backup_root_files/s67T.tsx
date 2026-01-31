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
  FileBadge
} from 'lucide-react'
import type { Page } from '@/types/navigation'

interface SidebarProps {
  activePage: Page
  setActivePage: (page: Page) => void
}

export default function Sidebar({ activePage, setActivePage }: SidebarProps) {
  const [isServicesOpen, setIsServicesOpen] = useState(false)

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
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Logo Section */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center shadow-sm">
            <span className="text-black font-bold text-lg">L</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 leading-tight">Luminedge</h1>
            <p className="text-[10px] uppercase tracking-wider text-primary-600 font-semibold">Digital Solutions</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto scrollbar-hide space-y-1">
        <p className="px-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Main Menu</p>
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = activePage === item.id
            return (
              <li key={item.id}>
                <button
                  onClick={() => setActivePage(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 ${isActive
                      ? 'bg-primary-500 text-black font-semibold shadow-sm'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-black' : 'text-gray-500'}`} />
                  <span className="text-sm">{item.label}</span>
                </button>
              </li>
            )
          })}
        </ul>

        {/* Services Section */}
        <div className="mt-6">
          <p className="px-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Services</p>
          <button
            onClick={() => setIsServicesOpen(!isServicesOpen)}
            className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200"
          >
            <div className="flex items-center gap-3">
              <Briefcase className="w-5 h-5 text-gray-500" />
              <span className="text-sm">Our Services</span>
            </div>
            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isServicesOpen ? 'rotate-180' : ''}`} />
          </button>

          {isServicesOpen && (
            <ul className="mt-1 ml-4 border-l border-gray-100 space-y-1">
              {servicesItems.map((item) => {
                const Icon = item.icon
                return (
                  <li key={item.id}>
                    <button onClick={() => setActivePage(item.id)} className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors">
                      <Icon className="w-4 h-4" />
                      <span className="text-[13px]">{item.label}</span>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </nav>

      {/* Bottom Section */}
      <div className="p-4 border-t border-gray-100 space-y-1">
        <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors">
          <Settings className="w-5 h-5 text-gray-500" />
          <span className="text-sm">Settings</span>
        </button>
        <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-danger hover:bg-danger-light transition-colors">
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </div>
  )
}
