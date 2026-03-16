'use client'

import { X, Clock, Calendar, CreditCard, Users, User, CalendarDays, Pencil, Trash2 } from 'lucide-react'
import type { Course, TestType } from '@/types/admin'
import { testTypeBadgeColors } from '@/types/admin'

interface ViewCourseModalProps {
  isOpen: boolean
  onClose: () => void
  onEdit: (course: Course) => void
  onDelete: (course: Course) => void
  course: Course | null
  isAdmin?: boolean
}

export default function ViewCourseModal({ isOpen, onClose, onEdit, onDelete, course, isAdmin = false }: ViewCourseModalProps) {
  if (!isOpen || !course) return null

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).replace(/\//g, '-')
  }

  const defaultSyllabus = [
    'Listening Module',
    'Reading Module',
    'Writing Module',
    'Speaking Module',
    'Mock Tests',
    'Practice Sessions'
  ]

  const syllabus = course.syllabus?.length > 0 ? course.syllabus : defaultSyllabus

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 relative">
          <div className="text-center w-full">
            <h2 className="text-xl font-bold text-gray-900">{course.name}</h2>
            <p className="text-sm text-gray-500 mt-1">Complete course information and enrollment details.</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 absolute right-6 top-6 p-1 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {/* Badges */}
          <div className="flex items-center justify-center gap-2 mb-5">
            <span className={`px-3 py-1 text-xs font-semibold rounded-md border ${testTypeBadgeColors[course.testType as TestType] || 'bg-gray-100 text-gray-700 border-gray-200'
              }`}>
              {course.testType}
            </span>
            <span className={`px-3 py-1 text-xs font-semibold rounded-md ${course.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
              }`}>
              {course.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>

          {/* Description */}
          <div className="mb-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Description</h3>
            <p className="text-sm text-gray-600">{course.description}</p>
          </div>

          {/* Course Info & Enrollment Details */}
          <div className="grid grid-cols-2 gap-6 mb-5">
            {/* Course Information */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Course Information</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Duration</p>
                    <p className="font-medium text-gray-900">{course.durationMonths} months</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Start Date</p>
                    <p className="font-medium text-gray-900">{formatDate(course.startDate)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CreditCard className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Price</p>
                    <p className="font-medium text-gray-900">{course.price.toLocaleString()} {course.currency}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Enrollment Details */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Enrollment Details</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Enrolled</p>
                    <p className="font-medium text-gray-900">{course.enrolledCount} / {course.capacity || 50}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <User className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Instructor:</p>
                    <p className="font-medium text-gray-900">{course.instructor || 'TBA'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CalendarDays className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Schedule:</p>
                    <p className="font-medium text-gray-900">{course.schedule || 'Mon, Wed, Fri - 10:00 AM to 12:00 PM'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Course Syllabus */}
          <div className="mb-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Course Syllabus</h3>
            <ul className="space-y-2">
              {syllabus.map((item, index) => (
                <li key={index} className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="w-1.5 h-1.5 bg-[#FACE39] rounded-full"></span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className={`px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors ${isAdmin ? 'flex-1' : 'w-full'}`}
            >
              Close
            </button>
            {isAdmin && (
              <>
                <button
                  onClick={() => onEdit(course)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#FACE39] rounded-lg text-sm font-bold text-gray-900 hover:bg-[#FACE39]/90 transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => onDelete(course)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500 rounded-lg text-sm font-bold text-white hover:bg-red-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
