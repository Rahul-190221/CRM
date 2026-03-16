'use client'

import { useState, useEffect, useMemo } from 'react'
import { Pencil, X, Plus, Trash2 } from 'lucide-react'
import MockTestScheduleTable from './MockTestScheduleTable'
import { getAvailableSchedulesFromLuminedge, getMockTestPackages, updateMockTestPackage, seedMockTestPackages } from '@/lib/api/mockTests'
import type { LuminedgeSchedule, MockTestSchedule, FilterState, ExamType } from '@/types/admin'

// Mock Test Package type
interface MockTestPackage {
  testType: string
  borderColor: string
  bgColor: string
  features: string[]
  pricing: { testCount: number; fee: number }[]
}

// Initial Mock Test Package data
const initialMockTestPackages: MockTestPackage[] = [
  {
    testType: 'IELTS',
    borderColor: 'border-l-[#FACE39]',
    bgColor: 'bg-[#FACE39]',
    features: [
      'Flexible mock test schedule',
      'Real exam experience',
      'Official test standard question',
      'Result published in quick time',
      'Detailed mock feedback',
      'Wireless headphones'
    ],
    pricing: [
      { testCount: 1, fee: 1550 },
      { testCount: 3, fee: 3000 },
      { testCount: 5, fee: 4500 }
    ]
  },
  {
    testType: 'PTE',
    borderColor: 'border-l-blue-500',
    bgColor: 'bg-blue-500',
    features: [
      'Flexible mock test schedule',
      'Real exam experience',
      'Official test standard question',
      'Result published in quick time',
      'Detailed mock feedback',
      'Wireless headphones'
    ],
    pricing: [
      { testCount: 1, fee: 1750 },
      { testCount: 3, fee: 3500 },
      { testCount: 5, fee: 5000 }
    ]
  },
  {
    testType: 'GRE',
    borderColor: 'border-l-green-500',
    bgColor: 'bg-green-500',
    features: [
      'Flexible mock test schedule',
      'Real exam experience',
      'Official test standard question',
      'Result published in quick time',
      'Detailed mock feedback',
      'Wireless headphones'
    ],
    pricing: [
      { testCount: 1, fee: 2000 },
      { testCount: 3, fee: 4000 },
      { testCount: 5, fee: 6000 }
    ]
  },
  {
    testType: 'TOEFL',
    borderColor: 'border-l-purple-500',
    bgColor: 'bg-purple-500',
    features: [
      'Flexible mock test schedule',
      'Real exam experience',
      'Official test standard question',
      'Result published in quick time',
      'Detailed mock feedback',
      'Wireless headphones'
    ],
    pricing: [
      { testCount: 1, fee: 1800 },
      { testCount: 3, fee: 3600 },
      { testCount: 5, fee: 5400 }
    ]
  }
]

const courses = [
  { _id: '67337c880794d577cd982b75', name: 'IELTS' },
  { _id: '67337c880794d577cd982b76', name: 'Pearson PTE' },
  { _id: '67337c880794d577cd982b77', name: 'GRE' },
  { _id: '67337c880794d577cd982b78', name: 'TOEFL' },
]

const testTypes: ExamType[] = ['Computer-Based', 'Paper-Based']


function formatTimeTo12h(time: string): string {
  const [hours, minutes] = time.split(':').map(Number)
  const period = hours >= 12 ? 'PM' : 'AM'
  const h = hours % 12 || 12
  return `${h}:${minutes.toString().padStart(2, '0')} ${period}`
}

function transformSchedules(data: LuminedgeSchedule[]): MockTestSchedule[] {
  return data.map((item, index) => {
    const slot = item.timeSlots?.[0]
    const totalSeats = slot ? parseInt(slot.totalSlot, 10) || 0 : 0
    const booked = slot ? slot.slot : 0
    const availableSeats = Math.max(0, totalSeats - booked)

    const examTime = slot
      ? `${formatTimeTo12h(slot.startTime)} - ${formatTimeTo12h(slot.endTime)}`
      : ''

    return {
      _id: item._id,
      listNumber: index + 1,
      name: item.name,
      testType: item.name as MockTestSchedule['testType'],
      examType: (item.testType || 'Computer-Based') as MockTestSchedule['examType'],
      examDate: item.startDate,
      examTime,
      totalSeats,
      availableSeats,
      status: (item.status?.toLowerCase() === 'scheduled' ? 'upcoming' : item.status?.toLowerCase() || 'upcoming') as MockTestSchedule['status'],
      createdAt: item.createdAt,
      updatedAt: item.createdAt,
    }
  })
}

