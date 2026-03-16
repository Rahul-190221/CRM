'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import type { Course, TestType } from '@/types/admin'

interface AddCourseModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (course: Omit<Course, '_id' | 'createdAt' | 'updatedAt' | 'enrolledCount'>) => void
  editingCourse?: Course | null
}

const testTypes: TestType[] = ['IELTS', 'PTE', 'GRE', 'TOEFL']

export default function AddCourseModal({ isOpen, onClose, onSubmit, editingCourse }: AddCourseModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    testType: '' as TestType | '',
    description: '',
    durationMonths: 3,
    startDate: '',
    price: 15000,
    currency: 'BDT',
    instructor: '',
    capacity: 50,
    schedule: '',
    syllabus: [] as string[],
    isActive: true
  })

  useEffect(() => {
    if (editingCourse) {
      setFormData({
        name: editingCourse.name,
        testType: editingCourse.testType,
        description: editingCourse.description,
        durationMonths: editingCourse.durationMonths,
        startDate: editingCourse.startDate.split('T')[0],
        price: editingCourse.price,
        currency: editingCourse.currency,
        instructor: editingCourse.instructor || '',
        capacity: editingCourse.capacity || 50,
        schedule: editingCourse.schedule || '',
        syllabus: editingCourse.syllabus || [],
        isActive: editingCourse.isActive
      })
    } else {
      setFormData({
        name: '',
        testType: '',
        description: '',
        durationMonths: 3,
        startDate: '',
        price: 15000,
        currency: 'BDT',
        instructor: '',
        capacity: 50,
        schedule: '',
        syllabus: [],
        isActive: true
      })
    }
  }, [editingCourse, isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData as Omit<Course, '_id' | 'createdAt' | 'updatedAt' | 'enrolledCount'>)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-gray-200">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{editingCourse ? 'Edit Course' : 'Add New Course'}</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {editingCourse ? 'Update the details of the course.' : 'Fill in the details to create a new course offering.'}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Course Name & Type */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Course Name</label>
              <input
                type="text"
                placeholder="Enter course name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FACE39]/40 focus:border-transparent text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Course Type</label>
              <select
                value={formData.testType}
                onChange={(e) => setFormData({ ...formData, testType: e.target.value as TestType })}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FACE39]/40 focus:border-transparent text-sm bg-white"
                required
              >
                <option value="">Select type</option>
                {testTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              placeholder="Enter course description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={2}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FACE39]/40 focus:border-transparent text-sm resize-none"
              required
            />
          </div>

          {/* Duration & Price */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
              <input
                type="text"
                placeholder="e.g., 3 months"
                value={formData.durationMonths > 0 ? `${formData.durationMonths}` : ''}
                onChange={(e) => {
                  const num = parseInt(e.target.value.replace(/[^0-9]/g, '')) || 0
                  setFormData({ ...formData, durationMonths: num })
                }}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FACE39]/40 focus:border-transparent text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
              <input
                type="text"
                placeholder="e.g., 15,000 BDT"
                value={formData.price > 0 ? `${formData.price.toLocaleString()} ${formData.currency}` : ''}
                onChange={(e) => {
                  const num = parseInt(e.target.value.replace(/[^0-9]/g, '')) || 0
                  setFormData({ ...formData, price: num })
                }}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FACE39]/40 focus:border-transparent text-sm"
                required
              />
            </div>
          </div>

          {/* Instructor & Capacity */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Instructor</label>
              <input
                type="text"
                placeholder="Instructor name"
                value={formData.instructor}
                onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FACE39]/40 focus:border-transparent text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
              <input
                type="text"
                placeholder="Max students"
                value={formData.capacity > 0 ? formData.capacity : ''}
                onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FACE39]/40 focus:border-transparent text-sm"
              />
            </div>
          </div>

          {/* Start Date & Schedule */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FACE39]/40 focus:border-transparent text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Schedule</label>
              <input
                type="text"
                placeholder="e.g., Mon, Wed, Fri - 10:00 AM"
                value={formData.schedule}
                onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FACE39]/40 focus:border-transparent text-sm"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 bg-[#FACE39] rounded-lg text-sm font-bold text-gray-900 hover:bg-[#FACE39]/90 transition-colors"
            >
              {editingCourse ? 'Update Course' : 'Add Course'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
