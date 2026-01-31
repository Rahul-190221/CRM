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

  const adminStats = [
    {
      label: 'Active BDMs',
      value: '12',
      change: '+2',
      changeType: 'increase',
      icon: UserCheck,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'Total Users',
      value: '1,248',
      change: '+45',
      changeType: 'increase',
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      label: 'Total Leads',
      value: '5,670',
      change: '+12%',
      changeType: 'increase',
      icon: Briefcase,
      color: 'text-warning-dark',
      bgColor: 'bg-warning-light',
    },
    {
      label: 'Conversion Rate',
      value: '24.5%',
      change: '+2.1%',
      changeType: 'increase',
      icon: TrendingUp,
      color: 'text-success-dark',
      bgColor: 'bg-success-light',
    },
  ]

  const recentActivity = [
    { user: 'Admin', action: 'Assigned 10 leads to', target: 'John Doe', time: '2 mins ago' },
    { user: 'Sarah J.', action: 'Converted lead', target: 'ABC Corp', time: '15 mins ago' },
    { user: 'Mike D.', action: 'Added new lead', target: 'Robert Smith', time: '1 hour ago' },
    { user: 'Admin', action: 'Updated course details for', target: 'IELTS Prep', time: '3 hours ago' },
  ]

  const topPerformers = [
    { name: 'John Doe', role: 'BDM', leads: 45, conversion: '85%' },
    { name: 'Sarah Johnson', role: 'BDM', leads: 38, conversion: '78%' },
    { name: 'Mike Davis', role: 'BDM', leads: 32, conversion: '72%' },
  ]

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
