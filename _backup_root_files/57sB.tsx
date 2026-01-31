'use client'

import { useState, useEffect } from 'react'
import Dashboard from '@/components/Dashboard'
import Contacts from '@/components/Contacts'
import Deals from '@/components/Deals'
import Tasks from '@/components/Tasks'
import Companies from '@/components/Companies'
import Sidebar from '@/components/Sidebar'
import AdminSidebar from '@/components/AdminSidebar'
import Header from '@/components/Header'
import Login from '@/components/Login'
import Signup from '@/components/Signup'
import type { Page } from '@/types/navigation'

export default function Home() {
  const [activePage, setActivePage] = useState<string>('dashboard')
  const [user, setUser] = useState<any>(null)
  const [token, setToken] = useState<string | null>(null)
  const [showSignup, setShowSignup] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    const savedUser = localStorage.getItem('crm_user')
    const savedToken = localStorage.getItem('crm_token')
    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser))
      setToken(savedToken)
    }
    setIsInitialized(true)
  }, [])

  const handleLogin = (userData: any, userToken: string) => {
    setUser(userData)
    setToken(userToken)
    localStorage.setItem('crm_user', JSON.stringify(userData))
    localStorage.setItem('crm_token', userToken)
    setActivePage('dashboard')
  }

  const handleLogout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('crm_user')
    localStorage.removeItem('crm_token')
  }

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return <Dashboard user={user} />
      case 'contacts':
        return <Contacts />
      case 'deals':
        return <Deals />
      case 'tasks':
        return <Tasks />
      case 'companies':
        return <Companies />
      case 'course-details':
        return <ServicePlaceholder title="Course Details" />
      case 'mock-test':
        return <ServicePlaceholder title="Mock Test" />
      case 'exam-reg':
        return <ServicePlaceholder title="Exam Registration" />
      default:
        return <Dashboard />
    }
  }

  if (!isInitialized) return null

  if (!user) {
    return showSignup ? (
      <Signup onSignup={handleLogin} onSwitchToLogin={() => setShowSignup(false)} />
    ) : (
      <Login onLogin={handleLogin} onSwitchToSignup={() => setShowSignup(true)} />
    )
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar activePage={activePage} setActivePage={setActivePage} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header user={user} onLogout={handleLogout} />
        <main className="flex-1 overflow-y-auto p-8 scrollbar-hide">
          {renderPage()}
        </main>
      </div>
    </div>
  )
}

function ServicePlaceholder({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] animate-in fade-in duration-500">
      <div className="w-20 h-20 bg-primary-100 rounded-3xl flex items-center justify-center mb-6">
        <div className="w-10 h-10 bg-primary-500 rounded-2xl"></div>
      </div>
      <h1 className="text-3xl font-black text-gray-900 mb-2">{title}</h1>
      <p className="text-gray-500 font-medium">This service feature is currently under final configuration.</p>
    </div>
  )
}
