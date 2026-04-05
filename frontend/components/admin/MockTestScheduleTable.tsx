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
      month: 'short',
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
        <table className="w-full min-w-[500px]">
          <thead>
            <tr className="bg-[#FACE39]">
              <th className="px-3 py-3 text-left text-xs sm:text-sm font-semibold text-gray-900 w-10">#</th>
              <th className="px-3 py-3 text-left text-xs sm:text-sm font-semibold text-gray-900">Name</th>
              <th className="px-3 py-3 text-left text-xs sm:text-sm font-semibold text-gray-900">Type</th>
              <th className="px-3 py-3 text-left text-xs sm:text-sm font-semibold text-gray-900">Date</th>
              <th className="px-3 py-3 text-left text-xs sm:text-sm font-semibold text-gray-900">Time</th>
              <th className="hidden sm:table-cell px-3 py-3 text-left text-xs sm:text-sm font-semibold text-gray-900">Seats</th>
              <th className="px-3 py-3 text-left text-xs sm:text-sm font-semibold text-gray-900">Avail.</th>
            </tr>
          </thead>
          <tbody>
            {schedules.map((schedule, index) => (
              <tr key={schedule._id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="px-3 py-2.5 text-xs sm:text-sm text-gray-700">{schedule.listNumber}</td>
                <td className="px-3 py-2.5 text-xs sm:text-sm text-gray-900 font-medium">{schedule.name}</td>
                <td className="px-3 py-2.5 text-xs sm:text-sm text-gray-700 whitespace-nowrap">{schedule.examType}</td>
                <td className="px-3 py-2.5 text-xs sm:text-sm text-gray-700 whitespace-nowrap">{formatDate(schedule.examDate)}</td>
                <td className="px-3 py-2.5 text-xs sm:text-sm text-gray-700 whitespace-nowrap">{schedule.examTime}</td>
                <td className="hidden sm:table-cell px-3 py-2.5 text-xs sm:text-sm text-gray-700">{schedule.totalSeats}</td>
                <td className="px-3 py-2.5">
                  <span className={`inline-flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full text-xs sm:text-sm font-medium ${getAvailableSeatsColor(schedule.availableSeats, schedule.totalSeats)}`}>
                    {schedule.availableSeats}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="px-3 sm:px-4 py-3 border-t border-gray-200 text-xs sm:text-sm text-gray-600">
        Showing {schedules.length} of {totalCount} schedules
      </div>
    </div>
  )
}
