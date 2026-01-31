'use client'

import { useState, useEffect } from 'react'
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
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, Legend
} from 'recharts'
import axios from 'axios'
import { formatDistanceToNow } from 'date-fns'

interface AdminDashboardProps {
  activePage: string
  setActivePage: (page: string) => void
  globalSearchTerm?: string
}

export default function AdminDashboard({ activePage, setActivePage, globalSearchTerm }: AdminDashboardProps) {
  const [stats, setStats] = useState<any>(null)
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [topPerformers, setTopPerformers] = useState<any[]>([])
  const [chartsData, setChartsData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    // Set isMounted with a small delay to ensure layout is ready
    const timer = setTimeout(() => setIsMounted(true), 100)

    const fetchData = async () => {
      try {
        const response = await axios.get('/api/dashboard/admin')
        if (response.data.success) {
          const { stats, recentActivity, topPerformers, charts } = response.data.data
          setStats(stats)
          setRecentActivity(recentActivity)
          setTopPerformers(topPerformers)
          setChartsData(charts)
        }
      } catch (error) {
        console.error('Error fetching admin dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading admin dashboard...</div>
  }

  const adminStats = [
    {
      label: 'Active BDMs',
      value: stats?.activeBDMs || '0',
      change: '+2', // Mocked change
      changeType: 'increase',
      icon: UserCheck,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'Total Users',
      value: stats?.totalUsers || '0',
      change: '+12%',
      changeType: 'increase',
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      label: 'Total Leads',
      value: stats?.totalLeads ? stats.totalLeads.toLocaleString() : '0',
      change: '+23%',
      changeType: 'increase',
      icon: Briefcase,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      label: 'Conversion Rate',
      value: (stats?.conversionRate || '0') + '%',
      change: '+5%',
      changeType: 'increase',
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ]

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  return (
    <div className="space-y-8 p-6">
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
            <div key={index} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
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
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-6 font-black uppercase tracking-widest text-[10px] text-gray-400">Recent Activity</h2>
          <div className="space-y-4">
            {recentActivity.filter(activity =>
              !globalSearchTerm ||
              activity.user.toLowerCase().includes(globalSearchTerm.toLowerCase()) ||
              activity.action.toLowerCase().includes(globalSearchTerm.toLowerCase()) ||
              (activity.target && activity.target.toLowerCase().includes(globalSearchTerm.toLowerCase()))
            ).map((activity, i) => (
              <div key={i} className="flex items-start gap-4 pb-4 border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors p-2 rounded-lg">
                <div className={`w-3 h-3 rounded-full mt-2 bg-blue-500`}></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">
                    <span className="font-semibold">{activity.user}</span>
                    <span className="text-gray-600"> {activity.action}</span>
                    {activity.target && <span className="font-bold"> {activity.target}</span>}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {formatDistanceToNow(new Date(activity.time), { addSuffix: true })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Performers */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
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
                <p className="text-sm font-bold text-green-600">{performer.rate}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CHARTS SECTION - Screenshot 2 */}
      {/* Note: In screenshot 2, the Lead Stage Distribution is a set of cards again, and charts follow.
           I will replicate the layout from the screenshot exactly.
        */}

      {/* Lead Stage Cards */}
      <div className='bg-white rounded-xl border border-gray-200 p-6 shadow-sm'>
        <h2 className="text-lg font-bold text-gray-900 mb-4">Lead Stage Distribution</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {chartsData?.leadStageDistribution?.map((item: any, index: number) => (
            <div key={index} className={`p-4 rounded-xl flex flex-col items-center justify-center`} style={{ backgroundColor: item.name === 'Intake' ? '#EFF6FF' : item.name === 'Processing' ? '#FEF9C3' : item.name === 'Hot' ? '#FFEDD5' : item.name === 'Converted' ? '#DCFCE7' : '#FCE7F3' }}>
              <span className={`text-2xl font-bold mb-1 text-blue-600`} style={{ color: item.name === 'Intake' ? '#2563EB' : item.name === 'Processing' ? '#CA8A04' : item.name === 'Hot' ? '#EA580C' : item.name === 'Converted' ? '#16A34A' : '#DB2777' }}>{item.value}</span>
              <span className="text-xs text-gray-600 font-medium">{item.name}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lead Stage Trend */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Lead Stage Trend</h2>
          <div className="h-64">
            {isMounted && chartsData?.leadStageTrend && (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={chartsData.leadStageTrend}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="Predicted" stroke="#60A5FA" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="Converted" stroke="#34D399" strokeWidth={2} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="Hot" stroke="#F87171" strokeWidth={2} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="Intake" stroke="#FBBF24" strokeWidth={2} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="Processing" stroke="#A78BFA" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Lead Source Distribution */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Lead Source Distribution</h2>
          <div className="h-64 flex items-center justify-center">
            {isMounted && chartsData?.leadSourceDistribution && (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={chartsData.leadSourceDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {chartsData.leadSourceDistribution.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend layout="vertical" verticalAlign="middle" align="right" iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Conversion Rate Trend */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Conversion Rate Trend</h2>
          <div className="h-64">
            {isMounted && chartsData?.conversionRateTrend && (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={chartsData.conversionRateTrend}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="rate" fill="#Facc15" radius={[4, 4, 0, 0]} name="Conversion Rate (%)" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Status Distribution */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Status Distribution</h2>
          <div className="space-y-6">
            {chartsData?.leadStageDistribution?.map((item: any, index: number) => (
              <div key={index}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-700">{item.name}</span>
                  <span className="text-sm font-bold text-gray-900">{item.value}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className="h-2 rounded-full"
                    style={{ width: `${Math.min(item.value, 100)}%`, backgroundColor: item.color }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  )
}
