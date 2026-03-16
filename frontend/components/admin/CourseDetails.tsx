'use client'

import { useState, useEffect } from 'react'
import { Plus, Search } from 'lucide-react'
import CourseCard from './CourseCard'
import AddCourseModal from './AddCourseModal'
import ViewCourseModal from './ViewCourseModal'
import { getCourses, createCourse, updateCourse, deleteCourse } from '@/lib/api/courses'
import type { Course, TestType, FilterState } from '@/types/admin'

// Mock data for when API is not available
const mockCourses: Course[] = [
  {
    _id: '1',
    name: 'IELTS Preparation',
    testType: 'IELTS',
    description: 'Comprehensive IELTS preparation covering all four modules: Listening, Reading, Writing, and Speaking.',
    durationMonths: 3,
    enrolledCount: 45,
    capacity: 50,
    startDate: '2025-11-15',
    price: 15000,
    currency: 'BDT',
    instructor: 'Dr. Sarah Johnson',
    schedule: 'Mon, Wed, Fri - 10:00 AM to 12:00 PM',
    syllabus: ['Listening Module', 'Reading Module', 'Writing Module', 'Speaking Module', 'Mock Tests', 'Practice Sessions'],
    isActive: true,
    createdAt: '2025-01-01',
    updatedAt: '2025-01-01'
  },
  {
    _id: '2',
    name: 'PTE Academic',
    testType: 'PTE',
    description: 'Complete PTE Academic training with AI-powered practice tests and personalized feedback.',
    durationMonths: 2,
    enrolledCount: 32,
    capacity: 40,
    startDate: '2025-11-20',
    price: 18000,
    currency: 'BDT',
    instructor: 'Mr. James Wilson',
    schedule: 'Tue, Thu - 2:00 PM to 5:00 PM',
    syllabus: ['Speaking & Writing', 'Reading', 'Listening', 'Practice Tests', 'Score Improvement Tips'],
    isActive: true,
    createdAt: '2025-01-01',
    updatedAt: '2025-01-01'
  },
  {
    _id: '3',
    name: 'GRE Test Prep',
    testType: 'GRE',
    description: 'Advanced GRE preparation focusing on Verbal Reasoning, Quantitative Reasoning, and Analytical Writing.',
    durationMonths: 4,
    enrolledCount: 28,
    capacity: 35,
    startDate: '2025-11-25',
    price: 22000,
    currency: 'BDT',
    instructor: 'Dr. Michael Chen',
    schedule: 'Sat, Sun - 9:00 AM to 1:00 PM',
    syllabus: ['Verbal Reasoning', 'Quantitative Reasoning', 'Analytical Writing', 'Practice Tests', 'Strategy Sessions'],
    isActive: true,
    createdAt: '2025-01-01',
    updatedAt: '2025-01-01'
  },
  {
    _id: '4',
    name: 'TOEFL iBT Course',
    testType: 'TOEFL',
    description: 'Intensive TOEFL iBT course with mock tests and expert guidance for all test sections.',
    durationMonths: 3,
    enrolledCount: 38,
    capacity: 45,
    startDate: '2025-12-01',
    price: 20000,
    currency: 'BDT',
    instructor: 'Ms. Emily Davis',
    schedule: 'Mon, Wed, Fri - 4:00 PM to 6:00 PM',
    syllabus: ['Reading Section', 'Listening Section', 'Speaking Section', 'Writing Section', 'Integrated Tasks'],
    isActive: true,
    createdAt: '2025-01-01',
    updatedAt: '2025-01-01'
  },
]

const testTypes: TestType[] = ['IELTS', 'PTE', 'GRE', 'TOEFL']

export default function CourseDetails({ user }: { user?: any }) {
  const isAdmin = user?.role === 'admin';
  const [courses, setCourses] = useState<Course[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState<FilterState>({
    testType: 'all',
    sortBy: 'date'
  })

  useEffect(() => {
    fetchCourses()
  }, [filters])

  const fetchCourses = async () => {
    try {
      const data = await getCourses(filters)
      setCourses(data)
    } catch (error) {
      console.error('Error fetching courses:', error)
      setCourses(mockCourses)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddCourse = async (courseData: Omit<Course, '_id' | 'createdAt' | 'updatedAt' | 'enrolledCount'>) => {
    try {
      if (selectedCourse && isAddModalOpen) {
        await updateCourse(selectedCourse._id, courseData)
      } else {
        await createCourse({ ...courseData, enrolledCount: 0 })
      }
      fetchCourses()
      setIsAddModalOpen(false)
      setSelectedCourse(null)
    } catch (error) {
      console.error('Error saving course:', error)
    }
  }

  const handleViewDetails = (course: Course) => {
    setSelectedCourse(course)
    setIsViewModalOpen(true)
  }

  const handleEdit = (course: Course) => {
    setSelectedCourse(course)
    setIsViewModalOpen(false)
    setIsAddModalOpen(true)
  }

  const handleDelete = async (course: Course) => {
    if (confirm('Are you sure you want to delete this course?')) {
      try {
        await deleteCourse(course._id)
        fetchCourses()
        setIsViewModalOpen(false)
        setSelectedCourse(null)
      } catch (error) {
        console.error('Error deleting course:', error)
      }
    }
  }

  const filteredCourses = courses.filter(course =>
    (course.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (course.description?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FACE39]"></div>
      </div>
    )
  }

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Course Details</h1>
          <p className="text-sm text-gray-500 mt-1">Manage and view all available courses</p>
        </div>
        {isAdmin && (
          <button
            onClick={() => {
              setSelectedCourse(null)
              setIsAddModalOpen(true)
            }}
            className="flex items-center gap-2 bg-[#FACE39] px-4 py-2.5 rounded-lg text-sm font-bold text-gray-900 hover:bg-[#FACE39]/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Course</span>
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FACE39]/40 focus:border-transparent"
          />
        </div>
        <select
          value={filters.testType}
          onChange={(e) => setFilters({ ...filters, testType: e.target.value as TestType | 'all' })}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FACE39]/40 focus:border-transparent"
        >
          <option value="all">All Test Types</option>
          {testTypes.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
        <select
          value={filters.sortBy}
          onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FACE39]/40 focus:border-transparent"
        >
          <option value="date">Sort by Date</option>
          <option value="name">Sort by Name</option>
          <option value="price">Sort by Price</option>
        </select>
      </div>

      {/* Course Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map(course => (
          <CourseCard
            key={course._id}
            course={course}
            onEdit={handleEdit}
            onViewDetails={handleViewDetails}
            user={user}
          />
        ))}
      </div>

      {filteredCourses.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No courses found</p>
        </div>
      )}

      {/* Add/Edit Modal */}
      <AddCourseModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false)
          setSelectedCourse(null)
        }}
        onSubmit={handleAddCourse}
        editingCourse={selectedCourse}
      />

      {/* View Details Modal */}
      <ViewCourseModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false)
          setSelectedCourse(null)
        }}
        onEdit={handleEdit}
        onDelete={handleDelete}
        course={selectedCourse}
        isAdmin={isAdmin}
      />
    </div>
  )
}
