'use client'

import { useState, useEffect } from 'react'
import { X, Users } from 'lucide-react'
import type { Course, CourseType } from '@/types/admin'

interface AddCourseModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (course: Omit<Course, '_id' | 'createdAt' | 'updatedAt'>) => void
  editingCourse?: Course | null
}

const courseTypes: CourseType[] = [
  'IELTS Premium', 'IELTS Crash', 'IELTS Intense', 'IELTS Elementary', 'IELTS Mock Test',
  'Basic English', 'GRE Premium', 'TOEFL Premium', 'PTE Premium',
]

const inputCls = "w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FACE39]/50 focus:border-[#FACE39] text-sm bg-gray-50 transition-colors"
const labelCls = "block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5"

export default function AddCourseModal({ isOpen, onClose, onSubmit, editingCourse }: AddCourseModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    testType: '' as CourseType | '',
    instructor: '',
    capacity: 50,
    enrolledCount: 0,
    durationMonths: 3,
    schedule: '',
    description: '',
    startDate: new Date().toISOString().split('T')[0],
    price: 0,
    currency: 'BDT',
    syllabus: [] as string[],
    isActive: true
  })

  useEffect(() => {
    if (editingCourse) {
      setFormData({
        name: editingCourse.name || '',
        testType: editingCourse.testType || '',
        instructor: editingCourse.instructor || '',
        capacity: editingCourse.capacity || 50,
        enrolledCount: editingCourse.enrolledCount || 0,
        durationMonths: editingCourse.durationMonths || 3,
        schedule: editingCourse.schedule || '',
        description: editingCourse.description || '',
        startDate: editingCourse.startDate ? editingCourse.startDate.split('T')[0] : new Date().toISOString().split('T')[0],
        price: editingCourse.price || 0,
        currency: editingCourse.currency || 'BDT',
        syllabus: editingCourse.syllabus || [],
        isActive: editingCourse.isActive !== undefined ? editingCourse.isActive : true
      })
    } else {
      setFormData({
        name: '',
        testType: '',
        instructor: '',
        capacity: 50,
        enrolledCount: 0,
        durationMonths: 3,
        schedule: '',
        description: '',
        startDate: new Date().toISOString().split('T')[0],
        price: 0,
        currency: 'BDT',
        syllabus: [],
        isActive: true
      })
    }
  }, [editingCourse, isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData as Omit<Course, '_id' | 'createdAt' | 'updatedAt'>)
  }

  const enrollPct = formData.capacity > 0
    ? Math.min(100, Math.round((formData.enrolledCount / formData.capacity) * 100))
    : 0

  const set = (field: string, val: any) => setFormData(prev => ({ ...prev, [field]: val }))

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-gray-100 overflow-hidden">

        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-gray-100 flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-[#00000F]">
              {editingCourse ? 'Edit Course' : 'Add Course'}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {editingCourse ? 'Update batch details.' : 'Fill in the details to create a new batch.'}
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">

          {/* Batch No & Course */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Batch No</label>
              <input
                type="text"
                placeholder="e.g. 3"
                value={formData.name}
                onChange={(e) => set('name', e.target.value)}
                className={inputCls}
                required
              />
            </div>
            <div>
              <label className={labelCls}>Course</label>
              <select
                value={formData.testType}
                onChange={(e) => set('testType', e.target.value as CourseType)}
                className={inputCls}
                required
              >
                <option value="">Select type</option>
                {courseTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          {/* Instructor */}
          <div>
            <label className={labelCls}>Instructor</label>
            <input
              type="text"
              placeholder="Instructor name"
              value={formData.instructor}
              onChange={(e) => set('instructor', e.target.value)}
              className={inputCls}
              required
            />
          </div>

          {/* Enrolment & Capacity with live preview */}
          <div>
            <div className="grid grid-cols-2 gap-4 mb-3">
              <div>
                <label className={labelCls}>Total Enrolment</label>
                <input
                  type="number"
                  min={0}
                  placeholder="0"
                  value={formData.enrolledCount === 0 ? '' : formData.enrolledCount}
                  onChange={(e) => set('enrolledCount', parseInt(e.target.value) || 0)}
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Capacity</label>
                <input
                  type="number"
                  min={1}
                  placeholder="50"
                  value={formData.capacity === 0 ? '' : formData.capacity}
                  onChange={(e) => set('capacity', parseInt(e.target.value) || 50)}
                  className={inputCls}
                />
              </div>
            </div>

            {/* Live progress preview */}
            <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-xs text-gray-500 font-medium">Enrollment Preview</span>
                </div>
                <span className="text-xs font-bold text-[#00000F]">
                  {formData.enrolledCount} / {formData.capacity} &nbsp;
                  <span className="text-[#FACE39]">({enrollPct}%)</span>
                </span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#FACE39] rounded-full transition-all duration-300"
                  style={{ width: `${enrollPct}%` }}
                />
              </div>
            </div>
          </div>

          {/* Duration & Price */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Duration (Months)</label>
              <input
                type="number"
                min={1}
                placeholder="3"
                value={formData.durationMonths === 0 ? '' : formData.durationMonths}
                onChange={(e) => set('durationMonths', parseInt(e.target.value) || 0)}
                className={inputCls}
                required
              />
            </div>
            <div>
              <label className={labelCls}>Price (BDT)</label>
              <input
                type="number"
                min={0}
                placeholder="0"
                value={formData.price === 0 ? '' : formData.price}
                onChange={(e) => set('price', parseInt(e.target.value) || 0)}
                className={inputCls}
              />
            </div>
          </div>

          {/* Class Time */}
          <div>
            <label className={labelCls}>Class Time</label>
            <input
              type="text"
              placeholder="e.g., 10:00 AM - 12:00 PM"
              value={formData.schedule}
              onChange={(e) => set('schedule', e.target.value)}
              className={inputCls}
              required
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 bg-[#FACE39] rounded-xl text-sm font-bold text-[#00000F] hover:bg-[#FACE39]/90 transition-colors"
            >
              {editingCourse ? 'Update Course' : 'Add Course'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
