'use client'

import React, { useState } from 'react'
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
    FileText,
    UserCircle,
    X
} from 'lucide-react'
import type { Page } from '@/types/navigation'
import { useSocket } from '@/components/providers/SocketProvider'

interface AdminSidebarProps {
    activePage: Page
    setActivePage: (page: Page) => void
    onLogout: () => void
    isOpen: boolean
    onClose: () => void
    unreadCount: number
}

export default function AdminSidebar({ activePage, setActivePage, onLogout, isOpen, onClose, unreadCount }: AdminSidebarProps) {
    const [isServicesOpen, setIsServicesOpen] = useState(false)
    const [isBDMManagementOpen, setIsBDMManagementOpen] = useState(false)

    useSocket()

    const handleNavigate = (page: Page) => {
        setActivePage(page)
        onClose()
    }

    const servicesItems = [
        { id: 'course-details', label: 'Course Details', icon: GraduationCap },
        { id: 'mock-test',      label: 'Mock Test',      icon: ClipboardCheck },
        { id: 'exam-reg',       label: 'Exam Reg',       icon: FileBadge },
    ]

    const bdmManagementItems = [
        { id: 'bdm-add',      label: 'BDM Add',      icon: UserPlus },
        { id: 'bdm-remove',   label: 'BDM Remove',   icon: UserX },
        { id: 'bdm-activity', label: 'BDM Activity', icon: Activity },
        { id: 'bdm-report',   label: 'BDM Report',   icon: FileText },
    ]

    const NavItem = ({
        id, label, icon: Icon, isSub = false
    }: { id: string; label: string; icon: any; isSub?: boolean }) => {
        const isActive = activePage === id
        return (
            <button
                onClick={() => handleNavigate(id as Page)}
                className={`w-full flex items-center gap-3 rounded-xl transition-all duration-200 text-left select-none
                    ${isSub
                        ? 'pl-[46px] pr-3 py-2 text-[13px] font-medium'
                        : 'pl-4 pr-3 py-[10px] text-[14px] font-medium'
                    }
                    ${isActive
                        ? 'bg-[#FACE39] text-[#00000F] font-semibold shadow-[0_4px_14px_rgba(250,206,57,0.28)]'
                        : 'text-gray-500 hover:bg-[#FACE39]/[0.07] hover:text-[#00000F]/80'
                    }`}
            >
                <Icon style={{ width: isSub ? 13 : 15, height: isSub ? 13 : 15 }} className="flex-shrink-0" />
                <span className="truncate">{label}</span>
                {isActive && !isSub && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#00000F]/20 flex-shrink-0" />
                )}
            </button>
        )
    }

    const SectionLabel = ({ label }: { label: string }) => (
        <p className="pl-4 pt-5 pb-1 text-[11px] font-bold uppercase tracking-[0.22em] text-gray-300 select-none">
            {label}
        </p>
    )

    const AccordionBtn = ({
        label, icon: Icon, isOpen, onToggle
    }: { label: string; icon: any; isOpen: boolean; onToggle: () => void }) => (
        <button
            onClick={onToggle}
            className={`w-full flex items-center justify-between pl-4 pr-3 py-[10px] rounded-xl text-[14px] font-medium transition-all duration-200 select-none
                ${isOpen
                    ? 'text-[#00000F]/80 bg-[#FACE39]/[0.08]'
                    : 'text-gray-500 hover:bg-[#FACE39]/[0.07] hover:text-[#00000F]/80'
                }`}
        >
            <span className="flex items-center gap-3">
                <Icon style={{ width: 15, height: 15 }} className="flex-shrink-0" />
                {label}
            </span>
            <ChevronDown
                style={{ width: 13, height: 13 }}
                className={`flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 text-[#00000F]/50' : 'text-gray-300'}`}
            />
        </button>
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
                fixed top-0 left-0 h-full z-50
                lg:static lg:z-auto lg:translate-x-0
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

                {/* Navigation */}
                <nav className="flex-1 px-2.5 overflow-y-auto scrollbar-hide pb-3">
                    <SectionLabel label="Overview" />
                    <NavItem id="dashboard" label="Dashboard" icon={LayoutDashboard} />

                    <SectionLabel label="Services" />
                    <AccordionBtn
                        label="Services"
                        icon={Briefcase}
                        isOpen={isServicesOpen}
                        onToggle={() => setIsServicesOpen(v => !v)}
                    />
                    {isServicesOpen && (
                        <div className="mt-0.5 ml-5 pl-1.5 border-l-2 border-[#FACE39]/30 space-y-0.5">
                            {servicesItems.map(item => (
                                <NavItem key={item.id} id={item.id} label={item.label} icon={item.icon} isSub />
                            ))}
                        </div>
                    )}

                    <div className="mt-0.5">
                        <NavItem id="lead-center" label="Lead Center" icon={Users} />
                    </div>

                    <SectionLabel label="Management" />
                    <AccordionBtn
                        label="BDM Management"
                        icon={Users}
                        isOpen={isBDMManagementOpen}
                        onToggle={() => setIsBDMManagementOpen(v => !v)}
                    />
                    {isBDMManagementOpen && (
                        <div className="mt-0.5 ml-5 pl-1.5 border-l-2 border-[#FACE39]/30 space-y-0.5">
                            {bdmManagementItems.map(item => (
                                <NavItem key={item.id} id={item.id} label={item.label} icon={item.icon} isSub />
                            ))}
                        </div>
                    )}
                </nav>

                {/* Footer */}
                <div className="px-2.5 pt-3 pb-5 border-t border-[#00000F]/[0.06]">
                    <p className="pl-4 pb-1.5 text-[11px] font-bold uppercase tracking-[0.22em] text-gray-300 select-none">Account</p>
                    <div className="space-y-0.5">
                        <button
                            onClick={() => handleNavigate('notification')}
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
                            onClick={() => handleNavigate('profile')}
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
