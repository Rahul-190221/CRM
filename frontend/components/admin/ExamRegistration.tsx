 'use client'

import { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
import ExamCard from './ExamCard'
import AddExamModal from './AddExamModal'
import FilterBar from './FilterBar'
import { getExams, createExam, updateExam, deleteExam } from '@/lib/api/exams'
import type { Exam, FilterState } from '@/types/admin'


export default function ExamRegistration({ user }: { user?: any }) {
  const isAdmin = user?.role === 'admin';
  const [exams, setExams] = useState<Exam[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingExam, setEditingExam] = useState<Exam | null>(null)
  const [filters, setFilters] = useState<FilterState>({
    testType: 'all',
    examType: 'all',
    status: 'open',
    sortBy: 'date-asc'
  })

  useEffect(() => {
    fetchExams()
  }, [filters])

  const fetchExams = async () => {
    try {
      const data = await getExams(filters)
      setExams(data)
    } catch (error) {
      console.error('Error fetching exams:', error)
      setExams([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddExam = async (examData: Omit<Exam, '_id' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (editingExam) {
        await updateExam(editingExam._id, examData)
      } else {
        await createExam(examData)
      }
      fetchExams()
      setIsModalOpen(false)
      setEditingExam(null)
    } catch (error) {
      console.error('Error saving exam:', error)
    }
  }

  const handleEdit = (exam: Exam) => {
    setEditingExam(exam)
    setIsModalOpen(true)
  }

  const handleDeleteExam = async (exam: Exam) => {
    if (confirm('Are you sure you want to delete this exam registration?')) {
      try {
        await deleteExam(exam._id)
        fetchExams()
        setIsModalOpen(false)
        setEditingExam(null)
      } catch (error) {
        console.error('Error deleting exam:', error)
      }
    }
  }

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
          <h1 className="text-2xl font-bold text-gray-900">Exam Registration</h1>
          <p className="text-sm text-gray-500 mt-1">Browse and manage exam registrations</p>
        </div>
        {isAdmin && (
          <button
            onClick={() => {
              setEditingExam(null)
              setIsModalOpen(true)
            }}
            className="flex items-center gap-2 bg-[#FACE39] px-4 py-2.5 rounded-lg text-sm font-bold text-[#00000F] hover:bg-[#FACE39]/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Exam</span>
          </button>
        )}
      </div>

      {/* Filters */}
      <FilterBar
        filters={filters}
        onFilterChange={setFilters}
        showTestType={true}
        showExamType={true}
        showStatus={true}
        showSort={true}
        showDatePicker={true}
        statusOptions={[
          { value: 'all', label: 'All' },
          { value: 'open', label: 'Open' },
          { value: 'closed', label: 'Closed' }
        ]}
      />

      {/* Exam Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {exams.map(exam => (
          <ExamCard
            key={exam._id}
            exam={exam}
            onEdit={handleEdit}
            user={user}
          />
        ))}
      </div>

      {exams.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No exams found</p>
        </div>
      )}

      {/* Modal */}
      <AddExamModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingExam(null)
        }}
        onSubmit={handleAddExam}
        onDelete={handleDeleteExam}
        editingExam={editingExam}
      />
    </div>
  )
}
