'use client'

import { useState } from 'react'
import {
  Users,
  UserCheck,
  Briefcase,
  TrendingUp,
  Calendar,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  MoreVertical,
  Activity
} from 'lucide-react'
import Sidebar from './Sidebar'
import type { Page } from '@/types/navigation'

interface DashboardProps {
  user?: {
    role: 'admin' | 'bdm' | 'agent'
    name: string
  }
}

export default function Dashboard({ user }: DashboardProps) {
  const [role, setRole] = useState<'admin' | 'bdm'>(
    user?.role === 'admin' ? 'admin' : 'bdm'
  )
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

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header with Role Toggle (for demo) */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {role === 'admin' ? 'Admin Dashboard' : 'BDM Dashboard'}
                </h1>
                <p className="text-sm text-gray-500">Welcome back, {role === 'admin' ? 'Administrator' : 'BDM User'}</p>
              </div>
              <div className="flex bg-gray-100 p-1 rounded-lg">
                <button
                  onClick={() => setRole('admin')}
                  className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${role === 'admin' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}
                >
                  Admin View
                </button>
                <button
                  onClick={() => setRole('bdm')}
                  className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${role === 'bdm' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}
                >
                  BDM View
                </button>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {adminStats.map((stat, index) => {
                const Icon = stat.icon
                return (
                  <div key={index} className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-sm transition-all group">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`${stat.bgColor} p-3 rounded-xl transition-colors group-hover:bg-primary-500/10`}>
                        <Icon className={`w-6 h-6 ${stat.color} group-hover:text-primary-600`} />
                      </div>
                      <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold ${stat.changeType === 'increase' ? 'text-success-dark bg-success-light' : 'text-danger-dark bg-danger-light'}`}>
                        {stat.changeType === 'increase' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        {stat.change}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{stat.label}</p>
                      <p className="text-3xl font-extrabold text-gray-900 tracking-tight">{stat.value}</p>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Middle Section: Chart & Performance */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-lg font-bold text-gray-900">Lead Trend</h2>
                  <div className="flex items-center gap-2">
                    <FilterIcon />
                    <select className="text-xs font-semibold bg-gray-50 border-none rounded-lg px-3 py-1.5 focus:ring-primary-500">
                      <option>Last 7 Days</option>
                      <option>Last 30 Days</option>
                    </select>
                  </div>
                </div>
                <div className="h-64 flex items-end justify-between px-2 gap-2">
                  {/* Mock Chart Visualization */}
                  {[40, 70, 45, 90, 65, 80, 55].map((h, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                      <div
                        style={{ height: `${h}%` }}
                        className="w-full bg-primary-100 rounded-t-lg group-hover:bg-primary-500 transition-all duration-300 relative"
                      >
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          {h * 10} leads
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-gray-400">Day {i + 1}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold text-gray-900">Top Performers</h2>
                  <button className="p-1 hover:bg-gray-50 rounded-lg"><MoreVertical className="w-4 h-4 text-gray-400" /></button>
                </div>
                <div className="space-y-5">
                  {topPerformers.map((performer, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-gray-600">
                        {performer.name.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-gray-900">{performer.name}</p>
                        <p className="text-[11px] text-gray-500 font-medium">{performer.role}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-gray-900">{performer.leads} Leads</p>
                        <p className="text-[10px] text-success-dark font-bold">{performer.conversion} Conv.</p>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="w-full mt-8 py-2.5 text-xs font-bold text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors">
                  View All BDMs
                </button>
              </div>
            </div>

            {/* Bottom Section: Recent Activity */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary-500 rounded-lg"><Activity className="w-4 h-4 text-black" /></div>
                  <h2 className="text-lg font-bold text-gray-900">Recent Activity</h2>
                </div>
                <button className="text-xs font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1">
                  See History <ChevronRight className="w-3 h-3" />
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-gray-50">
                      <th className="pb-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">User</th>
                      <th className="pb-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Action</th>
                      <th className="pb-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Target</th>
                      <th className="pb-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {recentActivity.map((activity, i) => (
                      <tr key={i} className="group hover:bg-gray-50/50 transition-colors">
                        <td className="py-4">
                          <span className="text-sm font-bold text-gray-900">{activity.user}</span>
                        </td>
                        <td className="py-4">
                          <span className="text-sm text-gray-600">{activity.action}</span>
                        </td>
                        <td className="py-4">
                          <span className="text-sm font-semibold text-primary-600">{activity.target}</span>
                        </td>
                        <td className="py-4">
                          <span className="text-xs text-gray-400 italic">{activity.time}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function FilterIcon() {
  return (
    <svg className="w-3 h-3 mr-2 inline text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
    </svg>
  )
}
