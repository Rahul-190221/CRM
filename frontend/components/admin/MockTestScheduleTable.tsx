'use client'

import type { MockTestSchedule } from '@/types/admin'

interface MockTestScheduleTableProps {
  schedules: MockTestSchedule[]
  totalCount: number
}

export default function MockTestScheduleTable({ schedules, totalCount }: MockTestScheduleTableProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: '2-digit'
    })
  }

  const getAvailableSeatsColor = (available: number, total: number) => {
    const ratio = available / total
    if (ratio <= 0.1) return 'bg-red-100 text-red-700'
    if (ratio <= 0.3) return 'bg-orange-100 text-orange-700'
    return 'bg-green-100 text-green-700'
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-[#FACE39]">
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">List</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Name</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Test Type</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Exam Date</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Exam Time</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Total Seats</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Available Seats</th>
            </tr>
          </thead>
          <tbody>
            {schedules.map((schedule, index) => (
              <tr key={schedule._id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="px-4 py-3 text-sm text-gray-700">{schedule.listNumber}</td>
                <td className="px-4 py-3 text-sm text-gray-900 font-medium">{schedule.name}</td>
                <td className="px-4 py-3 text-sm text-gray-700">{schedule.examType}</td>
                <td className="px-4 py-3 text-sm text-gray-700">{formatDate(schedule.examDate)}</td>
                <td className="px-4 py-3 text-sm text-gray-700">{schedule.examTime}</td>
                <td className="px-4 py-3 text-sm text-gray-700">{schedule.totalSeats}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${getAvailableSeatsColor(schedule.availableSeats, schedule.totalSeats)}`}>
                    {schedule.availableSeats}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Info */}
      <div className="px-4 py-3 border-t border-gray-200 text-sm text-gray-600">
        Showing {schedules.length} of {totalCount} schedules
      </div>
    </div>
  )
}
