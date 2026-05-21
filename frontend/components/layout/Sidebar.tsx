'use client'

import {
  LayoutDashboard,
  Users,
  Briefcase,
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
import { useSocket } from '@/components/providers/SocketProvider'
import { useState } from 'react'

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
  useSocket()

  const nav = (page: Page) => { setActivePage(page); onClose() }

  const Item = ({
    id, label, Icon, sub = false
  }: { id: Page; label: string; Icon: any; sub?: boolean }) => {
    const active = activePage === id || (id === 'lead-center' && activePage === 'lead-detail')
    return (
      <button
        onClick={() => nav(id)}
        className={`w-full flex items-center gap-3 rounded-xl transition-all duration-200 select-none
          ${sub
            ? 'pl-[46px] pr-3 py-2 text-[13px] font-medium'
            : 'pl-4 pr-3 py-[10px] text-[14px] font-medium'
          }
          ${active
            ? 'bg-[#FACE39] text-[#00000F] font-semibold shadow-[0_4px_14px_rgba(250,206,57,0.28)]'
            : 'text-gray-500 hover:bg-[#FACE39]/[0.07] hover:text-[#00000F]/80'
          }`}
      >
        <Icon style={{ width: sub ? 13 : 15, height: sub ? 13 : 15 }} className="flex-shrink-0" />
        <span className="truncate">{label}</span>
        {active && !sub && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#00000F]/20 flex-shrink-0" />}
      </button>
    )
  }

  const SectionLabel = ({ label }: { label: string }) => (
    <p className="pl-4 pt-5 pb-1 text-[11px] font-bold uppercase tracking-[0.22em] text-gray-300 select-none">
      {label}
    </p>
  )

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] lg:hidden"
          onClick={onClose}
        />
      )}

      <div className={`
        fixed top-0 left-0 h-full z-50 lg:static lg:z-auto lg:translate-x-0
        w-[252px] flex-shrink-0 flex flex-col
        bg-white border-r border-[#00000F]/[0.07]
        shadow-[3px_0_24px_rgba(0,0,0,0.05)]
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>

        {/* Logo */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-[#00000F]/[0.06]">
          <div className="flex-1 flex justify-center items-center mr-2">
            <img src="/assets/logo.png" alt="Luminedge" className="h-14 w-auto object-contain" style={{ imageRendering: 'auto' }} />
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600 flex-shrink-0"
          >
            <X style={{ width: 15, height: 15 }} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2.5 overflow-y-auto scrollbar-hide pb-3">
          <SectionLabel label="Overview" />
          <Item id="dashboard" label="Dashboard" Icon={LayoutDashboard} />

          <SectionLabel label="Services" />
          <button
            onClick={() => setIsServicesOpen(v => !v)}
            className={`w-full flex items-center justify-between pl-4 pr-3 py-[10px] rounded-xl text-[14px] font-medium transition-all duration-200 select-none
              ${isServicesOpen
                ? 'text-[#00000F]/80 bg-[#FACE39]/[0.08]'
                : 'text-gray-500 hover:bg-[#FACE39]/[0.07] hover:text-[#00000F]/80'
              }`}
          >
            <span className="flex items-center gap-3">
              <Briefcase style={{ width: 15, height: 15 }} className="flex-shrink-0" />
              Services
            </span>
            <ChevronDown
              style={{ width: 13, height: 13 }}
              className={`flex-shrink-0 transition-transform duration-200 ${isServicesOpen ? 'rotate-180 text-[#00000F]/50' : 'text-gray-300'}`}
            />
          </button>
          {isServicesOpen && (
            <div className="mt-0.5 ml-5 pl-1.5 border-l-2 border-[#FACE39]/30 space-y-0.5">
              <Item id="course-details"  label="Course Details"    Icon={GraduationCap} sub />
              <Item id="mock-test"       label="Mock Test"         Icon={ClipboardCheck} sub />
              <Item id="exam-reg"        label="Exam Registration" Icon={FileBadge} sub />
            </div>
          )}

          <div className="mt-0.5">
            <Item id="lead-center" label="Lead Center" Icon={Users} />
          </div>
        </nav>

        {/* Footer */}
        <div className="px-2.5 pt-3 pb-5 border-t border-[#00000F]/[0.06]">
          <p className="pl-4 pb-1.5 text-[11px] font-bold uppercase tracking-[0.22em] text-gray-300 select-none">Account</p>
          <div className="space-y-0.5">
            <button
              onClick={() => nav('notification')}
              className={`w-full flex items-center justify-between pl-4 pr-3 py-[10px] rounded-xl text-[14px] font-medium transition-all duration-200 select-none
                ${activePage === 'notification'
                  ? 'bg-[#FACE39] text-[#00000F] font-semibold shadow-[0_4px_14px_rgba(250,206,57,0.28)]'
                  : 'text-gray-500 hover:bg-[#FACE39]/[0.07] hover:text-[#00000F]/80'
                }`}
            >
              <span className="flex items-center gap-3">
                <Bell style={{ width: 15, height: 15 }} className="flex-shrink-0" />
                Notifications
              </span>
              {unreadCount > 0 && (
                <span className="min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full font-bold px-1">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>

            <button
              onClick={() => nav('profile')}
              className={`w-full flex items-center gap-3 pl-4 pr-3 py-[10px] rounded-xl text-[14px] font-medium transition-all duration-200 select-none
                ${activePage === 'profile'
                  ? 'bg-[#FACE39] text-[#00000F] font-semibold shadow-[0_4px_14px_rgba(250,206,57,0.28)]'
                  : 'text-gray-500 hover:bg-[#FACE39]/[0.07] hover:text-[#00000F]/80'
                }`}
            >
              <UserCircle style={{ width: 15, height: 15 }} className="flex-shrink-0" />
              Profile
            </button>

            <div className="pt-1.5 border-t border-[#00000F]/[0.05] mt-1.5">
              <button
                onClick={onLogout}
                className="w-full flex items-center gap-3 pl-4 pr-3 py-[10px] rounded-xl text-[14px] font-medium text-rose-400 hover:bg-rose-50 hover:text-rose-500 transition-all duration-200 select-none"
              >
                <LogOut style={{ width: 15, height: 15 }} className="flex-shrink-0" />
                Logout
              </button>
            </div>
          </div>
        </div>

      </div>
    </>
  )
}
