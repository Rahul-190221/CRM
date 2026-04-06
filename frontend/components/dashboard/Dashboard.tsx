'use client'

import React, { useEffect, useState } from 'react'
import {
  Users,
  UserPlus,
  Target,
  TrendingUp,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  RefreshCw
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
import { getAdminDashboardAll } from '@/lib/api/dashboard'


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
  const [loading, setLoading] = useState(true)
  const [fetchTick, setFetchTick] = useState(0)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true)
      try {
        const res = await getAdminDashboardAll()
        if (res?.success) {
          const d = res.data
          if (d.stats)             setStats(d.stats)
          if (d.recentActivity)    setRecentActivity(d.recentActivity)
          if (d.topPerformers)     setTopPerformers(d.topPerformers)
          if (d.stageDistribution) setStageDistribution(d.stageDistribution)
          if (d.stageTrend)        setStageTrend(d.stageTrend)
          if (d.sourceDistribution)setSourceDistribution(d.sourceDistribution)
          if (d.conversionTrend)   setConversionTrend(d.conversionTrend)
          if (d.statusDistribution)setStatusDistribution(d.statusDistribution)
        }
      } catch (error: any) {
        console.error('Admin dashboard fetch error:', error?.message || error)
      } finally {
        setLoading(false)
      }
    }
    fetchDashboardData()
  }, [fetchTick])

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

  const maxStatusCount = statusDistribution.length > 0 ? Math.max(...statusDistribution.map(s => s.count)) : 1

  const statusBarStyles = statusDistribution.map((item, i) =>
    `.sd-bar-${i}{width:${maxStatusCount > 0 ? ((item.count / maxStatusCount) * 100).toFixed(2) : 0}%;background-color:${item.color}}`
  ).join('')

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
      <div className="flex items-center justify-between mb-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#00000F]">Admin Dashboard</h1>
          <p className="text-[#00000F]/50 text-xs sm:text-sm mt-1">Welcome back! Here's what's happening with your CRM today.</p>
        </div>
        <button
          onClick={() => setFetchTick(t => t + 1)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
          title="Refresh data"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </button>
      </div>

      {/* Stats Cards — 2 cols on mobile, 4 on desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-3">
        {/* Active BDMs */}
        <div className="bg-white rounded-xl border border-gray-100 p-3 sm:p-4 shadow-sm card-lift shimmer-hover">
          <div className="flex items-start justify-between mb-2">
            <div className="bg-blue-50 p-2 rounded-lg">
              <Users className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
            </div>
            <span className="text-xs sm:text-sm font-bold text-green-500">+{stats.activeBDMs.change}</span>
          </div>
          <p className="text-[10px] sm:text-xs font-medium text-[#00000F]/50 uppercase tracking-wide mb-1">Active BDMs</p>
          <p className="text-lg sm:text-2xl font-bold text-[#00000F]">{stats.activeBDMs.value}</p>
        </div>

        {/* Total Users */}
        <div className="bg-white rounded-xl border border-gray-100 p-3 sm:p-4 shadow-sm card-lift shimmer-hover">
          <div className="flex items-start justify-between mb-2">
            <div className="bg-purple-50 p-2 rounded-lg">
              <UserPlus className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
            </div>
            <span className="text-xs sm:text-sm font-bold text-green-500">+{stats.totalUsers.change}%</span>
          </div>
          <p className="text-[10px] sm:text-xs font-medium text-[#00000F]/50 uppercase tracking-wide mb-1">Total Users</p>
          <p className="text-lg sm:text-2xl font-bold text-[#00000F]">{stats.totalUsers.value}</p>
        </div>

        {/* Total Leads */}
        <div className="bg-white rounded-xl border border-gray-100 p-3 sm:p-4 shadow-sm card-lift shimmer-hover">
          <div className="flex items-start justify-between mb-2">
            <div className="bg-green-50 p-2 rounded-lg">
              <Target className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
            </div>
            <span className="text-xs sm:text-sm font-bold text-green-500">+{stats.totalLeads.change}%</span>
          </div>
          <p className="text-[10px] sm:text-xs font-medium text-[#00000F]/50 uppercase tracking-wide mb-1">Total Leads</p>
          <p className="text-lg sm:text-2xl font-bold text-[#00000F]">{stats.totalLeads.value.toLocaleString()}</p>
        </div>

        {/* Conversion Rate */}
        <div className="bg-white rounded-xl border border-gray-100 p-3 sm:p-4 shadow-sm card-lift shimmer-hover">
          <div className="flex items-start justify-between mb-2">
            <div className="bg-orange-50 p-2 rounded-lg">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
            </div>
            <span className="text-xs sm:text-sm font-bold text-green-500">+{stats.conversionRate.change}%</span>
          </div>
          <p className="text-[10px] sm:text-xs font-medium text-[#00000F]/50 uppercase tracking-wide mb-1">Conversion Rate</p>
          <p className="text-lg sm:text-2xl font-bold text-[#00000F]">{stats.conversionRate.value}</p>
        </div>
      </div>

      {/* Recent Activity & Top Performers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
        {/* Recent Activity */}
        <div className="bg-white rounded-xl border border-gray-100 p-3 sm:p-5 shadow-sm card-lift">
          <h3 className="text-sm sm:text-base font-bold text-[#00000F] mb-3">Recent Activity</h3>
          <div className="space-y-3">
            {recentActivity.map((item) => (
              <div key={item.id} className="flex gap-3 items-start">
                <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${getActivityColor(item.type)}`} />
                <div>
                  <p className="text-xs sm:text-sm">
                    <span className="font-bold text-[#00000F]">{item.user}</span>
                    <span className="text-[#00000F]/60 ml-1">{item.action}</span>
                  </p>
                  <p className="text-[10px] sm:text-xs text-[#00000F]/40 mt-0.5">{formatTimeAgo(item.timestamp)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Performers */}
        <div className="bg-white rounded-xl border border-gray-100 p-3 sm:p-5 shadow-sm card-lift">
          <h3 className="text-sm sm:text-base font-bold text-[#00000F] mb-3">Top Performers</h3>
          <div className="space-y-2">
            {topPerformers.map((performer) => (
              <div key={performer.rank} className="flex items-center justify-between p-2 sm:p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#FACE39]/20 flex items-center justify-center text-[#FACE39] font-bold text-xs sm:text-sm border border-[#FACE39]/30 flex-shrink-0">
                    {performer.rank}
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-[#00000F]">{performer.name}</span>
                </div>
                <div className="text-right">
                  <p className="text-[10px] sm:text-xs text-[#00000F]/50">{performer.convertedLeads}/{performer.totalLeads}</p>
                  <p className="text-xs sm:text-sm font-bold text-green-600">{performer.conversionRate}%</p>
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
        {/* Lead Stage Trend */}
        <div className="bg-white rounded-xl border border-gray-100 p-3 sm:p-5 shadow-sm card-lift">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-4 h-4 text-[#00000F]/40" />
            <h3 className="text-sm sm:text-base font-bold text-[#00000F]">Lead Stage Trend</h3>
          </div>
          <div className="w-full" style={{ height: 200 }}>
            {mounted && <ResponsiveContainer width="100%" height={200}>
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
            </ResponsiveContainer>}
          </div>
        </div>

        {/* Lead Source Distribution */}
        <div className="bg-white rounded-xl border border-gray-100 p-3 sm:p-5 shadow-sm card-lift">
          <div className="flex items-center gap-2 mb-2">
            <PieChartIcon className="w-4 h-4 text-[#00000F]/40" />
            <h3 className="text-sm sm:text-base font-bold text-[#00000F]">Lead Source Distribution</h3>
          </div>
          <div className="w-full" style={{ height: 200 }}>
            {mounted && <ResponsiveContainer width="100%" height={200}>
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
            </ResponsiveContainer>}
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {/* Conversion Rate Trend */}
        <div className="bg-white rounded-xl border border-gray-100 p-3 sm:p-5 shadow-sm card-lift">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-[#00000F]/40" />
            <h3 className="text-sm sm:text-base font-bold text-[#00000F]">Conversion Rate Trend</h3>
          </div>
          <div className="w-full" style={{ height: 200 }}>
            {mounted && <ResponsiveContainer width="100%" height={200}>
              <BarChart data={conversionTrend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} tickFormatter={(val) => `${val}%`} width={32} />
                <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} formatter={(value) => [`${value}%`, 'Rate']} />
                <Bar dataKey="rate" fill="#FACE39" radius={[4, 4, 0, 0]} barSize={25} />
              </BarChart>
            </ResponsiveContainer>}
          </div>
          <div className="mt-2 flex items-center justify-center gap-2">
            <div className="w-2.5 h-2.5 bg-[#FACE39] rounded-sm" />
            <span className="text-[10px] sm:text-xs text-[#00000F]/50 font-medium">Conversion Rate (%)</span>
          </div>
        </div>

        {/* Status Distribution */}
        <div className="bg-white rounded-xl border border-gray-100 p-3 sm:p-5 shadow-sm card-lift">
          <style>{statusBarStyles}</style>
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4 text-[#00000F]/40" />
            <h3 className="text-sm sm:text-base font-bold text-[#00000F]">Status Distribution</h3>
          </div>
          <div className="space-y-2.5">
            {statusDistribution.map((item, i) => (
              <div key={item.label} className="space-y-1">
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-[#00000F]/70 font-medium">{item.label}</span>
                  <span className="text-[#00000F] font-bold">{item.count}</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
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
