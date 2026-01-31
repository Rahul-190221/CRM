'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'
import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'
import BDMDashboard from '@/components/bdm/BDMDashboard'
import { getUserIdFromToken } from '@/lib/helpers/jwt'

export default function BDMDashboardPage() {
  const router = useRouter()
  const [activePage, setActivePage] = useState<string>('dashboard')
  const [user, setUser] = useState<any>(null)
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    const decoded = getUserIdFromToken()

    if (!decoded) {
      router.push('/')
      return
    }

    // Redirect admin to admin dashboard
    if (decoded.role === 'admin') {
      router.push('/admin/dashboard')
      return
    }

    setUser({
      name: decoded.email?.split('@')[0] || 'User',
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

  if (!isInitialized || !user) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar
        activePage={activePage as any}
        setActivePage={setActivePage as any}
        onLogout={handleLogout}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header user={user} onLogout={handleLogout} />
        <main className="flex-1 overflow-y-auto p-8">
          <BDMDashboard activePage={activePage} setActivePage={setActivePage} />
        </main>
      </div>
    </div>
  )
}
