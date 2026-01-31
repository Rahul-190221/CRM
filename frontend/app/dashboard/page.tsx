'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
// Layout Components
import Sidebar from '@/components/layout/Sidebar'
import AdminSidebar from '@/components/layout/AdminSidebar'
import Header from '@/components/layout/Header'

import Dashboard from '@/components/dashboard/Dashboard'
import BDMDashboard from '@/components/dashboard/BDMDashboard'
import LeadCenter from '@/components/leads/LeadCenter'
import LeadStage from '@/components/leads/LeadStage'
import CourseDetails from '@/components/admin/CourseDetails'
import MockTest from '@/components/admin/MockTest'
import ExamRegistration from '@/components/admin/ExamRegistration'
import type { Page } from '@/types/navigation'



export default function DashboardPage() {
  const router = useRouter()
  const [activePage, setActivePage] = useState<Page>('dashboard')
  const [user, setUser] = useState<any>(null)
  const [isInitialized, setIsInitialized] = useState(false)


  useEffect(() => {
    const savedUser = localStorage.getItem('user')
    const savedToken = localStorage.getItem('accessToken')

    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser))
    } else {
      // Redirect to login if not authenticated
      router.push('/')
    }
    setIsInitialized(true)
  }, [router])

  const handleLogout = () => {
    setUser(null)
    localStorage.removeItem('user')
    localStorage.removeItem('accessToken')
    router.push('/')
  }

  const renderContent = () => {
    switch (activePage) {
      case 'dashboard':
        return user?.role === 'admin' ? <Dashboard /> : <BDMDashboard />
      case 'lead-center':
        return <LeadCenter />
      case 'lead-stage':
        return <LeadStage />
      case 'course-details':
        return <CourseDetails />
      case 'mock-test':
        return <MockTest />
      case 'exam-reg':
        return <ExamRegistration />
      default:
        return user?.role === 'admin' ? <Dashboard /> : <BDMDashboard />
    }
  }

  if (!isInitialized || !user) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="text-3xl font-bold text-gray-900 mb-2">Loading...</div>
          <p className="text-gray-500">Redirecting to login</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {user?.role === 'admin' ? (
        <AdminSidebar activePage={activePage} setActivePage={setActivePage} onLogout={handleLogout} />
      ) : (
        <Sidebar activePage={activePage} setActivePage={setActivePage} onLogout={handleLogout} />
      )}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header user={user} onLogout={handleLogout} />
        <main className="flex-1 overflow-y-auto p-8 scrollbar-hide">
          {renderContent()}
        </main>
      </div>
    </div>
  )
}
