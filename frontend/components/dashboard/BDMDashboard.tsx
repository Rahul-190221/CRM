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

// Mock data for fallback
const mockLineData = [
  { month: 'Jun', Converted: 32, Hot: 45, Intake: 38, Processing: 28 },
  { month: 'Jul', Converted: 35, Hot: 48, Intake: 42, Processing: 32 },
  { month: 'Aug', Converted: 38, Hot: 42, Intake: 35, Processing: 38 },
  { month: 'Sep', Converted: 42, Hot: 38, Intake: 45, Processing: 35 },
  { month: 'Oct', Converted: 48, Hot: 52, Intake: 42, Processing: 45 },
  { month: 'Nov', Converted: 55, Hot: 58, Intake: 48, Processing: 52 },
]

const mockPieData = [
  { source: 'Website', percentage: 36, color: '#FACC15' },
  { source: 'Referral', percentage: 27, color: '#22C55E' },
  { source: 'Social Media', percentage: 18, color: '#3B82F6' },
  { source: 'Email Campaign', percentage: 8, color: '#EC4899' },
  { source: 'Walk-in', percentage: 11, color: '#F97316' },
]

const mockBarData = [
  { month: 'Jun', rate: 28 },
  { month: 'Jul', rate: 32 },
  { month: 'Aug', rate: 35 },
  { month: 'Sep', rate: 38 },
  { month: 'Oct', rate: 42 },
  { month: 'Nov', rate: 52 },
]

const mockStatusData = [
  { label: 'New', count: 45, color: '#3B82F6' },
  { label: 'In Progress', count: 68, color: '#F59E0B' },
  { label: 'Contacted', count: 52, color: '#22C55E' },
  { label: 'Qualified', count: 48, color: '#10B981' },
  { label: 'Converted', count: 23, color: '#06B6D4' },
  { label: 'Dead', count: 12, color: '#EF4444' },
]

const mockStageDistribution = [
  { stage: 'Intake', count: 234 },
  { stage: 'Processing', count: 189 },
  { stage: 'Hot', count: 156 },
  { stage: 'Converted', count: 423 },
  { stage: 'Dead', count: 232 },
]

const mockRecentLeads = [
  { id: '1', name: 'Sarah Johnson', service: 'IELTS Coaching', phone: '+880 1234-567890', createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), stage: 'Hot' },
  { id: '2', name: 'Michael Chen', service: 'PTE Preparation', phone: '+880 1234-567891', createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000), stage: 'Processing' },
  { id: '3', name: 'Emily Davis', service: 'GRE Test Prep', phone: '+880 1234-567892', createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000), stage: 'Intake' },
  { id: '4', name: 'James Wilson', service: 'TOEFL Course', phone: '+880 1234-567893', createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000), stage: 'Hot' },
  { id: '5', name: 'Anna Martinez', service: 'IELTS Coaching', phone: '+880 1234-567894', createdAt: new Date(Date.now() - 10 * 60 * 60 * 1000), stage: 'Converted' },
]

const mockUpcomingTasks = [
  { id: '1', title: 'Follow up with Sarah Johnson', dueDate: '2025-11-07', priority: 'high' },
  { id: '2', title: 'Send quotation to Michael Chen', dueDate: '2025-11-07', priority: 'medium' },
  { id: '3', title: 'Schedule demo class for Emily Davis', dueDate: '2025-11-08', priority: 'high' },
  { id: '4', title: 'Review application from James Wilson', dueDate: '2025-11-08', priority: 'low' },
]

