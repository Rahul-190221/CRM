'use client'

import { useState } from 'react'
import Sidebar from './Sidebar'
import AdminDashboard from './AdminDashboard'
import BDMDashboard from './BDMDashboard'
import type { Page } from '@/types/navigation'

interface DashboardProps {
  user?: {
    role: 'admin' | 'bdm' | 'agent'
    name: string
  }
}

export default function Dashboard({ user }: DashboardProps) {
  const userRole = user?.role || 'bdm'
  const [activePage, setActivePage] = useState<Page>('dashboard')

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar activePage={activePage} setActivePage={setActivePage} />

      {/* Render based on role */}
      {userRole === 'admin' ? (
        <AdminDashboard activePage={activePage} setActivePage={setActivePage} />
      ) : (
        <BDMDashboard activePage={activePage} setActivePage={setActivePage} />
      )}
    </div>
  )
}
