'use client'

import { useState, useEffect } from 'react'
import { UserPlus, Upload } from 'lucide-react'

interface BDMUser {
  _id: string
  firstName: string
  lastName: string
  name: string
  email: string
  phone?: string
  role: string
  employeeId?: string
  reportingTo?: string
  joinDate?: string
  avatarUrl?: string
}

interface FormData {
  firstName: string
  lastName: string
  email: string
  phone: string
  role: string
  employeeId: string
  reportingTo: string
  joinDate: string
  password: string
  profileImage: File | null
}

const initialFormData: FormData = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  role: '',
  employeeId: '',
  reportingTo: '',
  joinDate: '',
  password: '',
  profileImage: null
}

// Avatar color generator based on name
const getAvatarColor = (name: string): string => {
  const colors = [
    'bg-[#FACE39]',
    'bg-blue-500',
    'bg-purple-500',
    'bg-green-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-red-500',
    'bg-orange-500'
  ]
  const index = name.charCodeAt(0) % colors.length
  return colors[index]
}

const getInitials = (firstName: string, lastName: string): string => {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
}

export default function BDMAdd() {
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [recentBDMs, setRecentBDMs] = useState<BDMUser[]>([])
  const [managers, setManagers] = useState<BDMUser[]>([])
  const [previewImage, setPreviewImage] = useState<string | null>(null)

  useEffect(() => {
    fetchRecentBDMs()
    fetchManagers()
  }, [])

  const fetchRecentBDMs = async () => {
    try {
      const token = localStorage.getItem('accessToken')
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:5000' : '')
      const response = await fetch(`${apiUrl}/api/auth/users?role=bdm,senior-bdm,junior-bdm&limit=6`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      if (response.ok) {
        const data = await response.json()
        setRecentBDMs(data.slice(0, 3))
      }
    } catch (error) {
      console.error('Error fetching recent BDMs:', error)
      setRecentBDMs([])
    }
  }

  const fetchManagers = async () => {
    try {
      const token = localStorage.getItem('accessToken')
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:5000' : '')
      const response = await fetch(`${apiUrl}/api/auth/users?role=admin,senior-bdm`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      if (response.ok) {
        const data = await response.json()
        setManagers(data)
      }
    } catch (error) {
      console.error('Error fetching managers:', error)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData(prev => ({ ...prev, profileImage: file }))
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const token = localStorage.getItem('accessToken')
      const payload = {
        name: `${formData.firstName} ${formData.lastName}`,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        role: formData.role,
        employeeId: formData.employeeId,
        reportingTo: formData.reportingTo || undefined,
        joinDate: formData.joinDate || undefined,
        password: formData.password
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:5000' : '')
      const response = await fetch(`${apiUrl}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      if (response.ok) {
        alert('BDM added successfully!')
        handleReset()
        fetchRecentBDMs()
      } else {
        const error = await response.json()
        alert(error.message || 'Failed to add BDM')
      }
    } catch (error) {
      console.error('Error adding BDM:', error)
      alert('Failed to add BDM. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReset = () => {
    setFormData(initialFormData)
    setPreviewImage(null)
  }

  const getRoleLabel = (role: string): string => {
    const roleMap: Record<string, string> = {
      'bdm': 'BDM',
      'senior-bdm': 'Senior BDM',
      'junior-bdm': 'Junior BDM',
      'admin': 'Admin'
    }
    return roleMap[role] || role
  }

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Add New BDM</h1>
        <p className="text-sm text-gray-500 mt-1">Add a new Business Development Manager to the system</p>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-xl p-6 mb-6">
        <form onSubmit={handleSubmit}>
          <div className="flex gap-8">
            {/* Profile Image Upload */}
            <div className="flex-shrink-0">
              <label className="block text-sm font-medium text-gray-700 mb-2">Profile Image</label>
              <div className="w-48 h-40 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-[#FACE39] transition-colors relative">
                <input
                  type="file"
                  title="Upload profile image"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                {previewImage ? (
                  <img src={previewImage} alt="Preview" className="w-full h-full object-cover rounded-lg" />
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-500">Upload profile picture</span>
                    <button type="button" className="mt-2 px-4 py-1.5 border border-gray-300 rounded-md text-sm text-gray-600 hover:bg-gray-50">
                      Choose File
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Form Fields */}
            <div className="flex-1 grid grid-cols-2 gap-x-6 gap-y-4">
              {/* First Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  placeholder="Enter first name"
                  required
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#FACE39]/40 focus:border-transparent"
                />
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  placeholder="Enter last name"
                  required
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#FACE39]/40 focus:border-transparent"
                />
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="email@luminedge.com"
                  required
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#FACE39]/40 focus:border-transparent"
                />
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+1 (555) 000-0000"
                  required
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#FACE39]/40 focus:border-transparent"
                />
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role <span className="text-red-500">*</span>
                </label>
                <select
                  title="Select role"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#FACE39]/40 focus:border-transparent bg-white"
                >
                  <option value="">Select role</option>
                  <option value="junior-bdm">Junior BDM</option>
                  <option value="bdm">BDM</option>
                  <option value="senior-bdm">Senior BDM</option>
                </select>
              </div>

              {/* Employee ID */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Employee ID</label>
                <input
                  type="text"
                  name="employeeId"
                  value={formData.employeeId}
                  onChange={handleInputChange}
                  placeholder="EMP-001"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#FACE39]/40 focus:border-transparent"
                />
              </div>

              {/* Reporting To */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reporting To</label>
                <select
                  title="Select reporting manager"
                  name="reportingTo"
                  value={formData.reportingTo}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#FACE39]/40 focus:border-transparent bg-white"
                >
                  <option value="">Select manager</option>
                  {managers.map(manager => (
                    <option key={manager._id} value={manager._id}>
                      {manager.name || `${manager.firstName} ${manager.lastName}`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Join Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Join Date</label>
                <input
                  type="date"
                  title="Join date"
                  name="joinDate"
                  value={formData.joinDate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#FACE39]/40 focus:border-transparent"
                />
              </div>

              {/* Temporary Password */}
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Temporary Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Set a temporary password (min. 8 characters)"
                  required
                  minLength={8}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#FACE39]/40 focus:border-transparent"
                />
                <p className="text-xs text-gray-400 mt-1">The BDM will be prompted to change this on first login.</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <UserPlus className="w-4 h-4" />
              {isSubmitting ? 'Adding...' : 'Add BDM'}
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-2 px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50"
            >
              Reset Form
            </button>
          </div>
        </form>
      </div>

      {/* Recently Added BDMs */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recently Added BDMs</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {recentBDMs.map((bdm) => (
            <div key={bdm._id} className="bg-white rounded-xl p-4 border border-gray-100 flex items-center gap-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold ${getAvatarColor(bdm.firstName || bdm.name)}`}>
                {getInitials(bdm.firstName || bdm.name.split(' ')[0], bdm.lastName || bdm.name.split(' ')[1] || '')}
              </div>
              <div>
                <p className="font-medium text-gray-900">{bdm.name || `${bdm.firstName} ${bdm.lastName}`}</p>
                <p className="text-sm text-gray-500">{getRoleLabel(bdm.role)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
