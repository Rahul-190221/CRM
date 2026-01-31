'use client'

import {
  UserCheck,
  Users,
  Briefcase,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  MoreVertical,
  Activity,
  User,
  Settings,
  LogOut,
  Bell
} from 'lucide-react'

interface AdminDashboardProps {
  activePage: string
  setActivePage: (page: string) => void
}

export default function AdminDashboard({ activePage, setActivePage }: AdminDashboardProps) {
  const adminStats = [
    {
      label: 'Active BDMs',
      value: '28',
      change: '+2',
      changeType: 'increase',
      icon: UserCheck,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'Total Users',
      value: '145',
      change: '+12%',
      changeType: 'increase',
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      label: 'Total Leads',
      value: '1,234',
      change: '+23%',
      changeType: 'increase',
      icon: Briefcase,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      label: 'Conversion Rate',
      value: '34.5%',
      change: '+5%',
      changeType: 'increase',
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ]

  const recentActivity = [
    { user: 'Sarah Johnson', action: 'Converted lead', target: '"Tech Corp"', time: '2 minutes ago', color: 'bg-green-100' },
    { user: 'Michael Chen', action: 'Added new lead', target: '"StartupXYZ"', time: '15 minutes ago', color: 'bg-blue-100' },
    { user: 'Admin System', action: 'Generated monthly reports', time: '1 hour ago', color: 'bg-blue-100' },
    { user: 'Emily Davis', action: 'Updated BDM profile', time: '2 hours ago', color: 'bg-blue-100' },
    { user: 'David Wilson', action: 'Marked 3 leads as dead', time: '3 hours ago', color: 'bg-orange-100' },
  ]

  const topPerformers = [
    { rank: 1, name: 'Sarah Johnson', converted: '23/45 converted', rate: '51.1%' },
    { rank: 2, name: 'Michael Chen', converted: '20/38 converted', rate: '52.6%' },
    { rank: 3, name: 'Emily Davis', converted: '15/32 converted', rate: '46.9%' },
    { rank: 4, name: 'Robert Smith', converted: '14/29 converted', rate: '48.3%' },
  ]

  const leadStages = [
    { label: 'Intake', value: '234', color: 'bg-blue-200' },
    { label: 'Processing', value: '189', color: 'bg-yellow-200' },
    { label: 'Hot Leads', value: '156', color: 'bg-orange-200' },
    { label: 'Converted', value: '423', color: 'bg-green-200' },
    { label: 'Dead Leads', value: '232', color: 'bg-pink-200' },
  ]

  return (
    <div className="flex-1 overflow-auto bg-gray-50">
      <div className="p-8">
        <div className="space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-sm text-gray-500">Welcome back! Here's what's happening with your CRM today.</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {adminStats.map((stat, index) => {
              const Icon = stat.icon
              return (
                <div key={index} className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`${stat.bgColor} p-3 rounded-lg`}>
                      <Icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                    <div className="flex items-center gap-1 px-2 py-1 rounded text-xs font-bold text-green-700 bg-green-50">
                      <ArrowUpRight className="w-3 h-3" />
                      {stat.change}
                    </div>
                  </div>
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                </div>
              )
            })}
          </div>

          {/* Recent Activity & Top Performers */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-6">Recent Activity</h2>
              <div className="space-y-4">
                {recentActivity.map((activity, i) => (
                  <div key={i} className="flex items-start gap-4 pb-4 border-b border-gray-100 last:border-0">
                    <div className={`w-3 h-3 rounded-full mt-2 ${activity.color === 'bg-green-100' ? 'bg-green-500' : activity.color === 'bg-orange-100' ? 'bg-orange-500' : 'bg-blue-500'}`}></div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">
                        <span className="font-semibold">{activity.user}</span>
                        {activity.action && <span className="text-gray-600"> {activity.action}</span>}
                        {activity.target && <span className="font-semibold"> {activity.target}</span>}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-6">Top Performers (This Month)</h2>
              <div className="space-y-4">
                {topPerformers.map((performer, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center font-bold text-yellow-700 text-sm">
                      {performer.rank}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900">{performer.name}</p>
                      <p className="text-xs text-gray-500">{performer.converted}</p>
                    </div>
                    <p className="text-sm font-bold text-green-600">{performer.rate} rate</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Lead Stage Distribution */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-8">Lead Stage Distribution</h2>
            <div className="grid grid-cols-5 gap-4">
              {leadStages.map((stage, i) => (
                <div key={i} className="text-center">
                  <div className={`${stage.color} rounded-lg p-8 mb-3 flex items-center justify-center`}>
                    <p className="text-2xl font-bold text-gray-900">{stage.value}</p>
                  </div>
                  <p className="text-sm font-semibold text-gray-600">{stage.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
