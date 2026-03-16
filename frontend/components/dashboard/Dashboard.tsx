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


export default function AdminDashboard() {
  const [stats, setStats] = useState({
    activeBDMs: { value: 0, change: 0 },
    totalUsers: { value: 0, change: 0 },
    totalLeads: { value: 0, change: 0 },
    conversionRate: { value: '0%', change: 0 }
  })
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [topPerformers, setTopPerformers] = useState<any[]>([])
  const [stageDistribution, setStageDistribution] = useState<any[]>([])
  const [stageTrend, setStageTrend] = useState<any[]>([])
  const [sourceDistribution, setSourceDistribution] = useState<any[]>([])
  const [conversionTrend, setConversionTrend] = useState<any[]>([])
  const [statusDistribution, setStatusDistribution] = useState<any[]>([])

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

  const statusBarStyles = statusDistribution.map((item, i) =>
    `.sd-bar-${i}{width:${maxStatusCount > 0 ? ((item.count / maxStatusCount) * 100).toFixed(2) : 0}%;background-color:${item.color}}`
  ).join('')

  return (
    <div className="flex-1 bg-[#FAFAFA] p-4 overflow-y-auto h-screen">
      {/* Header */}
      <div className="mb-2">
        <h1 className="text-2xl font-bold text-[#00000F]">Admin Dashboard</h1>
        <p className="text-[#00000F]/50 text-sm mt-1">Welcome back! Here's what's happening with your CRM today.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 mb-2">
        {/* Active BDMs */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm card-lift shimmer-hover card-lift shimmer-hover">
          <div className="flex items-start justify-between mb-4">
            <div className="bg-blue-50 p-2.5 rounded-lg">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-sm font-bold text-green-500">+{stats.activeBDMs.change}</span>
          </div>
          <p className="text-xs font-medium text-[#00000F]/50 uppercase tracking-wide mb-1">Active BDMs</p>
          <p className="text-2xl font-bold text-[#00000F]">{stats.activeBDMs.value}</p>
        </div>

        {/* Total Users */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm card-lift shimmer-hover card-lift shimmer-hover">
          <div className="flex items-start justify-between mb-3">
            <div className="bg-purple-50 p-2.5 rounded-lg">
              <UserPlus className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-sm font-bold text-green-500">+{stats.totalUsers.change}%</span>
          </div>
          <p className="text-xs font-medium text-[#00000F]/50 uppercase tracking-wide mb-1">Total Users</p>
          <p className="text-2xl font-bold text-[#00000F]">{stats.totalUsers.value}</p>
        </div>

        {/* Total Leads */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm card-lift shimmer-hover card-lift shimmer-hover">
          <div className="flex items-start justify-between mb-3">
            <div className="bg-green-50 p-2.5 rounded-lg">
              <Target className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-sm font-bold text-green-500">+{stats.totalLeads.change}%</span>
          </div>
          <p className="text-xs font-medium text-[#00000F]/50 uppercase tracking-wide mb-1">Total Leads</p>
          <p className="text-2xl font-bold text-[#00000F]">{stats.totalLeads.value.toLocaleString()}</p>
        </div>

        {/* Conversion Rate */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm card-lift shimmer-hover card-lift shimmer-hover">
          <div className="flex items-start justify-between mb-3">
            <div className="bg-orange-50 p-2.5 rounded-lg">
              <TrendingUp className="w-5 h-5 text-orange-600" />
            </div>
            <span className="text-sm font-bold text-green-500">+{stats.conversionRate.change}%</span>
          </div>
          <p className="text-xs font-medium text-[#00000F]/50 uppercase tracking-wide mb-1">Conversion Rate</p>
          <p className="text-2xl font-bold text-[#00000F]">{stats.conversionRate.value}</p>
        </div>
      </div>

      {/* Recent Activity & Top Performers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 mb-4">
        {/* Recent Activity */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm card-lift">
          <h3 className="text-lg font-bold text-[#00000F] mb-5">Recent Activity</h3>
          <div className="space-y-5">
            {recentActivity.map((item) => (
              <div key={item.id} className="flex gap-4 items-start">
                <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${getActivityColor(item.type)}`} />
                <div>
                  <p className="text-sm">
                    <span className="font-bold text-[#00000F]">{item.user}</span>
                    <span className="text-[#00000F]/60 ml-1">{item.action}</span>
                  </p>
                  <p className="text-xs text-[#00000F]/40 mt-1">{formatTimeAgo(item.timestamp)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Performers */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm card-lift">
          <h3 className="text-lg font-bold text-[#00000F] mb-5">Top Performers (This Month)</h3>
          <div className="space-y-3">
            {topPerformers.map((performer) => (
              <div key={performer.rank} className="flex items-center justify-between p-3 rounded-lg hover:bg-white transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-[#FACE39]/20 flex items-center justify-center text-[#FACE39] font-bold text-sm border border-[#FACE39]/30">
                    {performer.rank}
                  </div>
                  <span className="text-sm font-semibold text-[#00000F]">{performer.name}</span>
                </div>
                <div className="text-right">
                  <p className="text-xs text-[#00000F]/50">{performer.convertedLeads}/{performer.totalLeads} converted</p>
                  <p className="text-sm font-bold text-green-600">{performer.conversionRate}% <span className="text-[10px] uppercase text-[#00000F]/40">rate</span></p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Lead Stage Distribution */}
      <div className="mb-4">
        <h2 className="text-lg font-bold text-[#00000F] mb-2">Lead Stage Distribution</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 mb-4">
        {/* Lead Stage Trend */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm card-lift">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-5 h-5 text-[#00000F]/40" />
            <h3 className="text-lg font-bold text-[#00000F]">Lead Stage Trend</h3>
          </div>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stageTrend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
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
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm card-lift">
          <div className="flex items-center gap-2 mb-2">
            <PieChartIcon className="w-5 h-5 text-[#00000F]/40" />
            <h3 className="text-lg font-bold text-[#00000F]">Lead Source Distribution</h3>
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
                  formatter={(value) => <span className="text-xs text-[#00000F]/60">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
        {/* Conversion Rate Trend */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm card-lift">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-[#00000F]/40" />
            <h3 className="text-lg font-bold text-[#00000F]">Conversion Rate Trend</h3>
          </div>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={conversionTrend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9CA3AF' }} tickFormatter={(val) => `${val}%`} />
                <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} formatter={(value) => [`${value}%`, 'Rate']} />
                <Bar dataKey="rate" fill="#FACE39" radius={[4, 4, 0, 0]} barSize={35} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex items-center justify-center gap-2">
            <div className="w-3 h-3 bg-[#FACE39] rounded-sm" />
            <span className="text-xs text-[#00000F]/50 font-medium">Conversion Rate (%)</span>
          </div>
        </div>

        {/* Status Distribution */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm card-lift">
          <style>{statusBarStyles}</style>
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-5 h-5 text-[#00000F]/40" />
            <h3 className="text-lg font-bold text-[#00000F]">Status Distribution</h3>
          </div>
          <div className="space-y-4">
            {statusDistribution.map((item, i) => (
              <div key={item.label} className="space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="text-[#00000F]/70 font-medium">{item.label}</span>
                  <span className="text-[#00000F] font-bold">{item.count}</span>
                </div>
                <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`progress-bar sd-bar-${i}`} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
