'use client'

import { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
import ExamCard from './ExamCard'
import AddExamModal from './AddExamModal'
import FilterBar from './FilterBar'
import { getExams, createExam, updateExam, deleteExam } from '@/lib/api/exams'
import type { Exam, FilterState } from '@/types/admin'

// Mock data for exams
const mockExams: Exam[] = [
  {
    _id: '1',
    name: 'IELTS Academic',
    examType: 'Computer-Based',
    testType: 'IELTS',
    examDate: '2026-02-15',
    examTime: '09:00 AM',
    venue: 'British Council, Dhaka',
    registrationDeadline: '2026-02-01',
    fee: 21000,
    currency: 'BDT',
    totalSlots: 30,
    availableSlots: 15,
    isActive: true,
    createdAt: '2025-01-01',
    updatedAt: '2025-01-01'
  },
  {
    _id: '2',
    name: 'PTE Academic',
    examType: 'Computer-Based',
    testType: 'PTE',
    examDate: '2026-02-18',
    examTime: '02:00 PM',
    venue: 'Pearson Test Center, Banani',
    registrationDeadline: '2026-02-10',
    fee: 18500,
    currency: 'BDT',
    totalSlots: 20,
    availableSlots: 12,
    isActive: true,
    createdAt: '2025-01-01',
    updatedAt: '2025-01-01'
  },
  {
    _id: '3',
    name: 'IELTS General',
    examType: 'Paper-Based',
    testType: 'IELTS',
    examDate: '2026-02-20',
    examTime: '10:00 AM',
    venue: 'IDP Education, Gulshan',
    registrationDeadline: '2026-02-05',
    fee: 21000,
    currency: 'BDT',
    totalSlots: 25,
    availableSlots: 8,
    isActive: true,
    createdAt: '2025-01-01',
    updatedAt: '2025-01-01'
  },
  {
    _id: '4',
    name: 'TOEFL iBT',
    examType: 'Computer-Based',
    testType: 'TOEFL',
    examDate: '2026-02-22',
    examTime: '09:30 AM',
    venue: 'ETS Authorized Center, Dhanmondi',
    registrationDeadline: '2026-02-08',
    fee: 22500,
    currency: 'BDT',
    totalSlots: 15,
    availableSlots: 5,
    isActive: true,
    createdAt: '2025-01-01',
    updatedAt: '2025-01-01'
  },
  {
    _id: '5',
    name: 'GRE General Test',
    examType: 'Computer-Based',
    testType: 'GRE',
    examDate: '2026-02-25',
    examTime: '10:00 AM',
    venue: 'ETS Authorized Center, Dhanmondi',
    registrationDeadline: '2026-02-12',
    fee: 25000,
    currency: 'BDT',
    totalSlots: 12,
    availableSlots: 10,
    isActive: true,
    createdAt: '2025-01-01',
    updatedAt: '2025-01-01'
  },
]

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
      // Use mock data as fallback
      setExams(mockExams)
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
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
            className="flex items-center gap-2 bg-yellow-400 px-4 py-2.5 rounded-lg text-sm font-bold text-gray-900 hover:bg-yellow-500 transition-colors"
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
