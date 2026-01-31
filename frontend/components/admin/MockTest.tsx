'use client'

import { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
import MockTestPackageCard from './MockTestPackageCard'
import MockTestScheduleTable from './MockTestScheduleTable'
import FilterBar from './FilterBar'
import AddMockTestPackageModal from './AddMockTestPackageModal'
import { getMockTestPackages, getMockTestSchedules, createMockTestPackage, updateMockTestPackage, deleteMockTestPackage } from '@/lib/api/mockTests'
import type { MockTestPackage, MockTestSchedule, FilterState } from '@/types/admin'

// Mock data for packages
const mockPackages: MockTestPackage[] = [
  {
    _id: '1',
    testType: 'IELTS',
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
    ],
    isActive: true,
    createdAt: '2025-01-01',
    updatedAt: '2025-01-01'
  },
  {
    _id: '2',
    testType: 'PTE',
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
    ],
    isActive: true,
    createdAt: '2025-01-01',
    updatedAt: '2025-01-01'
  },
  {
    _id: '3',
    testType: 'GRE',
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
      { testCount: 3, fee: 4500 },
      { testCount: 5, fee: 6500 }
    ],
    isActive: true,
    createdAt: '2025-01-01',
    updatedAt: '2025-01-01'
  },
  {
    _id: '4',
    testType: 'TOEFL',
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
      { testCount: 3, fee: 4000 },
      { testCount: 5, fee: 5500 }
    ],
    isActive: true,
    createdAt: '2025-01-01',
    updatedAt: '2025-01-01'
  }
]

// Mock data for schedules
const mockSchedules: MockTestSchedule[] = [
  { _id: '1', listNumber: 1, name: 'IELTS', testType: 'IELTS', examDate: '2025-11-06', examTime: '1:30 PM - 4:30 PM', totalSeats: 20, availableSeats: 1, status: 'upcoming', createdAt: '2025-01-01', updatedAt: '2025-01-01' },
  { _id: '2', listNumber: 2, name: 'Pearson PTE', testType: 'PTE', examDate: '2025-11-06', examTime: '3:00 PM - 5:00 PM', totalSeats: 10, availableSeats: 2, status: 'upcoming', createdAt: '2025-01-01', updatedAt: '2025-01-01' },
  { _id: '3', listNumber: 3, name: 'GRE', testType: 'GRE', examDate: '2025-11-06', examTime: '4:30 PM - 6:30 PM', totalSeats: 5, availableSeats: 5, status: 'upcoming', createdAt: '2025-01-01', updatedAt: '2025-01-01' },
  { _id: '4', listNumber: 4, name: 'PTE Academic', testType: 'PTE', examDate: '2025-11-08', examTime: '2:00 PM - 5:00 PM', totalSeats: 15, availableSeats: 8, status: 'upcoming', createdAt: '2025-01-01', updatedAt: '2025-01-01' },
  { _id: '5', listNumber: 5, name: 'SAT', testType: 'SAT', examDate: '2025-11-09', examTime: '8:00 AM - 12:00 PM', totalSeats: 40, availableSeats: 25, status: 'upcoming', createdAt: '2025-01-01', updatedAt: '2025-01-01' },
  { _id: '6', listNumber: 6, name: 'GMAT', testType: 'GMAT', examDate: '2025-11-10', examTime: '11:00 AM - 2:30 PM', totalSeats: 12, availableSeats: 7, status: 'upcoming', createdAt: '2025-01-01', updatedAt: '2025-01-01' },
  { _id: '7', listNumber: 7, name: 'Duolingo English Test', testType: 'Duolingo', examDate: '2025-11-10', examTime: '9:00 AM - 10:00 AM', totalSeats: 50, availableSeats: 42, status: 'upcoming', createdAt: '2025-01-01', updatedAt: '2025-01-01' },
  { _id: '8', listNumber: 8, name: 'OET', testType: 'OET', examDate: '2025-11-12', examTime: '1:00 PM - 4:00 PM', totalSeats: 18, availableSeats: 12, status: 'upcoming', createdAt: '2025-01-01', updatedAt: '2025-01-01' },
  { _id: '9', listNumber: 9, name: 'IELTS', testType: 'IELTS', examDate: '2025-11-15', examTime: '10:00 AM - 1:00 PM', totalSeats: 25, availableSeats: 18, status: 'upcoming', createdAt: '2025-01-01', updatedAt: '2025-01-01' },
  { _id: '10', listNumber: 10, name: 'TOEFL iBT', testType: 'TOEFL', examDate: '2025-11-16', examTime: '2:30 PM - 6:30 PM', totalSeats: 20, availableSeats: 15, status: 'upcoming', createdAt: '2025-01-01', updatedAt: '2025-01-01' },
  { _id: '11', listNumber: 11, name: 'PTE Core', testType: 'PTE', examDate: '2025-11-18', examTime: '11:00 AM - 2:00 PM', totalSeats: 10, availableSeats: 6, status: 'upcoming', createdAt: '2025-01-01', updatedAt: '2025-01-01' }
]

