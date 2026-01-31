'use client'

import { useState } from 'react'
import AdminDashboard from './AdminDashboard'
import BDMDashboard from './BDMDashboard'

interface DashboardProps {
  user?: {
    role: 'admin' | 'bdm' | 'agent'
    name: string
  }
}

export default function Dashboard({ user }: DashboardProps) {
  const userRole = user?.role || 'bdm'
  const [activePage, setActivePage] = useState<string>('dashboard')

  return (
    <>
      {/* Render based on role */}
      {userRole === 'admin' ? (
        <AdminDashboard activePage={activePage} setActivePage={setActivePage} />
      ) : (
        <BDMDashboard activePage={activePage} setActivePage={setActivePage} />
      )}
    </>
  )
}