export default function MockTest({ user }: { user?: any }) {
  const isAdmin = user?.role === 'admin'
  const [schedules, setSchedules] = useState<MockTestSchedule[]>([])
  const [packages, setPackages] = useState<MockTestPackage[]>(initialMockTestPackages)
  const [isLoading, setIsLoading] = useState(true)
  const [editingPackage, setEditingPackage] = useState<string | null>(null)
  const [editFormData, setEditFormData] = useState<MockTestPackage | null>(null)
  const today = new Date().toISOString().split('T')[0]
  const [filters, setFilters] = useState<FilterState>({
    testType: 'all',
    examType: 'all',
    status: 'upcoming',
    sortBy: 'date-asc'
  })
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    fetchSchedules()
    fetchPackages()
  }, [])

  const fetchPackages = async () => {
    try {
      const data = await getMockTestPackages()
      if (data && data.length > 0) {
        // Merge API data with UI styling info
        const packagesWithStyles = data.map((pkg: any) => {
          const styleMap: Record<string, { borderColor: string; bgColor: string }> = {
            'IELTS': { borderColor: 'border-l-[#face39]', bgColor: 'bg-[#face39]' },
            'PTE': { borderColor: 'border-l-[#00000f]', bgColor: 'bg-[#00000f]' },
            'GRE': { borderColor: 'border-l-[#face39]', bgColor: 'bg-[#face39]' },
            'TOEFL': { borderColor: 'border-l-[#00000f]', bgColor: 'bg-[#00000f]' }
          }
          return {
            ...pkg,
            ...styleMap[pkg.testType] || { borderColor: 'border-l-[#face39]', bgColor: 'bg-[#face39]' }
          }
        })
        setPackages(packagesWithStyles)
      } else {
        // Seed packages if none exist
        await seedMockTestPackages()
        fetchPackages()
      }
    } catch (error) {
      console.error('Error fetching packages:', error)
      // Use initial data as fallback
    }
  }

  const handleEditPackage = (pkg: MockTestPackage) => {
    setEditingPackage(pkg.testType)
    setEditFormData({ ...pkg, features: [...pkg.features], pricing: pkg.pricing.map(p => ({ ...p })) })
  }

  const handleSavePackage = async () => {
    if (!editFormData || !editingPackage) return
    setIsSaving(true)
    try {
      await updateMockTestPackage(editingPackage, {
        features: editFormData.features,
        pricing: editFormData.pricing
      })
      setPackages(prev => prev.map(p => p.testType === editingPackage ? editFormData : p))
      setEditingPackage(null)
      setEditFormData(null)
    } catch (error) {
      console.error('Error saving package:', error)
      alert('Failed to save package. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancelEdit = () => {
    setEditingPackage(null)
    setEditFormData(null)
  }

  const handleFeatureChange = (index: number, value: string) => {
    if (!editFormData) return
    const newFeatures = [...editFormData.features]
    newFeatures[index] = value
    setEditFormData({ ...editFormData, features: newFeatures })
  }

  const handleAddFeature = () => {
    if (!editFormData) return
    setEditFormData({ ...editFormData, features: [...editFormData.features, ''] })
  }

  const handleRemoveFeature = (index: number) => {
    if (!editFormData) return
    const newFeatures = editFormData.features.filter((_, i) => i !== index)
    setEditFormData({ ...editFormData, features: newFeatures })
  }

  const handlePricingChange = (index: number, field: 'testCount' | 'fee', value: number) => {
    if (!editFormData) return
    const newPricing = [...editFormData.pricing]
    newPricing[index] = { ...newPricing[index], [field]: value }
    setEditFormData({ ...editFormData, pricing: newPricing })
  }

  const handleAddPricing = () => {
    if (!editFormData) return
    setEditFormData({ ...editFormData, pricing: [...editFormData.pricing, { testCount: 1, fee: 0 }] })
  }

  const handleRemovePricing = (index: number) => {
    if (!editFormData) return
    const newPricing = editFormData.pricing.filter((_, i) => i !== index)
    setEditFormData({ ...editFormData, pricing: newPricing })
  }

  const fetchSchedules = async () => {
    try {
      const data = await getAvailableSchedulesFromLuminedge()
      const transformed = transformSchedules(data)
      setSchedules(transformed)
    } catch (error) {
      console.error('Error fetching schedules:', error)
      setSchedules([])
    } finally {
      setIsLoading(false)
    }
  }

  const filteredSchedules = useMemo(() => {
    let result = [...schedules]

    // Filter by course type (name)
    if (filters.testType && filters.testType !== 'all') {
      result = result.filter(s => s.name.toLowerCase().includes(filters.testType!.toLowerCase()))
    }

    // Filter by test type (Computer-Based / Paper-Based)
    if (filters.examType && filters.examType !== 'all') {
      result = result.filter(s => s.examType === filters.examType)
    }

    // Filter by status/time period
    if (filters.status && filters.status !== 'all') {
      if (filters.status === 'today') {
        result = result.filter(s => s.examDate === today)
      } else if (filters.status === 'previous') {
        result = result.filter(s => s.examDate && s.examDate < today)
      } else if (filters.status === 'upcoming') {
        result = result.filter(s => s.examDate && s.examDate >= today)
      }
    }

    // Filter by date picker
    if (filters.dateRange?.start) {
      result = result.filter(s => s.examDate && s.examDate >= filters.dateRange!.start)
    }

    // Sort
    if (filters.sortBy === 'date-asc') {
      result.sort((a, b) => (a.examDate || '').localeCompare(b.examDate || ''))
    } else if (filters.sortBy === 'date-desc') {
      result.sort((a, b) => (b.examDate || '').localeCompare(a.examDate || ''))
    } else if (filters.sortBy === 'name') {
      result.sort((a, b) => (a.name || '').localeCompare(b.name || ''))
    }

    // Re-number after filtering
    return result.map((s, i) => ({ ...s, listNumber: i + 1 }))
  }, [schedules, filters])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FACE39]"></div>
      </div>
    )
  }

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Mock Test</h1>
        <p className="text-sm text-gray-500 mt-1">Browse mock test details and available schedules</p>
      </div>

      {/* Mock Test Packages Section */}
      <div className="bg-white rounded-xl p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Mock Test Packages</h2>
        <p className="text-sm text-gray-500 mb-6">Available mock test packages with pricing details</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {packages.map((pkg) => (
            <div key={pkg.testType} className={`bg-white rounded-lg border border-gray-200 border-l-4 ${pkg.borderColor} overflow-hidden relative`}>
              {/* Edit Button - Admin Only */}
              {isAdmin && editingPackage !== pkg.testType && (
                <button
                  onClick={() => handleEditPackage(pkg)}
                  className="absolute top-3 right-3 p-2 text-gray-400 hover:text-yellow-500 hover:bg-yellow-50 rounded-lg transition-colors"
                  title="Edit Package"
                >
                  <Pencil size={16} />
                </button>
              )}

              {editingPackage === pkg.testType && editFormData ? (
                // Edit Mode
                <div className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">{pkg.testType} Mock Test Packages</h3>
                    <div className="flex gap-2">
                      <button
                        onClick={handleSavePackage}
                        disabled={isSaving}
                        className="px-3 py-1.5 bg-[#FACE39] text-white text-sm rounded-lg hover:bg-[#FACE39]/90 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSaving ? 'Saving...' : 'Save'}
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="px-3 py-1.5 bg-gray-100 text-gray-600 text-sm rounded-lg hover:bg-gray-200"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>

                  {/* Edit Features */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Features</label>
                    {editFormData.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2 mb-2">
                        <input
                          type="text"
                          value={feature}
                          onChange={(e) => handleFeatureChange(idx, e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#FACE39]/40"
                        />
                        <button
                          onClick={() => handleRemoveFeature(idx)}
                          className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={handleAddFeature}
                      className="flex items-center gap-1 text-sm text-yellow-600 hover:text-yellow-700 mt-2"
                    >
                      <Plus size={14} /> Add Feature
                    </button>
                  </div>

                  {/* Edit Pricing */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Pricing</label>
                    {editFormData.pricing.map((price, idx) => (
                      <div key={idx} className="flex items-center gap-2 mb-2">
                        <input
                          type="number"
                          value={price.testCount}
                          onChange={(e) => handlePricingChange(idx, 'testCount', parseInt(e.target.value) || 0)}
                          className="w-20 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#FACE39]/40"
                          placeholder="Count"
                        />
                        <span className="text-sm text-gray-500">tests</span>
                        <input
                          type="number"
                          value={price.fee}
                          onChange={(e) => handlePricingChange(idx, 'fee', parseInt(e.target.value) || 0)}
                          className="w-28 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#FACE39]/40"
                          placeholder="Fee"
                        />
                        <span className="text-sm text-gray-500">BDT</span>
                        <button
                          onClick={() => handleRemovePricing(idx)}
                          className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={handleAddPricing}
                      className="flex items-center gap-1 text-sm text-yellow-600 hover:text-yellow-700 mt-2"
                    >
                      <Plus size={14} /> Add Pricing Tier
                    </button>
                  </div>
                </div>
              ) : (
                // View Mode
                <>
                  <div className="p-5">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{pkg.testType} Mock Test Packages</h3>
                    <p className="text-sm text-gray-600 mb-4">We have paper-based and computer-delivered mock tests.</p>

                    <ul className="space-y-2 mb-4">
                      {pkg.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center text-sm text-gray-700">
                          <span className="w-1.5 h-1.5 bg-[#FACE39] rounded-full mr-2"></span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Pricing Table */}
                  <div className="overflow-hidden">
                    <table className="w-full">
                      <thead>
                        <tr className={`${pkg.bgColor} text-white`}>
                          <th className="px-5 py-3 text-left text-sm font-medium">No. of Mock Test</th>
                          <th className="px-5 py-3 text-left text-sm font-medium">Fee</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pkg.pricing.map((price, idx) => (
                          <tr key={idx} className="border-t border-gray-100">
                            <td className="px-5 py-3 text-sm text-gray-700">{price.testCount} Mock Test Fee</td>
                            <td className="px-5 py-3 text-sm text-gray-700">BDT {price.fee.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-5 mb-6">
        <h3 className="text-sm font-bold text-gray-900 mb-3">Filter by</h3>
        <div className="flex flex-wrap items-center gap-3">
          {/* Course Type */}
          <select
            value={filters.testType || 'all'}
            onChange={(e) => setFilters({ ...filters, testType: e.target.value as any })}
            className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 bg-white focus:ring-2 focus:ring-[#FACE39]/40 focus:border-transparent min-w-[160px]"
          >
            <option value="all">All Course Types</option>
            {courses.map(course => (
              <option key={course._id} value={course.name}>{course.name}</option>
            ))}
          </select>

          {/* Test Type (Computer-Based / Paper-Based) */}
          <select
            value={filters.examType || 'all'}
            onChange={(e) => setFilters({ ...filters, examType: e.target.value as any })}
            className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 bg-white focus:ring-2 focus:ring-[#FACE39]/40 focus:border-transparent min-w-[160px]"
          >
            <option value="all">All Test Types</option>
            {testTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>

          {/* Sort */}
          <select
            value={filters.sortBy || 'date-asc'}
            onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
            className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 bg-white focus:ring-2 focus:ring-[#FACE39]/40 focus:border-transparent min-w-[180px]"
          >
            <option value="date-asc">Start Date Ascending</option>
            <option value="date-desc">Start Date Descending</option>
            <option value="name">Name</option>
          </select>

          {/* Time Period */}
          <select
            value={filters.status || 'all'}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 bg-white focus:ring-2 focus:ring-[#FACE39]/40 focus:border-transparent min-w-[140px]"
          >
            <option value="upcoming">Upcoming</option>
            <option value="all">All</option>
            <option value="today">Today</option>
            <option value="previous">Previous Day</option>
          </select>

          {/* Date Picker */}
          <input
            type="date"
            value={filters.dateRange?.start || ''}
            onChange={(e) => setFilters({
              ...filters,
              dateRange: { start: e.target.value, end: filters.dateRange?.end || '' }
            })}
            placeholder="dd/mm/yyyy"
            className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 bg-white focus:ring-2 focus:ring-[#FACE39]/40 focus:border-transparent min-w-[150px]"
          />
        </div>
      </div>

      {/* Schedules Table */}
      <MockTestScheduleTable
        schedules={filteredSchedules}
        totalCount={schedules.length}
      />
    </div>
  )
}
