'use client'

import { Clock, Users, Calendar, CreditCard } from 'lucide-react'
import type { Course, TestType } from '@/types/admin'
import { testTypeBadgeColors } from '@/types/admin'

interface CourseCardProps {
  course: Course
  onEdit: (course: Course) => void
  onViewDetails: (course: Course) => void
}

export default function CourseCard({ course, onEdit, onViewDetails }: CourseCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).replace(/\//g, '-')
  }

  const formatPrice = (price: number, currency: string) => {
    return `${price.toLocaleString()} ${currency}`
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-900">{course.name}</h3>
        <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
          course.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
        }`}>
          {course.isActive ? 'Active' : 'Inactive'}
        </span>
      </div>

      {/* Test Type Badge */}
      <div className="mb-3">
        <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-md border ${
          testTypeBadgeColors[course.testType as TestType] || 'bg-gray-100 text-gray-700 border-gray-200'
        }`}>
          {course.testType}
        </span>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-600 mb-4 line-clamp-2">{course.description}</p>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Clock className="w-4 h-4" />
          <span>{course.durationMonths} months</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Users className="w-4 h-4" />
          <span>{course.enrolledCount} enrolled</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Calendar className="w-4 h-4" />
          <span>{formatDate(course.startDate)}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <CreditCard className="w-4 h-4" />
          <span>{formatPrice(course.price, course.currency)}</span>
        </div>
      </div>

      {/* Action Button */}
      <button
        onClick={() => onViewDetails(course)}
        className="w-full py-2.5 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
      >
        View Details
      </button>
    </div>
  )
}
