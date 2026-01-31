'use client'

import React, { useEffect, useState } from 'react'
import {
  Users,
  UserPlus,
  Target,
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
  getAdminStats,
  getRecentActivity,
  getTopPerformers,
  getLeadStageDistribution,
  getLeadStageTrend,
  getLeadSourceDistribution,
  getConversionRateTrend,
  getStatusDistribution
} from '@/lib/api/dashboard'

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

const mockRecentActivity = [
  { id: '1', user: 'Sarah Johnson', action: 'Converted lead "Tech Corp"', type: 'success', timestamp: new Date(Date.now() - 2 * 60 * 1000) },
  { id: '2', user: 'Michael Chen', action: 'Added new lead "StartupXYZ"', type: 'info', timestamp: new Date(Date.now() - 15 * 60 * 1000) },
  { id: '3', user: 'Admin System', action: 'Generated monthly reports', type: 'info', timestamp: new Date(Date.now() - 60 * 60 * 1000) },
  { id: '4', user: 'Emily Davis', action: 'Updated BDM profile', type: 'info', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000) },
  { id: '5', user: 'David Wilson', action: 'Marked 3 leads as dead', type: 'warning', timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000) },
]

const mockTopPerformers = [
  { rank: 1, name: 'Sarah Johnson', totalLeads: 45, convertedLeads: 23, conversionRate: '51.1' },
  { rank: 2, name: 'Michael Chen', totalLeads: 38, convertedLeads: 20, conversionRate: '52.6' },
  { rank: 3, name: 'Emily Davis', totalLeads: 32, convertedLeads: 15, conversionRate: '46.9' },
  { rank: 4, name: 'Robert Smith', totalLeads: 29, convertedLeads: 14, conversionRate: '48.3' },
]

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    activeBDMs: { value: 28, change: 2 },
    totalUsers: { value: 145, change: 12 },
    totalLeads: { value: 1234, change: 23 },
    conversionRate: { value: '34.5%', change: 5 }
  })
  const [recentActivity, setRecentActivity] = useState(mockRecentActivity)
  const [topPerformers, setTopPerformers] = useState(mockTopPerformers)
  const [stageDistribution, setStageDistribution] = useState(mockStageDistribution)
  const [stageTrend, setStageTrend] = useState(mockLineData)
  const [sourceDistribution, setSourceDistribution] = useState(mockPieData)
  const [conversionTrend, setConversionTrend] = useState(mockBarData)
  const [statusDistribution, setStatusDistribution] = useState(mockStatusData)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [
          statsRes,
          activityRes,
          performersRes,
          stageDistRes,
          stageTrendRes,
          sourceDistRes,
          conversionRes,
          statusRes
        ] = await Promise.allSettled([
          getAdminStats(),
          getRecentActivity(5),
          getTopPerformers(4),
          getLeadStageDistribution(),
          getLeadStageTrend(),
          getLeadSourceDistribution(),
          getConversionRateTrend(),
          getStatusDistribution()
        ])

        if (statsRes.status === 'fulfilled' && statsRes.value.success) {
          setStats(statsRes.value.data)
        }
        if (activityRes.status === 'fulfilled' && activityRes.value.success) {
          setRecentActivity(activityRes.value.data)
        }
        if (performersRes.status === 'fulfilled' && performersRes.value.success) {
          setTopPerformers(performersRes.value.data)
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
      }
    }

    fetchDashboardData()
  }, [])

  const formatTimeAgo = (date: Date | string) => {
    const now = new Date()
    const then = new Date(date)
    const diffMs = now.getTime() - then.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins} minutes ago`
    if (diffHours === 1) return '1 hour ago'
    if (diffHours < 24) return `${diffHours} hours ago`
    return `${Math.floor(diffHours / 24)} days ago`
  }

  const getActivityColor = (type: string) => {
    const colors: Record<string, string> = {
      'success': 'bg-green-500',
      'info': 'bg-blue-500',
      'warning': 'bg-yellow-500',
      'error': 'bg-red-500'
    }
    return colors[type] || 'bg-gray-500'
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
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Welcome back! Here's what's happening with your CRM today.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Active BDMs */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-3">
            <div className="bg-blue-50 p-2.5 rounded-lg">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-sm font-bold text-green-500">+{stats.activeBDMs.change}</span>
          </div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Active BDMs</p>
          <p className="text-2xl font-bold text-gray-900">{stats.activeBDMs.value}</p>
        </div>

        {/* Total Users */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-3">
            <div className="bg-purple-50 p-2.5 rounded-lg">
              <UserPlus className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-sm font-bold text-green-500">+{stats.totalUsers.change}%</span>
          </div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Total Users</p>
          <p className="text-2xl font-bold text-gray-900">{stats.totalUsers.value}</p>
        </div>

        {/* Total Leads */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-3">
            <div className="bg-green-50 p-2.5 rounded-lg">
              <Target className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-sm font-bold text-green-500">+{stats.totalLeads.change}%</span>
          </div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Total Leads</p>
          <p className="text-2xl font-bold text-gray-900">{stats.totalLeads.value.toLocaleString()}</p>
        </div>

        {/* Conversion Rate */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-3">
            <div className="bg-orange-50 p-2.5 rounded-lg">
              <TrendingUp className="w-5 h-5 text-orange-600" />
            </div>
            <span className="text-sm font-bold text-green-500">+{stats.conversionRate.change}%</span>
          </div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Conversion Rate</p>
          <p className="text-2xl font-bold text-gray-900">{stats.conversionRate.value}</p>
        </div>
      </div>

      {/* Recent Activity & Top Performers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-5">Recent Activity</h3>
          <div className="space-y-5">
            {recentActivity.map((item) => (
              <div key={item.id} className="flex gap-4 items-start">
                <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${getActivityColor(item.type)}`} />
                <div>
                  <p className="text-sm">
                    <span className="font-bold text-gray-900">{item.user}</span>
                    <span className="text-gray-600 ml-1">{item.action}</span>
                  </p>
                  <p className="text-xs text-gray-400 mt-1">{formatTimeAgo(item.timestamp)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Performers */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-5">Top Performers (This Month)</h3>
          <div className="space-y-3">
            {topPerformers.map((performer) => (
              <div key={performer.rank} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-yellow-50 flex items-center justify-center text-yellow-600 font-bold text-sm border border-yellow-200">
                    {performer.rank}
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{performer.name}</span>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">{performer.convertedLeads}/{performer.totalLeads} converted</p>
                  <p className="text-sm font-bold text-green-600">{performer.conversionRate}% <span className="text-[10px] uppercase text-gray-400">rate</span></p>
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
