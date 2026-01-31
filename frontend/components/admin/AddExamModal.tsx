'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import type { Exam, TestType, ExamType } from '@/types/admin'

interface AddExamModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (exam: Omit<Exam, '_id' | 'createdAt' | 'updatedAt'>) => void
  editingExam?: Exam | null
}

const testTypes: TestType[] = ['IELTS', 'PTE', 'GRE', 'TOEFL', 'SAT', 'Duolingo', 'GMAT', 'OET', 'Cambridge']
const examTypes: ExamType[] = ['Computer-Based', 'Paper-Based', 'Online']

export default function AddExamModal({ isOpen, onClose, onSubmit, editingExam }: AddExamModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    examType: 'Computer-Based' as ExamType,
    testType: 'IELTS' as TestType,
    examDate: '',
    examTime: '',
    venue: '',
    registrationDeadline: '',
    fee: 0,
    currency: 'BDT',
    totalSlots: 0,
    availableSlots: 0,
    isActive: true
  })

  useEffect(() => {
    if (editingExam) {
      setFormData({
        name: editingExam.name,
        examType: editingExam.examType,
        testType: editingExam.testType,
        examDate: editingExam.examDate.split('T')[0],
        examTime: editingExam.examTime,
        venue: editingExam.venue,
        registrationDeadline: editingExam.registrationDeadline.split('T')[0],
        fee: editingExam.fee,
        currency: editingExam.currency,
        totalSlots: editingExam.totalSlots,
        availableSlots: editingExam.availableSlots,
        isActive: editingExam.isActive
      })
    } else {
      setFormData({
        name: '',
        examType: 'Computer-Based',
        testType: 'IELTS',
        examDate: '',
        examTime: '',
        venue: '',
        registrationDeadline: '',
        fee: 0,
        currency: 'BDT',
        totalSlots: 0,
        availableSlots: 0,
        isActive: true
      })
    }
  }, [editingExam, isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            {editingExam ? 'Edit Exam' : 'Add Exam'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Exam Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Test Type</label>
              <select
                value={formData.testType}
                onChange={(e) => setFormData({ ...formData, testType: e.target.value as TestType })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
              >
                {testTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Exam Type</label>
              <select
                value={formData.examType}
                onChange={(e) => setFormData({ ...formData, examType: e.target.value as ExamType })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
              >
                {examTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Exam Date</label>
              <input
                type="date"
                value={formData.examDate}
                onChange={(e) => setFormData({ ...formData, examDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Exam Time</label>
              <input
                type="text"
                placeholder="e.g., 09:00 AM"
                value={formData.examTime}
                onChange={(e) => setFormData({ ...formData, examTime: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Venue</label>
            <input
              type="text"
              value={formData.venue}
              onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Registration Deadline</label>
            <input
              type="date"
              value={formData.registrationDeadline}
              onChange={(e) => setFormData({ ...formData, registrationDeadline: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Registration Fee</label>
              <input
                type="number"
                min="0"
                value={formData.fee}
                onChange={(e) => setFormData({ ...formData, fee: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
              <select
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
              >
                <option value="BDT">BDT</option>
                <option value="USD">USD</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Total Slots</label>
              <input
                type="number"
                min="1"
                value={formData.totalSlots}
                onChange={(e) => setFormData({ ...formData, totalSlots: parseInt(e.target.value), availableSlots: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Available Slots</label>
              <input
                type="number"
                min="0"
                max={formData.totalSlots}
                value={formData.availableSlots}
                onChange={(e) => setFormData({ ...formData, availableSlots: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="w-4 h-4 text-yellow-400 border-gray-300 rounded focus:ring-yellow-400"
            />
            <label htmlFor="isActive" className="text-sm font-medium text-gray-700">Active</label>
          </div>

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
              className="flex-1 px-4 py-2.5 bg-yellow-400 rounded-lg text-sm font-bold text-gray-900 hover:bg-yellow-500 transition-colors"
            >
              {editingExam ? 'Update Exam' : 'Add Exam'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
