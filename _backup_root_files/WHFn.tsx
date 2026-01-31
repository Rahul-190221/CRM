'use client'

import { Users, CheckCircle, Clock, Target, Calendar } from 'lucide-react'

interface BDMDashboardProps {
  activePage: string
  setActivePage: (page: string) => void
}

export default function BDMDashboard({ activePage, setActivePage }: BDMDashboardProps) {
  const bdmStats = [
    {
      label: 'Total Leads',
      value: '248',
      change: '+12%',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      icon: Users,
    },
    {
      label: 'Converted',
      value: '89',
      change: '+8%',
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      icon: CheckCircle,
    },
    {
      label: 'In Progress',
      value: '124',
      change: '+5%',
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      icon: Clock,
    },
    {
      label: 'Target',
      value: '92%',
      change: '+3%',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      icon: Target,
    },
  ]

  const recentLeads = [
    { name: 'Sarah Johnson', company: 'IELTS Coaching', phone: '+880 1234-567890', time: '2 hours ago', status: 'Hot' },
    { name: 'Michael Chen', company: 'PTE Preparation', phone: '+880 1234-567891', time: '4 hours ago', status: 'Processing' },
    { name: 'Emily Davis', company: 'GRE Test Prep', phone: '+880 1234-567892', time: '6 hours ago', status: 'Intake' },
    { name: 'James Wilson', company: 'TOEFL Course', phone: '+880 1234-567893', time: '8 hours ago', status: 'Hot' },
  ]

  const upcomingTasks = [
    { task: 'Follow up with Sarah Johnson', date: '2025-11-07', priority: 'High' },
    { task: 'Send quotation to Michael Chen', date: '2025-11-07', priority: 'Medium' },
    { task: 'Schedule demo class for Emily Davis', date: '2025-11-08', priority: 'High' },
    { task: 'Review application from James Wilson', date: '2025-11-08', priority: 'Low' },
  ]

  const getStatusBadge = (status: string) => {
    const styles = {
      Hot: 'bg-red-100 text-red-700',
      Processing: 'bg-yellow-100 text-yellow-700',
      Intake: 'bg-blue-100 text-blue-700',
    }
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-700'
  }

  const getPriorityColor = (priority: string) => {
    const styles = {
      High: 'text-red-600 font-bold',
      Medium: 'text-yellow-600 font-semibold',
      Low: 'text-gray-600',
    }
    return styles[priority as keyof typeof styles] || 'text-gray-600'
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500">Welcome back! Here's your overview for today.</p>
      </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {bdmStats.map((stat, index) => {
              const Icon = stat.icon
              return (
                <div key={index} className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`${stat.bgColor} p-3 rounded-lg`}>
                      <Icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                    <div className={`text-sm font-bold ${stat.color}`}>
                      {stat.change}
                    </div>
                  </div>
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                </div>
              )
            })}
          </div>

          {/* Recent Leads & Upcoming Tasks */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Leads */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-6">Recent Leads</h2>
              <div className="space-y-5">
                {recentLeads.map((lead, i) => (
                  <div key={i} className="flex items-start justify-between pb-5 border-b border-gray-100 last:border-0">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 text-sm">{lead.name}</p>
                      <p className="text-xs text-gray-500 mt-1">{lead.company}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-1">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          <p className="text-xs text-gray-600">{lead.phone}</p>
                        </div>
                        <p className="text-xs text-gray-400">{lead.time}</p>
                      </div>
                    </div>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap ml-2 ${
                      lead.status === 'Hot' ? 'bg-red-100 text-red-700' :
                      lead.status === 'Processing' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {lead.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming Tasks */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-6">Upcoming Tasks</h2>
              <div className="space-y-5">
                {upcomingTasks.map((item, i) => (
                  <div key={i} className="pb-5 border-b border-gray-100 last:border-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 text-sm">{item.task}</p>
                        <div className="flex items-center gap-1 mt-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <p className="text-xs text-gray-500">{item.date}</p>
                        </div>
                      </div>
                      <span className={`text-xs font-bold px-2 py-1 rounded-full whitespace-nowrap ${
                        item.priority === 'High' ? 'bg-red-100 text-red-700' :
                        item.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {item.priority}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
    </div>
  )
}
