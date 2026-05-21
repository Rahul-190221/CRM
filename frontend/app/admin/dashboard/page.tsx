'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'
import AdminSidebar from '@/components/layout/AdminSidebar'
import Header from '@/components/layout/Header'
import Dashboard from '@/components/dashboard/Dashboard'
import LeadCenter from '@/components/leads/LeadCenter'
import LeadStage from '@/components/leads/LeadStage'
import CourseDetails from '@/components/admin/CourseDetails'
import MockTest from '@/components/admin/MockTest'
import ExamRegistration from '@/components/admin/ExamRegistration'
import BDMAdd from '@/components/admin/BDMAdd'
import BDMRemove from '@/components/admin/BDMRemove'
import BDMRole from '@/components/admin/BDMRole'
import BDMActivity from '@/components/admin/BDMActivity'
import BDMReport from '@/components/admin/BDMReport'
import LeadAssignments from '@/components/admin/LeadAssignments'
import LeadDetail from '@/components/leads/LeadDetail'
import NotificationsPage from '@/components/shared/NotificationsPage'
import ProfilePage from '@/components/shared/ProfilePage'
import { getUserIdFromToken } from '@/lib/helpers/jwt'
import { useNotifications } from '@/components/providers/NotificationProvider'
import type { Page } from '@/types/navigation'

export default function AdminDashboardPage() {
  return <AdminDashboardContent />
}

function AdminDashboardContent() {
  const router = useRouter()
  const [activePage, setActivePage] = useState<Page>('dashboard')
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null)
  const [leadCenterRefreshKey, setLeadCenterRefreshKey] = useState(0)
  const [user, setUser] = useState<any>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  
  const { unreadCount } = useNotifications()

  useEffect(() => {
    const decoded = getUserIdFromToken()

    if (!decoded) {
      router.push('/')
      return
    }

    // Check if user is admin
    if (decoded.role !== 'admin') {
      router.push('/dashboard')
      return
    }

    setUser({
      name: decoded.email?.split('@')[0] || 'Admin',
      email: decoded.email,
      role: decoded.role
    })
    setIsInitialized(true)
  }, [router])

  const handleLogout = () => {
    Cookies.remove('accessToken')
    localStorage.removeItem('accessToken')
    router.push('/')
  }

  const handleNotificationClick = () => {
    setActivePage('notification')
  }

  const renderContent = () => {
    switch (activePage) {
      case 'dashboard':
        return <Dashboard />
      case 'lead-center':
        return <LeadCenter user={user} refreshKey={leadCenterRefreshKey} onViewLead={(id) => { setSelectedLeadId(id); setActivePage('lead-detail'); }} />
      case 'lead-detail':
        return selectedLeadId
          ? <LeadDetail id={selectedLeadId} onBack={() => { setLeadCenterRefreshKey(k => k + 1); setActivePage('lead-center'); }} />
          : <LeadCenter user={user} refreshKey={leadCenterRefreshKey} onViewLead={(id) => { setSelectedLeadId(id); setActivePage('lead-detail'); }} />
      case 'lead-stage':
        return <LeadStage user={user} />
      case 'course-details':
        return <CourseDetails user={user} />
      case 'mock-test':
        return <MockTest user={user} />
      case 'exam-reg':
        return <ExamRegistration user={user} />
      case 'bdm-add':
        return <BDMAdd />
      case 'bdm-remove':
        return <BDMRemove />
      case 'bdm-role':
        return <BDMRole />
      case 'bdm-activity':
        return <BDMActivity />
      case 'bdm-report':
        return <BDMReport />
      case 'lead-assignments':
        return <LeadAssignments />
      case 'notification':
        return <NotificationsPage />
      case 'profile':
        return <ProfilePage user={user} />
      default:
        return <Dashboard />
    }
  }

  if (!isInitialized || !user) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FACE39] mx-auto mb-4"></div>
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      <AdminSidebar
        activePage={activePage}
        setActivePage={setActivePage}
        onLogout={handleLogout}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        unreadCount={unreadCount}
      />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <Header
          user={user}
          onLogout={handleLogout}
          onMenuToggle={() => setSidebarOpen(prev => !prev)}
          unreadCount={unreadCount}
          onNotificationClick={handleNotificationClick}
        />
        <main className="flex-1 overflow-y-auto px-5 py-5 md:px-7 md:py-6 lg:px-8 lg:py-7 scrollbar-hide bg-[#fafafa]">
          {renderContent()}
        </main>
      </div>
    </div>
  )
}
