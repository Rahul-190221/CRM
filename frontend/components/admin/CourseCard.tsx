'use client'

import { Clock, Users, CreditCard, BookOpen, ChevronRight } from 'lucide-react'
import type { Course } from '@/types/admin'

interface CourseCardProps {
  course: Course
  onEdit: (course: Course) => void
  onViewDetails: (course: Course) => void
  onToggleActive?: (course: Course) => void
  user?: any
}

export default function CourseCard({ course, onViewDetails, onToggleActive }: CourseCardProps) {
  const enrollPct = course.capacity
    ? Math.min(100, Math.round((course.enrolledCount / course.capacity) * 100))
    : 0

  return (
    <div className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col">
      {/* Brand accent bar */}
      <div className="h-1 w-full bg-[#FACE39]" />

      <div className="p-5 flex flex-col flex-1">
        {/* Header row */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 text-xs font-bold rounded-md bg-[#FACE39]/15 text-[#00000F]">
              {course.testType}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Active / Inactive toggle */}
            {onToggleActive && (
              <button
                onClick={(e) => { e.stopPropagation(); onToggleActive(course) }}
                className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
                  course.isActive ? 'bg-green-500' : 'bg-gray-300'
                }`}
                title={course.isActive ? 'Click to deactivate' : 'Click to activate'}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow transform transition-transform duration-200 ${
                    course.isActive ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            )}
            <span className={`text-xs font-semibold ${course.isActive ? 'text-green-600' : 'text-gray-400'}`}>
              {course.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>

        {/* Price */}
        {course.price > 0 && (
          <div className="flex items-center gap-1 mb-2">
            <CreditCard className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-sm font-bold text-[#00000F]">
              {course.price.toLocaleString()}
              <span className="text-xs font-normal text-gray-400 ml-1">{course.currency}</span>
            </span>
          </div>
        )}

        {/* Batch name */}
        <h3 className="text-xl font-bold text-[#00000F] mb-1 leading-tight">
          Batch {course.name}
        </h3>

        {/* Instructor + schedule */}
        {course.instructor && (
          <p className="text-xs text-gray-500 mb-4">
            <span className="font-medium text-gray-700">{course.instructor}</span>
            {course.schedule && <span className="ml-1">· {course.schedule}</span>}
          </p>
        )}

        {/* Stats row */}
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Clock className="w-3.5 h-3.5 text-gray-400" />
            <span>{course.durationMonths} mo</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <BookOpen className="w-3.5 h-3.5 text-gray-400" />
            <span>{course.enrolledCount} enrolled</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Users className="w-3.5 h-3.5 text-gray-400" />
            <span>Cap {course.capacity ?? 50}</span>
          </div>
        </div>

        {/* Enrollment progress */}
        <div className="mb-5">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>Enrollment</span>
            <span className="font-semibold text-[#00000F]">{enrollPct}%</span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-[#FACE39] transition-all duration-500"
              style={{ width: `${enrollPct}%` }}
            />
          </div>
        </div>

        {/* View Details button */}
        <button
          onClick={() => onViewDetails(course)}
          className="mt-auto w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#00000F] text-[#FACE39] text-sm font-semibold hover:bg-[#00000F]/85 transition-colors"
        >
          View Details
          <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>
    </div>
  )
}