export default function BDMDashboard({ activePage, setActivePage }: BDMDashboardProps) {
  const [stats, setStats] = useState({
    totalLeads: { value: 248, change: 12 },
    converted: { value: 89, change: 8 },
    inProgress: { value: 124, change: 5 },
    target: { value: '92%', change: 3 }
  })
  const [recentLeads, setRecentLeads] = useState(mockRecentLeads)
  const [upcomingTasks, setUpcomingTasks] = useState(mockUpcomingTasks)
  const [stageDistribution, setStageDistribution] = useState(mockStageDistribution)
  const [stageTrend, setStageTrend] = useState(mockLineData)
  const [sourceDistribution, setSourceDistribution] = useState(mockPieData)
  const [conversionTrend, setConversionTrend] = useState(mockBarData)
  const [statusDistribution, setStatusDistribution] = useState(mockStatusData)
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
      'Dead': { bg: 'bg-gray-100', text: 'text-gray-700' }
    }
    return colors[stage] || { bg: 'bg-gray-100', text: 'text-gray-700' }
  }

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, { bg: string; text: string }> = {
      'high': { bg: 'bg-red-100', text: 'text-red-700' },
      'medium': { bg: 'bg-yellow-100', text: 'text-yellow-700' },
      'low': { bg: 'bg-gray-100', text: 'text-gray-600' }
    }
    return colors[priority] || { bg: 'bg-gray-100', text: 'text-gray-700' }
  }

  const stageColors: Record<string, string> = {
    'Intake': 'bg-blue-100 text-blue-600 border-blue-200',
    'Processing': 'bg-yellow-100 text-yellow-600 border-yellow-200',
    'Hot': 'bg-orange-100 text-orange-600 border-orange-200',
    'Converted': 'bg-green-100 text-green-600 border-green-200',
    'Dead': 'bg-red-100 text-red-600 border-red-200'
  }

  const maxStatusCount = Math.max(...statusDistribution.map(s => s.count))

  return (
    <div className="flex-1 bg-[#F9FAFB] p-6 overflow-y-auto h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Welcome back! Here's your overview for today.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Total Leads */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-start justify-between mb-3">
            <div className="bg-blue-50 p-2.5 rounded-lg">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-sm font-bold text-green-500">+{stats.totalLeads.change}%</span>
          </div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Total Leads</p>
          <p className="text-2xl font-bold text-gray-900">{stats.totalLeads.value}</p>
        </div>

        {/* Converted */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-start justify-between mb-3">
            <div className="bg-green-50 p-2.5 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-sm font-bold text-green-500">+{stats.converted.change}%</span>
          </div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Converted</p>
          <p className="text-2xl font-bold text-gray-900">{stats.converted.value}</p>
        </div>

        {/* In Progress */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-start justify-between mb-3">
            <div className="bg-orange-50 p-2.5 rounded-lg">
              <Clock className="w-5 h-5 text-orange-600" />
            </div>
            <span className="text-sm font-bold text-green-500">+{stats.inProgress.change}%</span>
          </div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">In Progress</p>
          <p className="text-2xl font-bold text-gray-900">{stats.inProgress.value}</p>
        </div>

        {/* Target */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-start justify-between mb-3">
            <div className="bg-purple-50 p-2.5 rounded-lg">
              <Target className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-sm font-bold text-green-500">+{stats.target.change}%</span>
          </div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Target</p>
          <p className="text-2xl font-bold text-gray-900">{stats.target.value}</p>
        </div>
      </div>

      {/* Recent Leads & Upcoming Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Recent Leads */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-5">Recent Leads</h2>
          <div className="space-y-4">
            {recentLeads.map((lead) => (
              <div key={lead.id} className="flex items-start justify-between pb-4 border-b border-gray-50 last:border-0 last:pb-0">
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 text-sm">{lead.name}</p>
                  <p className="text-xs text-gray-500 mt-1">{lead.service}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-1.5 text-gray-400">
                      <Phone className="w-3.5 h-3.5" />
                      <span className="text-xs">{lead.phone}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-400">
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
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-5">Upcoming Tasks</h2>
          <div className="space-y-4">
            {upcomingTasks.map((task) => (
              <div key={task.id} className="pb-4 border-b border-gray-50 last:border-0 last:pb-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1 pr-3">
                    <p className="font-semibold text-gray-900 text-sm leading-tight">{task.title}</p>
                    <div className="flex items-center gap-1.5 mt-2 text-gray-400">
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
      <div className="mb-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Lead Stage Distribution</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {stageDistribution.map((item) => (
            <div key={item.stage} className={`p-4 rounded-xl border text-center ${stageColors[item.stage]}`}>
              <h4 className="text-2xl font-bold">{item.count}</h4>
              <p className="text-xs font-medium mt-1 opacity-80">
                {item.stage === 'Hot' ? 'Hot Leads' : item.stage === 'Dead' ? 'Dead Leads' : item.stage}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Lead Stage Trend */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="w-5 h-5 text-gray-400" />
            <h3 className="text-lg font-bold text-gray-900">Lead Stage Trend</h3>
          </div>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stageTrend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="Converted" stroke="#22C55E" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="Hot" stroke="#F97316" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="Intake" stroke="#3B82F6" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="Processing" stroke="#A855F7" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Lead Source Distribution */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <PieChartIcon className="w-5 h-5 text-gray-400" />
            <h3 className="text-lg font-bold text-gray-900">Lead Source Distribution</h3>
          </div>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sourceDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
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
                  layout="vertical"
                  align="right"
                  verticalAlign="middle"
                  formatter={(value) => <span className="text-xs text-gray-600">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Conversion Rate Trend */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5 text-gray-400" />
            <h3 className="text-lg font-bold text-gray-900">Conversion Rate Trend</h3>
          </div>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={conversionTrend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9CA3AF' }} tickFormatter={(val) => `${val}%`} />
                <Tooltip cursor={{ fill: '#F9FAFB' }} formatter={(value) => [`${value}%`, 'Rate']} />
                <Bar dataKey="rate" fill="#FACC15" radius={[4, 4, 0, 0]} barSize={35} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex items-center justify-center gap-2">
            <div className="w-3 h-3 bg-yellow-400 rounded-sm" />
            <span className="text-xs text-gray-500 font-medium">Conversion Rate (%)</span>
          </div>
        </div>

        {/* Status Distribution */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <Activity className="w-5 h-5 text-gray-400" />
            <h3 className="text-lg font-bold text-gray-900">Status Distribution</h3>
          </div>
          <div className="space-y-4">
            {statusDistribution.map((item) => (
              <div key={item.label} className="space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700 font-medium">{item.label}</span>
                  <span className="text-gray-900 font-bold">{item.count}</span>
                </div>
                <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${(item.count / maxStatusCount) * 100}%`,
                      backgroundColor: item.color
                    }}
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
