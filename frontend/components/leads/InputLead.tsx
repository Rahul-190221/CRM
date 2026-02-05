'use client'

import { useState, useEffect } from 'react'
import { Plus, Upload, Trash2, AlertCircle, CheckCircle2, Calendar, ChevronDown } from 'lucide-react'
import { createLead, getBDMs, importLeadsFromCSV } from '@/lib/api/leads'
import type { LeadSource, ServiceInterest, BDM } from '@/types/admin'

interface FollowUpEntry {
  id: number
  date: string
  note: string
  nextFollowUpDate: string
}

const leadSources: LeadSource[] = ['Website', 'Referral', 'Social Media', 'Email Campaign', 'Walk-in', 'Phone', 'Other']
const serviceInterests: ServiceInterest[] = ['IELTS', 'PTE', 'GRE', 'TOEFL', 'Study Abroad', 'Visa Processing']

interface InputLeadProps {
  onSuccess?: () => void
  onCancel?: () => void
}

export default function InputLead({ onSuccess, onCancel }: InputLeadProps) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    source: '' as LeadSource | '',
    serviceInterest: '' as ServiceInterest | '',
    assignedTo: '',
    notes: ''
  })

  const [followUps, setFollowUps] = useState<FollowUpEntry[]>([
    { id: 1, date: '', note: '', nextFollowUpDate: '' }
  ])

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [bdms, setBdms] = useState<BDM[]>([])
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    const fetchBDMs = async () => {
      try {
        const data = await getBDMs()
        setBdms(data)
      } catch (err) {
        console.error('Failed to fetch BDMs:', err)
      }
    }
    fetchBDMs()
  }, [])

  const handleAddFollowUp = () => {
    setFollowUps([
      ...followUps,
      { id: Date.now(), date: '', note: '', nextFollowUpDate: '' }
    ])
  }

  const handleRemoveFollowUp = (id: number) => {
    if (followUps.length > 1) {
      setFollowUps(followUps.filter(f => f.id !== id))
    }
  }

  const handleFollowUpChange = (id: number, field: keyof FollowUpEntry, value: string) => {
    setFollowUps(followUps.map(f =>
      f.id === id ? { ...f, [field]: value } : f
    ))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    setSuccess(null)

    try {
      const leadData = {
        ...formData,
        source: (formData.source || 'Website') as LeadSource,
        serviceInterest: formData.serviceInterest as ServiceInterest,
        followUps: followUps
          .filter(f => f.date || f.note || f.nextFollowUpDate)
          .map(f => ({
            date: f.date,
            note: f.note,
            nextFollowUpDate: f.nextFollowUpDate
          })),
        lifecycleStage: 'Intake' as const
      }

      await createLead(leadData)
      setSuccess('Lead created successfully!')
      setTimeout(() => {
        onSuccess?.()
      }, 1000)
    } catch (err: any) {
      setError(err.message || 'Failed to create lead')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleImportCSV = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.csv'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        setIsImporting(true)
        setError(null)
        setSuccess(null)

        try {
          const result = await importLeadsFromCSV(file)
          setSuccess(`Successfully imported ${result.imported} leads${result.failed > 0 ? `. ${result.failed} failed.` : '.'}`)
          if (result.imported > 0) {
            setTimeout(() => {
              onSuccess?.()
            }, 2000)
          }
        } catch (err: any) {
          setError(err.message || 'Failed to import CSV')
        } finally {
          setIsImporting(false)
        }
      }
    }
    input.click()
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Input Lead</h1>
          <p className="text-sm text-gray-500 mt-1">Add a new lead to the system manually or import from Excel</p>
        </div>
        <button
          onClick={handleImportCSV}
          disabled={isImporting}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors bg-white disabled:opacity-50"
        >
          <Upload className="w-4 h-4" />
          <span>{isImporting ? 'Importing...' : 'Import from CSV'}</span>
        </button>
      </div>

      {/* Manual Input Section */}
      <div className="bg-[#FCFCFC] rounded-lg border border-gray-100 p-8 mb-6">
        <div className="mb-8">
          <h2 className="text-lg font-bold text-gray-900">Manual Input</h2>
          <p className="text-sm text-gray-400 mt-1">Fill in the form below to add a lead manually</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-tight">Full Name <span className="text-red-500">*</span></label>
              <input
                type="text"
                placeholder="Enter lead name"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full px-4 py-3 bg-[#F8F9FA] border border-gray-100 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gray-200 placeholder-gray-300 transition-all font-medium"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-tight">Email <span className="text-red-500">*</span></label>
              <input
                type="email"
                placeholder="Enter email address"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 bg-[#F8F9FA] border border-gray-100 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gray-200 placeholder-gray-300 transition-all font-medium"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-tight">Phone Number <span className="text-red-500">*</span></label>
              <input
                type="tel"
                placeholder="Enter phone number"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-3 bg-[#F8F9FA] border border-gray-100 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gray-200 placeholder-gray-300 transition-all font-medium"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-tight">Lead Source</label>
              <div className="relative">
                <select
                  value={formData.source}
                  onChange={(e) => setFormData({ ...formData, source: e.target.value as LeadSource })}
                  className="w-full px-4 py-3 bg-[#F8F9FA] border border-gray-100 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gray-200 transition-all appearance-none text-gray-500 font-medium"
                >
                  <option value="">Select source</option>
                  {leadSources.map(source => (
                    <option key={source} value={source}>{source}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-tight">Service Interest</label>
              <div className="relative">
                <select
                  value={formData.serviceInterest}
                  onChange={(e) => setFormData({ ...formData, serviceInterest: e.target.value as ServiceInterest })}
                  className="w-full px-4 py-3 bg-[#F8F9FA] border border-gray-100 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gray-200 transition-all appearance-none text-gray-500 font-medium"
                >
                  <option value="">Select service</option>
                  {serviceInterests.map(service => (
                    <option key={service} value={service}>{service}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-tight">Assign to BDM</label>
              <div className="relative">
                <select
                  value={formData.assignedTo}
                  onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                  className="w-full px-4 py-3 bg-[#F8F9FA] border border-gray-100 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gray-200 transition-all appearance-none text-gray-500 font-medium"
                >
                  <option value="">Select BDM</option>
                  {bdms.map(bdm => (
                    <option key={bdm._id} value={bdm._id}>{bdm.name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-tight">Notes</label>
            <textarea
              placeholder="Add any additional notes about this lead"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={4}
              className="w-full px-4 py-3 bg-[#F8F9FA] border border-gray-100 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gray-200 placeholder-gray-300 transition-all font-medium resize-none"
            />
          </div>

          {/* Follow-Up Details */}
          <div className="pt-8 border-t border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Follow-Up Details</h3>

            {followUps.map((followUp, index) => (
              <div key={followUp.id} className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <span className="px-4 py-1.5 border border-gray-200 rounded-md text-xs font-bold text-gray-600 bg-white">
                    Follow Up {index + 1}
                  </span>
                  {followUps.length > 1 && (
                    <button type="button" onClick={() => handleRemoveFollowUp(followUp.id)} className="p-1 text-gray-400 hover:text-red-500 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-1.5 relative">
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-tight">Date</label>
                    <input
                      type="date"
                      value={followUp.date}
                      onChange={(e) => handleFollowUpChange(followUp.id, 'date', e.target.value)}
                      className="w-full px-4 py-3 bg-[#F8F9FA] border border-gray-100 rounded-md text-sm focus:outline-none font-medium appearance-none"
                    />
                    <Calendar className="absolute right-4 bottom-3.5 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-tight">Note</label>
                    <input
                      type="text"
                      placeholder="Add follow-up note"
                      value={followUp.note}
                      onChange={(e) => handleFollowUpChange(followUp.id, 'note', e.target.value)}
                      className="w-full px-4 py-3 bg-[#F8F9FA] border border-gray-100 rounded-md text-sm focus:outline-none placeholder-gray-300 font-medium"
                    />
                  </div>
                  <div className="space-y-1.5 relative">
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-tight">Next F.Up Date</label>
                    <input
                      type="date"
                      value={followUp.nextFollowUpDate}
                      onChange={(e) => handleFollowUpChange(followUp.id, 'nextFollowUpDate', e.target.value)}
                      className="w-full px-4 py-3 bg-[#F8F9FA] border border-gray-100 rounded-md text-sm focus:outline-none font-medium appearance-none"
                    />
                    <Calendar className="absolute right-4 bottom-3.5 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={handleAddFollowUp}
              className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-xs font-bold text-gray-700 hover:bg-gray-50 transition-all bg-white"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add More</span>
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-8">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3 bg-[#111827] rounded-md text-sm font-bold text-white hover:bg-black transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save Lead'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="px-8 py-3 border border-gray-200 rounded-md text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

      {/* Status Messages */}
      {(error || success) && (
        <div className="fixed bottom-8 right-8 max-w-sm animate-in fade-in slide-in-from-bottom-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg shadow-lg flex items-center gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg shadow-lg flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm font-medium">{success}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