export default function MockTest() {
  const [packages, setPackages] = useState<MockTestPackage[]>([])
  const [schedules, setSchedules] = useState<MockTestSchedule[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedPackage, setSelectedPackage] = useState<MockTestPackage | null>(null)
  const [filters, setFilters] = useState<FilterState>({
    testType: 'all',
    status: 'upcoming',
    sortBy: 'date-asc'
  })

  useEffect(() => {
    fetchData()
  }, [filters])

  const fetchData = async () => {
    try {
      const [pkgData, scheduleData] = await Promise.all([
        getMockTestPackages(),
        getMockTestSchedules(filters)
      ])
      setPackages(pkgData)
      setSchedules(scheduleData)
    } catch (error) {
      console.error('Error fetching data:', error)
      // Use mock data as fallback
      setPackages(mockPackages)
      setSchedules(mockSchedules)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditPackage = (pkg: MockTestPackage) => {
    setSelectedPackage(pkg)
    setIsModalOpen(true)
  }

  const handleAddPackage = () => {
    setSelectedPackage(null)
    setIsModalOpen(true)
  }

  const handleSubmitPackage = async (packageData: Omit<MockTestPackage, '_id' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (selectedPackage) {
        await updateMockTestPackage(selectedPackage._id, packageData)
      } else {
        await createMockTestPackage(packageData)
      }
      fetchData()
      setIsModalOpen(false)
      setSelectedPackage(null)
    } catch (error) {
      console.error('Error saving package:', error)
    }
  }

  const handleDeletePackage = async (pkg: MockTestPackage) => {
    if (confirm('Are you sure you want to delete this mock test package?')) {
      try {
        await deleteMockTestPackage(pkg._id)
        fetchData()
        setIsModalOpen(false)
        setSelectedPackage(null)
      } catch (error) {
        console.error('Error deleting package:', error)
      }
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
      </div>
    )
  }

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      {/* Mock Test Packages Section */}
      <div className="mb-10">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mock Test Packages</h1>
            <p className="text-sm text-gray-500 mt-1">Available mock test packages with pricing details</p>
          </div>
          <button className="flex items-center gap-2 bg-yellow-400 px-4 py-2.5 rounded-lg text-sm font-bold text-gray-900 hover:bg-yellow-500 transition-colors">
            <Plus className="w-4 h-4" />
            <span>Add More</span>
          </button>
        </div>

        {/* Packages Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {packages.map(pkg => (
            <MockTestPackageCard
              key={pkg._id}
              package_={pkg}
              onEdit={handleEditPackage}
            />
          ))}
        </div>
      </div>

      {/* Available Schedules Section */}
      <div>
        <div className="mb-4">
          <h2 className="text-xl font-bold text-gray-900">Available Schedules</h2>
          <p className="text-sm text-gray-500 mt-1">Browse and filter available test schedules</p>
        </div>

        {/* Filters */}
        <FilterBar
          filters={filters}
          onFilterChange={setFilters}
          showTestType={true}
          showStatus={true}
          showSort={true}
          showDatePicker={true}
          statusOptions={[
            { value: 'all', label: 'All' },
            { value: 'upcoming', label: 'Upcoming' },
            { value: 'ongoing', label: 'Ongoing' },
            { value: 'completed', label: 'Completed' },
            { value: 'cancelled', label: 'Cancelled' }
          ]}
        />

        {/* Schedules Table */}
        <MockTestScheduleTable
          schedules={schedules}
          totalCount={15}
        />
      </div>
    </div>
  )
}
