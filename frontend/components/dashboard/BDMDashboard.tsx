'use client'

import React, { useEffect, useMemo, useState } from 'react'
import {
  Users,
  CheckCircle,
  Clock,
  Phone,
  TrendingUp,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  RefreshCw,
  Eye,
  AlertCircle
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
import { getBDMDashboardAll } from '@/lib/api/dashboard'

export default function BDMDashboard({ onViewLead }: { onViewLead?: (id: string) => void } = {}) {
  const [stats, setStats] = useState({
    todaysLead: { value: 0, change: 0 },
    converted: { value: 0, change: 0 },
    inProcess: { value: 0, change: 0 },
    followupPending: { value: 0, change: 0 }
  })
  const [recentLeads, setRecentLeads] = useState<any[]>([])
  const [stageDistribution, setStageDistribution] = useState<any[]>([])
  const [stageTrend, setStageTrend] = useState<any[]>([])
  const [sourceDistribution, setSourceDistribution] = useState<any[]>([])
  const [conversionTrend, setConversionTrend] = useState<any[]>([])
  const [coursePerformance, setCoursePerformance] = useState<any[]>([])
  const [apiVersion, setApiVersion] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [fetchTick, setFetchTick] = useState(0)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true)
      setFetchError(null)
      try {
        const res = await getBDMDashboardAll()
        if (res?.success) {
          const d = res.data
          if (res.version)         setApiVersion(res.version)
          if (d.stats)             setStats(d.stats)
          if (d.recentLeads)       setRecentLeads(d.recentLeads)
          if (d.stageDistribution) setStageDistribution(d.stageDistribution)
          if (d.stageTrend)        setStageTrend(d.stageTrend)
          if (d.sourceDistribution)setSourceDistribution(d.sourceDistribution)
          if (d.conversionTrend)   setConversionTrend(d.conversionTrend)
          if (d.coursePerformance) {
            setCoursePerformance(d.coursePerformance)
          } else {
            setCoursePerformance([
              { label: 'IELTS Premium',   count: 0, color: '#EF4444' },
              { label: 'IELTS Crash',     count: 0, color: '#F87171' },
              { label: 'IELTS Intense',   count: 0, color: '#DC2626' },
              { label: 'IELTS Elementary',count: 0, color: '#FCA5A5' },
              { label: 'IELTS Mock Test', count: 0, color: '#FF6B6B' },
              { label: 'Basic English',   count: 0, color: '#F97316' },
              { label: 'GRE Premium',     count: 0, color: '#22C55E' },
              { label: 'TOEFL Premium',   count: 0, color: '#3B82F6' },
              { label: 'PTE Premium',     count: 0, color: '#A855F7' },
            ])
          }
        } else {
          setFetchError('Dashboard data was unavailable. Try refreshing.')
        }
      } catch (error: any) {
        console.error('BDM dashboard fetch error:', error?.message || error)
        setFetchError(error?.message || 'Could not load dashboard. Check your connection and try again.')
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
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))

    if (diffHours < 1) return 'Just now'
    if (diffHours === 1) return '1 hour ago'
    if (diffHours < 24) return `${diffHours} hours ago`
    return `${Math.floor(diffHours / 24)} days ago`
  }

  const getStageColor = (stage: string) => {
    const colors: Record<string, { bg: string; text: string; border: string }> = {
      Hot: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' },
      Processing: { bg: 'bg-amber-100', text: 'text-amber-900', border: 'border-amber-200' },
      Intake: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' },
      Converted: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' },
      Dead: { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-200' }
    }
    return colors[stage] || { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-200' }
  }

  /** Distinct fills for source pie so segments stay readable when one channel dominates */
  const SOURCE_CHART_COLORS = [
    '#3B82F6',
    '#22C55E',
    '#FACE39',
    '#A855F7',
    '#F97316',
    '#0EA5E9',
    '#EC4899'
  ]

  const stageColors: Record<string, string> = {
    Intake: 'bg-blue-50 text-blue-900 border-blue-200/80',
    Processing: 'bg-amber-50 text-amber-950 border-amber-200/80',
    Hot: 'bg-orange-50 text-orange-900 border-orange-200/80',
    Converted: 'bg-green-50 text-green-900 border-green-200/80',
    Dead: 'bg-red-50 text-red-900 border-red-200/80'
  }

  const maxCourseCount = coursePerformance.length > 0 ? Math.max(...coursePerformance.map(s => s.count)) : 1

  const sourcePieData = useMemo(
    () => (sourceDistribution || []).filter((s: { count?: number; percentage?: number }) => (s.count ?? 0) > 0 || (s.percentage ?? 0) > 0),
    [sourceDistribution]
  )

  const apiBadgeLabel = useMemo(() => {
    if (!apiVersion) return 'API v1.2'
    const base = String(apiVersion).replace(/^v/i, '').split('-')[0]
    return base ? `API v${base}` : 'API v1.2'
  }, [apiVersion])

  const hasStageTrendData = Array.isArray(stageTrend) && stageTrend.length > 0
  const hasSourceData = sourcePieData.length > 0
  const hasConversionData = Array.isArray(conversionTrend) && conversionTrend.length > 0

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-[#FACE39] border-t-[#00000F] rounded-full animate-spin" />
          <p className="text-sm font-bold text-[#00000F]/60">Refining your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-1">
            <div className="w-1.5 h-6 bg-[#FACE39] rounded-full shrink-0" />
            <h1 className="text-lg sm:text-xl font-bold text-[#00000F]/85 tracking-tight">BDM Overview</h1>
            <span className="text-[12px] font-bold text-gray-600 bg-gray-100/90 border border-gray-200/80 px-2 py-0.5 rounded-md tabular-nums">
              {apiBadgeLabel}
            </span>
          </div>
          <p className="text-gray-400 text-xs ml-3.5">Precision tracking for your daily performance.</p>
        </div>
        <button
          type="button"
          onClick={() => setFetchTick(t => t + 1)}
          className="group shrink-0 self-start sm:self-auto flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-[#00000F] bg-white border border-gray-200 rounded-xl hover:border-[#FACE39]/40 hover:bg-[#FACE39]/5 transition-all shadow-sm hover:shadow-[0_10px_20px_rgba(250,206,57,0.12)] active:scale-[0.98]"
        >
          <RefreshCw className={`w-3.5 h-3.5 transition-transform duration-700 group-hover:rotate-180 ${loading ? 'animate-spin' : ''}`} />
          Refresh Metrics
        </button>
      </div>

      {fetchError && (
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-2xl border border-amber-200/90 bg-amber-50/90 px-4 py-3 text-sm text-amber-950">
          <div className="flex items-start gap-2 min-w-0">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <p className="font-semibold leading-snug">{fetchError}</p>
          </div>
          <button
            type="button"
            onClick={() => setFetchTick(t => t + 1)}
            className="sm:ml-auto shrink-0 px-4 py-2 rounded-xl text-xs font-bold bg-[#00000F] text-white hover:bg-[#00000F]/90 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Today's Leads */}
        <div className="relative group bg-white rounded-2xl border border-gray-200/90 p-4 sm:p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 hover:shadow-[0_20px_50px_rgba(250,206,57,0.15)] hover:border-[#FACE39]/35 hover:-translate-y-0.5 overflow-hidden">
          <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 bg-[#FACE39]/5 rounded-full blur-2xl group-hover:bg-[#FACE39]/10 transition-colors" />
          <div className="flex items-start justify-between mb-4 relative z-10">
            <div className="bg-[#FACE39]/10 p-2.5 rounded-xl transition-colors group-hover:bg-[#FACE39]/20">
              <Users className="w-5 h-5 sm:w-6 sm:h-6 text-[#FACE39]" />
            </div>
            <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[12px] font-bold ${stats.todaysLead?.change >= 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
              <TrendingUp className={`w-3 h-3 ${stats.todaysLead?.change < 0 ? 'rotate-180' : ''}`} />
              {stats.todaysLead?.change >= 0 ? '+' : ''}{stats.todaysLead?.change || 0}%
            </div>
          </div>
          <div className="relative z-10">
            <p className="text-[12px] font-medium text-gray-400 uppercase tracking-[0.1em] mb-1 leading-none">Today's Leads</p>
            <p className="text-[28px] sm:text-[34px] font-bold text-[#00000F]/85 tracking-tight">{stats.todaysLead?.value || 0}</p>
          </div>
        </div>

        {/* Converted Today */}
        <div className="relative group bg-white rounded-2xl border border-gray-200/90 p-4 sm:p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 hover:shadow-[0_20px_50px_rgba(34,197,94,0.1)] hover:border-green-300/50 hover:-translate-y-0.5 overflow-hidden">
          <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 bg-green-500/5 rounded-full blur-2xl group-hover:bg-green-500/10 transition-colors" />
          <div className="flex items-start justify-between mb-4 relative z-10">
            <div className="bg-green-500/10 p-2.5 rounded-xl transition-colors group-hover:bg-green-500/20">
              <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
            </div>
            <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[12px] font-bold ${stats.converted?.change >= 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
              <TrendingUp className={`w-3 h-3 ${stats.converted?.change < 0 ? 'rotate-180' : ''}`} />
              {stats.converted?.change >= 0 ? '+' : ''}{stats.converted?.change || 0}%
            </div>
          </div>
          <div className="relative z-10">
            <p className="text-[12px] font-medium text-gray-400 uppercase tracking-[0.1em] mb-1 leading-none">Converted Today</p>
            <p className="text-[28px] sm:text-[34px] font-bold text-[#00000F]/85 tracking-tight">{stats.converted?.value || 0}</p>
          </div>
        </div>

        {/* In Process Today */}
        <div className="relative group bg-white rounded-2xl border border-gray-200/90 p-4 sm:p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 hover:shadow-[0_20px_50px_rgba(249,115,22,0.1)] hover:border-orange-300/50 hover:-translate-y-0.5 overflow-hidden">
          <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 bg-orange-500/5 rounded-full blur-2xl group-hover:bg-orange-500/10 transition-colors" />
          <div className="flex items-start justify-between mb-4 relative z-10">
            <div className="bg-orange-500/10 p-2.5 rounded-xl transition-colors group-hover:bg-orange-500/20">
              <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
            </div>
            <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[12px] font-bold ${stats.inProcess?.change >= 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
              <TrendingUp className={`w-3 h-3 ${stats.inProcess?.change < 0 ? 'rotate-180' : ''}`} />
              {stats.inProcess?.change >= 0 ? '+' : ''}{stats.inProcess?.change || 0}%
            </div>
          </div>
          <div className="relative z-10">
            <p className="text-[12px] font-medium text-gray-400 uppercase tracking-[0.1em] mb-1 leading-none">In Process Today</p>
            <p className="text-[28px] sm:text-[34px] font-bold text-[#00000F]/85 tracking-tight">{stats.inProcess?.value || 0}</p>
          </div>
        </div>

        {/* Followups Today */}
        <div className="relative group bg-white rounded-2xl border border-gray-200/90 p-4 sm:p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 hover:shadow-[0_20px_50px_rgba(168,85,247,0.1)] hover:border-purple-300/50 hover:-translate-y-0.5 overflow-hidden">
          <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl group-hover:bg-purple-500/10 transition-colors" />
          <div className="flex items-start justify-between mb-4 relative z-10">
            <div className="bg-purple-500/10 p-2.5 rounded-xl transition-colors group-hover:bg-purple-500/20">
              <Phone className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
            </div>
            <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[12px] font-bold ${stats.followupPending?.change >= 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
              <TrendingUp className={`w-3 h-3 ${stats.followupPending?.change < 0 ? 'rotate-180' : ''}`} />
              {stats.followupPending?.change >= 0 ? '+' : ''}{stats.followupPending?.change || 0}%
            </div>
          </div>
          <div className="relative z-10">
            <p className="text-[12px] font-medium text-gray-400 uppercase tracking-[0.1em] mb-1 leading-none">Followups Today</p>
            <p className="text-[28px] sm:text-[34px] font-bold text-[#00000F]/85 tracking-tight">{stats.followupPending?.value || 0}</p>
          </div>
        </div>
      </div>

      {/* Recent Leads Activity */}
      <div className="bg-white rounded-2xl border border-[#00000F]/[0.07] p-4 sm:p-5 shadow-[0_2px_16px_rgba(0,0,0,0.04)]">
          <div className="flex items-center gap-2 mb-3">
            <Activity className="w-5 h-5 text-[#FACE39]" />
            <h2 className="text-sm font-semibold text-[#00000F]/80">Recent Leads Activity</h2>
          </div>
          <div className="grid grid-cols-1 gap-2.5">
            {recentLeads.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <Users className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm font-semibold text-gray-600">No recent leads found.</p>
                <p className="text-xs text-gray-500 mt-1">New activity will show here as leads come in.</p>
              </div>
            ) : recentLeads.map((lead) => (
              <div key={String(lead.id)} className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-[#fafafa] border border-[#00000F]/[0.06] hover:border-[#00000F]/[0.1] hover:bg-white rounded-xl transition-all duration-200 hover:shadow-sm">
                 <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-1">
                    <button
                      type="button"
                      onClick={() => onViewLead?.(lead.id)}
                      className="text-[14px] font-medium text-[#00000F]/80 hover:text-[#FACE39] transition-colors truncate"
                    >
                      {lead.name}
                    </button>
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[11px] font-bold bg-[#00000F] text-white uppercase tracking-wider">
                      {lead.service}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-y-1 gap-x-4">
                    <div className="flex items-center gap-1.5 text-[13px] font-medium text-gray-600">
                      <div className="p-1 rounded-md bg-white border border-gray-100 text-gray-500 group-hover:border-gray-200 transition-colors">
                        <Phone className="w-3 h-3" />
                      </div>
                      {lead.phone}
                    </div>
                    <div className="flex items-center gap-1.5 text-[13px] font-medium text-gray-600">
                      <div className="p-1 rounded-md bg-white border border-gray-100 text-gray-500 group-hover:border-gray-200 transition-colors">
                        <Clock className="w-3 h-3" />
                      </div>
                      {formatTimeAgo(lead.createdAt)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 sm:pl-2 flex-shrink-0 w-full sm:w-auto justify-between sm:justify-end">
                  <span
                    className={`inline-flex text-[12px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider border transition-shadow ${getStageColor(lead.stage).bg} ${getStageColor(lead.stage).text} ${getStageColor(lead.stage).border} shadow-sm`}
                  >
                    {lead.stage}
                  </span>
                  <button
                    type="button"
                    onClick={() => onViewLead?.(lead.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 text-gray-500 hover:text-[#FACE39] hover:border-[#FACE39]/40 hover:bg-[#FACE39]/5 rounded-xl transition-all text-xs font-semibold shadow-sm hover:shadow-[0_4px_12px_rgba(250,206,57,0.15)] active:scale-[0.97]"
                    aria-label={`View ${lead.name}`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    View Profile
                  </button>
                </div>
              </div>
            ))}
          </div>
      </div>

      {/* Lead Stage Distribution */}
      <div className="bg-white rounded-2xl border border-[#00000F]/[0.07] p-4 sm:p-5 shadow-[0_2px_16px_rgba(0,0,0,0.04)]">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="w-5 h-5 text-[#FACE39]" />
            <h2 className="text-sm font-semibold text-[#00000F]/80">Pipeline This Month</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
            {stageDistribution.length === 0 ? (
              <div className="col-span-full py-8 text-center rounded-xl border border-dashed border-gray-200 bg-[#fafafa]">
                <BarChart3 className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm font-semibold text-gray-600">No stage counts for this month yet</p>
              </div>
            ) : (
              stageDistribution.map((item) => (
                <div key={item.stage} className={`p-3.5 rounded-xl border text-center ${stageColors[item.stage] ?? stageColors.Intake}`}>
                  <h4 className="text-xl font-bold tabular-nums">{item.count}</h4>
                  <p className="text-[11px] font-medium mt-1.5 leading-tight uppercase tracking-wider opacity-70">
                    {item.stage === 'Hot' ? 'Hot Leads' : item.stage === 'Dead' ? 'Dead Leads' : item.stage}
                  </p>
                </div>
              ))
            )}
          </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Lead Stage Trend */}
        <div className="bg-white rounded-2xl border border-[#00000F]/[0.07] p-4 sm:p-5 shadow-[0_2px_16px_rgba(0,0,0,0.04)]">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <BarChart3 className="w-4 h-4 text-blue-600" />
            </div>
            <h3 className="text-[13px] font-semibold text-[#00000F]/75">Lead Lifecycle Trend</h3>
          </div>
          <div className="w-full" style={{ height: 220 }}>
            {mounted && hasStageTrendData ? (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={stageTrend}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" strokeOpacity={0.5} />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6B7280', fontWeight: 600 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6B7280', fontWeight: 600 }} width={28} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '10px', fontWeight: 700, paddingTop: '8px' }} />
                  <Line type="monotone" dataKey="Converted" stroke="#22C55E" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="Hot" stroke="#F97316" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="Intake" stroke="#3B82F6" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="Processing" stroke="#A855F7" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="Dead" stroke="#EF4444" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[220px] flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-[#fafafa] px-4 text-center">
                <BarChart3 className="w-8 h-8 text-gray-300 mb-2" />
                <p className="text-sm font-semibold text-gray-600">No trend data yet</p>
                <p className="text-xs text-gray-500 mt-0.5">Lifecycle counts will appear by month once leads flow in.</p>
              </div>
            )}
          </div>
        </div>

        {/* Lead Source Distribution */}
        <div className="bg-white rounded-2xl border border-[#00000F]/[0.07] p-4 sm:p-5 shadow-[0_2px_16px_rgba(0,0,0,0.04)]">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <PieChartIcon className="w-4 h-4 text-purple-600" />
            </div>
            <h3 className="text-[13px] font-semibold text-[#00000F]/75">Source Channels</h3>
          </div>
          <div className="w-full" style={{ height: 248 }}>
            {mounted && hasSourceData ? (
              <ResponsiveContainer width="100%" height={248}>
                <PieChart margin={{ top: 0, right: 8, bottom: 4, left: 8 }}>
                  <Pie
                    data={sourcePieData}
                    cx="50%"
                    cy="46%"
                    innerRadius={58}
                    outerRadius={82}
                    paddingAngle={2}
                    dataKey="percentage"
                    nameKey="source"
                    stroke="#fff"
                    strokeWidth={1}
                  >
                    {sourcePieData.map((_entry: unknown, index: number) => (
                      <Cell key={`cell-${index}`} fill={SOURCE_CHART_COLORS[index % SOURCE_CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => [`${value}%`, 'Share']}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 700 }}
                  />
                  <Legend
                    layout="horizontal"
                    align="center"
                    verticalAlign="bottom"
                    iconType="circle"
                    iconSize={7}
                    wrapperStyle={{ fontSize: '9px', fontWeight: 700, paddingTop: '4px', lineHeight: '1.35' }}
                    formatter={(value) => <span className="text-[11px] font-bold text-gray-600 uppercase tracking-wide">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[248px] flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-[#fafafa] px-4 text-center">
                <PieChartIcon className="w-8 h-8 text-gray-300 mb-2" />
                <p className="text-sm font-semibold text-gray-600">No source breakdown</p>
                <p className="text-xs text-gray-500 mt-0.5">Channel mix appears when leads include a source.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Conversion Rate Trend */}
        <div className="bg-white rounded-2xl border border-[#00000F]/[0.07] p-4 sm:p-5 shadow-[0_2px_16px_rgba(0,0,0,0.04)]">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 bg-yellow-500/10 rounded-lg">
              <TrendingUp className="w-4 h-4 text-yellow-600" />
            </div>
            <h3 className="text-[13px] font-semibold text-[#00000F]/75">Conversion Success Rate</h3>
          </div>
          <div className="w-full" style={{ height: 220 }}>
            {mounted && hasConversionData ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={conversionTrend}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" strokeOpacity={0.5} />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6B7280', fontWeight: 600 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6B7280', fontWeight: 600 }} tickFormatter={(val) => `${val}%`} width={32} />
                  <Tooltip 
                    cursor={{ fill: 'rgba(0,0,0,0.02)', radius: 8 }} 
                    formatter={(value) => [`${value}%`, 'Conversion Rate']}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="rate" fill="#FACE39" radius={[6, 6, 0, 0]} barSize={32} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[220px] flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-[#fafafa] px-4 text-center">
                <TrendingUp className="w-8 h-8 text-gray-300 mb-2" />
                <p className="text-sm font-semibold text-gray-600">No conversion history</p>
                <p className="text-xs text-gray-500 mt-0.5">Monthly rates show after conversions are recorded.</p>
              </div>
            )}
          </div>
        </div>

        {/* Course Performance (All Leads) */}
        <div className="bg-white rounded-2xl border border-[#00000F]/[0.07] p-4 sm:p-5 shadow-[0_2px_16px_rgba(0,0,0,0.04)]">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 bg-[#FACE39]/10 rounded-lg">
              <Activity className="w-4 h-4 text-[#FACE39]" />
            </div>
            <h3 className="text-[13px] font-semibold text-[#00000F]/75">Course Performance (All Leads)</h3>
          </div>
          <div className="space-y-4">
            {coursePerformance.length > 0 ? coursePerformance.map((item) => (
              <div key={item.label} className="group space-y-2">
                <div className="flex justify-between items-end gap-3">
                  <div className="flex flex-col min-w-0">
                    <span className="text-[12px] font-black text-gray-600 uppercase tracking-widest leading-none mb-1">{item.label}</span>
                    <span className="text-xs font-bold text-gray-700 truncate">{item.label} enrollments</span>
                  </div>
                  <span className="text-lg font-black text-[#00000F] tracking-tighter tabular-nums shrink-0">{item.count}</span>
                </div>
                <div className="relative w-full h-2.5 bg-gray-100 rounded-full overflow-hidden ring-1 ring-inset ring-gray-200/60">
                  <div
                    className="absolute inset-y-0 left-0 rounded-full transition-all duration-1000 ease-out group-hover:brightness-105"
                    style={{ 
                      width: `${maxCourseCount > 0 ? (item.count / maxCourseCount) * 100 : 0}%`,
                      minWidth: item.count > 0 ? 3 : 0,
                      backgroundColor: item.color || '#FACE39',
                      boxShadow: item.count > 0 ? `0 0 12px ${item.color || '#FACE39'}40` : undefined,
                      opacity: item.count > 0 ? 1 : 0.25
                    }}
                  />
                </div>
              </div>
            )) : (
              <div className="py-10 text-center rounded-xl border border-dashed border-gray-200 bg-[#fafafa]">
                <p className="text-sm font-semibold text-gray-600">No course metrics yet</p>
                <p className="text-xs text-gray-500 mt-1 px-4">Course counts update as leads are tied to programs.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
