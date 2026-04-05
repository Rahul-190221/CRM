'use client'

import { useState, useEffect } from 'react'
import { Download, Users, TrendingUp, Target, Phone, Mail, CheckCircle, Clock, BarChart3 } from 'lucide-react'

interface BDMPerformance {
  _id: string
  name: string
  role: string
  leadsAssigned: number
  leadsConverted: number
  conversionRate: number
  totalCalls: number
  totalEmails: number
  avgResponseTime: string
  revenue: number
}

interface ReportSummary {
  totalBDMs: number
  activeLeads: number
  convertedLeads: number
  overallConversionRate: number
  totalRevenue: number
  totalCalls: number
  totalEmails: number
  avgResponseTime: string
}

// Avatar color generator based on name
const getAvatarColor = (name: string): string => {
  const colors = [
    'bg-[#FACE39]',
    'bg-blue-500',
    'bg-purple-500',
    'bg-green-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-red-500',
    'bg-orange-500'
  ]
  const index = name.charCodeAt(0) % colors.length
  return colors[index]
}

const getInitials = (name: string): string => {
  const parts = name.split(' ')
  return parts.length > 1
    ? `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase()
    : name.charAt(0).toUpperCase()
}

export default function BDMReport() {
  const [dateRange, setDateRange] = useState('this_month')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [selectedBDM, setSelectedBDM] = useState('all')
  const [bdmList, setBdmList] = useState<{ _id: string; name: string }[]>([])
  const [performances, setPerformances] = useState<BDMPerformance[]>([])
  const [summary, setSummary] = useState<ReportSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchBDMList()
    fetchReportData()
  }, [dateRange, selectedBDM])

  const fetchBDMList = async () => {
    try {
      const token = localStorage.getItem('accessToken')
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://crm-eta-blush.vercel.app'
      const response = await fetch(`${apiUrl}/api/auth/users?role=bdm,senior-bdm,junior-bdm`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      if (response.ok) {
        const data = await response.json()
        setBdmList(data.map((u: any) => ({ _id: u._id, name: u.name || `${u.firstName} ${u.lastName}` })))
      }
    } catch (error) {
      console.error('Error fetching BDM list:', error)
      setBdmList([])
    }
  }

  const fetchReportData = async () => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem('accessToken')
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://crm-eta-blush.vercel.app'
      const response = await fetch(`${apiUrl}/api/reports/bdm?range=${dateRange}&bdm=${selectedBDM}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      if (response.ok) {
        const data = await response.json()
        setPerformances(data.performances)
        setSummary(data.summary)
      }
    } catch (error) {
      console.error('Error fetching report data:', error)
      setPerformances([])
      setSummary(null)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGenerateReport = () => {
    fetchReportData()
  }

  const handleExportReport = () => {
    // In production, this would generate a PDF/Excel file
    alert('Report export feature coming soon!')
  }

  const getRoleLabel = (role: string): string => {
    const roleMap: Record<string, string> = {
      'bdm': 'BDM',
      'senior-bdm': 'Senior BDM',
      'junior-bdm': 'Junior BDM'
    }
    return roleMap[role] || role
  }

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const getConversionColor = (rate: number): string => {
    if (rate >= 60) return 'text-green-600'
    if (rate >= 40) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="min-h-full">
      {/* Page Header */}
      <div className="flex items-start sm:items-center justify-between gap-4 mb-4 sm:mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">BDM Reports</h1>
          <p className="text-sm text-gray-500 mt-1">View performance metrics and generate reports</p>
        </div>
        <button
          onClick={handleExportReport}
          className="flex-shrink-0 flex items-center gap-2 px-3 sm:px-4 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800"
        >
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">Export Report</span>
          <span className="sm:hidden">Export</span>
        </button>
      </div>

      {/* Report Configuration */}
      <div className="bg-white rounded-xl p-4 sm:p-6 mb-4 sm:mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Report Configuration</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
            <select
              title="Select date range"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#FACE39]/40 focus:border-transparent bg-white"
            >
              <option value="today">Today</option>
              <option value="this_week">This Week</option>
              <option value="this_month">This Month</option>
              <option value="last_month">Last Month</option>
              <option value="this_quarter">This Quarter</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>

          {/* Custom Date Range */}
          {dateRange === 'custom' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  title="Start date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#FACE39]/40 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  title="End date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#FACE39]/40 focus:border-transparent"
                />
              </div>
            </>
          )}

          {/* BDM Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">BDM</label>
            <select
              title="Filter by BDM"
              value={selectedBDM}
              onChange={(e) => setSelectedBDM(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#FACE39]/40 focus:border-transparent bg-white"
            >
              <option value="all">All BDMs</option>
              {bdmList.map(bdm => (
                <option key={bdm._id} value={bdm._id}>{bdm.name}</option>
              ))}
            </select>
          </div>

          {/* Generate Button */}
          <div className="flex items-end">
            <button
              onClick={handleGenerateReport}
              className="w-full px-4 py-2.5 bg-[#FACE39] text-gray-900 rounded-lg text-sm font-medium hover:bg-yellow-300"
            >
              Generate Report
            </button>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{summary.totalBDMs}</p>
                <p className="text-xs text-gray-500">Total BDMs</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{summary.convertedLeads}</p>
                <p className="text-xs text-gray-500">Conversions</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{summary.overallConversionRate}%</p>
                <p className="text-xs text-gray-500">Conversion Rate</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(summary.totalRevenue)}</p>
                <p className="text-xs text-gray-500">Total Revenue</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Performance Table */}
      <div className="bg-white rounded-xl overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Performance Metrics</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#FACE39]">
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-900">BDM</th>
                <th className="text-center px-4 py-3 text-sm font-semibold text-gray-900">Leads Assigned</th>
                <th className="text-center px-4 py-3 text-sm font-semibold text-gray-900">Converted</th>
                <th className="text-center px-4 py-3 text-sm font-semibold text-gray-900">Conv. Rate</th>
                <th className="text-center px-4 py-3 text-sm font-semibold text-gray-900">Calls</th>
                <th className="text-center px-4 py-3 text-sm font-semibold text-gray-900">Emails</th>
                <th className="text-center px-4 py-3 text-sm font-semibold text-gray-900">Avg Response</th>
                <th className="text-right px-4 py-3 text-sm font-semibold text-gray-900">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="text-center py-8">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FACE39]"></div>
                    </div>
                  </td>
                </tr>
              ) : performances.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-gray-500">
                    No data available
                  </td>
                </tr>
              ) : (
                performances.map((perf, index) => (
                  <tr key={perf._id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-semibold ${getAvatarColor(perf.name)}`}>
                          {getInitials(perf.name)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{perf.name}</p>
                          <p className="text-xs text-gray-500">{getRoleLabel(perf.role)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-gray-900 font-medium">{perf.leadsAssigned}</td>
                    <td className="px-4 py-3 text-center text-sm text-gray-900 font-medium">{perf.leadsConverted}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-sm font-bold ${getConversionColor(perf.conversionRate)}`}>
                        {perf.conversionRate}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-gray-900">{perf.totalCalls}</td>
                    <td className="px-4 py-3 text-center text-sm text-gray-900">{perf.totalEmails}</td>
                    <td className="px-4 py-3 text-center text-sm text-gray-600">{perf.avgResponseTime}</td>
                    <td className="px-4 py-3 text-right text-sm text-gray-900 font-semibold">{formatCurrency(perf.revenue)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Activity Metrics */}
      {summary && (
        <div className="bg-white rounded-xl p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Activity Metrics</h2>
          <div className="grid grid-cols-4 gap-6">
            <div className="text-center p-4 bg-gray-50 rounded-xl">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Phone className="w-6 h-6 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{summary.totalCalls}</p>
              <p className="text-sm text-gray-500">Total Calls</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-xl">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Mail className="w-6 h-6 text-purple-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{summary.totalEmails}</p>
              <p className="text-sm text-gray-500">Total Emails</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-xl">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{summary.activeLeads}</p>
              <p className="text-sm text-gray-500">Active Leads</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-xl">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{summary.avgResponseTime}</p>
              <p className="text-sm text-gray-500">Avg Response Time</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
