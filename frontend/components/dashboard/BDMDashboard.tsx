'use client'

import React, { useEffect, useState } from 'react'
import {
  Users,
  CheckCircle,
  Clock,
  Target,
  Phone,
  Calendar,
  TrendingUp,
  BarChart3,
  PieChart as PieChartIcon,
  Activity
} from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend
} from 'recharts'
import {
  getBDMStats,
  getRecentLeads,
  getUpcomingTasks,
  getLeadStageDistribution,
  getLeadStageTrend,
  getLeadSourceDistribution,
  getConversionRateTrend,
  getStatusDistribution
} from '@/lib/api/dashboard'

interface BDMDashboardProps {
  activePage?: string
  setActivePage?: (page: string) => void
}

export default function BDMDashboard({ activePage, setActivePage }: BDMDashboardProps) {
  const [stats, setStats] = useState({
    totalLeads: { value: 0, change: 0 },
    converted: { value: 0, change: 0 },
    inProgress: { value: 0, change: 0 },
    target: { value: '0%', change: 0 }
  })
  const [recentLeads, setRecentLeads] = useState<any[]>([])
  const [upcomingTasks, setUpcomingTasks] = useState<any[]>([])
  const [stageDistribution, setStageDistribution] = useState<any[]>([])
  const [stageTrend, setStageTrend] = useState<any[]>([])
  const [sourceDistribution, setSourceDistribution] = useState<any[]>([])
  const [conversionTrend, setConversionTrend] = useState<any[]>([])
  const [statusDistribution, setStatusDistribution] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [
          statsRes,
          leadsRes,
          tasksRes,
          stageDistRes,
          stageTrendRes,
          sourceDistRes,
          conversionRes,
          statusRes
        ] = await Promise.allSettled([
          getBDMStats(),
          getRecentLeads(5),
          getUpcomingTasks(4),
          getLeadStageDistribution(),
          getLeadStageTrend(),
          getLeadSourceDistribution(),
          getConversionRateTrend(),
          getStatusDistribution()
        ])

        if (statsRes.status === 'fulfilled' && statsRes.value.success) {
          setStats(statsRes.value.data)
        }
        if (leadsRes.status === 'fulfilled' && leadsRes.value.success) {
          setRecentLeads(leadsRes.value.data)
        }
        if (tasksRes.status === 'fulfilled' && tasksRes.value.success) {
          setUpcomingTasks(tasksRes.value.data)
        }
        if (stageDistRes.status === 'fulfilled' && stageDistRes.value.success) {
          setStageDistribution(stageDistRes.value.data)
        }
        if (stageTrendRes.status === 'fulfilled' && stageTrendRes.value.success) {
          setStageTrend(stageTrendRes.value.data)
        }
        if (sourceDistRes.status === 'fulfilled' && sourceDistRes.value.success) {
          setSourceDistribution(sourceDistRes.value.data)
        }
        if (conversionRes.status === 'fulfilled' && conversionRes.value.success) {
          setConversionTrend(conversionRes.value.data)
        }
        if (statusRes.status === 'fulfilled' && statusRes.value.success) {
          setStatusDistribution(statusRes.value.data)
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const formatTimeAgo = (date: Date | string) => {
    const now = new Date()
    const then = new Date(date)
    const diffMs = now.getTime() - then.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))

    if (diffHours < 1) return 'Just now'
    if (diffHours === 1) return '1 hour ago'
    if (diffHours < 24) return `${diffHours} hours ago`
    return `${Math.floor(diffHours / 24)} days ago`
  }

  const getStageColor = (stage: string) => {
    const colors: Record<string, { bg: string; text: string }> = {
      'Hot': { bg: 'bg-red-100', text: 'text-red-700' },
      'Processing': { bg: 'bg-yellow-100', text: 'text-yellow-700' },
      'Intake': { bg: 'bg-blue-100', text: 'text-blue-700' },
      'Converted': { bg: 'bg-green-100', text: 'text-green-700' },
      'Dead': { bg: 'bg-gray-100', text: 'text-[#00000F]/70' }
    }
    return colors[stage] || { bg: 'bg-gray-100', text: 'text-[#00000F]/70' }
  }

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, { bg: string; text: string }> = {
      'high': { bg: 'bg-red-100', text: 'text-red-700' },
      'medium': { bg: 'bg-yellow-100', text: 'text-yellow-700' },
      'low': { bg: 'bg-gray-100', text: 'text-[#00000F]/60' }
    }
    return colors[priority] || { bg: 'bg-gray-100', text: 'text-[#00000F]/70' }
  }

  const stageColors: Record<string, string> = {
    'Intake': 'bg-blue-100 text-blue-600 border-blue-200',
    'Processing': 'bg-yellow-100 text-yellow-600 border-yellow-200',
    'Hot': 'bg-orange-100 text-orange-600 border-orange-200',
    'Converted': 'bg-green-100 text-green-600 border-green-200',
    'Dead': 'bg-red-100 text-red-600 border-red-200'
  }

  const maxStatusCount = statusDistribution.length > 0 ? Math.max(...statusDistribution.map(s => s.count)) : 1

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-[#FACE39] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-[#00000F]/50">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-3">
        <h1 className="text-xl sm:text-2xl font-bold text-[#00000F]">Dashboard</h1>
        <p className="text-[#00000F]/50 text-xs sm:text-sm mt-1">Welcome back! Here's your overview for today.</p>
      </div>

      {/* Stats Cards — 2 cols on mobile, 4 on desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-3">
        {/* Total Leads */}
        <div className="bg-white rounded-xl border border-gray-100 p-3 sm:p-4 shadow-sm card-lift shimmer-hover">
          <div className="flex items-start justify-between mb-2">
            <div className="bg-blue-50 p-2 rounded-lg">
              <Users className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
            </div>
            <span className="text-xs sm:text-sm font-bold text-green-500">+{stats.totalLeads.change}%</span>
          </div>
          <p className="text-[10px] sm:text-xs font-medium text-[#00000F]/50 uppercase tracking-wide mb-1">Total Leads</p>
          <p className="text-lg sm:text-2xl font-bold text-[#00000F]">{stats.totalLeads.value}</p>
        </div>

        {/* Converted */}
        <div className="bg-white rounded-xl border border-gray-100 p-3 sm:p-4 shadow-sm card-lift shimmer-hover">
          <div className="flex items-start justify-between mb-2">
            <div className="bg-green-50 p-2 rounded-lg">
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
            </div>
            <span className="text-xs sm:text-sm font-bold text-green-500">+{stats.converted.change}%</span>
          </div>
          <p className="text-[10px] sm:text-xs font-medium text-[#00000F]/50 uppercase tracking-wide mb-1">Converted</p>
          <p className="text-lg sm:text-2xl font-bold text-[#00000F]">{stats.converted.value}</p>
        </div>

        {/* In Progress */}
        <div className="bg-white rounded-xl border border-gray-100 p-3 sm:p-4 shadow-sm card-lift shimmer-hover">
          <div className="flex items-start justify-between mb-2">
            <div className="bg-orange-50 p-2 rounded-lg">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
            </div>
            <span className="text-xs sm:text-sm font-bold text-green-500">+{stats.inProgress.change}%</span>
          </div>
          <p className="text-[10px] sm:text-xs font-medium text-[#00000F]/50 uppercase tracking-wide mb-1">In Progress</p>
          <p className="text-lg sm:text-2xl font-bold text-[#00000F]">{stats.inProgress.value}</p>
        </div>

        {/* Target */}
        <div className="bg-white rounded-xl border border-gray-100 p-3 sm:p-4 shadow-sm card-lift shimmer-hover">
          <div className="flex items-start justify-between mb-2">
            <div className="bg-purple-50 p-2 rounded-lg">
              <Target className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
            </div>
            <span className="text-xs sm:text-sm font-bold text-green-500">+{stats.target.change}%</span>
          </div>
          <p className="text-[10px] sm:text-xs font-medium text-[#00000F]/50 uppercase tracking-wide mb-1">Target</p>
          <p className="text-lg sm:text-2xl font-bold text-[#00000F]">{stats.target.value}</p>
        </div>
      </div>

      {/* Recent Leads & Upcoming Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 mb-3">
        {/* Recent Leads */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 p-3 sm:p-5 shadow-sm card-lift">
          <h2 className="text-sm sm:text-base font-bold text-[#00000F] mb-3">Recent Leads</h2>
          <div className="space-y-4">
            {recentLeads.length === 0 ? (
              <p className="text-sm text-[#00000F]/40 text-center py-6">No recent leads found.</p>
            ) : recentLeads.map((lead) => (
              <div key={lead.id} className="flex items-start justify-between pb-4 border-b border-gray-50 last:border-0 last:pb-0">
                <div className="flex-1">
                  <p className="font-semibold text-[#00000F] text-sm">{lead.name}</p>
                  <p className="text-xs text-[#00000F]/50 mt-1">{lead.service}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-1.5 text-[#00000F]/40">
                      <Phone className="w-3.5 h-3.5" />
                      <span className="text-xs">{lead.phone}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[#00000F]/40">
                      <Clock className="w-3.5 h-3.5" />
                      <span className="text-xs">{formatTimeAgo(lead.createdAt)}</span>
                    </div>
                  </div>
                </div>
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${getStageColor(lead.stage).bg} ${getStageColor(lead.stage).text}`}>
                  {lead.stage}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Tasks */}
        <div className="bg-white rounded-xl border border-gray-100 p-3 sm:p-5 shadow-sm card-lift">
          <h2 className="text-sm sm:text-base font-bold text-[#00000F] mb-3">Upcoming Tasks</h2>
          <div className="space-y-4">
            {upcomingTasks.length === 0 ? (
              <p className="text-sm text-[#00000F]/40 text-center py-6">No upcoming tasks.</p>
            ) : upcomingTasks.map((task) => (
              <div key={task.id} className="pb-4 border-b border-gray-50 last:border-0 last:pb-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1 pr-3">
                    <p className="font-semibold text-[#00000F] text-sm leading-tight">{task.title}</p>
                    <div className="flex items-center gap-1.5 mt-2 text-[#00000F]/40">
                      <Calendar className="w-3.5 h-3.5" />
                      <span className="text-xs">{task.dueDate}</span>
                    </div>
                  </div>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded ${getPriorityColor(task.priority).bg} ${getPriorityColor(task.priority).text} capitalize`}>
                    {task.priority === 'high' ? 'High' : task.priority === 'medium' ? 'Medium' : 'Low'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Lead Stage Distribution */}
      <div className="mb-3">
        <h2 className="text-sm sm:text-base font-bold text-[#00000F] mb-2">Lead Stage Distribution</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {stageDistribution.map((item) => (
            <div key={item.stage} className={`p-2 sm:p-3 rounded-xl border text-center ${stageColors[item.stage]}`}>
              <h4 className="text-xl sm:text-2xl font-bold">{item.count}</h4>
              <p className="text-[10px] sm:text-xs font-medium mt-0.5 opacity-80">
                {item.stage === 'Hot' ? 'Hot Leads' : item.stage === 'Dead' ? 'Dead Leads' : item.stage}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 mb-3">
        {/* Lead Stage Trend */}
        <div className="bg-white rounded-xl border border-gray-100 p-3 sm:p-5 shadow-sm card-lift">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-4 h-4 text-[#00000F]/40" />
            <h3 className="text-sm sm:text-base font-bold text-[#00000F]">Lead Stage Trend</h3>
          </div>
          <div className="h-[190px] sm:h-[240px] relative">
            <div className="absolute inset-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stageTrend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} width={28} />
                <Tooltip />
                <Legend iconSize={10} wrapperStyle={{ fontSize: '10px' }} />
                <Line type="monotone" dataKey="Converted" stroke="#22C55E" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="Hot" stroke="#F97316" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="Intake" stroke="#3B82F6" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="Processing" stroke="#A855F7" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Lead Source Distribution */}
        <div className="bg-white rounded-xl border border-gray-100 p-3 sm:p-5 shadow-sm card-lift">
          <div className="flex items-center gap-2 mb-2">
            <PieChartIcon className="w-4 h-4 text-[#00000F]/40" />
            <h3 className="text-sm sm:text-base font-bold text-[#00000F]">Lead Source Distribution</h3>
          </div>
          <div className="h-[190px] sm:h-[240px] relative">
            <div className="absolute inset-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sourceDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="percentage"
                  nameKey="source"
                >
                  {sourceDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value}%`} />
                <Legend
                  layout="horizontal"
                  align="center"
                  verticalAlign="bottom"
                  iconSize={8}
                  formatter={(value) => <span style={{ fontSize: '10px' }} className="text-[#00000F]/60">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
        {/* Conversion Rate Trend */}
        <div className="bg-white rounded-xl border border-gray-100 p-3 sm:p-5 shadow-sm card-lift">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-[#00000F]/40" />
            <h3 className="text-sm sm:text-base font-bold text-[#00000F]">Conversion Rate Trend</h3>
          </div>
          <div className="h-[190px] sm:h-[240px] relative">
            <div className="absolute inset-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={conversionTrend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} tickFormatter={(val) => `${val}%`} width={32} />
                <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} formatter={(value) => [`${value}%`, 'Rate']} />
                <Bar dataKey="rate" fill="#FACE39" radius={[4, 4, 0, 0]} barSize={25} />
              </BarChart>
            </ResponsiveContainer>
            </div>
          </div>
          <div className="mt-2 flex items-center justify-center gap-2">
            <div className="w-2.5 h-2.5 bg-[#FACE39] rounded-sm" />
            <span className="text-[10px] sm:text-xs text-[#00000F]/50 font-medium">Conversion Rate (%)</span>
          </div>
        </div>

        {/* Status Distribution */}
        <div className="bg-white rounded-xl border border-gray-100 p-3 sm:p-5 shadow-sm card-lift">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4 text-[#00000F]/40" />
            <h3 className="text-sm sm:text-base font-bold text-[#00000F]">Status Distribution</h3>
          </div>
          <div className="space-y-2.5">
            {statusDistribution.map((item) => (
              <div key={item.label} className="space-y-1">
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-[#00000F]/70 font-medium">{item.label}</span>
                  <span className="text-[#00000F] font-bold">{item.count}</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="bdm-status-bar h-full rounded-full transition-all duration-500"
                    style={{'--bar-width': `${(item.count / maxStatusCount) * 100}%`, '--bar-color': item.color} as React.CSSProperties}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
